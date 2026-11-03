<?php

namespace Tests\Feature;

use App\Models\AnalyticsSnapshot;
use App\Models\ApiKey;
use App\Models\Business;
use App\Models\Organization;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AiBusinessChatTest extends TestCase
{
    use RefreshDatabase;

    private Organization $organization;
    private Business $business;
    private string $apiKey;

    protected function setUp(): void
    {
        parent::setUp();

        $this->organization = Organization::create([
            'name' => 'Atlantic Retailers Ltd',
            'slug' => 'atlantic-retailers',
            'plan' => 'pro',
        ]);

        $this->business = Business::create([
            'id' => 'biz_atlantic_hq',
            'organization_id' => $this->organization->id,
            'name' => 'Atlantic Flagship Store',
            'currency' => 'NGN',
        ]);

        $keyPair = ApiKey::createKey(
            $this->organization->id,
            'Chat Key',
            ['chat:write', 'chat:read']
        );
        $this->apiKey = $keyPair['plainTextKey'];

        // Ingest realistic snapshot with sales, bestsellers, and customer metrics
        AnalyticsSnapshot::create([
            'business_id' => $this->business->id,
            'snapshot_id' => 'snap_chat_test_01',
            'schema_version' => '1.0.0',
            'calculation_version' => '1.0.0',
            'currency' => 'NGN',
            'period_from' => now()->subMonth(),
            'period_to' => now(),
            'net_revenue_minor_units' => 45000000,
            'gross_sales_minor_units' => 45000000,
            'total_orders' => 15,
            'total_completed_orders' => 12,
            'average_order_value_minor_units' => 3750000,
            'repeat_purchase_rate' => 25.0,
            'data_quality_score' => 100,
            'payload' => [
                'sales' => [
                    'netRevenueMinorUnits' => 45000000,
                    'netRevenueFormatted' => '₦450,000.00',
                    'totalCompletedOrders' => 12,
                    'averageOrderValueFormatted' => '₦37,500.00',
                    'periodOverPeriodRevenueGrowthRate' => -0.125, // -12.5%
                ],
                'products' => [
                    'bestSellersByRevenue' => [
                        [
                            'productId' => 'prod_solar_panel',
                            'productName' => 'Mono Solar Panel 450W',
                            'revenueMinorUnits' => 25000000,
                            'revenueFormatted' => '₦250,000.00',
                            'revenuePercentage' => 55.56,
                            'unitsSold' => 5,
                        ],
                    ],
                ],
                'customers' => [
                    'uniqueCustomersCount' => 12,
                    'repeatCustomersCount' => 3,
                    'repeatPurchaseRatePercentage' => 25.0,
                ],
            ],
        ]);
    }

    public function test_can_create_and_list_conversations(): void
    {
        // 1. Create conversation
        $createRes = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->postJson("/api/v1/businesses/{$this->business->id}/chat/conversations", [
                'title' => 'Q1 Growth Strategy Review',
            ]);

        $createRes->assertStatus(201)
            ->assertJson([
                'title' => 'Q1 Growth Strategy Review',
                'businessId' => $this->business->id,
            ]);

        $conversationId = $createRes->json('id');
        $this->assertNotNull($conversationId);

        // 2. List conversations
        $listRes = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->getJson("/api/v1/businesses/{$this->business->id}/chat/conversations");

        $listRes->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }

    public function test_answers_natural_language_question_with_grounded_metrics(): void
    {
        // 1. Create conversation
        $conversation = $this->business->conversations()->create([
            'title' => 'Revenue Diagnostic',
        ]);

        // 2. Ask question about revenue decline
        $response = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->postJson("/api/v1/chat/conversations/{$conversation->id}/messages", [
                'message' => 'Why did my revenue decline this month?',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'id',
                'role',
                'content',
                'citations',
                'tokensUsed',
                'createdAt',
            ]);

        $content = $response->json('content');
        $citations = $response->json('citations');

        // Verify content cites the actual numbers from snapshot
        $this->assertStringContainsString('₦450,000.00', $content);
        $this->assertStringContainsString('12.5%', $content);
        $this->assertNotEmpty($citations);

        // Verify tokens accounted for
        $this->assertGreaterThan(0, $response->json('tokensUsed'));

        // Verify usage recorded in database
        $this->assertDatabaseHas('usage_records', [
            'organization_id' => $this->organization->id,
            'business_id' => $this->business->id,
            'metric' => 'ai_chat_message',
        ]);
    }

    public function test_answers_product_performance_question_accurately(): void
    {
        $conversation = $this->business->conversations()->create([
            'title' => 'Product Review',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->postJson("/api/v1/chat/conversations/{$conversation->id}/messages", [
                'message' => 'Which product generates the most revenue?',
            ]);

        $response->assertStatus(200);
        $content = $response->json('content');

        $this->assertStringContainsString('Mono Solar Panel 450W', $content);
        $this->assertStringContainsString('₦250,000.00', $content);
    }

    public function test_prevents_cross_tenant_chat_access(): void
    {
        // Other organization B
        $otherOrg = Organization::create(['name' => 'Other Org', 'slug' => 'other-org']);
        $keyPairB = ApiKey::createKey($otherOrg->id, 'Key B', ['chat:write', 'chat:read']);

        $conversation = $this->business->conversations()->create(['title' => 'Confidential Chat']);

        // Key B attempts to read messages of Conversation A
        $response = $this->withHeader('Authorization', "Bearer {$keyPairB['plainTextKey']}")
            ->getJson("/api/v1/chat/conversations/{$conversation->id}/messages");

        $response->assertStatus(404);
    }
}
