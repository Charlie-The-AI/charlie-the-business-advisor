import { z } from "zod";
import { CurrencyCodeSchema } from "./currency.js";
import type { Order } from "./order.js";

/**
 * Valid Charlie order lifecycle statuses with strict accounting implications.
 */
export const CharlieOrderStatusSchema = z.enum([
  "completed",          // Recognized in net revenue
  "pending",            // Unrecognized pending payment or fulfillment
  "cancelled",          // Excluded from recognized revenue
  "refunded",           // Fully refunded - deducted from gross revenue
  "partially_refunded", // Partially refunded - deducted proportionately
]);

export type CharlieOrderStatus = z.infer<typeof CharlieOrderStatusSchema>;

/**
 * Individual item line within a CharlieOrder.
 */
export const CharlieOrderItemSchema = z.object({
  productId: z.string().min(1, "Product ID must not be empty"),
  productName: z.string().min(1, "Product name must not be empty"),
  quantity: z.number().int().positive("Item quantity must be a positive integer"),
  unitPriceMinor: z.number().int().nonnegative("Unit price must be a non-negative integer in minor units"),
  discountMinor: z.number().int().nonnegative("Item discount must be a non-negative integer in minor units").optional().default(0),
  sku: z.string().optional(),
  category: z.string().optional(),
  unitCostMinor: z.number().int().nonnegative("Unit cost must be a non-negative integer in minor units").optional(),
});

export type CharlieOrderItem = z.infer<typeof CharlieOrderItemSchema>;

/**
 * Canonical CharlieOrder contract.
 * All monetary values represent integer minor units (e.g. 700000 = ₦7,000.00 in NGN kobo).
 */
export const CharlieOrderSchema = z
  .object({
    id: z.string().min(1, "Order ID must not be empty"),
    customerId: z.string().nullable().optional().default(null),
    placedAt: z
      .string()
      .min(1, "placedAt must be provided")
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "placedAt must be a valid ISO 8601 date string",
      }),
    currency: CurrencyCodeSchema,
    status: CharlieOrderStatusSchema,
    items: z.array(CharlieOrderItemSchema).default([]),
    subtotalMinor: z.number().int().nonnegative("subtotalMinor must be a non-negative integer"),
    discountMinor: z.number().int().nonnegative("discountMinor must be a non-negative integer").default(0),
    taxMinor: z.number().int().nonnegative("taxMinor must be a non-negative integer").default(0),
    shippingMinor: z.number().int().nonnegative("shippingMinor must be a non-negative integer").default(0),
    totalMinor: z.number().int().nonnegative("totalMinor must be a non-negative integer"),
    refundedMinor: z.number().int().nonnegative("refundedMinor must be a non-negative integer").default(0),
    tags: z.array(z.string()).optional().default([]),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine(
    (order) => order.refundedMinor <= order.totalMinor + order.shippingMinor + order.taxMinor,
    {
      message: "refundedMinor cannot exceed total payable amount (totalMinor + shipping + tax)",
      path: ["refundedMinor"],
    }
  );

export type CharlieOrder = z.infer<typeof CharlieOrderSchema>;

/**
 * Bi-directional converter between legacy Order and canonical CharlieOrder.
 */
export function toCharlieOrder(order: Order | CharlieOrder): CharlieOrder {
  // If already conforms to CharlieOrder
  if ("subtotalMinor" in order && "placedAt" in order) {
    return CharlieOrderSchema.parse(order);
  }

  // Convert from legacy Order format
  const legacy = order as Order;
  const items: CharlieOrderItem[] = (legacy.items || []).map((item) => ({
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPriceMinor: item.unitPriceMinorUnits,
    discountMinor: item.discountMinorUnits || 0,
    sku: item.sku,
    category: item.category,
    unitCostMinor: item.unitCostMinorUnits,
  }));

  const charlieOrder: CharlieOrder = {
    id: legacy.id,
    customerId: legacy.customerId || null,
    placedAt: legacy.createdAt,
    currency: legacy.currency,
    status: (legacy.status === "failed" ? "cancelled" : legacy.status) as CharlieOrderStatus,
    items,
    subtotalMinor: legacy.subtotalMinorUnits ?? legacy.totalMinorUnits,
    discountMinor: legacy.discountMinorUnits || 0,
    taxMinor: legacy.taxMinorUnits || 0,
    shippingMinor: legacy.shippingMinorUnits || 0,
    totalMinor: legacy.totalMinorUnits,
    refundedMinor: legacy.refundMinorUnits || 0,
    tags: legacy.tags || [],
    metadata: legacy.metadata,
  };

  return CharlieOrderSchema.parse(charlieOrder);
}
