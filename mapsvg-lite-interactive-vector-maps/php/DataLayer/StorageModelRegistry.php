<?php

declare(strict_types=1);

namespace MapSVG\DataLayer;

use MapSVG\Schema;
use Plasma\Model;
use Plasma\Plasma;

/** Strict registry of schema-backed MapSVG storage models. */
final class StorageModelRegistry
{
    private PlasmaProvider $provider;
    private StorageSchemaResolver $resolver;
    private Plasma $client;

    /** @var array<string, StorageSchemaResolution> */
    private array $resolutions = array();

    public function __construct(
        PlasmaProvider $provider,
        StorageSchemaResolver $resolver
    ) {
        $this->provider = $provider;
        $this->resolver = $resolver;
        $this->client = $provider->createClient();
    }

    public function client(): Plasma
    {
        return $this->client;
    }

    public function resolutionFor(Schema $schema): StorageSchemaResolution
    {
        $logicalTable = trim((string) $schema->getName());
        if (isset($this->resolutions[$logicalTable])) {
            return $this->resolutions[$logicalTable];
        }

        $resolution = $this->resolver->resolve($schema);
        $this->client->registerSchema($resolution->plasmaSchema());
        $this->resolutions[$logicalTable] = $resolution;
        return $resolution;
    }

    public function modelFor(Schema $schema): Model
    {
        $resolution = $this->resolutionFor($schema);
        return $this->client->model($resolution->modelKey());
    }

    public function modelBySchemaName(string $logicalTable): Model
    {
        if (!isset($this->resolutions[$logicalTable])) {
            throw new \OutOfBoundsException(
                'MapSVG storage schema is not registered: ' . $logicalTable
            );
        }

        return $this->client->model($this->resolutions[$logicalTable]->modelKey());
    }

    public function refresh(Schema $schema): StorageSchemaResolution
    {
        $logicalTable = trim((string) $schema->getName());
        $this->invalidate($logicalTable);
        return $this->resolutionFor($schema);
    }

    public function invalidate(?string $logicalTable = null): void
    {
        if ($logicalTable === null) {
            $this->resolutions = array();
            $this->client = $this->provider->createClient();
            return;
        }

        unset($this->resolutions[$logicalTable]);
        $this->rebuildClient();
    }

    /** @return string[] */
    public function registeredModelKeys(): array
    {
        return array_values(array_map(
            static function (StorageSchemaResolution $resolution): string {
                return $resolution->modelKey();
            },
            $this->resolutions
        ));
    }

    private function rebuildClient(): void
    {
        $this->client = $this->provider->createClient();
        foreach ($this->resolutions as $resolution) {
            $this->client->registerSchema($resolution->plasmaSchema());
        }
    }
}
