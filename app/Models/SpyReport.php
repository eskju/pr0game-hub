<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpyReport extends Model
{
    public $table = 'spy_reports';

    public function getPlanet()
    {
        return Planet::query()
            ->where('galaxy', $this->galaxy)
            ->where('system', $this->system)
            ->where('planet', $this->planet)
            ->where('type', $this->type)
            ->first();
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by', 'id');
    }
}
