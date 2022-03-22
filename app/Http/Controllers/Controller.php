<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserRequest;
use Carbon\Carbon;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    protected $allianceIds = [12, 95];
    protected $allowedAllianceId = 12;

    public function __construct()
    {
        $apiKey = request()->get('api_key');

        /** @var User $user */
        if (!$user = User::query()->where('api_key', $apiKey)->first()) {
            Log::info('invalid API key ' . $apiKey);
            abort(422);
        }

        $user->last_activity_at = Carbon::now();
        $user->save();

        $userRequest = new UserRequest();
        $userRequest->user_id = $user->id;
        $userRequest->ip_address = request()->ip();
        $userRequest->user_agent = request()->userAgent();
        $userRequest->save();

        Auth::login($user);
    }
}
