'use client';

import { useState } from 'react';
import { Header } from '../../components/Header';
import { UsageMeter } from '../../components/UsageMeter';
import { PlanCard } from '../../components/PlanCard';
import { mockBillingData, mockPlans } from '../../lib/mockData';
import { CreditCard, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function BillingPage() {
  const [billingData, setBillingData] = useState(mockBillingData);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  const handleUpgrade = (planCode: string) => {
    setUpgradingPlan(planCode);

    // Simulate Paystack checkout initialization
    setTimeout(() => {
      const mockPaystackRef = 'pstk_ref_' + Math.random().toString(36).substring(2, 10);
      setCheckoutUrl(`https://checkout.paystack.com/pay/${mockPaystackRef}`);
      setUpgradingPlan(null);
    }, 600);
  };

  const currentPlanCode = billingData.organization.plan;

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Subscription Plans & Usage Entitlements"
        description="Manage commercial SaaS tiers, monitor snapshot and token consumption, and manage Paystack billing."
      />

      <main className="p-8 max-w-7xl mx-auto space-y-10">
        {/* Paystack Checkout Modal / Notification */}
        {checkoutUrl && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/40 via-blue-950/30 to-gray-900 border border-blue-500/40 shadow-xl flex items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-400" />
                <span>Paystack Checkout Session Ready</span>
              </h4>
              <p className="text-xs text-blue-200/90 mt-1">
                Click proceed to complete your subscription upgrade securely on Paystack's PCI-DSS compliant checkout portal.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setCheckoutUrl(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <a
                href={checkoutUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
              >
                Proceed to Paystack ↗
              </a>
            </div>
          </div>
        )}

        {/* Current Entitlements Meters */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Current Period Usage & Quota Meters</span>
            </h3>
            <span className="text-xs text-gray-400">
              Next billing renewal: April 1, 2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <UsageMeter
              label="Monthly Analytics Snapshots"
              used={billingData.entitlements.snapshots.used}
              quota={billingData.entitlements.snapshots.quota}
              isUnlimited={billingData.entitlements.snapshots.is_unlimited}
              unit="snapshots"
            />
            <UsageMeter
              label="AI Advisory Tokens"
              used={billingData.entitlements.ai_tokens.used}
              quota={billingData.entitlements.ai_tokens.quota}
              isUnlimited={billingData.entitlements.ai_tokens.is_unlimited}
              unit="tokens"
            />
            <UsageMeter
              label="Active Business Profiles"
              used={billingData.entitlements.businesses.count}
              quota={billingData.entitlements.businesses.max_allowed}
              isUnlimited={billingData.entitlements.businesses.is_unlimited}
              unit="businesses"
            />
          </div>
        </section>

        {/* Subscription Plan Catalog */}
        <section className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Choose Your Growth Plan</h3>
            <p className="text-xs text-gray-400">
              Upgrade or adjust your plan tier anytime. Transparent pricing with instant Paystack activation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockPlans.map((plan) => (
              <PlanCard
                key={plan.code}
                plan={plan}
                isCurrentPlan={plan.code === currentPlanCode}
                onUpgrade={handleUpgrade}
                isLoading={upgradingPlan === plan.code}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
