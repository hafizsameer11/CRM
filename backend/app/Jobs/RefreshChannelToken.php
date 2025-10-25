<?php

namespace App\Jobs;

use App\Models\Channel;
use App\Services\Meta\MetaOAuthService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class RefreshChannelToken implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Channel $channel
    ) {}

    public function handle(MetaOAuthService $metaService): void
    {
        try {
            if (!in_array($this->channel->type, ['facebook', 'instagram', 'whatsapp'])) {
                return;
            }

            $tokenData = $metaService->refreshAccessToken($this->channel->access_token);

            $this->channel->update([
                'access_token' => $tokenData['access_token'],
                'expires_at' => now()->addSeconds($tokenData['expires_in'] ?? 5184000),
                'status' => 'active',
            ]);

            Log::info('Channel token refreshed successfully', [
                'channel_id' => $this->channel->id,
                'type' => $this->channel->type,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to refresh channel token', [
                'channel_id' => $this->channel->id,
                'error' => $e->getMessage(),
            ]);

            $this->channel->update(['status' => 'error']);

            throw $e;
        }
    }
}

