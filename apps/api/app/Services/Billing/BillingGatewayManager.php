<?php

namespace App\Services\Billing;

use App\Services\Billing\Contracts\BillingGatewayInterface;
use InvalidArgumentException;

class BillingGatewayManager
{
    protected ?BillingGatewayInterface $gateway = null;

    public function gateway(?string $driver = null): BillingGatewayInterface
    {
        if ($this->gateway !== null && $driver === null) {
            return $this->gateway;
        }

        $driver = $driver ?? config('services.billing.gateway', 'mock');

        return match ($driver) {
            'paystack' => new PaystackBillingGateway(),
            'mock' => new MockBillingGateway(),
            default => throw new InvalidArgumentException("Unsupported billing gateway driver: {$driver}"),
        };
    }

    public function setGateway(BillingGatewayInterface $gateway): void
    {
        $this->gateway = $gateway;
    }
}
