<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('api')->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $tenant = $user->tenant;

        if (!$tenant->isActive()) {
            $message = match ($tenant->status) {
                'suspended' => 'Your account has been suspended. Please contact support.',
                'restricted' => 'Your account has limited access. Please update your payment information.',
                default => 'Your account is not active.',
            };

            return response()->json([
                'error' => 'Account Inactive',
                'message' => $message,
                'status' => $tenant->status,
            ], 403);
        }

        return $next($request);
    }
}

