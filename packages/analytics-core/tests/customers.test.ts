import { describe, it, expect } from "vitest";
import { calculateCustomerAnalytics } from "../src/customers.js";
import { createMockOrders } from "./fixtures/mock-orders.js";

describe("Customer Analytics & Retention", () => {
  it("calculates customer metrics, repeat purchase rate, and ARPU accurately", () => {
    const orders = createMockOrders();
    // In mock orders, completed/partially_refunded orders:
    // ord_001: cust_alice
    // ord_002: cust_bob
    // ord_003: cust_alice (repeat!)
    // ord_004: cust_charlie
    // ord_007: cust_femi
    // Total unique customers: 4 (Alice, Bob, Charlie, Femi)
    // Repeat customers: 1 (Alice has 2 orders)
    // Repeat purchase rate: 1 / 4 = 25%

    const result = calculateCustomerAnalytics({
      orders,
      currency: "NGN",
      referenceDate: new Date("2026-03-31T23:59:59Z"),
    });

    expect(result.isInsufficientData).toBe(false);
    expect(result.uniqueCustomersCount).toBe(4);
    expect(result.repeatCustomersCount).toBe(1);
    expect(result.repeatPurchaseRatePercentage).toBe(25);
    expect(result.averagePurchaseFrequency).toBe(1.25); // 5 completed orders / 4 customers
    expect(result.averageRevenuePerCustomerMinorUnits).toBeGreaterThan(0);
    expect(result.averageRevenuePerCustomerFormatted).toMatch(/^₦/);
    expect(result.rfmSegments.length).toBe(4);
    expect(result.cohorts.length).toBeGreaterThan(0);
  });

  it("assigns valid RFM segments and scores", () => {
    const orders = createMockOrders();
    const result = calculateCustomerAnalytics({
      orders,
      currency: "NGN",
      referenceDate: new Date("2026-03-31T23:59:59Z"),
    });

    const aliceScore = result.rfmSegments.find((s) => s.customerId === "cust_alice");
    expect(aliceScore).toBeDefined();
    expect(aliceScore?.frequency).toBe(2);
    expect(aliceScore?.recencyScore).toBeGreaterThanOrEqual(1);
    expect(aliceScore?.recencyScore).toBeLessThanOrEqual(5);
    expect(aliceScore?.segment).toBeDefined();
  });

  it("builds customer cohorts tracking retention", () => {
    const orders = createMockOrders();
    const result = calculateCustomerAnalytics({
      orders,
      currency: "NGN",
    });

    expect(result.cohorts.length).toBeGreaterThan(0);
    const marchCohort = result.cohorts.find((c) => c.cohortMonth === "2026-03");
    expect(marchCohort).toBeDefined();
    expect(marchCohort?.cohortSize).toBe(4);
    expect(marchCohort?.retention[0]?.monthIndex).toBe(0);
    expect(marchCohort?.retention[0]?.activeCustomers).toBe(4);
    expect(marchCohort?.retention[0]?.retentionRatePercentage).toBe(100);
  });

  it("returns explicit insufficient-data result when customer identifiers are missing rather than fabricating numbers", () => {
    // Orders with no customerId or customerEmail
    const anonymousOrders = [
      {
        id: "anon_1",
        status: "completed" as const,
        currency: "NGN",
        createdAt: "2026-03-01T10:00:00Z",
        subtotalMinorUnits: 500000,
        taxMinorUnits: 0,
        shippingMinorUnits: 0,
        discountMinorUnits: 0,
        totalMinorUnits: 500000,
        refundMinorUnits: 0,
        items: [
          {
            id: "anon_item_1",
            productId: "prod_1",
            productName: "Item 1",
            quantity: 1,
            unitPriceMinorUnits: 500000,
            totalPriceMinorUnits: 500000,
          },
        ],
      },
    ];

    const result = calculateCustomerAnalytics({
      orders: anonymousOrders,
      currency: "NGN",
    });

    expect(result.isInsufficientData).toBe(true);
    expect(result.uniqueCustomersCount).toBe(0);
    expect(result.repeatPurchaseRatePercentage).toBeNull();
    expect(result.averagePurchaseFrequency).toBeNull();
    expect(result.averageRevenuePerCustomerMinorUnits).toBeNull();
    expect(result.dataWarnings.length).toBeGreaterThan(0);
    expect(result.dataWarnings[0]).toContain("lacked customer identifiers");
  });
});
