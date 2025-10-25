<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class ScrubSensitiveData
{
    private array $sensitiveKeys = [
        'password',
        'password_confirmation',
        'token',
        'access_token',
        'refresh_token',
        'secret',
        'api_key',
        'stripe_key',
        'card_number',
        'cvv',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        // Override log context to scrub sensitive data
        Log::shareContext([
            'request_data' => $this->scrub($request->except($this->sensitiveKeys)),
        ]);

        return $next($request);
    }

    private function scrub(array $data): array
    {
        foreach ($data as $key => $value) {
            if (is_array($value)) {
                $data[$key] = $this->scrub($value);
            } elseif (in_array(strtolower($key), $this->sensitiveKeys)) {
                $data[$key] = '[REDACTED]';
            }
        }

        return $data;
    }
}

