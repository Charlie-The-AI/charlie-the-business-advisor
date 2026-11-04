'use client';

import type { ProductAnalytics } from '@charlie-the-ai/advisor-types';

export interface TopProductsChartProps {
  products: ProductAnalytics;
  title?: string;
  maxItems?: number;
  className?: string;
}

export function TopProductsChart({
  products,
  title = 'Top Products by Revenue',
  maxItems = 5,
  className = '',
}: TopProductsChartProps) {
  const topList = products.bestSellersByRevenue.slice(0, maxItems);

  return (
    <div
      style={{
        padding: '24px',
        borderRadius: '12px',
        backgroundColor: '#111827',
        border: '1px solid #1f2937',
        color: '#f9fafb',
        fontFamily: 'inherit',
      }}
      className={className}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#f3f4f6' }}>
          {title}
        </h3>
        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
          {products.totalProductsSold} distinct products sold
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {topList.map((item, idx) => (
          <div key={item.productId || idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ fontWeight: 500, color: '#e5e7eb' }}>
                {idx + 1}. {item.productName}
              </span>
              <span style={{ fontWeight: 600, color: '#10b981' }}>
                {item.revenueFormatted}
              </span>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: '6px',
                width: '100%',
                backgroundColor: '#1f2937',
                borderRadius: '3px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(2, item.revenuePercentage))}%`,
                  backgroundColor: '#3b82f6',
                  borderRadius: '3px',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#9ca3af' }}>
              <span>{item.unitsSold} units</span>
              <span>{item.revenuePercentage}% of total</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
