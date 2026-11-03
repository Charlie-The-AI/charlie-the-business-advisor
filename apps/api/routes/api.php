<?php

use App\Http\Controllers\ApiKeyController;
use App\Http\Controllers\RecommendationController;
use App\Http\Controllers\SnapshotIngestionController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public Health Check
    Route::get('/health', function () {
        return response()->json([
            'status' => 'healthy',
            'product' => 'Charlie the Business Advisor SaaS API',
            'version' => '1.0.0',
            'timestamp' => now()->toISOString(),
        ]);
    });

    // Authenticated API Routes
    Route::middleware('auth.api_key')->group(function () {
        // Analytics Snapshots Ingestion & Retrieval
        Route::post('/analytics/snapshots', [SnapshotIngestionController::class, 'store'])
            ->middleware('auth.api_key:snapshots:write');
        Route::get('/analytics/snapshots/{id}', [SnapshotIngestionController::class, 'show'])
            ->middleware('auth.api_key:snapshots:read');
        Route::get('/businesses/{businessId}/snapshots', [SnapshotIngestionController::class, 'listByBusiness'])
            ->middleware('auth.api_key:snapshots:read');

        // AI Recommendations
        Route::post('/recommendations/generate', [RecommendationController::class, 'generate'])
            ->middleware('auth.api_key:recommendations:write');
        Route::get('/recommendations/jobs/{jobId}', [RecommendationController::class, 'showJob'])
            ->middleware('auth.api_key:recommendations:read');
        Route::get('/businesses/{businessId}/recommendations', [RecommendationController::class, 'listByBusiness'])
            ->middleware('auth.api_key:recommendations:read');
        Route::patch('/recommendations/{id}/status', [RecommendationController::class, 'updateStatus'])
            ->middleware('auth.api_key:recommendations:write');

        // Natural Language AI Business Chat
        Route::post('/businesses/{businessId}/chat/conversations', [\App\Http\Controllers\AiChatController::class, 'createConversation'])
            ->middleware('auth.api_key:chat:write');
        Route::get('/businesses/{businessId}/chat/conversations', [\App\Http\Controllers\AiChatController::class, 'listConversations'])
            ->middleware('auth.api_key:chat:read');
        Route::get('/chat/conversations/{conversationId}/messages', [\App\Http\Controllers\AiChatController::class, 'listMessages'])
            ->middleware('auth.api_key:chat:read');
        Route::post('/chat/conversations/{conversationId}/messages', [\App\Http\Controllers\AiChatController::class, 'sendMessage'])
            ->middleware('auth.api_key:chat:write');

        // Scoped API Key Management
        Route::get('/api-keys', [ApiKeyController::class, 'index'])
            ->middleware('auth.api_key:keys:read');
        Route::post('/api-keys', [ApiKeyController::class, 'store'])
            ->middleware('auth.api_key:keys:write');
        Route::delete('/api-keys/{id}', [ApiKeyController::class, 'destroy'])
            ->middleware('auth.api_key:keys:write');
    });
});
