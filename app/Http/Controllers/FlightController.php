<?php

namespace App\Http\Controllers;

use App\Models\Flight;
use App\Models\Planet;
use App\Models\Player;
use App\Models\Pr0gameVar;
use App\Models\User;
use App\Services\PlanetService;
use App\Services\ResourceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FlightController extends Controller
{
    public function store(Request $request)
    {
        $outboundIds = [];
        $inboundIds = [];
        $inboundOutboundIds = [];

        foreach ($request->get('activities') ?? [] as $activity) {
            $activity = (object)$activity;
            $inboundOutboundIds[] = $activity->external_id ?? null;
            $inboundOutboundIds[] = $activity->outbound_flight_id ?? $activity->external_id ?? null;

            if (!$flight = Flight::query()->where('external_id', $activity->external_id ?? null)->where('is_return', '=', (int)$activity->is_return ?? null)->first()) {
                $flight = new Flight();
                $flight->external_id = $activity->external_id ?? null;
                $flight->is_return = (int)$activity->is_return ?? null;
            }

            // create planets if not known
            PlanetService::getPlanetExternalId($activity->planet_start_coordinates ?? null);
            PlanetService::getPlanetExternalId($activity->planet_target_coordinates ?? null);

            if ($activity->is_return) {
                $outboundFlight = Flight::query()
                    ->where('external_id', $activity->outbound_flight_id)
                    ->where('is_return', '=', 0)
                    ->first();

                $inboundIds[] = $activity->external_id ?? null;
            } else {
                $outboundIds[] = $activity->external_id ?? null;
            }

            $flight->user_id = auth()->id();
            $flight->is_active = true;
            $flight->type = $activity->type ?? null;
            $flight->outbound_flight_id = $activity->outbound_flight_id ?? null;
            $flight->timestamp_departure = (int)($activity->timestamp_departure ?? 0) / 1000;
            $flight->timestamp_arrival = $activity->timestamp_arrival ?? null;
            $flight->planet_start_coordinates = $activity->planet_start_coordinates ?? null;
            $flight->player_start_id = Planet::query()->where('coordinates', $activity->planet_start_coordinates ?? null)->first()->player_id ?? null;
            $flight->planet_target_coordinates = $activity->planet_target_coordinates ?? null;
            $flight->player_target_id = Planet::query()->where('coordinates', $activity->planet_target_coordinates ?? null)->first()->player_id ?? null;
            $flight->resources = $activity->resources ?? [];
            $flight->resources_diff = $activity->is_return ? $this->getDiff((array)($outboundFlight ? ($outboundFlight->resources ?? []) : ($flight->resources ?? [])), (array)($flight->resources ?? [])) : null;
            $flight->ships = $activity->ships ?? [];
            $flight->ships_diff = $activity->is_return ? $this->getDiff((array)($outboundFlight ? ($outboundFlight->ships ?? []) : ($flight->ships ?? [])), (array)($flight->ships ?? [])) : null;
            $absDiff = $this->getAbsDiff($flight->resources_diff, $flight->ships_diff);
            $flight->metal_diff = $absDiff['Metall']['diff'];
            $flight->crystal_diff = $absDiff['Kristall']['diff'];
            $flight->deuterium_diff = $absDiff['Deuterium']['diff'];
            $flight->score_diff = round($absDiff['Punkte']);
            $flight->save();
        }

        Flight::query()
            ->where('user_id', auth()->id())
            ->where('is_active', '=', 1)
            ->where('is_return', '=', 0)
            ->whereNotIn('external_id', $outboundIds)
            ->update(['is_active' => 0]);

        Flight::query()
            ->where('user_id', auth()->id())
            ->where('is_active', '=', 1)
            ->where('is_return', '=', 1)
            ->whereNotIn('external_id', $inboundIds)
            ->update(['is_active' => 0]);

        return response([
            'slots_used' => (Flight::query()
                        ->select(DB::raw('COUNT(DISTINCT external_id) AS `count`'))
                        ->where('user_id', auth()->id())
                        ->where('is_active', 1)
                        ->first()
                        ->count ?? 0) . ' / ' . ((Player::query()
                            ->select('computer_tech')
                            ->find(auth()->user()->player_id)
                            ->computer_tech ?? 0) + 1),
            'flights' => Flight::query()
                ->where('user_id', auth()->id())
                ->where('is_active', 1)
                ->orderBy('timestamp_arrival')
                ->orderBy('is_return')
                ->get()
                ->map(function (Flight $flight) {
                    $flight->metal_diff = number_format($flight->metal_diff, 0, '', '.');
                    $flight->crystal_diff = number_format($flight->crystal_diff, 0, '', '.');
                    $flight->deuterium_diff = number_format($flight->deuterium_diff, 0, '', '.');
                    $flight->score_diff = number_format($flight->score_diff, 0, '', '.');

                    return $flight->toArray();
                }),
            'expeditions' => $this->getExpeditionStats(auth()->id())
        ]);
    }

    public function stats(): array
    {
        return [
            'own_stats' => $this->getExpeditionStats(auth()->id()),
            'stats_per_player' => User::query()
                ->whereNotNull('api_key')
                ->orderBy('name')
                ->get()
                ->map(function (User $user) {
                    $user->expeditions = $this->getRaidStats('Expedition', $user->id);
                    $user->raids = $this->getRaidStats('Angreifen', $user->id);
                    $user->recycling = $this->getRaidStats('Abbauen', $user->id);

                    return $user;
                })
        ];
    }

    private function getDiff(array $before, array $after): array
    {
        $return = [];
        $keys = array_unique(array_merge(array_keys($before), array_keys($after)));

        foreach ($keys as $key) {
            $valueBefore = (int)(str_replace('.', '', $before[$key] ?? 0));
            $valueAfter = (int)(str_replace('.', '', $after[$key] ?? 0));
            $diff = $valueAfter - $valueBefore;
            $labels = [
                'metal' => 'Metall',
                'crystal' => 'Kristall',
                'deuterium' => 'Deuterium'
            ];

            if (in_array($key, ['metal', 'crystal', 'deuterium'])) {
                $costMetal = $key === 'metal' ? 1 : 0;
                $costCrystal = $key === 'crystal' ? 1 : 0;
                $costDeuterium = $key === 'deuterium' ? 1 : 0;
            } else {
                if (!$resourceId = ResourceService::MAPPING_NAMES[$key] ?? null) {
                    Log::error('SHIP ' . $key . ' NOT FOUND!');
                    continue;
                }

                $config = Pr0gameVar::query()->where('elementID', $resourceId)->first();
                $costMetal = $config->cost901;
                $costCrystal = $config->cost902;
                $costDeuterium = $config->cost903;
            }

            $return[$labels[$key] ?? $key] = [
                'before' => number_format($valueBefore, 0, '', '.'),
                'after' => number_format($valueAfter, 0, '', '.'),
                'diff' => number_format($diff, 0, '', '.'),
                'metal' => number_format($diff * $costMetal, 0, '', '.'),
                'crystal' => number_format($diff * $costCrystal, 0, '', '.'),
                'deuterium' => number_format($diff * $costDeuterium, 0, '', '.'),
                'score' => number_format(($diff * $costMetal + $diff * $costCrystal + $diff * $costDeuterium) / 1000, 0, '', '.'),
            ];
        }

        return $return;
    }

    private function getAbsDiff($resources_diff, $ships_diff)
    {
        if (!$resources_diff) {
            $resources_diff = [
                'Metall' => ['before' => 0, 'after' => 0, 'diff' => 0],
                'Kristall' => ['before' => 0, 'after' => 0, 'diff' => 0],
                'Deuterium' => ['before' => 0, 'after' => 0, 'diff' => 0],
            ];
        }

        foreach ($ships_diff ?? [] as $shipAlias => $data) {
            if (!$resourceId = ResourceService::MAPPING_NAMES[$shipAlias] ?? null) {
                Log::error('SHIP ' . $shipAlias . ' NOT FOUND!');
                continue;
            }

            $config = Pr0gameVar::query()->where('elementID', $resourceId)->first();
            $resources_diff['Metall']['diff'] = str_replace('.', '', $resources_diff['Metall']['diff']) + $data['diff'] * $config->cost901;
            $resources_diff['Kristall']['diff'] = str_replace('.', '', $resources_diff['Kristall']['diff']) + $data['diff'] * $config->cost902;
            $resources_diff['Deuterium']['diff'] = str_replace('.', '', $resources_diff['Deuterium']['diff']) + $data['diff'] * $config->cost903;
        }

        $resources_diff['Punkte'] = str_replace('.', '', $resources_diff['Metall']['diff']) / 1000 + str_replace('.', '', $resources_diff['Kristall']['diff']) / 1000 + str_replace('.', '', $resources_diff['Deuterium']['diff']) / 1000;

        return $resources_diff;
    }

    private function getExpeditionStats(int $userId): array
    {
        $return = [];
        $coords = Flight::query()
            ->select('planet_start_coordinates')
            ->where('user_id', $userId)
            ->where('type', 'Expedition')
            ->where('is_return', 1)
            ->groupBy('planet_start_coordinates')
            ->get();

        foreach ($coords as $coord) {
            $coord->planet_start_coordinates = 'Expo ' . $coord->planet_start_coordinates;
            $return[$coord->planet_start_coordinates] = (object)[
                'count' => 0,
                'count_24' => Flight::query()
                    ->where('user_id', $userId)
                    ->where('type', 'Expedition')
                    ->where('is_return', 1)
                    ->where('planet_start_coordinates', str_replace('Expo ', '', $coord->planet_start_coordinates))
                    ->where('timestamp_arrival', '>', time() - 86400)
                    ->count(),
                'resources_diff' => [],
                'ships_diff' => [],
                'metal_diff' => 0,
                'crystal_diff' => 0,
                'deuterium_diff' => 0,
                'score_diff' => 0
            ];

            $expeditions = Flight::query()
                ->where('user_id', $userId)
                ->where('type', 'Expedition')
                ->where('is_return', 1)
                ->where('planet_start_coordinates', str_replace('Expo ', '', $coord->planet_start_coordinates))
                ->get();

            foreach ($expeditions as $expedition) {
                $absDiff = $this->getAbsDiff($expedition->resources_diff, $expedition->ships_diff);
                $return[$coord->planet_start_coordinates]->count++;
                $return[$coord->planet_start_coordinates]->metal_diff += $absDiff['Metall']['diff'];
                $return[$coord->planet_start_coordinates]->crystal_diff += $absDiff['Kristall']['diff'];
                $return[$coord->planet_start_coordinates]->deuterium_diff += $absDiff['Deuterium']['diff'];
                $return[$coord->planet_start_coordinates]->score_diff += round($absDiff['Punkte']);
            }

            $return[$coord->planet_start_coordinates]->count = number_format($return[$coord->planet_start_coordinates]->count, 0, '', '.');
            $return[$coord->planet_start_coordinates]->count_24 = number_format($return[$coord->planet_start_coordinates]->count_24, 0, '', '.');
            $return[$coord->planet_start_coordinates]->metal_diff = number_format($return[$coord->planet_start_coordinates]->metal_diff, 0, '', '.');
            $return[$coord->planet_start_coordinates]->crystal_diff = number_format($return[$coord->planet_start_coordinates]->crystal_diff, 0, '', '.');
            $return[$coord->planet_start_coordinates]->deuterium_diff = number_format($return[$coord->planet_start_coordinates]->deuterium_diff, 0, '', '.');
            $return[$coord->planet_start_coordinates]->score_diff = number_format($return[$coord->planet_start_coordinates]->score_diff, 0, '', '.');
        }

        $return['Raids'] = $this->getRaidStats('Angreifen', $userId);
        $return['Recycling'] = $this->getRaidStats('Abbauen', $userId);

        return $return;
    }

    private function getRaidStats($type, int $userId): object
    {
        $return = (object)[
            'count' => 0,
            'count_24' => Flight::query()
                ->select('planet_target_coordinates')
                ->where('user_id', $userId)
                ->where('player_target_id', User::find($userId)->player_id)
                ->where('type', $type)
                ->where('is_return', 1)
                ->where('timestamp_arrival', '>', time() - 86400)
                ->count(),
            'resources_diff' => [],
            'ships_diff' => [],
            'metal_diff' => 0,
            'crystal_diff' => 0,
            'deuterium_diff' => 0,
            'score_diff' => 0
        ];

        $raids = Flight::query()
            ->where('user_id', $userId)
            ->where('player_target_id', User::find($userId)->player_id)
            ->where('type', $type)
            ->where('is_return', 1)
            ->get();

        foreach ($raids as $raid) {
            $absDiff = $this->getAbsDiff($raid->resources_diff, $raid->ships_diff);
            $return->count++;
            $return->metal_diff += $absDiff['Metall']['diff'];
            $return->crystal_diff += $absDiff['Kristall']['diff'];
            $return->deuterium_diff += $absDiff['Deuterium']['diff'];
            $return->score_diff += round($absDiff['Punkte']);
        }

        $return->count = number_format($return->count, 0, '', '.');
        $return->count_24 = number_format($return->count_24, 0, '', '.');
        $return->metal_diff = number_format($return->metal_diff, 0, '', '.');
        $return->crystal_diff = number_format($return->crystal_diff, 0, '', '.');
        $return->deuterium_diff = number_format($return->deuterium_diff, 0, '', '.');
        $return->score_diff = number_format($return->score_diff, 0, '', '.');

        return $return;
    }

    public function fixFlightDiffs()
    {
        foreach (Flight::query()->where('is_return', 1)->get() as $flight) {
            exit;

        }

        return response([]);
    }
}
