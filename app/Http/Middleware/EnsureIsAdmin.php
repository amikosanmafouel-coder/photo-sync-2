<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureIsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // check if user is logged in and is an admin
        if (!$request->user() || $request->user()->role != 'admin') {
            return response()->json(['message' => 'Unauthorized: Admin access only'], 403);
        }
        return $next($request);
    }
}
