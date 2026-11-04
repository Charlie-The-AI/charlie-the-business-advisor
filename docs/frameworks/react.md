# React UI Integration (`@charlie-the-ai/advisor-react`)

`@charlie-the-ai/advisor-react` provides pre-built visual dashboard cards, interactive charts, and hooks for React applications.

Package: `@charlie-the-ai/advisor-react`

---

## 1. Components Overview

### `RevenueCard`
Renders net revenue, gross sales, completed orders, and AOV with period-over-period comparison badges.

```tsx
import { RevenueCard } from "@charlie-the-ai/advisor-react";

<RevenueCard sales={snapshot.sales} />
```

### `ParetoChart`
Renders an SVG distribution chart showing product or customer revenue concentration and highlighting the vital 80% contributors.

```tsx
import { ParetoChart } from "@charlie-the-ai/advisor-react";

<ParetoChart contributors={snapshot.pareto.products.contributors} targetThresholdPercentage={80} />
```

### `CustomerSegments`
Renders an RFM cohort breakdown (Champions, Loyal Customers, At Risk, etc.) with count and percentages.

```tsx
import { CustomerSegments } from "@charlie-the-ai/advisor-react";

<CustomerSegments customers={snapshot.customers} />
```

### `TopProductsChart`
Renders catalog items ranked by revenue with progress bars and percentage contributions.

```tsx
import { TopProductsChart } from "@charlie-the-ai/advisor-react";

<TopProductsChart products={snapshot.products} maxItems={5} />
```

### `RecommendationCard`
Renders an AI business recommendation with priority badges, action steps checklist, and grounding verification pills.

```tsx
import { RecommendationCard } from "@charlie-the-ai/advisor-react";

<RecommendationCard recommendation={recItem} onActionClick={(action) => console.log(action)} />
```

---

## 2. Hooks

### `useCharlieAnalytics`
Computes complete analytics snapshots directly in the browser or consumes an existing backend snapshot:

```tsx
import { useCharlieAnalytics } from "@charlie-the-ai/advisor-react";

function MyDashboard({ orders }) {
  const { sales, pareto, customers, products, hasData } = useCharlieAnalytics(orders, {
    currency: "USD",
  });

  if (!hasData) return <div>No orders yet.</div>;
  return <RevenueCard sales={sales} />;
}
```

### `useAdvisorChat`
Manages chat message history and communication with your backend chat endpoint:

```tsx
import { useAdvisorChat } from "@charlie-the-ai/advisor-react";

function ChatBox() {
  const { messages, sendMessage, isSending } = useAdvisorChat({
    apiEndpoint: "/api/charlie/chat",
  });

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>{m.content}</div>
      ))}
      <button onClick={() => sendMessage("What was my best selling item?")}>
        Ask Charlie
      </button>
    </div>
  );
}
```

---

## 3. Browser Security Guarantee

`@charlie-the-ai/advisor-react` never requires or exposes your server-side API keys (`OPENAI_API_KEY`, etc.). All AI interactions route cleanly through your backend or run offline.
