# charlie-the-business-advisor 🎩📈

> The unified developer entry point and high-level SDK for Charlie the Business Advisor.

[![npm version](https://img.shields.io/npm/v/charlie-the-business-advisor.svg)](https://www.npmjs.com/package/charlie-the-business-advisor)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

---

## Overview

`charlie-the-business-advisor` is the all-in-one distribution of the Charlie analytics ecosystem. It bundles and re-exports:
- **`@charlie-the-ai/advisor-types`**: Canonical data models, Zod validation schemas, and integer minor-unit contracts.
- **`@charlie-the-ai/analytics-core`**: Pure deterministic calculation engine (Sales, Pareto 80/20, RFM Customer Segmentation, Trends, Money).
- **`@charlie-the-ai/analytics-adapters`**: Data normalization pipeline for ORMs, database rows, and APIs (including Laravel Eloquent).

With a single install, you have access to the intuitive, ergonomic `Charlie` client class as well as all lower-level primitives.

---

## Installation

```bash
# npm
npm install charlie-the-business-advisor

# pnpm
pnpm add charlie-the-business-advisor

# yarn
yarn add charlie-the-business-advisor
```

---

## Quick Start

### 1. Unified Analytics Snapshot

Analyze an array of orders to generate a comprehensive, deterministic analytics snapshot:

```typescript
import { Charlie, type Order } from "charlie-the-business-advisor";

const charlie = new Charlie({
  defaultCurrency: "USD",
  businessId: "biz_merchant_01",
});

const orders: Order[] = [
  {
    id: "ord_101",
    customerId: "cust_alice",
    status: "completed",
    totalAmount: 12000, // $120.00 in minor units (cents)
    currency: "USD",
    createdAt: "2026-03-10T14:30:00Z",
    items: [
      {
        id: "item_1",
        productId: "prod_desk",
        productName: "Standing Desk",
        quantity: 1,
        unitPrice: 12000,
        totalPrice: 12000,
      },
    ],
  },
  // ... more orders
];

// Run complete analysis
const snapshot = charlie.analyze({ orders });

console.log("Snapshot ID:", snapshot.snapshotId);
console.log("Net Revenue:", snapshot.sales.netRevenueFormatted);
console.log("Total Orders:", snapshot.sales.totalOrders);
console.log("AOV:", snapshot.sales.averageOrderValueFormatted);
console.log("Vital Products (80/20):", snapshot.pareto.products.vitalFewCount);
console.log("Repeat Customer Rate:", snapshot.customers.repeatCustomerRate);
```

---

## Dedicated High-Level APIs

The `Charlie` class provides streamlined methods for running specific analytics dimensions on demand:

### 1. Sales Analytics (`charlie.sales`)

```typescript
const salesSummary = charlie.sales(orders, "USD");

console.log("Gross Revenue:", salesSummary.grossRevenueFormatted);
console.log("Net Revenue:", salesSummary.netRevenueFormatted);
console.log("Total Items Sold:", salesSummary.totalItemsSold);
console.log("Average Order Value:", salesSummary.averageOrderValueFormatted);
```

### 2. Pareto (80/20) Concentration (`charlie.pareto`)

Compute concentration curves on **products**, **customers**, or **categories**:

```typescript
// Product concentration
const productPareto = charlie.pareto(orders, "product", "USD", 80);
console.log(`Top ${productPareto.vitalFewPercentage}% of products generate 80% of revenue`);

// Customer concentration
const customerPareto = charlie.pareto(orders, "customer", "USD", 80);
console.log(`Gini Coefficient: ${customerPareto.giniCoefficient}`);
```

### 3. Customer RFM & Retention (`charlie.customers`)

```typescript
const customerAnalytics = charlie.customers(orders, "USD");

console.log("Retention Rate:", customerAnalytics.retentionRate);
console.log("Champions:", customerAnalytics.segments.champions);
console.log("At-Risk Customers:", customerAnalytics.segments.atRisk);
```

### 4. Product Velocity & Margins (`charlie.products`)

```typescript
const productAnalytics = charlie.products(orders, "USD");

for (const product of productAnalytics.products) {
  console.log(`${product.name}: ${product.velocityPerDay} units/day, margin: ${product.grossMarginPercentage}%`);
}
```

### 5. Moving Averages & Trend Anomalies (`charlie.trends`)

```typescript
const trends = charlie.trends(orders, "USD");

console.log("7-day Moving Average:", trends.movingAverages[0]);
console.log("Detected Anomalies:", trends.anomalies);
```

### 6. Fixed-Point Money Utilities (`charlie.money`)

```typescript
const { money } = charlie;

const sum = money.add(1099, 2050); // 3149
const formatted = money.format(3149, "USD"); // "$31.49"
const toCents = money.toMinorUnits(45.50, "USD"); // 4550
```

### 7. Data Adapters (`charlie.createAdapter` & `charlie.laravelAdapter`)

```typescript
// Laravel Eloquent adapter
const laravelAdapter = charlie.laravelAdapter("NGN");
const { orders: normalizedOrders } = laravelAdapter.normalizeBatch(rawEloquentRows);

// Run analysis directly
const snapshot = charlie.analyze({ orders: normalizedOrders });
```

---

## Re-Exported Primitives

Everything is re-exported from this umbrella package for maximum convenience:

```typescript
// Schemas and Types
import {
  OrderSchema,
  OrderItemSchema,
  type Order,
  type AnalyticsSnapshot,
  type SalesSummary,
  type ParetoResult,
  type RfmCustomerScore,
} from "charlie-the-business-advisor";

// Core calculation functions
import {
  createAnalyticsSnapshot,
  calculateSalesSummary,
  calculatePareto,
  calculateCustomerAnalytics,
  Money,
} from "charlie-the-business-advisor";

// Data Adapters
import {
  createOrderAdapter,
  createLaravelOrderAdapter,
} from "charlie-the-business-advisor";
```

---

## Modular Packages

If you only need specific components or prefer minimal dependency trees, install the modular scoped packages individually:

| Scoped Package | Description |
| :--- | :--- |
| [`@charlie-the-ai/advisor-types`](https://www.npmjs.com/package/@charlie-the-ai/advisor-types) | Zod schemas, data contracts, and TypeScript models |
| [`@charlie-the-ai/analytics-core`](https://www.npmjs.com/package/@charlie-the-ai/analytics-core) | Zero-dependency mathematical calculation engine |
| [`@charlie-the-ai/analytics-adapters`](https://www.npmjs.com/package/@charlie-the-ai/analytics-adapters) | Data normalization adapters for databases and ORMs |
| [`@charlie-the-ai/advisor-react`](https://www.npmjs.com/package/@charlie-the-ai/advisor-react) | React 18/19 hooks, Pareto charts, and metric badges |

---

## License

MIT © 2026 Charlie the Business Advisor Contributors
