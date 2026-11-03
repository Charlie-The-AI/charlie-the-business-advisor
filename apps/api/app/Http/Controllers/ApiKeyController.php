<?php

namespace App\Http\Controllers;

use App\Models\ApiKey;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyController extends Controller
{
    /**
     * Lists all API credentials for the authenticated organization.
     */
    public function index(Request $request): JsonResponse
    {
        $organization = $request->attributes->get('organization');

        $keys = ApiKey::where('organization_id', $organization->id)
            ->latest()
            ->get([
                'id',
                'name',
                'key_prefix',
                'scopes',
                'business_scopes',
                'rate_limit_per_minute',
                'last_used_at',
                'expires_at',
                'revoked_at',
                'created_at',
            ]);

        return response()->json(['data' => $keys]);
    }

    /**
     * Creates a new scoped API key, returning the plaintext key once.
     */
    public function store(Request $request): JsonResponse
    {
        $organization = $request->attributes->get('organization');
        $currentApiKey = $request->attributes->get('apiKey');

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'scopes' => 'nullable|array',
            'scopes.*' => 'string|in:*,snapshots:write,snapshots:read,recommendations:write,recommendations:read,keys:write,keys:read',
            'businessScopes' => 'nullable|array',
            'businessScopes.*' => 'string',
            'rateLimitPerMinute' => 'nullable|integer|min:10|max:1000',
            'expiresAt' => 'nullable|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'validation_failed',
                'details' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $scopes = $request->input('scopes') ?? ['snapshots:write', 'snapshots:read', 'recommendations:read'];
        $businessScopes = $request->input('businessScopes') ?? ['*'];

        $result = ApiKey::createKey(
            organizationId: $organization->id,
            name: $request->input('name'),
            scopes: $scopes,
            businessScopes: $businessScopes,
            rateLimit: $request->input('rateLimitPerMinute') ?? 60,
            expiresAt: $request->input('expiresAt') ? new \DateTime($request->input('expiresAt')) : null
        );

        // Audit log
        AuditLog::create([
            'organization_id' => $organization->id,
            'actor_type' => 'api_key',
            'actor_id' => $currentApiKey ? $currentApiKey->id : 'system',
            'action' => 'api_key_created',
            'ip_address' => $request->ip(),
            'details' => [
                'key_id' => $result['apiKey']->id,
                'name' => $result['apiKey']->name,
                'scopes' => $scopes,
            ],
        ]);

        return response()->json([
            'message' => 'API Key created successfully. Store the secret key securely; it will not be displayed again.',
            'id' => $result['apiKey']->id,
            'name' => $result['apiKey']->name,
            'keyPrefix' => $result['apiKey']->key_prefix,
            'plainTextKey' => $result['plainTextKey'],
            'scopes' => $result['apiKey']->scopes,
            'businessScopes' => $result['apiKey']->business_scopes,
            'createdAt' => $result['apiKey']->created_at->toISOString(),
        ], Response::HTTP_CREATED);
    }

    /**
     * Revokes an API key.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $organization = $request->attributes->get('organization');
        $currentApiKey = $request->attributes->get('apiKey');

        $apiKey = ApiKey::where('id', $id)
            ->where('organization_id', $organization->id)
            ->first();

        if (!$apiKey) {
            return response()->json([
                'error' => 'not_found',
                'message' => 'API key not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $apiKey->revoke();

        AuditLog::create([
            'organization_id' => $organization->id,
            'actor_type' => 'api_key',
            'actor_id' => $currentApiKey ? $currentApiKey->id : 'system',
            'action' => 'api_key_revoked',
            'ip_address' => $request->ip(),
            'details' => ['revoked_key_id' => $apiKey->id],
        ]);

        return response()->json([
            'message' => "API key '{$apiKey->name}' revoked successfully.",
        ]);
    }
}
