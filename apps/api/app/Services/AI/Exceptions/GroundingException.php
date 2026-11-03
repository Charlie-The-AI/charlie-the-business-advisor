<?php

namespace App\Services\AI\Exceptions;

use Exception;

class GroundingException extends Exception
{
    public function __construct(
        string $message,
        public array $violations = []
    ) {
        parent::__construct($message);
    }
}
