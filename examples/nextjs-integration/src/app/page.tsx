'use client';

import { useBusinessAnalytics, MetricBadge, ParetoChart, RecommendationWidget } from '@charlie-the-ai/advisor-react';
import type { Order, Recommendation } from '@charlie-the-ai/advisor-types';

const sampleOrders: Order[] = [
  {
    id: 'ord_solar_01',
    status: 'completed',
    currency: 'NGN',
    createdAt: '2026-02-15T10:00:00Z',
    completedAt: '2026-02-15T10:15:00Z',
    subtotalMinorUnits: 850000000,
    totalMinorUnits: 850000000,
    customerId: 'cust_01',
    items: [
      {
        id: 'it_01',
        productId: 'prod_inv_5k',
        productName: '5kVA Solar Inverter',
        quantity: 1,
        unitPriceMinorUnits: 850000000,
        totalPriceMinorUnits: 850000000,
      },
    ],
  },
  {
    id: 'ord_solar_02',
    status: 'completed',
    currency: 'NGN',
    createdAt: '2026-02-18T14:30:00Z',
    completedAt: '2026-02-18T14:45:00Z',
    subtotalMinorUnits: 420000000,
    totalMinorUnits: 420000000,
    customerId: 'cust_02',
    items: [
      {
        id: 'it_02',
        productId: 'prod_bat_48',
        productName: '48V Lithium Battery',
        quantity: 1,
        unitPriceMinorUnits: 420000000,
        totalPriceMinorUnits: 420000000,
      },
    ],
  },
  {
    id: 'ord_solar_03',
    status: 'completed',
    currency: 'NGN',
    createdAt: '2026-02-22T09:15:00Z',
    completedAt: '2026-02-22T09:30:00Z',
    subtotalMinorUnits: 230000000,
    totalMinorUnits: 230000000,
    customerId: 'cust_03',
    items: [
      {
        id: 'it_03',
        productId: 'prod_panel_450',
        productName: 'Mono Solar Panel 450W',
        quantity: 1,
        unitPriceMinorUnits: 230000000,
        totalPriceMinorUnits: 230000000,
      },
    ],
  },
];

const sampleRecommendation: Recommendation = {
  id: 'rec_example_01',
  businessId: 'biz_solar_store',
  snapshotId: 'snap_123',
  category: 'revenue_concentration',
  title: 'High Revenue Concentration in Inverters',
  explanation: '5kVA Solar Inverters generate 56.6% of your total store sales revenue.',
  evidence: [
    {
      metricName: 'topProductContribution',
      metricValue: 56.6,
      formattedValue: '56.6%',
      sourceField: 'pareto.products.contributors.0.contributionPercentage',
    },
  ],
  recommendedAction: 'Bundle inverters with batteries to balance category revenue risk.',
  priority: 'high',
  confidence: 'high',
  status: 'new',
  period: {
    from: '2026-02-01T00:00:00Z',
    to: '2026-03-01T00:00:00Z',
  },
  createdAt: '2026-03-01T12:00:00Z',
  updatedAt: '2026-03-01T12:00:00Z',
};

export default function NextJsIntegrationPage() {
  const { sales, pareto, hasData } = useBusinessAnalytics(sampleOrders, {
    currency: 'NGN',
    paretoThresholdPercentage: 80,
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 8px 0' }}>
          Next.js + Charlie Advisor React Integration
        </h1>
        <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
          Deterministic business analytics and Pareto concentration embedded in Next.js App Router.
        </p>
      </header>

      {hasData && sales && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <MetricBadge label="Recognized Net Revenue" value={sales.netRevenueFormatted} changePct={12.4} subtitle="3 completed orders" />
          <MetricBadge label="Average Order Value" value={sales.averageOrderValueFormatted} subtitle="Per completed checkout" />
          <MetricBadge label="Completed Orders" value={sales.totalCompletedOrders} subtitle="100% completion rate" />
        </div>
      )}

      {hasData && pareto && (
        <div style={{ marginBottom: '32px' }}>
          <ParetoChart contributors={pareto.contributors} targetThresholdPercentage={80} />
        </div>
      )}

      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
          Active AI Advisory Playbook
        </h3>
        <RecommendationWidget
          recommendation={sampleRecommendation}
          onAccept={(id) => alert(`Accepted action: ${id}`)}
          onDismiss={(id) => alert(`Dismissed action: ${id}`)}
        />
      </div>
    </div>
  );
}
