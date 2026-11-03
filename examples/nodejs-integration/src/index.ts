import { Charlie, Order, ParetoContributor, RfmCustomerScore } from "charlie-the-business-advisor";

console.log("=================================================================");
console.log("  🎩 CHARLIE THE BUSINESS ADVISOR — OPEN-SOURCE ENGINE DEMO  ");
console.log("=================================================================\n");

const charlie = new Charlie({ defaultCurrency: "NGN" });

// Sample raw e-commerce orders for a Lagos-based tech & lifestyle merchant
const orders: Order[] = [
  {
    id: "ord_1001",
    status: "completed",
    currency: "NGN",
    createdAt: "2026-03-01T08:30:00Z",
    customerId: "cust_kemi",
    customerName: "Kemi Adeleke",
    customerEmail: "kemi@example.ng",
    subtotalMinorUnits: 8500000, // ₦85,000.00
    taxMinorUnits: 637500, // ₦6,375.00
    shippingMinorUnits: 300000, // ₦3,000.00
    discountMinorUnits: 500000, // ₦5,000.00
    totalMinorUnits: 8937500, // ₦89,375.00
    refundMinorUnits: 0,
    tags: ["tech", "inverter"],
    items: [
      {
        id: "item_1",
        productId: "prod_inv_1kva",
        productName: "Smart Hybrid Inverter 1.5kVA",
        category: "Energy",
        quantity: 1,
        unitPriceMinorUnits: 8500000,
        totalPriceMinorUnits: 8500000,
        unitCostMinorUnits: 5800000, // ₦58,000.00 COGS
        totalCostMinorUnits: 5800000,
      },
    ],
  },
  {
    id: "ord_1002",
    status: "completed",
    currency: "NGN",
    createdAt: "2026-03-03T11:15:00Z",
    customerId: "cust_tunde",
    customerName: "Tunde Bakare",
    customerEmail: "tunde@example.ng",
    subtotalMinorUnits: 18000000, // ₦180,000.00
    taxMinorUnits: 1350000,
    shippingMinorUnits: 500000,
    discountMinorUnits: 0,
    totalMinorUnits: 19850000, // ₦198,500.00
    refundMinorUnits: 0,
    tags: ["energy"],
    items: [
      {
        id: "item_2",
        productId: "prod_bat_200ah",
        productName: "Lithium LiFePO4 Battery 200Ah",
        category: "Energy",
        quantity: 1,
        unitPriceMinorUnits: 18000000,
        totalPriceMinorUnits: 18000000,
        unitCostMinorUnits: 12500000, // ₦125,000.00 COGS
        totalCostMinorUnits: 12500000,
      },
    ],
  },
  {
    id: "ord_1003",
    status: "completed",
    currency: "NGN",
    createdAt: "2026-03-06T14:00:00Z",
    customerId: "cust_kemi", // Repeat purchase by Kemi!
    customerName: "Kemi Adeleke",
    customerEmail: "kemi@example.ng",
    subtotalMinorUnits: 2500000, // ₦25,000.00
    taxMinorUnits: 187500,
    shippingMinorUnits: 200000,
    discountMinorUnits: 0,
    totalMinorUnits: 2887500, // ₦28,875.00
    refundMinorUnits: 0,
    tags: ["accessories"],
    items: [
      {
        id: "item_3",
        productId: "prod_surge_prot",
        productName: "Heavy Duty Surge Protector",
        category: "Accessories",
        quantity: 1,
        unitPriceMinorUnits: 2500000,
        totalPriceMinorUnits: 2500000,
        unitCostMinorUnits: 1400000,
        totalCostMinorUnits: 1400000,
      },
    ],
  },
  {
    id: "ord_1004",
    status: "partially_refunded",
    currency: "NGN",
    createdAt: "2026-03-09T16:20:00Z",
    customerId: "cust_chidi",
    customerName: "Chidi Nnamdi",
    customerEmail: "chidi@example.ng",
    subtotalMinorUnits: 6000000, // ₦60,000.00
    taxMinorUnits: 450000,
    shippingMinorUnits: 300000,
    discountMinorUnits: 0,
    totalMinorUnits: 6750000, // ₦67,500.00
    refundMinorUnits: 2000000, // ₦20,000.00 refunded
    tags: ["lighting"],
    items: [
      {
        id: "item_4",
        productId: "prod_solar_flood",
        productName: "Solar LED Floodlight 200W",
        category: "Lighting",
        quantity: 2,
        unitPriceMinorUnits: 3000000,
        totalPriceMinorUnits: 6000000,
        unitCostMinorUnits: 1800000,
        totalCostMinorUnits: 3600000,
      },
    ],
  },
  {
    id: "ord_1005",
    status: "cancelled",
    currency: "NGN",
    createdAt: "2026-03-12T09:00:00Z",
    customerId: "cust_amina",
    customerName: "Amina Yusuf",
    customerEmail: "amina@example.ng",
    subtotalMinorUnits: 8500000,
    taxMinorUnits: 637500,
    shippingMinorUnits: 300000,
    discountMinorUnits: 0,
    totalMinorUnits: 9437500,
    refundMinorUnits: 0,
    tags: [],
    items: [
      {
        id: "item_5",
        productId: "prod_inv_1kva",
        productName: "Smart Hybrid Inverter 1.5kVA",
        category: "Energy",
        quantity: 1,
        unitPriceMinorUnits: 8500000,
        totalPriceMinorUnits: 8500000,
      },
    ],
  },
];

