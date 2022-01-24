<?php

namespace App\Http\Controllers;

use App\Models\Alliance;
use App\Models\Player;

class AllianceController extends Controller
{
    public function getPlanets(Alliance $alliance)
    {
        return Player::query()
            ->select([
                'players.id',
                'players.name',
                'planets.coordinates'
            ])
            ->join('planets', 'planets.player_id', '=', 'player.id')
            ->where('players.alliance.id', $alliance->id)
            ->orderBy('planets.galaxy')
            ->orderBy('planets.system')
            ->orderBy('planets.planet')
            ->get();
    }
}
