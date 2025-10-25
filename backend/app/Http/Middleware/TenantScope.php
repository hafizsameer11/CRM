<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class TenantScope
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($user = auth('api')->user()) {
            // Store tenant ID in request for easy access
            $request->merge(['_tenant_id' => $user->tenant_id]);
        }

        return $next($request);
    }
}

