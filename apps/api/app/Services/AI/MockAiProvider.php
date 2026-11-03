<?php

namespace App\Services\AI;

use App\Services\AI\Contracts\AiProviderInterface;
use App\Services\AI\DTOs\AiChatResult;
use App\Services\AI\DTOs\AiRecommendationResult;

class MockAiProvider implements AiProviderInterface
{
    public function generateStructuredRecommendations(array $analyticsContext, array $options = []): AiRecommendationResult
    {
        $recommendations = [];

        // 1. Check Product Pareto Concentration
        $pareto = $analyticsContext['pareto']['products'] ?? [];
        $vitalPct = $pareto['vitalContributorsPercentage'] ?? 0;
        $vitalCount = $pareto['vitalContributorsCount'] ?? 0;
        $totalContributors = $pareto['totalContributors'] ?? 0;
        $topItem = $pareto['contributors'][0] ?? null;

        if ($totalContributors >= 2 && $vitalPct <= 40 && $topItem) {
            $recommendations[] = [
                'category' => 'revenue_concentration',
                'title' => "High Revenue Concentration: Top {$vitalCount} Product(s) Generate 80% of Sales",
                'explanation' => "Your top product '{$topItem['name']}' generates {$topItem['contributionPercentage']}% of total catalogue revenue. High concentration increases vulnerability to supply chain bottlenecks or demand shifts.",
                'evidence' => [
                    [
                        'metricName' => 'vitalContributorsPercentage',
                        'metricValue' => $vitalPct,
                        'formattedValue' => "{$vitalPct}%",
                        'sourceField' => 'pareto.products.vitalContributorsPercentage',
                    ],
                    [
                        'metricName' => 'topProductContribution',
                        'metricValue' => $topItem['contributionPercentage'],
                        'formattedValue' => "{$topItem['contributionPercentage']}%",
                        'sourceField' => 'pareto.products.contributors.0.contributionPercentage',
                    ],
                ],
                'recommendedAction' => "Diversify revenue by creating bundle offers pairing '{$topItem['name']}' with secondary items, and test promotional discounts on under-performing inventory.",
                'priority' => 'high',
                'confidence' => 'high',
            ];
        }

        // 2. Check Customer Retention
        $customers = $analyticsContext['customers'] ?? [];
        $repeatRate = $customers['repeatPurchaseRatePercentage'] ?? null;
        $uniqueCount = $customers['uniqueCustomersCount'] ?? 0;

        if ($repeatRate !== null && $uniqueCount >= 2 && $repeatRate < 35) {
            $recommendations[] = [
                'category' => 'customer_retention',
                'title' => "High Customer Churn: Repeat Purchase Rate at {$repeatRate}%",
                'explanation' => "Only {$repeatRate}% of buyers return for repeat purchases ({$customers['repeatCustomersCount']} of {$uniqueCount} customers). Maximizing customer lifetime value requires post-purchase nurturing.",
                'evidence' => [
                    [
                        'metricName' => 'repeatPurchaseRatePercentage',
                        'metricValue' => $repeatRate,
                        'formattedValue' => "{$repeatRate}%",
                        'sourceField' => 'customers.repeatPurchaseRatePercentage',
                    ],
                ],
                'recommendedAction' => "Launch an automated post-purchase email flow within 14 days of first order delivery with personalized replenishment suggestions.",
                'priority' => 'high',
                'confidence' => 'high',
            ];
        }

        // 3. Check Sales Period-over-Period Growth
        $sales = $analyticsContext['sales'] ?? [];
        $revGrowth = $sales['periodOverPeriodRevenueGrowthRate'] ?? null;

        if ($revGrowth !== null && $revGrowth < 0) {
            $declinePct = abs(round($revGrowth * 100, 1));
            $recommendations[] = [
                'category' => 'sales_growth',
                'title' => "Revenue Declined by {$declinePct}% Relative to Previous Period",
                'explanation' => "Net recognized revenue experienced a {$declinePct}% downturn period-over-period.",
                'evidence' => [
                    [
                        'metricName' => 'periodOverPeriodRevenueGrowthRate',
                        'metricValue' => $revGrowth,
                        'formattedValue' => "-{$declinePct}%",
                        'sourceField' => 'sales.periodOverPeriodRevenueGrowthRate',
                    ],
                ],
                'recommendedAction' => "Investigate marketing channel drop-offs and re-engage dormant high-value customers using special reactivation offers.",
                'priority' => 'critical',
                'confidence' => 'high',
            ];
        }

        // 4. Check Missing Cost Catalog Data
        $products = $analyticsContext['products'] ?? [];
        $missingCosts = $products['missingCostProductCount'] ?? 0;

        if ($missingCosts > 0) {
            $recommendations[] = [
                'category' => 'product_profitability',
                'title' => "Incomplete Cost Tracking on {$missingCosts} Product(s)",
                'explanation' => "Unit cost of goods sold (COGS) is absent for {$missingCosts} item(s), preventing accurate gross margin analytics.",
                'evidence' => [
                    [
                        'metricName' => 'missingCostProductCount',
                        'metricValue' => $missingCosts,
                        'formattedValue' => (string) $missingCosts,
                        'sourceField' => 'products.missingCostProductCount',
                    ],
                ],
                'recommendedAction' => "Add supplier unit costs to your product catalog to unlock full margin visibility and optimize pricing.",
                'priority' => 'medium',
                'confidence' => 'high',
            ];
        }

        return new AiRecommendationResult(
            recommendations: $recommendations,
            promptTokens: 850,
            completionTokens: 420,
            totalTokens: 1270,
            model: 'mock-gpt-4o',
            estimatedCostCents: 1
        );
    }

