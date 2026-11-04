'use client';

export interface RecommendationCardData {
  id: string;
  title: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category?: string;
  description: string;
  suggestedActions?: string[];
  recommendedAction?: string;
  groundingStatus?: 'verified' | 'unverified' | 'flagged';
  evidence?: Array<{
    metric: string;
    value: string | number;
    isVerified?: boolean;
  }>;
}

export interface RecommendationCardProps {
  recommendation: RecommendationCardData;
  onActionClick?: (action: string) => void;
  className?: string;
}

export function RecommendationCard({
  recommendation,
  onActionClick,
  className = '',
}: RecommendationCardProps) {
  const priorityColor =
    recommendation.priority === 'critical'
      ? '#ef4444'
      : recommendation.priority === 'high'
      ? '#f59e0b'
      : recommendation.priority === 'medium'
      ? '#3b82f6'
      : '#6b7280';

  const groundingBadge = recommendation.groundingStatus === 'verified' ? (
    <span style={{ fontSize: '11px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
      ✓ Grounded in Data
    </span>
  ) : recommendation.groundingStatus === 'flagged' ? (
    <span style={{ fontSize: '11px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
      ⚠ Review Numbers
    </span>
  ) : null;

  const actions = recommendation.suggestedActions || (recommendation.recommendedAction ? [recommendation.recommendedAction] : []);

  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '12px',
        backgroundColor: '#111827',
        border: '1px solid #1f2937',
        color: '#f9fafb',
        fontFamily: 'inherit',
      }}
      className={className}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: priorityColor,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: `${priorityColor}15`,
              border: `1px solid ${priorityColor}30`,
            }}
          >
            {recommendation.priority}
          </span>
          {recommendation.category && (
            <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'capitalize' }}>
              {recommendation.category.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {groundingBadge}
      </div>

      <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>
        {recommendation.title}
      </h4>

      <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#d1d5db', lineHeight: 1.5 }}>
        {recommendation.description}
      </p>

      {actions.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#9ca3af', marginBottom: '8px' }}>
            Recommended Action Steps
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#e5e7eb', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {actions.map((act, idx) => (
              <li
                key={idx}
                style={{ cursor: onActionClick ? 'pointer' : 'default' }}
                onClick={() => onActionClick?.(act)}
              >
                {act}
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendation.evidence && recommendation.evidence.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', paddingTop: '12px', borderTop: '1px solid #1f2937' }}>
          {recommendation.evidence.map((ev, idx) => (
            <span
              key={idx}
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#1f2937',
                color: '#9ca3af',
              }}
            >
              {ev.metric}: <strong style={{ color: '#e5e7eb' }}>{String(ev.value)}</strong>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
