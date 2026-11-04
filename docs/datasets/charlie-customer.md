# Canonical Dataset: CharlieCustomer

`CharlieCustomer` represents a registered or guest customer profile in the Charlie ecosystem. It enables accurate **Recency, Frequency, Monetary (RFM) segmentation**, cohort tracking, and repeat purchase analysis.

Package: `@charlie-the-ai/advisor-types`

---

## 1. Schema Specification

```typescript
export interface CharlieCustomer {
  id: string;                         // Unique customer identifier (matches customerId on CharlieOrder)
  name?: string;                      // Customer display name (optional, sanitized for PII)
  email?: string;                     // Customer email (optional, never sent to AI by default)
  phone?: string;                     // Contact phone number (optional)
  createdAt?: string;                 // ISO 8601 registration timestamp (for cohort aging)
  country?: string;                   // ISO 3166-1 alpha-2 country code (e.g. "NG", "US")
  region?: string;                    // State/Province/Region (e.g. "Lagos", "California")
  metadata?: Record<string, unknown>; // Custom attributes
}
```

---

## 2. Validation with Zod

```typescript
import { CharlieCustomerSchema, toCharlieCustomer } from "charlie-the-business-advisor";

// Validate:
const customer = CharlieCustomerSchema.parse({
  id: "cust_123",
  name: "Amina Yusuf",
  email: "amina@example.com",
  createdAt: "2026-01-15T00:00:00Z",
});

// Coerce:
const cleanCustomer = toCharlieCustomer(rawInput);
```

---

## 3. How Customers Connect to Analytics

When you pass both `orders` and `customers` to `charlie.analyze()`:

```typescript
const snapshot = charlie.analyze({
  orders: sampleOrders,
  customers: sampleCustomers,
  currency: "NGN",
});
```

1. **Total vs Active Base**:
   - `snapshot.customers.uniqueCustomersCount`: Total registered customers in the business database.
   - `snapshot.customers.activeCustomersCount`: Customers who placed at least one completed order during the period.
2. **True Repeat Purchase Rate**:
   $$\text{Repeat Rate} = \frac{\text{Customers with} \ge 2 \text{ completed orders}}{\text{Active Purchasing Customers}} \times 100\%$$
3. **RFM Cohorts**:
   Each customer is scored from 1 to 5 across Recency, Frequency, and Monetary Value, and classified into cohorts:
   - `Champions`
   - `Loyal Customers`
   - `Potential Loyalists`
   - `At Risk`
   - `Needs Attention`
   - `Hibernating`

---

## 4. Privacy & PII Guarantee

By default, when Charlie generates AI advice via `.advise()` or `.chat()`:
- `includeCustomerDetails` is `false`.
- Real customer names and emails are masked into cohort IDs (`Customer Cohort #1`, `Customer Cohort #2`).
- External AI providers (OpenAI, Gemini, Claude) **never see customer emails, names, or contact info**.

---

## Next Steps

- [Canonical Datasets Roadmap](./roadmap.md)
- [Customer Adapters](../adapters/overview.md)
- [RFM Segmentation Guide](../analytics/rfm-segmentation.md)
