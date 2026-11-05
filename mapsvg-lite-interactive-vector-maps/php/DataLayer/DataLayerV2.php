<?php

declare(strict_types=1);

namespace MapSVG\DataLayer;

use MapSVG\Schema;
use Plasma\Model;
use Plasma\Plasma;

/** Production-default v2 persistence composition root. */
final class DataLayerV2
{
    private PlasmaProvider $provider;
    private StorageSchemaResolver $resolver;
    private StorageModelRegistry $registry;

    public function __construct(
        PlasmaProvider $provider,
        StorageSchemaResolver $resolver,
        StorageModelRegistry $registry
    ) {
        $this->provider = $provider;
        $this->resolver = $resolver;
        $this->registry = $registry;
    }

    public function client(): Plasma
    {
        return $this->registry->client();
    }

    public function modelForSchema(Schema $schema): Model
    {
        return $this->registry->modelFor($schema);
    }

    public function resolveSchema(Schema $schema): StorageSchemaResolution
    {
        return $this->registry->resolutionFor($schema);
    }

    public function refreshSchema(Schema $schema): StorageSchemaResolution
    {
        return $this->registry->refresh($schema);
    }

    public function invalidateSchema(?string $logicalTable = null): void
    {
        $this->registry->invalidate($logicalTable);
    }

    public function registry(): StorageModelRegistry
    {
        return $this->registry;
    }

    public function resolver(): StorageSchemaResolver
    {
        return $this->resolver;
    }

    public function provider(): PlasmaProvider
    {
        return $this->provider;
    }
}
