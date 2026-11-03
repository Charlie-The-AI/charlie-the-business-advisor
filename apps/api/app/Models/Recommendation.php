<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recommendation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'business_id',
        'analytics_snapshot_id',
        'category',
        'title',
        'explanation',
        'evidence',
        'recommended_action',
        'priority',
        'confidence',
        'status', // new, viewed, accepted, in_progress, completed, dismissed
        'period_from',
        'period_to',
        'dismissed_reason',
    ];

    protected $casts = [
        'evidence' => 'array',
        'period_from' => 'datetime',
        'period_to' => 'datetime',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function snapshot(): BelongsTo
    {
        return $this->belongsTo(AnalyticsSnapshot::class, 'analytics_snapshot_id');
    }
}
