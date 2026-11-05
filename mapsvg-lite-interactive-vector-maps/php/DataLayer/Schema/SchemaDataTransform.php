<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

/** One idempotent data rewrite required by an explicit schema edit. */
final class SchemaDataTransform
{
    public const UPDATE_CHOICE_TEXT = 'update_choice_text';
    public const REPLACE_MULTI_LABEL = 'replace_multi_label';
    public const CLEAR_COLUMN = 'clear_column';

    private string $type;
    private string $field;
    private ?string $sidecar;
    /** @var mixed */
    private $value;
    private ?string $fromLabel;
    private ?string $toLabel;

    /** @param mixed $value */
    private function __construct(
        string $type,
        string $field,
        ?string $sidecar = null,
        $value = null,
        ?string $fromLabel = null,
        ?string $toLabel = null
    ) {
        self::assertIdentifier($field);
        if ($sidecar !== null) self::assertIdentifier($sidecar);
        $this->type = $type;
        $this->field = $field;
        $this->sidecar = $sidecar;
        $this->value = $value;
        $this->fromLabel = $fromLabel;
        $this->toLabel = $toLabel;
    }

    /** @param mixed $value */
    public static function updateChoiceText(
        string $field,
        string $sidecar,
        $value,
        string $label
    ): self {
        if (!is_scalar($value) || is_bool($value)) {
            throw new \InvalidArgumentException(
                'Choice values must be strings or numbers.'
            );
        }
        return new self(
            self::UPDATE_CHOICE_TEXT,
            $field,
            $sidecar,
            $value,
            null,
            $label
        );
    }

    public static function replaceMultiLabel(
        string $field,
        string $fromLabel,
        string $toLabel
    ): self {
        return new self(
            self::REPLACE_MULTI_LABEL,
            $field,
            null,
            null,
            $fromLabel,
            $toLabel
        );
    }

    public static function clearColumn(string $field): self
    {
        return new self(self::CLEAR_COLUMN, $field);
    }

    public function type(): string { return $this->type; }
    public function field(): string { return $this->field; }
    public function sidecar(): ?string { return $this->sidecar; }
    /** @return mixed */
    public function value() { return $this->value; }
    public function fromLabel(): ?string { return $this->fromLabel; }
    public function toLabel(): ?string { return $this->toLabel; }

    private static function assertIdentifier(string $identifier): void
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $identifier)) {
            throw new \InvalidArgumentException(
                'Invalid transform column identifier.'
            );
        }
    }
}
