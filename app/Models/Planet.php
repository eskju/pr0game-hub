<?php

namespace App\Models;

use App\Services\CostService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $metal_mine
 * @property int $crystal_mine
 * @property int $deuterium_mine
 * @property int $solar_plant
 * @property int $techno_dome
 * @property int $fusion_plant
 * @property int $robot_factory
 * @property int $nano_factory
 * @property int $hangar
 * @property int $metal_storage
 * @property int $crystal_storage
 * @property int $deuterium_storage
 * @property int $laboratory
 * @property int $terra_former
 * @property int $alliance_depot
 * @property int $base
 * @property int $phalanx
 * @property int $portal
 * @property int $missile_silo
 * @property int $score_building
 * @property int $score_military
 * @property int $score_defense
 */
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

    public function save(array $options = [])
    {
        $this->score_building = 0;
        $this->score_building += CostService::getScoreForLevel(1, $this->metal_mine);
        $this->score_building += CostService::getScoreForLevel(2, $this->crystal_mine);
        $this->score_building += CostService::getScoreForLevel(3, $this->deuterium_mine);
        $this->score_building += CostService::getScoreForLevel(4, $this->solar_plant);
        $this->score_building += CostService::getScoreForLevel(6, $this->techno_dome);
        $this->score_building += CostService::getScoreForLevel(12, $this->fusion_plant);
        $this->score_building += CostService::getScoreForLevel(14, $this->robot_factory);
        $this->score_building += CostService::getScoreForLevel(15, $this->nano_factory);
        $this->score_building += CostService::getScoreForLevel(21, $this->hangar);
        $this->score_building += CostService::getScoreForLevel(22, $this->metal_storage);
        $this->score_building += CostService::getScoreForLevel(23, $this->crystal_storage);
        $this->score_building += CostService::getScoreForLevel(24, $this->deuterium_storage);
        $this->score_building += CostService::getScoreForLevel(31, $this->laboratory);
        $this->score_building += CostService::getScoreForLevel(33, $this->terra_former);
        $this->score_building += CostService::getScoreForLevel(34, $this->alliance_depot);
        $this->score_building += CostService::getScoreForLevel(41, $this->base);
        $this->score_building += CostService::getScoreForLevel(42, $this->phalanx);
        $this->score_building += CostService::getScoreForLevel(43, $this->portal);
        $this->score_building += CostService::getScoreForLevel(44, $this->missile_silo);

        return parent::save($options);
    }
}
