<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogPlayer extends Model
{
    public $table = 'log_players';

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
}
