import { z } from "zod";

/**
 * Single periodic sales aggregation point (daily, weekly, monthly)
 */
export const PeriodicSalesPointSchema = z.object({
  period: z.string(), // ISO Date or formatted label (e.g. "2026-03-01")
  grossSalesMinorUnits: z.number().int().nonnegative(),
  netRevenueMinorUnits: z.number().int(),
  netRevenueFormatted: z.string(),
  orderCount: z.number().int().nonnegative(),
  averageOrderValueMinorUnits: z.number().int().nonnegative(),
  averageOrderValueFormatted: z.string(),
});

export type PeriodicSalesPoint = z.infer<typeof PeriodicSalesPointSchema>;

/**
 * Comprehensive Sales Analytics Summary
 */
export const SalesSummarySchema = z.object({
  grossSalesMinorUnits: z.number().int().nonnegative(),
  grossSalesFormatted: z.string(),
  netRevenueMinorUnits: z.number().int(),
  netRevenueFormatted: z.string(),
  totalOrders: z.number().int().nonnegative(),
  totalCompletedOrders: z.number().int().nonnegative(),
  totalCancelledOrders: z.number().int().nonnegative(),
  totalRefundedOrders: z.number().int().nonnegative(),
  totalPendingOrders: z.number().int().nonnegative(),
  averageOrderValueMinorUnits: z.number().int().nonnegative(),
  averageOrderValueFormatted: z.string(),
  totalDiscountsMinorUnits: z.number().int().nonnegative(),
  totalTaxMinorUnits: z.number().int().nonnegative(),
  totalShippingMinorUnits: z.number().int().nonnegative(),
  totalRefundsMinorUnits: z.number().int().nonnegative(),
  periodOverPeriodRevenueGrowthRate: z.number().nullable(), // e.g. 0.15 = +15%, -0.20 = -20%
  periodOverPeriodOrderGrowthRate: z.number().nullable(),
  periodicBreakdown: z.array(PeriodicSalesPointSchema),
});

export type SalesSummary = z.infer<typeof SalesSummarySchema>;

/**
 * Pareto 80/20 & Concentration Analytics
 */
export const ParetoDimensionSchema = z.enum(["product", "customer", "category"]);
export type ParetoDimension = z.infer<typeof ParetoDimensionSchema>;

export const ParetoContributorSchema = z.object({
  id: z.string(),
  name: z.string(),
  revenueMinorUnits: z.number().int(),
  revenueFormatted: z.string(),
  contributionPercentage: z.number().min(0).max(100),
  cumulativePercentage: z.number().min(0).max(100),
  rank: z.number().int().positive(),
  isVitalFew: z.boolean(),
});

export type ParetoContributor = z.infer<typeof ParetoContributorSchema>;

export const ParetoResultSchema = z.object({
  dimension: ParetoDimensionSchema,
  thresholdPercentage: z.number().min(1).max(100), // Default 80
  totalRevenueMinorUnits: z.number().int(),
  totalContributors: z.number().int().nonnegative(),
  vitalContributorsCount: z.number().int().nonnegative(),
  vitalContributorsPercentage: z.number().min(0).max(100),
  giniCoefficient: z.number().min(0).max(1), // 0 = complete equality, 1 = complete concentration
  herfindahlHirschmanIndex: z.number().min(0).max(10000), // Standard economic concentration index
  contributors: z.array(ParetoContributorSchema),
});

export type ParetoResult = z.infer<typeof ParetoResultSchema>;

/**
 * RFM (Recency, Frequency, Monetary) Customer Segmentation
 */
export const RfmSegmentNameSchema = z.enum([
  "Champions",
  "Loyal Customers",
  "Potential Loyalists",
  "Recent Customers",
  "Promising",
  "Need Attention",
  "About to Sleep",
  "At Risk",
  "Cannot Lose Them",
  "Hibernating",
  "Lost",
]);

export type RfmSegmentName = z.infer<typeof RfmSegmentNameSchema>;

export const RfmCustomerScoreSchema = z.object({
  customerId: z.string(),
  customerName: z.string().optional(),
  customerEmail: z.string().optional(),
  recencyDays: z.number().int().nonnegative(),
  recencyScore: z.number().int().min(1).max(5),
  frequency: z.number().int().positive(),
  frequencyScore: z.number().int().min(1).max(5),
  monetaryMinorUnits: z.number().int().nonnegative(),
  monetaryScore: z.number().int().min(1).max(5),
  rfmScore: z.string(), // e.g. "555", "342"
  segment: RfmSegmentNameSchema,
});

export type RfmCustomerScore = z.infer<typeof RfmCustomerScoreSchema>;

/**
 * Customer Cohort Retention Point
 */
export const CohortMonthRetentionSchema = z.object({
  monthIndex: z.number().int().nonnegative(), // Month 0 = cohort origin, Month 1, etc.
  activeCustomers: z.number().int().nonnegative(),
  retentionRatePercentage: z.number().min(0).max(100),
});

