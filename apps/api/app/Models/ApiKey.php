<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'organization_id',
        'name',
        'key_prefix',
        'secret_hash',
        'scopes',
        'business_scopes',
        'rate_limit_per_minute',
        'last_used_at',
        'expires_at',
        'revoked_at',
    ];

    protected $casts = [
        'scopes' => 'array',
        'business_scopes' => 'array',
        'last_used_at' => 'datetime',
        'expires_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    protected $hidden = [
        'secret_hash',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Creates a new scoped API key pair and returns the plaintext key once.
     */
    public static function createKey(
        string $organizationId,
        string $name,
        array $scopes = ['*'],
        array $businessScopes = ['*'],
        ?int $rateLimit = 60,
        ?\DateTimeInterface $expiresAt = null
    ): array {
        $prefix = 'cta_live_' . Str::lower(Str::random(8));
        $secret = Str::random(32);
        $plainTextKey = "{$prefix}_{$secret}";

        $apiKey = self::create([
            'organization_id' => $organizationId,
            'name' => $name,
            'key_prefix' => $prefix,
            'secret_hash' => hash('sha256', $plainTextKey),
            'scopes' => $scopes,
            'business_scopes' => $businessScopes,
            'rate_limit_per_minute' => $rateLimit ?? 60,
            'expires_at' => $expiresAt,
        ]);

        return [
            'apiKey' => $apiKey,
            'plainTextKey' => $plainTextKey,
        ];
    }

    /**
     * Finds active key by its plaintext value.
     */
    public static function findActiveKey(string $plainTextKey): ?self
    {
        $hash = hash('sha256', $plainTextKey);
        return self::where('secret_hash', $hash)
            ->whereNull('revoked_at')
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>', now());
            })
            ->first();
    }

    public function isValid(): bool
    {
        if ($this->revoked_at !== null) {
            return false;
        }

        if ($this->expires_at !== null && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }

    public function hasScope(string $requiredScope): bool
    {
        if (in_array('*', $this->scopes ?? [])) {
            return true;
        }

        return in_array($requiredScope, $this->scopes ?? []);
    }

    public function allowsBusiness(string $businessId): bool
    {
        if (in_array('*', $this->business_scopes ?? [])) {
            return true;
        }

        return in_array($businessId, $this->business_scopes ?? []);
    }

    public function revoke(): void
    {
        $this->update(['revoked_at' => now()]);
    }

    public function recordUsage(): void
    {
        $this->update(['last_used_at' => now()]);
    }
}
