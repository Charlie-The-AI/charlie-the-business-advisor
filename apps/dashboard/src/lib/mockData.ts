import { Recommendation, ParetoContributor, ApiKeyItem, PlanItem, OrganizationEntitlements } from './types';

export const mockOverviewMetrics = {
  netRevenue: {
    title: 'Recognized Net Revenue',
    value: '₦18,450,000.00',
    changePct: -14.2,
    changePeriod: 'vs previous 30 days',
    isPositive: false,
    subtitle: 'After refunds & promotional discounts',
  },
  gmv: {
    title: 'Gross Merchandise Value (GMV)',
    value: '₦21,800,000.00',
    changePct: -8.5,
    changePeriod: 'vs previous 30 days',
    isPositive: false,
    subtitle: 'Total checkout order volume before deductions',
  },
  completedOrders: {
    title: 'Completed Orders',
    value: '342',
    changePct: -11.0,
    changePeriod: 'vs previous 30 days',
    isPositive: false,
    subtitle: '94.2% completion rate',
  },
  aov: {
    title: 'Average Order Value (AOV)',
    value: '₦53,947.36',
    changePct: 3.2,
    changePeriod: 'vs previous 30 days',
    isPositive: true,
    subtitle: 'Net revenue per completed order',
  },
  repeatPurchaseRate: {
    title: 'Repeat Purchase Rate',
    value: '22.4%',
    changePct: -5.8,
    changePeriod: 'vs benchmark (35%)',
    isPositive: false,
    subtitle: '54 returning of 241 unique buyers',
  },
  giniIndex: {
    title: 'Revenue Gini Index',
    value: '0.64',
    changePct: 0.12,
    changePeriod: 'High concentration risk',
    isPositive: false,
    subtitle: 'Top 3 products generate 81.4% of sales',
  },
};

export const mockParetoProducts: ParetoContributor[] = [
  {
    id: 'prod_1',
    name: '5kVA Hybrid Solar Inverter',
    revenueMinorUnits: 850000000,
    revenueFormatted: '₦8,500,000.00',
    contributionPercentage: 46.1,
    cumulativePercentage: 46.1,
    isVital: true,
  },
  {
    id: 'prod_2',
    name: '48V 100Ah Lithium Battery Pack',
    revenueMinorUnits: 420000000,
    revenueFormatted: '₦4,200,000.00',
    contributionPercentage: 22.8,
    cumulativePercentage: 68.9,
    isVital: true,
  },
  {
    id: 'prod_3',
    name: 'Mono Solar Panel 450W (Pallet of 10)',
    revenueMinorUnits: 230000000,
    revenueFormatted: '₦2,300,000.00',
    contributionPercentage: 12.5,
    cumulativePercentage: 81.4,
    isVital: true, // crosses 80% threshold
  },
  {
    id: 'prod_4',
    name: 'Solar MPPT Charge Controller 60A',
    revenueMinorUnits: 120000000,
    revenueFormatted: '₦1,200,000.00',
    contributionPercentage: 6.5,
    cumulativePercentage: 87.9,
    isVital: false,
  },
  {
    id: 'prod_5',
    name: 'Heavy Duty DC Surge Protector',
    revenueMinorUnits: 95000000,
    revenueFormatted: '₦950,000.00',
    contributionPercentage: 5.1,
    cumulativePercentage: 93.0,
    isVital: false,
  },
  {
    id: 'prod_6',
    name: 'Installation Cable Kit & MC4 Connectors',
    revenueMinorUnits: 75000000,
    revenueFormatted: '₦750,000.00',
    contributionPercentage: 4.1,
    cumulativePercentage: 97.1,
    isVital: false,
  },
  {
    id: 'prod_7',
    name: 'Smart Energy Monitor & WiFi Dongle',
    revenueMinorUnits: 55000000,
    revenueFormatted: '₦550,000.00',
    contributionPercentage: 2.9,
    cumulativePercentage: 100.0,
    isVital: false,
  },
];

