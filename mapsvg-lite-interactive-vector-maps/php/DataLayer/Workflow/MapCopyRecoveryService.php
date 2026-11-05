<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Workflow;

use MapSVG\DataLayer\Relation\RegionRelationStore;
use MapSVG\DataLayer\Repository\SchemaCatalogV2Repository;
use MapSVG\DataLayer\Schema\SchemaMutationService;
use MapSVG\Schema;

/**
 * Destructive compensation used only for artifacts created by one failed
 * map-copy attempt. It intentionally bypasses user-facing region deletion
 * guards because target names are deterministic and newly allocated.
 */
final class MapCopyRecoveryService
{
    private SchemaCatalogV2Repository $catalog;
    private SchemaMutationService $mutations;
    private RegionRelationStore $relations;

    public function __construct(
        SchemaCatalogV2Repository $catalog,
        SchemaMutationService $mutations,
        RegionRelationStore $relations
    ) {
        $this->catalog = $catalog;
        $this->mutations = $mutations;
        $this->relations = $relations;
    }

    public function cleanupSchemas(
        string $objectsTable,
        string $regionsTable
    ): void {
        self::assertIdentifier($objectsTable, 'objects table');
        self::assertIdentifier($regionsTable, 'regions table');

        // Object cleanup first removes any shared-r2o rows for the new scope.
        $this->deleteSchemaIfPresent($objectsTable, true);
        $this->deleteSchemaIfPresent($regionsTable, false);
    }

    private function deleteSchemaIfPresent(
        string $name,
        bool $cleanupRelations
    ): void {
        $schema = $this->catalog->findByName($name);
        if (!$schema instanceof Schema) {
            // DDL can succeed before catalog persistence fails. Because
            // MapCopyService preflights target ownership before starting,
            // a table with this deterministic target name still belongs to
            // the failed copy attempt and is safe to drop.
            $this->mutations->tableManager()->drop($name);
            if ($cleanupRelations) {
                $this->relations->deleteForObjectsTable($name);
            }
            return;
        }
        if (!isset($schema->id)) {
            throw new \UnexpectedValueException(
                'Map-copy recovery schema has no catalog ID: ' . $name
            );
        }

        $catalog = $this->catalog;
        $relations = $this->relations;
        $cleanup = $cleanupRelations
            ? static function (Schema $schema) use ($relations): void {
                $relations->deleteForObjectsTable((string) $schema->name);
            }
            : null;

        $this->mutations->delete(
            $schema,
            static function (Schema $schema) use ($catalog): int {
                return $catalog->delete($schema->id);
            },
            $cleanup
        );
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
