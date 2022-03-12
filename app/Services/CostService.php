<?php

namespace App\Services;

use App\Models\Pr0gameVar;

class CostService
{
    public static function getCostsForLevel(int $resourceId, int $level): object
    {
        $config = Pr0gameVar::query()->where('elementID', $resourceId)->first();
        $costs = (object)['metal' => 0, 'crystal' => 0, 'deuterium' => 0, 'score' => 0];
        $metal = $config->cost901;
        $crystal = $config->cost902;
        $deuterium = $config->cost903;
        $factor = $config->factor;

        for ($l = 0; $l < $level; $l++) {
            $costs->metal += floor($metal * pow($factor, $l));
            $costs->crystal += floor($crystal * pow($factor, $l));
            $costs->deuterium += floor($deuterium * pow($factor, $l));
            $costs->score = floor($costs->metal + $costs->crystal) / 1000;
        }

        return $costs;
    }

    public static function getScoreForLevel(int $resourceId, int $level): float
    {
        return self::getCostsForLevel($resourceId, $level)->score;
    }
}
