<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use App\Models\Business;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ApiKeyAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;
    private Business $business;

    protected function setUp(): void
    {
        parent::setUp();

        $this->organization = Organization::create([
            'name' => 'Acme Holdings Ltd',
            'slug' => 'acme-holdings',
            'plan' => 'growth',
        ]);

        $this->business = Business::create([
            'id' => 'biz_acme_retail',
            'organization_id' => $this->organization->id,
            'name' => 'Acme Retail Store',
            'currency' => 'NGN',
        ]);
    }

    public function test_rejects_request_without_api_key(): void
    {
        $response = $this->getJson('/api/v1/api-keys');
        $response->assertStatus(401)
            ->assertJson(['error' => 'unauthorized']);
    }

    public function test_rejects_malformed_api_key(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer invalid_key_format')
            ->getJson('/api/v1/api-keys');

        $response->assertStatus(401)
            ->assertJson(['error' => 'invalid_api_key']);
    }

    public function test_rejects_revoked_api_key(): void
    {
        $result = ApiKey::createKey(
            organizationId: $this->organization->id,
            name: 'Revoked Key',
            scopes: ['*']
        );

        $result['apiKey']->revoke();

        $response = $this->withHeader('Authorization', "Bearer {$result['plainTextKey']}")
            ->getJson('/api/v1/api-keys');

        $response->assertStatus(401);
    }

    public function test_rejects_expired_api_key(): void
    {
        $result = ApiKey::createKey(
            organizationId: $this->organization->id,
            name: 'Expired Key',
            scopes: ['*'],
            expiresAt: now()->subDay()
        );

        $response = $this->withHeader('Authorization', "Bearer {$result['plainTextKey']}")
            ->getJson('/api/v1/api-keys');

        $response->assertStatus(401);
    }

    public function test_enforces_required_permission_scopes(): void
    {
        // Key has ONLY 'snapshots:read'
        $result = ApiKey::createKey(
            organizationId: $this->organization->id,
            name: 'Read Only Key',
            scopes: ['snapshots:read']
        );

        // Attempting POST snapshots:write should be forbidden
        $response = $this->withHeader('Authorization', "Bearer {$result['plainTextKey']}")
            ->postJson('/api/v1/analytics/snapshots', ['businessId' => $this->business->id]);

        $response->assertStatus(403)
            ->assertJson(['error' => 'forbidden']);
    }

    public function test_enforces_business_scoping(): void
    {
        // Key scoped strictly to biz_other
        $result = ApiKey::createKey(
            organizationId: $this->organization->id,
            name: 'Scoped Key',
            scopes: ['snapshots:read'],
            businessScopes: ['biz_other_only']
        );

        $response = $this->withHeader('Authorization', "Bearer {$result['plainTextKey']}")
            ->getJson("/api/v1/businesses/{$this->business->id}/snapshots");

        $response->assertStatus(403)
            ->assertJson(['error' => 'forbidden']);
    }

    public function test_accepts_valid_key_and_records_last_used(): void
    {
        $result = ApiKey::createKey(
            organizationId: $this->organization->id,
            name: 'Valid Key',
            scopes: ['*']
        );

        $response = $this->withHeader('Authorization', "Bearer {$result['plainTextKey']}")
            ->getJson('/api/v1/api-keys');

        $response->assertStatus(200);

        $apiKey = $result['apiKey']->fresh();
        $this->assertNotNull($apiKey->last_used_at);
    }
}
