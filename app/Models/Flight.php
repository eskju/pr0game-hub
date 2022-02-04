<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flight extends Model
{
    public $table = 'flights';

    protected $casts = [
        'resources' => 'json',
        'resources_diff' => 'json',
        'ships' => 'json',
        'ships_diff' => 'json',
    ];
}