export const mockRecommendations: Recommendation[] = [
  {
    id: 'rec_001',
    category: 'revenue_concentration',
    title: 'Revenue Vulnerability: 3 Products Generate 81.4% of Sales',
    explanation:
      "Your business exhibits critical revenue concentration. The '5kVA Hybrid Solar Inverter' alone accounts for 46.1% of recognized sales. Any component supply shortage or new market competitor directly threatens operational cash flow.",
    evidence: [
      {
        metricName: 'vitalContributorsPercentage',
        metricValue: 42.8,
        formattedValue: '42.8% of catalogue',
        sourceField: 'pareto.products.vitalContributorsPercentage',
      },
      {
        metricName: 'topProductContribution',
        metricValue: 46.1,
        formattedValue: '46.1%',
        sourceField: 'pareto.products.contributors.0.contributionPercentage',
      },
      {
        metricName: 'giniCoefficient',
        metricValue: 0.64,
        formattedValue: '0.64',
        sourceField: 'pareto.products.giniCoefficient',
      },
    ],
    recommended_action:
      "Package slower-moving accessories (e.g., MPPT Controllers and Smart Energy Monitors) into all-in-one installation bundles paired with the 5kVA Inverter to lift secondary inventory turnover by an estimated 18%.",
    priority: 'critical',
    confidence: 'high',
    status: 'new',
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 'rec_002',
    category: 'customer_retention',
    title: 'First-to-Second Purchase Drop-Off: 22.4% Repeat Purchase Rate',
    explanation:
      'Only 54 of your 241 customers have placed a second order. Analysis indicates that customers purchasing Solar Panels have a 78% drop-off within 45 days, despite typically needing expansion accessories or system maintenance.',
    evidence: [
      {
        metricName: 'repeatPurchaseRatePercentage',
        metricValue: 22.4,
        formattedValue: '22.4%',
        sourceField: 'customers.repeatPurchaseRatePercentage',
      },
      {
        metricName: 'uniqueCustomersCount',
        metricValue: 241,
        formattedValue: '241 customers',
        sourceField: 'customers.uniqueCustomersCount',
      },
    ],
    recommended_action:
      'Implement an automated post-delivery retention email sequence sent at day 21 offering an exclusive 10% voucher for battery accessories or preventive maintenance checkups.',
    priority: 'high',
    confidence: 'high',
    status: 'reviewing',
    created_at: '2026-03-01T10:05:00Z',
  },
  {
    id: 'rec_003',
    category: 'sales_growth',
    title: 'Period Downturn: Net Revenue Declined by 14.2%',
    explanation:
      'Recognized net sales decreased by ₦3,050,000 compared to the previous 30-day window. The primary driver was a 11.0% decline in completed orders (342 orders vs 384 previously) combined with elevated refund adjustments (₦1,250,000).',
    evidence: [
      {
        metricName: 'periodOverPeriodRevenueGrowthRate',
        metricValue: -0.142,
        formattedValue: '-14.2%',
        sourceField: 'sales.periodOverPeriodRevenueGrowthRate',
      },
      {
        metricName: 'periodOverPeriodOrderGrowthRate',
        metricValue: -0.11,
        formattedValue: '-11.0%',
        sourceField: 'sales.periodOverPeriodOrderGrowthRate',
      },
    ],
    recommended_action:
      'Review technical support tickets associated with recent refunds to identify component defects, and re-engage dormant high-value customers from last quarter with special trade-in financing.',
    priority: 'high',
    confidence: 'high',
    status: 'accepted',
    created_at: '2026-03-01T10:10:00Z',
  },
  {
    id: 'rec_004',
    category: 'product_profitability',
    title: 'Missing Unit Costs on 2 Catalog SKUs',
    explanation:
      "Unit Cost of Goods Sold (COGS) is absent for 'Heavy Duty DC Surge Protector' and 'Smart Energy Monitor', preventing accurate gross margin analytics for 8.0% of your total product line.",
    evidence: [
      {
        metricName: 'missingCostProductCount',
        metricValue: 2,
        formattedValue: '2 SKUs',
        sourceField: 'products.missingCostProductCount',
      },
    ],
    recommended_action:
      'Update supplier procurement unit costs for the remaining 2 catalog items in your inventory settings to activate complete margin and profitability tracking.',
    priority: 'medium',
    confidence: 'high',
    status: 'new',
    created_at: '2026-03-01T10:15:00Z',
  },
];

export const mockInitialChatMessages = [
  {
    id: 'msg_welcome',
    role: 'assistant' as const,
    content:
      "Hello! I'm Charlie, your AI Business Growth Advisor. I've analyzed your latest financial snapshot (Period: Feb 1 - Mar 2, 2026). Your net revenue is ₦18,450,000 across 342 completed orders. How can I assist you with your business performance today?",
    citations: [
      { metric: 'sales.netRevenueFormatted', value: '₦18,450,000.00' },
      { metric: 'sales.totalCompletedOrders', value: 342 },
    ],
    created_at: '2026-03-01T10:00:00Z',
  },
];

