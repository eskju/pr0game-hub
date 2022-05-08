<?php

namespace App\Http\Controllers;

use App\Models\GalaxyView;
use App\Models\Planet;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class GalaxyController extends Controller
{
    public function show($galaxy, $system)
    {
        if (!$view = GalaxyView::query()->where('galaxy', $galaxy)->where('system', $system)->first()) {
            $view = new GalaxyView();
            $view->galaxy = $galaxy;
            $view->system = $system;
        }

        $view->last_viewed_at = Carbon::now();
        $view->save();

        $return = [];
        for ($i = 1; $i <= 16; $i++) {
            $return[$i] = [
                'planet' => $i,
                'external_id' => null,
                'player_id' => null,
                'moon_id' => null,
                'last_battle_report' => null,
                'last_spy_report' => null,
                'last_spy_metal' => null,
                'last_spy_deuterium' => null,
                'last_spy_report_hours' => null,
                'last_battle_report_hours' => null,
            ];
        }

        $planets = Planet::query()
            ->select([
                'id',
                'galaxy',
                'system',
                'planet',
                'coordinates',
                'external_id',
                DB::raw('(SELECT created_at FROM battle_reports WHERE battle_reports.coordinates = planets.coordinates ORDER BY created_at DESC LIMIT 1) as `last_battle_report`'),
                DB::raw('(SELECT created_at FROM spy_reports WHERE spy_reports.coordinates = planets.coordinates ORDER BY created_at DESC LIMIT 1) as `last_spy_report`'),
                DB::raw('(SELECT metal FROM spy_reports WHERE spy_reports.coordinates = planets.coordinates ORDER BY created_at DESC LIMIT 1) AS `last_spy_metal`'),
                DB::raw('(SELECT crystal FROM spy_reports WHERE spy_reports.coordinates = planets.coordinates ORDER BY created_at DESC LIMIT 1) AS `last_spy_crystal`'),
                DB::raw('(SELECT deuterium FROM spy_reports WHERE spy_reports.coordinates = planets.coordinates ORDER BY created_at DESC LIMIT 1) AS `last_spy_deuterium`'),
            ])
            ->where('galaxy', $galaxy)
            ->where('system', $system)
            ->where('type', 'PLANET')
            ->orderBy('planet')
            ->get();

        foreach ($planets as $planet) {
            $planet = $planet->toArray();

            $return[$planet['planet']] = [
                'id' => $planet['id'],
                'galaxy' => $planet['galaxy'],
                'system' => $planet['system'],
                'planet' => $planet['planet'],
                'moon_id' => Planet::query()->where('coordinates', $planet['coordinates'])->where('type', 'MOON')->first()->id ?? null,
                'external_id' => $planet['external_id'],
                'last_battle_report' => $planet['last_battle_report'] ? $this->getDateTime(Carbon::parse($planet['last_battle_report'])->subMinute()) : '',
                'last_spy_report' => $planet['last_spy_report'] ? $this->getDateTime(Carbon::parse($planet['last_spy_report'])->subMinute()) : '',
                'last_spy_metal' => $planet['last_spy_metal'] ? number_format($planet['last_spy_metal'], 0, ',', '.') : '',
                'last_spy_crystal' => $planet['last_spy_crystal'] ? number_format($planet['last_spy_crystal'], 0, ',', '.') : '',
                'last_spy_deuterium' => $planet['last_spy_deuterium'] ? number_format($planet['last_spy_deuterium'], 0, ',', '.') : '',
                'last_spy_report_hours' => $planet['last_spy_report'] ? abs(Carbon::parse($planet['last_spy_report'])->subMinute()->diffInHours(Carbon::now())) : '',
                'last_battle_report_hours' => $planet['last_battle_report'] ? abs(Carbon::parse($planet['last_battle_report'])->subMinute()->diffInHours(Carbon::now())) : '',
            ];
        }

        return $return;
    }

    private function getDateTime(Carbon $dateTime): string
    {
        return $dateTime->shortAbsoluteDiffForHumans();
    }
}
