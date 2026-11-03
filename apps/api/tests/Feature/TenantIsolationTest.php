<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use App\Models\Business;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TenantIsolationTest extends TestCase
{
    use RefreshDatabase;

    private Organization $orgA;
    private Business $bizA;
    private string $keyA;

    private Organization $orgB;
    private Business $bizB;
    private string $keyB;

    protected function setUp(): void
    {
        parent::setUp();

        // Organization A & Business A
        $this->orgA = Organization::create([
            'name' => 'Company A',
            'slug' => 'company-a',
            'plan' => 'growth',
        ]);
        $this->bizA = Business::create([
            'id' => 'biz_a_store',
            'organization_id' => $this->orgA->id,
            'name' => 'Store A',
            'currency' => 'NGN',
        ]);
        $resA = ApiKey::createKey($this->orgA->id, 'Key A', ['*']);
        $this->keyA = $resA['plainTextKey'];

        // Organization B & Business B
        $this->orgB = Organization::create([
            'name' => 'Company B',
            'slug' => 'company-b',
            'plan' => 'growth',
        ]);
        $this->bizB = Business::create([
            'id' => 'biz_b_store',
            'organization_id' => $this->orgB->id,
            'name' => 'Store B',
            'currency' => 'USD',
        ]);
        $resB = ApiKey::createKey($this->orgB->id, 'Key B', ['*']);
        $this->keyB = $resB['plainTextKey'];
    }

    public function test_organization_a_cannot_access_organization_b_business(): void
    {
        // Key A requests Business B's snapshots
        $response = $this->withHeader('Authorization', "Bearer {$this->keyA}")
            ->getJson("/api/v1/businesses/{$this->bizB->id}/snapshots");

        // Must reject: Business B does not belong to Organization A
        $response->assertStatus(404)
            ->assertJson(['error' => 'not_found']);
    }

    public function test_organization_a_cannot_ingest_snapshot_for_organization_b_business(): void
    {
        $payload = [
            'schemaVersion' => '1.0.0',
            'calculationVersion' => '1.0.0',
            'snapshotId' => 'snap_cross_tenant_test',
            'businessId' => $this->bizB->id, // Attempting to inject into Org B's business!
            'currency' => 'USD',
            'createdAt' => now()->toISOString(),
            'period' => [
                'from' => now()->subDays(30)->toISOString(),
                'to' => now()->toISOString(),
            ],
            'sales' => [
                'netRevenueMinorUnits' => 100000,
                'grossSalesMinorUnits' => 100000,
                'totalOrders' => 1,
                'totalCompletedOrders' => 1,
                'averageOrderValueMinorUnits' => 100000,
            ],
            'pareto' => [],
            'customers' => [],
            'products' => [],
            'trends' => [],
            'dataQuality' => ['scorePercentage' => 100],
        ];

        // Key A tries to ingest into Biz B
        $response = $this->withHeader('Authorization', "Bearer {$this->keyA}")
            ->postJson('/api/v1/analytics/snapshots', $payload);

        // Must reject with 404
        $response->assertStatus(404)
            ->assertJson(['error' => 'not_found']);
    }

    public function test_organization_a_cannot_access_organization_b_recommendations(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->keyA}")
            ->getJson("/api/v1/businesses/{$this->bizB->id}/recommendations");

        $response->assertStatus(404);
    }
}
