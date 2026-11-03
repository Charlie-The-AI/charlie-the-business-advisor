import { describe, it, expect } from "vitest";
import { calculateProductAnalytics } from "../src/products.js";
import { createMockOrders } from "./fixtures/mock-orders.js";

describe("Product Analytics & Margins", () => {
  it("ranks best sellers by revenue and units accurately", () => {
    const orders = createMockOrders();
    const result = calculateProductAnalytics({ orders, currency: "NGN" });

    expect(result.totalProductsSold).toBeGreaterThan(0);
    expect(result.totalUnitsSold).toBeGreaterThan(0);
    expect(result.bestSellersByRevenue.length).toBeGreaterThan(0);
    expect(result.bestSellersByUnits.length).toBeGreaterThan(0);

    // Best seller by revenue in mock dataset should be Electric Standing Desk (₦100,000.00)
    const topRevenueProduct = result.bestSellersByRevenue[0];
    expect(topRevenueProduct?.productId).toBe("prod_desk");
    expect(topRevenueProduct?.revenueMinorUnits).toBe(10000000);

    // Best seller by volume in mock dataset: Ergonomic Chair (2) or Laptop Stand (3)
    const topVolumeProduct = result.bestSellersByUnits[0];
    expect(topVolumeProduct?.unitsSold).toBe(3); // Laptop Stand had 3 units
    expect(topVolumeProduct?.productId).toBe("prod_stand");
  });

  it("calculates gross profit and margins only when cost data is present", () => {
    const orders = createMockOrders();
    const result = calculateProductAnalytics({ orders, currency: "NGN" });

    // Standing desk has unit cost ₦65,000, revenue ₦100,000 -> gross profit ₦35,000
    const desk = result.bestSellersByRevenue.find((p) => p.productId === "prod_desk");
    expect(desk?.hasCostData).toBe(true);
    expect(desk?.grossProfitMinorUnits).toBe(3500000);
    expect(desk?.grossMarginPercentage).toBe(35); // 35% margin

    // USB Cable in ord_007 had NO cost data
    const cable = result.worstPerformersByRevenue.find((p) => p.productId === "prod_cable");
    expect(cable?.hasCostData).toBe(false);
    expect(cable?.grossProfitMinorUnits).toBeNull();
    expect(cable?.grossMarginPercentage).toBeNull();

    expect(result.missingCostProductCount).toBe(1);
    expect(result.trackedProductsWithCostCount).toBeGreaterThan(0);
  });

  it("breaks down sales by category", () => {
    const orders = createMockOrders();
    const result = calculateProductAnalytics({ orders, currency: "NGN" });

    expect(result.categories.length).toBeGreaterThan(0);
    const furnitureCat = result.categories.find((c) => c.category === "Furniture");
    expect(furnitureCat).toBeDefined();
    expect(furnitureCat?.unitsSold).toBeGreaterThan(0);
    expect(furnitureCat?.revenuePercentage).toBeGreaterThan(0);
  });
});
