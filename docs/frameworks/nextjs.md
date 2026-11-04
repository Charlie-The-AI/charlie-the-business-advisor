# Next.js 15 App Router Integration

Integrate Charlie with Next.js 15 App Router using server-side Route Handlers and client-side React dashboard components.

---

## 1. Server Route Handlers

Create route handlers under `src/app/api/charlie/`:

### `src/app/api/charlie/analyze/route.ts`
```typescript
import { NextResponse } from "next/server";
import { Charlie } from "charlie-the-business-advisor";

const charlie = new Charlie({ defaultCurrency: "USD" });

export async function POST(req: Request) {
  try {
    const { orders, customers, currency } = await req.json();
    const snapshot = charlie.analyze({ orders, customers, currency });
    return NextResponse.json({ success: true, snapshot });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
```

### `src/app/api/charlie/advise/route.ts`
```typescript
import { NextResponse } from "next/server";
import { Charlie } from "charlie-the-business-advisor";

const charlie = new Charlie({ defaultCurrency: "USD" });

export async function POST(req: Request) {
  try {
    const { orders, analytics, objective } = await req.json();
    const result = await charlie.advise({ orders, analytics, objective });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
```

---

## 2. Dashboard UI Page

```tsx
// src/app/dashboard/page.tsx
'use client';

import {
  useCharlieAnalytics,
  RevenueCard,
  ParetoChart,
  CustomerSegments,
  TopProductsChart,
  RecommendationCard,
} from "@charlie-the-ai/advisor-react";

export default function DashboardPage({ orders }: { orders: any[] }) {
  const { sales, pareto, customers, products, hasData } = useCharlieAnalytics(orders, {
    currency: "USD",
  });

  if (!hasData || !sales) return <div>Loading business metrics...</div>;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
      <RevenueCard sales={sales} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "24px" }}>
        {products && <TopProductsChart products={products} />}
        {customers && <CustomerSegments customers={customers} />}
      </div>

      {pareto && (
        <div style={{ marginTop: "24px" }}>
          <ParetoChart contributors={pareto.contributors} targetThresholdPercentage={80} />
        </div>
      )}
    </div>
  );
}
```
