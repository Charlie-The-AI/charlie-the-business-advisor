import {
  CharlieAiProvider,
  ProviderConfig,
  RecommendationInput,
  RecommendationResult,
  ChatInput,
  ChatResult,
} from "./types.js";
import { createAiProvider, resolveProviderFromEnv } from "./providers/factory.js";

export class CharlieAdvisor {
  public readonly provider: CharlieAiProvider;

  constructor(config?: ProviderConfig | CharlieAiProvider) {
    if (!config) {
      this.provider = resolveProviderFromEnv();
    } else if ("generateRecommendations" in config) {
      this.provider = config;
    } else {
      this.provider = createAiProvider(config);
    }
  }

  /**
   * Generates grounded business recommendations from an analytics snapshot.
   */
  public async advise(input: RecommendationInput): Promise<RecommendationResult> {
    return this.provider.generateRecommendations(input);
  }

  /**
   * Alias for advise().
   */
  public async recommend(input: RecommendationInput): Promise<RecommendationResult> {
    return this.advise(input);
  }

  /**
   * Answers a business question grounded in the analytics snapshot.
   */
  public async chat(input: ChatInput): Promise<ChatResult> {
    return this.provider.chat(input);
  }
}

/**
 * Convenience helper to create a CharlieAdvisor instance.
 */
export function createAdvisor(config?: ProviderConfig | CharlieAiProvider): CharlieAdvisor {
  return new CharlieAdvisor(config);
}
