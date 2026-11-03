<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecommendationJob extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'business_id',
        'analytics_snapshot_id',
        'status', // pending, processing, completed, failed
        'attempts',
        'error_message',
    ];

    protected $casts = [
        'attempts' => 'integer',
    ];

    public function business(): BelongsTo
    {
        return $this->belongsTo(Business::class);
    }

    public function snapshot(): BelongsTo
    {
        return $this->belongsTo(AnalyticsSnapshot::class, 'analytics_snapshot_id');
    }

    public function markProcessing(): void
    {
        $this->update([
            'status' => 'processing',
            'attempts' => $this->attempts + 1,
        ]);
    }

    public function markCompleted(): void
    {
        $this->update([
            'status' => 'completed',
        ]);
    }

    public function markFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'error_message' => $error,
        ]);
    }
}
