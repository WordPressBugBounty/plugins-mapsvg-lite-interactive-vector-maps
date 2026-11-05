<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

/** Provider-neutral boundary for one explicit synchronous geocoding call. */
interface GeocodingProvider
{
    public function geocode(
        GeocodingRequest $request
    ): GeocodingProviderResult;
}
