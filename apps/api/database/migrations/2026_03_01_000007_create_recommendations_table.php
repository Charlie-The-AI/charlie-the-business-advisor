<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recommendations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('business_id')->index();
            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->uuid('analytics_snapshot_id')->nullable();
            $table->foreign('analytics_snapshot_id')->references('id')->on('analytics_snapshots')->nullOnDelete();
            $table->string('category', 64);
            $table->string('title');
            $table->text('explanation');
            $table->json('evidence');
            $table->text('recommended_action');
            $table->string('priority', 32)->default('medium'); // critical, high, medium, low
            $table->string('confidence', 32)->default('high'); // high, medium, low
            $table->string('status', 32)->default('new'); // new, viewed, accepted, in_progress, completed, dismissed
            $table->timestamp('period_from')->nullable();
            $table->timestamp('period_to')->nullable();
            $table->text('dismissed_reason')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'status']);
            $table->index(['business_id', 'category']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommendations');
    }
};
