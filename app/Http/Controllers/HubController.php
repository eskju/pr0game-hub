<?php

namespace App\Http\Controllers;

use App\Models\GalaxyView;
use App\Models\Planet;
use App\Models\Player;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;

class HubController extends Controller
{
    public function getBuildings()
    {
        // $this->checkPermission('getBuildings');

        return Player::query()
            ->select([
                DB::raw('players.name'),
                DB::raw('planets.*')
            ])
            ->join('planets', 'planets.player_id', '=', 'players.id')
            ->whereIn('alliance_id', $this->getAllianceIds('getBuildings'))
            ->orderBy('galaxy')
            ->orderBy('system')
            ->orderBy('planet')
            ->get();
    }

    public function getResearch()
    {
        // $this->checkPermission('getResearch');

        return Player::query()
            ->whereIn('alliance_id', $this->getAllianceIds('getResearch'))
            ->orderBy('name')
            ->get();
    }

    public function getTransferMatrix()
    {
        // $this->checkPermission('getTransferMatrix');

        $senders = Player::query()
            ->whereIn('alliance_id', $this->getAllianceIds('getTransferMatrix'))
            ->orderBy('name')
            ->get();

        return $senders->map(function (Player $sender) use ($senders) {
            $sender = $sender->toArray();
            $sender['transfer_possible'] = [];

            foreach ($senders as $receiver) {
                if (in_array(null, [
                    $sender['military_tech'],
                    $sender['defense_tech'],
                    $sender['shield_tech'],
                    $receiver['military_tech'],
                    $receiver['defense_tech'],
                    $receiver['shield_tech'],
                ])) {
                    $sender['transfer_possible'][$receiver->id] = null;
                    continue;
                }

                $sender['transfer_possible'][$receiver->id] = $sender['military_tech'] >= $receiver['military_tech']
                    && $sender['defense_tech'] >= $receiver['defense_tech']
                    && $sender['shield_tech'] >= $receiver['shield_tech'];
            }

            return $sender;
        });
    }

    public function getFleet()
    {
        // $this->checkPermission('getFleet');

        $return = Player::query()
            ->select([
                DB::raw('MIN(players.name) AS `name`'),
                DB::raw('MIN(players.score_military) AS `score_military`'),
                DB::raw('MIN(planets.galaxy) AS `galaxy`'),
                DB::raw('MIN(planets.system) AS `system`'),
                DB::raw('MIN(planets.planet) AS `planet`'),
                DB::raw('SUM(`small_transporters`) AS `small_transporters`'),
                DB::raw('SUM(`large_transporters`) AS `large_transporters`'),
                DB::raw('SUM(`light_hunters`) AS `light_hunters`'),
                DB::raw('SUM(`heavy_hunters`) AS `heavy_hunters`'),
                DB::raw('SUM(`cruisers`) AS `cruisers`'),
                DB::raw('SUM(`battleships`) AS `battleships`'),
                DB::raw('SUM(`colony_ships`) AS `colony_ships`'),
                DB::raw('SUM(`recyclers`) AS `recyclers`'),
                DB::raw('SUM(`spy_drones`) AS `spy_drones`'),
                DB::raw('SUM(`bombers`) AS `bombers`'),
                DB::raw('SUM(`solar_satellites`) AS `solar_satellites`'),
                DB::raw('SUM(`destroyers`) AS `destroyers`'),
                DB::raw('SUM(`death_stars`) AS `death_stars`'),
                DB::raw('SUM(`battle_cruisers`) AS `battle_cruisers`'),
            ])
            ->join('planets', 'planets.player_id', '=', 'players.id')
            ->whereIn('alliance_id', $this->getAllianceIds('getFleet'))
            ->groupBy('players.id')
            ->orderBy('players.name')
            ->get();

        $sumRow = [
            'name' => 'Gesamt',
            'score_military' => $return->sum('score_military'),
            'small_transporters' => $return->sum('small_transporters'),
            'large_transporters' => $return->sum('large_transporters'),
            'light_hunters' => $return->sum('light_hunters'),
            'heavy_hunters' => $return->sum('heavy_hunters'),
            'cruisers' => $return->sum('cruisers'),
            'battleships' => $return->sum('battleships'),
            'colony_ships' => $return->sum('colony_ships'),
            'recyclers' => $return->sum('recyclers'),
            'spy_drones' => $return->sum('spy_drones'),
            'bombers' => $return->sum('bombers'),
            'solar_satellites' => $return->sum('solar_satellites'),
            'destroyers' => $return->sum('destroyers'),
            'death_stars' => $return->sum('death_stars'),
            'battle_cruisers' => $return->sum('battle_cruisers'),
        ];

        $return = $return->toArray();
        $return[] = $sumRow;

        return $return;
    }

