<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organization extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'plan',
        'billing_status',
        'paystack_customer_code',
        'paystack_subscription_code',
        'monthly_snapshot_quota',
        'monthly_ai_tokens_quota',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
        'monthly_snapshot_quota' => 'integer',
        'monthly_ai_tokens_quota' => 'integer',
    ];

    public function businesses(): HasMany
    {
        return $this->hasMany(Business::class);
    }

    public function members(): HasMany
    {
        return $this->hasMany(OrganizationMember::class);
    }

    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class);
    }

    public function usageRecords(): HasMany
    {
        return $this->hasMany(UsageRecord::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function latestSubscription()
    {
        return $this->hasOne(Subscription::class)->latestOfMany();
    }

    /**
     * Checks whether organization has available monthly snapshot ingestion quota.
     */
    public function hasSnapshotQuota(): bool
    {
        if ($this->monthly_snapshot_quota === -1) {
            return true; // Unlimited
        }

        $currentMonthCount = $this->usageRecords()
            ->where('metric', 'snapshot_ingestion')
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();

        return $currentMonthCount < $this->monthly_snapshot_quota;
    }

    /**
     * Checks whether organization has available AI tokens quota.
     */
    public function hasAiTokensQuota(int $estimatedTokens = 1000): bool
    {
        if ($this->monthly_ai_tokens_quota === -1) {
            return true; // Unlimited
        }

        $currentTokensUsed = (int) $this->usageRecords()
            ->where('metric', 'ai_chat_message')
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('quantity');

        return ($currentTokensUsed + $estimatedTokens) <= $this->monthly_ai_tokens_quota;
    }

    /**
     * Checks whether organization can create an additional business profile.
     */
    public function canCreateBusiness(): bool
    {
        $planConfig = config("billing.plans.{$this->plan}.quotas.max_businesses", 1);
        if ($planConfig === -1) {
            return true;
        }

        return $this->businesses()->count() < $planConfig;
    }
}
