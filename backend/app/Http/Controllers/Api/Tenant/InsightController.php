<?php

namespace App\Http\Controllers\Api\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Insight;
use App\Models\Channel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class InsightController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $channelId = $request->channel_id;
        $period = $request->period ?? '7d'; // 7d, 30d, 90d

        if (!$channelId) {
            return response()->json(['error' => 'channel_id is required'], 400);
        }

        $channel = Channel::findOrFail($channelId);

        $days = match($period) {
            '7d' => 7,
            '30d' => 30,
            '90d' => 90,
            default => 7,
        };

        $startDate = now()->subDays($days);
        $endDate = now();

        // Get all metrics for the period
        $insights = Insight::forChannel($channelId)
            ->betweenDates($startDate, $endDate)
            ->orderBy('date')
            ->get()
            ->groupBy('metric');

        $result = [];

        foreach ($insights as $metric => $data) {
            $values = $data->pluck('value', 'date')->toArray();
            
            $result[$metric] = [
                'current' => $data->last()?->value ?? 0,
                'previous' => $data->first()?->value ?? 0,
                'change' => $this->calculateChange(
                    $data->first()?->value ?? 0,
                    $data->last()?->value ?? 0
                ),
                'data' => $values,
            ];
        }

        return response()->json([
            'channel' => $channel,
            'period' => $period,
            'metrics' => $result,
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $channelIds = $request->channel_ids ?? [];

        if (empty($channelIds)) {
            // Get all tenant channels
            $channelIds = Channel::pluck('id')->toArray();
        }

        $startDate = now()->subDays(30);
        $endDate = now();

        $summary = [];

        foreach ($channelIds as $channelId) {
            $channel = Channel::find($channelId);

            if (!$channel) {
                continue;
            }

            $metrics = Insight::forChannel($channelId)
                ->betweenDates($startDate, $endDate)
                ->get()
                ->groupBy('metric');

            $channelSummary = [
                'channel_id' => $channelId,
                'channel_name' => $channel->identifiers['page_name'] ?? $channel->identifiers['username'] ?? 'Unknown',
                'channel_type' => $channel->type,
            ];

            foreach ($metrics as $metric => $data) {
                $channelSummary[$metric] = [
                    'total' => $data->sum('value'),
                    'average' => round($data->avg('value'), 2),
                    'latest' => $data->last()?->value ?? 0,
                ];
            }

            $summary[] = $channelSummary;
        }

        return response()->json(['summary' => $summary]);
    }

    public function topPosts(Request $request): JsonResponse
    {
        $channelId = $request->channel_id;
        $limit = $request->limit ?? 10;

        $query = \App\Models\Post::where('status', 'published')
            ->whereNotNull('provider_post_id')
            ->orderBy('likes_count', 'desc')
            ->orderBy('comments_count', 'desc')
            ->orderBy('reach', 'desc')
            ->limit($limit);

        if ($channelId) {
            $query->where('channel_id', $channelId);
        }

        $posts = $query->get();

        return response()->json(['posts' => $posts]);
    }

    protected function calculateChange(float $previous, float $current): array
    {
        if ($previous == 0) {
            return [
                'value' => $current > 0 ? 100 : 0,
                'percentage' => $current > 0 ? 100 : 0,
                'direction' => $current > 0 ? 'up' : 'neutral',
            ];
        }

        $change = $current - $previous;
        $percentage = ($change / $previous) * 100;

        return [
            'value' => round($change, 2),
            'percentage' => round($percentage, 2),
            'direction' => $change > 0 ? 'up' : ($change < 0 ? 'down' : 'neutral'),
        ];
    }
}


