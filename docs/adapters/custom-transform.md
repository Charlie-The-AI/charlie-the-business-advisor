# Custom Transformation Functions & Error Handling

For advanced scenarios where declarative mapping is insufficient—such as complex conditional logic, legacy multi-currency records, or multi-step nested joins—Charlie supports procedural transformation functions.

Package: `@charlie-the-ai/analytics-adapters`

---

## 1. Custom Transform Function

Pass a `transform` function to `createOrderAdapter`:

```typescript
import { createOrderAdapter, CharlieOrder } from "charlie-the-business-advisor";

const customAdapter = createOrderAdapter({
  transform: (source: any): CharlieOrder => {
    // 1. Calculate items with custom tax logic
    const items = source.items.map((it: any) => ({
      productId: it.sku || `item_${it.id}`,
      productName: it.title || "Custom Order Item",
      quantity: Number(it.quantity) || 1,
      unitPriceMinor: Math.round(Number(it.unit_price) * 100),
      discountMinor: Math.round(Number(it.discount_applied || 0) * 100),
    }));

    // 2. Compute integer total
    const totalMinor = Math.round(Number(source.final_total) * 100);

    return {
      id: String(source.id),
      customerId: source.customer_id ? String(source.customer_id) : null,
      placedAt: new Date(source.created_at).toISOString(),
      currency: source.currency || "USD",
      status: source.is_paid ? "completed" : "pending",
      subtotalMinor: totalMinor,
      discountMinor: 0,
      taxMinor: 0,
      shippingMinor: 0,
      totalMinor,
      refundedMinor: 0,
      items,
      tags: source.channel ? [source.channel] : [],
    };
  },
});
```

---

## 2. Safe Transformation & Error Isolation

When importing thousands of historical orders from a legacy database, invalid or corrupted records should not crash your application.

Use `.safeTransformMany()`:

```typescript
const result = customAdapter.safeTransformMany(legacyDatabaseRows, {
  onError: "lenient",    // "lenient" (default) or "strict"
  deduplicate: true,     // Drop duplicate order IDs automatically
});

console.log(`Transformed: ${result.successful.length}`);
console.log(`Failed:      ${result.errors.length}`);

// Inspect individual failures:
result.errors.forEach((err) => {
  console.warn(`Row index ${err.index} failed: ${err.error}`);
});
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `onError` | `"lenient" \| "strict"` | `"lenient"` | `"lenient"` logs errors and continues; `"strict"` throws immediately. |
| `deduplicate` | `boolean` | `true` | When true, skips orders with duplicate IDs, preserving the first occurrence. |
