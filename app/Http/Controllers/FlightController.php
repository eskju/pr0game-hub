<?php

namespace App\Http\Controllers;

use App\Models\Flight;
use App\Services\PlanetService;
use App\Services\PlayerService;
use Illuminate\Http\Request;

class FlightController extends Controller
{
    public function store(Request $request)
    {
        if(!$flight = Flight::query()->where('external_id', $request->get('id'))->where('is_return', $request->get('is_return'))->first()) {
            $flight = new Flight();
        }

        // create planets if not known
        PlanetService::getPlanetExternalId($request->get('planet_start_coordinates'));
        PlanetService::getPlanetExternalId($request->get('planet_target_coordinates'));

        $flight->external_id = $request->get('external_id');
        $flight->is_return = $request->get('is_return');
        $flight->outbound_flight_id = $request->get('outbound_flight_id');
        $flight->type = $request->get('type');
        $flight->planet_start_coordinates = $request->get('planet_start_coordinates');
        $flight->planet_target_coordinates = $request->get('planet_target_coordinates');
        $flight->save();

        return response([]);
    }
}
