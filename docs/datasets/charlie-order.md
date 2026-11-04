# Canonical Dataset: CharlieOrder

`CharlieOrder` is the primary transactional dataset in the Charlie ecosystem. It represents a completed, pending, cancelled, or refunded business transaction with line item details.

Package: `@charlie-the-ai/advisor-types`

---

## 1. Schema Specification

All financial amounts are stored as **integers in minor currency units** (e.g., cents, kobo, pence) to prevent floating-point rounding errors.

### TypeScript Interface

```typescript
export interface CharlieOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPriceMinor: number;     // e.g. 250000 = ₦2,500.00
  discountMinor?: number;     // e.g. 0
  taxMinor?: number;          // e.g. 0
  totalMinor?: number;        // Computed: quantity * unitPriceMinor - discountMinor + taxMinor
  sku?: string;
  category?: string;
  unitCostMinor?: number;     // Cost of Goods Sold (COGS) for margin calculation
}

export interface CharlieOrder {
  id: string;                                           // Unique order identifier
  customerId?: string | null;                           // Customer ID for RFM tracking
  placedAt: string;                                     // ISO 8601 timestamp (e.g. "2026-03-01T10:00:00Z")
  currency: string;                                     // ISO 4217 code (e.g. "USD", "NGN", "EUR")
  status: "completed" | "cancelled" | "pending" | "refunded" | "partially_refunded";
  items: CharlieOrderItem[];
  subtotalMinor: number;                                // Net line item sum before taxes/shipping
  discountMinor: number;                                // Order-level discount
  taxMinor: number;                                     // Order-level tax
  shippingMinor: number;                               // Shipping charges
  totalMinor: number;                                   // Final charged amount
  refundedMinor: number;                                // Total refunded amount
  tags?: string[];                                      // Search & category tags
  metadata?: Record<string, unknown>;                   // Custom arbitrary fields
}
```

---

## 2. Validation with Zod

Charlie validates all orders at runtime using strict Zod schemas:

```typescript
import { CharlieOrderSchema, toCharlieOrder } from "charlie-the-business-advisor";

// Validate a raw object:
const validatedOrder = CharlieOrderSchema.parse(rawObject);

// Or use the safe coercion helper:
const order = toCharlieOrder({
  id: "ord_101",
  placedAt: new Date(),
  currency: "USD",
  status: "completed",
  totalMinor: 5000,
  subtotalMinor: 5000,
  items: [
    {
      productId: "prod_1",
      productName: "Solar Inverter",
      quantity: 1,
      unitPriceMinor: 5000,
    },
  ],
});
```

---

## 3. Order Status Lifecycle

| Status | Counts Toward Net Revenue? | Counts Toward Order Volume? | Used in RFM Analysis? |
|---|---|---|---|
| `completed` | ✅ Yes | ✅ Yes | ✅ Yes |
| `partially_refunded` | ✅ Yes (minus refunded amount) | ✅ Yes | ✅ Yes |
| `pending` | ❌ No | ❌ No | ❌ No |
| `cancelled` | ❌ No | ❌ No | ❌ No |
| `refunded` | ❌ No (full refund) | ❌ No | ❌ No |

---

## Next Steps

- [Canonical Dataset: CharlieCustomer](./charlie-customer.md)
- [Canonical Datasets Roadmap](./roadmap.md)
- [Transforming Database Rows with Adapters](../adapters/overview.md)
