<?php

namespace App\Services;

class ExpeditionCalculatorService
{
    protected int $holdTime; // in hours
    protected int $dice; // rand(0-1000) - ($holdTime * 10)
    protected int $fleetPoints;
    protected int $maxPoints = 2400;

    public function setFleetPoints($value)
    {
        $this->fleetPoints = $value > $this->maxPoints ? $this->maxPoints : $value;
    }

    // resources (0-369)
    // 11-369 normal (10-50)
    // 1-10 large (50-100)
    // 0 very large (100-200)
    // -> 4-6 metal (3/6) => factor 1-3
    // -> 2-3 crystal (2/6) => factor 1-2
    // -> 1 deuterium (1/6) => factor 1
    // maxFactor>[100000000,75000000,50000000,25000000,5000000,1000000,100000,0] => [25000,21000,18000,15000,12000,9000,6000,2400]
    public function getPossibleRess()
    {
        // 36000
        //

        return [
            'metal' => [
                [
                    'min' => 10 * $this->fleetPoints,
                    'avg' => 30 * $this->fleetPoints,
                    'max' => 50 * $this->fleetPoints
                ],
                [
                    'min' => 50 * $this->fleetPoints,
                    'avg' => 75 * $this->fleetPoints,
                    'max' => 100 * $this->fleetPoints
                ],
                [
                    'min' => 100 * $this->fleetPoints,
                    'avg' => 150 * $this->fleetPoints,
                    'max' => 200 * $this->fleetPoints
                ]
            ],
            'crystal' => [
                [
                    'min' => 10 * $this->fleetPoints / 2,
                    'max' => 50 * $this->fleetPoints / 2
                ],
                [
                    'min' => 50 * $this->fleetPoints / 2,
                    'max' => 100 * $this->fleetPoints / 2
                ],
                [
                    'min' => 100 * $this->fleetPoints / 2,
                    'max' => 200 * $this->fleetPoints / 2
                ]
            ],
            'deuterium' => [
                [
                    'min' => 10 * $this->fleetPoints / 3,
                    'max' => 50 * $this->fleetPoints / 3
                ],
                [
                    'min' => 50 * $this->fleetPoints / 3,
                    'max' => 100 * $this->fleetPoints / 3
                ],
                [
                    'min' => 100 * $this->fleetPoints / 3,
                    'max' => 200 * $this->fleetPoints / 3
                ]
            ]
        ];
    }
}
