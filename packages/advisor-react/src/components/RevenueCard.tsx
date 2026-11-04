'use client';

import type { SalesSummary, CurrencyCode } from '@charlie-the-ai/advisor-types';

export interface RevenueCardProps {
  sales: SalesSummary;
  title?: string;
  className?: string;
  currency?: CurrencyCode;
}

export function RevenueCard({
  sales,
  title = 'Revenue & Sales Summary',
  className = '',
}: RevenueCardProps) {
  const growthRate = sales.periodOverPeriodRevenueGrowthRate;

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
        {growthRate !== null && growthRate !== undefined && (
          <span
            style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '2px 10px',
              borderRadius: '9999px',
              backgroundColor: growthRate >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
              color: growthRate >= 0 ? '#34d399' : '#fb7185',
              border: `1px solid ${growthRate >= 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
            }}
          >
            {growthRate >= 0 ? `+${growthRate}%` : `${growthRate}%`} vs prev
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Net Revenue</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981' }}>
            {sales.netRevenueFormatted}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Gross Sales</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#e5e7eb' }}>
            {sales.grossSalesFormatted}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Completed Orders</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#e5e7eb' }}>
            {sales.totalCompletedOrders.toLocaleString()}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Average Order Value</div>
          <div style={{ fontSize: '20px', fontWeight: 600, color: '#60a5fa' }}>
            {sales.averageOrderValueFormatted}
          </div>
        </div>
      </div>
    </div>
  );
}
