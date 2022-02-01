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
            'players' => [],
            'datasets' => []
        ];

        for ($i = 0; $i < $daysDiff; $i++) {
            $date = Carbon::parse('2022-01-18')->addDays($i)->toDateString();
            $return['dates'][] = $date;
        }

        foreach ($players as $player) {
            $return['players'][] = $player->name;
        }

        $return['data'] = [];

        foreach ($players as $player) {
            $row = [];

            for ($i = 0; $i < $daysDiff; $i++) {
                $date = Carbon::parse('2022-01-18')->addDays($i)->toDateString();
                $score = LogPlayer::query()
                    ->select(DB::raw('MAX(score) as score'))
                    ->where('external_id', $player->id)
                    ->whereRaw('DATE(created_at) = "' . $date . '"')
                    ->first();

                $row[] = $score ? $score->score : null;
            }

            $return['datasets'][] = $row;
        }

        return $return;
    }
}
