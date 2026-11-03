<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'organization_id',
        'plan_code',
        'gateway',
        'gateway_subscription_code',
        'gateway_customer_code',
        'gateway_email_token',
        'status',
        'amount_minor_units',
        'currency',
        'current_period_start',
        'current_period_end',
        'cancelled_at',
        'metadata',
    ];

    protected $casts = [
        'amount_minor_units' => 'integer',
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'cancelled_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active' &&
            (!$this->current_period_end || $this->current_period_end->isFuture());
    }

    public function isCancelled(): bool
    {
        return $this->status === 'canceled' || $this->cancelled_at !== null;
    }
}
