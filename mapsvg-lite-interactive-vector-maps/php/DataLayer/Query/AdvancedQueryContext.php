<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

use MapSVG\DataLayer\StorageSchemaResolution;
use MapSVG\Schema;
use Plasma\Adapter\DatabaseAdapter;

/** Trusted server-owned metadata needed by advanced query extensions. */
final class AdvancedQueryContext
{
    private Schema $schema;
    private StorageSchemaResolution $resolution;
    private DatabaseAdapter $adapter;
    private QueryFieldResolver $fields;
    private QueryLimits $limits;
    private string $relationTable;
    private PostIdResolver $postResolver;

    public function __construct(
        Schema $schema,
        StorageSchemaResolution $resolution,
        DatabaseAdapter $adapter,
        QueryFieldResolver $fields,
        QueryLimits $limits,
        string $relationTable,
        PostIdResolver $postResolver
    ) {
        self::assertIdentifier($relationTable, 'relation table');
        $this->schema = $schema;
        $this->resolution = $resolution;
        $this->adapter = $adapter;
        $this->fields = $fields;
        $this->limits = $limits;
        $this->relationTable = $relationTable;
        $this->postResolver = $postResolver;
    }

    public function schema(): Schema
    {
        return $this->schema;
    }

    public function resolution(): StorageSchemaResolution
    {
        return $this->resolution;
    }

    public function adapter(): DatabaseAdapter
    {
        return $this->adapter;
    }

    public function fields(): QueryFieldResolver
    {
        return $this->fields;
    }

    public function limits(): QueryLimits
    {
        return $this->limits;
    }

    public function relationTable(): string
    {
        return $this->relationTable;
    }

    public function postResolver(): PostIdResolver
    {
        return $this->postResolver;
    }

    /** @return string[] */
    public function actualFields(): array
    {
        return array_keys($this->resolution->actualColumns());
    }

    public function hasPhysicalField(string $field): bool
    {
        self::assertIdentifier($field, 'physical field');
        return array_key_exists($field, $this->resolution->actualColumns());
    }

    public static function quoteIdentifier(string $identifier): string
    {
        self::assertIdentifier($identifier, 'SQL identifier');
        return '`' . $identifier . '`';
    }

    private static function assertIdentifier(string $identifier, string $label): void
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $identifier)) {
            throw new \InvalidArgumentException('Invalid ' . $label . '.');
        }
    }
}
