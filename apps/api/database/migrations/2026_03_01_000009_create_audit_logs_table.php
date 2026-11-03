<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('organization_id')->constrained('organizations')->cascadeOnDelete();
            $table->string('business_id')->nullable()->index();
            $table->string('actor_type', 32); // user, api_key, system
            $table->string('actor_id', 64);
            $table->string('action', 64); // snapshot_ingested, key_generated, key_revoked, etc.
            $table->string('ip_address', 45)->nullable();
            $table->json('details')->nullable();
            $table->timestamps();

            $table->index(['organization_id', 'action']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
