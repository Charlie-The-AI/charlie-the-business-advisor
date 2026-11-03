'use client';

import Link from 'next/link';
import { Header } from '../components/Header';
import { MetricCard } from '../components/MetricCard';
import { ParetoBarChart } from '../components/ParetoBarChart';
import { RecommendationCard } from '../components/RecommendationCard';
import {
  mockOverviewMetrics,
  mockParetoProducts,
  mockRecommendations,
} from '../lib/mockData';
import {
  Sparkles,
  PieChart,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  Layers,
  Download,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const topRecommendations = mockRecommendations.slice(0, 2);

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Executive Performance Summary"
        description="Comprehensive deterministic business performance, revenue concentration, and grounded AI advisory."
      />

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Urgent AI Advisory Notice */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400 mt-0.5">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Revenue Concentration Risk Alert (Gini: 0.64)
              </h3>
              <p className="text-xs text-amber-200/90 leading-relaxed mt-0.5">
                Top 3 products generate 81.4% of your total recognized sales revenue. Supply chain disruption in inverter components would materially impact cash flow.
              </p>
            </div>
          </div>

          <Link
            href="/recommendations"
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-gray-950 text-xs font-bold flex items-center gap-1.5 transition flex-shrink-0"
          >
            <span>Review Actions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 6 Key Performance Metric Cards */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
              Core Performance Metrics
            </h3>
            <span className="text-xs text-gray-400">
              Deterministic Minor-Unit Precision (Zero Floating-Point Error)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard {...mockOverviewMetrics.netRevenue} />
            <MetricCard {...mockOverviewMetrics.gmv} />
            <MetricCard {...mockOverviewMetrics.completedOrders} />
            <MetricCard {...mockOverviewMetrics.aov} />
            <MetricCard {...mockOverviewMetrics.repeatPurchaseRate} />
            <MetricCard {...mockOverviewMetrics.giniIndex} />
          </div>
        </section>

        {/* Two-Column Deep Dive Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Pareto 80/20 Snapshot */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-400" />
                <span>Revenue Pareto Breakdown</span>
              </h3>
              <Link
                href="/pareto"
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
              >
                <span>Full Analysis</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <ParetoBarChart
              contributors={mockParetoProducts}
              vitalCount={3}
              totalContributors={7}
              targetThresholdPercentage={80}
            />
          </div>

          {/* Right Column: Top Priority AI Recommendations */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Priority AI Advisory Actions</span>
              </h3>
              <Link
                href="/recommendations"
                className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
              >
                <span>View All (4)</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-4">
              {topRecommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
