# Analytics Snapshots & SHA-256 Fingerprinting

An `AnalyticsSnapshot` is an immutable, mathematically complete representation of a business's operational performance across a defined time window.

Package: `@charlie-the-ai/analytics-core`

---

## 1. Snapshot Contract Structure

Every snapshot produced by Charlie includes:

```typescript
export interface AnalyticsSnapshot {
  snapshotId: string;                // SHA-256 fingerprint of all input parameters and metrics
  schemaVersion: "1.0.0";
  businessId: string;
  generatedAt: string;               // ISO 8601 generation timestamp
  currency: CurrencyCode;
  period: {
    from: string;
    to: string;
    timezone: string;
  };
  sales: SalesSummary;
  pareto: {
    products: ParetoResult;
    customers: ParetoResult;
    categories: ParetoResult;
  };
  customers: CustomerAnalytics;
  products: ProductAnalytics;
  trends: TrendAnalytics;
  dataQuality: {
    scorePercentage: number;
    warnings: string[];
  };
}
```

---

## 2. Why SHA-256 Fingerprinting Matters

Charlie hashes the normalized dataset, time window, and calculations to produce a deterministic `snapshotId`:

```text
snap_4f9a12c8b73e...
```

Benefits:
- **Reproducibility**: Any team member or auditor can recompute the snapshot from the same raw orders and obtain the exact same hash.
- **Cache Invalidation**: Perfect key for caching AI recommendations and dashboard widgets.
- **Audit Trail**: Proves that AI recommendations were generated against a specific, uncorrupted dataset.
