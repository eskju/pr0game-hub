<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class SpyReports extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('spy_reports', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reported_by');
            $table->string('coordinates')->unique();
            $table->unsignedInteger('galaxy');
            $table->unsignedInteger('system');
            $table->unsignedInteger('planet');
            $table->unsignedInteger('metal');
            $table->unsignedInteger('crystal');
            $table->unsignedInteger('deuterium');
            $table->unsignedInteger('energy');
            $table->unsignedInteger('small_transporters')->nullable();
            $table->unsignedInteger('large_transporters')->nullable();
            $table->unsignedInteger('light_hunters')->nullable();
            $table->unsignedInteger('heavy_hunters')->nullable();
            $table->unsignedInteger('cruisers')->nullable();
            $table->unsignedInteger('battleships')->nullable();
            $table->unsignedInteger('colony_ships')->nullable();
            $table->unsignedInteger('recyclers')->nullable();
            $table->unsignedInteger('spy_drones')->nullable();
            $table->unsignedInteger('bombers')->nullable();
            $table->unsignedInteger('solar_satellites')->nullable();
            $table->unsignedInteger('destroyers')->nullable();
            $table->unsignedInteger('death_stars')->nullable();
            $table->unsignedInteger('battle_cruisers')->nullable();
            $table->unsignedInteger('rocket_launchers')->nullable();
            $table->unsignedInteger('light_laser_turrets')->nullable();
            $table->unsignedInteger('heavy_laser_turrets')->nullable();
            $table->unsignedInteger('gauss_canons')->nullable();
            $table->unsignedInteger('ion_turrets')->nullable();
            $table->unsignedInteger('plasma_turrets')->nullable();
            $table->unsignedInteger('small_shields')->nullable();
            $table->unsignedInteger('large_shields')->nullable();
            $table->unsignedInteger('interceptor_missiles')->nullable();
            $table->unsignedInteger('interplanetary_missiles')->nullable();
            $table->unsignedInteger('metal_mine')->nullable();
            $table->unsignedInteger('crystal_mine')->nullable();
            $table->unsignedInteger('deuterium_mine')->nullable();
            $table->unsignedInteger('solar_plant')->nullable();
            $table->unsignedInteger('techno_dome')->nullable();
            $table->unsignedInteger('fusion_plant')->nullable();
            $table->unsignedInteger('robot_factory')->nullable();
            $table->unsignedInteger('nano_factory')->nullable();
            $table->unsignedInteger('hangar')->nullable();
            $table->unsignedInteger('metal_storage')->nullable();
            $table->unsignedInteger('crystal_storage')->nullable();
            $table->unsignedInteger('deuterium_storage')->nullable();
            $table->unsignedInteger('laboratory')->nullable();
            $table->unsignedInteger('terra_former')->nullable();
            $table->unsignedInteger('alliance_depot')->nullable();
            $table->unsignedInteger('base')->nullable();
            $table->unsignedInteger('phalanx')->nullable();
            $table->unsignedInteger('portal')->nullable();
            $table->unsignedInteger('missile_silo')->nullable();
            $table->float('spy_destruction_probability')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}
