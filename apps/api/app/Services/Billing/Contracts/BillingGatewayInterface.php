<?php

namespace App\Services\Billing\Contracts;

use App\Models\Organization;

interface BillingGatewayInterface
{
    /**
     * Initializes a checkout transaction with the payment gateway.
     *
     * @return array{authorization_url: string, access_code: string, reference: string}
     */
    public function initializeCheckout(
        Organization $organization,
        string $planCode,
        string $callbackUrl,
        string $currency = 'NGN'
    ): array;

    /**
     * Validates raw incoming webhook payload against cryptographic signature.
     */
    public function verifyWebhookSignature(string $rawPayload, string $signatureHeader): bool;

    /**
     * Cancels an active subscription at the gateway.
     */
    public function cancelSubscription(string $subscriptionCode, ?string $emailToken = null): bool;
}
