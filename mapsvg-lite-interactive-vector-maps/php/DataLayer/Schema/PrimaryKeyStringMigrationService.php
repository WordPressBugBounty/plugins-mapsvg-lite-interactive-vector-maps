<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\Schema;
use Plasma\Adapter\DatabaseAdapter;

/**
 * Specialized DDL migration for CSV imports that require string IDs.
 *
 * The physical mutation is explicit and non-transactional. Metadata is
 * published separately by SchemaRepository only after this step succeeds.
 */
final class PrimaryKeyStringMigrationService
{
    private DatabaseAdapter $adapter;
    private AdapterPhysicalTableInspector $inspector;

    public function __construct(DataLayerV2 $dataLayer)
    {
        $this->adapter = $dataLayer->client()->getAdapter();
        $this->inspector = new AdapterPhysicalTableInspector(
            $this->adapter,
            $dataLayer->provider()->physicalPrefix()
        );
    }

    /**
     * Returns true when physical storage changed, false when it was already
     * varchar-compatible.
     */
    public function migrate(Schema $schema): bool
    {
        if ($schema->isRemote()) {
            throw new \InvalidArgumentException(
                'Remote schemas cannot migrate local primary keys.'
            );
        }

        $logicalTable = trim((string) $schema->getName());
        if ($logicalTable === '') {
            throw new \InvalidArgumentException(
                'Primary-key migration requires a schema table name.'
            );
        }

        $primaryKey = (string) $schema->getPrimaryKeyFieldName();
        self::assertIdentifier($primaryKey, 'primary key');

        $table = $this->inspector->inspect($logicalTable);
        if ($table === null) {
            throw new \OutOfBoundsException(
                'Primary-key migration table not found: ' . $logicalTable
            );
        }

        $column = $table->column($primaryKey);
        if ($column === null) {
            throw new \OutOfBoundsException(
                'Primary key column not found.'
            );
        }

        if (strpos(strtolower($column->type()), 'varchar') === 0) {
            return false;
        }

        $this->adapter->execute(
            'ALTER TABLE ' . self::quoteIdentifier($table->physicalName())
            . ' MODIFY COLUMN ' . self::quoteIdentifier($primaryKey)
            . ' VARCHAR(255) NOT NULL'
        );

        $after = $this->inspector->inspect($logicalTable);
        $migrated = $after === null ? null : $after->column($primaryKey);
        if ($migrated === null
            || strpos(strtolower($migrated->type()), 'varchar') !== 0
            || $migrated->autoIncrement()) {
            throw new \RuntimeException(
                'Primary-key migration did not produce the expected storage.'
            );
        }

        return true;
    }

    private static function quoteIdentifier(string $identifier): string
    {
        self::assertIdentifier($identifier, 'SQL');
        return chr(96) . $identifier . chr(96);
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
