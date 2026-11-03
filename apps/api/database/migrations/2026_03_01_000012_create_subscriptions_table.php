<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('plan_code'); // free, growth, pro, platform
            $table->string('gateway')->default('paystack'); // paystack, manual
            $table->string('gateway_subscription_code')->nullable()->index();
            $table->string('gateway_customer_code')->nullable()->index();
            $table->string('gateway_email_token')->nullable();
            $table->string('status')->default('active'); // active, non-renewing, past_due, canceled
            $table->unsignedBigInteger('amount_minor_units')->default(0);
            $table->string('currency', 3)->default('NGN');
            $table->timestamp('current_period_start')->nullable();
            $table->timestamp('current_period_end')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
