<?php

namespace App\Console\Commands;

use App\Services\CharlieAnalyticsService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class SyncAnalyticsSnapshotCommand extends Command
{
    protected $signature = 'charlie:sync-analytics {--days=30 : Number of trailing days to analyze}';
    protected $description = 'Extracts local order data, normalizes into standard Charlie contracts, and syncs analytics snapshot';

    public function handle(CharlieAnalyticsService $charlie): int
    {
        $days = (int) $this->option('days');
        $from = Carbon::now()->subDays($days)->startOfDay();
        $to = Carbon::now()->endOfDay();

        $this->info("Analyzing business performance from {$from->toDateString()} to {$to->toDateString()}...");

        // In a real application, query Eloquent Order models:
        // $orders = Order::whereBetween('created_at', [$from, $to])->with('items')->get();
        // Here we simulate a standardized payload matching Charlie contracts:
        $snapshotPayload = [
            'schema_version' => '1.0.0',
            'calculation_version' => '1.0.0',
            'currency' => 'NGN',
            'period_from' => $from->toIso8601String(),
            'period_to' => $to->toIso8601String(),
            'net_revenue_minor_units' => 1845000000, // ₦18,450,000.00
            'gross_sales_minor_units' => 2180000000, // ₦21,800,000.00
            'total_orders' => 363,
            'total_completed_orders' => 342,
            'average_order_value_minor_units' => 5394736,
            'repeat_purchase_rate' => 22.4,
            'data_quality_score' => 96,
            'payload' => [
                'sales' => [
                    'netRevenueMinorUnits' => 1845000000,
                    'netRevenueFormatted' => '₦18,450,000.00',
                    'totalCompletedOrders' => 342,
                ],
                'pareto' => [
                    'products' => [
                        'totalContributors' => 7,
                        'vitalContributorsCount' => 3,
                        'vitalContributorsPercentage' => 42.8,
                        'giniCoefficient' => 0.64,
                    ],
                ],
            ],
        ];

        try {
            $result = $charlie->ingestSnapshot($snapshotPayload);
            $this->info("✓ Successfully synced snapshot {$result['snapshot']['id']} with quality score {$result['snapshot']['data_quality_score']}%");

            $this->info('Triggering AI recommendation generation in background...');
            return Command::SUCCESS;
        } catch (\Throwable $e) {
            $this->error("Failed to sync snapshot: {$e->getMessage()}");
            return Command::FAILURE;
        }
    }
}
