'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  changePct?: number;
  changePeriod?: string;
  isPositive?: boolean;
  subtitle?: string;
}

export function MetricCard({
  title,
  value,
  changePct,
  changePeriod,
  isPositive,
  subtitle,
}: MetricCardProps) {
  return (
    <div className="p-5 rounded-xl bg-[#111827] border border-[#1f2937] hover:border-blue-500/30 transition-all shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-400">{title}</span>
        {changePct !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              changePct > 0
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : changePct < 0
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {changePct > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : changePct < 0 ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            <span>{Math.abs(changePct)}%</span>
          </div>
        )}
      </div>

      <div className="text-2xl font-bold text-white tracking-tight mb-1.5">{value}</div>

      {(subtitle || changePeriod) && (
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span>{subtitle}</span>
          {changePeriod && <span className="text-gray-400">{changePeriod}</span>}
        </div>
      )}
    </div>
  );
}
