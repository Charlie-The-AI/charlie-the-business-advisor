<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsageRecord extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'organization_id',
        'business_id',
        'metric',
        'quantity',
        'tokens_used',
        'estimated_cost_cents',
        'metadata',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'tokens_used' => 'integer',
        'estimated_cost_cents' => 'integer',
        'metadata' => 'array',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
