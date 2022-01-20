<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Planet extends Model
{
    public $table = 'planets';

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class, 'player_id', 'id');
    }

    public function spyReports(): HasMany
    {
        return $this->hasMany(SpyReport::class, 'galaxy', 'galaxy')
            ->where('spy_reports.system', '=', 'planets.system')
            ->where('spy_reports.planet', '=', 'planets.planet')
            ->orderBy('created_at', 'DESC');
    }
}
