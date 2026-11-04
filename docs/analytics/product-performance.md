# Product Performance & Profit Margin Analysis

Understanding which products drive your profit—versus products that merely generate volume at razor-thin margins—is essential for inventory and pricing strategy.

Package: `@charlie-the-ai/analytics-core`

---

## 1. Metrics Calculated

### Gross Profit & Margin

$$\text{Gross Profit} = \text{Revenue} - \text{Cost of Goods Sold (COGS)}$$

$$\text{Gross Margin \%} = \frac{\text{Gross Profit}}{\text{Revenue}} \times 100\%$$

### Missing Cost Data Detection

If some order items lack unit cost data (`unitCostMinor`), Charlie automatically:
1. Calculates margin across all items with confirmed cost data.
2. Reports `missingCostProductCount` and flags catalog data quality warnings in the snapshot so profitability is not miscalculated.

---

## 2. Programmatic Usage

```typescript
import { Charlie } from "charlie-the-business-advisor";

const charlie = new Charlie({ defaultCurrency: "NGN" });

const products = charlie.products(orders, "NGN");

console.log(`Total Products Sold:     ${products.totalProductsSold}`);
console.log(`Overall Gross Profit:    ${products.totalGrossProfitFormatted}`);
console.log(`Overall Gross Margin:    ${products.overallGrossMarginPercentage}%`);
console.log(`Tracked Cost Items:      ${products.trackedProductsWithCostCount}`);
console.log(`Missing Cost Items:      ${products.missingCostProductCount}`);

// Best sellers by revenue:
products.bestSellersByRevenue.forEach((p, idx) => {
  console.log(`${idx + 1}. ${p.productName} -> ${p.revenueFormatted} (${p.unitsSold} units, ${p.revenuePercentage}%)`);
});
```
