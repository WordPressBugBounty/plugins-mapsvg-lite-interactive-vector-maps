<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\SavedQuery;

use MapSVG\Schema;
use MapSVG\Shared\QueryRpc\BuiltinQueryNames;

/** Shared by explicit Map creation and v9 migration; never invoked by Map reads. */
final class DefaultCollectionQuery
{
    private SavedQueryStore $store;

    public function __construct(SavedQueryStore $store)
    {
        $this->store = $store;
    }

    public function create(Schema $schema, array &$createdFolderIds): array
    {
        $folderId = $this->folderId($schema, $createdFolderIds);
        $base = self::baseName($schema);
        for ($attempt = 0; $attempt < 3; $attempt++) {
            // Match the installation's case-insensitive unique name constraint.
            $names = array_fill_keys(array_map('strtolower', array_column($this->store->queries(), 'name')), true);
            $name = $base;
            for ($suffix = 2; isset($names[strtolower($name)]) || BuiltinQueryNames::isReserved($name); $suffix++) {
                $name = substr($base, 0, 120 - strlen((string) $suffix)) . $suffix;
            }
            try {
                return $this->store->createQuery(array(
                    'name' => $name,
                    'schemaId' => (int) $schema->id,
                    'folderId' => $folderId,
                    'builder' => array('combinator' => 'and', 'rules' => array()),
                    'input' => array('where' => new \stdClass()),
                ));
            } catch (\DomainException $error) {
                // Retry only a confirmed concurrent name collision, not a storage failure.
                $current = array_map('strtolower', array_column($this->store->queries(), 'name'));
                if ($attempt === 2 || !in_array(strtolower($name), $current, true)) throw $error;
            }
        }
        throw new \RuntimeException('Could not allocate a default Query name.');
    }

    public static function baseName(Schema $schema): string
    {
        $parts = preg_split('/[^a-zA-Z0-9]+/', $schema->name, -1, PREG_SPLIT_NO_EMPTY);
        return substr('get' . implode('', array_map('ucfirst', $parts)), 0, 120);
    }

    public function folderId(Schema $schema, array &$createdFolderIds): int
    {
        $folderId = null;
        foreach ($this->store->folders() as $folder) {
            if ($folder['title'] === $schema->name) {
                $folderId = $folder['id'];
                break;
            }
        }
        if ($folderId === null) {
            $folder = $this->store->createFolder($schema->name);
            $folderId = $folder['id'];
            $createdFolderIds[] = $folderId;
        }

        return $folderId;
    }
}
