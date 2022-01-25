<?php

namespace App\Http\Controllers;

use App\Models\Planet;
use App\Services\ResourceService;
use Illuminate\Http\Request;

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
    }
}
