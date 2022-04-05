<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $player_id
 * @property string $coordinates
 * @property string $activity
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class PlanetActivity extends Model
{
    public $table = 'planet_activity';
}
