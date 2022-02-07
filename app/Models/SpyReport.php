<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SpyReport extends Model
{
    public $table = 'spy_reports';

    public function getPlanet() {
        return Planet::query()
            ->where('galaxy', $this->galaxy)
            ->where('system',$this->system)
            ->where('planet',$this->planet)
            ->first();
    }
}
