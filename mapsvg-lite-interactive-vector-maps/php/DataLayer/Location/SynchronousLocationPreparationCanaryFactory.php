<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

use MapSVG\Schema;

/** Explicit composition root for one schema's synchronous location canary. */
final class SynchronousLocationPreparationCanaryFactory
{
    public static function forSchema(
        Schema $schema,
        ?GeocodingProvider $provider = null,
        string $country = ''
    ): SynchronousLocationPreparationCanary {
        $field = $schema->getFieldByType('location');
        if ($field === null || empty($field->name)) {
            throw new \InvalidArgumentException(
                'Schema has no location field.'
            );
        }

        $language = isset($field->language)
            && trim((string) $field->language) !== ''
            ? trim((string) $field->language)
            : 'en';

        return new SynchronousLocationPreparationCanary(
            new SynchronousLocationPreparationService(
                $provider ?? new LegacyGeocodingProvider()
            ),
            (string) $field->name,
            $language,
            $country
        );
    }

    private function __construct()
    {
    }
}
