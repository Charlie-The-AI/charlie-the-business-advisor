import { z } from "zod";

export const RecommendationCategorySchema = z.enum([
  "sales_growth",
  "product_optimization",
  "customer_retention",
  "revenue_concentration",
  "pricing_opportunities",
  "product_profitability",
  "inventory_optimization",
  "performance_anomalies",
]);

export type RecommendationCategory = z.infer<typeof RecommendationCategorySchema>;

export const RecommendationPrioritySchema = z.enum(["critical", "high", "medium", "low"]);
export type RecommendationPriority = z.infer<typeof RecommendationPrioritySchema>;

export const RecommendationConfidenceSchema = z.enum(["high", "medium", "low"]);
export type RecommendationConfidence = z.infer<typeof RecommendationConfidenceSchema>;

export const RecommendationStatusSchema = z.enum([
  "new",
  "viewed",
  "accepted",
  "in_progress",
  "completed",
  "dismissed",
]);

export type RecommendationStatus = z.infer<typeof RecommendationStatusSchema>;

export const RecommendationEvidenceSchema = z.object({
  metricName: z.string(),
  metricValue: z.union([z.number(), z.string(), z.boolean()]),
  formattedValue: z.string(),
  baselineValue: z.union([z.number(), z.string()]).optional(),
  comparisonPeriod: z.string().optional(),
  sourceField: z.string(), // E.g., "sales.periodOverPeriodRevenueGrowthRate"
});

export type RecommendationEvidence = z.infer<typeof RecommendationEvidenceSchema>;

export const StructuredRecommendationSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  snapshotId: z.string(),
  category: RecommendationCategorySchema,
  title: z.string().min(5).max(150),
  explanation: z.string().min(20),
  evidence: z.array(RecommendationEvidenceSchema).min(1),
  recommendedAction: z.string().min(10),
  priority: RecommendationPrioritySchema,
  confidence: RecommendationConfidenceSchema,
  period: z.object({
    from: z.string().datetime({ offset: true }),
    to: z.string().datetime({ offset: true }),
  }),
  status: RecommendationStatusSchema.default("new"),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  dismissedReason: z.string().optional(),
});

export type StructuredRecommendation = z.infer<typeof StructuredRecommendationSchema>;
