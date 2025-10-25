<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessWhatsAppWebhook;
use App\Models\Setting;
use App\Models\WebhookEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    public function verify(Request $request): JsonResponse|string
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        $verifyToken = Setting::getSystem('WHATSAPP_VERIFY_TOKEN')['value'] ?? config('services.whatsapp.verify_token');

        if ($mode === 'subscribe' && $token === $verifyToken) {
            Log::info('WhatsApp webhook verified successfully');
            return response($challenge, 200)->header('Content-Type', 'text/plain');
        }

        Log::warning('WhatsApp webhook verification failed', [
            'mode' => $mode,
            'token' => $token ? 'present' : 'missing',
        ]);

        return response()->json(['error' => 'Verification failed'], 403);
    }

    public function handle(Request $request): JsonResponse
    {
        // Verify signature (same as Meta)
        if (!$this->verifySignature($request)) {
            Log::warning('Invalid WhatsApp webhook signature', [
                'ip' => $request->ip(),
                'signature' => $request->header('X-Hub-Signature-256'),
            ]);
            return response()->json(['error' => 'Invalid signature'], 403);
        }

        $payload = $request->all();

        // Create webhook event record
        $webhookEvent = WebhookEvent::create([
            'provider' => 'whatsapp',
            'signature' => $request->header('X-Hub-Signature-256'),
            'payload' => $payload,
            'status' => 'pending',
        ]);

        // Dispatch job to process webhook asynchronously
        ProcessWhatsAppWebhook::dispatch($webhookEvent);

        // Respond immediately to WhatsApp
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

