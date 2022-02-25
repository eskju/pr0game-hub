<?php

namespace App\Http\Controllers;

use App\Models\Alliance;
use App\Models\LogPlayer;
use App\Models\LogPlayerStatus;
use App\Models\Planet;
use App\Models\Player;
use App\Models\User;
use App\Services\ResourceService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlayerController extends Controller
{
    protected $lastValue = [];
    protected $offsets = [];
    private $dateFormatForHumans = false;

    public function login()
    {
        return response([]);
    }

    public function stats(Request $request): array
    {
        foreach ($request->get('ids') as $id) {
            if (!Player::query()->find($id)) {
                $player = new Player();
                $player->id = $id;
                $player->updated_at = null;
                $player->save();
            }
        }

        $this->updatePlayerStates($request->get('ids'), $request->get('inactive_ids'), 'is_inactive');
        $this->updatePlayerStates($request->get('ids'), $request->get('vacation_ids'), 'on_vacation');

        // vacation
        Player::query()
            ->where('is_deleted', 0)
            ->where(function ($q) {
                $q->where('on_vacation', '!=', 0);
                $q->orWhereNull('on_vacation');
            })
            ->whereIn('id', $request->get('ids'))
            ->whereNotIn('id', $request->get('vacation_ids'))
            ->update(['on_vacation' => 0, 'updated_at' => DB::raw('updated_at')]);

        Player::query()
            ->where(function ($q) {
                $q->where('on_vacation', '!=', 1);
                $q->orWhereNull('on_vacation');
            })
            ->whereIn('id', $request->get('ids'))
            ->whereIn('id', $request->get('vacation_ids'))
            ->update(['on_vacation' => 1, 'updated_at' => DB::raw('updated_at')]);

        return [
            'players' => Player::query()->where('is_deleted', 0)->whereIn('id', $request->get('ids'))->get(),
            'missing_ids' => Player::query()->select('id')->where('is_deleted', 0)->whereIn('id', $request->get('ids'))->whereNull('name')->get()->pluck('id'),
            'outdated_ids' => Player::query()->select('id')->where('is_deleted', 0)->whereIn('id', $request->get('ids'))->where('updated_at', '<', time() - 3600)->get()->pluck('id')
        ];
    }


    public function overview(Request $request): array
    {
        $user = auth()->user();
        $user->version = $request->get('version');
        $user->save();

        $this->dateFormatForHumans = $request->get('date_for_humans') ?? false;

        foreach ($request->get('ownPlanets') ?? [] as $coords) {
            if (!$planet = Planet::query()->where('coordinates', $coords)->first()) {
                $planet = new Planet();
                $planet->coordinates = $coords;
                $coords = explode(':', $coords);
                $planet->galaxy = $coords[0];
                $planet->system = $coords[1];
                $planet->planet = $coords[2];
            }

            $planet->player_id = auth()->user()->player_id;
            $planet->save();
        }

        $query = Planet::query()
            ->select(
                DB::raw('planets.*'),
                DB::raw('alliances.name AS alliance_name'),
                DB::raw('(SELECT created_at FROM battle_reports WHERE battle_reports.galaxy = planets.galaxy AND battle_reports.system = planets.system AND battle_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) as `last_battle_report`'),
                DB::raw('(SELECT created_at FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) as `last_spy_report`'),
                DB::raw('(SELECT metal FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) AS `last_spy_metal`'),
                DB::raw('(SELECT crystal FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) AS `last_spy_crystal`'),
                DB::raw('(SELECT deuterium FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) AS `last_spy_deuterium`'),
                DB::raw('(SELECT TIMESTAMPDIFF(HOUR, MAX(log_player_status.created_at), NOW()) FROM log_player_status WHERE log_player_status.player_id = planets.player_id AND is_inactive = 1) AS `inactive_since`'),
                DB::raw('ABS(planets.system - ' . (int)$request->get('system') . ') * 100 + ABS(planets.planet - ' . (int)$request->get('planet') . ') AS `distance`'),
                DB::raw('`players`.`score` - (SELECT `score` FROM `log_players` WHERE `log_players`.`external_id` = `players`.`id` AND `log_players`.`created_at` <= "' . Carbon::now()->subDay()->format('Y-m-d H:i:s') . '" ORDER BY `created_at` DESC LIMIT 1) AS `diff`'),
                DB::raw('`players`.`id` AS `player_id`'),
                DB::raw('`players`.`name`'),
                DB::raw('`players`.`score`'),
                DB::raw('`players`.`score_building`'),
                DB::raw('`players`.`score_science`'),
                DB::raw('`players`.`score_military`'),
                DB::raw('`planets`.`score_defense`'),
                DB::raw('`players`.`score_defense` AS `player_score_defense`'),
                DB::raw('`players`.`is_inactive`'),
                DB::raw('`players`.`on_vacation`'),
                DB::raw('`players`.`alliance_id`'),
            )
            ->join('players', 'players.id', '=', 'planets.player_id')
            ->join('alliances', 'alliances.id', '=', 'players.alliance_id', 'left outer')
            ->where('galaxy', $request->get('show_galaxy') ?? $request->get('galaxy'))
            ->where('is_deleted', 0);

        switch ($request->get('order_by')) {
            case 'name':
                $query->orderBy('players.name');
                break;

            case 'alliance':
                $query->orderBy('alliance_name');
                break;

            case 'score':
            case 'score_building':
            case 'score_science':
            case 'score_military':
            case 'score_defense':
                $query->orderBy('players.' . $request->get('order_by'), 'DESC');
                break;

            case 'last_spy_report':
            case 'last_spy_metal':
            case 'last_spy_crystal':
            case 'last_spy_deuterium':
                $query->orderBy($request->get('order_by'), 'DESC');
                break;

            case 'distance':
            default:
                $query->orderBy('distance');
                break;
        }

        $planet = Planet::query()
            ->where('galaxy', $request->get('galaxy'))
            ->where('system', $request->get('system'))
            ->where('planet', $request->get('planet'))
            ->first();

        return [
            'players' => $query
                ->get()
                ->map(function (Planet $planet) {
                    $return = $planet->toArray();
                    $return['last_spy_report_hours'] = $return['last_spy_report'] ? abs(Carbon::parse($return['last_spy_report'])->subMinute()->subHour()->diffInHours(Carbon::now())) : '';
                    $return['last_spy_report'] = $return['last_spy_report'] ? $this->getDateTime(Carbon::parse($return['last_spy_report'])->subMinute()->subHour()) : '';
                    $return['last_battle_report_hours'] = $return['last_battle_report'] ? abs(Carbon::parse($return['last_battle_report'])->subMinute()->subHour()->diffInHours(Carbon::now())) : '';
                    $return['last_battle_report'] = $return['last_battle_report'] ? $this->getDateTime(Carbon::parse($return['last_battle_report'])->subMinute()->subHour()) : '';
                    $return['last_spy_metal'] = $return['last_spy_metal'] ? number_format($return['last_spy_metal'], 0, ',', '.') : '';
                    $return['last_spy_crystal'] = $return['last_spy_crystal'] ? number_format($return['last_spy_crystal'], 0, ',', '.') : '';
                    $return['last_spy_deuterium'] = $return['last_spy_deuterium'] ? number_format($return['last_spy_deuterium'], 0, ',', '.') : '';
                    $return['player']['id'] = $return['player_id'];
                    $return['player']['alliance_id'] = $return['alliance_id'];
                    $return['player']['name'] = $return['name'];
                    $return['player']['is_inactive'] = $return['is_inactive'];
                    $return['player']['on_vacation'] = $return['on_vacation'];
                    $return['player']['score'] = number_format($return['score'], 0, ',', '.');
                    $return['player']['score_building'] = number_format($return['score_building'], 0, ',', '.');
                    $return['player']['score_science'] = number_format($return['score_science'], 0, ',', '.');
                    $return['player']['score_military'] = number_format($return['score_military'], 0, ',', '.');
                    $return['score_defense'] = number_format($return['score_defense'], 0, ',', '.');
                    $return['player']['score_defense'] = number_format($return['player_score_defense'], 0, ',', '.');

                    return $return;
                }),
            'outdated_ids' => Player::query()
                ->select('id')
                ->where('updated_at', '<', Carbon::now()->subHours(8))
                ->where('is_deleted', 0)
                ->orderBy('score', 'DESC')
                ->get()
                ->pluck('id'),
            'version' => '1.0.47',
            'player' => $planet ? $planet->player : []
        ];
    }

    public function store(int $playerId, Request $request)
    {
        if ($request->get('alliance_id')) {
            if (!$alliance = Alliance::query()->find($request->get('alliance_id'))) {
                $alliance = new Alliance();
                $alliance->id = $request->get('alliance_id');
                $alliance->name = $request->get('alliance_name') ?: '---';
                $alliance->tag = $request->get('alliance_tag') ?: '---';
                $alliance->save();
            } else {
                $alliance->name = $request->get('alliance_name') ?: '---';
                $alliance->save();
            }
        }

        if (!$player = Player::query()->find($playerId)) {
            $player = new Player();
            $player->id = $playerId;
        }

        if ($request->get('main_coordinates') == '::') {
            $player->is_deleted = 1;
            $player->save();
            return;
        }

        $player->fill($request->toArray());
        $player->alliance_id = isset($alliance) ? $alliance->id : null;
        $player->touch();
        $player->save();

        if (!Planet::query()->where('coordinates', $request->get('main_coordinates'))->first()) {
            $planet = new Planet();
            $planet->coordinates = $request->get('main_coordinates');
            $coords = explode(':', $planet->coordinates);
            $planet->galaxy = $coords[0];
            $planet->system = $coords[1];
            $planet->planet = $coords[2];
            $planet->player_id = $playerId;
            $planet->save();
        }

        $this->storeLog($playerId, $request);
    }

    public function delete(int $playerId, Request $request)
    {
        if ($player = Player::query()->find($playerId)) {
            $player->is_deleted = 1;
            $player->save();
        }
    }

    private function storeLog(int $playerId, Request $request)
    {
        $player = new LogPlayer();
        $player->external_id = $playerId;
        $player->reported_by = auth()->id();
        $player->fill($request->toArray());
        $player->save();
    }

    private function updatePlayerStates(array $ids, array $stateIds, $column)
    {
        $reactivated = Player::query()
            ->whereIn('id', $ids)
            ->whereNotIn('id', $stateIds)
            ->where(function ($q) use ($column) {
                $q->where($column, '!=', 0);
                $q->orWhereNull($column);
            })->get();

        foreach ($reactivated as $player) {
            $player->{$column} = 0;
            $player->save();

            $log = new LogPlayerStatus();
            $log->player_id = $player->id;
            $log->{$column} = 0;
            $log->save();
        }

        $inactive = Player::query()
            ->whereIn('id', $ids)
            ->whereIn('id', $stateIds)
            ->where(function ($q) use ($column) {
                $q->where($column, '=', 0);
                $q->orWhereNull($column);
            })->get();

        foreach ($inactive as $player) {
            $player->{$column} = 1;
            $player->save();

            $log = new LogPlayerStatus();
            $log->player_id = $player->id;
            $log->{$column} = 1;
            $log->save();
        }
    }

    public function getPlanets(Player $player): Collection
    {
        return $player
            ->planets()
            ->orderBy('galaxy')
            ->orderBy('system')
            ->orderBy('planet')
            ->get();
    }

    public function storeResearch(Request $request)
    {
        $user = auth()->user();
        $player = Player::query()->findOrFail($user->player_id);

        foreach ($request->get('research') ?? [] as $research) {
            $player->{ResourceService::getAliasById($research['research_id'])} = (int)$research['level'];
        }

        $player->save();

        $items = [];
        for ($i = 100; $i < 200; $i++) {
            if ($alias = ResourceService::getAliasById($i)) {
                $result = User::query()
                    ->select([
                        DB::raw('GROUP_CONCAT(`players`.`name`) AS `player_names`'),
                        DB::raw('MAX(' . $alias . ') AS `max_level`')
                    ])
                    ->join('players', 'players.id', '=', 'users.player_id')
                    ->groupBy($alias)
                    ->orderBy($alias, 'DESC')
                    ->first();

                $items[$i] = [
                    'id' => $i,
                    'alias' => $alias,
                    'max_level' => $result->max_level,
                    'player_names' => $result->player_names
                ];
            }
        }

        return response($items);
    }

    private function getDateTime(Carbon $dateTime): string
    {
        if ($this->dateFormatForHumans) {
            return $dateTime->shortAbsoluteDiffForHumans();
        }

        return $dateTime->format('d.m. H:i');
    }

    public function getOwnPlayerChart(Player $player)
    {
        return $this->getPlayerChart(Player::query()->find(auth()->user()->player_id));
    }

    public function getPlayerChart(Player $player, ?bool $showOwnScore = true)
    {
        $startDate = Carbon::now()->subDays(14);
        $daysDiff = Carbon::parse('2022-01-21')->diffInDays(Carbon::now()) + 1;
        $return = [];

        for ($i = 0; $i < $daysDiff; $i++) {
            $date = Carbon::parse('2022-01-21')->addDays($i)->toDateString();

            $min = LogPlayer::query()
                ->where('external_id', $player->id)
                ->whereRaw('created_at >= "' . Carbon::parse('2022-01-21')->addDays($i - 1)->toDateString() . ' 00:00:00"')
                ->whereRaw('created_at <= "' . Carbon::parse('2022-01-21')->addDays($i - 1)->toDateString() . ' 23:59:59"')
                ->orderBy('created_at', 'DESC')
                ->firstOrNew();

            $max = LogPlayer::query()
                ->where('external_id', $player->id)
                ->whereRaw('created_at >= "' . $date . ' 00:00:00"')
                ->whereRaw('created_at <= "' . $date . ' 23:59:59"')
                ->orderBy('created_at', 'DESC')
                ->firstOrNew();

            $ownScore = $showOwnScore ? LogPlayer::query()
                ->select('score')
                ->where('external_id', auth()->user()->player_id)
                ->whereRaw('created_at >= "' . $date . ' 00:00:00"')
                ->whereRaw('created_at <= "' . $date . ' 23:59:59"')
                ->orderBy('created_at', 'DESC')
                ->firstOrNew() : null;

            $diff = $min->score && $max->score ? $max->score - $min->score : null;
            $return[$date] = [
                'own_score' => $ownScore->score ?? null,
                'score_min' => $min->score ?? null,
                'score_max' => $max->score ?? null,
                'score_diff' => $diff,
                'score_relative' => $min->score && $max->score ? ($diff / $min->score) * 100 : null,
                'score_building' => $max->score_building,
                'score_science' => $max->score_science,
                'score_military' => $max->score_military,
                'score_defense' => $max->score_defense
            ];
        }

        return $return;
    }
}
