# Charlie the Business Advisor 🎩📈

> **Your AI-Powered Business Growth Companion — 100% Free & Fully Open-Source**
>
> Deterministic business intelligence, Pareto (80/20) concentration analysis, customer RFM segmentation, and multi-provider AI business advisory with mathematical grounding verification.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/charlie-the-business-advisor.svg)](https://www.npmjs.com/package/charlie-the-business-advisor)
[![Node.js Support](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)

---

## 💡 The Core Principle

> **"Analytics calculates. AI interprets. Evidence validates."**

LLMs are probabilistic and notoriously unreliable at calculating financial numbers. Charlie enforces an uncompromising architectural boundary:
1. **Analytics calculates**: The TypeScript engine computes 100% of the financial numbers using deterministic integer arithmetic (minor currency units).
2. **AI interprets**: Your chosen AI model (OpenAI, Gemini, Claude, or offline Mock) receives verified numbers to identify strategic business opportunities.
3. **Evidence validates**: Charlie mathematically verifies every claim cited by the AI against the calculated snapshot before returning it to your application.

---

## ⚡ 5-Minute Quickstart

### 1. Install

```bash
npm install charlie-the-business-advisor
```

### 2. Run in 3 Lines of Code

```typescript
import { Charlie } from "charlie-the-business-advisor";

// 1. Initialize (runs 100% offline out-of-the-box!)
const charlie = new Charlie({ defaultCurrency: "USD" });

// 2. Deterministic Financial Analytics
const snapshot = charlie.analyze({ orders });
console.log(`Net Revenue: ${snapshot.sales.netRevenueFormatted}`);

// 3. Grounded AI Business Recommendations
const advice = await charlie.advise({ analytics: snapshot });
console.log(advice.recommendations[0].title);

// 4. Natural Language Business Chat
const reply = await charlie.chat({ question: "What is my best selling product?", analytics: snapshot });
console.log(reply.answer);
```

---

## 📦 Monorepo Architecture & Packages

Install the umbrella package `charlie-the-business-advisor` or use individual modular subpackages:

| Package | npm Package | Description | Documentation |
|---|---|---|---|
| **Umbrella SDK** | [`charlie-the-business-advisor`](https://www.npmjs.com/package/charlie-the-business-advisor) | High-level client, developer CLI, and unified entry point | [Guide](docs/getting-started/quickstart.md) |
| **Dataset Contracts** | [`@charlie-the-ai/advisor-types`](https://www.npmjs.com/package/@charlie-the-ai/advisor-types) | Canonical schemas (`CharlieOrder`, `CharlieCustomer`) & validation | [Docs](docs/datasets/charlie-order.md) |
| **Analytics Engine** | [`@charlie-the-ai/analytics-core`](https://www.npmjs.com/package/@charlie-the-ai/analytics-core) | Pure deterministic math: Sales, Pareto 80/20, RFM, Margins, Snapshots | [Docs](docs/analytics/sales-metrics.md) |
| **Database Adapters**| [`@charlie-the-ai/analytics-adapters`](https://www.npmjs.com/package/@charlie-the-ai/analytics-adapters) | Zero-database-change field mappings & batch error isolation | [Docs](docs/adapters/overview.md) |
| **Multi-Provider AI** | [`@charlie-the-ai/advisor-ai`](https://www.npmjs.com/package/@charlie-the-ai/advisor-ai) | OpenAI, Gemini, Claude, Mock provider & grounding verification | [Docs](docs/ai/providers.md) |
| **React UI Components** | [`@charlie-the-ai/advisor-react`](https://www.npmjs.com/package/@charlie-the-ai/advisor-react) | Accessible dashboard cards (`RevenueCard`, `ParetoChart`) & hooks | [Docs](docs/frameworks/react.md) |

---

## 🤖 Multi-Provider AI (Bring Your Own Key)

Charlie works with your existing AI keys or runs **completely offline**:

```env
# Optional — leave blank to run in 100% offline Mock mode
CHARLIE_AI_PROVIDER=openai     # "openai" | "gemini" | "anthropic" | "mock"
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
```

- **Zero Cloud Lock-in**: No Charlie account, no license keys, no monthly fees.
- **Privacy by Default**: Customer names and personal emails are never transmitted to external AI providers by default.
- **Hallucination Defense**: If an AI hallucinates a non-existent revenue number, Charlie automatically marks the recommendation as `flagged`.

---

## 🔌 Database Adapters (Zero Schema Changes)

Adapt your existing database tables into Charlie's canonical datasets in seconds:

```typescript
import { createOrderAdapter } from "charlie-the-business-advisor";

const adapter = createOrderAdapter({
  fields: {
    id: "invoice_no",
    customerId: "client_id",
    placedAt: "created_at",
    status: (row) => (row.is_paid ? "completed" : "pending"),
    totalMajor: "dollar_amount", // Automatically converted to minor unit integers
    items: (row) => row.items.map(it => ({
      productId: it.sku,
      productName: it.name,
      quantity: it.qty,
      unitPriceMinor: Math.round(it.price * 100),
    })),
  },
});

const orders = adapter.transformMany(rawDatabaseRows);
```

---

## 🛠️ Developer CLI

Scaffold your project configuration in one command:

```bash
# Initialize charlie.config.ts and .env.example
npx charlie-the-business-advisor init

# Check environment diagnostics and provider status
npx charlie-the-business-advisor doctor
```

---

## 🎨 React Dashboard Integration

Embed pre-built dashboard components in your React or Next.js 15 App Router application:

```tsx
'use client';

import {
  useCharlieAnalytics,
  RevenueCard,
  ParetoChart,
  CustomerSegments,
  TopProductsChart,
} from "@charlie-the-ai/advisor-react";

export function Dashboard({ orders }) {
  const { sales, pareto, customers, products, hasData } = useCharlieAnalytics(orders, {
    currency: "USD",
  });

  if (!hasData) return <div>No data available</div>;

  return (
    <div>
      <RevenueCard sales={sales} />
      <TopProductsChart products={products} />
      <CustomerSegments customers={customers} />
      <ParetoChart contributors={pareto.contributors} targetThresholdPercentage={80} />
    </div>
  );
}
```

---

## 📚 Complete Documentation

- **Getting Started**:
  - [5-Minute Quickstart](docs/getting-started/quickstart.md)
  - [Core Concepts & Philosophy](docs/getting-started/core-concepts.md)
  - [Installation Guide](docs/getting-started/installation.md)
- **Datasets**:
  - [CharlieOrder Specification](docs/datasets/charlie-order.md)
  - [CharlieCustomer Specification](docs/datasets/charlie-customer.md)
  - [Canonical Datasets Roadmap](docs/datasets/roadmap.md)
- **Database Adapters**:
  - [Adapters Overview](docs/adapters/overview.md)
  - [Declarative Field Mapping](docs/adapters/declarative-mapping.md)
  - [Custom Transform Functions & Error Handling](docs/adapters/custom-transform.md)
  - [Laravel Eloquent & SQL Guide](docs/adapters/eloquent.md)
- **Analytics Engine**:
  - [Sales & Deterministic Metrics](docs/analytics/sales-metrics.md)
  - [Pareto 80/20 & Concentration Analysis](docs/analytics/pareto-80-20.md)
  - [Customer RFM Segmentation](docs/analytics/rfm-segmentation.md)
  - [Product Margins & Performance](docs/analytics/product-performance.md)
  - [Snapshots & SHA-256 Fingerprints](docs/analytics/snapshots.md)
- **AI & Grounding**:
  - [AI Providers (OpenAI, Gemini, Claude, Mock)](docs/ai/providers.md)
  - [Grounding Verification & Hallucination Defense](docs/ai/grounding-verification.md)
  - [Conversational Business Chat](docs/ai/chat.md)
- **Framework Integrations**:
  - [Node.js & Express](docs/frameworks/nodejs.md)
  - [NestJS](docs/frameworks/nestjs.md)
  - [Next.js 15 App Router](docs/frameworks/nextjs.md)
  - [React UI Components & Hooks](docs/frameworks/react.md)
  - [Laravel](docs/frameworks/laravel.md)
- **Reference**:
  - [Troubleshooting & Common Issues](docs/troubleshooting.md)
  - [Frequently Asked Questions (FAQ)](docs/faq.md)
  - [Glossary of Terms](docs/glossary.md)

---

## 📄 License

MIT © Charlie the Business Advisor Contributors. Completely free and open-source.
