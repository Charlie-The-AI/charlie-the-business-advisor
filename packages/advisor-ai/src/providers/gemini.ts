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

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  usageMetadata?: {
    totalTokenCount?: number;
  };
}

export class GeminiProvider implements CharlieAiProvider {
  public readonly id = "gemini";
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl?: string;
  private readonly timeoutMs: number;
  private readonly fetchFn?: typeof fetch;

  constructor(config: Partial<ProviderConfig> & { apiKey: string }) {
    if (!config.apiKey) {
      throw new Error("GeminiProvider requires an apiKey. Pass it via config or set GEMINI_API_KEY.");
    }
    this.apiKey = config.apiKey;
    this.model = config.model || "gemini-2.0-flash";
    this.apiUrl = config.apiUrl;
    this.timeoutMs = config.timeoutMs || 30000;
    this.fetchFn = config.fetchFn;
  }

  private getEndpointUrl(): string {
    if (this.apiUrl) return this.apiUrl;
    return `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
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

    const response = await executeFetch<GeminiGenerateContentResponse>({
      url: this.getEndpointUrl(),
      headers: {},
      body: {
        system_instruction: {
          parts: [{ text: RECOMMENDATION_SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      },
      timeoutMs: this.timeoutMs,
      fetchFn: this.fetchFn,
    });

    const rawContent = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = extractAndParseJson<RecommendationResult>(rawContent);

    const verification = verifyRecommendationGrounding(parsed.recommendations || [], input.analytics);

    return {
      summary: parsed.summary || "Performance analysis complete.",
      recommendations: verification.verifiedRecommendations,
      limitations: [...(parsed.limitations || []), ...verification.groundingWarnings],
      metadata: {
        provider: "gemini",
        model: this.model,
        tokensUsed: response.usageMetadata?.totalTokenCount,
      },
    };
  }

  public async chat(input: ChatInput): Promise<ChatResult> {
    const context = buildAnalyticsContext(input);
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [
      {
        role: "user",
        parts: [{ text: `Here is the verified business analytics context: ${JSON.stringify(context)}` }],
      },
      {
        role: "model",
        parts: [{ text: JSON.stringify({ answer: "Understood. I will answer based strictly on this analytics data.", evidence: [], limitations: [] }) }],
      },
    ];

    if (input.history && input.history.length > 0) {
      for (const h of input.history.slice(-6)) {
        contents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        });
      }
    }

    contents.push({
      role: "user",
      parts: [{ text: input.question }],
    });

    const response = await executeFetch<GeminiGenerateContentResponse>({
      url: this.getEndpointUrl(),
      headers: {},
      body: {
        system_instruction: {
          parts: [{ text: CHAT_SYSTEM_PROMPT }],
        },
        contents,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      },
      timeoutMs: this.timeoutMs,
      fetchFn: this.fetchFn,
    });

    const rawContent = response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const parsed = extractAndParseJson<ChatResult>(rawContent);

    const verified = verifyChatGrounding(parsed, input.analytics);
    return {
      ...verified,
      metadata: {
        provider: "gemini",
        model: this.model,
        tokensUsed: response.usageMetadata?.totalTokenCount,
      },
    };
  }
}
