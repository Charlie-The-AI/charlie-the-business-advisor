# Customer Retention & RFM Segmentation

Customer retention and lifetime value are the foundation of sustainable business growth. Charlie provides automated **Recency, Frequency, Monetary (RFM) Segmentation** and repeat purchase analytics.

Package: `@charlie-the-ai/analytics-core`

---

## 1. What Is RFM?

RFM is a proven behavioral customer segmentation model:

1. **Recency (R)**: Days elapsed since the customer's most recent completed purchase. Lower days = higher score.
2. **Frequency (F)**: Total number of completed orders placed by the customer. Higher orders = higher score.
3. **Monetary (M)**: Total net currency value spent by the customer. Higher spend = higher score.

Each dimension is scored from 1 (lowest) to 5 (highest), producing an RFM composite score (e.g. `5-5-5`).

---

## 2. Customer Cohorts Defined

| Segment Name | Typical RFM Score | Behavior & Recommended Action |
|---|---|---|
| **Champions** | `5-5-5`, `5-5-4`, `5-4-5` | Bought recently, buys frequently, spends the most. Reward with VIP perks, early access, and referral incentives. |
| **Loyal Customers** | `4-4-4`, `3-4-4`, `4-3-4` | Responsive to promotions, consistent buyers. Upsell premium products and cross-sell related categories. |
| **Potential Loyalists** | `5-2-2`, `4-2-3`, `5-1-2` | Recent purchasers who bought once or twice. Offer second-purchase discount or loyalty onboarding. |
| **At Risk** | `2-4-4`, `2-5-5`, `1-4-4` | Spent heavily in the past but haven't returned recently. Send re-engagement win-back campaigns and personalized incentives. |
| **Needs Attention** | `3-3-3`, `3-2-2` | Average recency and spend. Share new arrivals and seasonal offers. |
| **Hibernating** | `1-1-1`, `1-2-1` | Last purchase was long ago, low spend. Reactivate with deep discounts or clean from primary mailing lists. |

---

## 3. Programmatic Usage

```typescript
import { Charlie } from "charlie-the-business-advisor";

const charlie = new Charlie({ defaultCurrency: "NGN" });

const customerAnalytics = charlie.customers(orders, customers, "NGN");

console.log(`Unique Customers:     ${customerAnalytics.uniqueCustomersCount}`);
console.log(`Repeat Customers:     ${customerAnalytics.repeatCustomersCount}`);
console.log(`Repeat Purchase Rate: ${customerAnalytics.repeatPurchaseRatePercentage}%`);

// Inspect individual customer RFM scores:
customerAnalytics.rfmSegments.forEach((record) => {
  console.log(`${record.customerName}: ${record.segment} (RFM: ${record.rfmScore})`);
});
```
