<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Channel;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $tenantId = $request->_tenant_id;

        // Messages today
        $messagesToday = Message::whereHas('conversation', function ($query) use ($tenantId) {
            $query->where('tenant_id', $tenantId);
        })->whereDate('created_at', today())->count();

        // Active conversations
        $activeConversations = Conversation::where('tenant_id', $tenantId)
            ->where('status', 'open')
            ->count();

        // Connected channels
        $connectedChannels = Channel::where('tenant_id', $tenantId)
            ->where('status', 'active')
            ->count();

        // Average response time (in minutes)
        $avgResponseTime = $this->calculateAverageResponseTime($tenantId);

        // Messages chart data (last 7 days)
        $messagesChart = $this->getMessagesChartData($tenantId);

        return response()->json([
            'messages_today' => $messagesToday,
            'active_conversations' => $activeConversations,
            'connected_channels' => $connectedChannels,
            'avg_response_time' => $avgResponseTime,
            'messages_chart' => $messagesChart,
        ]);
    }

    private function calculateAverageResponseTime(int $tenantId): string
    {
        // Get conversations with messages
        $conversations = Conversation::where('tenant_id', $tenantId)
            ->where('created_at', '>=', now()->subDays(7))
            ->with(['messages' => function ($query) {
                $query->orderBy('created_at', 'asc')->limit(10);
            }])
            ->get();

        $totalResponseTime = 0;
        $responseCount = 0;

        foreach ($conversations as $conversation) {
            $messages = $conversation->messages;
            
            for ($i = 0; $i < count($messages) - 1; $i++) {
                if ($messages[$i]->direction === 'in' && $messages[$i + 1]->direction === 'out') {
                    $responseTime = $messages[$i + 1]->created_at->diffInMinutes($messages[$i]->created_at);
                    $totalResponseTime += $responseTime;
                    $responseCount++;
                }
            }
        }

        if ($responseCount === 0) {
            return '0m';
        }

        $avgMinutes = round($totalResponseTime / $responseCount);

        if ($avgMinutes < 60) {
            return $avgMinutes . 'm';
        }

        $hours = floor($avgMinutes / 60);
        $minutes = $avgMinutes % 60;

        return $hours . 'h ' . $minutes . 'm';
    }

    private function getMessagesChartData(int $tenantId): array
    {
        $data = [];
        $days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $count = Message::whereHas('conversation', function ($query) use ($tenantId) {
                $query->where('tenant_id', $tenantId);
            })->whereDate('created_at', $date)->count();

            $data[] = [
                'name' => $days[$date->dayOfWeek],
                'messages' => $count,
            ];
        }

        return $data;
    }
}


