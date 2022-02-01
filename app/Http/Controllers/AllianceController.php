<?php

namespace App\Http\Controllers;

use App\Models\Alliance;
use App\Models\LogPlayer;
use App\Models\Player;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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
            ->join('planets', 'planets.player_id', '=', 'players.id')
            ->where('players.alliance_id', $alliance->id)
            ->orderBy('planets.galaxy')
            ->orderBy('planets.system')
            ->orderBy('planets.planet')
            ->get();
    }

    public function getChart(Alliance $alliance): array
    {
        $players = Player::query()
            ->where('alliance_id', $alliance->id)
            ->orderBy('name')
            ->get();

        $daysDiff = Carbon::parse('2022-01-18')->diffInDays(Carbon::now());
        $return = [
            'dates' => [],
            'players' => []
        ];

        foreach($players as $player) {
            $return['players'][] = $player->name;
        }

        for ($i = 0; $i < $daysDiff; $i++) {
            $date = Carbon::parse('2022-01-18')->addDays($i)->toDateString();

            foreach ($players as $player) {
                if (!isset($return[$player->id])) {
                    $return[$player->id] = [];
                }

                $score = LogPlayer::query()
                    ->select(DB::raw('MAX(score) as score'))
                    ->where('external_id', $player->id)
                    ->whereRaw('DATE(created_at) = "' . $date . '"')
                    ->first();

                $return[$player->id][] = $score ? $score->score : null;
            }

            $return['dates'][] = $date;
        }

        return $return;
    }
}
