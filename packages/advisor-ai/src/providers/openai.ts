import {
  CharlieAiProvider,
  RecommendationInput,
  RecommendationResult,
  ChatInput,
  ChatResult,
  ProviderConfig,
} from "../types.js";
import { executeFetch, extractAndParseJson } from "./base.js";
import { buildAnalyticsContext } from "../context.js";
import { RECOMMENDATION_SYSTEM_PROMPT, CHAT_SYSTEM_PROMPT } from "../prompts.js";
import { verifyRecommendationGrounding, verifyChatGrounding } from "../grounding.js";

interface OpenAiChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    total_tokens?: number;
  };
}

export class OpenAiProvider implements CharlieAiProvider {
  public readonly id = "openai";
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchFn?: typeof fetch;

  constructor(config: Partial<ProviderConfig> & { apiKey: string }) {
    if (!config.apiKey) {
      throw new Error("OpenAiProvider requires an apiKey. Pass it via config or set OPENAI_API_KEY.");
    }
    this.apiKey = config.apiKey;
    this.model = config.model || "gpt-4o-mini";
    this.apiUrl = config.apiUrl || "https://api.openai.com/v1/chat/completions";
    this.timeoutMs = config.timeoutMs || 30000;
    this.fetchFn = config.fetchFn;
  }

  public async generateRecommendations(
    input: RecommendationInput
  ): Promise<RecommendationResult> {
    const context = buildAnalyticsContext(input);
    const userPrompt = JSON.stringify({
      objective: input.objective || "Identify actionable opportunities to increase revenue, retention, and order volume.",
      category: input.category || "all",
      analyticsContext: context,
    });

    const response = await executeFetch<OpenAiChatCompletionResponse>({
      url: this.apiUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: {
        model: this.model,
        messages: [
          { role: "system", content: RECOMMENDATION_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
      },
      timeoutMs: this.timeoutMs,
      fetchFn: this.fetchFn,
    });

    const rawContent = response.choices?.[0]?.message?.content || "{}";
    const parsed = extractAndParseJson<RecommendationResult>(rawContent);

    // Verify grounding against actual snapshot
    const verification = verifyRecommendationGrounding(parsed.recommendations || [], input.analytics);

    return {
      summary: parsed.summary || "Performance analysis complete.",
      recommendations: verification.verifiedRecommendations,
      limitations: [...(parsed.limitations || []), ...verification.groundingWarnings],
      metadata: {
        provider: "openai",
        model: this.model,
        tokensUsed: response.usage?.total_tokens,
      },
    };
  }

  public async chat(input: ChatInput): Promise<ChatResult> {
    const context = buildAnalyticsContext(input);
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: CHAT_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Here is the verified business analytics context: ${JSON.stringify(context)}`,
      },
    ];

    if (input.history && input.history.length > 0) {
      for (const h of input.history.slice(-6)) {
        messages.push({ role: h.role, content: h.content });
      }
    }

    messages.push({ role: "user", content: input.question });

    const response = await executeFetch<OpenAiChatCompletionResponse>({
      url: this.apiUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: {
        model: this.model,
        messages,
        response_format: { type: "json_object" },
        temperature: 0.2,
      },
      timeoutMs: this.timeoutMs,
      fetchFn: this.fetchFn,
    });

    const rawContent = response.choices?.[0]?.message?.content || "{}";
    const parsed = extractAndParseJson<ChatResult>(rawContent);

    const verified = verifyChatGrounding(parsed, input.analytics);
    return {
      ...verified,
      metadata: {
        provider: "openai",
        model: this.model,
        tokensUsed: response.usage?.total_tokens,
      },
    };
  }
}
