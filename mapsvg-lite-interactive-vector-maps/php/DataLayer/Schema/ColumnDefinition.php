<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

/** Immutable physical MySQL column owned by one MapSVG table definition. */
final class ColumnDefinition
{
    private string $name;
    private string $type;
    private bool $nullable;
    private bool $autoIncrement;
    private bool $hasDefault;
    /** @var mixed */
    private $defaultValue;

    /** @param mixed $defaultValue */
    public function __construct(
        string $name,
        string $type,
        bool $nullable = true,
        bool $autoIncrement = false,
        bool $hasDefault = false,
        $defaultValue = null
    ) {
        self::assertIdentifier($name, 'column');
        $type = self::normalizeType($type);
        if ($type === '') {
            throw new \InvalidArgumentException('Column type must not be empty.');
        }
        if (preg_match('/[`;?#\x00-\x1F]|--|\/\*|\*\//', $type)
            || !preg_match(
                '/^[a-z][a-z0-9]*(?:\s*\([^)]*\))?(?:\s+unsigned)?$/D',
                $type
            )) {
            throw new \InvalidArgumentException(
                'Column type is not a supported MySQL type.'
            );
        }
        if ($autoIncrement && $nullable) {
            throw new \InvalidArgumentException(
                'AUTO_INCREMENT columns cannot be nullable.'
            );
        }
        if ($defaultValue !== null && !is_scalar($defaultValue)) {
            throw new \InvalidArgumentException(
                'Column default must be scalar or null.'
            );
        }

        $this->name = $name;
        $this->type = $type;
        $this->nullable = $nullable;
        $this->autoIncrement = $autoIncrement;
        $this->hasDefault = $hasDefault;
        $this->defaultValue = $defaultValue;
    }

    public function name(): string { return $this->name; }
    public function type(): string { return $this->type; }
    public function nullable(): bool { return $this->nullable; }
    public function autoIncrement(): bool { return $this->autoIncrement; }
    public function hasDefault(): bool { return $this->hasDefault; }
    /** @return mixed */
    public function defaultValue() { return $this->defaultValue; }

    public function equivalentTo(self $other): bool
    {
        if ($this->name !== $other->name
            || self::comparisonType($this->type)
                !== self::comparisonType($other->type)
            || $this->nullable !== $other->nullable
            || $this->autoIncrement !== $other->autoIncrement) {
            return false;
        }

        if (!$this->hasDefault && !$other->hasDefault) {
            return true;
        }
        if ($this->nullable
            && (($this->hasDefault
                    && $this->defaultValue === null
                    && !$other->hasDefault)
                || ($other->hasDefault
                    && $other->defaultValue === null
                    && !$this->hasDefault))) {
            return true;
        }

        return $this->hasDefault === $other->hasDefault
            && self::comparisonDefault($this->defaultValue)
                === self::comparisonDefault($other->defaultValue);
    }

    /** @param mixed $value */
    private static function comparisonDefault($value): ?string
    {
        if ($value === null) {
            return null;
        }
        $value = trim((string) $value);
        if (preg_match('/^current_timestamp(?:\(\d+\))?$/iD', $value)) {
            return strtoupper($value);
        }
        return $value;
    }

    private static function comparisonType(string $type): string
    {
        $type = self::normalizeType($type);
        return preg_replace(
            '/^(smallint|mediumint|int|integer|bigint)'
            . '\s*\(\s*\d+\s*\)(\s+unsigned)?$/D',
            '$1$2',
            $type
        ) ?? $type;
    }

    private static function normalizeType(string $type): string
    {
        $type = strtolower(trim($type));
        return preg_replace('/\s+/', ' ', $type) ?? $type;
    }

    private static function assertIdentifier(
        string $identifier,
        string $label
    ): void {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $identifier)) {
            throw new \InvalidArgumentException(
                'Invalid ' . $label . ' identifier.'
            );
        }
    }
}
