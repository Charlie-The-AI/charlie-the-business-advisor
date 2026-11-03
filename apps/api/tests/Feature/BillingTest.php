<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use App\Models\Business;
use App\Models\Organization;
use App\Models\Subscription;
use App\Models\WebhookEvent;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BillingTest extends TestCase
{
    use RefreshDatabase;

    protected Organization $organization;
    protected Business $business;
    protected string $apiKey;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.billing.gateway' => 'mock',
            'services.paystack.secret_key' => 'mock_secret_key',
        ]);

        $this->organization = Organization::create([
            'name' => 'Apex Retailers Group',
            'slug' => 'apex-retailers',
            'plan' => 'free',
            'billing_status' => 'active',
            'monthly_snapshot_quota' => 10,
            'monthly_ai_tokens_quota' => 100000,
        ]);

        $this->business = $this->organization->businesses()->create([
            'name' => 'Apex Mega Store',
            'slug' => 'apex-mega-store',
            'currency' => 'NGN',
            'timezone' => 'Africa/Lagos',
        ]);

        $keyPair = ApiKey::createKey(
            organizationId: $this->organization->id,
            name: 'Billing Test Key',
            scopes: ['*'],
            businessScopes: ['*']
        );

        $this->apiKey = $keyPair['plainTextKey'];
    }

    public function test_can_list_available_subscription_plans(): void
    {
        $response = $this->getJson('/api/v1/billing/plans');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'plans' => [
                    '*' => [
                        'code',
                        'name',
                        'tagline',
                        'price_monthly_minor_units',
                        'price_formatted',
                        'currency',
                        'features',
                        'quotas' => [
                            'monthly_snapshots',
                            'monthly_ai_tokens',
                            'max_businesses',
                            'max_members',
                        ],
                    ],
                ],
            ]);

        $plans = collect($response->json('plans'));
        $this->assertNotNull($plans->firstWhere('code', 'free'));
        $this->assertNotNull($plans->firstWhere('code', 'growth'));
        $this->assertNotNull($plans->firstWhere('code', 'pro'));
        $this->assertNotNull($plans->firstWhere('code', 'platform'));
    }

    public function test_can_view_current_organization_subscription_and_usage(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->getJson('/api/v1/billing/subscription');

        $response->assertStatus(200)
            ->assertJsonPath('organization.id', $this->organization->id)
            ->assertJsonPath('organization.plan', 'free')
            ->assertJsonPath('organization.billing_status', 'active')
            ->assertJsonPath('entitlements.snapshots.quota', 10)
            ->assertJsonPath('entitlements.snapshots.used', 0)
            ->assertJsonPath('entitlements.snapshots.can_ingest', true)
            ->assertJsonPath('entitlements.businesses.count', 1);
    }

    public function test_can_initialize_checkout_session(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->postJson('/api/v1/billing/checkout', [
                'plan_code' => 'growth',
                'callback_url' => 'https://app.charlie.com/billing/callback',
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'authorization_url',
                'access_code',
                'reference',
                'plan_code',
            ])
            ->assertJsonPath('plan_code', 'growth');

        $this->assertStringContainsString('checkout.paystack.com/mock', $response->json('authorization_url'));
    }

    public function test_rejects_checkout_with_invalid_plan(): void
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->postJson('/api/v1/billing/checkout', [
                'plan_code' => 'invalid_plan_tier',
                'callback_url' => 'https://app.charlie.com/callback',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['plan_code']);
    }

    public function test_processes_paystack_charge_success_webhook_and_upgrades_organization(): void
    {
        $payload = [
            'event' => 'charge.success',
            'data' => [
                'id' => 9928192,
                'reference' => 'pstk_ref_test_001',
                'amount' => 2500000,
                'channel' => 'card',
                'paid_at' => now()->toIso8601String(),
                'metadata' => [
                    'organization_id' => $this->organization->id,
                    'plan_code' => 'growth',
                ],
                'customer' => [
                    'customer_code' => 'CUS_mock_99182',
                    'email' => 'finance@apexretailers.com',
                ],
                'subscription' => [
                    'subscription_code' => 'SUB_growth_7721',
                    'email_token' => 'em_tok_88219',
                ],
            ],
        ];

        $rawBody = json_encode($payload);
        $signature = hash_hmac('sha512', $rawBody, 'mock_secret_key');

        $response = $this->call(
            'POST',
            '/api/v1/billing/webhooks/paystack',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_PAYSTACK_SIGNATURE' => $signature,
            ],
            $rawBody
        );

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        // Check organization updated
        $this->organization->refresh();
        $this->assertEquals('growth', $this->organization->plan);
        $this->assertEquals('active', $this->organization->billing_status);
        $this->assertEquals(100, $this->organization->monthly_snapshot_quota);
        $this->assertEquals(1000000, $this->organization->monthly_ai_tokens_quota);
        $this->assertEquals('CUS_mock_99182', $this->organization->paystack_customer_code);
        $this->assertEquals('SUB_growth_7721', $this->organization->paystack_subscription_code);

        // Check subscription record created
        $this->assertDatabaseHas('subscriptions', [
            'organization_id' => $this->organization->id,
            'plan_code' => 'growth',
            'gateway' => 'paystack',
            'gateway_subscription_code' => 'SUB_growth_7721',
            'status' => 'active',
        ]);

        // Check audit log recorded
        $this->assertDatabaseHas('audit_logs', [
            'organization_id' => $this->organization->id,
            'action' => 'subscription.plan_updated',
        ]);
    }

    public function test_idempotent_duplicate_webhook_is_ignored(): void
    {
        $payload = [
            'event' => 'charge.success',
            'data' => [
                'id' => 9928193,
                'reference' => 'pstk_ref_duplicate_test',
                'amount' => 7500000,
                'metadata' => [
                    'organization_id' => $this->organization->id,
                    'plan_code' => 'pro',
                ],
                'customer' => ['customer_code' => 'CUS_991'],
                'subscription' => ['subscription_code' => 'SUB_PRO_01'],
            ],
        ];

        $rawBody = json_encode($payload);
        $signature = hash_hmac('sha512', $rawBody, 'mock_secret_key');

        // First call
        $firstResponse = $this->call(
            'POST',
            '/api/v1/billing/webhooks/paystack',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_PAYSTACK_SIGNATURE' => $signature,
            ],
            $rawBody
        );
        $firstResponse->assertStatus(200)->assertJsonPath('status', 'success');

        $this->assertEquals(1, Subscription::where('organization_id', $this->organization->id)->count());

        // Second call with duplicate payload
        $secondResponse = $this->call(
            'POST',
            '/api/v1/billing/webhooks/paystack',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_PAYSTACK_SIGNATURE' => $signature,
            ],
            $rawBody
        );

        $secondResponse->assertStatus(200)->assertJsonPath('status', 'already_processed');

        // Subscriptions count should remain exactly 1
        $this->assertEquals(1, Subscription::where('organization_id', $this->organization->id)->count());
    }

    public function test_processes_subscription_disable_webhook_and_cancels_subscription(): void
    {
        // First set org to growth plan
        $this->organization->update([
            'plan' => 'growth',
            'monthly_snapshot_quota' => 100,
            'paystack_subscription_code' => 'SUB_to_cancel_123',
        ]);

        Subscription::create([
            'organization_id' => $this->organization->id,
            'plan_code' => 'growth',
            'gateway' => 'paystack',
            'gateway_subscription_code' => 'SUB_to_cancel_123',
            'status' => 'active',
            'amount_minor_units' => 2500000,
        ]);

        $payload = [
            'event' => 'subscription.disable',
            'data' => [
                'subscription_code' => 'SUB_to_cancel_123',
            ],
        ];

        $rawBody = json_encode($payload);
        $signature = hash_hmac('sha512', $rawBody, 'mock_secret_key');

        $response = $this->call(
            'POST',
            '/api/v1/billing/webhooks/paystack',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_PAYSTACK_SIGNATURE' => $signature,
            ],
            $rawBody
        );

        $response->assertStatus(200);

        $this->organization->refresh();
        $this->assertEquals('free', $this->organization->plan);
        $this->assertEquals('canceled', $this->organization->billing_status);
        $this->assertEquals(10, $this->organization->monthly_snapshot_quota);

        // Subscription record should be marked canceled
        $sub = Subscription::where('gateway_subscription_code', 'SUB_to_cancel_123')->first();
        $this->assertEquals('canceled', $sub->status);
        $this->assertNotNull($sub->cancelled_at);
    }

    public function test_rejects_webhook_with_invalid_signature(): void
    {
        $payload = ['event' => 'charge.success'];
        $rawBody = json_encode($payload);

        $response = $this->call(
            'POST',
            '/api/v1/billing/webhooks/paystack',
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_PAYSTACK_SIGNATURE' => 'invalid_tampered_signature',
            ],
            $rawBody
        );

        $response->assertStatus(400)
            ->assertJsonPath('error', 'invalid_signature');
    }

    public function test_can_cancel_subscription_via_api(): void
    {
        $this->organization->update([
            'plan' => 'growth',
            'paystack_subscription_code' => 'SUB_api_cancel_456',
        ]);

        Subscription::create([
            'organization_id' => $this->organization->id,
            'plan_code' => 'growth',
            'gateway' => 'paystack',
            'gateway_subscription_code' => 'SUB_api_cancel_456',
            'status' => 'active',
            'amount_minor_units' => 2500000,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->postJson('/api/v1/billing/cancel', [
                'reason' => 'Downsizing operations',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('plan', 'free')
            ->assertJsonPath('billing_status', 'canceled');

        $this->organization->refresh();
        $this->assertEquals('free', $this->organization->plan);
        $this->assertEquals(10, $this->organization->monthly_snapshot_quota);
    }

    public function test_cannot_cancel_already_free_plan(): void
    {
        $this->organization->update(['plan' => 'free']);

        $response = $this->withHeader('Authorization', "Bearer {$this->apiKey}")
            ->postJson('/api/v1/billing/cancel');

        $response->assertStatus(422)
            ->assertJsonPath('error', 'cannot_cancel_free_plan');
    }
}
