<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Models\WebhookEvent;
use App\Services\Billing\BillingGatewayManager;
use App\Services\Billing\PlanEntitlementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class BillingWebhookController extends Controller
{
    /**
     * Handles incoming Paystack webhook notifications.
     * POST /api/v1/billing/webhooks/paystack
     */
    public function handlePaystack(
        Request $request,
        BillingGatewayManager $gatewayManager,
        PlanEntitlementService $entitlementService
    ): JsonResponse {
        $rawPayload = $request->getContent();
        $signature = $request->header('X-Paystack-Signature', '');

        // 1. Verify cryptographic signature
        $gateway = $gatewayManager->gateway();
        if (!$gateway->verifyWebhookSignature($rawPayload, $signature)) {
            Log::warning('Paystack webhook rejected: invalid signature header');
            return response()->json([
                'error' => 'invalid_signature',
                'message' => 'The provided webhook signature is invalid.',
            ], 400);
        }

        $payload = json_decode($rawPayload, true);
        if (!$payload || !isset($payload['event'])) {
            return response()->json([
                'error' => 'malformed_payload',
                'message' => 'The webhook payload could not be parsed.',
            ], 400);
        }

        $eventType = $payload['event'];
        $data = $payload['data'] ?? [];

        // 2. Extract deterministic idempotency key
        $eventId = match ($eventType) {
            'charge.success' => $data['reference'] ?? ('charge_' . ($data['id'] ?? md5($rawPayload))),
            'subscription.create', 'subscription.disable' => 'sub_' . ($data['subscription_code'] ?? ($data['id'] ?? md5($rawPayload))),
            default => 'evt_' . ($data['id'] ?? md5($rawPayload)),
        };

        // 3. Check for previous duplicate processing
        if (WebhookEvent::where('event_id', $eventId)->exists()) {
            return response()->json([
                'status' => 'already_processed',
                'event_id' => $eventId,
            ]);
        }

        // 4. Record webhook event
        $webhookEvent = WebhookEvent::create([
            'gateway' => 'paystack',
            'event_type' => $eventType,
            'event_id' => $eventId,
            'payload' => $payload,
        ]);

        // 5. Process according to event type
        switch ($eventType) {
            case 'charge.success':
                $orgId = $data['metadata']['organization_id'] ?? null;
                $planCode = $data['metadata']['plan_code'] ?? null;
                $customerCode = $data['customer']['customer_code'] ?? null;
                $subCode = $data['subscription']['subscription_code'] ?? null;
                $emailToken = $data['subscription']['email_token'] ?? null;

                if ($orgId && $planCode) {
                    $organization = Organization::find($orgId);
                    if ($organization) {
                        $entitlementService->applyPlanSubscription(
                            organization: $organization,
                            planCode: $planCode,
                            gateway: 'paystack',
                            subscriptionCode: $subCode,
                            customerCode: $customerCode,
                            emailToken: $emailToken,
                            metadata: [
                                'paystack_reference' => $data['reference'] ?? null,
                                'paid_at' => $data['paid_at'] ?? null,
                                'channel' => $data['channel'] ?? null,
                            ]
                        );
                    }
                }
                break;

            case 'subscription.create':
                $customerCode = $data['customer']['customer_code'] ?? null;
                $subCode = $data['subscription_code'] ?? null;
                $emailToken = $data['email_token'] ?? null;
                $planCodeFromSub = null;

                // Match plan by paystack plan code
                $paystackPlanCode = $data['plan']['plan_code'] ?? null;
                foreach (config('billing.plans', []) as $code => $cfg) {
                    if (($cfg['paystack_plan_code'] ?? null) === $paystackPlanCode) {
                        $planCodeFromSub = $code;
                        break;
                    }
                }

                if ($customerCode && $planCodeFromSub) {
                    $organization = Organization::where('paystack_customer_code', $customerCode)->first();
                    if ($organization) {
                        $entitlementService->applyPlanSubscription(
                            organization: $organization,
                            planCode: $planCodeFromSub,
                            gateway: 'paystack',
                            subscriptionCode: $subCode,
                            customerCode: $customerCode,
                            emailToken: $emailToken
                        );
                    }
                }
                break;

            case 'subscription.disable':
                $subCode = $data['subscription_code'] ?? null;
                if ($subCode) {
                    $organization = Organization::where('paystack_subscription_code', $subCode)->first();
                    if ($organization) {
                        $entitlementService->handleCancellation(
                            organization: $organization,
                            reason: 'Paystack subscription.disable webhook event'
                        );
                    }
                }
                break;

            case 'invoice.payment_failed':
                $customerCode = $data['customer']['customer_code'] ?? null;
                if ($customerCode) {
                    $organization = Organization::where('paystack_customer_code', $customerCode)->first();
                    if ($organization) {
                        $organization->update(['billing_status' => 'past_due']);
                    }
                }
                break;

            default:
                Log::info("Unhandled Paystack webhook event type: {$eventType}");
                break;
        }

        $webhookEvent->update(['processed_at' => now()]);

        return response()->json([
            'status' => 'success',
            'event_id' => $eventId,
        ]);
    }
}
