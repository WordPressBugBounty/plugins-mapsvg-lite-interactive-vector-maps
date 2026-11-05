<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Query;

/** React Admin query result with mapped rows and filtered total count. */
final class PrismaQueryResponseAdapter
{
    /** @return array{rows:array<int,array<string,mixed>>,count:int} */
    public function adapt(QueryExecution $execution): array
    {
        $total = $execution->total();
        if ($total === null) {
            throw new \LogicException('Prisma query execution requires a total count.');
        }

        return array(
            'rows' => $execution->rows(),
            'count' => $total,
        );
    }
}
