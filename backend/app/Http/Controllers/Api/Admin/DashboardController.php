<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Get content publishing statistics
     */
    public function contentStats(): JsonResponse
    {
        $stats = [
            'scheduled' => Post::where('status', 'scheduled')->count(),
            'published' => Post::where('status', 'published')->count(),
            'failed' => Post::where('status', 'failed')->count(),
            'total' => Post::count(),
        ];

        return response()->json($stats);
    }

    /**
     * Get content stats per tenant
     */
    public function contentStatsByTenant(): JsonResponse
    {
        $stats = Post::select(
            'tenant_id',
            DB::raw('COUNT(*) as total_posts'),
            DB::raw('SUM(CASE WHEN status = "published" THEN 1 ELSE 0 END) as published'),
            DB::raw('SUM(CASE WHEN status = "scheduled" THEN 1 ELSE 0 END) as scheduled'),
            DB::raw('SUM(CASE WHEN status = "failed" THEN 1 ELSE 0 END) as failed')
        )
        ->groupBy('tenant_id')
        ->with('tenant:id,name')
        ->get();

        return response()->json($stats);
    }
}



