<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

/** Explicit single-record location preparation before persistence begins. */
final class SynchronousLocationPreparationService
{
    private LocationNormalizer $normalizer;
    private SynchronousGeocodingService $geocoding;

    public function __construct(
        GeocodingProvider $provider,
        ?LocationNormalizer $normalizer = null
    ) {
        $this->normalizer = $normalizer ?? new LocationNormalizer();
        $this->geocoding = new SynchronousGeocodingService(
            $provider,
            $this->normalizer
        );
    }

    /** @param mixed $value */
    public function prepare(
        $value,
        string $language = 'en',
        string $country = '',
        bool $convertLatLngToAddress = false
    ): LocationPreparationResult {

        $decision = $this->normalizer->fromPublic($value);

        if ($decision->action() === LocationNormalization::ACTION_REVERSE
            && !$convertLatLngToAddress) {
            return new LocationPreparationResult(
                $this->withoutReverseLookup($decision)
            );
        }

        $resolution = $this->geocoding->resolve(
            $decision,
            $language,
            $country
        );
        $errors = array();
        if ($resolution->outcome() === GeocodingResolution::OUTCOME_FAILURE) {
            $code = $resolution->errorCode();
            if ($code === null || $code === '') {
                throw new \LogicException(
                    'Failed geocoding resolution has no error code.'
                );
            }
            $errors[] = new LocationPreparationError(
                $code,
                $resolution->errorMessage(),
                $resolution->isRetryable()
            );
        }

        return new LocationPreparationResult(
            $resolution->normalization(),
            $errors
        );
    }

    private function withoutReverseLookup(
        LocationNormalization $decision
    ): LocationNormalization {
        $public = $decision->publicLocation();
        $input = $decision->geocodingInput();
        if ($public === null
            || $input === null
            || $decision->action() !== LocationNormalization::ACTION_REVERSE) {
            throw new \LogicException(
                'Reverse bypass requires an actionable coordinate location.'
            );
        }

        $public['address'] = array(
            'address_formatted' => $input,
            'formatted' => $input,
        );

        return $this->normalizer->fromPublic($public);
    }
}
