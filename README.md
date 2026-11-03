# Charlie the Business Advisor 🎩📈

> **Your AI-Powered Business Growth Companion.**
>
> An open-source business intelligence and analytics engine paired with an AI-powered advisory SaaS.

[![CI](https://github.com/charlie/charlie-the-business-advisor/actions/workflows/ci.yml/badge.svg)](https://github.com/charlie/charlie-the-business-advisor/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Architecture Overview

Charlie operates on a **hybrid open-source + SaaS architecture**:

1. **Product A: Open-Source Analytics Engine (`@charlie/analytics-core`)**
   - Free, zero-dependency, deterministic TypeScript analytics engine.
   - Runs in Node.js, Next.js, Edge runtimes, browsers, and mobile runtimes.
   - Computes sales recognition, Pareto 80/20 distributions, RFM customer segmentation, cohort retention, product margins, trend anomalies, and standardized analytics snapshots.
   - Requires zero network calls and no Charlie account.

2. **Product B: Paid AI Business Advisory SaaS**
   - Multi-tenant cloud backend built with Laravel & PostgreSQL.
   - Ingests deterministic snapshots and generates evidence-grounded recommendations.
   - Conversational AI business advisor with tool-calling capabilities.
   - Subscription lifecycle management and Paystack billing integration.

---

## Monorepo Layout

```text
charlie-the-business-advisor/
├── apps/
│   ├── api/               # Laravel SaaS Backend (Multi-tenant, queue workers, AI orchestrator)
│   ├── dashboard/         # Next.js App Router Web Application
│   ├── docs/              # Mintlify/Nextra Developer Documentation
│   └── playground/        # Local interactive developer playground
│
├── packages/
│   ├── advisor-types/     # Shared data contracts, Zod schemas & models
│   ├── analytics-core/    # Core deterministic analytics engine
│   ├── analytics-adapters/# Data normalization and mapping utilities
│   ├── advisor-sdk/       # Official TypeScript client for SaaS API
│   ├── advisor-react/     # React hooks & UI components
│   └── charlie-the-business-advisor/ # Public umbrella npm package
│
├── examples/
│   ├── nextjs-integration/
│   ├── nodejs-integration/
│   └── laravel-integration/
│
├── docs/
│   └── architecture/      # Architecture Decision Records (ADRs) & Specs
│
└── infrastructure/        # Docker Compose & service definitions
```

---

## Quick Start (Open-Source Analytics)

```bash
npm install charlie-the-business-advisor
# or
pnpm add charlie-the-business-advisor
```

```typescript
import { Charlie } from "charlie-the-business-advisor";

const charlie = new Charlie();

const report = charlie.analyze({
  currency: "NGN",
  orders: [
    {
      id: "ord_001",
      customerId: "cust_101",
      createdAt: "2026-03-01T10:00:00Z",
      status: "completed",
      totalMinorUnits: 2500000, // ₦25,000.00
      subtotalMinorUnits: 2500000,
      currency: "NGN",
      items: [
        {
          id: "item_1",
          productId: "prod_widget_a",
          productName: "Premium Ergonomic Chair",
          quantity: 1,
          unitPriceMinorUnits: 2500000,
          totalPriceMinorUnits: 2500000,
          unitCostMinorUnits: 1500000, // ₦15,000.00 COGS
        }
      ]
    }
  ]
});

console.log(report.sales.summary.netRevenueFormatted); // ₦25,000.00
console.log(report.pareto.topContributors);
console.log(report.customers.retention.repeatPurchaseRate);
```

---

## Documentation

Full architectural decisions, integration guides, and API references are documented in [docs/architecture/](docs/architecture/).
