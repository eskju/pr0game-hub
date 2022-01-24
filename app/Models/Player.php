<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Player extends Model
{
    public $table = 'players';

    public $fillable = [
        'name',
        'alliance_id',
        'main_coordinates',
        'score',
        'score_building',
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
}
