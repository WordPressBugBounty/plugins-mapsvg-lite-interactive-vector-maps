<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** Internal result of validating/translating one Prisma-style where AST. */
final class PrismaWhereTranslation
{
    /** @var array<string, mixed> */
    private array $where;
    /** @var string[] */
    private array $advancedReasons;

    /** @param array<string, mixed> $where @param string[] $advancedReasons */
    public function __construct(array $where, array $advancedReasons)
    {
        $this->where = $where;
        $this->advancedReasons = array_values(array_unique($advancedReasons));
    }

    /** @return array<string, mixed> */
    public function where(): array
    {
        return $this->where;
    }

    /** @return string[] */
    public function advancedReasons(): array
    {
        return $this->advancedReasons;
    }

    public function isAdvanced(): bool
    {
        return $this->advancedReasons !== array();
    }
}
