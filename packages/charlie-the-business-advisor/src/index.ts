// Main public client
export * from "./charlie.js";

// Re-export dataset contracts and schemas
export * from "@charlie-the-ai/advisor-types";

// Re-export analytics calculation engine
export * from "@charlie-the-ai/analytics-core";

// Re-export adapters
export * from "@charlie-the-ai/analytics-adapters";

// Re-export AI SDK
export * from "@charlie-the-ai/advisor-ai";

// Resolve re-export ambiguity for types present in multiple subpackages
export type { RecommendationCategory, RecommendationPriority } from "@charlie-the-ai/advisor-types";
