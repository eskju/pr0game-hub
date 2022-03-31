<?php

namespace App\Http\Controllers;

use App\Models\Planet;
use App\Models\User;
use App\Services\PlanetService;
use App\Services\ResourceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlanetController extends Controller
{
    public function storePlanetId(Request $request)
    {
        $coordinates = explode(':', $request->get('coordinates'));

        if (!$planet = Planet::query()->where('coordinates', $request->get('coordinates'))->where('type', 'PLANET')->first()) {
            $planet = new Planet();
            $planet->player_id = $request->get('player_id');
            $planet->coordinates = $request->get('coordinates');
            $planet->galaxy = $coordinates[0];
            $planet->system = $coordinates[1];
            $planet->planet = $coordinates[2];
            $planet->type = 'PLANET';
        }

        $planet->player_id = $request->get('player_id');
        $planet->external_id = $request->get('planet_id');
        $planet->save();

        if ($request->get('moon_id') && (int)$request->get('moon_id') > 0) {
            if (!Planet::query()->where('coordinates', $request->get('coordinates'))->where('type', 'MOON')->first()) {
                $planet = new Planet();
                $planet->type = 'MOON';
                $planet->external_id = $request->get('moon_id');
                $planet->player_id = $request->get('player_id');
                $planet->coordinates = $request->get('coordinates');
                $planet->galaxy = $coordinates[0];
                $planet->system = $coordinates[1];
                $planet->planet = $coordinates[2];
                $planet->save();
            }
        }
    }

    public function storeBuildings(Request $request)
    {
        if (!$planet = Planet::query()->where('coordinates', $request->get('coordinates'))->first()) {
            $coordinates = explode(':', $request->get('coordinates'));
            $planet = new Planet();
            $planet->player_id = auth()->user()->player_id;
            $planet->coordinates = $request->get('coordinates');
            $planet->galaxy = $coordinates[0];
            $planet->system = $coordinates[1];
            $planet->planet = $coordinates[2];
        }

        foreach ($request->get('buildings') ?? [] as $building) {
            $planet->{ResourceService::getAliasById($building['building_id'])} = (int)$building['level'];
        }

        $planet->save();

        $items = [];
        for ($i = 1; $i < 100; $i++) {
            if ($alias = ResourceService::getAliasById($i)) {
                $result = User::query()
                    ->select([
                        DB::raw('GROUP_CONCAT(`users`.`name`) AS `player_names`'),
                        DB::raw('MAX(' . $alias . ') AS `max_level`')
                    ])
                    ->join('planets', 'planets.player_id', '=', 'users.player_id')
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

    public function storeFleet(Request $request)
    {
        if (!$planet = Planet::query()->where('coordinates', $request->get('coordinates'))->first()) {
            $coordinates = explode(':', $request->get('coordinates'));
            $planet = new Planet();
            $planet->player_id = auth()->user()->player_id;
            $planet->coordinates = $request->get('coordinates');
            $planet->galaxy = $coordinates[0];
            $planet->system = $coordinates[1];
            $planet->planet = $coordinates[2];
        }

        $items = [];
        $tmp = [];
        $sheepIds = [202, 203, 210, 209, 208, 212, 204, 205, 206, 207, 215, 213, 211, 214];
        foreach ($sheepIds as $i) {
            if ($alias = ResourceService::getAliasById($i)) {
                $tmp[$alias] = 0;
                $items[$alias] = [
                    'id' => $i,
                    'name' => ResourceService::getFullNameById($i),
                    'sum' => 0,
                    'score' => 0,
                    'recs' => 0
                ];
            }
        }

        foreach ($request->get('fleet') ?? [] as $ship) {
            if (is_numeric($ship['ship_id'])) {
                $tmp[ResourceService::getAliasById($ship['ship_id'])] += (int)$ship['amount'];
            } else {
                $tmp[ResourceService::getAliasByName($ship['ship_id'])] += (int)$ship['amount'];
            }
        }

        foreach ($tmp as $alias => $amount) {
            $planet->{$alias} = $amount;
        }

        $planet->save();
        PlanetService::updatePlanet($planet);

        $total = 0;
        $totalScore = 0;
        $totalRecs = 0;
        for ($i = 200; $i < 300; $i++) {
            if ($alias = ResourceService::getAliasById($i)) {
                $sum = Planet::query()
                    ->where('player_id', auth()->user()->player_id)
                    ->sum($alias);

                $score = ResourceService::getScoreById($i) * $sum / 1000;
                $recs = $i != 209 ? $score / 20 * 0.3 : 0;
                $items[$alias] = [
                    'id' => $i,
                    'name' => ResourceService::getFullNameById($i),
                    'sum' => $sum,
                    'score' => $score,
                    'recs' => ceil($recs)
                ];

                $total += $sum;
                $totalScore += $score;
                $totalRecs += $recs;
            }
        }

        $items['Gesamt'] = [
            'id' => 999,
            'name' => 'Gesamt',
            'sum' => $total,
            'score' => $totalScore,
            'recs' => ceil($totalRecs)
        ];

        return response($items);
    }
}
