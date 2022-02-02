<?php

namespace App\Services;

use App\Models\Player;

class PlayerService
{
    public static function getPlayerByCoordinates($coordinates)
    {
        if (!$planet = Player::query()->where('coordinates', $coordinates)->first()) {
            return null;
        }

        return $planet->player_id;
    }
}
