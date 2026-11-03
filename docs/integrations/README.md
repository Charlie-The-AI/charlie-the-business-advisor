# Integration Guides

Charlie the Business Advisor is designed to be framework-agnostic. You can integrate it with any backend, frontend, or data storage system.

---

## 1. Node.js / Express Integration

Integrate Charlie directly into your API services to calculate metrics on request or in a background queue.

```typescript
import express from 'express';
import { CharlieAdvisor } from 'charlie-the-business-advisor';

const app = express();
app.use(express.json());

const advisor = new CharlieAdvisor({ currency: 'USD' });

app.post('/api/analytics/snapshot', async (req, res) => {
  const { businessId, period, transactions } = req.body;

  const snapshot = advisor.generateSnapshot({
    businessId,
    period,
    transactions,
  });

  return res.json({ success: true, data: snapshot });
});

app.listen(4000, () => console.log('Analytics service on port 4000'));
```

See working sample in `examples/nodejs-integration`.

---

## 2. Next.js (App Router & React)

Use `@charlie/advisor-react` to build interactive analytics interfaces with reactive hooks.

```tsx
'use client';

import { useCharlieAnalytics } from '@charlie/advisor-react';

export default function AnalyticsDashboard({ initialTransactions }) {
  const { snapshot, isLoading } = useCharlieAnalytics({
    transactions: initialTransactions,
    businessId: 'biz_01',
  });

  if (isLoading) return <div>Computing metrics...</div>;

  return (
    <div>
      <h2>Revenue: ${(snapshot.metrics.revenue.total / 100).toFixed(2)}</h2>
      <p>Orders: {snapshot.metrics.orders.count}</p>
      <p>AOV: ${(snapshot.metrics.revenue.averageOrderValue / 100).toFixed(2)}</p>
    </div>
  );
}
```

See working sample in `examples/nextjs-integration`.

---

## 3. Laravel / PHP Integration

Use `@charlie/analytics-adapters` to ingest Laravel Eloquent models or database rows directly into Charlie.

```php
// In your Laravel Controller or Command:
$orders = Order::with('items')->whereBetween('created_at', [$start, $end])->get();

// Export as standardized JSON payload for Charlie:
$payload = [
    'businessId' => $business->id,
    'period' => ['startDate' => $start->toISOString(), 'endDate' => $end->toISOString()],
    'transactions' => $orders->map(fn($o) => [
        'id' => $o->uuid,
        'businessId' => $business->id,
        'orderId' => (string) $o->id,
        'customerId' => (string) $o->customer_id,
        'amount' => (int) ($o->total * 100), // convert to minor unit cents
        'currency' => 'USD',
        'timestamp' => $o->created_at->toISOString(),
        'status' => 'completed',
        'items' => $o->items->map(fn($item) => [
            'productId' => (string) $item->product_id,
            'name' => $item->name,
            'quantity' => $item->quantity,
            'unitPrice' => (int) ($item->unit_price * 100),
            'totalPrice' => (int) ($item->total_price * 100),
        ]),
    ]),
];
```

See working sample in `examples/laravel-integration`.
