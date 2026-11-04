# Node.js & Express Integration

Learn how to integrate Charlie into a Node.js backend using Express or Fastify.

---

## 1. Express REST API Example

```typescript
import express from "express";
import { Charlie, createOrderAdapter } from "charlie-the-business-advisor";

const app = express();
app.use(express.json());

const charlie = new Charlie({ defaultCurrency: "USD" });

// 1. Calculate Analytics
app.post("/api/analytics", async (req, res) => {
  try {
    const { orders, customers, currency } = req.body;
    const snapshot = charlie.analyze({ orders, customers, currency });
    res.json({ success: true, snapshot });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 2. Generate Grounded AI Recommendations
app.post("/api/advise", async (req, res) => {
  try {
    const { orders, objective } = req.body;
    const advice = await charlie.advise({ orders, objective });
    res.json({ success: true, ...advice });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// 3. Ask Conversational Business Questions
app.post("/api/chat", async (req, res) => {
  try {
    const { question, orders, history } = req.body;
    const chatResult = await charlie.chat({ question, orders, history });
    res.json({ success: true, ...chatResult });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Charlie Analytics API running on http://localhost:3000");
});
```
