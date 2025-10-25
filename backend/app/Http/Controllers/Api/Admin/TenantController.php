<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TenantController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Tenant::query()->with(['users', 'activeSubscription.plan']);

        // Filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('per_page', 15);
        $tenants = $query->paginate($perPage);

        return response()->json($tenants);
    }

    public function show(int $id): JsonResponse
    {
        $tenant = Tenant::with([
            'users',
            'channels',
            'subscriptions.plan',
            'conversations',
            'usageRecords' => function ($query) {
                $query->where('period_date', '>=', now()->subDays(30));
            },
        ])->findOrFail($id);

        return response()->json($tenant);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,restricted,suspended',
            'reason' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $tenant = Tenant::findOrFail($id);
        $oldStatus = $tenant->status;

        $tenant->update(['status' => $request->status]);

        $admin = auth('admin')->user();
        ActivityLog::log($admin, 'update_tenant_status', 'Tenant', $tenant->id, [
            'old_status' => $oldStatus,
            'new_status' => $request->status,
            'reason' => $request->reason,
        ]);

        return response()->json([
            'message' => 'Tenant status updated successfully',
            'tenant' => $tenant,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $tenant = Tenant::findOrFail($id);

        $admin = auth('admin')->user();
        ActivityLog::log($admin, 'delete_tenant', 'Tenant', $tenant->id, [
            'tenant_name' => $tenant->name,
        ]);

        $tenant->delete();

        return response()->json(['message' => 'Tenant deleted successfully']);
    }
}

