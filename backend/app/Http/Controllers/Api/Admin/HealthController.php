<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Tenant;
use App\Models\WebhookEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;

class HealthController extends Controller
{
    public function index(): JsonResponse
    {
        $health = [
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'database' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
            'queue' => $this->getQueueStats(),
            'system' => $this->getSystemStats(),
        ];

        return response()->json($health);
    }

    private function checkDatabase(): array
    {
        try {
            DB::connection()->getPdo();
            $dbSize = DB::table('information_schema.tables')
                ->where('table_schema', config('database.connections.mysql.database'))
                ->sum('data_length');

            return [
                'status' => 'connected',
                'size_mb' => round($dbSize / 1024 / 1024, 2),
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    private function checkRedis(): array
    {
        try {
            Redis::ping();
            return ['status' => 'connected'];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
            ];
        }
    }

    private function getQueueStats(): array
    {
        try {
            $pending = WebhookEvent::where('status', 'pending')->count();
            $processing = WebhookEvent::where('status', 'processing')->count();
            $failed = WebhookEvent::where('status', 'failed')
                ->where('created_at', '>=', now()->subHour())
                ->count();

            return [
                'pending_webhooks' => $pending,
                'processing_webhooks' => $processing,
                'failed_webhooks_last_hour' => $failed,
            ];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    private function getSystemStats(): array
    {
        return [
            'total_tenants' => Tenant::count(),
            'active_tenants' => Tenant::where('status', 'active')->count(),
            'total_channels' => Channel::count(),
            'active_channels' => Channel::where('status', 'active')->count(),
            'total_conversations' => Conversation::count(),
            'open_conversations' => Conversation::where('status', 'open')->count(),
            'messages_today' => Message::whereDate('created_at', today())->count(),
            'messages_last_hour' => Message::where('created_at', '>=', now()->subHour())->count(),
        ];
    }
}

