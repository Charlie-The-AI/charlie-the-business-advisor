'use client';

import {
  useCharlieAnalytics,
  RevenueCard,
  ParetoChart,
  CustomerSegments,
  TopProductsChart,
  RecommendationCard,
  useAdvisorChat,
} from '@charlie-the-ai/advisor-react';
import type { CharlieOrder, CharlieCustomer } from '@charlie-the-ai/advisor-types';
import { useState } from 'react';

const sampleOrders: CharlieOrder[] = [
  {
    id: 'ord_solar_01',
    customerId: 'cust_01',
    status: 'completed',
    currency: 'NGN',
    placedAt: '2026-02-15T10:00:00Z',
    subtotalMinor: 85000000, // ₦850,000.00
    discountMinor: 0,
    taxMinor: 0,
    shippingMinor: 0,
    totalMinor: 85000000,
    refundedMinor: 0,
    tags: ['inverters'],
    items: [
      {
        productId: 'prod_inv_5k',
        productName: '5kVA Solar Inverter',
        quantity: 1,
        unitPriceMinor: 85000000,
        discountMinor: 0,
      },
    ],
  },
  {
    id: 'ord_solar_02',
    customerId: 'cust_02',
    status: 'completed',
    currency: 'NGN',
    placedAt: '2026-02-18T14:30:00Z',
    subtotalMinor: 42000000, // ₦420,000.00
    discountMinor: 0,
    taxMinor: 0,
    shippingMinor: 0,
    totalMinor: 42000000,
    refundedMinor: 0,
    tags: ['batteries'],
    items: [
      {
        productId: 'prod_bat_48',
        productName: '48V Lithium Battery',
        quantity: 1,
        unitPriceMinor: 42000000,
        discountMinor: 0,
      },
    ],
  },
  {
    id: 'ord_solar_03',
    customerId: 'cust_01', // Repeat buyer!
    status: 'completed',
    currency: 'NGN',
    placedAt: '2026-02-22T09:15:00Z',
    subtotalMinor: 23000000, // ₦230,000.00
    discountMinor: 0,
    taxMinor: 0,
    shippingMinor: 0,
    totalMinor: 23000000,
    refundedMinor: 0,
    tags: ['panels'],
    items: [
      {
        productId: 'prod_panel_450',
        productName: 'Mono Solar Panel 450W',
        quantity: 1,
        unitPriceMinor: 23000000,
        discountMinor: 0,
      },
    ],
  },
];

const sampleCustomers: CharlieCustomer[] = [
  {
    id: 'cust_01',
    name: 'Ibrahim Danladi',
    email: 'ibrahim@example.com',
  },
  {
    id: 'cust_02',
    name: 'Ngozi Eze',
    email: 'ngozi@example.com',
  },
];

export default function NextJsIntegrationPage() {
  const { sales, pareto, customers, products, hasData } = useCharlieAnalytics(sampleOrders, {
    currency: 'NGN',
    customers: sampleCustomers,
    paretoThresholdPercentage: 80,
  });

  const { messages, sendMessage, isSending } = useAdvisorChat();
  const [inputQuestion, setInputQuestion] = useState('');

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim()) return;
    sendMessage(inputQuestion);
    setInputQuestion('');
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 8px 0' }}>
          🎩 Charlie Business Intelligence — Next.js 15 Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
          100% free, deterministic business analytics and AI advisory embedded in Next.js App Router.
        </p>
      </header>

      {hasData && sales && (
        <div style={{ marginBottom: '28px' }}>
          <RevenueCard sales={sales} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {hasData && products && (
          <TopProductsChart products={products} />
        )}

        {hasData && customers && (
          <CustomerSegments customers={customers} />
        )}
      </div>

      {hasData && pareto && (
        <div style={{ marginBottom: '28px' }}>
          <ParetoChart contributors={pareto.contributors} targetThresholdPercentage={80} />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        {/* Recommendation Section */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
            Actionable Business Recommendations
          </h3>
          <RecommendationCard
            recommendation={{
              id: 'rec_01',
              priority: 'high',
              category: 'revenue_concentration',
              title: 'Diversify Catalog Beyond Inverters',
              description: 'Inverters generate over 56% of total revenue. Introducing bundle promotions with batteries will protect margin and reduce single-sku dependency.',
              suggestedActions: [
                'Create a turnkey Inverter + Battery package',
                'Discount accessories when purchased with panels',
              ],
              groundingStatus: 'verified',
              evidence: [
                { metric: 'netRevenue', value: '₦1,500,000.00', isVerified: true },
                { metric: 'topProductContribution', value: '56.7%', isVerified: true },
              ],
            }}
          />
        </div>

        {/* AI Business Assistant */}
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>
            Grounded Business AI Assistant
          </h3>
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            backgroundColor: '#111827',
            border: '1px solid #1f2937',
            color: '#f9fafb',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messages.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                  Ask questions like "What was my net revenue?" or "Who is my best customer?"
                </p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: m.role === 'user' ? '#1e3a8a' : '#1f2937',
                    fontSize: '13px',
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                  }}>
                    {m.content}
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAsk} style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input
                type="text"
                placeholder="Ask Charlie about your numbers..."
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #374151',
                  backgroundColor: '#030712',
                  color: '#f9fafb',
                  fontSize: '13px',
                }}
              />
              <button
                type="submit"
                disabled={isSending}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isSending ? 'not-allowed' : 'pointer',
                }}
              >
                {isSending ? 'Thinking...' : 'Ask'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
