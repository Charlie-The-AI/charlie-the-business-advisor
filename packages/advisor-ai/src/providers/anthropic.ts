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

interface AnthropicMessagesResponse {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
  };
}

export class AnthropicProvider implements CharlieAiProvider {
  public readonly id = "anthropic";
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchFn?: typeof fetch;

  constructor(config: Partial<ProviderConfig> & { apiKey: string }) {
    if (!config.apiKey) {
      throw new Error("AnthropicProvider requires an apiKey. Pass it via config or set ANTHROPIC_API_KEY.");
    }
    this.apiKey = config.apiKey;
    this.model = config.model || "claude-3-5-sonnet-20241022";
    this.apiUrl = config.apiUrl || "https://api.anthropic.com/v1/messages";
    this.timeoutMs = config.timeoutMs || 30000;
    this.fetchFn = config.fetchFn;
  }

  public async generateRecommendations(
    input: RecommendationInput
  ): Promise<RecommendationResult> {
    const context = buildAnalyticsContext(input);
    const userPrompt = `
Analyze this business data and output a JSON object adhering to the specified schema:
${JSON.stringify({
  objective: input.objective || "Identify actionable opportunities to increase revenue, retention, and order volume.",
  category: input.category || "all",
  analyticsContext: context,
})}
`.trim();

    const response = await executeFetch<AnthropicMessagesResponse>({
      url: this.apiUrl,
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: {
        model: this.model,
        max_tokens: 4096,
        system: RECOMMENDATION_SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
        temperature: 0.2,
      },
      timeoutMs: this.timeoutMs,
      fetchFn: this.fetchFn,
    });

    const rawContent = response.content?.[0]?.text || "{}";
    const parsed = extractAndParseJson<RecommendationResult>(rawContent);

    const verification = verifyRecommendationGrounding(parsed.recommendations || [], input.analytics);
    const totalTokens = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    return {
      summary: parsed.summary || "Performance analysis complete.",
      recommendations: verification.verifiedRecommendations,
      limitations: [...(parsed.limitations || []), ...verification.groundingWarnings],
      metadata: {
        provider: "anthropic",
        model: this.model,
        tokensUsed: totalTokens > 0 ? totalTokens : undefined,
      },
    };
  }

  public async chat(input: ChatInput): Promise<ChatResult> {
    const context = buildAnalyticsContext(input);
    const messages: Array<{ role: string; content: string }> = [
      {
        role: "user",
        content: `Here is the verified business analytics context: ${JSON.stringify(context)}`,
      },
      {
        role: "assistant",
        content: JSON.stringify({ answer: "Understood. I will answer based strictly on this analytics data.", evidence: [], limitations: [] }),
      },
    ];

    if (input.history && input.history.length > 0) {
      for (const h of input.history.slice(-6)) {
        messages.push({ role: h.role, content: h.content });
      }
    }

    messages.push({ role: "user", content: input.question });

    const response = await executeFetch<AnthropicMessagesResponse>({
      url: this.apiUrl,
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: {
        model: this.model,
        max_tokens: 2048,
        system: CHAT_SYSTEM_PROMPT,
        messages,
        temperature: 0.2,
      },
      timeoutMs: this.timeoutMs,
      fetchFn: this.fetchFn,
    });

    const rawContent = response.content?.[0]?.text || "{}";
    const parsed = extractAndParseJson<ChatResult>(rawContent);

    const verified = verifyChatGrounding(parsed, input.analytics);
    const totalTokens = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);

    return {
      ...verified,
      metadata: {
        provider: "anthropic",
        model: this.model,
        tokensUsed: totalTokens > 0 ? totalTokens : undefined,
      },
    };
  }
}
