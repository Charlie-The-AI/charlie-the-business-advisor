# Charlie Laravel Integration Example

This example demonstrates how an existing Laravel e-commerce or SaaS platform integrates with **Charlie the Business Advisor**.

## Integration Architecture

```text
Laravel Application (Orders & Items)
          │
          ▼
Charlie Order Adapter (Major to Minor Currency, Field Mapping)
          │
          ▼
Analytics Snapshot Generation (Deterministic Sha-256 ID, Strict Decimal Math)
          │
          ▼
Charlie SaaS API (`POST /api/v1/analytics/snapshots`)
          │
          ▼
AI Recommendations & Conversational Chat
```

## Included Components

- **`CharlieAnalyticsService`** (`app/Services/CharlieAnalyticsService.php`):
  Lightweight HTTP service client for snapshot ingestion, recommendation polling, and business chat queries.
- **`SyncAnalyticsSnapshotCommand`** (`app/Console/Commands/SyncAnalyticsSnapshotCommand.php`):
  Artisan command (`php artisan charlie:sync-analytics`) to run on schedule (e.g., daily at midnight via Laravel Scheduler).
