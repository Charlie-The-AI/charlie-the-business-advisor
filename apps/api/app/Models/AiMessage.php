<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiMessage extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'ai_conversation_id',
        'role', // user, assistant, system, tool
        'content',
        'citations',
        'tool_calls',
        'tokens_used',
    ];

    protected $casts = [
        'citations' => 'array',
        'tool_calls' => 'array',
        'tokens_used' => 'integer',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(AiConversation::class, 'ai_conversation_id');
    }
}
