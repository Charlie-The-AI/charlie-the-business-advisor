# Frequently Asked Questions (FAQ)

### 1. Is Charlie really 100% free?
**Yes.** Charlie is released under the permissive MIT Open Source License. There are no paid tiers, no feature paywalls, no per-seat subscription fees, and no required license keys.

---

### 2. Do I have to pay for an OpenAI, Gemini, or Claude key?
**No.** Charlie includes a built-in **Deterministic Mock AI Provider** that runs 100% offline with zero API keys and zero cost. It analyzes your snapshot's concentration, margins, and repeat rates to produce grounded advice.
If you choose to use external frontier models (OpenAI `gpt-4o-mini`, Gemini `2.0-flash`, Claude `3.5-sonnet`), you provide your own API key directly from that provider.

---

### 3. Can Charlie modify, mutate, or delete my database?
**No.** Charlie is strictly a read-only analytics calculation engine. It takes in arrays of data, computes mathematical aggregations, and returns structured objects. It has no write access to your database.

---

### 4. How is Charlie different from Tableau, Metabase, or PowerBI?
- **Tableau/Metabase/PowerBI** are heavyweight standalone BI servers that connect to SQL warehouses, require custom query setups, and require separate dashboard logins.
- **Charlie** is an **embeddable software library**. It lives inside your application code, adapts to your data in memory, gives you reusable React components, and provides automated, grounded AI interpretation that non-technical users can act upon immediately.

---

### 5. Can Charlie run in offline or air-gapped environments?
**Yes.** All core analytics (`@charlie-the-ai/analytics-core`), adapters (`@charlie-the-ai/analytics-adapters`), React charts (`@charlie-the-ai/advisor-react`), and the Mock AI provider run without any external internet connection.
