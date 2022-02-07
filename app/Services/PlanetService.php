<?php

namespace App\Services;

use App\Models\Planet;
use App\Models\SpyReport;

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

    public static function updatePlanetBySpyReport(SpyReport $spyReport)
    {
        if (!$planet = $spyReport->getPlanet()) {
            return;
        }

        if ($spyReport->rocket_launchers !== null) {
            $scoreDefense = 0;
            $scoreDefense += (int)$spyReport->rocket_launchers * 2;
            $scoreDefense += (int)$spyReport->light_laser_turrets * 2;
            $scoreDefense += (int)$spyReport->heavy_laser_turrets * 8;
            $scoreDefense += (int)$spyReport->ion_turrets * 8;
            $scoreDefense += (int)$spyReport->gauss_canons * 35;
            $scoreDefense += (int)$spyReport->plasma_turrets * 100;
            $scoreDefense += (int)$spyReport->small_shields * 20;
            $scoreDefense += (int)$spyReport->large_shields * 100;

            $planet->score_defense = $scoreDefense;
            $planet->save();
        }
    }
}
