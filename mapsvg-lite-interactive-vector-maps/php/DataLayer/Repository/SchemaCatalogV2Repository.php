<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Repository;

use MapSVG\DataLayer\Schema\SchemaCatalogRecordMapper;
use MapSVG\DataLayer\StorageModelRegistry;
use MapSVG\DataLayer\Store\PlasmaCrudStore;
use MapSVG\Schema;

/** Normal Plasma CRUD for the schema metadata catalog. */
final class SchemaCatalogV2Repository extends MappedCrudRepository
{
    private Schema $catalogSchema;

    public function __construct(
        Schema $catalogSchema,
        StorageModelRegistry $registry
    ) {
        $this->catalogSchema = $catalogSchema;
        $resolution = $registry->resolutionFor($catalogSchema);
        $mapper = new SchemaCatalogRecordMapper(
            $catalogSchema,
            $resolution
        );
        $store = new PlasmaCrudStore($registry->modelFor($catalogSchema));

        parent::__construct(
            $mapper,
            $store,
            static function (array $data): Schema {
                return new Schema($data);
            }
        );
    }

    public function findByName(string $name): ?Schema
    {
        $schema = $this->findOne(array('name' => $name));
        return $schema instanceof Schema ? $schema : null;
    }

    public function getSchema(): Schema
    {
        return $this->catalogSchema;
    }
}