    public function generateChatResponse(
        array $conversationHistory,
        array $analyticsContext,
        array $availableTools = [],
        array $options = []
    ): AiChatResult {
        $lastUserMsg = '';
        foreach (array_reverse($conversationHistory) as $msg) {
            if ($msg['role'] === 'user') {
                $lastUserMsg = strtolower($msg['content']);
                break;
            }
        }

        $sales = $analyticsContext['sales'] ?? [];
        $products = $analyticsContext['products'] ?? [];
        $customers = $analyticsContext['customers'] ?? [];
        $pareto = $analyticsContext['pareto'] ?? [];

        $citations = [];
        $content = '';

        if (str_contains($lastUserMsg, 'product') || str_contains($lastUserMsg, 'best seller') || str_contains($lastUserMsg, 'item')) {
            $bestSeller = $products['bestSellersByRevenue'][0] ?? null;
            if ($bestSeller) {
                $content = "Your top-performing product by revenue is '{$bestSeller['productName']}', generating {$bestSeller['revenueFormatted']} ({$bestSeller['revenuePercentage']}% of total revenue) across {$bestSeller['unitsSold']} units sold.";
                $citations[] = [
                    'metric' => 'products.bestSellersByRevenue.0.revenueFormatted',
                    'value' => $bestSeller['revenueFormatted'],
                ];
            } else {
                $content = "No product sales records were found in the current period.";
            }
        } elseif (str_contains($lastUserMsg, 'decline') || str_contains($lastUserMsg, 'revenue') || str_contains($lastUserMsg, 'sales')) {
            $growth = $sales['periodOverPeriodRevenueGrowthRate'] ?? 0;
            $netRev = $sales['netRevenueFormatted'] ?? '₦0.00';
            $declinePct = abs(round($growth * 100, 1));

            if ($growth < 0) {
                $content = "Your recognized sales revenue was {$netRev}, representing a {$declinePct}% decline compared to the previous period. The primary contributing factors were lower completed order volume ({$sales['totalCompletedOrders']} completed orders) and customer churn.";
            } else {
                $content = "Your recognized net revenue is {$netRev} across {$sales['totalCompletedOrders']} completed orders, with an average order value of {$sales['averageOrderValueFormatted']}.";
            }

            $citations[] = [
                'metric' => 'sales.netRevenueFormatted',
                'value' => $netRev,
            ];
            $citations[] = [
                'metric' => 'sales.periodOverPeriodRevenueGrowthRate',
                'value' => $growth,
            ];
        } elseif (str_contains($lastUserMsg, 'customer') || str_contains($lastUserMsg, 'retention')) {
            $rate = $customers['repeatPurchaseRatePercentage'] ?? 0;
            $content = "Your customer retention analysis shows {$customers['uniqueCustomersCount']} unique customers with a repeat purchase rate of {$rate}%. {$customers['repeatCustomersCount']} customers made more than one completed purchase during this reporting period.";
            $citations[] = [
                'metric' => 'customers.repeatPurchaseRatePercentage',
                'value' => "{$rate}%",
            ];
        } else {
            $content = "Based on your latest analytics snapshot, your business achieved {$sales['netRevenueFormatted']} in recognized revenue across {$sales['totalCompletedOrders']} orders. How can I help you optimize sales, customer retention, or product margins?";
        }

        return new AiChatResult(
            content: $content,
            citations: $citations,
            toolCalls: [],
            promptTokens: 450,
            completionTokens: 180,
            totalTokens: 630,
            model: 'mock-gpt-4o',
            estimatedCostCents: 1
        );
    }

    public function estimateCostCents(int $promptTokens, int $completionTokens, string $model): int
    {
        return 1;
    }
}
