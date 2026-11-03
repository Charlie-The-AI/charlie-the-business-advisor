'use client';

import { useState } from 'react';
import { Header } from '../../components/Header';
import { ApiKeyTable } from '../../components/ApiKeyTable';
import { Code2, Terminal, Copy, Check, ExternalLink } from 'lucide-react';

export default function DeveloperPortalPage() {
  const [activeTab, setActiveTab] = useState<'node' | 'laravel' | 'curl'>('node');
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  const snippets = {
    node: `import { Charlie, createOrderAdapter } from 'charlie-the-business-advisor';

// 1. Initialize Charlie Client
const charlie = new Charlie({
  currency: 'NGN',
  timezone: 'Africa/Lagos',
});

// 2. Run deterministic business analysis offline (zero network needed)
const result = charlie.analyze(rawOrders);
console.log('Net Sales Revenue:', result.sales.netRevenueFormatted);
console.log('80/20 Vital Few:', result.pareto.products.vitalContributorsCount);

// 3. (Optional) Sync snapshot to Charlie SaaS Advisor
const snapshot = charlie.generateSnapshot(rawOrders, {
  businessId: 'biz_apex_01',
});

await fetch('https://api.advisor.charlie.com/api/v1/analytics/snapshots', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer cta_live_your_api_key_here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(snapshot),
});`,

    laravel: `<?php

namespace App\Jobs;

use Illuminate\Support\Facades\Http;

class SyncAnalyticsToCharlieJob
{
    public function handle(): void
    {
        $response = Http::withToken(config('services.charlie.api_key'))
            ->post('https://api.advisor.charlie.com/api/v1/analytics/snapshots', [
                'business_id' => config('services.charlie.business_id'),
                'schema_version' => '1.0.0',
                'calculation_version' => '1.0.0',
                'currency' => 'NGN',
                'period_from' => now()->subDays(30)->toIso8601String(),
                'period_to' => now()->toIso8601String(),
                'net_revenue_minor_units' => 1845000000,
                'gross_sales_minor_units' => 2180000000,
                'total_orders' => 363,
                'total_completed_orders' => 342,
                'average_order_value_minor_units' => 5394736,
                'payload' => [...],
            ]);
    }
}`,

    curl: `curl -X POST https://api.advisor.charlie.com/api/v1/analytics/snapshots \\
  -H "Authorization: Bearer cta_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "business_id": "biz_apex_01",
    "schema_version": "1.0.0",
    "calculation_version": "1.0.0",
    "currency": "NGN",
    "period_from": "2026-02-01T00:00:00Z",
    "period_to": "2026-03-02T23:59:59Z",
    "net_revenue_minor_units": 1845000000,
    "gross_sales_minor_units": 2180000000,
    "total_orders": 363,
    "total_completed_orders": 342,
    "average_order_value_minor_units": 5394736,
    "payload": {}
  }'`,
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[activeTab]);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="flex-1 pb-16">
      <Header
        title="Developer Integration Portal"
        description="Manage private API keys, explore integration SDKs, and configure automated snapshot ingestion."
      />

      <main className="p-8 max-w-7xl mx-auto space-y-10">
        {/* Scoped API Keys Management */}
        <section>
          <ApiKeyTable />
        </section>

        {/* Integration Code Snippets */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                <span>Quickstart Integration Guides</span>
              </h3>
              <p className="text-xs text-gray-400">
                Integrate Charlie directly into your TypeScript, Next.js, or Laravel applications.
              </p>
            </div>

            {/* Language Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-gray-900 border border-gray-800 text-xs">
              <button
                onClick={() => setActiveTab('node')}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === 'node' ? 'bg-blue-600 text-white font-medium' : 'text-gray-400 hover:text-white'
                }`}
              >
                TypeScript / Node.js
              </button>
              <button
                onClick={() => setActiveTab('laravel')}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === 'laravel' ? 'bg-blue-600 text-white font-medium' : 'text-gray-400 hover:text-white'
                }`}
              >
                PHP / Laravel
              </button>
              <button
                onClick={() => setActiveTab('curl')}
                className={`px-3 py-1 rounded-md transition ${
                  activeTab === 'curl' ? 'bg-blue-600 text-white font-medium' : 'text-gray-400 hover:text-white'
                }`}
              >
                cURL / REST
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-[#1f2937] bg-[#0d131f] overflow-hidden">
            <div className="p-3 bg-gray-900/60 border-b border-gray-800 flex items-center justify-between">
              <span className="text-xs font-mono text-gray-400">
                {activeTab === 'node'
                  ? 'npm install @charlie/analytics-core charlie-the-business-advisor'
                  : activeTab === 'laravel'
                  ? 'composer require charlie/advisor-laravel'
                  : 'cURL REST Ingestion'}
              </span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs flex items-center gap-1 transition"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? 'Copied' : 'Copy Snippet'}</span>
              </button>
            </div>

            <pre className="p-5 text-xs font-mono text-gray-200 overflow-x-auto leading-relaxed">
              <code>{snippets[activeTab]}</code>
            </pre>
          </div>
        </section>
      </main>
    </div>
  );
}
