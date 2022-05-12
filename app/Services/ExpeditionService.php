<?php

namespace App\Services;

use App\Models\Expedition;

class ExpeditionService
{
    public static function parseMessage(Expedition $expedition)
    {
        switch ($expedition->type) {
            case 'RESOURCE':
                self::parseResource($expedition);
                break;

            case 'FLEET':
                self::parseFleet($expedition);
                break;

            case 'PIRATES':
            case 'ALIENS':
                self::parseFleet($expedition, true);
                break;

        }
    }

    private static function parseResource(Expedition $expedition)
    {
        preg_match('!Es wurden ([.0-9]+) (Metall|Kristall|Deuterium) abgebaut!', $expedition->message, $result);

        if ($result) {
            switch ($result[2]) {
                case 'Metall':
                    $expedition->metal = str_replace('.', '', $result[1]);
                    $expedition->save();
                    break;

                case 'Kristall':
                    $expedition->crystal = str_replace('.', '', $result[1]);
                    $expedition->save();
                    break;

                case 'Deuterium':
                    $expedition->deuterium = str_replace('.', '', $result[1]);
                    $expedition->save();
                    break;
            }
        }
    }

    private static function parseFleet(Expedition $expedition, $loss = false)
    {
        preg_match_all('!(Kleiner Transporter|Großer Transporter|Leichter Jäger|Schwerer Jäger|Kreuzer|Schlachtschiff|Kolonieschiff|Recycler|Spionagesonde|Zerstörer|Schlachtkreuzer|Todesstern)\: ([.0-9]+)!', $expedition->message, $result);

        $mapping = [
            'Kleiner Transporter' => 'small_transporters',
            'Großer Transporter' => 'large_transporters',
            'Leichter Jäger' => 'light_hunters',
            'Schwerer Jäger' => 'heavy_hunters',
            'Kreuzer' => 'cruisers',
            'Schlachtschiff' => 'battleships',
            'Kolonieschiff' => 'colony_ships',
            'Recycler' => 'recyclers',
            'Spionagesonde' => 'spy_drones',
            'Zerstörer' => 'destroyers',
            'Bomber' => 'bombers',
            'Todesstern' => 'death_stars',
            'Schlachtkreuzer' => 'battlecruisers'
        ];

        $ressMapping = [
            'Kleiner Transporter' => [2000, 2000, 0],
            'Großer Transporter' => [6000, 6000, 0],
            'Leichter Jäger' => [3000, 1000, 0],
            'Schwerer Jäger' => [6000, 4000, 0],
            'Kreuzer' => [20000, 7000, 2000],
            'Schlachtschiff' => [45000, 15000, 0],
            'Kolonieschiff' => [10000, 20000, 10000],
            'Recycler' => [10000, 6000, 2000],
            'Spionagesonde' => [0, 1000, 0],
            'Zerstörer' => [60000, 50000, 15000],
            'Bomber' => [50000, 25000, 15000],
            'Todesstern' => [5000000, 4000000, 1000000],
            'Schlachtkreuzer' => [30000, 40000, 15000]
        ];

        $expedition->metal = 0;
        $expedition->crystal = 0;
        $expedition->deuterium = 0;

        foreach ($result[0] as $key => $row) {
            $ship = $mapping[$result[1][$key]];
            $amount = $result[2][$key] * ($loss ? -1 : 1);

            $expedition->{$ship} = $amount;
            $expedition->metal += $ressMapping[$result[1][$key]][0] * $amount;
            $expedition->crystal += $ressMapping[$result[1][$key]][1] * $amount;
            $expedition->deuterium += $ressMapping[$result[1][$key]][2] * $amount;
        }

        $expedition->save();
    }
}
