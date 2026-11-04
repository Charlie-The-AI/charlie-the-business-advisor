# Multi-Provider AI Architecture

Charlie provides a vendor-neutral AI abstraction layer. You bring your own API key, and Charlie handles prompt generation, context assembly, JSON schema enforcement, and mathematical grounding verification.

Package: `@charlie-the-ai/advisor-ai`

---

## Supported AI Providers

| Provider | Provider ID | Default Model | Configuration Environment Variable | Best For |
|---|---|---|---|---|
| **Deterministic Mock** | `mock` | `mock-advisor-v1` | *(None needed — 100% offline)* | Local dev, CI pipelines, testing, zero-cost operation |
| **OpenAI** | `openai` | `gpt-4o-mini` | `OPENAI_API_KEY` | Fast, reliable JSON outputs, cost efficiency |
| **Google Gemini** | `gemini` | `gemini-2.0-flash` | `GEMINI_API_KEY` | Large context windows, rapid responses |
| **Anthropic Claude** | `anthropic` | `claude-3-5-sonnet-20241022` | `ANTHROPIC_API_KEY` | Deep strategic analysis and reasoning |

---

## 1. Zero-Config Offline Mode (Default)

If no environment variables or API keys are provided, Charlie automatically selects the `mock` provider:

```typescript
import { Charlie } from "charlie-the-business-advisor";

// Zero config — runs 100% offline with zero network requests!
const charlie = new Charlie();
const advice = await charlie.advise({ orders });
```

The mock provider evaluates your actual numbers (Gini coefficient, repeat purchase rate, AOV) and outputs deterministic, mathematically grounded recommendations.

---

## 2. Using OpenAI, Gemini, or Claude

### Via Environment Variables

Set the key in your `.env` file:

```env
OPENAI_API_KEY=sk-proj-...
# or
GEMINI_API_KEY=AIzaSy...
# or
ANTHROPIC_API_KEY=sk-ant-...
```

Charlie automatically detects whichever key is present.

### Via Programmatic Configuration

```typescript
import { Charlie } from "charlie-the-business-advisor";

const charlie = new Charlie({
  ai: {
    provider: "gemini",
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-2.0-flash",
  },
});
```

---

## 3. Custom AI Providers

You can implement your own custom AI provider (e.g. self-hosted Ollama, vLLM, or Mistral) by implementing the `CharlieAiProvider` interface:

```typescript
import { CharlieAiProvider, RecommendationInput, ChatInput } from "charlie-the-business-advisor";

export class MyCustomLlamaProvider implements CharlieAiProvider {
  public readonly id = "custom-llama";

  async generateRecommendations(input: RecommendationInput) {
    // Call custom LLM endpoint
    return { summary: "...", recommendations: [], limitations: [] };
  }

  async chat(input: ChatInput) {
    // Call custom LLM chat
    return { answer: "...", evidence: [], limitations: [] };
  }
}
```