export const mockApiKeys: ApiKeyItem[] = [
  {
    id: 'key_01',
    name: 'Production Shopify Sync Worker',
    key_prefix: 'cta_live_sh8921a',
    scopes: ['snapshots:write', 'snapshots:read'],
    business_scopes: ['*'],
    last_used_at: '10 minutes ago',
    created_at: '2026-02-15',
  },
  {
    id: 'key_02',
    name: 'Staging Integration Bot',
    key_prefix: 'cta_test_stg7721',
    scopes: ['*'],
    business_scopes: ['*'],
    last_used_at: '2 hours ago',
    created_at: '2026-02-20',
  },
];

export const mockBillingData: OrganizationEntitlements = {
  organization: {
    id: 'org_apex_01',
    name: 'Apex Energy Solutions Ltd',
    plan: 'growth',
    billing_status: 'active',
    paystack_customer_code: 'CUS_991829',
    paystack_subscription_code: 'SUB_growth_7721',
  },
  entitlements: {
    snapshots: {
      used: 34,
      quota: 100,
      is_unlimited: false,
      percentage_used: 34.0,
      can_ingest: true,
    },
    ai_tokens: {
      used: 285400,
      quota: 1000000,
      is_unlimited: false,
      percentage_used: 28.5,
      can_chat: true,
    },
    businesses: {
      count: 2,
      max_allowed: 5,
      is_unlimited: false,
      can_create: true,
    },
  },
};

export const mockPlans: PlanItem[] = [
  {
    code: 'free',
    name: 'Starter',
    tagline: 'For independent solo founders and boutique businesses.',
    price_monthly_minor_units: 0,
    price_formatted: 'Free',
    currency: 'NGN',
    features: [
      '1 business profile',
      '10 analytics snapshots / month',
      '100,000 AI tokens / month',
      'Pareto 80/20 concentration analysis',
      'Standard CSV & JSON export',
    ],
    quotas: {
      monthly_snapshots: 10,
      monthly_ai_tokens: 100000,
      max_businesses: 1,
      max_members: 2,
    },
  },
  {
    code: 'growth',
    name: 'Growth',
    tagline: 'For growing merchants scaling revenues and product lines.',
    price_monthly_minor_units: 2500000,
    price_formatted: '₦25,000.00/mo',
    currency: 'NGN',
    features: [
      'Up to 5 business profiles',
      '100 analytics snapshots / month',
      '1,000,000 AI tokens / month',
      'Pareto & RFM customer cohorts',
      'Automated AI advisory recommendations',
      'Natural language business chat',
      '5 team members',
    ],
    quotas: {
      monthly_snapshots: 100,
      monthly_ai_tokens: 1000000,
      max_businesses: 5,
      max_members: 5,
    },
  },
  {
    code: 'pro',
    name: 'Pro Advisor',
    tagline: 'For high-volume brands and e-commerce enterprises.',
    price_monthly_minor_units: 7500000,
    price_formatted: '₦75,000.00/mo',
    currency: 'NGN',
    features: [
      'Up to 20 business profiles',
      '500 analytics snapshots / month',
      '5,000,000 AI tokens / month',
      'Advanced statistical anomaly detection',
      'Custom AI strategic playbooks',
      'Dedicated webhook integrations',
      '25 team members',
    ],
    quotas: {
      monthly_snapshots: 500,
      monthly_ai_tokens: 5000000,
      max_businesses: 20,
      max_members: 25,
    },
  },
  {
    code: 'platform',
    name: 'Platform',
    tagline: 'For holding companies, agencies, and financial aggregators.',
    price_monthly_minor_units: 25000000,
    price_formatted: '₦250,000.00/mo',
    currency: 'NGN',
    features: [
      'Unlimited business profiles',
      'Unlimited analytics snapshots',
      'Unlimited AI tokens',
      'Priority queue processing',
      'Custom LLM fine-tuning & prompt grounding',
      'Dedicated account manager',
    ],
    quotas: {
      monthly_snapshots: -1,
      monthly_ai_tokens: -1,
      max_businesses: -1,
      max_members: -1,
    },
  },
];
