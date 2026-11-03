# @charlie-the-ai/advisor-types 📐

> Shared TypeScript data contracts, domain models, and runtime Zod schemas for the Charlie the Business Advisor ecosystem.

[![npm version](https://img.shields.io/npm/v/@charlie-the-ai/advisor-types.svg)](https://www.npmjs.com/package/@charlie-the-ai/advisor-types)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

---

## Overview

`@charlie-the-ai/advisor-types` provides the foundational type definitions, domain interfaces, and runtime Zod validation schemas for **Charlie the Business Advisor**.

It guarantees strict data integrity across the entire analytics pipeline:
- **Integer Minor-Unit Financials**: All monetary values are strictly validated as non-negative integers representing currency minor units (e.g., cents, kobo, pesewas, pence), preventing IEEE 754 floating-point inaccuracies.
- **Runtime Validation**: Robust [Zod](https://github.com/colinhacks/zod) schemas validate untrusted incoming payloads from REST APIs, databases, message queues, and CSV imports.
- **ISO 4217 Currency Safety**: Enforces valid three-letter currency codes (e.g., `USD`, `EUR`, `GBP`, `NGN`, `KES`, `ZAR`).
- **Complete Domain Modeling**: Strongly typed entities for Orders, Order Items, Customers, Products, Transactions, Analytics Snapshots, and AI Recommendations.

---

## Installation

```bash
# npm
npm install @charlie-the-ai/advisor-types zod

# pnpm
pnpm add @charlie-the-ai/advisor-types zod

# yarn
yarn add @charlie-the-ai/advisor-types zod
```

> **Note**: `zod` is a direct dependency and peer requirement.

---

## Key Domain Schemas & Types

### 1. Orders & Items (`order.ts`)

| Schema | Type | Description |
| :--- | :--- | :--- |
| `OrderSchema` | `Order` | Canonical business order with customer ID, line items, timestamps, and integer monetary sums |
| `OrderItemSchema` | `OrderItem` | Individual order line item with product ID, quantity, unit price, and total price |
| `OrderStatusSchema` | `OrderStatus` | Status enum: `'completed'`, `'pending'`, `'cancelled'`, `'refunded'`, `'failed'` |

```typescript
import { OrderSchema, type Order } from "@charlie-the-ai/advisor-types";

const rawData = {
  id: "ord_1001",
  customerId: "cust_42",
  status: "completed",
  totalAmount: 14999, // $149.99 in minor units (cents)
  currency: "USD",
  createdAt: "2026-03-15T12:00:00.000Z",
  items: [
    {
      id: "item_1",
      productId: "prod_widget",
      productName: "Premium Widget",
      quantity: 1,
      unitPrice: 14999,
      totalPrice: 14999,
    },
  ],
};

// Validates at runtime and returns typed Order
const order: Order = OrderSchema.parse(rawData);
```

### 2. Currency Codes (`currency.ts`)

| Schema | Type | Description |
| :--- | :--- | :--- |
| `CurrencyCodeSchema` | `CurrencyCode` | ISO 4217 standard currency codes (`USD`, `EUR`, `GBP`, `NGN`, `CAD`, `AUD`, `KES`, `ZAR`, `JPY`, etc.) |

```typescript
import { CurrencyCodeSchema, type CurrencyCode } from "@charlie-the-ai/advisor-types";

const currency: CurrencyCode = CurrencyCodeSchema.parse("NGN");
```

### 3. Customers & Products (`customer.ts`, `product.ts`)

| Schema | Type | Description |
| :--- | :--- | :--- |
| `CustomerSchema` | `Customer` | Customer profile including lifetime order count and total spend |
| `ProductSchema` | `Product` | Product catalog entry with SKU, category, and cost basis |

### 4. Analytics Snapshots (`snapshot.ts`, `analytics.ts`)

| Schema | Type | Description |
| :--- | :--- | :--- |
| `AnalyticsSnapshotSchema` | `AnalyticsSnapshot` | Complete snapshot aggregating sales, Pareto curves, customer RFM, and trends |
| `SalesSummary` | `SalesSummary` | Summary metrics: gross sales, net sales, refund rate, AOV, order volume |
| `ParetoResult` | `ParetoResult` | 80/20 concentration metrics, Gini coefficient, top contributors |
| `CustomerAnalytics` | `CustomerAnalytics` | RFM customer scores, retention rate, cohort breakdowns |
| `ProductAnalytics` | `ProductAnalytics` | Product velocity, profitability, top sellers |
| `TrendAnalytics` | `TrendAnalytics` | Periodic breakdown, moving averages, statistical anomalies |

### 5. AI Recommendations (`recommendation.ts`)

| Schema | Type | Description |
| :--- | :--- | :--- |
| `RecommendationSchema` | `Recommendation` | AI-generated business growth recommendation with evidence metrics and action items |
| `EvidenceMetricSchema` | `EvidenceMetric` | Supporting quantitative data backing an AI recommendation |

---

## Minor-Unit Money Standard

To ensure financial accuracy without IEEE 754 precision errors:

- **All amounts are integers**: `totalAmount`, `unitPrice`, `discountAmount`, and `taxAmount` must be integer minor units.
- **Examples**:
  - `$10.50 USD` = `1050`
  - `₦5,000 NGN` = `500000` (kobo)
  - `£99.95 GBP` = `9995`
  - `¥1,000 JPY` = `1000` (zero-decimal currency)

---

## Related Packages

- [`@charlie-the-ai/analytics-core`](https://www.npmjs.com/package/@charlie-the-ai/analytics-core): Pure calculation engine utilizing these types.
- [`@charlie-the-ai/analytics-adapters`](https://www.npmjs.com/package/@charlie-the-ai/analytics-adapters): Normalizes raw inputs into `Order` types.
- [`charlie-the-business-advisor`](https://www.npmjs.com/package/charlie-the-business-advisor): The unified umbrella SDK.

---

## License

MIT © 2026 Charlie the Business Advisor Contributors
