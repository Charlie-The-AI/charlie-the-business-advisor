import { describe, it, expect } from "vitest";
import { createAnalyticsSnapshot } from "../src/snapshot.js";
import { AnalyticsSnapshotSchema } from "@charlie/advisor-types";
import { createMockOrders } from "./fixtures/mock-orders.js";

describe("Analytics Snapshot Generation & Schema Validation", () => {
  it("generates a valid, standardized AnalyticsSnapshot conforming to Zod schema", () => {
    const orders = createMockOrders();
    const snapshot = createAnalyticsSnapshot({
      businessId: "biz_nigeria_store",
      currency: "NGN",
      period: {
        from: "2026-03-01T00:00:00Z",
        to: "2026-03-31T23:59:59Z",
        timezone: "Africa/Lagos",
      },
      orders,
    });

    // Validate with Zod parser to ensure 100% contract compliance
    const parsed = AnalyticsSnapshotSchema.safeParse(snapshot);
    if (!parsed.success) {
      console.error(JSON.stringify(parsed.error.format(), null, 2));
    }
    expect(parsed.success).toBe(true);

    expect(snapshot.businessId).toBe("biz_nigeria_store");
    expect(snapshot.currency).toBe("NGN");
    expect(snapshot.schemaVersion).toBe("1.0.0");
    expect(snapshot.snapshotId).toMatch(/^snap_[0-9a-f]{16}$/);

    // Sales checks
    expect(snapshot.sales.totalCompletedOrders).toBe(5);
    expect(snapshot.sales.netRevenueMinorUnits).toBe(24572500);

    // Pareto checks
    expect(snapshot.pareto.products.contributors.length).toBeGreaterThan(0);
    expect(snapshot.pareto.customers.contributors.length).toBeGreaterThan(0);
    expect(snapshot.pareto.categories.contributors.length).toBeGreaterThan(0);

    // Data quality checks
    expect(snapshot.dataQuality.totalOrdersAnalyzed).toBe(7);
    expect(snapshot.dataQuality.missingCostItemsCount).toBe(3); // Line items in ord_005, ord_006, ord_007 lacked cost
    expect(snapshot.dataQuality.warnings.length).toBeGreaterThan(0);
    expect(snapshot.dataQuality.scorePercentage).toBeGreaterThanOrEqual(70);
  });

  it("produces identical deterministic snapshotId for identical data", () => {
    const orders = createMockOrders();
    const snap1 = createAnalyticsSnapshot({
      businessId: "biz_test",
      currency: "NGN",
      period: { from: "2026-03-01T00:00:00Z", to: "2026-03-31T23:59:59Z" },
      orders,
    });

    const snap2 = createAnalyticsSnapshot({
      businessId: "biz_test",
      currency: "NGN",
      period: { from: "2026-03-01T00:00:00Z", to: "2026-03-31T23:59:59Z" },
      orders,
    });

    expect(snap1.snapshotId).toBe(snap2.snapshotId);
  });
});
