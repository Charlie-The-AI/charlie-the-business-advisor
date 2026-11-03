'use client';

import type { Recommendation } from '@charlie-the-ai/advisor-types';

export interface RecommendationWidgetProps {
  recommendation: Recommendation;
  onAccept?: (id: string) => void;
  onDismiss?: (id: string) => void;
  className?: string;
}

export function RecommendationWidget({
  recommendation,
  onAccept,
  onDismiss,
  className = '',
}: RecommendationWidgetProps) {
  const priorityColor =
    recommendation.priority === 'critical'
      ? '#f43f5e'
      : recommendation.priority === 'high'
      ? '#f59e0b'
      : '#3b82f6';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: priorityColor,
            padding: '2px 8px',
            borderRadius: '4px',
            backgroundColor: `${priorityColor}15`,
            border: `1px solid ${priorityColor}30`,
          }}
        >
          {recommendation.priority} Priority
        </span>

        <span style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'capitalize' }}>
          Status: {recommendation.status}
        </span>
      </div>

      <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 600, color: '#fff' }}>
        {recommendation.title}
      </h4>

      <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#d1d5db', lineHeight: 1.5 }}>
        {recommendation.explanation}
      </p>

      <div
        style={{
          padding: '12px',
          borderRadius: '8px',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          marginBottom: '16px',
        }}
      >
        <span
          style={{
            display: 'block',
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: '#60a5fa',
            marginBottom: '4px',
          }}
        >
          Recommended Action
        </span>
        <p style={{ margin: 0, fontSize: '12px', color: '#bfdbfe', fontWeight: 500 }}>
          {recommendation.recommendedAction}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        {onDismiss && (
          <button
            onClick={() => onDismiss(recommendation.id)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: '#9ca3af',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Dismiss
          </button>
        )}
        {onAccept && (
          <button
            onClick={() => onAccept(recommendation.id)}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#2563eb',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Accept Action
          </button>
        )}
      </div>
    </div>
  );
}
