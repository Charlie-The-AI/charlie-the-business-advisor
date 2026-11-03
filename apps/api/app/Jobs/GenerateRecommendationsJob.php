<?php

namespace App\Jobs;

use App\Models\Recommendation;
use App\Models\RecommendationJob;
use App\Models\UsageRecord;
use App\Services\AI\AiProviderManager;
use App\Services\AI\GroundingVerifier;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class GenerateRecommendationsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 120;

    public function __construct(public string $jobId)
    {
    }

    public function handle(?AiProviderManager $providerManager = null, ?GroundingVerifier $groundingVerifier = null): void
    {
        $providerManager = $providerManager ?? app(AiProviderManager::class);
        $groundingVerifier = $groundingVerifier ?? app(GroundingVerifier::class);
        $recJob = RecommendationJob::with(['snapshot', 'business.organization'])->find($this->jobId);

        if (!$recJob || !$recJob->snapshot) {
            Log::error("RecommendationJob {$this->jobId} or its snapshot could not be found.");
            return;
        }

        $recJob->markProcessing();

        try {
            $snapshot = $recJob->snapshot;
            $payload = $snapshot->payload;
            $business = $recJob->business;

            // 1. Invoke Configured AI Provider
            $aiProvider = $providerManager->getProvider();
            $aiResult = $aiProvider->generateStructuredRecommendations($payload);

            // 2. Evidence Grounding Verification
            // Rejects any hallucinated or ungrounded numeric claims
            $verifiedRecommendations = $groundingVerifier->verifyRecommendations(
                $aiResult->recommendations,
                $payload
            );

            // 3. Fallback Heuristics if AI returned empty array
            if (empty($verifiedRecommendations)) {
                $verifiedRecommendations = $this->generateRuleBasedRecommendations($payload);
            }

            // 4. Persist Accepted Recommendations
            foreach ($verifiedRecommendations as $recData) {
                Recommendation::create([
                    'business_id' => $business->id,
                    'analytics_snapshot_id' => $snapshot->id,
                    'category' => $recData['category'],
                    'title' => $recData['title'],
                    'explanation' => $recData['explanation'],
                    'evidence' => $recData['evidence'],
                    'recommended_action' => $recData['recommendedAction'],
                    'priority' => $recData['priority'],
                    'confidence' => $recData['confidence'],
                    'status' => 'new',
                    'period_from' => $snapshot->period_from,
                    'period_to' => $snapshot->period_to,
                ]);
            }

            // 5. Record Usage & Token Accounting
            if ($business->organization) {
                UsageRecord::create([
                    'organization_id' => $business->organization->id,
                    'business_id' => $business->id,
                    'metric' => 'ai_recommendation_generation',
                    'quantity' => count($verifiedRecommendations),
                    'tokens_used' => $aiResult->totalTokens,
                    'estimated_cost_cents' => $aiResult->estimatedCostCents,
                    'metadata' => [
                        'job_id' => $recJob->id,
                        'model' => $aiResult->model,
                        'recommendations_count' => count($verifiedRecommendations),
                    ],
                ]);
            }

            $recJob->markCompleted();
        } catch (Throwable $e) {
            Log::error("GenerateRecommendationsJob failed: " . $e->getMessage(), ['trace' => $e->getTraceAsString()]);
            $recJob->markFailed($e->getMessage());
            throw $e;
        }
    }

    private function generateRuleBasedRecommendations(array $payload): array
    {
        $recommendations = [];

        // Check Product Concentration
        $productPareto = $payload['pareto']['products'] ?? [];
        $vitalPct = $productPareto['vitalContributorsPercentage'] ?? 0;
        $vitalCount = $productPareto['vitalContributorsCount'] ?? 0;
        $totalContributors = $productPareto['totalContributors'] ?? 0;

        if ($totalContributors >= 2 && $vitalPct <= 40) {
            $topItem = $productPareto['contributors'][0] ?? null;
            if ($topItem) {
                $recommendations[] = [
                    'category' => 'revenue_concentration',
                    'title' => "Revenue Concentration Risk in Top Products",
                    'explanation' => "Your top product '{$topItem['name']}' represents {$topItem['contributionPercentage']}% of sales.",
                    'evidence' => [
                        [
                            'metricName' => 'vitalContributorsPercentage',
                            'metricValue' => $vitalPct,
                            'formattedValue' => "{$vitalPct}%",
                            'sourceField' => 'pareto.products.vitalContributorsPercentage',
                        ],
                    ],
                    'recommendedAction' => "Bundle '{$topItem['name']}' with secondary items to diversify revenue.",
                    'priority' => 'high',
                    'confidence' => 'high',
                ];
            }
        }

        return $recommendations;
    }
}
