import { describe, it, expect } from "vitest";
import { calculateSalesSummary } from "../src/sales.js";
import { createMockOrders } from "./fixtures/mock-orders.js";

describe("Sales Summary Analytics", () => {
  it("calculates deterministic revenue recognition with net sales and GMV", () => {
    const orders = createMockOrders();
    const summary = calculateSalesSummary({ orders, currency: "NGN" });

    // Completed orders: ord_001, ord_002, ord_003, ord_004 (partially refunded), ord_007
    // Total orders: 7
    expect(summary.totalOrders).toBe(7);
    expect(summary.totalCompletedOrders).toBe(5);
    expect(summary.totalCancelledOrders).toBe(1);
    expect(summary.totalRefundedOrders).toBe(1);

    // Recognized Net Revenue:
    // ord_001: 5,075,000 - 0 = 5,075,000
    // ord_002: 12,125,000 - 0 = 12,125,000
    // ord_003: 1,762,500 - 0 = 1,762,500
    // ord_004: 6,650,000 - 2,000,000 (refund) = 4,650,000
    // ord_007: 960,000 - 0 = 960,000
    // Sum = 24,572,500 kobo (₦245,725.00)
    expect(summary.netRevenueMinorUnits).toBe(24572500);
    expect(summary.netRevenueFormatted).toBe("₦245,725.00");

    // Total refunds on all orders (ord_004 partial ₦20,000 + ord_006 full ₦12,250): ₦32,250.00
    expect(summary.totalRefundsMinorUnits).toBe(3225000);

    // Total discounts: ord_001 had 500,000
    expect(summary.totalDiscountsMinorUnits).toBe(500000);

    // Average Order Value (AOV): 24,572,500 / 5 = 4,914,500 kobo (₦49,145.00)
    expect(summary.averageOrderValueMinorUnits).toBe(4914500);
    expect(summary.averageOrderValueFormatted).toBe("₦49,145.00");

    // Periodic points generated
    expect(summary.periodicBreakdown.length).toBeGreaterThan(0);
  });

  it("calculates period-over-period growth rates accurately", () => {
    const currentOrders = createMockOrders();
    // Create previous period orders with known revenue of ₦200,000.00 (20,000,000 kobo)
    const prevOrders = [
      {
        id: "prev_001",
        status: "completed" as const,
        currency: "NGN",
        createdAt: "2026-02-15T10:00:00Z",
        subtotalMinorUnits: 20000000,
        taxMinorUnits: 0,
        shippingMinorUnits: 0,
        discountMinorUnits: 0,
        totalMinorUnits: 20000000,
        refundMinorUnits: 0,
        items: [
          {
            id: "prev_item_1",
            productId: "prod_chair",
            productName: "Ergonomic Office Chair",
            quantity: 8,
            unitPriceMinorUnits: 2500000,
            totalPriceMinorUnits: 20000000,
          },
        ],
      },
    ];

    const summary = calculateSalesSummary({
      orders: currentOrders,
      currency: "NGN",
      previousPeriodOrders: prevOrders,
    });

    // Current: 24,572,500 kobo, Prev: 20,000,000 kobo
    // Growth = (24,572,500 - 20,000,000) / 20,000,000 = +22.86% (+0.2286)
    expect(summary.periodOverPeriodRevenueGrowthRate).toBe(0.2286);
  });

  it("handles completely empty datasets safely without NaN or division by zero", () => {
    const summary = calculateSalesSummary({ orders: [], currency: "USD" });

    expect(summary.totalOrders).toBe(0);
    expect(summary.totalCompletedOrders).toBe(0);
    expect(summary.netRevenueMinorUnits).toBe(0);
    expect(summary.averageOrderValueMinorUnits).toBe(0);
    expect(summary.periodOverPeriodRevenueGrowthRate).toBeNull();
    expect(summary.periodicBreakdown).toEqual([]);
    expect(summary.netRevenueFormatted).toBe("$0.00");
  });
});
