<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** Validated public-to-storage field binding for query planning. */
final class ResolvedQueryField
{
    private string $publicName;
    private string $storageName;
    private object $schemaField;
    private string $type;
    private bool $multiselect;

    public function __construct(
        string $publicName,
        string $storageName,
        object $schemaField,
        string $type,
        bool $multiselect
    ) {
        $this->publicName = $publicName;
        $this->storageName = $storageName;
        $this->schemaField = $schemaField;
        $this->type = strtolower($type);
        $this->multiselect = $multiselect;
    }

    public function publicName(): string
    {
        return $this->publicName;
    }

    public function storageName(): string
    {
        return $this->storageName;
    }

    public function schemaField(): object
    {
        return $this->schemaField;
    }

    public function type(): string
    {
        return $this->type;
    }

    public function isMultiselect(): bool
    {
        return $this->multiselect;
    }

    public function isLocation(): bool
    {
        return $this->type === 'location';
    }

    public function isRelation(): bool
    {
        return in_array($this->type, array('region', 'regions', 'relation'), true);
    }

    public function isPost(): bool
    {
        return $this->type === 'post';
    }
}
