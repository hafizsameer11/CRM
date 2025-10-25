<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Conversation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConversationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->_tenant_id;

        $query = Conversation::where('tenant_id', $tenantId)
            ->with(['channel', 'assignedUser']);

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('channel_id')) {
            $query->where('channel_id', $request->channel_id);
        }

        if ($request->has('assigned_to')) {
            $query->where('assigned_to', $request->assigned_to);
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'last_message_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 20);
        $conversations = $query->paginate($perPage);

        return response()->json($conversations);
    }

    public function show(int $id, Request $request): JsonResponse
    {
        $tenantId = $request->_tenant_id;

        $conversation = Conversation::where('tenant_id', $tenantId)
            ->with([
                'channel',
                'assignedUser',
                'messages' => fn($q) => $q->orderBy('created_at', 'desc')->limit(50),
            ])
            ->findOrFail($id);

        return response()->json($conversation);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:open,closed,pending',
            'assigned_to' => 'sometimes|nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = $request->_tenant_id;
        $conversation = Conversation::where('tenant_id', $tenantId)->findOrFail($id);

        $conversation->update($request->only(['status', 'assigned_to']));

        $actor = auth('api')->user();
        ActivityLog::log($actor, 'update_conversation', 'Conversation', $conversation->id, [
            'changes' => $request->only(['status', 'assigned_to']),
        ]);

        return response()->json($conversation);
    }
}

