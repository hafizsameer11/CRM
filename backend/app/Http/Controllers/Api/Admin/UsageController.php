<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Tenant;
use App\Models\UsageRecord;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UsageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());

        // Aggregated usage by tenant
        $usage = UsageRecord::query()
            ->select('tenant_id', 'metric', DB::raw('SUM(quantity) as total'))
            ->whereBetween('period_date', [$startDate, $endDate])
            ->groupBy('tenant_id', 'metric')
            ->with('tenant:id,name,email')
            ->get()
            ->groupBy('tenant_id');

        // Overall statistics
        $stats = [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('status', 'active')->count(),
            'total_messages' => Message::whereBetween('created_at', [$startDate, $endDate])->count(),
            'usage_by_metric' => UsageRecord::query()
                ->select('metric', DB::raw('SUM(quantity) as total'))
                ->whereBetween('period_date', [$startDate, $endDate])
                ->groupBy('metric')
                ->pluck('total', 'metric'),
        ];

        return response()->json([
            'usage' => $usage,
            'stats' => $stats,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }

    public function tenant(int $tenantId, Request $request): JsonResponse
    {
        $startDate = $request->get('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->get('end_date', now()->toDateString());

        $tenant = Tenant::findOrFail($tenantId);

        $usage = UsageRecord::query()
            ->where('tenant_id', $tenantId)
            ->whereBetween('period_date', [$startDate, $endDate])
            ->orderBy('period_date', 'desc')
            ->get()
            ->groupBy('metric');

        return response()->json([
            'tenant' => $tenant,
            'usage' => $usage,
            'period' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}

