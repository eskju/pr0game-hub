<?php

namespace App\Services;

use App\Models\Planet;

class PlanetService
{
    public static function getPlanetExternalId($coordinates)
    {
        if (!$planet = Planet::query()->where('coordinates', $coordinates)->first()) {
            $split = explode(':', $coordinates);
            $planet = new Planet();
            $planet->coordinates = $coordinates;
            $planet->galaxy = $split[0];
            $planet->system = $split[1];
            $planet->planet = $split[2];
            $planet->save();
        }

        return $planet->external_id;
    }
}
