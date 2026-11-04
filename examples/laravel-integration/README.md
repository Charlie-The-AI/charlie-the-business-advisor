# Charlie Laravel Integration Example

This example demonstrates how an existing Laravel e-commerce application (such as WooCommerce, bagisto, or a custom Eloquent app) integrates with **Charlie the Business Advisor**.

## Integration Flow

```text
Laravel Eloquent Models (Order, OrderItem, Customer)
          │
          ▼
Eloquent Serialization to CharlieOrder Array
          │
          ▼
Charlie Node/Next.js Service (Local or Internal Microservice)
          │
          ├── POST /api/charlie/analyze  -> Deterministic Snapshot
          ├── POST /api/charlie/advise   -> Grounded Recommendations
          └── POST /api/charlie/chat     -> Conversational Business AI
```

## How It Works

1. **`CharlieAnalyticsService`** (`app/Services/CharlieAnalyticsService.php`):
   Sends orders to your internal Charlie endpoint (`http://localhost:3000`).
2. **`SyncAnalyticsSnapshotCommand`** (`app/Console/Commands/SyncAnalyticsSnapshotCommand.php`):
   Artisan command to calculate analytics snapshots on a schedule.

Zero proprietary SaaS keys, zero paid subscriptions, 100% open-source.
