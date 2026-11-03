<?php

namespace App\Services\AI\DTOs;

class AiRecommendationResult
{
    public function __construct(
        public array $recommendations,
        public int $promptTokens = 0,
        public int $completionTokens = 0,
        public int $totalTokens = 0,
        public string $model = 'unknown',
        public int $estimatedCostCents = 0
    ) {
    }
}
