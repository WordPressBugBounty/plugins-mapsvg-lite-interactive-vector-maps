<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

use MapSVG\DataLayer\SqlIdentifier;

final class IndexColumn
{
    private string $name;
    private ?int $prefixLength;

    public function __construct(string $name, ?int $prefixLength = null)
    {
        if (!SqlIdentifier::isValid($name)) {
            throw new \InvalidArgumentException(
                'Invalid index-column identifier.'
            );
        }
        if ($prefixLength !== null && $prefixLength < 1) {
            throw new \InvalidArgumentException(
                'Index prefix length must be positive.'
            );
        }
        $this->name = $name;
        $this->prefixLength = $prefixLength;
    }

    public function name(): string { return $this->name; }
    public function prefixLength(): ?int { return $this->prefixLength; }

    public function equivalentTo(self $other): bool
    {
        return $this->name === $other->name
            && $this->prefixLength === $other->prefixLength;
    }
}