// Execute analysis
const report = charlie.analyze({
  businessId: "solarpower_lagos",
  currency: "NGN",
  orders,
  paretoThreshold: 80,
});

// Output formatted executive summary
console.log("📊 1. SALES PERFORMANCE SUMMARY:");
console.log(`   - Net Recognized Sales:   ${report.sales.netRevenueFormatted}`);
console.log(`   - Gross Merchandise Value: ${report.sales.grossSalesFormatted}`);
console.log(`   - Total Completed Orders:  ${report.sales.totalCompletedOrders}`);
console.log(`   - Average Order Value:     ${report.sales.averageOrderValueFormatted}`);
console.log(`   - Total Discounts Given:   ${charlie.money.format(report.sales.totalDiscountsMinorUnits, "NGN")}`);
console.log(`   - Total Refunds Offset:    ${charlie.money.format(report.sales.totalRefundsMinorUnits, "NGN")}`);
console.log("");

console.log("🎯 2. PARETO 80/20 CONCENTRATION (PRODUCTS):");
console.log(`   - Total Contributing Products: ${report.pareto.products.totalContributors}`);
console.log(`   - Vital Contributors Count:    ${report.pareto.products.vitalContributorsCount} (${report.pareto.products.vitalContributorsPercentage}% of catalogue)`);
console.log(`   - Gini Inequality Index:       ${report.pareto.products.giniCoefficient}`);
console.log(`   - Herfindahl-Hirschman (HHI):  ${report.pareto.products.herfindahlHirschmanIndex}`);
report.pareto.products.contributors.forEach((c: ParetoContributor) => {
  const badge = c.isVitalFew ? "⭐️ [VITAL 80%]" : "   [LONG TAIL]";
  console.log(`     ${badge} #${c.rank} ${c.name.padEnd(32)} -> ${c.revenueFormatted} (${c.contributionPercentage}% | Cumul: ${c.cumulativePercentage}%)`);
});
console.log("");

console.log("👥 3. CUSTOMER RETENTION & RFM SEGMENTATION:");
console.log(`   - Unique Customers:         ${report.customers.uniqueCustomersCount}`);
console.log(`   - Repeat Customers:         ${report.customers.repeatCustomersCount}`);
console.log(`   - Repeat Purchase Rate:     ${report.customers.repeatPurchaseRatePercentage}%`);
console.log(`   - Average Spend per Customer:${report.customers.averageRevenuePerCustomerFormatted}`);
console.log("   - Segments Breakdown:");
report.customers.rfmSegments.forEach((s: RfmCustomerScore) => {
  console.log(`     * ${s.customerName?.padEnd(16)}: Segment: "${s.segment}" (RFM Score: ${s.rfmScore}, Frequency: ${s.frequency} order(s))`);
});
console.log("");

console.log("📦 4. PRODUCT PROFITABILITY & MARGINS:");
console.log(`   - Overall Gross Profit:     ${report.products.totalGrossProfitFormatted}`);
console.log(`   - Overall Gross Margin:     ${report.products.overallGrossMarginPercentage}%`);
console.log(`   - Tracked Cost Products:    ${report.products.trackedProductsWithCostCount}`);
console.log(`   - Missing Cost Products:    ${report.products.missingCostProductCount}`);
console.log("");

console.log("🛡️ 5. DATA QUALITY AUDIT:");
console.log(`   - Data Quality Score:       ${report.dataQuality.scorePercentage}%`);
console.log(`   - Snapshot SHA-256 ID:      ${report.snapshotId}`);
console.log(`   - Schema Version:           ${report.schemaVersion}`);
console.log("\n✅ Deterministic Analytics Execution Complete!");
