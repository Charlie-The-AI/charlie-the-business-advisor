<?php

namespace App\Services\AI\GroundingVerifier;

namespace App\Services\AI;

use App\Services\AI\Exceptions\GroundingException;

class GroundingVerifier
{
    private const FORBIDDEN_GUARANTEE_TERMS = [
        'guaranteed revenue',
        'guarantee revenue',
        'guaranteed profit',
        'guarantee profit',
        'risk-free',
        '100% success',
        'will definitely increase',
    ];

    /**
     * Verifies that all numerical claims and evidence in recommendations exist in the analytics context.
     *
     * @throws GroundingException
     */
    public function verifyRecommendations(array $recommendations, array $snapshotPayload): array
    {
        $verified = [];
        $violations = [];

        foreach ($recommendations as $index => $rec) {
            $recViolations = [];

            // 1. Check title and explanation for prohibited outcome guarantees
            $text = strtolower(($rec['title'] ?? '') . ' ' . ($rec['explanation'] ?? '') . ' ' . ($rec['recommendedAction'] ?? ''));
            foreach (self::FORBIDDEN_GUARANTEE_TERMS as $forbidden) {
                if (str_contains($text, $forbidden)) {
                    $recViolations[] = "Prohibited outcome guarantee detected: '{$forbidden}' violates financial advisory compliance.";
                }
            }

            // 2. Validate evidence grounding
            $evidenceList = $rec['evidence'] ?? [];
            if (empty($evidenceList)) {
                $recViolations[] = "Recommendation lacks supporting evidence array.";
            } else {
                foreach ($evidenceList as $evIndex => $evidence) {
                    $sourceField = $evidence['sourceField'] ?? null;
                    $claimedValue = $evidence['metricValue'] ?? null;

                    if (!$sourceField) {
                        $recViolations[] = "Evidence item #{$evIndex} is missing sourceField.";
                        continue;
                    }

                    $actualValue = $this->resolvePath($snapshotPayload, $sourceField);

                    if ($actualValue === null) {
                        $recViolations[] = "Evidence sourceField '{$sourceField}' does not exist in the analytics snapshot.";
                        continue;
                    }

                    // Check numerical equality within reasonable tolerance for floats
                    if (is_numeric($claimedValue) && is_numeric($actualValue)) {
                        $diff = abs((float)$claimedValue - (float)$actualValue);
                        if ($diff > 0.05) {
                            $recViolations[] = "Ungrounded numerical claim in '{$sourceField}': claimed {$claimedValue}, but verified snapshot value is {$actualValue}.";
                        }
                    }
                }
            }

            if (!empty($recViolations)) {
                $violations["recommendation_{$index}"] = $recViolations;
            } else {
                $verified[] = $rec;
            }
        }

        if (!empty($violations)) {
            throw new GroundingException(
                "AI Recommendation Grounding Verification failed for " . count($violations) . " item(s).",
                $violations
            );
        }

        return $verified;
    }

    /**
     * Sanitizes external untrusted data before injection into AI prompt context.
     */
    public function sanitizeContextString(string $input): string
    {
        // Strip markdown code fences, system prompt override attempts, and HTML tags
        $cleaned = strip_tags($input);
        $cleaned = preg_replace('/```[a-z]*|```/i', '', $cleaned);
        $cleaned = preg_replace('/(SYSTEM:|INSTRUCTION:|HUMAN:|ASSISTANT:)/i', '', $cleaned);
        return trim($cleaned);
    }

    /**
     * Resolves dot-notated path in nested array.
     */
    public function resolvePath(array $data, string $path): mixed
    {
        $keys = explode('.', $path);
        $current = $data;

        foreach ($keys as $key) {
            if (!is_array($current) || !array_key_exists($key, $current)) {
                return null;
            }
            $current = $current[$key];
        }

        return $current;
    }
}
