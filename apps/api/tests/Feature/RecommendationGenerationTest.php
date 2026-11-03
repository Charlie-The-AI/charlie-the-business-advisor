<?php

namespace Tests\Feature;

use App\Jobs\GenerateRecommendationsJob;
use App\Models\AnalyticsSnapshot;
use App\Models\ApiKey;
use App\Models\Business;
use App\Models\Organization;
use App\Models\Recommendation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RecommendationGenerationTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;
    private Business $business;
    private AnalyticsSnapshot $snapshot;
    private string $apiKey;

    protected function setUp(): void
    {
        parent::setUp();

        $this->organization = Organization::create([
            'name' => 'Lagos Solar Hub',
            'slug' => 'lagos-solar',
            'plan' => 'pro',
        ]);

        $this->business = Business::create([
            'id' => 'biz_solar_hub',
            'organization_id' => $this->organization->id,
            'name' => 'Solar Hub Store',
            'currency' => 'NGN',
        ]);

        $keyPair = ApiKey::createKey(
            $this->organization->id,
            'Rec Key',
            ['recommendations:write', 'recommendations:read']
        );
        $this->apiKey = $keyPair['plainTextKey'];

        // Create snapshot with evidence of concentration risk & retention opportunity
        $this->snapshot = AnalyticsSnapshot::create([
            'business_id' => $this->business->id,
            'snapshot_id' => 'snap_rec_eval_01',
            'schema_version' => '1.0.0',
            'calculation_version' => '1.0.0',
            'currency' => 'NGN',
            'period_from' => now()->subMonth(),
            'period_to' => now(),
            'net_revenue_minor_units' => 50000000,
            'gross_sales_minor_units' => 50000000,
            'total_orders' => 20,
            'total_completed_orders' => 18,
            'average_order_value_minor_units' => 2777777,
            'repeat_purchase_rate' => 15.0, // Low repeat rate (< 35%)
            'data_quality_score' => 90,
            'payload' => [
                'sales' => [
                    'netRevenueMinorUnits' => 50000000,
                    'periodOverPeriodRevenueGrowthRate' => -0.152, // -15.2% decline
                    'periodOverPeriodOrderGrowthRate' => -0.10,
                ],
                'pareto' => [
                    'products' => [
                        'totalContributors' => 5,
                        'vitalContributorsCount' => 1,
                        'vitalContributorsPercentage' => 20, // 1 product = 80%
                        'giniCoefficient' => 0.55,
                        'contributors' => [
                            [
                                'id' => 'prod_1',
                                'name' => 'High Output Inverter',
                                'contributionPercentage' => 78.5,
                            ],
                        ],
                    ],
                ],
                'customers' => [
                    'uniqueCustomersCount' => 12,
                    'repeatCustomersCount' => 2,
                    'repeatPurchaseRatePercentage' => 16.67,
                ],
                'products' => [
                    'missingCostProductCount' => 2,
                ],
                'trends' => [
                    'anomalies' => [],
                ],
            ],
        ]);
    }

    public function test_dispatches_recommendation_generation_job(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->postJson('/api/v1/recommendations/generate', [
                'snapshotId' => $this->snapshot->snapshot_id,
            ]);

        $response->assertStatus(202)
            ->assertJson([
                'status' => 'pending',
                'businessId' => $this->business->id,
            ]);

        $jobId = $response->json('jobId');
        $this->assertNotNull($jobId);

        $this->assertDatabaseHas('recommendation_jobs', [
            'id' => $jobId,
            'business_id' => $this->business->id,
            'status' => 'completed',
        ]);
    }

    public function test_worker_synthesizes_grounded_recommendations(): void
    {
        $recJob = $this->snapshot->recommendationJobs()->create([
            'business_id' => $this->business->id,
            'status' => 'pending',
        ]);

        // Run worker synchronously
        $jobInstance = new GenerateRecommendationsJob($recJob->id);
        $jobInstance->handle();

        $recJob->refresh();
        $this->assertEquals('completed', $recJob->status);

        // Check generated recommendations in database
        $recommendations = Recommendation::where('business_id', $this->business->id)->get();
        $this->assertGreaterThan(0, $recommendations->count());

        // Should have flagged:
        // 1. Revenue concentration in High Output Inverter
        $concentrationRec = $recommendations->firstWhere('category', 'revenue_concentration');
        $this->assertNotNull($concentrationRec);
        $this->assertStringContainsString('High Revenue Concentration', $concentrationRec->title);
        $this->assertNotEmpty($concentrationRec->evidence);

        // 2. Revenue decline (-15.2%)
        $salesRec = $recommendations->firstWhere('category', 'sales_growth');
        $this->assertNotNull($salesRec);
        $this->assertStringContainsString('15.2%', $salesRec->title);

        // 3. Customer retention
        $retentionRec = $recommendations->firstWhere('category', 'customer_retention');
        $this->assertNotNull($retentionRec);

        // 4. Missing costs
        $costRec = $recommendations->firstWhere('category', 'product_profitability');
        $this->assertNotNull($costRec);
    }

    public function test_updates_recommendation_status_lifecycle(): void
    {
        $rec = Recommendation::create([
            'business_id' => $this->business->id,
            'analytics_snapshot_id' => $this->snapshot->id,
            'category' => 'sales_growth',
            'title' => 'Sample Growth Action',
            'explanation' => 'Detailed growth explanation',
            'evidence' => [],
            'recommended_action' => 'Implement re-engagement campaign',
            'priority' => 'high',
            'confidence' => 'high',
            'status' => 'new',
        ]);

        // Accept recommendation
        $response = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->patchJson("/api/v1/recommendations/{$rec->id}/status", [
                'status' => 'accepted',
            ]);

        $response->assertStatus(200);
        $this->assertEquals('accepted', $rec->fresh()->status);

        // Dismiss recommendation with reason
        $response = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->patchJson("/api/v1/recommendations/{$rec->id}/status", [
                'status' => 'dismissed',
                'dismissedReason' => 'Budget constraints this quarter',
            ]);

        $response->assertStatus(200);
        $this->assertEquals('dismissed', $rec->fresh()->status);
        $this->assertEquals('Budget constraints this quarter', $rec->fresh()->dismissed_reason);
    }
}
