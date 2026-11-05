<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

use MapSVG\DataLayer\DataLayerV2;
use MapSVG\Schema;
use Plasma\Adapter\DatabaseAdapter;

/**
 * Validated persistence seam for background geocoding over one dynamic
 * customer collection.
 */
final class QueuedLocationStore
{
    private DatabaseAdapter $adapter;
    private string $logicalTable;
    private string $physicalTable;
    private string $primaryKey;

    public function __construct(DataLayerV2 $dataLayer, Schema $schema)
    {
        if ($schema->isRemote()) {
            throw new \InvalidArgumentException(
                'Remote schemas cannot use queued local geocoding.'
            );
        }

        $resolution = $dataLayer->resolveSchema($schema);
        $required = array(
            $resolution->primaryKey(),
            'location_lat',
            'location_lng',
            'location_address',
            'location_geocoding_status',
        );
        foreach ($required as $column) {
            if (!array_key_exists(
                $column,
                $resolution->actualColumns()
            )) {
                throw new \UnexpectedValueException(
                    'Queued geocoding column is missing from storage: '
                    . $column
                );
            }
        }

        $this->adapter = $dataLayer->client()->getAdapter();
        $this->logicalTable = $resolution->logicalTable();
        $this->physicalTable = $resolution->physicalTable();
        $this->primaryKey = $resolution->primaryKey();
    }

    public function countPending(
        bool $convertLatLngToAddress,
        bool $convertAddressToLatLng = true
    ): int {
        $statuses = self::statuses(
            $convertLatLngToAddress,
            $convertAddressToLatLng
        );
        if ($statuses === array()) {
            return 0;
        }

        return (int) $this->adapter->getVar(
            $this->adapter->prepare(
                'SELECT COUNT(*) FROM '
                . self::quoteIdentifier($this->physicalTable)
                . ' WHERE location_geocoding_status IN ('
                . implode(', ', array_fill(0, count($statuses), '%d'))
                . ')',
                ...$statuses
            )
        );
    }

    /**
     * @return array<int,array<string,mixed>>
     */
    public function pendingRows(
        bool $convertLatLngToAddress,
        bool $convertAddressToLatLng,
        int $limit
    ): array {
        if ($limit < 1 || $limit > 1000) {
            throw new \InvalidArgumentException(
                'Queued geocoding batch limit must be between 1 and 1000.'
            );
        }

        $statuses = self::statuses(
            $convertLatLngToAddress,
            $convertAddressToLatLng
        );
        if ($statuses === array()) {
            return array();
        }

        $sql = 'SELECT '
            . self::quoteIdentifier($this->primaryKey)
            . ' AS __mapsvg_pk,'
            . ' location_lat, location_lng, location_address,'
            . ' location_geocoding_status'
            . ' FROM ' . self::quoteIdentifier($this->physicalTable)
            . ' WHERE location_geocoding_status IN ('
            . implode(', ', array_fill(0, count($statuses), '%d'))
            . ') ORDER BY ' . self::quoteIdentifier($this->primaryKey)
            . ' ASC LIMIT %d';

        $params = $statuses;
        $params[] = $limit;

        return $this->adapter->query(
            $this->adapter->prepare($sql, ...$params)
        );
    }

    /**
     * @param int|string $id
     * @param array<string,mixed> $update
     */
    public function update($id, array $update): int
    {
        if ($update === array()) {
            return 0;
        }

        $allowed = array(
            'location_lat',
            'location_lng',
            'location_address',
            'location_geocoding_status',
        );
        foreach (array_keys($update) as $column) {
            if (!in_array($column, $allowed, true)) {
                throw new \InvalidArgumentException(
                    'Unsupported queued geocoding update column: '
                    . $column
                );
            }
        }

        return (int) $this->adapter->update(
            $this->logicalTable,
            $update,
            array($this->primaryKey => $id)
        );
    }

    /** @return int[] */
    private static function statuses(
        bool $convertLatLngToAddress,
        bool $convertAddressToLatLng
    ): array {
        $statuses = array();
        if ($convertAddressToLatLng) {
            $statuses[] = LocationStatus::FORWARD_CANDIDATE;
        }
        if ($convertLatLngToAddress) {
            $statuses[] = LocationStatus::REVERSE_CANDIDATE;
        }
        return $statuses;
    }

    private static function quoteIdentifier(string $identifier): string
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $identifier)) {
            throw new \InvalidArgumentException(
                'Invalid queued geocoding SQL identifier.'
            );
        }
        return chr(96) . $identifier . chr(96);
    }
}
