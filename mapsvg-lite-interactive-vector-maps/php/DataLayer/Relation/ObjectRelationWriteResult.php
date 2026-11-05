<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

/** Result of one object-row callback plus explicit relation intent. */
final class ObjectRelationWriteResult
{
    private const REPLACE = 'replace';
    private const KEEP = 'keep';

    /** @var mixed */
    private $record;
    private string $objectId;
    private string $relationMode;
    /** @var RegionRelationLink[] */
    private array $links;

    /**
     * @param mixed $record
     * @param int|string $objectId
     * @param RegionRelationLink[] $links
     */
    private function __construct(
        $record,
        $objectId,
        string $relationMode,
        array $links
    ) {
        if (!is_int($objectId) && !is_string($objectId)) {
            throw new \InvalidArgumentException(
                'Object write result ID must be a string or integer.'
            );
        }
        $objectId = (string) $objectId;
        if ($objectId === '') {
            throw new \InvalidArgumentException(
                'Object write result ID must not be empty.'
            );
        }
        if (!in_array($relationMode, array(self::REPLACE, self::KEEP), true)) {
            throw new \InvalidArgumentException('Invalid relation write mode.');
        }

        $normalized = array();
        foreach ($links as $link) {
            if (!$link instanceof RegionRelationLink) {
                throw new \InvalidArgumentException(
                    'Object write links must be RegionRelationLink values.'
                );
            }
            $normalized[$link->identity()] = $link;
        }

        $this->record = $record;
        $this->objectId = $objectId;
        $this->relationMode = $relationMode;
        $this->links = array_values($normalized);
    }

    /**
     * @param mixed $record
     * @param int|string $objectId
     * @param RegionRelationLink[] $links
     */
    public static function replace($record, $objectId, array $links): self
    {
        return new self($record, $objectId, self::REPLACE, $links);
    }

    /** @param mixed $record @param int|string $objectId */
    public static function keep($record, $objectId): self
    {
        return new self($record, $objectId, self::KEEP, array());
    }

    /** @return mixed */
    public function record()
    {
        return $this->record;
    }

    public function objectId(): string
    {
        return $this->objectId;
    }

    public function replacesRelations(): bool
    {
        return $this->relationMode === self::REPLACE;
    }

    /** @return RegionRelationLink[] */
    public function links(): array
    {
        return $this->links;
    }
}
