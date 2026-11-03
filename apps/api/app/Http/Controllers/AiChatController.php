<?php

namespace App\Http\Controllers;

use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\AnalyticsSnapshot;
use App\Models\Business;
use App\Models\UsageRecord;
use App\Services\AI\AiProviderManager;
use App\Services\AI\GroundingVerifier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Symfony\Component\HttpFoundation\Response;

class AiChatController extends Controller
{
    /**
     * Creates a new natural-language conversation thread for a business.
     */
    public function createConversation(Request $request, string $businessId): JsonResponse
    {
        $organization = $request->attributes->get('organization');

        $business = Business::where('id', $businessId)
            ->where('organization_id', $organization->id)
            ->first();

        if (!$business) {
            return response()->json([
                'error' => 'not_found',
                'message' => 'Business not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $title = $request->input('title', 'New Advisory Chat');

        $conversation = $business->conversations()->create([
            'title' => $title,
        ]);

        return response()->json([
            'id' => $conversation->id,
            'businessId' => $business->id,
            'title' => $conversation->title,
            'createdAt' => $conversation->created_at->toISOString(),
        ], Response::HTTP_CREATED);
    }

    /**
     * Lists conversation threads for a business.
     */
    public function listConversations(Request $request, string $businessId): JsonResponse
    {
        $organization = $request->attributes->get('organization');

        $business = Business::where('id', $businessId)
            ->where('organization_id', $organization->id)
            ->first();

        if (!$business) {
            return response()->json([
                'error' => 'not_found',
                'message' => 'Business not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        $conversations = $business->conversations()
            ->latest()
            ->get();

        return response()->json(['data' => $conversations]);
    }

    /**
     * Gets message history for a conversation.
     */
    public function listMessages(Request $request, string $conversationId): JsonResponse
    {
        $organization = $request->attributes->get('organization');

        $conversation = AiConversation::with('business')
            ->where('id', $conversationId)
            ->whereHas('business', function ($q) use ($organization) {
                $q->where('organization_id', $organization->id);
            })
            ->first();

        if (!$conversation) {
            return response()->json([
                'error' => 'not_found',
                'message' => 'Conversation not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        return response()->json([
            'conversationId' => $conversation->id,
            'businessId' => $conversation->business_id,
            'messages' => $conversation->messages,
        ]);
    }

    /**
     * Sends a natural language business question and receives a grounded answer.
     */
    public function sendMessage(
        Request $request,
        string $conversationId,
        AiProviderManager $providerManager,
        GroundingVerifier $groundingVerifier
    ): JsonResponse {
        $organization = $request->attributes->get('organization');

        $validator = Validator::make($request->all(), [
            'message' => 'required|string|min:2|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'validation_failed',
                'details' => $validator->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $conversation = AiConversation::with('business')
            ->where('id', $conversationId)
            ->whereHas('business', function ($q) use ($organization) {
                $q->where('organization_id', $organization->id);
            })
            ->first();

        if (!$conversation) {
            return response()->json([
                'error' => 'not_found',
                'message' => 'Conversation not found.',
            ], Response::HTTP_NOT_FOUND);
        }

        // Sanitize user message against prompt injection
        $sanitizedContent = $groundingVerifier->sanitizeContextString($request->input('message'));

        // Store user message
        $userMsg = $conversation->messages()->create([
            'role' => 'user',
            'content' => $sanitizedContent,
        ]);

        // Load latest snapshot for business
        $latestSnapshot = AnalyticsSnapshot::where('business_id', $conversation->business_id)
            ->latest('period_to')
            ->first();

        $analyticsContext = $latestSnapshot ? $latestSnapshot->payload : [
            'warning' => 'No historical analytics snapshots have been ingested yet for this business.',
        ];

        // Format message history
        $history = $conversation->messages()
            ->latest()
            ->take(10)
            ->get()
            ->reverse()
            ->map(fn($m) => ['role' => $m->role, 'content' => $m->content])
            ->values()
            ->toArray();

        // Invoke AI Provider
        $aiProvider = $providerManager->getProvider();
        $aiResult = $aiProvider->generateChatResponse($history, $analyticsContext);

        // Store assistant response
        $assistantMsg = $conversation->messages()->create([
            'role' => 'assistant',
            'content' => $aiResult->content,
            'citations' => $aiResult->citations,
            'tool_calls' => $aiResult->toolCalls,
            'tokens_used' => $aiResult->totalTokens,
        ]);

        // Update conversation tokens
        $conversation->increment('total_tokens_used', $aiResult->totalTokens);

        // Record usage
        UsageRecord::create([
            'organization_id' => $organization->id,
            'business_id' => $conversation->business_id,
            'metric' => 'ai_chat_message',
            'quantity' => 1,
            'tokens_used' => $aiResult->totalTokens,
            'estimated_cost_cents' => $aiResult->estimatedCostCents,
        ]);

        return response()->json([
            'id' => $assistantMsg->id,
            'role' => 'assistant',
            'content' => $assistantMsg->content,
            'citations' => $assistantMsg->citations,
            'tokensUsed' => $assistantMsg->tokens_used,
            'createdAt' => $assistantMsg->created_at->toISOString(),
        ]);
    }
}
