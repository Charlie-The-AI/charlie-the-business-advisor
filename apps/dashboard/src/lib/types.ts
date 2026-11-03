export interface BusinessMetric {
  title: string;
  value: string;
  changePct?: number;
  changePeriod?: string;
  isPositive?: boolean;
  subtitle?: string;
}

export interface ParetoContributor {
  id: string;
  name: string;
  revenueMinorUnits: number;
  revenueFormatted: string;
  contributionPercentage: number;
  cumulativePercentage: number;
  isVital: boolean;
}

export interface RecommendationEvidence {
  metricName: string;
  metricValue: number | string;
  formattedValue: string;
  sourceField: string;
}

export interface Recommendation {
  id: string;
  category: 'revenue_concentration' | 'customer_retention' | 'sales_growth' | 'product_profitability' | 'cash_flow';
  title: string;
  explanation: string;
  evidence: RecommendationEvidence[];
  recommended_action: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  confidence: 'high' | 'medium' | 'low';
  status: 'new' | 'reviewing' | 'accepted' | 'dismissed';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Array<{ metric: string; value: string | number }>;
  created_at: string;
}

export interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  business_scopes: string[];
  last_used_at: string | null;
  created_at: string;
}

export interface PlanItem {
  code: string;
  name: string;
  tagline: string;
  price_monthly_minor_units: number;
  price_formatted: string;
  currency: string;
  features: string[];
  quotas: {
    monthly_snapshots: number;
    monthly_ai_tokens: number;
    max_businesses: number;
    max_members: number;
  };
}

export interface OrganizationEntitlements {
  organization: {
    id: string;
    name: string;
    plan: string;
    billing_status: string;
    paystack_customer_code?: string;
    paystack_subscription_code?: string;
  };
  entitlements: {
    snapshots: {
      used: number;
      quota: number;
      is_unlimited: boolean;
      percentage_used: number;
      can_ingest: boolean;
    };
    ai_tokens: {
      used: number;
      quota: number;
      is_unlimited: boolean;
      percentage_used: number;
      can_chat: boolean;
    };
    businesses: {
      count: number;
      max_allowed: number;
      is_unlimited: boolean;
      can_create: boolean;
    };
  };
}
