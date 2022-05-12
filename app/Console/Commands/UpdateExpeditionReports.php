<?php

namespace App\Console\Commands;

use App\Models\Expedition;
use App\Services\ExpeditionService;
use Illuminate\Console\Command;

class UpdateExpeditionReports extends Command
{
    /**
     * The name and signature of the console command.
     * @var string
     */
    protected $signature = 'update:expedition-reports';

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
        $this->parseResource();
        $this->parseFleet();
        $this->parsePiratesAliens();
    }

    private function parseResource()
    {
        $expeditions = Expedition::query()
            ->where('type', 'RESOURCE')
            ->whereNull('metal')
            ->whereNull('crystal')
            ->whereNull('deuterium')
            ->where('created_at', '>=', '2022-03-27 18:00:00')
            ->get();

        $bar = $this->output->createProgressBar(count($expeditions));
        foreach ($expeditions as $expedition) {
            $bar->advance();
            ExpeditionService::parseMessage($expedition);
        }
    }

    private function parseFleet()
    {
        $expeditions = Expedition::query()
            ->where('type', 'FLEET')
            ->whereNull('metal')
            ->whereNull('crystal')
            ->whereNull('deuterium')
            ->where('created_at', '>=', '2022-03-27 18:00:00')
            ->get();

        $bar = $this->output->createProgressBar(count($expeditions));
        foreach ($expeditions as $expedition) {
            $bar->advance();
            ExpeditionService::parseMessage($expedition);
        }
    }

    private function parsePiratesAliens()
    {
        $expeditions = Expedition::query()
            ->whereIn('type', ['PIRATES','ALIENS'])
            ->whereNull('metal')
            ->whereNull('crystal')
            ->whereNull('deuterium')
            ->where('created_at', '>=', '2022-03-27 18:00:00')
            ->get();

        $bar = $this->output->createProgressBar(count($expeditions));
        foreach ($expeditions as $expedition) {
            $bar->advance();
            ExpeditionService::parseMessage($expedition);
        }
    }
}
