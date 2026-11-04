# @charlie-the-ai/advisor-ai 🤖

> Multi-provider AI business advisory engine with mathematical grounding verification and hallucination defense.

[![npm version](https://img.shields.io/npm/v/@charlie-the-ai/advisor-ai.svg)](https://www.npmjs.com/package/@charlie-the-ai/advisor-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

---

## Overview

`@charlie-the-ai/advisor-ai` delivers grounded AI business intelligence for **Charlie the Business Advisor**.

It follows the fundamental principle:
> **"Analytics calculates. AI interprets. Evidence validates."**

Instead of asking an LLM to perform mathematical calculations or inspect raw database tables, Charlie feeds verified analytics snapshots into your chosen AI provider, then mathematically cross-checks every numeric claim before returning recommendations to your application.

---

## Supported Providers

| Provider | Class | Environment Variable | Default Model | Description |
|---|---|---|---|---|
| **OpenAI** | `OpenAIProvider` | `OPENAI_API_KEY` | `gpt-4o` | Structured JSON recommendations and conversational Q&A |
| **Google Gemini** | `GeminiProvider` | `GEMINI_API_KEY` | `gemini-2.5-flash` | Fast, cost-efficient snapshot interpretation |
| **Anthropic Claude** | `AnthropicProvider` | `ANTHROPIC_API_KEY` | `claude-3-5-sonnet-latest` | Nuanced, evidence-grounded executive summaries |
| **Offline Mock** | `MockProvider` | *(None required)* | `mock-v1` | 100% offline deterministic simulation for tests and local development |

---

## Installation

```bash
# npm
npm install @charlie-the-ai/advisor-ai @charlie-the-ai/advisor-types @charlie-the-ai/analytics-core

# pnpm
pnpm add @charlie-the-ai/advisor-ai @charlie-the-ai/advisor-types @charlie-the-ai/analytics-core

# yarn
yarn add @charlie-the-ai/advisor-ai @charlie-the-ai/advisor-types @charlie-the-ai/analytics-core
```

---

## Usage Examples

### 1. Initialize with an AI Provider

```typescript
import {
  createAdvisor,
  OpenAIProvider,
  GeminiProvider,
  AnthropicProvider,
  MockProvider,
} from "@charlie-the-ai/advisor-ai";

// Explicit provider configuration:
const advisor = createAdvisor({
  provider: new OpenAIProvider({
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o",
    timeoutMs: 15000,
  }),
});

// Or auto-resolve from process.env (CHARLIE_AI_PROVIDER, OPENAI_API_KEY, etc.):
const autoAdvisor = createAdvisor();
```

### 2. Generate Grounded Business Recommendations

```typescript
const result = await advisor.advise({
  analytics: snapshot, // Deterministic AnalyticsSnapshot from @charlie-the-ai/analytics-core
  objective: "Increase repeat customer retention and reduce churn",
});

console.log("Executive Summary:", result.summary);

for (const rec of result.recommendations) {
  console.log(`\n[${rec.priority.toUpperCase()}] ${rec.title}`);
  console.log(`Action: ${rec.action}`);
  console.log(`Estimated Impact: ${rec.estimatedImpact}`);
  console.log(`Grounded in metrics:`, rec.evidence);
}
```

### 3. Conversational Business Chat

```typescript
const reply = await advisor.chat({
  question: "Why did our average order value drop last week?",
  analytics: snapshot,
  history: [
    { role: "user", content: "What were total sales last month?" },
    { role: "assistant", content: "Net sales were $45,200 across 312 completed orders." },
  ],
});

console.log(reply.answer);
console.log("Citations:", reply.citations);
```

---

## Grounding Verification & Hallucination Defense

When an LLM generates a business recommendation citing a metric (such as *"$14,200 revenue"* or *"28% churn rate"*), `@charlie-the-ai/advisor-ai` validates that claim against the source snapshot:

1. **Extraction**: Identifies quantitative claims and numeric assertions in the LLM response.
2. **Cross-Check**: Compares cited numbers against the actual calculated `AnalyticsSnapshot`.
3. **Flagging**: If a cited number does not match within acceptable tolerances, the recommendation's `groundingScore` is penalized and flagged so developers can surface warnings or suppress unverified advice.

---

## Privacy by Default

- **No Raw Order Dumps**: Raw database rows are never transmitted to external LLM providers. Only aggregated, privacy-safe metrics (totals, counts, distributions) are passed in prompts.
- **Zero PII**: Customer names, emails, and street addresses are stripped by default unless explicitly opted in via `includeCustomerDetails: true`.

---

## Related Packages

- [`@charlie-the-ai/advisor-types`](https://www.npmjs.com/package/@charlie-the-ai/advisor-types): Schemas for recommendations and evidence metrics.
- [`@charlie-the-ai/analytics-core`](https://www.npmjs.com/package/@charlie-the-ai/analytics-core): Pure deterministic calculation engine producing the input snapshot.
- [`charlie-the-business-advisor`](https://www.npmjs.com/package/charlie-the-business-advisor): The unified umbrella SDK.

---

## License

MIT © 2026 Charlie the Business Advisor Contributors
