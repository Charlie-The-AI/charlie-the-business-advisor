# 5-Minute Quickstart

Get started with **Charlie the Business Advisor** in less than 5 minutes.

Charlie is a **100% free, open-source business intelligence and AI advisory toolkit**. It calculates deterministic financial metrics (revenue, Pareto 80/20, customer RFM, profit margins) and optionally uses AI to interpret those numbers and recommend practical business actions.

> **Core Principle**: *Analytics calculates. AI interprets. Evidence validates.*

---

## 1. Installation

Install the main umbrella package:

```bash
npm install charlie-the-business-advisor
# or
pnpm add charlie-the-business-advisor
# or
yarn add charlie-the-business-advisor
```

---

## 2. Initialize Charlie (Optional)

Run the developer CLI to scaffold a starter configuration file and `.env.example`:

```bash
npx charlie-the-business-advisor init
```

This creates:
- `charlie.config.ts` — Your Charlie instance configuration.
- `.env.example` — Environment variable template for optional AI API keys.

---

## 3. Minimal Complete Code Example

Create a file named `index.ts` (or `index.js`) with the following copy-paste ready code:

```typescript
import { Charlie, CharlieOrder } from "charlie-the-business-advisor";

// 1. Initialize Charlie (defaults to offline Mock AI if no API keys are provided)
const charlie = new Charlie({ defaultCurrency: "USD" });

// 2. Define sample business orders (using integer minor units: cents/kobo)
const orders: CharlieOrder[] = [
  {
    id: "ord_101",
    customerId: "cust_alice",
    status: "completed",
    currency: "USD",
    placedAt: "2026-03-01T10:00:00Z",
    subtotalMinor: 5000, // $50.00
    discountMinor: 0,
    taxMinor: 0,
    shippingMinor: 0,
    totalMinor: 5000,
    refundedMinor: 0,
    tags: ["electronics"],
    items: [
      {
        productId: "prod_headphones",
        productName: "Wireless Noise-Canceling Headphones",
        quantity: 1,
        unitPriceMinor: 5000,
        discountMinor: 0,
      },
    ],
  },
  {
    id: "ord_102",
    customerId: "cust_bob",
    status: "completed",
    currency: "USD",
    placedAt: "2026-03-03T14:30:00Z",
    subtotalMinor: 15000, // $150.00
    discountMinor: 0,
    taxMinor: 0,
    shippingMinor: 0,
    totalMinor: 15000,
    refundedMinor: 0,
    tags: ["electronics"],
    items: [
      {
        productId: "prod_speaker",
        productName: "Bluetooth Conference Speaker",
        quantity: 1,
        unitPriceMinor: 15000,
        discountMinor: 0,
      },
    ],
  },
  {
    id: "ord_103",
    customerId: "cust_alice", // Repeat customer!
    status: "completed",
    currency: "USD",
    placedAt: "2026-03-08T18:00:00Z",
    subtotalMinor: 2500, // $25.00
    discountMinor: 0,
    taxMinor: 0,
    shippingMinor: 0,
    totalMinor: 2500,
    refundedMinor: 0,
    tags: ["accessories"],
    items: [
      {
        productId: "prod_cable",
        productName: "Braided USB-C Cable",
        quantity: 1,
        unitPriceMinor: 2500,
        discountMinor: 0,
      },
    ],
  },
];

async function run() {
  // 3. Run Deterministic Financial Analytics (100% offline, zero AI required)
  console.log("📊 Running Deterministic Financial Analytics...");
  const snapshot = charlie.analyze({ orders, currency: "USD" });

  console.log(`✓ Net Recognized Revenue: ${snapshot.sales.netRevenueFormatted}`);
  console.log(`✓ Completed Orders:       ${snapshot.sales.totalCompletedOrders}`);
  console.log(`✓ Average Order Value:    ${snapshot.sales.averageOrderValueFormatted}`);
  console.log(`✓ Unique Customers:       ${snapshot.customers.uniqueCustomersCount}`);
  console.log(`✓ Repeat Purchase Rate:   ${snapshot.customers.repeatPurchaseRatePercentage}%`);

  // 4. Generate Grounded AI Business Recommendations
  console.log("\n🤖 Generating Actionable Business Recommendations...");
  const advice = await charlie.advise({ analytics: snapshot });

  console.log(`Summary: ${advice.summary}`);
  advice.recommendations.forEach((rec, idx) => {
    console.log(`\n[${idx + 1}] ${rec.title} (${rec.priority.toUpperCase()})`);
    console.log(`    Rationale: ${rec.description}`);
    rec.suggestedActions.forEach((action) => console.log(`    → Action: ${action}`));
    console.log(`    Grounding Status: ${rec.groundingStatus} (Verified against snapshot)`);
  });

  // 5. Ask Questions in Natural Language
  console.log("\n💬 Asking Charlie a Business Question...");
  const reply = await charlie.chat({
    analytics: snapshot,
    question: "What is my top revenue driver?",
  });

  console.log(`Charlie: ${reply.answer}`);
}

run().catch(console.error);
```

---

## 4. Run the Script

Run the file using `ts-node`, `tsx`, or Node.js:

```bash
npx tsx index.ts
```

Output:
```text
📊 Running Deterministic Financial Analytics...
✓ Net Recognized Revenue: $225.00
✓ Completed Orders:       3
✓ Average Order Value:    $75.00
✓ Unique Customers:       2
✓ Repeat Purchase Rate:   50%

🤖 Generating Actionable Business Recommendations...
Summary: Performance analysis shows $225.00 net revenue across 3 completed orders.
...
```

---

## Next Steps

- [Core Concepts & Philosophy](./core-concepts.md)
- [Canonical Datasets](../datasets/charlie-order.md)
- [Database Adapters](../adapters/overview.md)
- [Connecting OpenAI, Gemini, or Claude](../ai/providers.md)
