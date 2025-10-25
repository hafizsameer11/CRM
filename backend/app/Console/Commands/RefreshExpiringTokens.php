<?php

namespace App\Console\Commands;

use App\Jobs\RefreshChannelToken;
use App\Models\Channel;
use Illuminate\Console\Command;

class RefreshExpiringTokens extends Command
{
    protected $signature = 'channels:refresh-tokens';

    protected $description = 'Refresh access tokens for channels that are about to expire';

    public function handle(): int
    {
        $channels = Channel::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now()->addDays(5))
            ->get();

        $this->info("Found {$channels->count()} channels with expiring tokens");

        foreach ($channels as $channel) {
            RefreshChannelToken::dispatch($channel);
            $this->line("Dispatched refresh job for channel {$channel->id} ({$channel->type})");
        }

        $this->info('Token refresh jobs dispatched successfully');

        return Command::SUCCESS;
    }
}

