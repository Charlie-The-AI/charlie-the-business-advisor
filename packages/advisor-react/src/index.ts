// Context & Provider
export { CharlieProvider, useCharlieContext } from './context.js';
export type { CharlieConfig, CharlieProviderProps } from './context.js';

// Hooks
export { useBusinessAnalytics, useCharlieAnalytics } from './useBusinessAnalytics.js';
export type { UseBusinessAnalyticsOptions } from './useBusinessAnalytics.js';

export { useBusinessRecommendations } from './useBusinessRecommendations.js';
export type { UseBusinessRecommendationsOptions } from './useBusinessRecommendations.js';

export { useAdvisorChat } from './useAdvisorChat.js';
export type { UseAdvisorChatOptions, ChatMessageItem } from './useAdvisorChat.js';

// Visual Components
export { MetricBadge } from './components/MetricBadge.js';
export type { MetricBadgeProps } from './components/MetricBadge.js';

export { RevenueCard } from './components/RevenueCard.js';
export type { RevenueCardProps } from './components/RevenueCard.js';

export { ParetoChart } from './components/ParetoChart.js';
export type { ParetoChartProps } from './components/ParetoChart.js';

export { RecommendationCard } from './components/RecommendationCard.js';
export type { RecommendationCardProps, RecommendationCardData } from './components/RecommendationCard.js';

export { RecommendationWidget } from './components/RecommendationWidget.js';
export type { RecommendationWidgetProps } from './components/RecommendationWidget.js';

export { CustomerSegments } from './components/CustomerSegments.js';
export type { CustomerSegmentsProps } from './components/CustomerSegments.js';

export { TopProductsChart } from './components/TopProductsChart.js';
export type { TopProductsChartProps } from './components/TopProductsChart.js';
