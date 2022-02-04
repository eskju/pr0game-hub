<?php

namespace App\Http\Controllers;

use App\Models\Flight;
use App\Models\Planet;
use App\Services\PlanetService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            $flight->resources_diff = $activity->is_return ? $this->getDiff((array)($outboundFlight->resources ?? []), (array)($flight->resources ?? [])) : null;
            $flight->ships = $activity->ships ?? [];
            $flight->ships_diff = $activity->is_return ? $this->getDiff((array)($outboundFlight->ships ?? []), (array)($flight->ships ?? [])) : null;
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
            'slots_used' => Flight::query()
                    ->select(DB::raw('COUNT(DISTINCT external_id) AS `count`'))
                    ->where('user_id', auth()->id())
                    ->where('is_active', 1)
                    ->first()
                    ->count ?? 0,
            'flights' => Flight::query()
                ->where('user_id', auth()->id())
                ->where('is_active', 1)
                ->orderBy('timestamp_arrival')
                ->orderBy('is_return')
                ->get()
                ->map(function (Flight $flight) {
                    return $flight->toArray();
                })
        ]);
    }

    private function getDiff(array $before, array $after): array
    {
        $return = [];
        $keys = array_unique(array_merge(array_keys($before), array_keys($after)));

        foreach ($keys as $key) {
            $valueBefore = (int)($before[$key] ?? 0);
            $valueAfter = (int)($after[$key] ?? 0);
            $diff = $valueAfter - $valueBefore;
            $labels = [
                'metal' => 'Metall',
                'crystal' => 'Kristall',
                'deuterium' => 'Deuterium'
            ];

            $return[$labels[$key] ?? $key] = [
                'before' => number_format($valueBefore, 0, '', '.'),
                'after' => number_format($valueAfter, 0, '', '.'),
                'diff' => number_format($diff, 0, '', '.')
            ];
        }

        return $return;
    }
}
