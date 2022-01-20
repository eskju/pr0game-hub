<?php

namespace App\Http\Controllers;

use App\Models\Alliance;
use App\Models\LogPlayer;
use App\Models\Planet;
use App\Models\Player;
use App\Models\SpyReport;
use App\Services\ResourceService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlayerController extends Controller
{
    public function login()
    {
        return response([]);
    }

    public function stats(Request $request)
    {
        foreach ($request->get('ids') as $id) {
            if (!Player::query()->find($id)) {
                $player = new Player();
                $player->id = $id;
                $player->updated_at = null;
                $player->save();
            }
        }

        // inactive
        Player::query()
            ->where(function ($q) {
                $q->where('is_inactive', '!=', 0);
                $q->orWhereNull('is_inactive');
            })
            ->whereIn('id', $request->get('ids'))
            ->whereNotIn('id', $request->get('inactive_ids'))
            ->update(['is_inactive' => 0, 'updated_at' => DB::raw('updated_at')]);

        Player::query()
            ->where(function ($q) {
                $q->where('is_inactive', '!=', 1);
                $q->orWhereNull('is_inactive');
            })
            ->whereIn('id', $request->get('ids'))
            ->whereIn('id', $request->get('inactive_ids'))
            ->update(['is_inactive' => 1, 'updated_at' => DB::raw('updated_at')]);

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
            'outdated_ids' => Player::query()->select('id')->whereIn('id', $request->get('ids'))->where('updated_at', '<', time() - 86400)->get()->pluck('id')
        ];
    }


    public function overview(Request $request): array
    {
        $query = Planet::query()
            ->select(
                DB::raw('planets.*'),
                DB::raw('(SELECT created_at FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) as `last_spy_report`'),
                DB::raw('(SELECT metal FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) AS `last_spy_metal`'),
                DB::raw('(SELECT crystal FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) AS `last_spy_crystal`'),
                DB::raw('(SELECT deuterium FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) AS `last_spy_deuterium`'),
            )
            ->join('players', 'players.id', '=', 'planets.player_id')
            ->where('galaxy', $request->get('galaxy'))
            ->with('player');

        switch ($request->get('order_by')) {
            case 'name':
                $query->orderBy('players.name');
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
                $query->orderBy(DB::raw('ABS(planets.system - ' . (int)$request->get('system') . ')'));
                break;
        }

        return [
            'players' => $query
                ->get()
                ->map(function (Planet $planet) {
                    $return = $planet->toArray();
                    $return['last_spy_report'] = $return['last_spy_report'] ? Carbon::parse($return['last_spy_report'])->subHour()->shortRelativeDiffForHumans() : '';
                    $return['last_spy_metal'] = number_format($return['last_spy_metal'], 0, ',', '.');
                    $return['last_spy_crystal'] = number_format($return['last_spy_crystal'], 0, ',', '.');
                    $return['last_spy_deuterium'] = number_format($return['last_spy_deuterium'], 0, ',', '.');
                    $return['player']['score'] = number_format($return['player']['score'], 0, ',', '.');
                    $return['player']['score_building'] = number_format($return['player']['score_building'], 0, ',', '.');
                    $return['player']['score_science'] = number_format($return['player']['score_science'], 0, ',', '.');
                    $return['player']['score_military'] = number_format($return['player']['score_military'], 0, ',', '.');
                    $return['player']['score_defense'] = number_format($return['player']['score_defense'], 0, ',', '.');

                    return $return;
                }),
            'outdated_ids' => Player::query()
                ->select('id')
                ->where('main_coordinates', 'LIKE', $request->get('galaxy') . ':%')
                ->where('updated_at', '<', Carbon::now()->subHours(8))
                ->get()
                ->pluck('id')
        ];
    }

    public function store(int $playerId, Request $request)
    {
        if ($request->has('alliance_id')) {
            if (!Alliance::query()->find($request->get('alliance_id'))) {
                $alliance = new Alliance();
                $alliance->id = $request->get('alliance_id');
                $alliance->name = $request->get('alliance_name') ?: '---';
                $alliance->tag = $request->get('alliance_tag') ?: '---';
                $alliance->save();
            }
        }

        if (!$player = Player::query()->find($playerId)) {
            $player = new Player();
            $player->id = $playerId;
        }

        $player->fill($request->toArray());
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
}
