<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Use custom Authenticate middleware for API responses
        $middleware->redirectGuestsTo(function () {
            return null; // Return JSON for API routes
        });

        $middleware->alias([
            'tenant.scope' => \App\Http\Middleware\TenantScope::class,
            'tenant.active' => \App\Http\Middleware\EnsureTenantActive::class,
            'admin.auth' => \App\Http\Middleware\EnsureAdminAuthenticated::class,
            'role' => \App\Http\Middleware\CheckRole::class,
            'scrub.sensitive' => \App\Http\Middleware\ScrubSensitiveData::class,
        ]);

        $middleware->api(prepend: [
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Handle authentication exceptions for API routes
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return response()->json([
                    'error' => 'Unauthenticated',
                    'message' => 'Please login to access this resource.',
                ], 401);
            }
        });
    })->create();
