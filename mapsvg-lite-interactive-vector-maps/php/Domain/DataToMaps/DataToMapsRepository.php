<?php

namespace MapSVG;

use MapSVG\DataLayer\PlasmaProvider;
use MapSVG\DataLayer\Store\PluginTableStore;

/**
 * Junction table mapsvg*_data_to_maps: which maps are linked to a post Data
 * Source. Column query is reserved for initial-query UI.
 */
class DataToMapsRepository
{
    private PluginTableStore $store;

    public function __construct(?Database $db = null)
    {
        $adapter = (new PlasmaProvider(
            $db !== null ? $db->db : null
        ))->createAdapter();
        $this->store = new PluginTableStore('data_to_maps', $adapter);
    }

    public function tableExists(): bool
    {
        return $this->store->exists();
    }

    public function upsert(
        int $schemaId,
        int $mapId,
        ?string $query = null
    ): void {
        if ($schemaId <= 0 || $mapId <= 0 || !$this->tableExists()) {
            return;
        }

        $where = array(
            'schemaId' => $schemaId,
            'mapId' => $mapId,
        );
        $existing = $this->store->findOne($where);
        if ($existing !== null) {
            if ($query !== null) {
                $this->store->update(array('query' => $query), $where);
            }
            return;
        }

        $this->store->insert(array(
            'schemaId' => $schemaId,
            'mapId' => $mapId,
            'query' => $query,
        ));
    }

    public function setMapSchema(int $mapId, int $schemaId): void
    {
        if ($mapId <= 0 || !$this->tableExists()) {
            return;
        }

        $this->deleteByMapId($mapId);
        if ($schemaId > 0) {
            $this->upsert($schemaId, $mapId, null);
        }
    }

    public function deleteBySchemaAndMap(
        int $schemaId,
        int $mapId
    ): void {
        if (!$this->tableExists()) {
            return;
        }
        $this->store->delete(array(
            'schemaId' => $schemaId,
            'mapId' => $mapId,
        ));
    }

    public function deleteBySchemaId(int $schemaId): void
    {
        if ($schemaId <= 0 || !$this->tableExists()) {
            return;
        }
        $this->store->delete(array('schemaId' => $schemaId));
    }

    public function deleteByMapId(int $mapId): void
    {
        if ($mapId <= 0 || !$this->tableExists()) {
            return;
        }
        $this->store->delete(array('mapId' => $mapId));
    }

    /** @return int[] */
    public function findMapIdsBySchemaId(int $schemaId): array
    {
        if ($schemaId <= 0 || !$this->tableExists()) {
            return array();
        }

        $table = $this->store->quotedTable();
        $rows = $this->store->query(
            $this->store->prepared(
                'SELECT `mapId` FROM ' . $table
                . ' WHERE `schemaId` = %d',
                $schemaId
            )
        );

        return array_map(
            static function (array $row): int {
                return (int) $row['mapId'];
            },
            $rows
        );
    }
}
