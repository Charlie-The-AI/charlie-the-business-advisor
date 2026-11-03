'use client';

import type { ParetoContributor } from '@charlie-the-ai/advisor-types';

export interface ParetoChartProps {
  contributors: ParetoContributor[];
  targetThresholdPercentage?: number;
  className?: string;
}

export function ParetoChart({
  contributors,
  targetThresholdPercentage = 80,
  className = '',
}: ParetoChartProps) {
  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: '#111827',
        border: '1px solid #1f2937',
        color: '#f9fafb',
      }}
      className={className}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600 }}>80/20 Revenue Distribution</h4>
          <span style={{ fontSize: '11px', color: '#9ca3af' }}>
            Target threshold: {targetThresholdPercentage}% cumulative revenue
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {contributors.map((c, i) => (
          <div
            key={c.id || i}
            style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: c.isVitalFew ? 'rgba(59, 130, 246, 0.08)' : 'rgba(31, 41, 55, 0.4)',
              border: `1px solid ${c.isVitalFew ? 'rgba(59, 130, 246, 0.3)' : '#374151'}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: c.isVitalFew ? '#3b82f6' : '#4b5563',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {i + 1}
                </span>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{c.name}</span>
                {c.isVitalFew && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(59, 130, 246, 0.2)',
                      color: '#93c5fd',
                    }}
                  >
                    Vital Contributor
                  </span>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{c.revenueFormatted}</span>
                <span style={{ fontSize: '11px', color: '#9ca3af', marginLeft: '6px' }}>
                  ({c.contributionPercentage}%)
                </span>
              </div>
            </div>

            <div style={{ width: '100%', height: '6px', backgroundColor: '#374151', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, c.contributionPercentage * 2)}%`,
                  backgroundColor: c.isVitalFew ? '#3b82f6' : '#6b7280',
                  borderRadius: '3px',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
