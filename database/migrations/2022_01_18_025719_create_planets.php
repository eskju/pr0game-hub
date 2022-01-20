<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePlanets extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('planets', function (Blueprint $table) {
            $table->id();
            $this->createColumns($table);
        });

        Schema::create('log_planets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reported_by');
            $this->createColumns($table);

            $table->foreign('reported_by')->references('id')->on('users')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('planets');
    }

    /**
     * @param Blueprint $table
     */
    public function createColumns(Blueprint $table): void
    {
        $table->unsignedBigInteger('externalId')->nullable()->unique();
        $table->unsignedBigInteger('player_id');
        $table->string('coordinates')->unique();
        $table->unsignedInteger('galaxy');
        $table->unsignedInteger('system');
        $table->unsignedInteger('planet');
        $table->timestamps();
    }
}
