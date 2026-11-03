import { z } from "zod";
import { CurrencyCodeSchema } from "./currency.js";
import {
  SalesSummarySchema,
  ParetoResultSchema,
  CustomerAnalyticsSchema,
  ProductAnalyticsSchema,
  TrendAnalyticsSchema,
} from "./analytics.js";

export const DataQualityReportSchema = z.object({
  totalOrdersAnalyzed: z.number().int().nonnegative(),
  totalRecordsEvaluated: z.number().int().nonnegative(),
  missingCustomerIdentifiersCount: z.number().int().nonnegative(),
  missingCostItemsCount: z.number().int().nonnegative(),
  warnings: z.array(z.string()),
  missingFields: z.array(z.string()),
  scorePercentage: z.number().min(0).max(100),
});

export type DataQualityReport = z.infer<typeof DataQualityReportSchema>;

export const AnalyticsSnapshotSchema = z.object({
  schemaVersion: z.string().default("1.0.0"),
  calculationVersion: z.string().default("1.0.0"),
  snapshotId: z.string().min(1), // SHA-256 deterministic hash
  businessId: z.string().min(1),
  currency: CurrencyCodeSchema,
  createdAt: z.string().datetime({ offset: true }),
  period: z.object({
    from: z.string().datetime({ offset: true }),
    to: z.string().datetime({ offset: true }),
    timezone: z.string().default("UTC"),
  }),
  sales: SalesSummarySchema,
  pareto: z.object({
    products: ParetoResultSchema,
    customers: ParetoResultSchema,
    categories: ParetoResultSchema,
  }),
  customers: CustomerAnalyticsSchema,
  products: ProductAnalyticsSchema,
  trends: TrendAnalyticsSchema,
  dataQuality: DataQualityReportSchema,
});

export type AnalyticsSnapshot = z.infer<typeof AnalyticsSnapshotSchema>;
