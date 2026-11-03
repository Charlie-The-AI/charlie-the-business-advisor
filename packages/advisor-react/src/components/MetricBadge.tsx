'use client';

export interface MetricBadgeProps {
  label: string;
  value: string | number;
  changePct?: number;
  subtitle?: string;
  className?: string;
}

export function MetricBadge({
  label,
  value,
  changePct,
  subtitle,
  className = '',
}: MetricBadgeProps) {
  return (
    <div
      style={{
        padding: '16px',
        borderRadius: '12px',
        backgroundColor: '#111827',
        border: '1px solid #1f2937',
        color: '#f9fafb',
        fontFamily: 'inherit',
      }}
      className={className}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>{label}</span>
        {changePct !== undefined && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '9999px',
              backgroundColor: changePct >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
              color: changePct >= 0 ? '#34d399' : '#fb7185',
              border: `1px solid ${changePct >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
            }}
          >
            {changePct >= 0 ? `+${changePct}%` : `${changePct}%`}
          </span>
        )}
      </div>

      <div style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '4px' }}>
        {value}
      </div>

      {subtitle && (
        <div style={{ fontSize: '11px', color: '#6b7280' }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}
