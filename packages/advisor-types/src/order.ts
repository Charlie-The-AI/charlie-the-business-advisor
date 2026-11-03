import { z } from "zod";
import { CurrencyCodeSchema } from "./currency.js";

/**
 * Valid order lifecycle statuses with strict accounting implications
 */
export const OrderStatusSchema = z.enum([
  "completed", // Recognized in net sales
  "cancelled", // Excluded from recognized revenue
  "pending", // Unrecognized pending confirmation
  "refunded", // Fully refunded - offset from net sales
  "partially_refunded", // Partially refunded - net sales reflects remaining unrecognized value
  "failed", // Excluded from recognized revenue
]);

export type OrderStatus = z.infer<typeof OrderStatusSchema>;

/**
 * Individual item line within an order
 */
export const OrderItemSchema = z.object({
  id: z.string().min(1),
  orderId: z.string().optional(),
  productId: z.string().min(1),
  productName: z.string().min(1),
  sku: z.string().optional(),
  category: z.string().optional().default("Uncategorized"),
  quantity: z.number().int().positive(),
  // All monetary fields in integer minor units (e.g. cents/kobo)
  unitPriceMinorUnits: z.number().int().nonnegative(),
  totalPriceMinorUnits: z.number().int().nonnegative(),
  unitCostMinorUnits: z.number().int().nonnegative().optional(), // Cost of Goods Sold (COGS)
  totalCostMinorUnits: z.number().int().nonnegative().optional(),
  discountMinorUnits: z.number().int().nonnegative().optional().default(0),
  taxMinorUnits: z.number().int().nonnegative().optional().default(0),
  metadata: z.record(z.unknown()).optional(),
});

export type OrderItem = z.input<typeof OrderItemSchema>;
export type OrderItemOutput = z.infer<typeof OrderItemSchema>;

/**
 * Standardized Order contract
 */
export const OrderSchema = z.object({
  id: z.string().min(1),
  businessId: z.string().optional(),
  customerId: z.string().optional(), // Nullable if guest checkout
  customerEmail: z.string().email().optional(),
  customerName: z.string().optional(),
  status: OrderStatusSchema,
  currency: CurrencyCodeSchema,
  createdAt: z.string().datetime({ offset: true }),
  completedAt: z.string().datetime({ offset: true }).optional(),
  cancelledAt: z.string().datetime({ offset: true }).optional(),
  // Monetary totals in integer minor units
  subtotalMinorUnits: z.number().int().nonnegative(),
  taxMinorUnits: z.number().int().nonnegative().optional().default(0),
  shippingMinorUnits: z.number().int().nonnegative().optional().default(0),
  discountMinorUnits: z.number().int().nonnegative().optional().default(0),
  totalMinorUnits: z.number().int().nonnegative(),
  refundMinorUnits: z.number().int().nonnegative().optional().default(0),
  items: z.array(OrderItemSchema).min(1),
  tags: z.array(z.string()).optional().default([]),
  metadata: z.record(z.unknown()).optional(),
});

export type Order = z.input<typeof OrderSchema>;
export type OrderOutput = z.infer<typeof OrderSchema>;
