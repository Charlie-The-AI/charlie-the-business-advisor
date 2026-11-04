import { describe, it, expect } from "vitest";
import {
  calculateSalesSummary,
  calculatePareto,
  calculateCustomerAnalytics,
  createAnalyticsSnapshot,
} from "../src/index.js";
import { CharlieOrder, CharlieCustomer } from "@charlie-the-ai/advisor-types";

describe("Analytics Engine with CharlieOrder and CharlieCustomer", () => {
  const sampleOrders: CharlieOrder[] = [
    {
      id: "CH-001",
      customerId: "CUS-1",
      placedAt: "2026-11-01T10:00:00Z",
      currency: "NGN",
      status: "completed",
      items: [
        {
          productId: "PROD-A",
          productName: "Premium Jollof Rice",
          quantity: 2,
          unitPriceMinor: 250000, // ₦2,500.00
          discountMinor: 0,
        },
      ],
      subtotalMinor: 500000,
      discountMinor: 0,
      taxMinor: 0,
      shippingMinor: 50000,
      totalMinor: 550000, // ₦5,500.00
      refundedMinor: 0,
    },
    {
      id: "CH-002",
      customerId: "CUS-2",
      placedAt: "2026-11-02T12:00:00Z",
      currency: "NGN",
      status: "completed",
      items: [
        {
          productId: "PROD-B",
          productName: "Fried Plantain Platter",
          quantity: 1,
          unitPriceMinor: 150000, // ₦1,500.00
          discountMinor: 0,
        },
      ],
      subtotalMinor: 150000,
      discountMinor: 0,
      taxMinor: 0,
      shippingMinor: 0,
      totalMinor: 150000,
      refundedMinor: 0,
    },
    {
      id: "CH-003",
      customerId: "CUS-1", // Repeat customer!
      placedAt: "2026-11-05T14:00:00Z",
      currency: "NGN",
      status: "completed",
      items: [
        {
          productId: "PROD-A",
          productName: "Premium Jollof Rice",
          quantity: 1,
          unitPriceMinor: 250000,
          discountMinor: 0,
        },
      ],
      subtotalMinor: 250000,
      discountMinor: 0,
      taxMinor: 0,
      shippingMinor: 0,
      totalMinor: 250000,
      refundedMinor: 0,
    },
  ];

  const sampleCustomers: CharlieCustomer[] = [
    {
      id: "CUS-1",
      name: "Bimbo Adebayo",
      email: "bimbo@example.ng",
      country: "NG",
      region: "Lagos",
    },
    {
      id: "CUS-2",
      name: "Emeka Okafor",
      email: "emeka@example.ng",
      country: "NG",
      region: "Enugu",
    },
    {
      id: "CUS-3", // Customer with 0 orders
      name: "Tunde Bakare",
      email: "tunde@example.ng",
      country: "NG",
      region: "Abuja",
    },
  ];

  it("calculates sales summary deterministically from CharlieOrders", () => {
    const sales = calculateSalesSummary({
      orders: sampleOrders,
      currency: "NGN",
    });

    expect(sales.totalOrders).toBe(3);
    expect(sales.totalCompletedOrders).toBe(3);
    expect(sales.grossSalesMinorUnits).toBe(900000); // 500k + 150k + 250k = ₦9,000.00
    expect(sales.netRevenueMinorUnits).toBe(950000); // (550k) + (150k) + (250k) = ₦9,500.00
    expect(sales.netRevenueFormatted).toBe("₦9,500.00");
  });

  it("calculates Pareto 80/20 concentration from CharlieOrders", () => {
    const snapshot = createAnalyticsSnapshot({
      businessId: "biz_restaurant",
      currency: "NGN",
      period: {
        from: "2026-11-01T00:00:00Z",
        to: "2026-11-30T23:59:59Z",
      },
      orders: sampleOrders,
      customers: sampleCustomers,
    });

    expect(snapshot.snapshotId).toMatch(/^snap_[0-9a-f]+/);
    expect(snapshot.pareto.products.contributors.length).toBe(2);
    // Product A has 2 * 250k + 1 * 250k = 750k revenue (top contributor)
    expect(snapshot.pareto.products.contributors[0]?.name).toBe("Premium Jollof Rice");
    expect(snapshot.pareto.products.contributors[0]?.revenueMinorUnits).toBe(750000);
  });

  it("calculates customer metrics with known customer profiles and repeat purchases", () => {
    const customerAnalytics = calculateCustomerAnalytics({
      orders: sampleOrders,
      customers: sampleCustomers,
      currency: "NGN",
    });

    // 3 total known customers, 2 active purchasing, 1 repeat customer (CUS-1)
    expect(customerAnalytics.uniqueCustomersCount).toBe(3);
    expect(customerAnalytics.repeatCustomersCount).toBe(1);
    expect(customerAnalytics.repeatPurchaseRatePercentage).toBe(50); // 1 repeat out of 2 active
  });
});
