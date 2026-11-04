'use client';

import type { CustomerAnalytics } from '@charlie-the-ai/advisor-types';

export interface CustomerSegmentsProps {
  customers: CustomerAnalytics;
  title?: string;
  className?: string;
}

export function CustomerSegments({
  customers,
  title = 'Customer Segmentation (RFM)',
  className = '',
}: CustomerSegmentsProps) {
  // Aggregate segments
  const segmentMap = new Map<string, number>();
  for (const item of customers.rfmSegments) {
    segmentMap.set(item.segment, (segmentMap.get(item.segment) || 0) + 1);
  }

  const segments = Array.from(segmentMap.entries()).map(([name, count]) => ({
    name,
    count,
    percentage: customers.uniqueCustomersCount > 0
      ? Math.round((count / customers.uniqueCustomersCount) * 100)
      : 0,
  }));

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
          {customers.uniqueCustomersCount} total customers ({customers.repeatPurchaseRatePercentage ?? 0}% repeat rate)
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
        {segments.map((seg) => (
          <div
            key={seg.name}
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f9fafb', marginBottom: '4px' }}>
              {seg.name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#60a5fa' }}>
                {seg.count}
              </span>
              <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                {seg.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
