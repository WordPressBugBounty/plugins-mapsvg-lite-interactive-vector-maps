<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Import;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\Schema;

/** Explicit composition root for one schema's live-table bulk writer. */
final class PlasmaBulkWriterFactory
{
    public static function forSchema(
        DataLayerV2 $dataLayer,
        Schema $schema
    ): PlasmaBulkWriter {
        return self::forTable(
            $dataLayer,
            $schema,
            (string) $schema->getName()
        );
    }

    public static function forTable(
        DataLayerV2 $dataLayer,
        Schema $schema,
        string $logicalTable
    ): PlasmaBulkWriter {
        if ($schema->isRemote()) {
            throw new \InvalidArgumentException(
                'Remote schemas cannot use local Plasma bulk writes.'
            );
        }
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $logicalTable)) {
            throw new \InvalidArgumentException(
                'Bulk target table must be a safe logical identifier.'
            );
        }

        $targetSchema = new Schema($schema->getData());
        $targetSchema->setName($logicalTable);
        $resolution = $dataLayer->resolveSchema($targetSchema);

        return new PlasmaBulkWriter(
            $dataLayer->client(),
            $dataLayer->modelForSchema($targetSchema),
            array($resolution->primaryKey())
        );
    }

    private function __construct()
    {
    }
}
