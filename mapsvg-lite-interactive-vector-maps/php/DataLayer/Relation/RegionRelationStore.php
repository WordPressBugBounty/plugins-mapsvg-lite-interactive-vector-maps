<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

/**
 * Persistence boundary for the shared global r2o junction table.
 *
 * Table arguments are trusted short MapSVG names such as objects_13 and
 * regions_13. Implementations add the active WordPress/MapSVG prefix.
 */
interface RegionRelationStore
{
    /**
     * @param int|string $objectId
     * @return RegionRelationLink[]
     */
    public function linksForObject(
        string $objectsTable,
        $objectId,
        ?string $regionsTable = null
    ): array;

    /**
     * Replace the complete relation set for one object.
     *
     * @param int|string $objectId
     * @param RegionRelationLink[] $links
     */
    public function replaceForObject(
        string $objectsTable,
        $objectId,
        array $links
    ): int;

    /**
     * Append bounded normalized rows for maintenance/import workflows.
     *
     * @param array<int,array{object_id:int|string,link:RegionRelationLink}> $rows
     */
    public function insertMany(string $objectsTable, array $rows): int;

    /** @param int|string $objectId */
    public function deleteForObject(string $objectsTable, $objectId): int;

    public function deleteForObjectsTable(string $objectsTable): int;

    /**
     * Delete matching region IDs across every object table using this
     * regions table. This preserves current orphan-cleanup semantics.
     *
     * @param array<int,int|string> $regionIds
     */
    public function deleteForRegionsTableIds(
        string $regionsTable,
        array $regionIds
    ): int;

    /**
     * Delete matching region IDs only inside one object/region table pair.
     *
     * @param array<int,int|string> $regionIds
     */
    public function deleteForPairRegionIds(
        string $objectsTable,
        string $regionsTable,
        array $regionIds
    ): int;

    /**
     * Copy one complete table pair for map-copy workflows.
     * Existing target rows must not be duplicated on retry.
     */
    public function copyPair(
        string $sourceObjectsTable,
        string $sourceRegionsTable,
        string $targetObjectsTable,
        string $targetRegionsTable
    ): int;
}
