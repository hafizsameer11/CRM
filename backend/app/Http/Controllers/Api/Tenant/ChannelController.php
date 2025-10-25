<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Channel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChannelController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->_tenant_id;

        $channels = Channel::where('tenant_id', $tenantId)
            ->when($request->has('type'), fn($q) => $q->where('type', $request->type))
            ->when($request->has('status'), fn($q) => $q->where('status', $request->status))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($channels);
    }

    public function show(int $id, Request $request): JsonResponse
    {
        $tenantId = $request->_tenant_id;

        $channel = Channel::where('tenant_id', $tenantId)
            ->with(['conversations' => fn($q) => $q->latest()->limit(10)])
            ->findOrFail($id);

        return response()->json($channel);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $tenantId = $request->_tenant_id;
        $channel = Channel::where('tenant_id', $tenantId)->findOrFail($id);

        $actor = auth('api')->user();
        ActivityLog::log($actor, 'delete_channel', 'Channel', $channel->id, [
            'type' => $channel->type,
        ]);

        $channel->delete();

        return response()->json(['message' => 'Channel deleted successfully']);
    }

    public function refreshToken(Request $request, int $id): JsonResponse
    {
        $tenantId = $request->_tenant_id;
        $channel = Channel::where('tenant_id', $tenantId)->findOrFail($id);

        // This will be handled by a job to refresh the token
        // For now, we'll just dispatch the job
        \App\Jobs\RefreshChannelToken::dispatch($channel);

        return response()->json([
            'message' => 'Token refresh initiated',
            'channel' => $channel,
        ]);
    }
}

