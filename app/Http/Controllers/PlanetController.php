<?php

namespace App\Http\Controllers;

use App\Models\Planet;
use App\Models\User;
use App\Services\ResourceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlanetController extends Controller
{
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

    public function storeBuildings(Request $request) {
        if(!$planet = Planet::query()->where('coordinates', $request->get('coordinates'))->first()) {
            $coordinates = explode(':',$request->get('coordinates'));
            $planet = new Planet();
            $planet->player_id = auth()->user()->player_id;
            $planet->coordinates = $request->get('coordinates');
            $planet->galaxy = $coordinates[0];
            $planet->system = $coordinates[1];
            $planet->planet = $coordinates[2];
        }

        foreach($request->get('buildings') ?? [] as $building) {
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
}