    public function getScores()
    {
        $daysDiff = Carbon::parse('2022-01-24')->diffInDays(Carbon::now()) + 1;
        $dates = [];

        for ($i = 0; $i < $daysDiff; $i++) {
            if ($i % 7 === 0) {
                $dates[] = 'KW ' . Carbon::parse('2022-01-24')->addDays($i)->week();
            }
        }

        $player = Player::query()->find(auth()->user()->player_id);

        $players = Player::query()
            ->where('alliance_id', $player->alliance_id)
            ->orderBy('players.name')
            ->get();

        foreach ($players as $key => $player) {
            $tmp = app()->make(PlayerController::class)->getPlayerChart($player, false);

            $players[$key] = [
                'id' => $player->id,
                'name' => $player->name,
                'me' => $player->id === auth()->user()->player_id,
                'score_diff' => $this->getIntervalValues($tmp, 'score_diff', 7),
                'score_relative' => $this->getIntervalValues($tmp, 'score_relative', 7)
            ];
        }

        return [
            'dates' => $dates,
            'data' => $players
        ];
    }

    public function getGalaxyViewStatus()
    {
        $return = [];

        for ($galaxy = 1; $galaxy <= 9; $galaxy++) {
            $return[$galaxy] = [];

            for ($system = 1; $system <= 400; $system++) {
                $return[$galaxy][$system] = ['last_viewed_at' => null, 'intensity' => 0];
            }
        }

        foreach (GalaxyView::query()->get() as $galaxyView) {
            $return[$galaxyView->galaxy][$galaxyView->system] = [
                'last_viewed_at' => $galaxyView->last_viewed_at,
                'intensity' => 1 - Carbon::parse($galaxyView->last_viewed_at)->diffInHours(Carbon::now()) / (24 * 7)
            ];
        }

        return $return;
    }

    private function getAllianceIds(string $string): array
    {
        return $this->checkPermission($string) ? [12, 95] : [95];
    }

    private function checkPermission(string $string): bool
    {
        // not in main ally and not RedStar
        if (auth()->user()->player->alliance_id !== $this->allowedAllianceId && auth()->user()->player_id != 275 && auth()->user()->player_id != 518) {
            // throw new Exception('PermissionException');
            return false;
        }

        return true;
    }

    private function getIntervalValues($data, string $offset, int $days): array
    {
        $return = [];
        $sum = 0;
        $i = 0;
        foreach ($data as $row) {
            $i++;
            $sum += $row[$offset];

            if ($i % $days === 0 || $i === count($data) - 1) {
                $return[] = $sum;
                $sum = 0;
            }
        }

        return $return;
    }

    public function getAlliancePowerOverview(): array
    {
        $systems = [];

        for ($g = 1; $g <= 9; $g++) {
            for ($p = 1; $p <= 15; $p++) {
                $systems[$g][$p] = [];
                for ($s = 1; $s <= 400; $s++) {

                    $systems[$g][$p][$s] = [
                        'color' => null,
                        'power' => 0,
                        'alliance' => null,
                        'name' => null
                    ];
                }
            }
        }

        $planets = Planet::query()
            ->select([
                'planets.galaxy',
                'planets.system',
                'planets.planet',
                DB::raw('players.name AS player'),
                'players.score_military',
                DB::raw('alliances.color AS color'),
                DB::raw('alliances.name AS alliance'),
            ])
            ->join('players', 'players.id', '=', 'planets.player_id')
            ->join('alliances', 'alliances.id', '=', 'players.alliance_id', 'left outer')
            ->where('players.is_inactive', 0)
            ->where('players.score', '>', 5000)
            ->orderBy('planets.system')
            ->orderBy('planets.planet')
            ->get();

        foreach ($planets as $planet) {
            $systems[$planet->galaxy][$planet->planet][$planet->system] = [
                'color' => '#' . ($planet->color ?? 'ffffff'),
                'power' => $planet->score_military ?? 0,
                'alliance' => $planet->alliance ?? null,
                'name' => $planet->player ?? null
            ];
        }

        return $systems;
    }
}
