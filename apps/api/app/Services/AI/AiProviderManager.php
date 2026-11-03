<?php

namespace App\Services\AI;

use App\Services\AI\Contracts\AiProviderInterface;

class AiProviderManager
{
    private static ?AiProviderInterface $customProvider = null;

    /**
     * Resolves the active AI provider.
     */
    public function getProvider(): AiProviderInterface
    {
        if (self::$customProvider !== null) {
            return self::$customProvider;
        }

        $driver = config('services.ai.provider', 'mock');

        return match ($driver) {
            'openai' => new OpenAiProvider(),
            default => new MockAiProvider(),
        };
    }

    /**
     * Allows test suites to swap the active AI provider.
     */
    public static function setCustomProvider(?AiProviderInterface $provider): void
    {
        self::$customProvider = $provider;
    }
}
