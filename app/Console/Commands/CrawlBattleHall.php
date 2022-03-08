<?php

namespace App\Console\Commands;

use App\Models\SpyReport;
use App\Services\PlanetService;
use Illuminate\Console\Command;

class CrawlBattleHall extends Command
{
    /**
     * The name and signature of the console command.
     * @var string
     */
    protected $signature = 'crawl:battle-hall';

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
        $html = file_get_contents('https://pr0game.com/index.php?page=battleHall');

        var_dump($html);
    }
}
