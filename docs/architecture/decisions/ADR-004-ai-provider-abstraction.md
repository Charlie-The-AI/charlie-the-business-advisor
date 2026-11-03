# ADR-004: Provider-Agnostic AI Advisory and Evidence Grounding

## Status
Accepted

## Context
Charlie's AI advisor synthesizes structured strategic business recommendations from verified analytics snapshots. However:
1. LLMs are susceptible to hallucinations, fabricating percentages or revenue values.
2. Reliance on a single LLM vendor creates vendor lock-in risks.
3. Natural language chat must not expose SQL databases or raw internal data structures.

## Decision
1. **Provider Abstraction**:
   An `AiProviderInterface` contract defining:
   - `generateStructuredRecommendation(context: RecommendationPromptContext): Promise<StructuredAiRecommendation>`
   - `streamChatResponse(context: ChatPromptContext, tools: AnalyticsToolDefinitions): AsyncIterable<ChatChunk>`
   Initial implementation uses OpenAI (`gpt-4o` / `gpt-4o-mini`), with immediate extensibility for Google Gemini and Anthropic Claude.
2. **Deterministic Evidence Grounding**:
   Before any recommendation is saved or returned:
   - The numerical claims in the output are extracted and verified against the input snapshot.
   - If an AI output asserts "Revenue declined by 42%" when the verified rate was 15.3%, the recommendation fails verification and is rejected.
3. **Controlled Tool Calling for AI Business Chat**:
   Instead of giving LLMs arbitrary SQL execution permissions, the chat agent interacts strictly through a catalog of parameterized analytical tools (e.g. `queryProductRanking`, `comparePeriods`, `getCustomerCohortStats`).
4. **Prompt Injection Defense**:
   Untrusted external metadata (customer names, product descriptions) is sanitized and placed in quarantined data blocks with system instructions enforcing strict containment.

## Consequences
- Guaranteed factual consistency and credibility.
- Safe AI interaction without risking database compromise.
