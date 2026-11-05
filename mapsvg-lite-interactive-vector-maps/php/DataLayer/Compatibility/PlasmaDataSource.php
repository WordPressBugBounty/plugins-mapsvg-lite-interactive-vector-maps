<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Compatibility;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\DataLayer\Import\PlasmaBulkWriter;
use MapSVG\DataLayer\Import\PlasmaBulkWriterFactory;
use MapSVG\DataLayer\Query\SimpleQueryService;
use MapSVG\DataLayer\Query\SimpleQueryServiceFactory;
use MapSVG\DataLayer\Store\PlasmaCrudStore;
use MapSVG\Query;
use MapSVG\Schema;

/**
 * Compatibility source for the legacy Repository public surface.
 *
 * It accepts/returns physical rows for single-record CRUD so existing
 * Repository encode/decode hooks remain authoritative, while list queries use
 * the v2 planner/executors and return the existing public collection envelope.
 */
final class PlasmaDataSource
{
    private Schema $schema;
    private DataLayerV2 $dataLayer;
    private ?PlasmaCrudStore $store = null;
    private ?SimpleQueryService $queries = null;
    private ?PlasmaBulkWriter $bulk = null;

    public function __construct(Schema $schema, DataLayerV2 $dataLayer)
    {
        if ($schema->isRemote()) {
            throw new \InvalidArgumentException(
                'Remote schemas cannot use the local Plasma data source.'
            );
        }
        $this->schema = $schema;
        $this->dataLayer = $dataLayer;
    }

    public function find($criteria)
    {
        $query = $criteria instanceof Query
            ? $criteria
            : new Query((array) $criteria);
        $result = $this->findPublic(
            $query,
            static function (array $row): array {
                return $row;
            }
        );
        return $result['items'];
    }

    /**
     * @param callable $objectFactory fn(array<string,mixed>): mixed
     * @return array<string,mixed>
     */
    public function findPublic(
        Query $query,
        callable $objectFactory
    ): array {
        return $this->queries()->findLegacy($query, $objectFactory);
    }

    public function findOne($criteria)
    {
        $where = $this->criteria((array) $criteria);
        if ($where === array()) {
            return null;
        }
        $row = $this->store()->findOne($where);
        return $row === null ? null : $this->legacyRawRow($row);
    }

    public function create($data)
    {
        return $this->legacyRawRow(
            $this->store()->create((array) $data)
        );
    }

    public function update($data, $criteria)
    {
        $where = $this->criteria((array) $criteria);
        if ($where === array()) {
            throw new \InvalidArgumentException(
                'A valid update criterion is required.'
            );
        }
        return $this->store()->update((array) $data, $where);
    }

    public function delete($criteria)
    {
        $where = $this->criteria((array) $criteria);
        if ($where === array()) {
            throw new \InvalidArgumentException(
                'A valid delete criterion is required.'
            );
        }
        return $this->store()->delete($where);
    }

    public function isUnique(array $criteria): bool
    {
        $where = $this->criteria($criteria, true);
        if ($where === array()) {
            return true;
        }
        return $this->dataLayer
            ->modelForSchema($this->schema)
            ->count(array('where' => $where)) === 0;
    }

    public function truncate(): int
    {
        return \MapSVG\DataLayer\Workflow\CollectionClearServiceFactory::forSchema(
            $this->dataLayer,
            $this->schema,
            false
        )->clear();
    }

    public function import($data, bool $upsert = true)
    {
        $rows = $this->legacyImportRows((array) $data);
        if ($rows === array()) {
            return $data;
        }

        $primaryKey = $this->dataLayer
            ->resolveSchema($this->schema)
            ->primaryKey();
        $canUpsert = $upsert
            && array_key_exists($primaryKey, $rows[0]);

        if ($canUpsert) {
            $this->bulk()->upsertMany($rows);
        } else {
            $this->bulk()->insertMany($rows);
        }
        return $data;
    }

    public function getTableName(): string
    {
        return $this->dataLayer->resolveSchema($this->schema)->physicalTable();
    }

    public function dataLayer(): DataLayerV2
    {
        return $this->dataLayer;
    }

    private function store(): PlasmaCrudStore
    {
        if ($this->store === null) {
            $this->store = new PlasmaCrudStore(
                $this->dataLayer->modelForSchema($this->schema)
            );
        }
        return $this->store;
    }

    private function queries(): SimpleQueryService
    {
        if ($this->queries === null) {
            $this->queries = SimpleQueryServiceFactory::forSchema(
                $this->dataLayer,
                $this->schema
            );
        }
        return $this->queries;
    }

    private function bulk(): PlasmaBulkWriter
    {
        if ($this->bulk === null) {
            $this->bulk = PlasmaBulkWriterFactory::forSchema(
                $this->dataLayer,
                $this->schema
            );
        }
        return $this->bulk;
    }

    /**
     * @param array<string,mixed> $criteria
     * @return array<string,mixed>
     */
    private function criteria(
        array $criteria,
        bool $allowActualColumns = false
    ): array {
        $actual = $allowActualColumns
            ? $this->dataLayer->resolveSchema($this->schema)->actualColumns()
            : array();
        $where = array();

        foreach ($criteria as $name => $value) {
            if (!is_string($name)
                || !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $name)) {
                continue;
            }
            if (!$this->schema->getField($name)
                && !array_key_exists($name, $actual)) {
                continue;
            }
            if (is_array($value) || is_object($value)) {
                throw new \InvalidArgumentException(
                    'Single-record criteria must be scalar or null.'
                );
            }
            $where[$name] = $value;
        }

        return $where;
    }

    /**
     * Plasma hydrates storage scalars to typed PHP values; wpdb ARRAY_A
     * historically exposed ordinary numeric columns as strings. Repository
     * decodeParams() still owns the public-domain conversion, so restore the
     * legacy raw storage shape before handing single rows back to it.
     *
     * @param array<string,mixed> $row
     * @return array<string,mixed>
     */
    private function legacyRawRow(array $row): array
    {
        $normalized = array();
        foreach ($row as $name => $value) {
            if ($value === null || is_string($value)) {
                $normalized[$name] = $value;
            } elseif (is_bool($value)) {
                $normalized[$name] = $value ? '1' : '0';
            } elseif (is_int($value) || is_float($value)) {
                $normalized[$name] = (string) $value;
            } elseif (is_array($value) || is_object($value)) {
                $normalized[$name] = json_encode(
                    $value,
                    JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
                );
            } else {
                throw new \UnexpectedValueException(
                    'Unsupported Plasma storage value for legacy hydration.'
                );
            }
        }
        return $normalized;
    }

    /**
     * @param array<int,mixed> $rows
     * @return array<int,array<string,mixed>>
     */
    private function legacyImportRows(array $rows): array
    {
        if ($rows === array()) {
            return array();
        }
        if (!isset($rows[0]) || !is_array($rows[0]) || $rows[0] === array()) {
            throw new \InvalidArgumentException(
                'Import data must start with a non-empty row array.'
            );
        }

        $keys = array_keys($rows[0]);
        $normalized = array();
        foreach ($rows as $row) {
            if (!is_array($row)) {
                throw new \InvalidArgumentException(
                    'Every import row must be an array.'
                );
            }
            $item = array();
            foreach ($keys as $key) {
                $item[$key] = array_key_exists($key, $row)
                    ? $row[$key]
                    : null;
            }
            $normalized[] = $item;
        }
        return $normalized;
    }
}
