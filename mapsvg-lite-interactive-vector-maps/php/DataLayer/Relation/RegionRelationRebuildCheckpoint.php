<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

/** Persistable cursor for one bounded shared-r2o rebuild. */
final class RegionRelationRebuildCheckpoint
{
    private const VERSION = 1;

    private string $scope;
    private int $batchSize;
    private ?string $lastId;
    private int $processed;
    private int $inserted;
    private int $batches;
    private bool $complete;

    private function __construct(
        string $scope,
        int $batchSize,
        ?string $lastId,
        int $processed,
        int $inserted,
        int $batches,
        bool $complete
    ) {
        if ($scope === '') {
            throw new \InvalidArgumentException(
                'Relation rebuild scope must not be empty.'
            );
        }
        self::assertBatchSize($batchSize);
        foreach (array(
            'processed' => $processed,
            'inserted' => $inserted,
            'batches' => $batches,
        ) as $label => $value) {
            if ($value < 0) {
                throw new \InvalidArgumentException(
                    'Relation rebuild ' . $label . ' must not be negative.'
                );
            }
        }
        if ($lastId !== null && $lastId === '') {
            throw new \InvalidArgumentException(
                'Relation rebuild last ID must not be empty.'
            );
        }

        $this->scope = $scope;
        $this->batchSize = $batchSize;
        $this->lastId = $lastId;
        $this->processed = $processed;
        $this->inserted = $inserted;
        $this->batches = $batches;
        $this->complete = $complete;
    }

    public static function start(
        string $scope,
        int $batchSize,
        bool $complete = false
    ): self {
        return new self(
            $scope,
            $batchSize,
            null,
            0,
            0,
            0,
            $complete
        );
    }

    /** @param array<string,mixed> $state */
    public static function fromArray(array $state): self
    {
        if (($state['version'] ?? null) !== self::VERSION) {
            throw new \InvalidArgumentException(
                'Unsupported relation rebuild checkpoint version.'
            );
        }
        return new self(
            (string) ($state['scope'] ?? ''),
            (int) ($state['batchSize'] ?? 0),
            isset($state['lastId']) ? (string) $state['lastId'] : null,
            (int) ($state['processed'] ?? -1),
            (int) ($state['inserted'] ?? -1),
            (int) ($state['batches'] ?? -1),
            ($state['complete'] ?? false) === true
        );
    }

    public function advance(
        string $lastId,
        int $processed,
        int $inserted
    ): self {
        if ($this->complete) {
            throw new \LogicException(
                'Completed relation rebuild checkpoints cannot advance.'
            );
        }
        if ($lastId === '' || $processed < 1 || $inserted < 0) {
            throw new \InvalidArgumentException(
                'Invalid relation rebuild batch result.'
            );
        }
        return new self(
            $this->scope,
            $this->batchSize,
            $lastId,
            $this->processed + $processed,
            $this->inserted + $inserted,
            $this->batches + 1,
            false
        );
    }

    public function finish(): self
    {
        if ($this->complete) {
            return $this;
        }
        return new self(
            $this->scope,
            $this->batchSize,
            $this->lastId,
            $this->processed,
            $this->inserted,
            $this->batches,
            true
        );
    }

    /** @return array<string,mixed> */
    public function toArray(): array
    {
        return array(
            'version' => self::VERSION,
            'scope' => $this->scope,
            'batchSize' => $this->batchSize,
            'lastId' => $this->lastId,
            'processed' => $this->processed,
            'inserted' => $this->inserted,
            'batches' => $this->batches,
            'complete' => $this->complete,
        );
    }

    public function scope(): string
    {
        return $this->scope;
    }

    public function batchSize(): int
    {
        return $this->batchSize;
    }

    public function lastId(): ?string
    {
        return $this->lastId;
    }

    public function processed(): int
    {
        return $this->processed;
    }

    public function inserted(): int
    {
        return $this->inserted;
    }

    public function batches(): int
    {
        return $this->batches;
    }

    public function isComplete(): bool
    {
        return $this->complete;
    }

    private static function assertBatchSize(int $batchSize): void
    {
        if ($batchSize < 1 || $batchSize > 1000) {
            throw new \InvalidArgumentException(
                'Relation rebuild batch size must be between 1 and 1000.'
            );
        }
    }
}
