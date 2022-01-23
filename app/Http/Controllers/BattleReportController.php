<?php

namespace App\Http\Controllers;

use App\Models\BattleReport;
use Carbon\Carbon;
use Illuminate\Http\Request;

class BattleReportController extends Controller
{
    public function store(Request $request)
    {
        if (!$battleReport = BattleReport::query()->where('report_id', $request->get('id'))->first()) {
            $battleReport = new BattleReport();
            $battleReport->report_id = $request->get('report_id');
        }

        $battleReport->reported_by = auth()->id();
        $battleReport->coordinates = $request->get('galaxy') . ':' . $request->get('system') . ':' . $request->get('planet');
        $battleReport->galaxy = $request->get('galaxy');
        $battleReport->system = $request->get('system');
        $battleReport->planet = $request->get('planet');
        $battleReport->attacker_lost = $request->get('attacker_lost', 0);
        $battleReport->defender_lost = $request->get('defender_lost', 0);
        $battleReport->metal = $request->get('metal', 0);
        $battleReport->crystal = $request->get('crystal', 0);
        $battleReport->deuterium = $request->get('deuterium', 0);
        $battleReport->debris_metal = $request->get('debris_metal', 0);
        $battleReport->debris_crystal = $request->get('crystal_metal', 0);
        $battleReport->created_at = Carbon::parse($request->get('timestamp'));
        $battleReport->save();

        return response([]);
    }
}
