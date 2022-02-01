<?php

namespace App\Http\Controllers;

use App\Models\Planet;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class GalaxyController extends Controller
{
    public function show($galaxy, $system)
    {
        $return = [];
        for ($i = 1; $i <= 16; $i++) {
            $return[] = [
                'planet' => $i,
                'external_id' => null,
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
                'planet',
                'external_id',
                DB::raw('(SELECT created_at FROM battle_reports WHERE battle_reports.galaxy = planets.galaxy AND battle_reports.system = planets.system AND battle_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) as `last_battle_report`'),
                DB::raw('(SELECT created_at FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) as `last_spy_report`'),
                DB::raw('(SELECT metal FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) AS `last_spy_metal`'),
                DB::raw('(SELECT crystal FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) AS `last_spy_crystal`'),
                DB::raw('(SELECT deuterium FROM spy_reports WHERE spy_reports.galaxy = planets.galaxy AND spy_reports.system = planets.system AND spy_reports.planet = planets.planet ORDER BY created_at DESC LIMIT 1) AS `last_spy_deuterium`'),
            ])
            ->where('galaxy', $galaxy)
            ->where('system', $system)
            ->orderBy('planet')
            ->get();

        foreach ($planets as $planet) {
            $planet = $planet->toArray();

            $return[$planet['planet']] = [
                'planet' => $planet['planet'],
                'external_id' => $planet['external_id'],
                'last_battle_report' => $planet['last_battle_report'] ? $this->getDateTime(Carbon::parse($planet['last_battle_report'])->subMinute()->subHour()) : '',
                'last_spy_report' => $planet['last_spy_report'] ? $this->getDateTime(Carbon::parse($planet['last_spy_report'])->subMinute()->subHour()) : '',
                'last_spy_metal' => $planet['last_spy_metal'] ? number_format($planet['last_spy_metal'], 0, ',', '.') : '',
                'last_spy_crystal' => $planet['last_spy_crystal'] ? number_format($planet['last_spy_crystal'], 0, ',', '.') : '',
                'last_spy_deuterium' => $planet['last_spy_deuterium'] ? number_format($planet['last_spy_deuterium'], 0, ',', '.') : '',
                'last_spy_report_hours' => $planet['last_spy_report'] ? abs(Carbon::parse($planet['last_spy_report'])->subMinute()->subHour()->diffInHours(Carbon::now())) : '',
                'last_battle_report_hours' => $planet['last_battle_report'] ? abs(Carbon::parse($planet['last_battle_report'])->subMinute()->subHour()->diffInHours(Carbon::now())) : '',
            ];

            return $return;
        }

        return $return;
    }

    private function getDateTime(Carbon $dateTime): string
    {
        return $dateTime->shortAbsoluteDiffForHumans();
    }
}
