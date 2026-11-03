<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class CharlieAnalyticsService
{
    protected string $apiKey;
    protected string $baseUrl;
    protected string $businessId;

    public function __construct()
    {
        $this->apiKey = config('services.charlie.api_key', env('CHARLIE_API_KEY', ''));
        $this->baseUrl = rtrim(config('services.charlie.base_url', env('CHARLIE_BASE_URL', 'https://api.advisor.charlie.com')), '/');
        $this->businessId = config('services.charlie.business_id', env('CHARLIE_BUSINESS_ID', ''));
    }

    /**
     * Ingests a deterministic analytics snapshot into Charlie Advisory SaaS.
     */
    public function ingestSnapshot(array $snapshotData): array
    {
        $response = Http::withToken($this->apiKey)
            ->acceptJson()
            ->post("{$this->baseUrl}/api/v1/analytics/snapshots", array_merge([
                'business_id' => $this->businessId,
            ], $snapshotData));

        if (!$response->successful()) {
            Log::error('Charlie snapshot ingestion failed', [
                'status' => $response->status(),
                'response' => $response->json(),
            ]);
            throw new RuntimeException('Failed to push snapshot to Charlie: ' . ($response->json('message') ?? $response->body()));
        }

        return $response->json();
    }

    /**
     * Fetches active AI growth recommendations for the configured business.
     */
    public function getRecommendations(): array
    {
        $response = Http::withToken($this->apiKey)
            ->acceptJson()
            ->get("{$this->baseUrl}/api/v1/businesses/{$this->businessId}/recommendations");

        if (!$response->successful()) {
            throw new RuntimeException('Failed to fetch Charlie recommendations: ' . $response->body());
        }

        return $response->json('recommendations', []);
    }

    /**
     * Ask Charlie a natural language business question.
     */
    public function askBusinessQuestion(string $conversationId, string $question): string
    {
        $response = Http::withToken($this->apiKey)
            ->acceptJson()
            ->post("{$this->baseUrl}/api/v1/chat/conversations/{$conversationId}/messages", [
                'message' => $question,
            ]);

        if (!$response->successful()) {
            throw new RuntimeException('Failed to query Charlie AI Advisor: ' . $response->body());
        }

        return $response->json('content', '');
    }
}
