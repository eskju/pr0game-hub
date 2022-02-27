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

        $planet->update(collect($spyReport->toArray())->filter(function ($value) {
            return $value !== null;
        })->toArray());

        $scoreDefense = 0;
        $scoreDefense += (int)$planet->rocket_launchers * 2;
        $scoreDefense += (int)$planet->light_laser_turrets * 2;
        $scoreDefense += (int)$planet->heavy_laser_turrets * 8;
        $scoreDefense += (int)$planet->ion_turrets * 8;
        $scoreDefense += (int)$planet->gauss_canons * 35;
        $scoreDefense += (int)$planet->plasma_turrets * 100;
        $scoreDefense += (int)$planet->small_shields * 20;
        $scoreDefense += (int)$planet->large_shields * 100;

        $scoreMilitary = 0;
        $scoreMilitary += (int)$planet->small_transporters * 4;
        $scoreMilitary += (int)$planet->large_transporters * 12;
        $scoreMilitary += (int)$planet->light_hunters * 4;
        $scoreMilitary += (int)$planet->heavy_hunters * 10;
        $scoreMilitary += (int)$planet->cruisers * 27;
        $scoreMilitary += (int)$planet->battleships * 60;
        $scoreMilitary += (int)$planet->colony_ships * 30;
        $scoreMilitary += (int)$planet->recyclers * 16;
        $scoreMilitary += (int)$planet->spy_drones * 1;
        $scoreMilitary += (int)$planet->bombers * 75;
        $scoreMilitary += (int)$planet->solar_satellites * 2;
        $scoreMilitary += (int)$planet->destroyers * 110;
        $scoreMilitary += (int)$planet->death_stars * 9000;
        $scoreMilitary += (int)$planet->battle_cruisers * 70;

        $planet->score_defense = $scoreDefense;
        $planet->score_military = $scoreMilitary;
        $planet->save();
    }
}
