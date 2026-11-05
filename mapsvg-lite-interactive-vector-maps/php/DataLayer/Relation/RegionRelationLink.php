<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

/** One normalized object-to-region target stored in the shared r2o table. */
final class RegionRelationLink
{
    private string $regionsTable;
    private string $regionId;

    /** @param int|string $regionId */
    public function __construct(string $regionsTable, $regionId)
    {
        $regionsTable = trim($regionsTable);
        if (!self::isIdentifier($regionsTable)) {
            throw new \InvalidArgumentException(
                'Region relation table must be a safe short table name.'
            );
        }
        if (!is_int($regionId) && !is_string($regionId)) {
            throw new \InvalidArgumentException(
                'Region relation ID must be a string or integer.'
            );
        }

        $regionId = (string) $regionId;
        if ($regionId === '') {
            throw new \InvalidArgumentException(
                'Region relation ID must not be empty.'
            );
        }

        $this->regionsTable = $regionsTable;
        $this->regionId = $regionId;
    }

    public function regionsTable(): string
    {
        return $this->regionsTable;
    }

    public function regionId(): string
    {
        return $this->regionId;
    }

    public function identity(): string
    {
        return $this->regionsTable . "\0" . $this->regionId;
    }

    /** @return array{regions_table:string,region_id:string} */
    public function toStorageTarget(): array
    {
        return array(
            'regions_table' => $this->regionsTable,
            'region_id' => $this->regionId,
        );
    }

    private static function isIdentifier(string $value): bool
    {
        return (bool) preg_match(
            '/^[A-Za-z_][A-Za-z0-9_]*$/D',
            $value
        );
    }
}
