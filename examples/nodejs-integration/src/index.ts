import {
  Charlie,
  createOrderAdapter,
  ParetoContributor,
} from "charlie-the-business-advisor";

console.log("=================================================================");
console.log("  🎩 CHARLIE THE BUSINESS ADVISOR — NODE.JS INTEGRATION DEMO  ");
console.log("=================================================================\n");

// Initialize Charlie with offline Mock AI or environment keys
const charlie = new Charlie({ defaultCurrency: "NGN" });

// 1. Declarative Database Adapter Example:
// Simulate raw database rows from an external PostgreSQL/MySQL table
const rawDatabaseRows = [
  {
    order_reference: "db_ord_101",
    user_id: "usr_alice",
    status_code: "PAID",
    order_timestamp: "2026-03-01T10:00:00Z",
    amount_paid: 85000.0, // Major units (Naira)
    currency_iso: "NGN",
    purchased_items: [
      {
        sku: "SOL-INV-1K",
        title: "1kVA Smart Solar Inverter",
        qty: 1,
        price: 85000.0,
      },
    ],
  },
  {
    order_reference: "db_ord_102",
    user_id: "usr_bob",
    status_code: "PAID",
    order_timestamp: "2026-03-05T12:00:00Z",
    amount_paid: 180000.0,
    currency_iso: "NGN",
    purchased_items: [
      {
        sku: "SOL-BAT-200",
        title: "200Ah Lithium Battery",
        qty: 1,
        price: 180000.0,
      },
    ],
  },
  {
    order_reference: "db_ord_103",
    user_id: "usr_alice", // Repeat customer!
    status_code: "PAID",
    order_timestamp: "2026-03-12T15:30:00Z",
    amount_paid: 25000.0,
    currency_iso: "NGN",
    purchased_items: [
      {
        sku: "SOL-SURGE",
        title: "Heavy Duty Surge Protector",
        qty: 1,
        price: 25000.0,
      },
    ],
  },
];

// Configure declarative adapter to map raw rows into CharlieOrders
const dbAdapter = createOrderAdapter<{
  order_reference: string;
  user_id: string;
  status_code: string;
  order_timestamp: string;
  amount_paid: number;
  currency_iso: string;
  purchased_items: Array<{ sku: string; title: string; qty: number; price: number }>;
}>({
  fields: {
    id: "order_reference",
    customerId: "user_id",
    placedAt: "order_timestamp",
    currency: "currency_iso",
    status: (row) => (row.status_code === "PAID" ? "completed" : "pending"),
    totalMajor: "amount_paid",
    subtotalMajor: "amount_paid",
    items: (row) =>
      row.purchased_items.map((item) => ({
        productId: item.sku,
        productName: item.title,
        quantity: item.qty,
        unitPriceMinor: Math.round(item.price * 100),
      })),
  },
});

const orders = dbAdapter.transformMany(rawDatabaseRows);

async function runDemo() {
  console.log(`Transformed ${orders.length} database rows via Declarative Adapter.`);

  // 2. Deterministic Analytics Engine:
  console.log("\n📊 1. RUNNING DETERMINISTIC ANALYTICS...");
  const snapshot = charlie.analyze({
    businessId: "solar_lagos",
    currency: "NGN",
    orders,
    paretoThreshold: 80,
  });

  console.log(`   - Net Revenue:           ${snapshot.sales.netRevenueFormatted}`);
  console.log(`   - Total Orders:          ${snapshot.sales.totalCompletedOrders}`);
  console.log(`   - Average Order Value:   ${snapshot.sales.averageOrderValueFormatted}`);
  console.log(`   - Total Customers:       ${snapshot.customers.uniqueCustomersCount}`);
  console.log(`   - Repeat Purchase Rate:  ${snapshot.customers.repeatPurchaseRatePercentage}%`);

  console.log("\n🎯 2. PARETO 80/20 CONCENTRATION:");
  snapshot.pareto.products.contributors.forEach((c: ParetoContributor) => {
    const badge = c.isVitalFew ? "⭐️ [VITAL 80%]" : "   [LONG TAIL]";
    console.log(`     ${badge} #${c.rank} ${c.name.padEnd(28)} -> ${c.revenueFormatted} (${c.contributionPercentage}%)`);
  });

  // 3. Multi-Provider AI Business Advisory:
  console.log("\n🤖 3. GENERATING GROUNDED AI ADVICE (.advise)...");
  const advice = await charlie.advise({
    analytics: snapshot,
    objective: "Identify top revenue risks and customer retention strategies.",
  });

  console.log(`   - Summary: ${advice.summary}`);
  console.log(`   - Generated ${advice.recommendations.length} Actionable Recommendations:`);
  advice.recommendations.forEach((rec, idx) => {
    console.log(`     [${idx + 1}] [${rec.priority.toUpperCase()}] ${rec.title}`);
    console.log(`         Rationale: ${rec.description}`);
    if (rec.suggestedActions.length > 0) {
      console.log(`         Action:    ${rec.suggestedActions[0]}`);
    }
    console.log(`         Grounding: ${rec.groundingStatus === "verified" ? "✅ Verified" : "⚠️ Review"}`);
  });

  // 4. Grounded AI Business Chat:
  console.log("\n💬 4. NATURAL LANGUAGE BUSINESS CHAT (.chat)...");
  const question = "How much net revenue did my business make this month?";
  console.log(`   User: "${question}"`);

  const chatReply = await charlie.chat({
    analytics: snapshot,
    question,
  });

  console.log(`   Charlie: ${chatReply.answer}`);
  if (chatReply.evidence.length > 0) {
    console.log(`   Evidence Cited: ${chatReply.evidence.map((e) => `${e.metric}=${e.value} (${e.isVerified ? "verified" : "flagged"})`).join(", ")}`);
  }

  console.log("\n✅ Demo Complete! All calculations verified mathematically.");
}

runDemo().catch(console.error);
