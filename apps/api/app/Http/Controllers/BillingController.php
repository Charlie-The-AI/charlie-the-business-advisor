<?php

namespace App\Http\Controllers;

use App\Services\Billing\BillingGatewayManager;
use App\Services\Billing\PlanEntitlementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BillingController extends Controller
{
    public function __construct(
        protected PlanEntitlementService $entitlementService,
        protected BillingGatewayManager $gatewayManager
    ) {
    }

    /**
     * Lists all available subscription plans and their feature entitlements.
     * GET /api/v1/billing/plans
     */
    public function plans(): JsonResponse
    {
        $plans = $this->entitlementService->getPlans();

        return response()->json([
            'plans' => $plans,
        ]);
    }

    /**
     * Returns current organization subscription, quotas, and real-time usage.
     * GET /api/v1/billing/subscription
     */
    public function subscription(Request $request): JsonResponse
    {
        $organization = $request->attributes->get('organization');

        if (!$organization) {
            return response()->json([
                'error' => 'organization_not_found',
                'message' => 'No active organization found in request context.',
            ], 404);
        }

        $summary = $this->entitlementService->getOrganizationUsage($organization);
        $latestSub = $organization->latestSubscription;

        return response()->json([
            'organization' => [
                'id' => $organization->id,
                'name' => $organization->name,
                'plan' => $organization->plan,
                'billing_status' => $organization->billing_status,
                'paystack_customer_code' => $organization->paystack_customer_code,
                'paystack_subscription_code' => $organization->paystack_subscription_code,
            ],
            'subscription' => $latestSub ? [
                'id' => $latestSub->id,
                'plan_code' => $latestSub->plan_code,
                'status' => $latestSub->status,
                'gateway' => $latestSub->gateway,
                'amount_minor_units' => $latestSub->amount_minor_units,
                'currency' => $latestSub->currency,
                'current_period_start' => $latestSub->current_period_start?->toIso8601String(),
                'current_period_end' => $latestSub->current_period_end?->toIso8601String(),
                'cancelled_at' => $latestSub->cancelled_at?->toIso8601String(),
            ] : null,
            'entitlements' => $summary['usage'],
        ]);
    }

    /**
     * Initiates a payment checkout session with the configured payment gateway.
     * POST /api/v1/billing/checkout
     */
    public function checkout(Request $request): JsonResponse
    {
        $organization = $request->attributes->get('organization');

        if (!$organization) {
            return response()->json([
                'error' => 'organization_not_found',
                'message' => 'No active organization found in request context.',
            ], 404);
        }

        $validated = $request->validate([
            'plan_code' => ['required', 'string', Rule::in(['growth', 'pro', 'platform'])],
            'callback_url' => ['required', 'url'],
            'currency' => ['nullable', 'string', 'size:3'],
        ]);

        $currency = $validated['currency'] ?? 'NGN';
        $gateway = $this->gatewayManager->gateway();

        $checkout = $gateway->initializeCheckout(
            organization: $organization,
            planCode: $validated['plan_code'],
            callbackUrl: $validated['callback_url'],
            currency: $currency
        );

        return response()->json([
            'authorization_url' => $checkout['authorization_url'],
            'access_code' => $checkout['access_code'],
            'reference' => $checkout['reference'],
            'plan_code' => $validated['plan_code'],
        ]);
    }

    /**
     * Requests subscription cancellation.
     * POST /api/v1/billing/cancel
     */
    public function cancel(Request $request): JsonResponse
    {
        $organization = $request->attributes->get('organization');

        if (!$organization) {
            return response()->json([
                'error' => 'organization_not_found',
                'message' => 'No active organization found in request context.',
            ], 404);
        }

        if ($organization->plan === 'free') {
            return response()->json([
                'error' => 'cannot_cancel_free_plan',
                'message' => 'The organization is currently on the free plan.',
            ], 422);
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        // Attempt gateway cancellation if Paystack subscription code exists
        if ($organization->paystack_subscription_code) {
            $latestSub = $organization->latestSubscription;
            $emailToken = $latestSub?->gateway_email_token;
            $this->gatewayManager->gateway()->cancelSubscription(
                $organization->paystack_subscription_code,
                $emailToken
            );
        }

        $this->entitlementService->handleCancellation(
            organization: $organization,
            reason: $validated['reason'] ?? 'User requested cancellation via API'
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Subscription successfully canceled. Plan reverted to free tier.',
            'plan' => 'free',
            'billing_status' => 'canceled',
        ]);
    }
}
