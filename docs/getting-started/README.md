# Getting Started with Charlie the Business Advisor

Welcome to **Charlie the Business Advisor**, an open-source TypeScript analytics engine designed to help developers and businesses calculate deterministic financial metrics, perform Pareto (80/20) concentration analysis, calculate RFM customer segments, and discover actionable growth opportunities.

---

## 1. Installation

Install Charlie in your Node.js or browser project:

```bash
# Unified Charlie client (recommended)
npm install charlie-the-business-advisor

# Or install specific modular packages:
npm install @charlie/analytics-core @charlie/advisor-types @charlie/analytics-adapters
```

If you are using React:
```bash
npm install @charlie/advisor-react
```

---

## 2. Quick Start: Analyzing Sales Data

Charlie uses integer minor-unit currency (e.g. cents) to eliminate floating-point rounding errors in financial analytics.

```typescript
import { CharlieAdvisor } from 'charlie-the-business-advisor';

// 1. Initialize Charlie
const charlie = new CharlieAdvisor({
  currency: 'USD',
  timezone: 'America/New_York',
});

// 2. Prepare transaction data
const transactions = [
  {
    id: 'tx_1',
    businessId: 'biz_1',
    orderId: 'ord_1',
    customerId: 'cust_alpha',
    amount: 15000, // $150.00
    currency: 'USD',
    timestamp: '2026-03-01T12:00:00Z',
    status: 'completed',
    items: [
      {
        productId: 'prod_widgets',
        name: 'Pro Widget',
        quantity: 2,
        unitPrice: 7500,
        totalPrice: 15000,
      },
    ],
  },
  {
    id: 'tx_2',
    businessId: 'biz_1',
    orderId: 'ord_2',
    customerId: 'cust_beta',
    amount: 5000, // $50.00
    currency: 'USD',
    timestamp: '2026-03-02T14:30:00Z',
    status: 'completed',
    items: [
      {
        productId: 'prod_gadget',
        name: 'Basic Gadget',
        quantity: 1,
        unitPrice: 5000,
        totalPrice: 5000,
      },
    ],
  },
];

// 3. Generate snapshot & analytics
const snapshot = charlie.generateSnapshot({
  businessId: 'biz_1',
  period: {
    startDate: '2026-03-01T00:00:00Z',
    endDate: '2026-03-31T23:59:59Z',
  },
  transactions,
});

console.log('Total Revenue:', snapshot.metrics.revenue.total); // 20000 ($200.00)
console.log('Average Order Value:', snapshot.metrics.revenue.averageOrderValue); // 10000 ($100.00)
console.log('Pareto Products:', snapshot.pareto.topProducts);
```

---

## 3. Package Ecosystem

| Package | Description |
| :--- | :--- |
| **`charlie-the-business-advisor`** | The unified high-level developer entry point. Integrates all modules into an intuitive API. |
| **`@charlie/advisor-types`** | Zod schemas and TypeScript types for transactions, orders, customers, and analytics snapshots. |
| **`@charlie/analytics-core`** | Deterministic analytics computations: revenue, Pareto distributions, RFM segmentation, trends. |
| **`@charlie/analytics-adapters`** | Data normalization adapters for Eloquent, generic SQL, JSON, and CSV data sources. |
| **`@charlie/advisor-react`** | React hooks (`useCharlieAnalytics`, `useParetoAnalysis`) and UI components for dashboard building. |

---

## 4. Next Steps

- Explore [Integration Guides](../integrations/README.md) for Node.js, Next.js, and Laravel.
- Review [Architecture Decisions](../architecture/ARCHITECTURE.md) to understand deterministic decimal arithmetic.
