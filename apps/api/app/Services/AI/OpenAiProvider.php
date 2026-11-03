<?php

namespace App\Services\AI;

use App\Services\AI\Contracts\AiProviderInterface;
use App\Services\AI\DTOs\AiChatResult;
use App\Services\AI\DTOs\AiRecommendationResult;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class OpenAiProvider implements AiProviderInterface
{
    private string $apiKey;
    private string $model;
    private ?string $organization;
    private string $baseUrl;

    public function __construct(?string $apiKey = null, ?string $model = null, ?string $organization = null)
    {
        $this->apiKey = $apiKey ?? config('services.openai.api_key', '');
        $this->model = $model ?? config('services.openai.model', 'gpt-4o-mini');
        $this->organization = $organization ?? config('services.openai.organization');
        $this->baseUrl = 'https://api.openai.com/v1';
    }

    public function generateStructuredRecommendations(array $analyticsContext, array $options = []): AiRecommendationResult
    {
        if (empty($this->apiKey)) {
            throw new RuntimeException("OpenAI API key is not configured.");
        }

        $systemPrompt = <<<PROMPT
You are Charlie the Business Advisor — an expert, evidence-grounded AI business intelligence strategist.
Your task is to analyze the provided business analytics snapshot and discover actionable growth opportunities.

CRITICAL RULES:
1. Every numerical claim you make MUST directly reference a verified metric from the snapshot in the evidence array.
2. NEVER invent numbers, fabricate percentages, or hallucinate metrics.
3. NEVER promise guaranteed revenue, risk-free returns, or certain profits.
4. If data is incomplete (e.g. missing product costs or customer retention data), explicitly acknowledge the data gap and recommend tracking procedures.
5. Provide actionable, high-leverage business recommendations categorized into:
   - sales_growth
   - product_optimization
   - customer_retention
   - revenue_concentration
   - pricing_opportunities
   - product_profitability
   - inventory_optimization
   - performance_anomalies
PROMPT;

        $userPrompt = "Please analyze this verified business analytics snapshot and generate prioritized recommendations:\n\n"
            . json_encode($analyticsContext, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

        $jsonSchema = [
            'name' => 'business_recommendations',
            'strict' => true,
            'schema' => [
                'type' => 'object',
                'properties' => [
                    'recommendations' => [
                        'type' => 'array',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'category' => [
                                    'type' => 'string',
                                    'enum' => [
                                        'sales_growth',
                                        'product_optimization',
                                        'customer_retention',
                                        'revenue_concentration',
                                        'pricing_opportunities',
                                        'product_profitability',
                                        'inventory_optimization',
                                        'performance_anomalies',
                                    ],
                                ],
                                'title' => ['type' => 'string'],
                                'explanation' => ['type' => 'string'],
                                'evidence' => [
                                    'type' => 'array',
                                    'items' => [
                                        'type' => 'object',
                                        'properties' => [
                                            'metricName' => ['type' => 'string'],
                                            'metricValue' => ['type' => ['number', 'string', 'boolean']],
                                            'formattedValue' => ['type' => 'string'],
                                            'sourceField' => ['type' => 'string'],
                                        ],
                                        'required' => ['metricName', 'metricValue', 'formattedValue', 'sourceField'],
                                        'additionalProperties' => false,
                                    ],
                                ],
                                'recommendedAction' => ['type' => 'string'],
                                'priority' => [
                                    'type' => 'string',
                                    'enum' => ['critical', 'high', 'medium', 'low'],
                                ],
                                'confidence' => [
                                    'type' => 'string',
                                    'enum' => ['high', 'medium', 'low'],
                                ],
                            ],
                            'required' => ['category', 'title', 'explanation', 'evidence', 'recommendedAction', 'priority', 'confidence'],
                            'additionalProperties' => false,
                        ],
                    ],
                ],
                'required' => ['recommendations'],
                'additionalProperties' => false,
            ],
        ];

        $requestPayload = [
            'model' => $options['model'] ?? $this->model,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userPrompt],
            ],
            'response_format' => [
                'type' => 'json_schema',
                'json_schema' => $jsonSchema,
            ],
            'temperature' => 0.2, // Low temperature for factual consistency
        ];

        $client = Http::withToken($this->apiKey)->timeout(60);
        if ($this->organization) {
            $client = $client->withHeaders(['OpenAI-Organization' => $this->organization]);
        }

        $response = $client->post("{$this->baseUrl}/chat/completions", $requestPayload);

        if (!$response->successful()) {
            Log::error("OpenAI API call failed: " . $response->body());
            throw new RuntimeException("OpenAI API error: " . $response->json('error.message', 'Unknown error'));
        }

        $data = $response->json();
        $usage = $data['usage'] ?? [];
        $promptTokens = $usage['prompt_tokens'] ?? 0;
        $completionTokens = $usage['completion_tokens'] ?? 0;
        $totalTokens = $usage['total_tokens'] ?? 0;

        $contentRaw = $data['choices'][0]['message']['content'] ?? '{}';
        $parsed = json_decode($contentRaw, true);
        $recommendations = $parsed['recommendations'] ?? [];

        $costCents = $this->estimateCostCents($promptTokens, $completionTokens, $this->model);

        return new AiRecommendationResult(
            recommendations: $recommendations,
            promptTokens: $promptTokens,
            completionTokens: $completionTokens,
            totalTokens: $totalTokens,
            model: $this->model,
            estimatedCostCents: $costCents
        );
    }

    public function generateChatResponse(
        array $conversationHistory,
        array $analyticsContext,
        array $availableTools = [],
        array $options = []
    ): AiChatResult {
        if (empty($this->apiKey)) {
            throw new RuntimeException("OpenAI API key is not configured.");
        }

        $systemPrompt = "You are Charlie the Business Advisor — a helpful, conversational business analytics companion. "
            . "Answer business questions accurately using the verified analytics context. "
            . "Cite verified metrics from the context. Do not invent revenue figures or speculate without evidence.\n\n"
            . "Analytics Snapshot Context:\n" . json_encode($analyticsContext, JSON_UNESCAPED_SLASHES);

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($conversationHistory as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'content' => $msg['content'],
            ];
        }

        $client = Http::withToken($this->apiKey)->timeout(60);
        $response = $client->post("{$this->baseUrl}/chat/completions", [
            'model' => $options['model'] ?? $this->model,
            'messages' => $messages,
            'temperature' => 0.3,
        ]);

        if (!$response->successful()) {
            throw new RuntimeException("OpenAI Chat API error: " . $response->json('error.message', 'Unknown error'));
        }

        $data = $response->json();
        $usage = $data['usage'] ?? [];
        $promptTokens = $usage['prompt_tokens'] ?? 0;
        $completionTokens = $usage['completion_tokens'] ?? 0;
        $totalTokens = $usage['total_tokens'] ?? 0;
        $content = $data['choices'][0]['message']['content'] ?? '';

        return new AiChatResult(
            content: $content,
            citations: [],
            toolCalls: [],
            promptTokens: $promptTokens,
            completionTokens: $completionTokens,
            totalTokens: $totalTokens,
            model: $this->model,
            estimatedCostCents: $this->estimateCostCents($promptTokens, $completionTokens, $this->model)
        );
    }

    public function estimateCostCents(int $promptTokens, int $completionTokens, string $model): int
    {
        // Pricing per million tokens (cents):
        // gpt-4o-mini: input = $0.150/1M (15 cents/1M), output = $0.600/1M (60 cents/1M)
        // gpt-4o:      input = $2.50/1M (250 cents/1M), output = $10.00/1M (1000 cents/1M)
        if (str_contains($model, 'mini')) {
            $cost = ($promptTokens * 0.000015) + ($completionTokens * 0.000060);
        } else {
            $cost = ($promptTokens * 0.00025) + ($completionTokens * 0.00100);
        }

        return max(1, (int) round($cost));
    }
}
