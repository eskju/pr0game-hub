<?php

namespace App\Console\Commands;

use App\Models\Planet;
use App\Models\SpyReport;
use App\Models\User;
use App\Services\CostService;
use App\Services\PlanetService;
use Illuminate\Console\Command;

class UpdateHubPlanets extends Command
{
    /**
     * The name and signature of the console command.
     * @var string
     */
    protected $signature = 'update:hub-planets';

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
        $playerIds = User::query()
            ->get()
            ->pluck('player_id');

        $planets = Planet::query()
            ->whereIn('player_id', $playerIds)
            ->get();

        $bar = $this->output->createProgressBar(count($planets));
        foreach ($planets as $planet) {
            $bar->advance();
            $planet->save();
        }

        $bar->finish();
    }
}
