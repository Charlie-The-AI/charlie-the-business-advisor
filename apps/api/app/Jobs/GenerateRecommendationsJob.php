<?php

namespace App\Jobs;

use App\Models\Recommendation;
use App\Models\RecommendationJob;
use App\Models\UsageRecord;
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

    public function handle(): void
    {
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
            $currency = $snapshot->currency;

            $generatedRecommendations = [];

            // 1. Revenue Concentration Risk (Pareto Analysis)
            $productPareto = $payload['pareto']['products'] ?? [];
            $vitalPct = $productPareto['vitalContributorsPercentage'] ?? 0;
            $vitalCount = $productPareto['vitalContributorsCount'] ?? 0;
            $totalContributors = $productPareto['totalContributors'] ?? 0;
            $gini = $productPareto['giniCoefficient'] ?? 0;

            if ($totalContributors >= 3 && $vitalPct <= 30 && $gini >= 0.3) {
                $topItem = $productPareto['contributors'][0] ?? null;
                $topName = $topItem['name'] ?? 'Top product';
                $topShare = $topItem['contributionPercentage'] ?? 0;

                $generatedRecommendations[] = [
                    'category' => 'revenue_concentration',
                    'title' => "High Revenue Concentration Risk in {$topName}",
                    'explanation' => "Your business exhibits significant revenue concentration: {$vitalCount} of {$totalContributors} products ({$vitalPct}%) account for 80% of total revenue. In particular, '{$topName}' generates {$topShare}% of your sales.",
                    'evidence' => [
                        [
                            'metricName' => 'vitalContributorsPercentage',
                            'metricValue' => $vitalPct,
                            'formattedValue' => "{$vitalPct}%",
                            'sourceField' => 'pareto.products.vitalContributorsPercentage',
                        ],
                        [
                            'metricName' => 'giniCoefficient',
                            'metricValue' => $gini,
                            'formattedValue' => (string) $gini,
                            'sourceField' => 'pareto.products.giniCoefficient',
                        ],
                    ],
                    'recommendedAction' => "Diversify revenue by creating product bundles pairing '{$topName}' with adjacent complementary items, and promote high-margin secondary products to mitigate single-product dependency.",
                    'priority' => 'high',
                    'confidence' => 'high',
                ];
            }

            // 2. Customer Retention Opportunity
            $customerData = $payload['customers'] ?? [];
            $repeatRate = $customerData['repeatPurchaseRatePercentage'] ?? null;
            $uniqueCustomers = $customerData['uniqueCustomersCount'] ?? 0;

            if ($repeatRate !== null && $uniqueCustomers >= 2 && $repeatRate < 35) {
                $generatedRecommendations[] = [
                    'category' => 'customer_retention',
                    'title' => "Substantial Retention Opportunity: Repeat Purchase Rate at {$repeatRate}%",
                    'explanation' => "Only {$repeatRate}% of your customers made repeat purchases during this period ({$customerData['repeatCustomersCount']} of {$uniqueCustomers} customers). Increasing repeat transactions has a significantly lower acquisition cost than acquiring new buyers.",
                    'evidence' => [
                        [
                            'metricName' => 'repeatPurchaseRatePercentage',
                            'metricValue' => $repeatRate,
                            'formattedValue' => "{$repeatRate}%",
                            'sourceField' => 'customers.repeatPurchaseRatePercentage',
                        ],
                        [
                            'metricName' => 'uniqueCustomersCount',
                            'metricValue' => $uniqueCustomers,
                            'formattedValue' => (string) $uniqueCustomers,
                            'sourceField' => 'customers.uniqueCustomersCount',
                        ],
                    ],
                    'recommendedAction' => "Deploy an automated 14-day post-purchase email sequence offering a time-limited incentive or complementary product recommendation to first-time buyers.",
                    'priority' => 'high',
                    'confidence' => 'high',
                ];
            }

            // 3. Sales Growth / Period-over-Period Performance
            $sales = $payload['sales'] ?? [];
            $revGrowth = $sales['periodOverPeriodRevenueGrowthRate'] ?? null;
            $orderGrowth = $sales['periodOverPeriodOrderGrowthRate'] ?? null;

            if ($revGrowth !== null && $revGrowth < 0) {
                $declinePct = abs(round($revGrowth * 100, 1));
                $generatedRecommendations[] = [
                    'category' => 'sales_growth',
                    'title' => "Revenue Declined by {$declinePct}% Period-over-Period",
                    'explanation' => "Recognized sales revenue decreased by {$declinePct}% relative to the comparison period. Completed orders changed by " . ($orderGrowth !== null ? ($orderGrowth * 100) . "%" : "an unmeasured factor") . ".",
                    'evidence' => [
                        [
                            'metricName' => 'periodOverPeriodRevenueGrowthRate',
                            'metricValue' => $revGrowth,
                            'formattedValue' => "-{$declinePct}%",
                            'sourceField' => 'sales.periodOverPeriodRevenueGrowthRate',
                        ],
                    ],
                    'recommendedAction' => "Audit marketing conversion channels, inspect checkout drop-offs, and re-engage dormant high-value customers from your 'Champions' and 'At Risk' RFM segments.",
                    'priority' => 'critical',
                    'confidence' => 'high',
                ];
            }

            // 4. Data Quality / Missing Cost Audit
            $products = $payload['products'] ?? [];
            $missingCosts = $products['missingCostProductCount'] ?? 0;

            if ($missingCosts > 0) {
                $generatedRecommendations[] = [
                    'category' => 'product_profitability',
                    'title' => "Missing Unit Cost Data for {$missingCosts} Sold Product(s)",
                    'explanation' => "Gross profit and margins could not be calculated accurately for {$missingCosts} item(s) because cost prices (COGS) are missing from your uploaded order catalog.",
                    'evidence' => [
                        [
                            'metricName' => 'missingCostProductCount',
                            'metricValue' => $missingCosts,
                            'formattedValue' => (string) $missingCosts,
                            'sourceField' => 'products.missingCostProductCount',
                        ],
                    ],
                    'recommendedAction' => "Update your product catalog with unit cost prices to enable full gross margin tracking and accurate profitability analytics.",
                    'priority' => 'medium',
                    'confidence' => 'high',
                ];
            }

            // 5. Trend Anomalies
            $anomalies = $payload['trends']['anomalies'] ?? [];
            foreach ($anomalies as $anomaly) {
                if ($anomaly['type'] === 'spike') {
                    $generatedRecommendations[] = [
                        'category' => 'performance_anomalies',
                        'title' => "Revenue Spike Detected on {$anomaly['date']}",
                        'explanation' => $anomaly['description'],
                        'evidence' => [
                            [
                                'metricName' => 'zScore',
                                'metricValue' => $anomaly['zScore'],
                                'formattedValue' => "+{$anomaly['zScore']} SD",
                                'sourceField' => 'trends.anomalies.zScore',
                            ],
                        ],
                        'recommendedAction' => "Analyze what drove outsized sales on {$anomaly['date']} (promotions, specific marketing campaigns, or wholesale buyers) to replicate the strategy.",
                        'priority' => 'medium',
                        'confidence' => 'high',
                    ];
                }
            }

            // Persist accepted recommendations
            foreach ($generatedRecommendations as $recData) {
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

            // Record usage
            if ($business->organization) {
                UsageRecord::create([
                    'organization_id' => $business->organization->id,
                    'business_id' => $business->id,
                    'metric' => 'recommendation_generation',
                    'quantity' => count($generatedRecommendations),
                    'metadata' => [
                        'job_id' => $recJob->id,
                        'recommendations_count' => count($generatedRecommendations),
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
}
