<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Validation;

final class RecordValidationException extends \RuntimeException
{
    private string $validationCode;
    private array $issues;

    public function __construct(string $validationCode, array $issues, ?string $message = null)
    {
        $this->validationCode = $validationCode;
        $this->issues = $issues;
        parent::__construct(
            $message ?? ($validationCode === 'record_validation_failed'
                ? 'Record validation failed.'
                : 'Record validation schema is invalid.')
        );
    }

    public static function forIssues(array $issues): self
    {
        return new self('record_validation_failed', $issues);
    }

    public static function forConfiguration(string $message): self
    {
        return new self('record_validation_schema_invalid', array(array(
            'path' => array(),
            'message' => $message,
            'keyword' => 'schema',
        )), $message);
    }

    public function validationCode(): string
    {
        return $this->validationCode;
    }

    public function issues(): array
    {
        return $this->issues;
    }

    public function payload(): array
    {
        return array(
            'code' => $this->validationCode,
            'issues' => $this->issues,
        );
    }
}
