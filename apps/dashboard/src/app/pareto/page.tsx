'use client';

import { useState } from 'react';
import { Header } from '../../components/Header';
import { ParetoBarChart } from '../../components/ParetoBarChart';
import { mockParetoProducts } from '../../lib/mockData';
import { PieChart, AlertTriangle, ShieldCheck, Info } from 'lucide-react';

export default function ParetoPage() {
  const [threshold, setThreshold] = useState<number>(80);

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Pareto 80/20 Distribution & Concentration Risk Engine"
        description="Identifies vital revenue drivers, Herfindahl-Hirschman concentration index, and catalog dependency vulnerabilities."
      />

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Statistical Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-[#111827] border border-[#1f2937]">
            <span className="text-xs font-medium text-gray-400 block mb-1">Concentration Status</span>
            <div className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>High Dependency</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Top 3 of 7 SKUs generate 81.4% of sales volume.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#111827] border border-[#1f2937]">
            <span className="text-xs font-medium text-gray-400 block mb-1">Gini Coefficient</span>
            <div className="text-xl font-bold text-white">0.64</div>
            <p className="text-xs text-gray-400 mt-2">
              Values above 0.50 indicate severe catalogue inequality.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#111827] border border-[#1f2937]">
            <span className="text-xs font-medium text-gray-400 block mb-1">Herfindahl Index (HHI)</span>
            <div className="text-xl font-bold text-white">2,842</div>
            <p className="text-xs text-rose-400 mt-2 font-medium">
              Above 2,500 threshold: highly concentrated portfolio.
            </p>
          </div>
        </div>

        {/* Interactive Threshold Slider */}
        <div className="p-5 rounded-xl bg-[#141d2e] border border-[#1e293b] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <span>Pareto Concentration Target Threshold:</span>
              <strong className="text-blue-400 text-base">{threshold}%</strong>
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">
              Adjust the threshold to compute the minimum number of products needed to satisfy that percentage of sales.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">50%</span>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-48 accent-blue-500 cursor-pointer"
            />
            <span className="text-xs text-gray-400">95%</span>
          </div>
        </div>

        {/* Visual Chart Component */}
        <ParetoBarChart
          contributors={mockParetoProducts}
          targetThresholdPercentage={threshold}
          vitalCount={3}
          totalContributors={7}
        />

        {/* Analytical Explanation Card */}
        <div className="p-5 rounded-xl bg-[#0d131f] border border-gray-800 text-xs text-gray-300 leading-relaxed flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold text-white mb-1">Pareto Analysis Methodology</h5>
            <p>
              Charlie's Pareto Engine computes exact decimal-safe cumulative revenue sums. Rather than presuming an arbitrary 20% contributor proportion, the algorithm ranks all catalogue entities descending by revenue contribution, aggregates cumulative minor units, and mathematically determines the earliest item whose cumulative threshold meets or exceeds the target.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
