<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('business_id')->index();
            $table->foreign('business_id')->references('id')->on('businesses')->cascadeOnDelete();
            $table->string('snapshot_id', 64)->index();
            $table->string('idempotency_key', 128)->nullable()->index();
            $table->string('schema_version', 16)->default('1.0.0');
            $table->string('calculation_version', 16)->default('1.0.0');
            $table->string('currency', 3);
            $table->timestamp('period_from');
            $table->timestamp('period_to');
            $table->bigInteger('net_revenue_minor_units');
            $table->bigInteger('gross_sales_minor_units');
            $table->integer('total_orders');
            $table->integer('total_completed_orders');
            $table->bigInteger('average_order_value_minor_units');
            $table->decimal('repeat_purchase_rate', 5, 2)->nullable();
            $table->integer('data_quality_score')->default(100);
            $table->json('payload'); // Full AnalyticsSnapshot JSON
            $table->timestamps();

            $table->index(['business_id', 'period_from', 'period_to']);
            $table->index(['business_id', 'idempotency_key']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_snapshots');
    }
};
