import { z } from "zod";

export const GranularitySchema = z.enum(["day", "week", "month", "quarter", "year"]);
export type Granularity = z.infer<typeof GranularitySchema>;

export const AnalyticsPeriodSchema = z.object({
  from: z.string().datetime({ offset: true }),
  to: z.string().datetime({ offset: true }),
  granularity: GranularitySchema.default("day"),
  timezone: z.string().default("UTC"),
});

export type AnalyticsPeriod = z.infer<typeof AnalyticsPeriodSchema>;
