<?php

namespace App\Console\Commands;

use App\Models\SpyReport;
use App\Services\CostService;
use App\Services\PlanetService;
use Illuminate\Console\Command;

class UpdateSpyReports extends Command
{
    /**
     * The name and signature of the console command.
     * @var string
     */
    protected $signature = 'update:spy-reports';

    /**
     * The console command description.
     * @var string
     */
    protected $description = '';

    /**
     * Create a new command instance.
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    public function handle()
    {
        $coords = SpyReport::query()
            ->select('coordinates')
            ->groupBy('coordinates')
            ->get();

        $bar = $this->output->createProgressBar(count($coords));
        foreach ($coords as $coord) {
            $bar->advance();
            $report = SpyReport::query()
                ->where('coordinates', $coord->coordinates)
                ->orderBy('created_at', 'DESC')
                ->first();

            if ($report) {
                PlanetService::updatePlanetBySpyReport($report);
            }
        }

        $bar->finish();
    }
}
