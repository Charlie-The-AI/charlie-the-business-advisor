<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ai_conversation_id')->constrained('ai_conversations')->cascadeOnDelete();
            $table->string('role', 16); // user, assistant, system, tool
            $table->text('content');
            $table->json('citations')->nullable(); // structured references to analytics snapshot metrics
            $table->json('tool_calls')->nullable();
            $table->integer('tokens_used')->default(0);
            $table->timestamps();

            $table->index(['ai_conversation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_messages');
    }
};
