<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessMetaWebhook;
use App\Models\Setting;
use App\Models\WebhookEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MetaWebhookController extends Controller
{
    public function verify(Request $request): JsonResponse|string
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        $verifyToken = Setting::getSystem('META_VERIFY_TOKEN')['value'] ?? config('services.meta.verify_token');

        if ($mode === 'subscribe' && $token === $verifyToken) {
            Log::info('Meta webhook verified successfully');
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        Log::warning('Meta webhook verification failed', [
            'mode' => $mode,
            'token' => $token ? 'present' : 'missing',
        ]);

        return response()->json(['error' => 'Verification failed'], 403);
    }

    public function handle(Request $request): JsonResponse
    {
        // Verify signature
        if (!$this->verifySignature($request)) {
            Log::warning('Invalid webhook signature', [
                'ip' => $request->ip(),
                'signature' => $request->header('X-Hub-Signature-256'),
            ]);
            return response()->json(['error' => 'Invalid signature'], 403);
        }

        $payload = $request->all();

        // Create webhook event record
        $webhookEvent = WebhookEvent::create([
            'provider' => 'facebook',
            'signature' => $request->header('X-Hub-Signature-256'),
            'payload' => $payload,
            'status' => 'pending',
        ]);

        // Dispatch job to process webhook asynchronously
        ProcessMetaWebhook::dispatch($webhookEvent);

        // Respond immediately to Meta
        return response()->json(['status' => 'received'], 200);
    }

    private function verifySignature(Request $request): bool
    {
        $signature = $request->header('X-Hub-Signature-256');

        if (!$signature) {
            return false;
        }

        $appSecret = Setting::getSystem('META_APP_SECRET')['value'] ?? config('services.meta.app_secret');

        $expectedSignature = 'sha256=' . hash_hmac('sha256', $request->getContent(), $appSecret);

        return hash_equals($expectedSignature, $signature);
    }
}

