<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Planet extends Model
{
    public $table = 'planets';

    protected $fillable = [
        'rocket_launchers',
        'light_laser_turrets',
        'heavy_laser_turrets',
        'gauss_canons',
        'ion_turrets',
        'plasma_turrets',
        'small_shields',
        'large_shields',
        'interceptor_missiles',
        'interplanetary_missiles',
        'metal_mine',
        'crystal_mine',
        'deuterium_mine',
        'solar_plant',
        'techno_dome',
        'fusion_plant',
        'robot_factory',
        'nano_factory',
        'hangar',
        'metal_storage',
        'crystal_storage',
        'deuterium_storage',
        'laboratory',
        'terra_former',
        'alliance_depot',
        'base',
        'phalanx',
        'portal',
        'missile_silo',
        'small_transporters',
        'large_transporters',
        'light_hunters',
        'heavy_hunters',
        'cruisers',
        'battleships',
        'colony_ships',
        'recyclers',
        'spy_drones',
        'bombers',
        'solar_satellites',
        'destroyers',
        'death_stars',
        'battle_cruisers',
    ];

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class, 'player_id', 'id');
    }

    public function spy(): HasMany
    {
        return $this->hasMany(SpyReport::class, 'coordinates', 'coordinates')->orderBy('created_at', 'DESC');
    }

    public function lastSpyReport(): HasOne
    {
        return $this->hasOne(SpyReport::class, 'coordinates', 'coordinates')->orderBy('created_at', 'DESC');
    }
}
