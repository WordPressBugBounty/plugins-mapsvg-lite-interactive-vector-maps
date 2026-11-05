<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

use Plasma\Adapter\DatabaseAdapter;

/** Executes idempotent row transforms after physical DDL succeeds. */
final class SchemaDataTransformExecutor
{
    private DatabaseAdapter $adapter;

    public function __construct(DatabaseAdapter $adapter)
    {
        $this->adapter = $adapter;
    }

    /** @param SchemaDataTransform[] $transforms */
    public function execute(string $physicalTable, array $transforms): void
    {
        $table = self::quoteIdentifier($physicalTable);
        foreach ($transforms as $transform) {
            if (!$transform instanceof SchemaDataTransform) {
                throw new \InvalidArgumentException(
                    'Invalid schema data transform.'
                );
            }

            switch ($transform->type()) {
                case SchemaDataTransform::UPDATE_CHOICE_TEXT:
                    $this->updateChoiceText($table, $transform);
                    break;
                case SchemaDataTransform::REPLACE_MULTI_LABEL:
                    $this->replaceMultiLabel($table, $transform);
                    break;
                case SchemaDataTransform::CLEAR_COLUMN:
                    $this->clearColumn($table, $transform);
                    break;
                default:
                    throw new \InvalidArgumentException(
                        'Unsupported schema data transform.'
                    );
            }
        }
    }

    private function updateChoiceText(
        string $table,
        SchemaDataTransform $transform
    ): void {
        $sidecar = $transform->sidecar();
        $label = $transform->toLabel();
        if ($sidecar === null || $label === null) {
            throw new \LogicException(
                'Choice-text transform is incomplete.'
            );
        }
        $sql = 'UPDATE ' . $table
            . ' SET ' . self::quoteIdentifier($sidecar) . ' = %s'
            . ' WHERE ' . self::quoteIdentifier($transform->field())
            . ' = %s';
        $this->adapter->execute($this->adapter->prepare(
            $sql,
            $label,
            $transform->value()
        ));
    }

    private function replaceMultiLabel(
        string $table,
        SchemaDataTransform $transform
    ): void {
        $from = $transform->fromLabel();
        $to = $transform->toLabel();
        if ($from === null || $to === null) {
            throw new \LogicException(
                'Multiselect-label transform is incomplete.'
            );
        }
        $fromFragment = '"label":' . $this->jsonString($from);
        $toFragment = '"label":' . $this->jsonString($to);
        $column = self::quoteIdentifier($transform->field());
        $like = '%' . $this->adapter->escapeLike($fromFragment) . '%';
        $sql = 'UPDATE ' . $table
            . ' SET ' . $column . ' = REPLACE('
            . $column . ', %s, %s)'
            . ' WHERE ' . $column . ' LIKE %s';
        $this->adapter->execute($this->adapter->prepare(
            $sql,
            $fromFragment,
            $toFragment,
            $like
        ));
    }

    private function clearColumn(
        string $table,
        SchemaDataTransform $transform
    ): void {
        $sql = 'UPDATE ' . $table
            . ' SET ' . self::quoteIdentifier($transform->field())
            . ' = %s';
        $this->adapter->execute($this->adapter->prepare($sql, ''));
    }

    private function jsonString(string $value): string
    {
        $encoded = json_encode(
            $value,
            JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        );
        if (!is_string($encoded)) {
            throw new \RuntimeException('Could not encode a choice label.');
        }
        return $encoded;
    }

    private static function quoteIdentifier(string $identifier): string
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $identifier)) {
            throw new \InvalidArgumentException(
                'Invalid transform SQL identifier.'
            );
        }
        return '`' . $identifier . '`';
    }
}
