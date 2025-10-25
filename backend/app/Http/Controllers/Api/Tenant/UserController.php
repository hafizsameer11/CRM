<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tenantId = $request->_tenant_id;

        $users = User::where('tenant_id', $tenantId)
            ->when($request->has('role'), fn($q) => $q->where('role', $request->role))
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:owner,manager,agent',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = $request->_tenant_id;

        // Check if email exists in this tenant
        if (User::where('tenant_id', $tenantId)->where('email', $request->email)->exists()) {
            return response()->json(['error' => 'Email already exists in your organization'], 422);
        }

        $user = User::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        $actor = auth('api')->user();
        ActivityLog::log($actor, 'create_user', 'User', $user->id);

        return response()->json($user, 201);
    }

    public function show(int $id, Request $request): JsonResponse
    {
        $tenantId = $request->_tenant_id;

        $user = User::where('tenant_id', $tenantId)->findOrFail($id);

        return response()->json($user);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255',
            'role' => 'sometimes|in:owner,manager,agent',
            'password' => 'sometimes|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenantId = $request->_tenant_id;
        $user = User::where('tenant_id', $tenantId)->findOrFail($id);

        $data = $request->only(['name', 'email', 'role']);

        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        $actor = auth('api')->user();
        ActivityLog::log($actor, 'update_user', 'User', $user->id);

        return response()->json($user);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $tenantId = $request->_tenant_id;
        $user = User::where('tenant_id', $tenantId)->findOrFail($id);

        $actor = auth('api')->user();

        // Prevent self-deletion
        if ($user->id === $actor->id) {
            return response()->json(['error' => 'Cannot delete your own account'], 422);
        }

        ActivityLog::log($actor, 'delete_user', 'User', $user->id);

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }
}

