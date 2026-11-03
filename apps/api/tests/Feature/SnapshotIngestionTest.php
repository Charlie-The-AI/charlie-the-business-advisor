<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use App\Models\Business;
use App\Models\Organization;
use App\Models\UsageRecord;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SnapshotIngestionTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;
    private Business $business;
    private string $apiKey;

    protected function setUp(): void
    {
        parent::setUp();

        $this->organization = Organization::create([
            'name' => 'SolarTech Africa',
            'slug' => 'solartech-africa',
            'plan' => 'growth',
            'monthly_snapshot_quota' => 5,
        ]);

        $this->business = Business::create([
            'id' => 'biz_solar_lagos',
            'organization_id' => $this->organization->id,
            'name' => 'SolarTech Lagos Store',
            'currency' => 'NGN',
        ]);

        $keyPair = ApiKey::createKey($this->organization->id, 'Ingestion Key', ['snapshots:write', 'snapshots:read']);
        $this->apiKey = $keyPair['plainTextKey'];
    }

    private function getValidPayload(string $snapshotId = 'snap_test_001'): array
    {
        return [
            'schemaVersion' => '1.0.0',
            'calculationVersion' => '1.0.0',
            'snapshotId' => $snapshotId,
            'businessId' => $this->business->id,
            'currency' => 'NGN',
            'createdAt' => now()->toISOString(),
            'period' => [
                'from' => '2026-03-01T00:00:00Z',
                'to' => '2026-03-31T23:59:59Z',
            ],
            'sales' => [
                'netRevenueMinorUnits' => 25000000,
                'grossSalesMinorUnits' => 26000000,
                'totalOrders' => 10,
                'totalCompletedOrders' => 8,
                'averageOrderValueMinorUnits' => 3125000,
            ],
            'pareto' => [
                'products' => ['contributors' => []],
                'customers' => ['contributors' => []],
                'categories' => ['contributors' => []],
            ],
            'customers' => [
                'uniqueCustomersCount' => 7,
                'repeatPurchaseRatePercentage' => 28.5,
            ],
            'products' => [
                'totalProductsSold' => 5,
                'missingCostProductCount' => 0,
            ],
            'trends' => [
                'anomalies' => [],
            ],
            'dataQuality' => [
                'scorePercentage' => 100,
                'warnings' => [],
            ],
        ];
    }

    public function test_ingests_valid_analytics_snapshot_successfully(): void
    {
        $payload = $this->getValidPayload();

        $response = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->postJson('/api/v1/analytics/snapshots', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'status' => 'created',
                'snapshotId' => 'snap_test_001',
                'businessId' => $this->business->id,
            ]);

        $this->assertDatabaseHas('analytics_snapshots', [
            'snapshot_id' => 'snap_test_001',
            'business_id' => $this->business->id,
            'currency' => 'NGN',
            'net_revenue_minor_units' => 25000000,
        ]);

        $this->assertDatabaseHas('usage_records', [
            'organization_id' => $this->organization->id,
            'metric' => 'snapshot_ingestion',
        ]);
    }

    public function test_enforces_idempotency_within_24_hours(): void
    {
        $payload = $this->getValidPayload('snap_idempotent_01');

        // First call
        $res1 = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->withHeader('Idempotency-Key', 'idemp_key_123')
            ->postJson('/api/v1/analytics/snapshots', $payload);

        $res1->assertStatus(201);

        // Second call with same idempotency key
        $res2 = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->withHeader('Idempotency-Key', 'idemp_key_123')
            ->postJson('/api/v1/analytics/snapshots', $payload);

        $res2->assertStatus(200)
            ->assertJson([
                'status' => 'accepted_idempotent',
                'snapshotId' => 'snap_idempotent_01',
            ]);

        // Verify only 1 database record exists
        $this->assertEquals(1, \App\Models\AnalyticsSnapshot::where('snapshot_id', 'snap_idempotent_01')->count());
    }

    public function test_enforces_monthly_organization_quota(): void
    {
        // Organization quota is 5. Insert 5 usage records for this month
        for ($i = 0; $i < 5; $i++) {
            UsageRecord::create([
                'organization_id' => $this->organization->id,
                'business_id' => $this->business->id,
                'metric' => 'snapshot_ingestion',
                'quantity' => 1,
            ]);
        }

        $payload = $this->getValidPayload('snap_over_quota');

        $response = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->postJson('/api/v1/analytics/snapshots', $payload);

        $response->assertStatus(429)
            ->assertJson([
                'error' => 'quota_exceeded',
            ]);
    }

    public function test_rejects_malformed_payload(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->postJson('/api/v1/analytics/snapshots', [
                'businessId' => $this->business->id,
                // Missing required sales, snapshotId, period, etc.
            ]);

        $response->assertStatus(422)
            ->assertJson(['error' => 'validation_failed']);
    }
}
