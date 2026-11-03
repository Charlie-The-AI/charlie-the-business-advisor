'use client';

import { PlanItem } from '../lib/types';
import { Check, Sparkles } from 'lucide-react';

interface PlanCardProps {
  plan: PlanItem;
  isCurrentPlan: boolean;
  onUpgrade?: (planCode: string) => void;
  isLoading?: boolean;
}

export function PlanCard({
  plan,
  isCurrentPlan,
  onUpgrade,
  isLoading,
}: PlanCardProps) {
  return (
    <div
      className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
        isCurrentPlan
          ? 'bg-gradient-to-b from-blue-950/40 to-[#111827] border-blue-500 shadow-lg shadow-blue-500/10'
          : 'bg-[#111827] border-[#1f2937] hover:border-gray-700'
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-base font-bold text-white">{plan.name}</h4>
          {isCurrentPlan && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
              Current Plan
            </span>
          )}
        </div>

        <p className="text-xs text-gray-400 mb-4 h-9 leading-relaxed">{plan.tagline}</p>

        <div className="mb-6">
          <span className="text-2xl font-extrabold text-white tracking-tight">{plan.price_formatted}</span>
        </div>

        <div className="space-y-2.5 pt-4 border-t border-gray-800 text-xs">
          {plan.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-2 text-gray-300">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-gray-800">
        {isCurrentPlan ? (
          <button
            disabled
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold text-xs text-center cursor-default"
          >
            Active Subscription
          </button>
        ) : (
          <button
            onClick={() => onUpgrade?.(plan.code)}
            disabled={isLoading || plan.code === 'free'}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs text-center transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{plan.code === 'free' ? 'Default Tier' : `Upgrade to ${plan.name}`}</span>
          </button>
        )}
      </div>
    </div>
  );
}
