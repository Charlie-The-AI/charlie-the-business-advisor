<?php

namespace App\Services\Billing;

use App\Models\AuditLog;
use App\Models\Organization;
use App\Models\Subscription;
use Carbon\Carbon;
use InvalidArgumentException;

class PlanEntitlementService
{
    /**
     * Returns the catalog of all subscription plans.
     */
    public function getPlans(): array
    {
        $plans = config('billing.plans', []);

        return array_values(array_map(function ($plan) {
            $priceMinor = $plan['price_monthly_minor_units'] ?? 0;
            $currency = $plan['currency'] ?? 'NGN';
            $symbol = $currency === 'NGN' ? '₦' : '$';
            $major = number_format($priceMinor / 100, 2);

            return array_merge($plan, [
                'price_formatted' => "{$symbol}{$major}/mo",
            ]);
        }, $plans));
    }

    /**
     * Computes real-time usage metrics and quota limits for an organization.
     */
    public function getOrganizationUsage(Organization $organization): array
    {
        $currentMonthStart = now()->startOfMonth();

        // 1. Snapshot ingestion usage
        $snapshotsUsed = $organization->usageRecords()
            ->where('metric', 'snapshot_ingestion')
            ->where('created_at', '>=', $currentMonthStart)
            ->count();

        $snapshotQuota = $organization->monthly_snapshot_quota;
        $snapshotPercentage = $snapshotQuota > 0
            ? min(100, round(($snapshotsUsed / $snapshotQuota) * 100, 1))
            : ($snapshotQuota === -1 ? 0 : 100);

        // 2. AI Chat Token usage
        $tokensUsed = (int) $organization->usageRecords()
            ->where('metric', 'ai_chat_message')
            ->where('created_at', '>=', $currentMonthStart)
            ->sum('quantity');

        $tokensQuota = $organization->monthly_ai_tokens_quota;
        $tokensPercentage = $tokensQuota > 0
            ? min(100, round(($tokensUsed / $tokensQuota) * 100, 1))
            : ($tokensQuota === -1 ? 0 : 100);

        // 3. Business Profiles count
        $businessesCount = $organization->businesses()->count();
        $maxBusinesses = config("billing.plans.{$organization->plan}.quotas.max_businesses", 1);

        return [
            'organization_id' => $organization->id,
            'plan' => $organization->plan,
            'billing_status' => $organization->billing_status,
            'usage' => [
                'snapshots' => [
                    'used' => $snapshotsUsed,
                    'quota' => $snapshotQuota,
                    'is_unlimited' => $snapshotQuota === -1,
                    'percentage_used' => $snapshotPercentage,
                    'can_ingest' => $organization->hasSnapshotQuota(),
                ],
                'ai_tokens' => [
                    'used' => $tokensUsed,
                    'quota' => $tokensQuota,
                    'is_unlimited' => $tokensQuota === -1,
                    'percentage_used' => $tokensPercentage,
                    'can_chat' => $organization->hasAiTokensQuota(),
                ],
                'businesses' => [
                    'count' => $businessesCount,
                    'max_allowed' => $maxBusinesses,
                    'is_unlimited' => $maxBusinesses === -1,
                    'can_create' => $organization->canCreateBusiness(),
                ],
            ],
        ];
    }

    /**
     * Upgrades or updates an organization's subscription plan.
     */
    public function applyPlanSubscription(
        Organization $organization,
        string $planCode,
        string $gateway = 'paystack',
        ?string $subscriptionCode = null,
        ?string $customerCode = null,
        ?string $emailToken = null,
        ?array $metadata = []
    ): Subscription {
        $planConfig = config("billing.plans.{$planCode}");
        if (!$planConfig) {
            throw new InvalidArgumentException("Unrecognized plan code: {$planCode}");
        }

        $oldPlan = $organization->plan;
        $quotas = $planConfig['quotas'];

        // 1. Update Organization attributes
        $organization->update([
            'plan' => $planCode,
            'billing_status' => 'active',
            'monthly_snapshot_quota' => $quotas['monthly_snapshots'],
            'monthly_ai_tokens_quota' => $quotas['monthly_ai_tokens'],
            'paystack_customer_code' => $customerCode ?? $organization->paystack_customer_code,
            'paystack_subscription_code' => $subscriptionCode ?? $organization->paystack_subscription_code,
        ]);

        // 2. Create Subscription record
        $subscription = Subscription::create([
            'organization_id' => $organization->id,
            'plan_code' => $planCode,
            'gateway' => $gateway,
            'gateway_subscription_code' => $subscriptionCode,
            'gateway_customer_code' => $customerCode,
            'gateway_email_token' => $emailToken,
            'status' => 'active',
            'amount_minor_units' => $planConfig['price_monthly_minor_units'],
            'currency' => $planConfig['currency'] ?? 'NGN',
            'current_period_start' => now(),
            'current_period_end' => now()->addMonth(),
            'metadata' => $metadata,
        ]);

        // 3. Record Audit Log
        AuditLog::create([
            'organization_id' => $organization->id,
            'actor_type' => 'system',
            'actor_id' => 'billing_gateway',
            'action' => 'subscription.plan_updated',
            'details' => [
                'previous_plan' => $oldPlan,
                'new_plan' => $planCode,
                'gateway' => $gateway,
                'subscription_id' => $subscription->id,
            ],
        ]);

        return $subscription;
    }

    /**
     * Handles cancellation of an active subscription.
     */
    public function handleCancellation(
        Organization $organization,
        ?string $reason = null
    ): void {
        $currentPlan = $organization->plan;

        // 1. Mark active subscriptions as cancelled
        $activeSubs = $organization->subscriptions()->where('status', 'active')->get();
        foreach ($activeSubs as $sub) {
            $sub->update([
                'status' => 'canceled',
                'cancelled_at' => now(),
            ]);
        }

        // 2. Revert organization plan to free tier quotas at the end of billing cycle or immediately
        $freePlan = config('billing.plans.free');
        $organization->update([
            'plan' => 'free',
            'billing_status' => 'canceled',
            'monthly_snapshot_quota' => $freePlan['quotas']['monthly_snapshots'],
            'monthly_ai_tokens_quota' => $freePlan['quotas']['monthly_ai_tokens'],
            'paystack_subscription_code' => null,
        ]);

        // 3. Record Audit Log
        AuditLog::create([
            'organization_id' => $organization->id,
            'actor_type' => 'system',
            'actor_id' => 'billing_gateway',
            'action' => 'subscription.canceled',
            'details' => [
                'previous_plan' => $currentPlan,
                'reason' => $reason ?? 'User requested cancellation',
            ],
        ]);
    }
}
