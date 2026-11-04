# Conversational Business AI Chat

Charlie provides a conversational assistant that answers natural language business questions grounded in your calculated analytics snapshot.

Package: `@charlie-the-ai/advisor-ai`

---

## 1. Programmatic Usage

Call `charlie.chat()` with a question and either raw orders or an existing `AnalyticsSnapshot`:

```typescript
import { Charlie } from "charlie-the-business-advisor";

const charlie = new Charlie({ defaultCurrency: "USD" });

const reply = await charlie.chat({
  question: "How did my revenue compare to my average order value?",
  orders: sampleOrders,
});

console.log(reply.answer);
// "Your business generated $2,500.00 in net revenue with an average order value of $125.00 across 20 completed orders."

console.log(reply.evidence);
// [
//   { metric: "netRevenue", value: "$2,500.00", isVerified: true },
//   { metric: "averageOrderValue", value: "$125.00", isVerified: true },
//   { metric: "totalOrders", value: 20, isVerified: true }
// ]
```

---

## 2. Multi-Turn Conversation History

Pass previous conversation turns using the `history` parameter:

```typescript
const reply = await charlie.chat({
  question: "What actions should I take to improve that?",
  orders: sampleOrders,
  history: [
    { role: "user", content: "What was my repeat purchase rate?" },
    { role: "assistant", content: "Your repeat purchase rate was 18% across 50 active customers." },
  ],
});
```

---

## 3. Privacy & PII Protection

By default:
- `includeCustomerDetails` is `false`.
- Real customer names and personal emails are never included in the chat context prompt.
- To enable customer name lookups (e.g. for internal admin tools), explicitly pass `includeCustomerDetails: true`.
