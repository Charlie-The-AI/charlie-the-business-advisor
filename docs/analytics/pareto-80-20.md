# Pareto 80/20 Analysis & Concentration Metrics

The Pareto Principle (the 80/20 rule) states that for many outcomes, roughly 80% of consequences come from 20% of causes. In business:
- **80% of revenue often comes from 20% of catalog products.**
- **80% of sales often come from 20% of high-value customers.**

Charlie provides deterministic calculation of Pareto distributions, the **Gini Inequality Coefficient**, and the **Herfindahl-Hirschman Index (HHI)**.

Package: `@charlie-the-ai/analytics-core`

---

## 1. Mathematical Formulas

### Vital Few Identification

Given contributors sorted by revenue in descending order $R_1 \ge R_2 \ge \dots \ge R_n$:
1. Calculate cumulative revenue percentage for each item:
   $$C_k = \frac{\sum_{i=1}^k R_i}{\sum_{i=1}^n R_i} \times 100\%$$
2. Contributors where $C_k \le 80\%$ (plus the boundary contributor) are tagged as **Vital Few** (`isVitalFew: true`).
3. The rest are classified as **Long Tail**.

### Gini Inequality Coefficient

$$G = \frac{\sum_{i=1}^n \sum_{j=1}^n |R_i - R_j|}{2n^2 \bar{R}}$$

- $G = 0$: Perfect equality (every product generates identical revenue).
- $G > 0.6$: High concentration risk (a few vital products dominate).

### Herfindahl-Hirschman Index (HHI)

$$\text{HHI} = \sum_{i=1}^n s_i^2$$
where $s_i$ is the percentage market share of contributor $i$.
- $\text{HHI} < 1500$: Competitive, diversified catalog.
- $\text{HHI} > 2500$: Highly concentrated catalog risk.

---

## 2. Programmatic Usage

```typescript
import { Charlie } from "charlie-the-business-advisor";

const charlie = new Charlie({ defaultCurrency: "NGN" });

// Calculate Pareto on products:
const pareto = charlie.pareto(orders, "product", "NGN", 80);

console.log(`Vital Contributors: ${pareto.vitalContributorsCount} of ${pareto.totalContributors}`);
console.log(`Gini Coefficient:   ${pareto.giniCoefficient}`);
console.log(`HHI:                ${pareto.herfindahlHirschmanIndex}`);

pareto.contributors.forEach((c) => {
  const badge = c.isVitalFew ? "⭐️ VITAL FEW" : "   LONG TAIL";
  console.log(`${badge} ${c.name} -> ${c.revenueFormatted} (${c.contributionPercentage}%)`);
});
```

---

## 3. Dimensions Supported

Charlie can calculate Pareto concentration across any dimension:
- `"product"` — Product revenue concentration.
- `"customer"` — Customer revenue concentration.
- `"category"` — Category revenue concentration.
