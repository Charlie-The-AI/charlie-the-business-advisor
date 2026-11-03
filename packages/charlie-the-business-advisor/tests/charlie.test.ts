import { describe, it, expect } from "vitest";
import { Charlie } from "../src/index.js";
import { Order } from "@charlie/advisor-types";

describe("Charlie the Business Advisor — Public Client", () => {
  const sampleOrders: Order[] = [
    {
      id: "ord_101",
      status: "completed",
      currency: "NGN",
      createdAt: "2026-03-01T10:00:00Z",
      customerId: "cust_1",
      customerName: "Kemi Adeleke",
      subtotalMinorUnits: 5000000, // ₦50,000.00
      taxMinorUnits: 0,
      shippingMinorUnits: 0,
      discountMinorUnits: 0,
      totalMinorUnits: 5000000,
      refundMinorUnits: 0,
      tags: [],
      items: [
        {
          id: "item_1",
          productId: "prod_1",
          productName: "Solar Inverter 1kVA",
          category: "Energy",
          quantity: 1,
          unitPriceMinorUnits: 5000000,
          totalPriceMinorUnits: 5000000,
          unitCostMinorUnits: 3500000,
        },
      ],
    },
    {
      id: "ord_102",
      status: "completed",
      currency: "NGN",
      createdAt: "2026-03-05T12:00:00Z",
      customerId: "cust_2",
      customerName: "Emeka Obi",
      subtotalMinorUnits: 15000000, // ₦150,000.00
      taxMinorUnits: 0,
      shippingMinorUnits: 0,
      discountMinorUnits: 0,
      totalMinorUnits: 15000000,
      refundMinorUnits: 0,
      tags: [],
      items: [
        {
          id: "item_2",
          productId: "prod_2",
          productName: "Solar Battery 200Ah",
          category: "Energy",
          quantity: 1,
          unitPriceMinorUnits: 15000000,
          totalPriceMinorUnits: 15000000,
          unitCostMinorUnits: 11000000,
        },
      ],
    },
  ];

  it("analyzes business orders with standard developer API", () => {
    const charlie = new Charlie();
    const report = charlie.analyze({
      orders: sampleOrders,
      currency: "NGN",
    });

    // Check sales
    expect(report.sales.netRevenueMinorUnits).toBe(20000000); // ₦200,000.00
    expect(report.sales.netRevenueFormatted).toBe("₦200,000.00");
    expect(report.sales.totalCompletedOrders).toBe(2);

    // Check Pareto
    expect(report.pareto.products.contributors.length).toBe(2);
    expect(report.pareto.products.contributors[0]?.productId ?? (report.pareto.products.contributors[0] as any)?.id).toBe("prod_2");

    // Check Customers
    expect(report.customers.uniqueCustomersCount).toBe(2);
    expect(report.customers.repeatPurchaseRatePercentage).toBe(0);

    // Check Products
    expect(report.products.bestSellersByRevenue[0]?.productId).toBe("prod_2");
    expect(report.products.overallGrossMarginPercentage).toBeGreaterThan(0);
  });

  it("exposes standalone modular analytics methods", () => {
    const charlie = new Charlie({ defaultCurrency: "USD" });

    const sales = charlie.sales(sampleOrders, "NGN");
    expect(sales.netRevenueMinorUnits).toBe(20000000);

    const customers = charlie.customers(sampleOrders, "NGN");
    expect(customers.uniqueCustomersCount).toBe(2);

    const products = charlie.products(sampleOrders, "NGN");
    expect(products.totalProductsSold).toBe(2);

    const pareto = charlie.pareto(sampleOrders, "category", "NGN");
    expect(pareto.totalContributors).toBe(1);
    expect(pareto.contributors[0]?.name).toBe("Energy");
  });

  it("provides integrated adapter factories", () => {
    const charlie = new Charlie();
    const laravelAdapter = charlie.laravelAdapter("NGN");
    expect(laravelAdapter).toBeDefined();
    expect(typeof laravelAdapter.normalize).toBe("function");
    expect(typeof laravelAdapter.normalizeBatch).toBe("function");
  });
});
