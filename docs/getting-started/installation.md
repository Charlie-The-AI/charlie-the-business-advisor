# Installation Guide

You can install Charlie either as a single unified package or as individual, modular subpackages.

---

## 1. Unified Package (Recommended)

The easiest way to get started is with the main package:

```bash
# npm
npm install charlie-the-business-advisor

# pnpm
pnpm add charlie-the-business-advisor

# yarn
yarn add charlie-the-business-advisor
```

This single package includes:
- Data contract schemas (`CharlieOrder`, `CharlieCustomer`, etc.)
- Deterministic Analytics Engine (Sales, Pareto, RFM, Margins, Snapshots)
- Database Adapters (Declarative mappings, error isolation)
- Multi-Provider AI SDK (OpenAI, Gemini, Claude, Mock)
- Developer CLI (`npx charlie-the-business-advisor`)

---

## 2. Modular Subpackages

If you only need specific components (e.g. only analytics calculations without AI, or only React components), you can install the individual scoped packages:

| Package | Purpose | Installation |
|---|---|---|
| `@charlie-the-ai/advisor-types` | Zod schemas, TypeScript types, and validation | `npm install @charlie-the-ai/advisor-types` |
| `@charlie-the-ai/analytics-core` | Deterministic mathematical calculation engine | `npm install @charlie-the-ai/analytics-core` |
| `@charlie-the-ai/analytics-adapters` | Declarative field mappers and transform utilities | `npm install @charlie-the-ai/analytics-adapters` |
| `@charlie-the-ai/advisor-ai` | Multi-provider AI SDK and grounding verifier | `npm install @charlie-the-ai/advisor-ai` |
| `@charlie-the-ai/advisor-react` | React components, charts, and hooks | `npm install @charlie-the-ai/advisor-react` |

---

## 3. Environment Variables Setup

Charlie runs completely offline by default with **zero API keys**.

If you wish to enable external AI model providers (OpenAI, Google Gemini, or Anthropic Claude), add the corresponding keys to your `.env` file:

```env
# Selected AI Provider: "openai" | "gemini" | "anthropic" | "mock"
# Default: auto-detects from available keys, falls back to "mock"
CHARLIE_AI_PROVIDER=mock

# OpenAI (gpt-4o-mini)
OPENAI_API_KEY=sk-...

# Google Gemini (gemini-2.0-flash)
GEMINI_API_KEY=AIza...

# Anthropic Claude (claude-3-5-sonnet)
ANTHROPIC_API_KEY=sk-ant-...

# Default Currency ISO code (Default: NGN)
CHARLIE_DEFAULT_CURRENCY=USD
```

---

## 4. Verifying Installation

Run the Charlie diagnostic command:

```bash
npx charlie-the-business-advisor doctor
```

Output:
```text
  🎩 Charlie the Business Advisor (v0.1.1)
  Your AI-Powered Business Growth Companion — 100% Free & Open-Source

🩺 Running Charlie Environment Diagnostic...
  ✓ Node.js version:      v22.x
  ✓ Charlie version:      v0.1.1
  • Configured Provider:  (auto-detect)
  ⚡ Zero API keys configured: Running in 100% offline Mock mode.
  ✓ Analytics Engine:     Deterministic engine operational (Snapshot SHA-256 ok).

✅ Diagnostic Complete. Charlie is ready to advise!
```
