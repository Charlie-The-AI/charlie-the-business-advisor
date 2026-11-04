<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * CharlieAnalyticsService — Laravel Integration Client.
 *
 * Integrates an existing Laravel application with the open-source Charlie
 * analytics engine and multi-provider AI SDK.
 */
class CharlieAnalyticsService
{
    protected string $baseUrl;

    public function __construct()
    {
        // Points to your local or internal Node/Next.js Charlie service
        $this->baseUrl = rtrim(config('services.charlie.base_url', env('CHARLIE_SERVICE_URL', 'http://localhost:3000')), '/');
    }

    /**
     * Executes deterministic analytics on orders.
     */
    public function analyzeOrders(array $orders, array $customers = [], string $currency = 'NGN'): array
    {
        $response = Http::acceptJson()
            ->post("{$this->baseUrl}/api/charlie/analyze", [
                'orders' => $orders,
                'customers' => $customers,
                'currency' => $currency,
            ]);

        if (!$response->successful()) {
            Log::error('Charlie analytics calculation failed', [
                'status' => $response->status(),
                'body' => $response->body(),
            ]);
            throw new RuntimeException('Failed to calculate Charlie analytics: ' . $response->body());
        }

        return $response->json('snapshot', []);
    }

    /**
     * Generates grounded AI recommendations for business growth.
     */
    public function getAdvice(array $orders, ?string $objective = null): array
    {
        $response = Http::acceptJson()
            ->post("{$this->baseUrl}/api/charlie/advise", [
                'orders' => $orders,
                'objective' => $objective,
            ]);

        if (!$response->successful()) {
            throw new RuntimeException('Failed to generate Charlie advice: ' . $response->body());
        }

        return $response->json('recommendations', []);
    }

    /**
     * Asks Charlie a natural-language business question grounded in data.
     */
    public function askBusinessQuestion(string $question, array $orders = []): array
    {
        $response = Http::acceptJson()
            ->post("{$this->baseUrl}/api/charlie/chat", [
                'question' => $question,
                'orders' => $orders,
            ]);

        if (!$response->successful()) {
            throw new RuntimeException('Failed to query Charlie AI Advisor: ' . $response->body());
        }

        return [
            'answer' => $response->json('answer', ''),
            'evidence' => $response->json('evidence', []),
        ];
    }
}
