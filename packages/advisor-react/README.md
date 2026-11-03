# @charlie-the-ai/advisor-react ⚛️

> Official React hooks and UI visualization components for Charlie the Business Advisor.

[![npm version](https://img.shields.io/npm/v/@charlie-the-ai/advisor-react.svg)](https://www.npmjs.com/package/@charlie-the-ai/advisor-react)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![React 18 & 19](https://img.shields.io/badge/React-18%20%7C%2019-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

---

## Overview

`@charlie-the-ai/advisor-react` delivers battle-tested React hooks and plug-and-play UI components for building analytics dashboards, Pareto distribution visualizations, and AI advisory chat interfaces in **Next.js (App Router & Pages Router)**, **Remix**, **Vite**, and **React Native Web**.

### Key Features

- **Declarative Hooks**: Compute analytics client-side or consume SaaS endpoints seamlessly.
  - `useBusinessAnalytics`: Real-time reactive calculation of sales summaries, Pareto curves, and customer RFM.
  - `useBusinessRecommendations`: Fetch and act upon AI-generated business recommendations.
  - `useAdvisorChat`: Interactive conversational advisory chat with history and streaming support.
- **Embedded Visualizations**:
  - `<ParetoChart />`: Beautiful 80/20 distribution cards highlighting vital few revenue drivers.
  - `<MetricBadge />`: Trend indicators displaying quantitative values with percentage change badges.
  - `<RecommendationWidget />`: Actionable recommendation cards with impact estimates and evidence metrics.
- **Framework Native**: Fully compatible with Next.js 15 Server and Client Components (`'use client'`).

---

## Installation

```bash
# npm
npm install @charlie-the-ai/advisor-react @charlie-the-ai/advisor-types @charlie-the-ai/analytics-core

# pnpm
pnpm add @charlie-the-ai/advisor-react @charlie-the-ai/advisor-types @charlie-the-ai/analytics-core

# yarn
yarn add @charlie-the-ai/advisor-react @charlie-the-ai/advisor-types @charlie-the-ai/analytics-core
```

### Peer Dependencies
- `react >= 18.0.0`
- `react-dom >= 18.0.0`

---

## Quick Start

### 1. Configure the Provider

Wrap your application (or dashboard layout) with `CharlieProvider`:

```tsx
// app/providers.tsx (Next.js App Router)
'use client';

import { CharlieProvider } from '@charlie-the-ai/advisor-react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CharlieProvider
      config={{
        currency: 'USD',
        timezone: 'UTC',
        // Optional SaaS cloud settings:
        // apiUrl: 'https://api.charlieadvisor.com',
        // apiKey: process.env.NEXT_PUBLIC_CHARLIE_API_KEY,
      }}
    >
      {children}
    </CharlieProvider>
  );
}
```

### 2. Client-Side Analytics Hook

Compute instant business analytics directly from your order state:

```tsx
// components/AnalyticsDashboard.tsx
'use client';

import {
  useBusinessAnalytics,
  ParetoChart,
  MetricBadge,
} from '@charlie-the-ai/advisor-react';
import type { Order } from '@charlie-the-ai/advisor-types';

interface DashboardProps {
  orders: Order[];
}

export function AnalyticsDashboard({ orders }: DashboardProps) {
  const { sales, pareto, customers, hasData } = useBusinessAnalytics(orders, {
    currency: 'USD',
    paretoThresholdPercentage: 80,
  });

  if (!hasData || !sales) {
    return <div>No order data available for analysis.</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Metric KPI Badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <MetricBadge
          label="Net Revenue"
          value={sales.netRevenueFormatted}
          changePercentage={sales.periodComparison?.netRevenueChangePercentage}
        />
        <MetricBadge
          label="Total Orders"
          value={sales.totalOrders.toLocaleString()}
          changePercentage={sales.periodComparison?.ordersChangePercentage}
        />
        <MetricBadge
          label="Average Order Value"
          value={sales.averageOrderValueFormatted}
        />
      </div>

      {/* 80/20 Pareto Concentration Chart */}
      {pareto && (
        <ParetoChart
          contributors={pareto.contributors}
          targetThresholdPercentage={80}
        />
      )}
    </div>
  );
}
```

### 3. AI Recommendations & Conversational Advisory Chat

```tsx
// components/AdvisorChat.tsx
'use client';

import { useAdvisorChat, RecommendationWidget } from '@charlie-the-ai/advisor-react';

export function AdvisorChat() {
  const { messages, input, setInput, sendMessage, loading } = useAdvisorChat({
    businessId: 'biz_store_1',
  });

  return (
    <div style={{ padding: '16px', background: '#0f172a', borderRadius: '12px', color: '#fff' }}>
      <h3>Charlie AI Advisor</h3>
      
      <div style={{ height: '300px', overflowY: 'auto', marginBottom: '16px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ margin: '8px 0', textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            <span style={{ fontWeight: 600 }}>{msg.role === 'user' ? 'You' : 'Charlie'}: </span>
            <span>{msg.content}</span>
          </div>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            sendMessage(input);
            setInput('');
          }
        }}
        style={{ display: 'flex', gap: '8px' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Charlie about your revenue or churn..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: '6px' }}
        />
        <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
```

---

## Component API Reference

### `<ParetoChart />`
Visualizes the cumulative 80/20 revenue concentration curve.
- `contributors: ParetoContributor[]`: Array of ranked contributors with name, revenue, and cumulative share.
- `targetThresholdPercentage?: number`: Cumulative threshold line (default: `80`).
- `className?: string`: Custom CSS class.

### `<MetricBadge />`
Displays a high-level KPI card with an optional period-over-period percentage badge.
- `label: string`: Metric label (e.g. "Net Revenue").
- `value: string`: Formatted value (e.g. "$14,500.00").
- `changePercentage?: number | null`: Period comparison percentage (+12.4%, -3.1%).
- `trend?: "positive" | "negative" | "neutral"`: Override badge color.

### `<RecommendationWidget />`
Displays an actionable growth recommendation generated by Charlie's AI.
- `recommendation: Recommendation`: Structured recommendation object.
- `onApply?: (recId: string) => void`: Optional callback when user clicks "Apply Strategy".

---

## Related Packages

- [`@charlie-the-ai/advisor-types`](https://www.npmjs.com/package/@charlie-the-ai/advisor-types): TypeScript definitions and schemas.
- [`@charlie-the-ai/analytics-core`](https://www.npmjs.com/package/@charlie-the-ai/analytics-core): Pure calculation engine.
- [`charlie-the-business-advisor`](https://www.npmjs.com/package/charlie-the-business-advisor): The unified umbrella SDK.

---

## License

MIT © 2026 Charlie the Business Advisor Contributors
