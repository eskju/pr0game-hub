<?php

namespace App\Http\Controllers;

use App\Models\Alliance;
use App\Models\Player;
use Exception;
use Illuminate\Support\Facades\DB;

class HubController extends Controller
{
    public function getBuildings()
    {
        $this->checkPermission('getBuildings');

        return Player::query()
            ->select([
                DB::raw('players.name'),
                DB::raw('planets.*')
            ])
            ->join('planets', 'planets.player_id', '=', 'players.id')
            ->whereIn('alliance_id', $this->allianceIds)
            ->orderBy('galaxy')
            ->orderBy('system')
            ->orderBy('planet')
            ->get();
    }

    public function getResearch()
    {
        $this->checkPermission('getResearch');

        return Player::query()
            ->whereIn('alliance_id', $this->allianceIds)
            ->orderBy('name')
            ->get();
    }

    private function checkPermission(string $string)
    {
        if(auth()->user()->alliance_id !== $this->allowedAllianceId) {
            throw new Exception('PermissionException');
        }
    }
}
