import { CharlieAiProvider, ProviderConfig, AiProviderId } from "../types.js";
import { MockAiProvider } from "./mock.js";
import { OpenAiProvider } from "./openai.js";
import { GeminiProvider } from "./gemini.js";
import { AnthropicProvider } from "./anthropic.js";

declare const process: any;

/**
 * Creates an AI provider instance from a configuration object.
 */
export function createAiProvider(config: ProviderConfig): CharlieAiProvider {
  switch (config.provider) {
    case "mock":
      return new MockAiProvider();

    case "openai":
      if (!config.apiKey) {
        throw new Error("Cannot initialize OpenAiProvider without an apiKey.");
      }
      return new OpenAiProvider({
        apiKey: config.apiKey,
        model: config.model,
        apiUrl: config.apiUrl,
        timeoutMs: config.timeoutMs,
        fetchFn: config.fetchFn,
      });

    case "gemini":
      if (!config.apiKey) {
        throw new Error("Cannot initialize GeminiProvider without an apiKey.");
      }
      return new GeminiProvider({
        apiKey: config.apiKey,
        model: config.model,
        apiUrl: config.apiUrl,
        timeoutMs: config.timeoutMs,
        fetchFn: config.fetchFn,
      });

    case "anthropic":
      if (!config.apiKey) {
        throw new Error("Cannot initialize AnthropicProvider without an apiKey.");
      }
      return new AnthropicProvider({
        apiKey: config.apiKey,
        model: config.model,
        apiUrl: config.apiUrl,
        timeoutMs: config.timeoutMs,
        fetchFn: config.fetchFn,
      });

    default:
      throw new Error(`Unsupported AI provider: "${config.provider}". Supported providers: "openai", "gemini", "anthropic", "mock".`);
  }
}

/**
 * Resolves an AI provider from server-side environment variables or falls back to MockAiProvider.
 */
export function resolveProviderFromEnv(
  overrides: Partial<ProviderConfig> = {}
): CharlieAiProvider {
  const env = typeof process !== "undefined" && process.env ? process.env : {};

  let provider: AiProviderId =
    overrides.provider ||
    (env.CHARLIE_AI_PROVIDER as AiProviderId) ||
    "";

  let apiKey = overrides.apiKey;

  if (!provider) {
    if (overrides.apiKey) {
      provider = "openai"; // default if only apiKey passed
    } else if (env.OPENAI_API_KEY) {
      provider = "openai";
      apiKey = env.OPENAI_API_KEY;
    } else if (env.GEMINI_API_KEY) {
      provider = "gemini";
      apiKey = env.GEMINI_API_KEY;
    } else if (env.ANTHROPIC_API_KEY) {
      provider = "anthropic";
      apiKey = env.ANTHROPIC_API_KEY;
    } else {
      // Default to Mock for zero-config offline execution
      provider = "mock";
    }
  } else if (!apiKey) {
    if (provider === "openai") apiKey = env.OPENAI_API_KEY;
    else if (provider === "gemini") apiKey = env.GEMINI_API_KEY;
    else if (provider === "anthropic") apiKey = env.ANTHROPIC_API_KEY;
  }

  const model = overrides.model || env.CHARLIE_AI_MODEL;

  return createAiProvider({
    provider,
    apiKey,
    model,
    apiUrl: overrides.apiUrl,
    timeoutMs: overrides.timeoutMs,
    fetchFn: overrides.fetchFn,
  });
}
