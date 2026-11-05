<?php
declare(strict_types=1);
namespace MapSVG\App\Data\Query;

/** Trusted resolver-specific fieldwise result codec; generic Query JSON admission is unchanged. */
interface QueryResultAdmission extends SingleCallQueryResolver
{
    public function copyResult($result,int $maxBytes,int &$nodes): \stdClass;
}
