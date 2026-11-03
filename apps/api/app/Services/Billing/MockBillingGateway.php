<?php

namespace App\Services\Billing;

use App\Models\Organization;
use App\Services\Billing\Contracts\BillingGatewayInterface;
use Illuminate\Support\Str;

class MockBillingGateway implements BillingGatewayInterface
{
    public function initializeCheckout(
        Organization $organization,
        string $planCode,
        string $callbackUrl,
        string $currency = 'NGN'
    ): array {
        $reference = 'mock_ref_' . Str::random(16);

        return [
            'authorization_url' => "https://checkout.paystack.com/mock/{$reference}",
            'access_code' => "mock_access_" . Str::random(12),
            'reference' => $reference,
        ];
    }

    public function verifyWebhookSignature(string $rawPayload, string $signatureHeader): bool
    {
        if ($signatureHeader === 'valid_mock_signature') {
            return true;
        }

        $secretKey = config('services.paystack.secret_key', 'mock_secret_key');
        $computed = hash_hmac('sha512', $rawPayload, $secretKey);

        return hash_equals($computed, $signatureHeader);
    }

    public function cancelSubscription(string $subscriptionCode, ?string $emailToken = null): bool
    {
        return true;
    }
}
