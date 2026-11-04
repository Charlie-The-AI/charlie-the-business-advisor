# Core Concepts & Philosophy

Charlie the Business Advisor is built upon a fundamental architectural commitment:

> **Analytics calculates. AI interprets. Evidence validates.**

---

## 1. Why AI Must Never Calculate Financial Numbers

Large Language Models (LLMs) are probabilistic pattern matchers. They are fantastic at summarizing information, drafting emails, and proposing creative strategic ideas. However, they are mathematically unreliable when performing floating-point calculations, percentage distributions, and currency subtractions.

In business intelligence, **an error of 1% is unacceptable**.

Charlie enforces a strict boundary:
1. **Deterministic Analytics Engine (`@charlie-the-ai/analytics-core`)**:
   Calculates 100% of the numbers using deterministic integer arithmetic. Gross sales, net recognized revenue, Pareto 80/20 distributions, Gini coefficients, RFM customer scores, and profit margins are computed via reproducible TypeScript algorithms.
2. **Multi-Provider AI SDK (`@charlie-the-ai/advisor-ai`)**:
   Receives the computed financial snapshot. The AI's job is strictly to *interpret* the business significance of those numbers, spot qualitative patterns, and suggest practical actions.
3. **Grounding Verification Engine**:
   Every claim, metric citation, and quantitative assertion produced by the AI is cross-checked against the mathematical snapshot before it is delivered to the developer. If the AI hallucinates a number that does not match the snapshot, Charlie flags it immediately as `flagged` with a diagnostic warning.

---

## 2. Integer Minor Currency Units

To eliminate floating-point rounding errors (e.g. `0.1 + 0.2 === 0.30000000000000004`), Charlie stores all monetary amounts as **integers in the currency's minor units**:

| Currency | Unit Name | Major Unit ($ / ₦ / €) | Minor Unit Integer in Charlie |
|---|---|---|---|
| USD | Cents | `$10.50` | `1050` |
| NGN | Kobo | `₦2,500.00` | `250000` |
| EUR | Cents | `€99.99` | `9999` |
| JPY | Yen (zero-decimal) | `¥5,000` | `5000` |

### Formatting
Charlie includes built-in formatting utilities:

```typescript
import { Money } from "charlie-the-business-advisor";

Money.format(250000, "NGN"); // "₦2,500.00"
Money.format(1050, "USD");   // "$10.50"
```

---

## 3. Zero Mandatory Infrastructure

Most business intelligence tools require:
- A separate hosted SaaS account.
- A dedicated PostgreSQL warehouse.
- Redis queues for background processing.
- Monthly per-seat subscription billing.

Charlie has **none of these requirements**.
- Runs directly inside your existing application process (Node.js, Next.js, NestJS, Express, or browser).
- Adapts to your existing database schema via declarative adapters.
- Runs 100% offline out-of-the-box using the built-in Deterministic Mock AI provider.
- When you are ready for external AI, bring your own API key (OpenAI, Gemini, or Claude).

---

## 4. Privacy & PII Security

Charlie protects your customers' Personally Identifiable Information (PII):
- By default, customer names, emails, and phone numbers are **never sent to external AI providers**.
- Customer cohorts are anonymized into neutral labels (`Customer Cohort #1`, `Customer Cohort #2`).
- String fields are sanitized against prompt injection attempts before building LLM context windows.

---

## Next Steps

- [Installation Guide](./installation.md)
- [Canonical CharlieOrder Dataset](../datasets/charlie-order.md)
- [Database Adapters](../adapters/overview.md)
