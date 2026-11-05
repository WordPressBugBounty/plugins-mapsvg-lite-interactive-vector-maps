<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\Schema;
use Plasma\Adapter\DatabaseAdapter;

final class SchemaCatalogUsageService
{
    private DatabaseAdapter $adapter;
    private string $physicalTable;
    private string $primaryKey;

    public function __construct(
        DataLayerV2 $dataLayer,
        Schema $catalogSchema
    ) {
        $resolution = $dataLayer->resolveSchema($catalogSchema);
        foreach (array(
            $resolution->primaryKey(),
            'postType',
        ) as $column) {
            if (!array_key_exists(
                $column,
                $resolution->actualColumns()
            )) {
                throw new \UnexpectedValueException(
                    'Schema catalog usage column is missing: ' . $column
                );
            }
        }

        $this->adapter = $dataLayer->client()->getAdapter();
        $this->physicalTable = $resolution->physicalTable();
        $this->primaryKey = $resolution->primaryKey();
    }

    public function postTypeUsedElsewhere(
        string $postType,
        int $excludeId
    ): bool {
        if ($postType === '') {
            return false;
        }

        $sql = 'SELECT COUNT(*) FROM '
            . self::quoteIdentifier($this->physicalTable)
            . ' WHERE postType = %s AND '
            . self::quoteIdentifier($this->primaryKey)
            . ' != %d';

        return (int) $this->adapter->getVar(
            $this->adapter->prepare(
                $sql,
                $postType,
                $excludeId
            )
        ) > 0;
    }

    private static function quoteIdentifier(string $identifier): string
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $identifier)) {
            throw new \InvalidArgumentException(
                'Invalid schema catalog SQL identifier.'
            );
        }
        return chr(96) . $identifier . chr(96);
    }
}
