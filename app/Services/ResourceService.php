<?php

namespace App\Services;

class ResourceService
{
    public static function getAliasById($id): ?string
    {
        $mapping = self::getMapping();

        return $mapping[$id] ?? null;
    }

    public static function getAliasByName($name): ?int
    {
        $mapping = [
            'Kleiner Transporter' => 202,
            'Großer Transporter' => 203,
            'Leichter Jäger' => 204,
            'Schwerer Jäger' => 205,
            'Kreuzer' => 206,
            'Schlachtschiff' => 207,
            'Kolonieschiff' => 208,
            'Recycler' => 209,
            'Spionagesonde' => 210,
            'Bomber' => 211,
            'Solarsatellit' => 212,
            'Zerstörer' => 213,
            'Todesstern' => 214,
            'Schlachtkreuzer' => 215
        ];

        return self::getAliasById($mapping[$name]);
    }

    public static function getNameById($id): ?string
    {
        $mapping = self::getMappingAbbreviations();

        return $mapping[$id] ?? null;
    }

    public static function getReverseMapping(): array
    {
        return array_flip(self::getMapping());
    }

    public static function getMapping(): array
    {
        return [
            '1' => 'metal_mine',
            '2' => 'crystal_mine',
            '3' => 'deuterium_mine',
            '4' => 'solar_plant',
            '6' => 'techno_dome',
            '12' => 'fusion_plant',
            '14' => 'robot_factory',
            '15' => 'nano_factory',
            '21' => 'hangar',
            '22' => 'metal_storage',
            '23' => 'crystal_storage',
            '24' => 'deuterium_storage',
            '31' => 'laboratory',
            '33' => 'terra_former',
            '34' => 'alliance_depot',
            '41' => 'base',
            '42' => 'phalanx',
            '43' => 'portal',
            '44' => 'missile_silo',

            '106' => 'spy_tech',
            '108' => 'computer_tech',
            '109' => 'military_tech',
            '110' => 'defense_tech',
            '111' => 'shield_tech',
            '113' => 'energy_tech',
            '114' => 'hyperspace_tech',
            '115' => 'combustion_tech',
            '117' => 'impulse_motor_tech',
            '118' => 'hyperspace_motor_tech',
            '120' => 'laser_tech',
            '121' => 'ion_tech',
            '122' => 'buster_tech',
            '123' => 'intergalactic_tech',
            '124' => 'expedition_tech',
            '131' => 'metal_proc_tech',
            '132' => 'crystal_proc_tech',
            '133' => 'deuterium_proc_tech',
            '199' => 'graviton_tech',

            '202' => 'small_transporters',
            '203' => 'large_transporters',
            '204' => 'light_hunters',
            '205' => 'heavy_hunters',
            '206' => 'cruisers',
            '207' => 'battleships',
            '208' => 'colony_ships',
            '209' => 'recyclers',
            '210' => 'spy_drones',
            '211' => 'bombers',
            '212' => 'solar_satellites',
            '213' => 'destroyers',
            '214' => 'death_stars',
            '215' => 'battle_cruisers',

            '401' => 'rocket_launchers',
            '402' => 'light_laser_turrets',
            '403' => 'heavy_laser_turrets',
            '404' => 'gauss_canons',
            '405' => 'ion_turrets',
            '406' => 'plasma_turrets',
            '407' => 'small_shields',
            '408' => 'large_shields',

            '502' => 'interceptor_missiles',
            '503' => 'interplanetary_missiles',

            '901' => 'metal',
            '902' => 'crystal',
            '903' => 'deuterium',
            '911' => 'energy'
        ];
    }

    public static function getMappingAbbreviations(): array
    {
        return [
            '1' => 'Metal',
            '2' => 'Crys',
            '3' => 'Deut',
            '4' => 'Solar',
            '6' => 'TD',
            '12' => 'Fusion',
            '14' => 'Robot',
            '15' => 'Nano',
            '21' => 'Hangar',
            '22' => 'MetS',
            '23' => 'CrysS',
            '24' => 'DeutS',
            '31' => 'Labor',
            '33' => 'T',
            '34' => 'D',
            '41' => 'B',
            '42' => 'P',
            '43' => 'Po',
            '44' => 'S',

            '106' => 'Spio',
            '108' => 'Compu',
            '109' => 'Att',
            '110' => 'Def',
            '111' => 'Shield',
            '113' => 'Energie',
            '114' => 'HyS',
            '115' => 'Verbr.',
            '117' => 'Impuls',
            '118' => 'HyS Tr.',
            '120' => 'Laser',
            '121' => 'Ionen',
            '122' => 'Plasma',
            '123' => 'Inter',
            '124' => 'Astro',
            '131' => 'Metal',
            '132' => 'Crystal',
            '133' => 'Deut',
            '199' => 'Graviton',

            '202' => 'KT',
            '203' => 'GT',
            '204' => 'LJ',
            '205' => 'SJ',
            '206' => 'Xer',
            '207' => 'SS',
            '208' => 'KS',
            '209' => 'Rec',
            '210' => 'Spio',
            '211' => 'B',
            '212' => 'Solar',
            '213' => 'ZS',
            '214' => 'DS',
            '215' => 'SK',

            '401' => 'RW',
            '402' => 'LL',
            '403' => 'SL',
            '404' => 'Gauss',
            '405' => 'Ionen',
            '406' => 'Plasma',
            '407' => 'Kl. Schild',
            '408' => 'Gr. Schild',

            '502' => 'Abfangr.',
            '503' => 'Interpl. R.',

            '901' => 'Metall',
            '902' => 'Kristall',
            '903' => 'Deuterium',
            '911' => 'Energie'
        ];
    }
}
