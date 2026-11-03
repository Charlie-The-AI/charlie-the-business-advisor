<?php

namespace App\Services\AI\Contracts;

use App\Services\AI\DTOs\AiChatResult;
use App\Services\AI\DTOs\AiRecommendationResult;

interface AiProviderInterface
{
    /**
     * Synthesizes structured, grounded business recommendations from an AnalyticsSnapshot.
     */
    public function generateStructuredRecommendations(array $analyticsContext, array $options = []): AiRecommendationResult;

    /**
     * Synthesizes a natural-language conversational response with evidence citations and controlled tool calls.
     */
    public function generateChatResponse(
        array $conversationHistory,
        array $analyticsContext,
        array $availableTools = [],
        array $options = []
    ): AiChatResult;

    /**
     * Estimates cost in integer cents from token counts.
     */
    public function estimateCostCents(int $promptTokens, int $completionTokens, string $model): int;
}
