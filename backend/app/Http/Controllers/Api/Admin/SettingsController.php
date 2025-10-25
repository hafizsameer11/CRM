<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::where('scope', 'system')
            ->whereNull('tenant_id')
            ->get()
            ->pluck('value', 'key');

        return response()->json($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $admin = auth('admin')->user();

        foreach ($request->settings as $key => $value) {
            Setting::setSystem($key, $value);

            ActivityLog::log($admin, 'update_system_setting', 'Setting', null, [
                'key' => $key,
            ]);
        }

        return response()->json([
            'message' => 'Settings updated successfully',
            'settings' => $request->settings,
        ]);
    }

    public function show(string $key): JsonResponse
    {
        $value = Setting::getSystem($key);

        if ($value === null) {
            return response()->json(['error' => 'Setting not found'], 404);
        }

        return response()->json([
            'key' => $key,
            'value' => $value,
        ]);
    }
}

