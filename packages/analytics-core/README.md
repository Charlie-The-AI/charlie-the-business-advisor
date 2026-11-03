# @charlie-the-ai/analytics-core ⚡

> Pure, deterministic, zero-dependency business intelligence and financial calculation engine.

[![npm version](https://img.shields.io/npm/v/@charlie-the-ai/analytics-core.svg)](https://www.npmjs.com/package/@charlie-the-ai/analytics-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

---

## Overview

`@charlie-the-ai/analytics-core` is the mathematical heart of **Charlie the Business Advisor**. It runs anywhere JavaScript runs — Node.js, browsers, Edge workers (Cloudflare Workers, Vercel Edge), Deno, or Bun — with **zero runtime external dependencies**.

### Key Capabilities

1. **Fixed-Point Financial Mathematics (`Money`)**
   - Arithmetic on integer minor units (cents, kobo, pence) eliminates IEEE-754 floating-point errors.
   - Half-up rounding, percentage ratios, safe-integer bounds checking, and locale-aware currency formatting.

2. **Sales & Revenue Diagnostics (`calculateSalesSummary`)**
   - Gross revenue, net revenue, total discounts, refunds, average order value (AOV), and average items per order.
   - Period-over-period percentage growth comparisons.
   - Periodic breakdowns (hourly, daily, weekly, monthly).

3. **Pareto (80/20) Concentration Analysis (`calculatePareto`)**
   - Ranks contributors (products, customers, categories) by descending revenue.
   - Computes cumulative revenue percentages, cumulative share of items, and Gini coefficient.
   - Identifies the critical subset driving 80% (or custom threshold) of business performance.

4. **RFM Customer Segmentation & Retention (`calculateCustomerAnalytics`)**
   - Quintile-based Recency, Frequency, and Monetary (RFM) scoring (1-5 scales).
   - Automated cohort segmentation: `Champions`, `Loyal`, `Potential Loyalists`, `At Risk`, `Hibernating`, and `Lost`.
   - Retention rate, churn rate, repeat customer rate, and customer lifetime value (CLV).

5. **Product Velocity & Margins (`calculateProductAnalytics`)**
   - Unit sales velocity, revenue contribution, gross margin percentage, and unit profitability.
   - Identification of high-velocity vs. high-margin items.

6. **Statistical Trends & Anomaly Detection (`calculateTrends`)**
   - 7-day and 30-day simple moving averages (SMA).
   - Rolling standard deviations and z-score anomaly detection to flag revenue spikes or drops.

7. **Standardized Snapshot Generation (`createAnalyticsSnapshot`)**
   - Generates an immutable, deterministic, hash-verified snapshot encompassing all metrics.
   - Computes data quality scores and flags data omissions (missing customer IDs, missing cost basis).

---

## Installation

```bash
# npm
npm install @charlie-the-ai/analytics-core @charlie-the-ai/advisor-types

# pnpm
pnpm add @charlie-the-ai/analytics-core @charlie-the-ai/advisor-types

# yarn
yarn add @charlie-the-ai/analytics-core @charlie-the-ai/advisor-types
```

---

## Usage Examples

### 1. Deterministic Money Operations

```typescript
import { Money } from "@charlie-the-ai/analytics-core";

// Addition and subtraction (in minor units)
const total = Money.add(1099, 2500, 450); // 4049 (cents)
const net = Money.subtract(total, 500);    // 3549 (cents)

// Safe multiplication & division with half-up rounding
const discounted = Money.multiply(10000, 0.85); // 8500
const unitShare = Money.divide(10000, 3);        // 3333

// Formatted string output
console.log(Money.format(2500000, "NGN")); // "₦25,000.00"
console.log(Money.format(1499, "USD"));    // "$14.99"
console.log(Money.format(1500, "JPY"));    // "¥1,500"

// Conversion
const minorUnits = Money.toMinorUnits(19.99, "USD"); // 1999
const majorUnits = Money.toMajorUnits(1999, "USD");  // 19.99
```

### 2. Comprehensive Analytics Snapshot

```typescript
import { createAnalyticsSnapshot } from "@charlie-the-ai/analytics-core";
import type { Order } from "@charlie-the-ai/advisor-types";

const orders: Order[] = [
  {
    id: "ord_001",
    customerId: "cust_101",
    status: "completed",
    totalAmount: 15000, // $150.00
    currency: "USD",
    createdAt: "2026-03-01T10:00:00Z",
    items: [
      {
        id: "item_01",
        productId: "prod_a",
        productName: "Mechanical Keyboard",
        quantity: 1,
        unitPrice: 15000,
        totalPrice: 15000,
      },
    ],
  },
  // ... more orders
];

const snapshot = createAnalyticsSnapshot({
  businessId: "biz_acme",
  currency: "USD",
  period: {
    from: "2026-03-01T00:00:00Z",
    to: "2026-03-31T23:59:59Z",
  },
  orders,
  paretoThreshold: 80,
});

console.log("Snapshot ID:", snapshot.snapshotId);
console.log("Net Revenue:", snapshot.sales.netRevenueMinorUnits);
console.log("AOV:", snapshot.sales.averageOrderValueMinorUnits);
console.log("Pareto 80/20 Concentration:", snapshot.pareto.products.concentrationRatio);
console.log("Data Quality Score:", snapshot.dataQuality.scorePercentage);
```

### 3. Pareto Analysis Standalone

```typescript
import {
  calculatePareto,
  extractParetoInputsFromOrders,
} from "@charlie-the-ai/analytics-core";

const inputs = extractParetoInputsFromOrders(orders, "product");

const result = calculatePareto({
  dimension: "product",
  items: inputs,
  currency: "USD",
  thresholdPercentage: 80,
});

console.log(`Gini Coefficient: ${result.giniCoefficient}`);
console.log(`Items generating 80% revenue: ${result.topContributorsCount} of ${result.totalItemsCount}`);
for (const item of result.contributors) {
  console.log(`${item.name}: ${item.cumulativePercentage}% cumulative`);
}
```

### 4. RFM Customer Segmentation Standalone

```typescript
import { calculateCustomerAnalytics } from "@charlie-the-ai/analytics-core";

const customerAnalytics = calculateCustomerAnalytics({
  orders,
  currency: "USD",
  referenceDate: new Date("2026-03-31T23:59:59Z"),
});

console.log("Repeat Customer Rate:", customerAnalytics.repeatCustomerRate);
console.log("Champions:", customerAnalytics.segments.champions.length);
console.log("At Risk:", customerAnalytics.segments.atRisk.length);
```

---

## Architecture & Determinism

- **No Date Non-determinism**: All algorithms accept an optional `referenceDate` parameter for testing or historical point-in-time replays.
- **Stable Sorting**: Deterministic tie-breaking on Pareto and RFM calculations ensures identical output for identical datasets across all platforms.
- **Hash-Verified Snapshots**: Every snapshot produces an immutable hash ID derived from content, schema version, and calculation version.

---

## Related Packages

- [`@charlie-the-ai/advisor-types`](https://www.npmjs.com/package/@charlie-the-ai/advisor-types): Zod schemas and TypeScript models.
- [`@charlie-the-ai/analytics-adapters`](https://www.npmjs.com/package/@charlie-the-ai/analytics-adapters): Data adapters for Eloquent, Postgres, and APIs.
- [`charlie-the-business-advisor`](https://www.npmjs.com/package/charlie-the-business-advisor): The unified umbrella SDK.

---

## License

MIT © 2026 Charlie the Business Advisor Contributors
