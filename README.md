# Charlie the Business Advisor 🎩📈

> **Open-Source Business Analytics Engine & Developer SDK**
>
> Deterministic business intelligence, Pareto (80/20) concentration analysis, RFM customer segmentation, and financial metrics in TypeScript.

[![CI](https://github.com/charlie/charlie-the-business-advisor/actions/workflows/ci.yml/badge.svg)](https://github.com/charlie/charlie-the-business-advisor/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/charlie-the-business-advisor.svg)](https://www.npmjs.com/package/charlie-the-business-advisor)

---

## Overview

**Charlie the Business Advisor** is a framework-agnostic TypeScript analytics engine. It runs in any environment (Node.js, browsers, Next.js, Edge runtimes, mobile apps) with **zero cloud dependencies** and **no mandatory external services**.

Key capabilities:
- **Deterministic Financial Analytics**: Integer minor-unit arithmetic prevents floating-point rounding errors across sales, revenues, and discounts.
- **Pareto Concentration Diagnostics**: Compute 80/20 revenue concentration curves across products, categories, and customer cohorts.
- **RFM Customer Segmentation**: Segment customer bases into Champions, Loyal, At-Risk, and Inactive cohorts with actionable thresholds.
- **Framework Adapters**: Transform disparate data schemas (Eloquent, Postgres, CSV, JSON) into standardized, typed analytics snapshots.
- **React UI Integration**: React 18 & 19 hooks and visualization components for building dashboards with minimal boilerplate.

---

## Packages in This Monorepo

| Package | npm Package | Description | README |
| :--- | :--- | :--- | :--- |
| **`charlie-the-business-advisor`** | [`charlie-the-business-advisor`](https://www.npmjs.com/package/charlie-the-business-advisor) | Unified developer entry point and high-level client | [Docs](packages/charlie-the-business-advisor/README.md) |
| **`packages/analytics-core`** | [`@charlie-the-ai/analytics-core`](https://www.npmjs.com/package/@charlie-the-ai/analytics-core) | Pure deterministic analytics engine and algorithms | [Docs](packages/analytics-core/README.md) |
| **`packages/advisor-types`** | [`@charlie-the-ai/advisor-types`](https://www.npmjs.com/package/@charlie-the-ai/advisor-types) | Zod schemas and TypeScript data contracts | [Docs](packages/advisor-types/README.md) |
| **`packages/analytics-adapters`**| [`@charlie-the-ai/analytics-adapters`](https://www.npmjs.com/package/@charlie-the-ai/analytics-adapters) | Data normalization adapters for databases and APIs | [Docs](packages/analytics-adapters/README.md) |
| **`packages/advisor-react`** | [`@charlie-the-ai/advisor-react`](https://www.npmjs.com/package/@charlie-the-ai/advisor-react) | React 18/19 hooks and UI components for web apps | [Docs](packages/advisor-react/README.md) |

---

## Quick Start

### Installation

```bash
# Unified package (includes types, core, and adapters)
npm install charlie-the-business-advisor

# Or install individual modular packages:
npm install @charlie-the-ai/analytics-core @charlie-the-ai/advisor-types
```

### Basic Usage

```typescript
import { Charlie, type Order } from 'charlie-the-business-advisor';

const charlie = new Charlie({
  defaultCurrency: 'USD',
  businessId: 'biz_01',
});

const orders: Order[] = [
  {
    id: 'ord_101',
    customerId: 'cust_abc',
    status: 'completed',
    totalAmount: 19900, // $199.00 in minor units (cents)
    currency: 'USD',
    createdAt: '2026-03-15T10:00:00Z',
    items: [
      {
        id: 'item_1',
        productId: 'prod_1',
        productName: 'Annual Subscription',
        quantity: 1,
        unitPrice: 19900,
        totalPrice: 19900,
      },
    ],
  },
];

const snapshot = charlie.analyze({ orders });

console.log('Snapshot ID:', snapshot.snapshotId);
console.log('Net Revenue:', snapshot.sales.netRevenueFormatted);  // "$199.00"
console.log('Order Count:', snapshot.sales.totalOrders);         // 1
console.log('Vital Products (80/20):', snapshot.pareto.products.vitalFewCount);
```

---

## Integration Examples

Explore working sample applications in [`examples/`](examples/):
- **[`examples/nodejs-integration`](examples/nodejs-integration/)**: REST API processing transaction feeds with Express and Charlie.
- **[`examples/nextjs-integration`](examples/nextjs-integration/)**: Next.js App Router app using `@charlie-the-ai/advisor-react` hooks and Pareto visualizations.
- **[`examples/laravel-integration`](examples/laravel-integration/)**: Exporting Laravel Eloquent transactions to Charlie analytics snapshots.

---

## Documentation

- [Getting Started Guide](docs/getting-started/README.md)
- [Framework Integration Guides](docs/integrations/README.md)
- [Architecture & Decimal Arithmetic Decisions](docs/architecture/ARCHITECTURE.md)

---

## Contributing

We welcome community contributions! Please review [CONTRIBUTING.md](CONTRIBUTING.md) and our [Code Guidelines](CONTRIBUTING.md#code-guidelines).

---

## License

[MIT](LICENSE) © 2026 Charlie the Business Advisor Contributors
