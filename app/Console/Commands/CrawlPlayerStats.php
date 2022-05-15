<?php

namespace App\Console\Commands;

use App\Models\Alliance;
use App\Models\LogPlayer;
use App\Models\Player;
use App\Models\PlayerScore;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CrawlPlayerStats extends Command
{
    /**
     * The name and signature of the console command.
     * @var string
     */
    protected $signature = 'crawl:player-stats';

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
        $ch = curl_init('https://pr0game.com/stats.json');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $html = curl_exec($ch);
        $json = json_decode($html);

        $bar = $this->output->createProgressBar(count($json));

        foreach ($json as $row) {
            $bar->advance();

            if ($row->allianceId) {
                if (!$alliance = Alliance::query()->find($row->allianceId)) {
                    $alliance = new Alliance();
                    $alliance->id = $row->allianceId;
                    $alliance->name = $row->allianceName ?: '---';
                    $alliance->tag = $row->allianceName ?: '---';
                    $alliance->save();
                } else {
                    $alliance->name = $row->allianceName ?: '---';
                    $alliance->save();
                }
            }

            /** @var Player */
            if (!$player = Player::query()->find($row->playerId)) {
                $player = new Player();
                $player->id = $row->playerId;
            }

            $player->score = $row->score;
            $player->score_building = $row->buildingScore;
            $player->score_science = $row->researchScore;
            $player->score_military = $row->fleetScore;
            $player->score_defense = $row->defensiveScore;
            $player->combats_total = $row->battlesWon + $row->battlesDraw + $row->battlesLost;
            $player->combats_won = $row->battlesWon;
            $player->combats_draw = $row->battlesDraw;
            $player->combats_lost = $row->battlesLost;
            $player->units_shot = $row->unitsDestroyed;
            $player->units_lost = $row->unitsLost;
            $player->rubble_metal = $row->debrisMetal;
            $player->rubble_crystal = $row->debrisCrystal;
            $player->alliance_id = $row->allianceId || null;
            $player->save();
            $isInactive = $player->is_inactive;
            $onVacation = $player->on_vacation;

            $player = new LogPlayer();
            $player->external_id = $row->playerId;
            $player->reported_by = 1;
            $player->name = $row->playerName;
            $player->main_coordinates = '';
            $player->score = $row->score;
            $player->score_building = $row->buildingScore;
            $player->score_science = $row->researchScore;
            $player->score_military = $row->fleetScore;
            $player->score_defense = $row->defensiveScore;
            $player->score_defense = $row->defensiveScore;
            $player->combats_total = $row->battlesWon + $row->battlesDraw + $row->battlesLost;
            $player->combats_won = $row->battlesWon;
            $player->combats_draw = $row->battlesDraw;
            $player->combats_lost = $row->battlesLost;
            $player->units_shot = $row->unitsDestroyed;
            $player->units_lost = $row->unitsLost;
            $player->rubble_metal = $row->debrisMetal;
            $player->rubble_crystal = $row->debrisCrystal;
            $player->alliance_id = isset($alliance) ? $alliance->id : null;
            $player->save();

            if (!$isInactive && !$onVacation) {
                $score = PlayerScore::query()->where('id', $row->playerId)->first() ?? new PlayerScore();
                $score->id = $row->playerId;
                $score->hour06 = $this->getScore($score->id, Carbon::now()->subHours(6));
                $score->hour12 = $this->getScore($score->id, Carbon::now()->subHours(12));
                $score->hour18 = $this->getScore($score->id, Carbon::now()->subHours(18));
                $score->day01 = $this->getScore($score->id, Carbon::now()->subdays(1));
                $score->day02 = $this->getScore($score->id, Carbon::now()->subdays(2));
                $score->day03 = $this->getScore($score->id, Carbon::now()->subdays(3));
                $score->day04 = $this->getScore($score->id, Carbon::now()->subdays(4));
                $score->day05 = $this->getScore($score->id, Carbon::now()->subdays(5));
                $score->day06 = $this->getScore($score->id, Carbon::now()->subdays(6));
                $score->day07 = $this->getScore($score->id, Carbon::now()->subdays(7));
                $score->save();
            }

            /**
             * CREATE VIEW Scores AS SELECT
             * p.id,
             * p.is_inactive,
             * p.on_vacation,
             * p.name,
             * (SELECT GROUP_CONCAT(DISTINCT galaxy) FROM planets pl WHERE pl.player_id = p.id) as galas,
             * p.score - hour06 AS `h06`,
             * p.score - hour12 AS `h12`,
             * p.score - hour18 AS `h18`,
             * p.score - day01 AS `d01`,
             * p.score - day02 AS `d02`,
             * p.score - day03 AS `d03`,
             * p.score - day04 AS `d04`,
             * p.score - day05 AS `d05`,
             * p.score - day06 AS `d06`,
             * p.score - day07 AS `d07`
             * FROM `player_scores` ps INNER JOIN players p ON p.id = ps.id;
             */
        }
    }

    private function getScore(int $playerId, Carbon $dateTime)
    {
        return LogPlayer::query()
                ->where('external_id', $playerId)
                ->where('created_at', '<=', $dateTime)
                ->orderBy('created_at', 'DESC')
                ->first()
                ->score ?? 0;
    }
}
