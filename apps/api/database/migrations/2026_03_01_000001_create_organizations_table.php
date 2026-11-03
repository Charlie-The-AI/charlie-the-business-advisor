<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('plan')->default('free'); // free, growth, pro, platform
            $table->string('billing_status')->default('active'); // active, past_due, canceled, trialing
            $table->string('paystack_customer_code')->nullable()->index();
            $table->string('paystack_subscription_code')->nullable()->index();
            $table->integer('monthly_snapshot_quota')->default(10);
            $table->integer('monthly_ai_tokens_quota')->default(100000);
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
