<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Repository;

use MapSVG\DataLayer\Mapping\RecordMapper;
use MapSVG\DataLayer\Store\CrudStore;

/** Domain-object CRUD facade over a pure mapper and physical-row store. */
class MappedCrudRepository implements CrudRepository
{
    private RecordMapper $mapper;
    private CrudStore $store;

    /** @var callable(array<string, mixed>): object */
    private $objectFactory;

    public function __construct(
        RecordMapper $mapper,
        CrudStore $store,
        callable $objectFactory
    ) {
        $this->mapper = $mapper;
        $this->store = $store;
        $this->objectFactory = $objectFactory;
    }

    public function findById($id)
    {
        return $this->findOne(array('id' => $id));
    }

    public function findOne(array $where)
    {
        $row = $this->store->findOne($this->mapper->toStorageCriteria($where));
        if ($row === null) {
            return null;
        }
        $data = $this->mapper->fromStorage($row);
        return $data === null ? null : $this->newObject($data);
    }

    public function create($record)
    {
        $object = $this->objectForWrite($record);
        $storage = $this->mapper->toStorage($object);
        $created = $this->store->create($storage);
        $primaryKey = $this->mapper->storagePrimaryKey();
        $publicCreated = $this->mapper->fromStorage($created);
        $id = $publicCreated['id'] ?? ($storage[$primaryKey] ?? null);

        if ($id !== null) {
            if (method_exists($object, 'setId')) {
                $object->setId($id);
            } else {
                $object->id = $id;
            }
        }
        return $object;
    }

    public function update($record)
    {
        $object = $this->objectForWrite($record);
        $storage = $this->mapper->toStorage($object);
        $primaryKey = $this->mapper->storagePrimaryKey();
        if (!array_key_exists($primaryKey, $storage) || $storage[$primaryKey] === null) {
            throw new \InvalidArgumentException('An update requires a primary-key value.');
        }

        $where = array($primaryKey => $storage[$primaryKey]);
        $this->store->update($storage, $where);
        return $object;
    }

    public function delete($id): int
    {
        $where = $this->mapper->toStorageCriteria(array('id' => $id));
        return $this->store->delete($where);
    }

    public function mapper(): RecordMapper
    {
        return $this->mapper;
    }

    public function store(): CrudStore
    {
        return $this->store;
    }

    /** @param array<string, mixed>|object $record @return object */
    private function objectForWrite($record)
    {
        if (is_object($record) && method_exists($record, 'getData')) {
            return $record;
        }
        if (is_object($record)) {
            return $this->newObject(get_object_vars($record));
        }
        if (is_array($record)) {
            return $this->newObject($record);
        }
        throw new \InvalidArgumentException('A repository record must be an array or object.');
    }

    /** @param array<string, mixed> $data @return object */
    private function newObject(array $data)
    {
        $object = call_user_func($this->objectFactory, $data);
        if (!is_object($object)) {
            throw new \RuntimeException('Mapped repository object factory must return an object.');
        }
        return $object;
    }
}
