import type {
  AnalyticsSnapshot,
  RecommendationPriority,
  RecommendationCategory,
} from "@charlie-the-ai/advisor-types";

export type { RecommendationPriority, RecommendationCategory };

export type AiProviderId = "openai" | "gemini" | "anthropic" | "mock" | (string & {});

export interface EvidenceItem {
  metric: string;
  value: number | string;
  reference?: string;
  isVerified?: boolean;
}

export interface RecommendationItem {
  id: string;
  title: string;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  description: string;
  evidence: EvidenceItem[];
  suggestedActions: string[];
  groundingStatus?: "verified" | "unverified" | "flagged";
}

export interface RecommendationResult {
  summary: string;
  recommendations: RecommendationItem[];
  limitations: string[];
  metadata?: {
    provider: string;
    model?: string;
    tokensUsed?: number;
  };
}

export interface RecommendationInput {
  analytics: AnalyticsSnapshot;
  objective?: string;
  category?: RecommendationCategory | string;
  maxRecommendations?: number;
  includeCustomerDetails?: boolean; // Default false to strip PII
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatInput {
  question: string;
  analytics: AnalyticsSnapshot;
  history?: ChatMessage[];
  includeCustomerDetails?: boolean;
}

export interface ChatResult {
  answer: string;
  evidence: EvidenceItem[];
  limitations: string[];
  metadata?: {
    provider: string;
    model?: string;
    tokensUsed?: number;
  };
}

export interface CharlieAiProvider {
  id: AiProviderId;
  generateRecommendations(input: RecommendationInput): Promise<RecommendationResult>;
  chat(input: ChatInput): Promise<ChatResult>;
}

export interface ProviderConfig {
  provider: AiProviderId;
  apiKey?: string;
  model?: string;
  apiUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
  fetchFn?: typeof fetch;
}
