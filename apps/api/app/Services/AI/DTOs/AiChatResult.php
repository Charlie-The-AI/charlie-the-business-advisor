<?php

namespace App\Services\AI\DTOs;

class AiChatResult
{
    public function __construct(
        public string $content,
        public array $citations = [],
        public array $toolCalls = [],
        public int $promptTokens = 0,
        public int $completionTokens = 0,
        public int $totalTokens = 0,
        public string $model = 'unknown',
        public int $estimatedCostCents = 0
    ) {
    }
}
