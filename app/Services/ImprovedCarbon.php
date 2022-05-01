<?php

namespace App\Services;

use Carbon\Carbon;

class ImprovedCarbon
{
    public static function parse($string): Carbon
    {
        $replaceStrings = [
            ' Jan 2022,' => '01.2022',
            ' Feb 2022,' => '02.2022',
            ' Mär 2022,' => '03.2022',
            ' Apr 2022,' => '04.2022',
            ' Mai 2022,' => '05.2022',
            ' Jun 2022,' => '06.2022',
            ' Jul 2022,' => '07.2022',
            ' Aug 2022,' => '08.2022',
            ' Sep 2022,' => '09.2022',
            ' Okt 2022,' => '10.2022',
            ' Nov 2022,' => '11.2022',
            ' Dez 2022,' => '12.2022',
        ];

        foreach ($replaceStrings as $search => $replace) {
            $string = str_replace($search, $replace, $string);
        }

        return Carbon::parse($string);
    }
}
