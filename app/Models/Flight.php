<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property int $external_id
 * @property int $outbound_flight_id
 * @property bool $is_return
 * @property bool $is_active
 * @property int $timestamp_departure
 * @property int $timestamp_arrival
 * @property string $type
 * @property string $planet_start_coordinates
 * @property int $player_start_id
 * @property string $planet_target_coordinates
 * @property int $player_target_id
 * @property string $resources
 * @property string $resources_diff
 * @property string $ships
 * @property string $ships_diff
 * @property int $metal_diff
 * @property int $crystal_diff
 * @property int $deuterium_diff
 * @property int $score_diff
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
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
