<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiKeyManagementTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;
    private string $rootApiKey;

    protected function setUp(): void
    {
        parent::setUp();

        $this->organization = Organization::create([
            'name' => 'Nexus Retail Group',
            'slug' => 'nexus-retail',
            'plan' => 'pro',
        ]);

        $keyPair = ApiKey::createKey($this->organization->id, 'Root Admin Key', ['keys:write', 'keys:read']);
        $this->rootApiKey = $keyPair['plainTextKey'];
    }

    public function test_can_list_api_keys_without_exposing_secrets(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->rootApiKey}")
            ->getJson('/api/v1/api-keys');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => [
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
                    ],
                ],
            ]);

        // Assert secret_hash is NOT present in any item of data
        $data = $response->json('data');
        $this->assertNotEmpty($data);
        foreach ($data as $keyRecord) {
            $this->assertArrayNotHasKey('secret_hash', $keyRecord);
            $this->assertArrayNotHasKey('plainTextKey', $keyRecord);
        }
    }

    public function test_can_create_new_scoped_api_key_and_receive_plaintext_secret_once(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->rootApiKey}")
            ->postJson('/api/v1/api-keys', [
                'name' => 'Invoicing Worker Key',
                'scopes' => ['snapshots:write'],
                'businessScopes' => ['biz_store_1'],
                'rateLimitPerMinute' => 120,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'id',
                'name',
                'keyPrefix',
                'plainTextKey',
                'scopes',
                'businessScopes',
                'createdAt',
            ]);

        $createdKeyId = $response->json('id');
        $plainTextKey = $response->json('plainTextKey');

        $this->assertStringStartsWith('cta_live_', $plainTextKey);

        // Verify the newly created key can authenticate successfully
        $authTest = $this->withHeader('Authorization', "Bearer {$plainTextKey}")
            ->getJson('/api/v1/api-keys');
        // This key only has 'snapshots:write', so accessing /api/v1/api-keys (keys:read) should return 403 Forbidden
        $authTest->assertStatus(403);
    }

    public function test_can_revoke_api_key(): void
    {
        $keyPair = ApiKey::createKey($this->organization->id, 'Temporary Key', ['snapshots:read']);

        $response = $this->withHeader('Authorization', "Bearer {$this->rootApiKey}")
            ->deleteJson("/api/v1/api-keys/{$keyPair['apiKey']->id}");

        $response->assertStatus(200);

        $this->assertNotNull($keyPair['apiKey']->fresh()->revoked_at);

        // Revoked key cannot authenticate
        $revokedAuth = $this->withHeader('Authorization', "Bearer {$keyPair['plainTextKey']}")
            ->getJson('/api/v1/api-keys');
        $revokedAuth->assertStatus(401);
    }
}
