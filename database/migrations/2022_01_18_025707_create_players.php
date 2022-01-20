<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePlayers extends Migration
{
    /**
     * Run the migrations.
     * @return void
     */
    public function up()
    {
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $this->createColumns($table);
        });

        Schema::create('log_players', function (Blueprint $table) {
            $table->id();
            $table->string('external_id');
            $table->unsignedBigInteger('reported_by');
            $this->createColumns($table);

            $table->foreign('reported_by')->references('id')->on('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('players');
    }

    /**
     * @param Blueprint $table
     */
    public function createColumns(Blueprint $table): void
    {
        $table->string('name');
        $table->unsignedBigInteger('alliance_id')->nullable();
        $table->string('main_coordinates');
        $table->unsignedInteger('score');
        $table->unsignedInteger('score_building');
        $table->unsignedInteger('score_science');
        $table->unsignedInteger('score_military');
        $table->unsignedInteger('score_defense');
        $table->unsignedInteger('combats_total');
        $table->unsignedInteger('combats_won');
        $table->unsignedInteger('combats_draw');
        $table->unsignedInteger('combats_lost');
        $table->unsignedInteger('units_shot');
        $table->unsignedInteger('units_lost');
        $table->unsignedInteger('rubble_metal');
        $table->unsignedInteger('rubble_crystal');
        $table->timestamps();

        $table->foreign('alliance_id')->references('id')->on('alliances')
            ->nullOnDelete();
    }
}
