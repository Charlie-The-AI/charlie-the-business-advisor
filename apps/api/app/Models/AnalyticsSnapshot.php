<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnalyticsSnapshot extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'business_id',
        'snapshot_id',
        'idempotency_key',
        'schema_version',
        'calculation_version',
        'currency',
        'period_from',
        'period_to',
        'net_revenue_minor_units',
        'gross_sales_minor_units',
        'total_orders',
        'total_completed_orders',
        'average_order_value_minor_units',
        'repeat_purchase_rate',
        'data_quality_score',
        'payload',
    ];

    protected $casts = [
        'period_from' => 'datetime',
        'period_to' => 'datetime',
        'net_revenue_minor_units' => 'integer',
        'gross_sales_minor_units' => 'integer',
        'total_orders' => 'integer',
        'total_completed_orders' => 'integer',
        'average_order_value_minor_units' => 'integer',
        'repeat_purchase_rate' => 'float',
        'data_quality_score' => 'integer',
        'payload' => 'array',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function recommendations(): HasMany
    {
        return $this->hasMany(Recommendation::class);
    }

    public function recommendationJobs(): HasMany
    {
        return $this->hasMany(RecommendationJob::class);
    }
}
