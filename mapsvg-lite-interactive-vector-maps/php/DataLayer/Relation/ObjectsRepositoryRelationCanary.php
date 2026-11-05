<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

/** Explicit compatibility bridge from prepared object rows to atomic writes. */
final class ObjectsRepositoryRelationCanary
{
    private ObjectRelationWriteService $writes;
    private RegionRelationNormalizer $normalizer;
    private ObjectRowWriteStore $rows;
    private bool $resetAutoIncrement;
    private ?ObjectWritePreparer $preparer;
    /** @var string[] */
    private array $preparationErrorCodes = array();

    public function __construct(
        ObjectRelationWriteService $writes,
        RegionRelationNormalizer $normalizer,
        ObjectRowWriteStore $rows,
        bool $resetAutoIncrement = false,
        ?ObjectWritePreparer $preparer = null
    ) {
        $this->writes = $writes;
        $this->normalizer = $normalizer;
        $this->rows = $rows;
        $this->resetAutoIncrement = $resetAutoIncrement;
        $this->preparer = $preparer;
    }

    /**
     * Factory canaries prepare the row here before the transaction; manually
     * constructed canaries may still pass already-prepared storage.
     *
     * @param object $object
     * @param array<string,mixed>|null $storage
     * @return object
     */
    public function create($object, ?array $storage = null)
    {
        $storage = $this->preparedStorage($object, $storage);
        $links = $this->normalizer->linksFromRecord($object);
        $createdId = null;
        $record = $this->writes->create(function () use (
            $object,
            $storage,
            $links,
            &$createdId
        ): ObjectRelationWriteResult {
            $created = $this->rows->create($storage);
            $createdId = $this->rows->primaryKeyValue(
                $created,
                $storage
            );
            return ObjectRelationWriteResult::replace(
                $object,
                $createdId,
                $links
            );
        });

        if ($createdId === null) {
            throw new \LogicException(
                'Committed object create returned no primary key.'
            );
        }
        self::setObjectId($record, $createdId);
        return $record;
    }

    /**
     * Legacy compatibility deliberately maps omitted relations to empty.
     *
     * @param object $object
     * @param array<string,mixed>|null $storage
     * @return object
     */
    public function update($object, ?array $storage = null)
    {
        $storage = $this->preparedStorage($object, $storage);
        $objectId = $this->rows->primaryKeyValue($storage);
        $links = $this->normalizer->hasRelationInput($object)
            ? $this->normalizer->linksFromRecord($object)
            : array();
        return $this->writes->update(function () use (
            $object,
            $storage,
            $objectId,
            $links
        ): ObjectRelationWriteResult {
            $this->rows->update($storage);
            return ObjectRelationWriteResult::replace(
                $object,
                $objectId,
                $links
            );
        });
    }

    /** @param int|string $objectId */
    public function delete($objectId): int
    {
        $this->preparationErrorCodes = array();
        return (int) $this->writes->delete(
            $objectId,
            function () use ($objectId): int {
                return $this->rows->delete($objectId);
            }
        );
    }

    public function clear(): int
    {
        $this->preparationErrorCodes = array();
        $result = (int) $this->writes->clear(function (): int {
            return $this->rows->clear();
        });

        if ($this->resetAutoIncrement) {
            $this->rows->resetAutoIncrement();
        }
        return $result;
    }


    public function preparesWrites(): bool
    {
        return $this->preparer !== null;
    }

    /** @return string[] */
    public function preparationErrorCodes(): array
    {
        return $this->preparationErrorCodes;
    }

    /** @param mixed $object @param array<string,mixed>|null $storage */
    private function preparedStorage($object, ?array $storage): array
    {
        $this->preparationErrorCodes = array();
        if ($this->preparer !== null) {
            $prepared = $this->preparer->prepare($object);
            $this->preparationErrorCodes = $prepared->geocodingErrorCodes();
            return $prepared->storage();
        }
        if ($storage === null) {
            throw new \InvalidArgumentException(
                'Relation canary requires prepared object storage.'
            );
        }
        return $storage;
    }

    /** @param mixed $record */
    private static function setObjectId($record, string $id): void
    {
        if (!is_object($record)) {
            throw new \UnexpectedValueException(
                'Object write result must be a domain object.'
            );
        }
        if (method_exists($record, 'setId')) {
            $record->setId($id);
            return;
        }
        $record->id = $id;
    }
}
