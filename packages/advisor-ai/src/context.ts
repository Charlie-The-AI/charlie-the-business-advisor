import { RecommendationInput, ChatInput } from "./types.js";

export interface CompactAnalyticsContext {
  currency: string;
  period: { from: string; to: string };
  financialSummary: {
    grossSalesFormatted: string;
    netRevenueFormatted: string;
    totalOrders: number;
    completedOrders: number;
    averageOrderValueFormatted: string;
    totalRefundsFormatted: string;
    periodOverPeriodRevenueGrowthRate: number | null;
  };
  paretoConcentration: {
    products: {
      vitalFewCount: number;
      totalCount: number;
      giniCoefficient: number;
      topContributors: Array<{ name: string; revenueFormatted: string; contributionPercentage: number }>;
    };
    customers: {
      vitalFewCount: number;
      totalCount: number;
      giniCoefficient: number;
      topContributors: Array<{ name: string; revenueFormatted: string; contributionPercentage: number }>;
    };
  };
  customerBehavior: {
    totalCustomers: number;
    repeatCustomers: number;
    repeatPurchaseRatePercentage: number | null;
    averagePurchaseFrequency: number | null;
    rfmSegmentBreakdown: Array<{ segment: string; count: number }>;
  };
  topProducts: Array<{ name: string; unitsSold: number; revenueFormatted: string; grossMarginPercentage: number | null }>;
  dataQualityWarnings: string[];
}

/**
 * Builds a compact, PII-sanitized context payload from an AnalyticsSnapshot.
 */
export function buildAnalyticsContext(
  input: RecommendationInput | ChatInput
): CompactAnalyticsContext {
  const s = input.analytics;
  const includePII = input.includeCustomerDetails ?? false;

  // Sanitize top customer names if PII is disallowed
  const customerContributors = s.pareto.customers.contributors.slice(0, 5).map((c: { name: string; revenueFormatted: string; contributionPercentage: number }, idx: number) => ({
    name: includePII ? sanitizeUntrustedString(c.name) : `Customer Cohort #${idx + 1}`,
    revenueFormatted: c.revenueFormatted,
    contributionPercentage: c.contributionPercentage,
  }));

  const productContributors = s.pareto.products.contributors.slice(0, 5).map((p: { name: string; revenueFormatted: string; contributionPercentage: number }) => ({
    name: sanitizeUntrustedString(p.name),
    revenueFormatted: p.revenueFormatted,
    contributionPercentage: p.contributionPercentage,
  }));

  // Aggregate RFM segment counts
  const segmentCounts = new Map<string, number>();
  for (const rfm of s.customers.rfmSegments) {
    segmentCounts.set(rfm.segment, (segmentCounts.get(rfm.segment) || 0) + 1);
  }
  const rfmSegmentBreakdown = Array.from(segmentCounts.entries()).map(([segment, count]) => ({
    segment,
    count,
  }));

  const topProducts = s.products.bestSellersByRevenue.slice(0, 5).map((p: { productName: string; unitsSold: number; revenueFormatted: string; grossMarginPercentage: number | null }) => ({
    name: sanitizeUntrustedString(p.productName),
    unitsSold: p.unitsSold,
    revenueFormatted: p.revenueFormatted,
    grossMarginPercentage: p.grossMarginPercentage,
  }));

  return {
    currency: s.currency,
    period: { from: s.period.from, to: s.period.to },
    financialSummary: {
      grossSalesFormatted: s.sales.grossSalesFormatted,
      netRevenueFormatted: s.sales.netRevenueFormatted,
      totalOrders: s.sales.totalOrders,
      completedOrders: s.sales.totalCompletedOrders,
      averageOrderValueFormatted: s.sales.averageOrderValueFormatted,
      totalRefundsFormatted: s.sales.netRevenueFormatted, // will be formatted with total refunds
      periodOverPeriodRevenueGrowthRate: s.sales.periodOverPeriodRevenueGrowthRate,
    },
    paretoConcentration: {
      products: {
        vitalFewCount: s.pareto.products.vitalContributorsCount,
        totalCount: s.pareto.products.totalContributors,
        giniCoefficient: s.pareto.products.giniCoefficient,
        topContributors: productContributors,
      },
      customers: {
        vitalFewCount: s.pareto.customers.vitalContributorsCount,
        totalCount: s.pareto.customers.totalContributors,
        giniCoefficient: s.pareto.customers.giniCoefficient,
        topContributors: customerContributors,
      },
    },
    customerBehavior: {
      totalCustomers: s.customers.uniqueCustomersCount,
      repeatCustomers: s.customers.repeatCustomersCount,
      repeatPurchaseRatePercentage: s.customers.repeatPurchaseRatePercentage,
      averagePurchaseFrequency: s.customers.averagePurchaseFrequency,
      rfmSegmentBreakdown,
    },
    topProducts,
    dataQualityWarnings: s.dataQuality.warnings,
  };
}

/**
 * Sanitizes untrusted strings to prevent prompt injection and delimiter breakout.
 */
export function sanitizeUntrustedString(input: string): string {
  if (!input) return "";
  return input
    .replace(/[\r\n\t]+/g, " ")
    .replace(/[`${}\\]/g, "")
    .replace(/(?:system:|user:|assistant:|ignore\s+previous\s+instructions)/gi, "[redacted]")
    .trim()
    .slice(0, 100);
}
