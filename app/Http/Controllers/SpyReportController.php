<?php

namespace App\Http\Controllers;

use App\Models\Planet;
use App\Models\SpyReport;
use App\Services\PlanetService;
use App\Services\ResourceService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;

class SpyReportController extends Controller
{
    public function store(Request $request)
    {
        if (!$spyReport = SpyReport::query()->find($request->get('id'))) {
            $spyReport = new SpyReport();
            $spyReport->id = $request->get('id');
        }

        $spyReport->reported_by = auth()->id();
        $spyReport->coordinates = $request->get('galaxy') . ':' . $request->get('system') . ':' . $request->get('planet');
        $spyReport->galaxy = $request->get('galaxy');
        $spyReport->system = $request->get('system');
        $spyReport->planet = $request->get('planet');

        if($request->get('shipsVisible')) {
            $spyReport->small_transporters = 0;
            $spyReport->large_transporters = 0;
            $spyReport->light_hunters = 0;
            $spyReport->heavy_hunters = 0;
            $spyReport->cruisers = 0;
            $spyReport->battleships = 0;
            $spyReport->colony_ships = 0;
            $spyReport->recyclers = 0;
            $spyReport->spy_drones = 0;
            $spyReport->bombers = 0;
            $spyReport->solar_satellites = 0;
            $spyReport->destroyers = 0;
            $spyReport->death_stars = 0;
            $spyReport->battle_cruisers = 0;
        }

        foreach ($request->get('resources') as $id => $value) {
            $resourceAlias = ResourceService::getAliasById($id);
            $spyReport->{$resourceAlias} = $value;
        }

        $spyReport->created_at = Carbon::parse($request->get('timestamp'));
        $spyReport->save();

        PlanetService::updatePlanetBySpyReport($spyReport);

        return response([]);
    }

    public function history(int $galaxy, int $system, int $planet, Request $request): array
    {
        $spyReports = SpyReport::query()
            ->where('galaxy', $galaxy)
            ->where('system', $system)
            ->where('planet', $planet)
            ->orderBy('created_at', 'DESC')
            ->limit((int)($request->get('lines', 10) ?? 10))
            ->get();

        if (!$spyReports) {
            return [];
        }

        /** @var Planet|null $planet */
        $planet = Planet::query()
            ->where('galaxy', $galaxy)
            ->where('system', $system)
            ->where('planet', $planet)
            ->first();

        if (!$planet) {
            return [];
        }

        if (!$planet->player) {
            return [];
        }

        return [
            'resources' => $this->getDiffList($spyReports, 901, 999),
            'buildings' => $this->getDiffList($spyReports, 1, 99),
            'science' => $this->getDiffList($spyReports, 100, 199),
            'fleet' => $this->getDiffList($spyReports, 200, 299),
            'defense' => $this->getDiffList($spyReports, 400, 599),
        ];
    }

    private function getDiffList(Collection $spyReports, int $offsetStart, int $offsetEnd): array
    {
        $spyReports = $spyReports->reverse();

        $this->offsets = [];

        return [
            'data' => array_reverse($spyReports->map(function (SpyReport $spyReport) use ($offsetStart, $offsetEnd) {
                $mapping = ResourceService::getMapping();
                $values = [];

                for ($i = $offsetStart; $i < $offsetEnd; $i++) {
                    if ($i === 111) {
                        $offset = 110;
                    } else if ($i === 110) {
                        $offset = 111;
                    } else {
                        $offset = $i;
                    }

                    if (key_exists((string)$i, $mapping) && $alias = $mapping[(string)$i]) {
                        $this->offsets[] = $alias;
                        $values[] = [
                            'name' => ResourceService::getNameById($offset),
                            'alias' => $alias,
                            'value' => $spyReport->{$alias},
                            'valueBefore' => $this->lastValue[$alias] ?? null,
                            'difference' => $spyReport->{$alias} - ($this->lastValue[$alias] ?? 0)
                        ];

                        if ($spyReport->{$alias} !== null) {
                            $this->lastValue[$alias] = $spyReport->{$alias};
                        }
                    }
                }

                return [
                    'reporter' => $spyReport->reporter,
                    'timestamp' => $spyReport->created_at->subHour()->shortAbsoluteDiffForHumans(),
                    'dateTime' => $spyReport->created_at->format('d.m.Y H:i:s') . ' Uhr',
                    'values' => $values,
                    'success' => ($values[0]['value'] ?? null) !== null,
                ];
            })->filter(function (array $item, $key) {
                $sum = 0;
                foreach ($item['values'] as $value) {
                    $sum += abs($value['difference']);
                }

                return ($item['success'] && $sum > 0) || $key === 0;
            })->toArray()),
            'offsets' => array_unique($this->offsets),
        ];
    }
}
