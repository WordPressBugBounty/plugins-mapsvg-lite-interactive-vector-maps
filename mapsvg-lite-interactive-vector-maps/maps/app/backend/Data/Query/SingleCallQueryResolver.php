<?php

declare(strict_types=1);
namespace MapSVG\App\Data\Query;

/** Composite bootstrap already owns a bounded inner batch; prohibit outer amplification. */
interface SingleCallQueryResolver extends QueryResolver {}
