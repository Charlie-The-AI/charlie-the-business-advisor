# Charlie the Business Advisor 🎩📈

> **Open-Source Business Analytics Engine & Developer SDK**
>
> Deterministic business intelligence, Pareto (80/20) concentration analysis, RFM customer segmentation, and financial metrics in TypeScript.

[![CI](https://github.com/charlie/charlie-the-business-advisor/actions/workflows/ci.yml/badge.svg)](https://github.com/charlie/charlie-the-business-advisor/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/badge/npm-0.1.0-orange.svg)](https://www.npmjs.com/package/charlie-the-business-advisor)

---

## Overview

**Charlie the Business Advisor** is a framework-agnostic TypeScript analytics engine. It runs in any environment (Node.js, browsers, Next.js, Edge runtimes, mobile apps) with **zero cloud dependencies** and **no mandatory external services**.

Key capabilities:
- **Deterministic Financial Analytics**: Integer minor-unit arithmetic prevents floating-point rounding errors across sales, revenues, and discounts.
- **Pareto Concentration Diagnostics**: Compute 80/20 revenue concentration curves across products, categories, and customer cohorts.
- **RFM Customer Segmentation**: Segment customer bases into Champions, Loyal, At-Risk, and Inactive buckets with actionable thresholds.
- **Framework Adapters**: Transform disparate data schemas (Eloquent, Postgres, CSV, JSON) into standardized, typed analytics snapshots.
- **React UI Integration**: React hooks and visualization components for building dashboards with minimal boilerplate.

---

## Packages in This Monorepo

| Package | npm Package | Description |
| :--- | :--- | :--- |
| **`charlie-the-business-advisor`** | `charlie-the-business-advisor` | Unified developer entry point and high-level client |
| **`packages/analytics-core`** | `@charlie/analytics-core` | Pure deterministic analytics engine and algorithms |
| **`packages/advisor-types`** | `@charlie/advisor-types` | Zod schemas and TypeScript data contracts |
| **`packages/analytics-adapters`**| `@charlie/analytics-adapters` | Data normalization adapters for databases and APIs |
| **`packages/advisor-react`** | `@charlie/advisor-react` | React 19 hooks and UI components for web apps |

---

## Quick Start

### Installation

```bash
# Unified package
npm install charlie-the-business-advisor

# Or install individual modular packages:
npm install @charlie/analytics-core @charlie/advisor-types
```

### Basic Usage

```typescript
import { CharlieAdvisor } from 'charlie-the-business-advisor';

const advisor = new CharlieAdvisor({
  currency: 'USD',
  timezone: 'UTC',
});

const snapshot = advisor.generateSnapshot({
  businessId: 'biz_01',
  period: {
    startDate: '2026-03-01T00:00:00Z',
    endDate: '2026-03-31T23:59:59Z',
  },
  transactions: [
    {
      id: 'tx_01',
      businessId: 'biz_01',
      orderId: 'ord_101',
      customerId: 'cust_abc',
      amount: 19900, // $199.00 in minor units (cents)
      currency: 'USD',
      timestamp: '2026-03-15T10:00:00Z',
      status: 'completed',
      items: [
        {
          productId: 'prod_1',
          name: 'Annual Subscription',
          quantity: 1,
          unitPrice: 19900,
          totalPrice: 19900,
        },
      ],
    },
  ],
});

console.log('Total Revenue:', snapshot.metrics.revenue.total); // 19900
console.log('Order Count:', snapshot.metrics.orders.count);   // 1
console.log('Pareto Top 20%:', snapshot.pareto.topProducts);
```

---

## Integration Examples

Explore working sample applications in [`examples/`](examples/):
- **[`examples/nodejs-integration`](examples/nodejs-integration/)**: REST API processing transaction feeds with Express and Charlie.
- **[`examples/nextjs-integration`](examples/nextjs-integration/)**: Next.js App Router app using `@charlie/advisor-react` hooks and Pareto visualizations.
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
