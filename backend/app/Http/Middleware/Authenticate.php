<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        // For API requests, return null to trigger a JSON response instead of redirect
        if ($request->expectsJson() || $request->is('api/*')) {
            return null;
        }

        return route('login');
    }

    /**
     * Handle unauthenticated user.
     */
    protected function unauthenticated($request, array $guards)
    {
        // Always return JSON for API routes
        if ($request->expectsJson() || $request->is('api/*')) {
            abort(response()->json([
                'error' => 'Unauthenticated',
                'message' => 'Please login to access this resource.',
            ], 401));
        }

        parent::unauthenticated($request, $guards);
    }
}


