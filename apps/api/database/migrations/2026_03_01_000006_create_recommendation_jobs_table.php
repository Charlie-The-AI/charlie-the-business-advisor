<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recommendation_jobs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('business_id')->index();
            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->uuid('analytics_snapshot_id')->nullable();
            $table->foreign('analytics_snapshot_id')->references('id')->on('analytics_snapshots')->nullOnDelete();
            $table->string('status', 32)->default('pending'); // pending, processing, completed, failed
            $table->integer('attempts')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['business_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommendation_jobs');
    }
};
