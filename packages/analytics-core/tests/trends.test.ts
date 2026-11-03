import { describe, it, expect } from "vitest";
import { calculateTrends } from "../src/trends.js";
import { PeriodicSalesPoint } from "@charlie/advisor-types";

describe("Trend Analytics & Anomaly Detection", () => {
  it("calculates moving averages accurately", () => {
    // 10 consecutive daily points with steady ₦10,000 revenue
    const points: PeriodicSalesPoint[] = Array.from({ length: 10 }, (_, i) => ({
      period: `2026-03-${String(i + 1).padStart(2, "0")}`,
      grossSalesMinorUnits: 1000000,
      netRevenueMinorUnits: 1000000,
      netRevenueFormatted: "₦10,000.00",
      orderCount: 2,
      averageOrderValueMinorUnits: 500000,
      averageOrderValueFormatted: "₦5,000.00",
    }));

    const trends = calculateTrends({ periodicSales: points, currency: "NGN" });

    expect(trends.sevenDayMovingAverage.length).toBe(10);
    expect(trends.thirtyDayMovingAverage.length).toBe(10);
    // All moving averages should be 1,000,000
    expect(trends.sevenDayMovingAverage[9]?.movingAverageMinorUnits).toBe(1000000);
    // Zero volatility when daily revenue is flat
    expect(trends.revenueVolatilityCoefficient).toBe(0);
    expect(trends.anomalies).toHaveLength(0);
  });

  it("detects statistically significant anomalies using z-score thresholding", () => {
    // 9 normal days with ~₦10,000 and 1 massive spike day of ₦100,000
    const points: PeriodicSalesPoint[] = Array.from({ length: 9 }, (_, i) => ({
      period: `2026-03-${String(i + 1).padStart(2, "0")}`,
      grossSalesMinorUnits: 1000000,
      netRevenueMinorUnits: 1000000,
      netRevenueFormatted: "₦10,000.00",
      orderCount: 2,
      averageOrderValueMinorUnits: 500000,
      averageOrderValueFormatted: "₦5,000.00",
    }));

    // Add spike on day 10
    points.push({
      period: "2026-03-10",
      grossSalesMinorUnits: 10000000,
      netRevenueMinorUnits: 10000000, // ₦100,000.00 (10x baseline)
      netRevenueFormatted: "₦100,000.00",
      orderCount: 15,
      averageOrderValueMinorUnits: 666667,
      averageOrderValueFormatted: "₦6,666.67",
    });

    const trends = calculateTrends({
      periodicSales: points,
      currency: "NGN",
      anomalyZScoreThreshold: 2.0,
    });

    expect(trends.anomalies.length).toBe(1);
    const spike = trends.anomalies[0];
    expect(spike?.date).toBe("2026-03-10");
    expect(spike?.type).toBe("spike");
    expect(spike?.zScore).toBeGreaterThan(2.0);
    expect(spike?.isSignificant).toBe(true);
    expect(spike?.description).toContain("Revenue spiked");
  });
});
