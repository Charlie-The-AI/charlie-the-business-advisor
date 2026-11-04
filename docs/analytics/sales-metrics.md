# Sales Metrics & Deterministic Financial Calculations

The Sales Analytics module computes core e-commerce and retail revenue metrics using integer minor units and deterministic arithmetic.

Package: `@charlie-the-ai/analytics-core`

---

## 1. Metrics Defined

### Gross Sales vs Net Revenue

$$\text{Gross Sales} = \sum_{\text{completed orders}} \text{subtotalMinor}$$

$$\text{Net Revenue} = \sum_{\text{completed orders}} \left(\text{totalMinor} - \text{refundedMinor}\right)$$

- **Gross Sales** reflects total product merchandise value sold before deductions.
- **Net Revenue** represents true recognized top-line revenue after factoring in discounts, shipping, taxes, and refunds.

### Average Order Value (AOV)

$$\text{AOV} = \frac{\text{Net Revenue}}{\text{Completed Orders Count}}$$

---

## 2. Programmatic Usage

```typescript
import { Charlie, calculateSalesSummary } from "charlie-the-business-advisor";

const charlie = new Charlie({ defaultCurrency: "NGN" });

// Calculate via Charlie client:
const sales = charlie.sales(orders, "NGN");

console.log(sales.netRevenueFormatted);            // "₦250,000.00"
console.log(sales.grossSalesFormatted);           // "₦260,000.00"
console.log(sales.totalCompletedOrders);          // 12
console.log(sales.averageOrderValueFormatted);    // "₦20,833.33"
console.log(sales.totalDiscountsFormatted);       // "₦10,000.00"
console.log(sales.totalRefundsFormatted);         // "₦0.00"
```

---

## 3. Periodic Breakdowns

`calculateSalesSummary` automatically partitions orders into daily/weekly/monthly breakdowns (`sales.periodicBreakdown`), enabling trend detection and moving average calculations.
