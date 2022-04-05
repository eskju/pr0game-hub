<?php

namespace App\Models;

use App\Services\CostService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Player extends Model
{
    public $table = 'players';

    public $fillable = [
        'name',
        'alliance_id',
        'main_coordinates',
        'score',
        'score_science',
        'score_science',
        'score_military',
        'score_defense',
        'combats_total',
        'combats_won',
        'combats_draw',
        'combats_lost',
        'units_shot',
        'units_lost',
        'rubble_metal',
        'rubble_crystal',
    ];

    public function planets(): HasMany
    {
        return $this->hasMany(Planet::class, 'player_id', 'id');
    }

    public function alliance(): BelongsTo
    {
        return $this->belongsTo(Alliance::class, 'alliance_id', 'id');
    }

    public function save(array $options = [])
    {/*
        $this->score_science = 0;
        $this->score_science += CostService::getScoreForLevel(1, $this->metal_mine);
        $this->score_science += CostService::getScoreForLevel(2, $this->crystal_mine);
        $this->score_science += CostService::getScoreForLevel(3, $this->deuterium_mine);
        $this->score_science += CostService::getScoreForLevel(4, $this->solar_plant);
        $this->score_science += CostService::getScoreForLevel(6, $this->techno_dome);
        $this->score_science += CostService::getScoreForLevel(12, $this->fusion_plant);
        $this->score_science += CostService::getScoreForLevel(14, $this->robot_factory);
        $this->score_science += CostService::getScoreForLevel(15, $this->nano_factory);
        $this->score_science += CostService::getScoreForLevel(21, $this->hangar);
        $this->score_science += CostService::getScoreForLevel(22, $this->metal_storage);
        $this->score_science += CostService::getScoreForLevel(23, $this->crystal_storage);
        $this->score_science += CostService::getScoreForLevel(24, $this->deuterium_storage);
        $this->score_science += CostService::getScoreForLevel(31, $this->laboratory);
        $this->score_science += CostService::getScoreForLevel(33, $this->terra_former);
        $this->score_science += CostService::getScoreForLevel(34, $this->alliance_depot);
        $this->score_science += CostService::getScoreForLevel(41, $this->base);
        $this->score_science += CostService::getScoreForLevel(42, $this->phalanx);
        $this->score_science += CostService::getScoreForLevel(43, $this->portal);
        $this->score_science += CostService::getScoreForLevel(44, $this->missile_silo);
*/
        return parent::save($options);
    }
}