export type CohortMonthRetention = z.infer<typeof CohortMonthRetentionSchema>;

export const CustomerCohortSchema = z.object({
  cohortMonth: z.string(), // e.g. "2026-01"
  cohortSize: z.number().int().nonnegative(),
  retention: z.array(CohortMonthRetentionSchema),
});

export type CustomerCohort = z.infer<typeof CustomerCohortSchema>;

/**
 * Customer Analytics Summary
 */
export const CustomerAnalyticsSchema = z.object({
  uniqueCustomersCount: z.number().int().nonnegative(),
  repeatCustomersCount: z.number().int().nonnegative(),
  newCustomersCount: z.number().int().nonnegative(),
  repeatPurchaseRatePercentage: z.number().min(0).max(100).nullable(),
  averagePurchaseFrequency: z.number().nonnegative().nullable(),
  averageRevenuePerCustomerMinorUnits: z.number().int().nonnegative().nullable(),
  averageRevenuePerCustomerFormatted: z.string().nullable(),
  averageCustomerRecencyDays: z.number().nonnegative().nullable(),
  rfmSegments: z.array(RfmCustomerScoreSchema),
  cohorts: z.array(CustomerCohortSchema),
  isInsufficientData: z.boolean(),
  dataWarnings: z.array(z.string()),
});

export type CustomerAnalytics = z.infer<typeof CustomerAnalyticsSchema>;

/**
 * Product Performance Item
 */
export const ProductPerformanceItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  category: z.string(),
  unitsSold: z.number().int().nonnegative(),
  revenueMinorUnits: z.number().int(),
  revenueFormatted: z.string(),
  revenuePercentage: z.number().min(0).max(100),
  grossProfitMinorUnits: z.number().int().nullable(), // Null if cost missing
  grossProfitFormatted: z.string().nullable(),
  grossMarginPercentage: z.number().nullable(), // Gross profit / revenue * 100
  hasCostData: z.boolean(),
});

export type ProductPerformanceItem = z.infer<typeof ProductPerformanceItemSchema>;

export const CategoryPerformanceItemSchema = z.object({
  category: z.string(),
  unitsSold: z.number().int().nonnegative(),
  revenueMinorUnits: z.number().int(),
  revenueFormatted: z.string(),
  revenuePercentage: z.number().min(0).max(100),
});

export type CategoryPerformanceItem = z.infer<typeof CategoryPerformanceItemSchema>;

export const ProductAnalyticsSchema = z.object({
  bestSellersByRevenue: z.array(ProductPerformanceItemSchema),
  bestSellersByUnits: z.array(ProductPerformanceItemSchema),
  worstPerformersByRevenue: z.array(ProductPerformanceItemSchema),
  categories: z.array(CategoryPerformanceItemSchema),
  totalProductsSold: z.number().int().nonnegative(),
  totalUnitsSold: z.number().int().nonnegative(),
  trackedProductsWithCostCount: z.number().int().nonnegative(),
  missingCostProductCount: z.number().int().nonnegative(),
  totalGrossProfitMinorUnits: z.number().int().nullable(),
  totalGrossProfitFormatted: z.string().nullable(),
  overallGrossMarginPercentage: z.number().nullable(),
});

export type ProductAnalytics = z.infer<typeof ProductAnalyticsSchema>;

/**
 * Trend Analytics and Anomaly Detection
 */
export const MovingAveragePointSchema = z.object({
  date: z.string(),
  revenueMinorUnits: z.number().int(),
  movingAverageMinorUnits: z.number().int(),
});

export type MovingAveragePoint = z.infer<typeof MovingAveragePointSchema>;

export const AnomalyPointSchema = z.object({
  date: z.string(),
  actualRevenueMinorUnits: z.number().int(),
  expectedRevenueMinorUnits: z.number().int(),
  zScore: z.number(),
  type: z.enum(["spike", "drop"]),
  isSignificant: z.boolean(),
  description: z.string(),
});

export type AnomalyPoint = z.infer<typeof AnomalyPointSchema>;

export const TrendAnalyticsSchema = z.object({
  sevenDayMovingAverage: z.array(MovingAveragePointSchema),
  thirtyDayMovingAverage: z.array(MovingAveragePointSchema),
  revenueVolatilityCoefficient: z.number().nonnegative(), // Standard deviation / mean
  periodComparison: z.object({
    currentPeriodRevenueMinorUnits: z.number().int(),
    previousPeriodRevenueMinorUnits: z.number().int(),
    absoluteDifferenceMinorUnits: z.number().int(),
    percentageChange: z.number().nullable(),
  }),
  anomalies: z.array(AnomalyPointSchema),
});

export type TrendAnalytics = z.infer<typeof TrendAnalyticsSchema>;
