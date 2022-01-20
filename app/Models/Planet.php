<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Query\JoinClause;

class Planet extends Model
{
    public $table = 'planets';

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class, 'player_id', 'id');
    }

    public function spyReports(): HasMany
    {
        return $this->hasMany(SpyReport::class, function (JoinClause $q) {
            $q->where('spy_reports.galaxy', '=', 'planets.galaxy');
            $q->where('spy_reports.system', '=', 'planets.system');
            $q->where('spy_reports.planet', '=', 'planets.planet');
        })->orderBy('created_at', 'DESC');
    }
}
