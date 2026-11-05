<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

/** Physical location_geocoding_status values, aligned with the legacy contract. */
final class LocationStatus
{
    public const FORWARD_CANDIDATE = 1;
    public const REVERSE_CANDIDATE = 2;
    public const DONE = 3;
    public const FAILED_NO_RETRY = 4;
    public const FAILED_RETRY = 5;
    public const SKIPPED = 6;

    public static function isValid(int $status): bool
    {
        return $status >= self::FORWARD_CANDIDATE
            && $status <= self::SKIPPED;
    }

    private function __construct()
    {
    }
}
