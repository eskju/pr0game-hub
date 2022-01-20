<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Planet extends Model
{
    public $table = 'planets';

    public function player(): BelongsTo
    {
        return $this->belongsTo(Player::class, 'player_id', 'id');
    }

    public function spyReports(): HasMany
    {
        return $this->hasMany(SpyReport::class, 'coordinates', 'coordinates')->orderBy('created_at', 'DESC');
    }
}
