# Database Adapters Overview

A core design principle of Charlie is:

> **You should never have to change your database schema, rename your database tables, or rewrite your ORM models to use Charlie.**

Every application structures orders and customers differently:
- Some call the order table `orders`, others `transactions`, `checkouts`, `invoices`, or `sales`.
- Some store prices as major unit floats (`19.99`), others as minor unit integers (`1999`), and others as string decimals (`"19.99"`).
- Some store line items as embedded JSON documents, others as a relational `order_items` table.

Charlie adapters bridge the gap between your existing database records and Charlie's canonical datasets (`CharlieOrder` and `CharlieCustomer`).

---

## Adapter Types

Charlie provides two flexible ways to adapt data:

1. **Declarative Mapping**:
   Specify a mapping object linking Charlie fields to your database column names or dot-notated object paths.
   ```typescript
   const adapter = createOrderAdapter({
     fields: {
       id: "order_id",
       totalMajor: "grand_total_naira",
       placedAt: "created_at",
     },
   });
   ```

2. **Custom Transformation Function**:
   Provide a TypeScript function for full procedural control over complex nested schemas, currency conversions, or custom business rules.
   ```typescript
   const adapter = createOrderAdapter({
     transform: (dbRow) => ({
       id: dbRow.reference_no,
       placedAt: dbRow.paid_at,
       totalMinor: Math.round(dbRow.amount * 100),
       ...
     }),
   });
   ```

---

## Batch Transformation & Error Isolation

When processing thousands of historical orders from a legacy database, it is common to encounter corrupted records (e.g. missing timestamps or negative totals).

Charlie adapters provide two isolation modes:
- **`lenient` (Default)**: Transforms valid records and isolates invalid records into an `errors` array without halting execution.
- **`strict`**: Throws an immediate error upon encountering the first invalid record.

```typescript
const result = adapter.safeTransformMany(rawDatabaseRows, {
  onError: "lenient",
  deduplicate: true,
});

console.log(`Successfully transformed: ${result.successful.length}`);
console.log(`Corrupted/skipped rows:  ${result.errors.length}`);
```

---

## Next Steps

- [Declarative Mapping Guide](./declarative-mapping.md)
- [Custom Transform Functions](./custom-transform.md)
- [Laravel Eloquent & SQL Guide](./eloquent.md)
