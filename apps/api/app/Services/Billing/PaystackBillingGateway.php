<?php

namespace App\Services\Billing;

use App\Models\Organization;
use App\Services\Billing\Contracts\BillingGatewayInterface;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class PaystackBillingGateway implements BillingGatewayInterface
{
    protected string $secretKey;
    protected string $baseUrl;

    public function __construct()
    {
        $this->secretKey = config('services.paystack.secret_key', '');
        $this->baseUrl = rtrim(config('services.paystack.base_url', 'https://api.paystack.co'), '/');
    }

    public function initializeCheckout(
        Organization $organization,
        string $planCode,
        string $callbackUrl,
        string $currency = 'NGN'
    ): array {
        $planConfig = config("billing.plans.{$planCode}");
        if (!$planConfig) {
            throw new RuntimeException("Unknown plan code: {$planCode}");
        }

        $adminMember = $organization->members()->first();
        $email = $adminMember?->email ?? "billing+{$organization->slug}@advisor.charlie.internal";

        $payload = [
            'email' => $email,
            'amount' => $planConfig['price_monthly_minor_units'],
            'currency' => $currency,
            'callback_url' => $callbackUrl,
            'metadata' => [
                'organization_id' => $organization->id,
                'plan_code' => $planCode,
                'organization_name' => $organization->name,
            ],
        ];

        if (!empty($planConfig['paystack_plan_code'])) {
            $payload['plan'] = $planConfig['paystack_plan_code'];
        }

        $response = Http::withToken($this->secretKey)
            ->acceptJson()
            ->post("{$this->baseUrl}/transaction/initialize", $payload);

        if (!$response->successful() || !$response->json('status')) {
            Log::error('Paystack transaction initialization failed', [
                'response' => $response->json(),
                'status' => $response->status(),
                'org_id' => $organization->id,
            ]);
            throw new RuntimeException('Failed to initialize checkout with Paystack: ' . ($response->json('message') ?? 'Unknown error'));
        }

        $data = $response->json('data', []);

        return [
            'authorization_url' => $data['authorization_url'] ?? '',
            'access_code' => $data['access_code'] ?? '',
            'reference' => $data['reference'] ?? '',
        ];
    }

    public function verifyWebhookSignature(string $rawPayload, string $signatureHeader): bool
    {
        if (empty($this->secretKey) || empty($signatureHeader)) {
            return false;
        }

        $computedSignature = hash_hmac('sha512', $rawPayload, $this->secretKey);

        return hash_equals($computedSignature, $signatureHeader);
    }

    public function cancelSubscription(string $subscriptionCode, ?string $emailToken = null): bool
    {
        $payload = [
            'code' => $subscriptionCode,
            'token' => $emailToken ?? '',
        ];

        $response = Http::withToken($this->secretKey)
            ->acceptJson()
            ->post("{$this->baseUrl}/subscription/disable", $payload);

        if (!$response->successful()) {
            Log::error('Paystack subscription cancellation failed', [
                'code' => $subscriptionCode,
                'response' => $response->json(),
            ]);
            return false;
        }

        return (bool) $response->json('status');
    }
}
