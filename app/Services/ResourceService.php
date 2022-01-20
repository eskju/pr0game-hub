<?php

namespace App\Services;

class ResourceService
{
    public static function getAliasById($id)
    {
        $mapping = [
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

        return $mapping[$id];
    }
}
