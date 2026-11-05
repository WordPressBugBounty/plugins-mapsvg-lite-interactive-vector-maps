<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Post;

use MapSVG\DataLayer\Mapping\SchemaRecordMapper;

/** Adds WordPress post enrichment after pure physical-row mapping. */
final class PostEnrichedRecordHydrator implements RecordHydrator
{
    private SchemaRecordMapper $mapper;
    private ?PostEnricher $posts;
    private ?string $postFieldName;

    /** @var callable */
    private $objectFactory;

    public function __construct(
        SchemaRecordMapper $mapper,
        callable $objectFactory,
        ?PostEnricher $posts = null,
        ?string $postFieldName = null
    ) {
        if ($postFieldName !== null
            && !preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $postFieldName)) {
            throw new \InvalidArgumentException(
                'Post field name must be a safe identifier.'
            );
        }
        if (($posts === null) !== ($postFieldName === null)) {
            throw new \InvalidArgumentException(
                'Post enricher and post field name must be configured together.'
            );
        }

        $this->mapper = $mapper;
        $this->objectFactory = $objectFactory;
        $this->posts = $posts;
        $this->postFieldName = $postFieldName;
    }

    public function hydrate(array $row)
    {
        $data = $this->mapper->fromStorage($row);
        if ($data === null) {
            return null;
        }

        if ($this->posts !== null
            && $this->postFieldName !== null
            && array_key_exists($this->postFieldName, $data)) {
            $data[$this->postFieldName] = $this->posts->enrich(
                $data[$this->postFieldName]
            );
        }

        return $this->newObject($data);
    }

    public function hydrateMany(array $rows): array
    {
        $mapped = array();
        $postIndexes = array();
        $postIds = array();

        foreach ($rows as $index => $row) {
            if (!is_array($row)) {
                throw new \InvalidArgumentException(
                    'Hydration rows must be arrays.'
                );
            }
            $data = $this->mapper->fromStorage($row);
            $mapped[$index] = $data;

            if ($data !== null
                && $this->posts !== null
                && $this->postFieldName !== null
                && array_key_exists($this->postFieldName, $data)) {
                $postIndexes[] = $index;
                $postIds[] = $data[$this->postFieldName];
            }
        }

        if ($postIds !== array()) {
            $enriched = $this->posts->enrichMany($postIds);
            foreach ($postIndexes as $offset => $index) {
                $mapped[$index][$this->postFieldName] = $enriched[$offset];
            }
        }

        $objects = array();
        foreach ($mapped as $index => $data) {
            $objects[$index] = $data === null
                ? null
                : $this->newObject($data);
        }
        return array_values($objects);
    }

    /** @param array<string,mixed> $data */
    private function newObject(array $data): object
    {
        $object = call_user_func($this->objectFactory, $data);
        if (!is_object($object)) {
            throw new \UnexpectedValueException(
                'Record hydrator object factory must return an object.'
            );
        }
        return $object;
    }
}
