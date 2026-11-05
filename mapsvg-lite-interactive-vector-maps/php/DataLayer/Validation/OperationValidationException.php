<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Validation;

/** Structured validation error for generated operation inputs. */
final class OperationValidationException extends \InvalidArgumentException
{
    private string $operation;
    private array $issues;

    /**
     * @param array<int,array{path:array<int|string>,message:string,keyword:string}> $issues
     */
    public function __construct(
        string $operation,
        array $issues,
        ?string $message = null
    ) {
        $this->operation = $operation;
        $this->issues = array_values($issues);

        if ($message === null) {
            $first = $this->issues[0] ?? array();
            $path = isset($first['path']) && is_array($first['path'])
                ? implode('.', array_map('strval', $first['path']))
                : '';
            $detail = (string) ($first['message'] ?? 'Operation validation failed.');
            $message = 'Invalid ' . $operation . ' input'
                . ($path !== '' ? ' at ' . $path : '')
                . ': '
                . $detail;
        }

        parent::__construct($message);
    }

    public function operation(): string
    {
        return $this->operation;
    }

    public function validationCode(): string
    {
        return 'operation_validation_failed';
    }

    public function issues(): array
    {
        return $this->issues;
    }
}
