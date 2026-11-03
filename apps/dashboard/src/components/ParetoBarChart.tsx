'use client';

import { ParetoContributor } from '../lib/types';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ParetoBarChartProps {
  contributors: ParetoContributor[];
  targetThresholdPercentage?: number;
  vitalCount?: number;
  totalContributors?: number;
}

export function ParetoBarChart({
  contributors,
  targetThresholdPercentage = 80,
  vitalCount = 3,
  totalContributors = 7,
}: ParetoBarChartProps) {
  return (
    <div className="p-6 rounded-xl bg-[#111827] border border-[#1f2937]">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-gray-800 gap-4">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <span>Product Revenue Pareto Distribution</span>
            <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              80/20 Concentration Risk
            </span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Visualizing the smallest set of products responsible for {targetThresholdPercentage}% of cumulative sales revenue.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="p-2.5 rounded-lg bg-[#141d2e] border border-blue-500/20 text-center">
            <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider">Vital Few</span>
            <span className="text-sm font-bold text-blue-400">
              {vitalCount} of {totalContributors} ({Math.round((vitalCount / totalContributors) * 100)}%)
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#141d2e] border border-amber-500/20 text-center">
            <span className="block text-gray-400 text-[10px] uppercase font-bold tracking-wider">Target Threshold</span>
            <span className="text-sm font-bold text-amber-400">{targetThresholdPercentage}% Sales</span>
          </div>
        </div>
      </div>

      {/* Contributor List with Visual Bars */}
      <div className="space-y-4">
        {contributors.map((item, index) => {
          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-lg border transition-all ${
                item.isVital
                  ? 'bg-blue-950/20 border-blue-500/30'
                  : 'bg-gray-800/20 border-gray-800 hover:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      item.isVital
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-200">{item.name}</span>
                  {item.isVital && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      Vital Contributor
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-white">{item.revenueFormatted}</span>
                  <span className="text-xs text-gray-400 ml-2">
                    ({item.contributionPercentage}% of total)
                  </span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-12 sm:col-span-9 flex flex-col gap-1">
                  {/* Individual Contribution */}
                  <div className="w-full bg-gray-800/80 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        item.isVital ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                      style={{ width: `${Math.min(100, item.contributionPercentage * 2)}%` }}
                    />
                  </div>
                </div>

                {/* Cumulative Percentage Pill */}
                <div className="col-span-12 sm:col-span-3 text-right">
                  <span className="text-[11px] text-gray-400">
                    Cumulative: <strong className="text-gray-200">{item.cumulativePercentage}%</strong>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
