<?php

namespace App\Http\Controllers;

use App\Models\Alliance;
use App\Models\LogPlayer;
use App\Models\LogPlayerStatus;
use App\Models\Planet;
use App\Models\Player;
use App\Models\SpyReport;
use App\Services\ResourceService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PlayerController extends Controller
{
    protected $lastValue = [];
    protected $offsets = [];

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
            'players' => Player::query()->whereIn('id', $request->get('ids'))->get(),
            'missing_ids' => Player::query()->select('id')->whereIn('id', $request->get('ids'))->whereNull('name')->get()->pluck('id'),
            'outdated_ids' => Player::query()->select('id')->whereIn('id', $request->get('ids'))->where('updated_at', '<', time() - 3600 * 8)->get()->pluck('id')
        ];
    }


    public function overview(Request $request): array
    {
        $query = Planet::query()
            ->select(
                DB::raw('planets.*'),
                DB::raw('alliances.name AS alliance_name'),
                DB::raw('(SELECT created_at FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) as `last_spy_report`'),
                DB::raw('(SELECT metal FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) AS `last_spy_metal`'),
                DB::raw('(SELECT crystal FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) AS `last_spy_crystal`'),
                DB::raw('(SELECT deuterium FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) AS `last_spy_deuterium`'),
                DB::raw('(SELECT TIMESTAMPDIFF(HOUR, MAX(log_player_status.created_at), NOW()) FROM log_player_status WHERE log_player_status.player_id = planets.player_id AND is_inactive = 1) AS `inactive_since`'),
                DB::raw('ABS(planets.system - ' . (int)$request->get('system') . ') * 100 + ABS(planets.planet - ' . (int)$request->get('planet') . ') AS `distance`')
            )
            ->join('players', 'players.id', '=', 'planets.player_id')
            ->join('alliances','alliances.id', '=', 'players.alliance_id', 'left outer')
            ->where('galaxy', $request->get('galaxy'))
            ->with('player');

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

        return [
            'players' => $query
                ->get()
                ->map(function (Planet $planet) {
                    $return = $planet->toArray();
                    $return['last_spy_report_hours'] = $return['last_spy_report'] ? abs(Carbon::parse($return['last_spy_report'])->subMinute()->subHour()->diffInHours(Carbon::now())) : '';
                    $return['last_spy_report'] = $return['last_spy_report'] ? Carbon::parse($return['last_spy_report'])->subMinute()->subHour()->shortRelativeDiffForHumans() : '';
                    $return['last_battle_report'] = '';
                    $return['last_battle_report'] = 0;
                    $return['last_spy_metal'] = $return['last_spy_metal'] ? number_format($return['last_spy_metal'], 0, ',', '.') : '';
                    $return['last_spy_crystal'] = $return['last_spy_crystal'] ? number_format($return['last_spy_crystal'], 0, ',', '.') : '';
                    $return['last_spy_deuterium'] = $return['last_spy_deuterium'] ? number_format($return['last_spy_deuterium'], 0, ',', '.') : '';
                    $return['player']['score'] = number_format($return['player']['score'], 0, ',', '.');
                    $return['player']['score_building'] = number_format($return['player']['score_building'], 0, ',', '.');
                    $return['player']['score_science'] = number_format($return['player']['score_science'], 0, ',', '.');
                    $return['player']['score_military'] = number_format($return['player']['score_military'], 0, ',', '.');
                    $return['player']['score_defense'] = number_format($return['player']['score_defense'], 0, ',', '.');

                    return $return;
                }),
            'outdated_ids' => Player::query()
                ->select('id')
                ->where('updated_at', '<', Carbon::now()->subHours(8))
                ->where('is_deleted', 0)
                ->get()
                ->pluck('id'),
            'version' => '0.3.0',
            'player' => Planet::query()
                ->where('galaxy', $request->get('galaxy'))
                ->where('system', $request->get('system'))
                ->where('planet', $request->get('planet'))
                ->first()
                ->player
        ];
    }

    public function getSpyReportHistory(int $galaxy, int $system, int $planet): array
    {
        $spyReports = SpyReport::query()
            ->where('galaxy', $galaxy)
            ->where('system', $system)
            ->where('planet', $planet)
            ->orderBy('created_at')
            ->get();

        if (!$spyReports) {
            return [];
        }

        /** @var Planet|null $planet */
        $planet = Planet::query()
            ->where('galaxy', $galaxy)
            ->where('system', $system)
            ->where('planet', $planet)
            ->first();

        if (!$planet) {
            return [];
        }

        if (!$planet->player) {
            return [];
        }

        return [
            'resources' => $this->getDiffList($spyReports, 901, 999),
            'buildings' => $this->getDiffList($spyReports, 1, 99),
            'science' => $this->getDiffList($spyReports, 100, 199),
            'fleet' => $this->getDiffList($spyReports, 200, 299),
            'defense' => $this->getDiffList($spyReports, 400, 599),
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
            }
            else {
                $alliance->name = $request->get('alliance_name') ?: '---';
                $alliance->save();
            }
        }

        if (!$player = Player::query()->find($playerId)) {
            $player = new Player();
            $player->id = $playerId;
        }

        if($request->get('main_coordinates') == '::') {
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

    private function storeLog(int $playerId, Request $request)
    {
        $player = new LogPlayer();
        $player->external_id = $playerId;
        $player->reported_by = auth()->id();
        $player->fill($request->toArray());
        $player->save();
    }

    public function storePlanetId(Request $request)
    {
        if (!$planet = Planet::query()->where('coordinates', $request->get('coordinates'))->first()) {
            $planet = new Planet();
            $planet->player_id = $request->get('player_id');
            $planet->coordinates = $request->get('coordinates');
            $coordinates = explode(':', $request->get('coordinates'));
            $planet->galaxy = $coordinates[0];
            $planet->system = $coordinates[1];
            $planet->planet = $coordinates[2];
        }

        $planet->external_id = $request->get('planet_id');
        $planet->save();
    }

    public function storeSpyReport(Request $request)
    {
        if (!$spyReport = SpyReport::query()->find($request->get('id'))) {
            $spyReport = new SpyReport();
            $spyReport->id = $request->get('id');
        }

        $spyReport->reported_by = auth()->id();
        $spyReport->coordinates = $request->get('galaxy') . ':' . $request->get('system') . ':' . $request->get('planet');
        $spyReport->galaxy = $request->get('galaxy');
        $spyReport->system = $request->get('system');
        $spyReport->planet = $request->get('planet');

        foreach ($request->get('resources') as $id => $value) {
            $resourceAlias = ResourceService::getAliasById($id);
            $spyReport->{$resourceAlias} = $value;
        }

        $spyReport->created_at = Carbon::parse($request->get('timestamp'));
        $spyReport->save();

        return response(['TEST']);
    }

    private function getDiffList(Collection $spyReports, int $offsetStart, int $offsetEnd): array
    {
        $this->offsets = [];

        return [
            'data' => array_reverse($spyReports->map(function (SpyReport $spyReport) use ($offsetStart, $offsetEnd) {
                $mapping = ResourceService::getMapping();
                $values = [];

                for ($i = $offsetStart; $i < $offsetEnd; $i++) {
                    if (key_exists((string)$i, $mapping) && $alias = $mapping[(string)$i]) {
                        $this->offsets[] = $alias;
                        $values[] = [
                            'name' => ResourceService::getNameById($i),
                            'alias' => $alias,
                            'value' => $spyReport->{$alias},
                            'valueBefore' => $this->lastValue[$alias] ?? null,
                            'difference' => $spyReport->{$alias} - ($this->lastValue[$alias] ?? 0)
                        ];

                        if ($spyReport->{$alias} !== null) {
                            $this->lastValue[$alias] = $spyReport->{$alias};
                        }
                    }
                }

                return [
                    'timestamp' => $spyReport->created_at->format('d.m.Y H:i:s') . ' Uhr: ' . $spyReport->created_at->diffForHumans(),
                    'values' => $values,
                    'success' => ($values[0]['value'] ?? null) !== null,
                ];
            })->filter(function (array $item, $key) {
                $sum = 0;
                foreach ($item['values'] as $value) {
                    $sum += abs($value['difference']);
                }

                return ($item['success'] && $sum > 0) || $key === 0;
            })->toArray()),
            'offsets' => array_unique($this->offsets),
        ];
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
}
