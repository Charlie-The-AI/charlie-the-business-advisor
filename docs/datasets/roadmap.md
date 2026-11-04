# Canonical Datasets Roadmap

Charlie is designed to become the standard open-source data contract for business intelligence across modern web frameworks.

Instead of building custom analytics logic for every eCommerce engine, SaaS billing system, restaurant POS, or booking app, applications adapt their data to Charlie's canonical datasets.

---

## Dataset Catalog Status

| Dataset | Status | Version | Description | Target Use Case |
|---|---|---|---|---|
| `CharlieOrder` | ✅ **Production Ready** | v1.0 | Order headers, line items, status lifecycle, minor currency units | E-commerce, retail, POS, digital checkouts |
| `CharlieCustomer` | ✅ **Production Ready** | v1.0 | Customer profiles, cohorts, registration timestamps | RFM analysis, retention, lifetime value |
| `CharlieProduct` | 🚧 *Coming Soon* | v2.0 | Catalog metadata, inventory levels, cost breakdown, categories | Inventory reorder forecasting, margin optimization |
| `CharliePayment` | 🚧 *Coming Soon* | v2.0 | Gateway transactions, fee structures, payout reconciliation | Payment gateway audits (Stripe, Paystack, PayPal) |
| `CharlieBooking` | 🚧 *Coming Soon* | v2.0 | Reservation dates, seat capacities, utilization rates | Hospitality, salons, clinics, fitness centers |
| `CharlieExpense` | 🚧 *Coming Soon* | v2.0 | Operating expenses, payroll, marketing spend, overhead | True net profit, cash flow runway calculations |
| `CharlieSubscription` | 🚧 *Coming Soon* | v2.0 | Recurring MRR/ARR, churn rates, upgrade/downgrade events | SaaS businesses, memberships, digital subscriptions |

---

## Programmatic Access

In `@charlie-the-ai/advisor-types`, you can inspect dataset metadata and availability at runtime:

```typescript
import { CHARLIE_DATASETS, getAvailableDatasets } from "@charlie-the-ai/advisor-types";

console.log(getAvailableDatasets());
// ["CharlieOrder", "CharlieCustomer"]

console.log(CHARLIE_DATASETS.CharlieBooking);
// {
//   name: "CharlieBooking",
//   version: "v2.0",
//   status: "coming_soon",
//   description: "Appointments, reservations, and capacity scheduling analytics",
//   targetRelease: "v0.3.0"
// }
```

---

## Contributing to Canonical Schemas

We welcome RFC proposals from the community for dataset specifications. If you operate a booking, subscription, or expense tracking system, please open an issue or RFC discussion on GitHub.
