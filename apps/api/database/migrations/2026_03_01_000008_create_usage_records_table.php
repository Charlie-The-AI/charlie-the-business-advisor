<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('usage_records', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('business_id')->nullable()->index();
            $table->string('metric', 64); // snapshot_ingestion, recommendation_generation, chat_message
            $table->integer('quantity')->default(1);
            $table->integer('tokens_used')->default(0);
            $table->integer('estimated_cost_cents')->default(0);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'metric', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('usage_records');
    }
};
