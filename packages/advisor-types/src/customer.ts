import { z } from "zod";

export const CustomerSchema = z.object({
  id: z.string().min(1),
  businessId: z.string().optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  createdAt: z.string().datetime({ offset: true }),
  firstOrderAt: z.string().datetime({ offset: true }).optional(),
  lastOrderAt: z.string().datetime({ offset: true }).optional(),
  totalOrders: z.number().int().nonnegative().default(0),
  totalSpendMinorUnits: z.number().int().nonnegative().default(0),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.unknown()).optional(),
});

export type Customer = z.infer<typeof CustomerSchema>;
