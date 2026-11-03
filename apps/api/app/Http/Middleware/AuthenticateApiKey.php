<?php

namespace App\Http\Middleware;

use App\Models\ApiKey;
use App\Models\Business;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiKey
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string|null  $requiredScope
     */
    public function handle(Request $request, Closure $next, ?string $requiredScope = null): Response
    {
        // 1. Extract API key from Authorization header or X-API-Key
        $token = $this->extractToken($request);

        if (!$token) {
            return response()->json([
                'error' => 'unauthorized',
                'message' => 'Missing API credential. Provide a valid Bearer token or X-API-Key header.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // 2. Validate token structure
        if (!preg_match('/^cta_(live|test)_[a-zA-Z0-9]+_[a-zA-Z0-9]+$/', $token)) {
            return response()->json([
                'error' => 'invalid_api_key',
                'message' => 'The provided API key format is invalid.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // 3. Find active key
        $apiKey = ApiKey::findActiveKey($token);

        if (!$apiKey) {
            return response()->json([
                'error' => 'unauthorized',
                'message' => 'The provided API key is invalid, expired, or revoked.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        // 4. Check scope if required
        if ($requiredScope && !$apiKey->hasScope($requiredScope)) {
            return response()->json([
                'error' => 'forbidden',
                'message' => "Insufficient permissions. This endpoint requires the '{$requiredScope}' scope.",
            ], Response::HTTP_FORBIDDEN);
        }

        // 5. Check business scoping if business_id is in route or body
        $businessId = $request->route('businessId')
            ?? $request->route('business_id')
            ?? $request->input('businessId')
            ?? $request->input('business_id');

        if ($businessId) {
            if (!$apiKey->allowsBusiness($businessId)) {
                return response()->json([
                    'error' => 'forbidden',
                    'message' => "The API key is not authorized for business '{$businessId}'.",
                ], Response::HTTP_FORBIDDEN);
            }

            // Verify the business actually belongs to the key's organization (Tenant Isolation!)
            $business = Business::where('id', $businessId)
                ->where('organization_id', $apiKey->organization_id)
                ->first();

            if (!$business) {
                return response()->json([
                    'error' => 'not_found',
                    'message' => "Business '{$businessId}' not found within the authorized organization.",
                ], Response::HTTP_NOT_FOUND);
            }

            $request->attributes->set('business', $business);
        }

        // 6. Record last used
        $apiKey->recordUsage();

        // 7. Attach context to request
        $request->attributes->set('apiKey', $apiKey);
        $request->attributes->set('organization', $apiKey->organization);

        return $next($request);
    }

    private function extractToken(Request $request): ?string
    {
        $header = $request->header('Authorization');
        if ($header && preg_match('/Bearer\s+(\S+)/', $header, $matches)) {
            return $matches[1];
        }

        $xApiKey = $request->header('X-API-Key');
        if ($xApiKey) {
            return trim($xApiKey);
        }

        return null;
    }
}
