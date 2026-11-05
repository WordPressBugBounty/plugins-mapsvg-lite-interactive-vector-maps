<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

/** Applies one explicit provider response to a pure location decision. */
final class SynchronousGeocodingService
{
    private GeocodingProvider $provider;
    private LocationNormalizer $normalizer;

    public function __construct(
        GeocodingProvider $provider,
        ?LocationNormalizer $normalizer = null
    ) {
        $this->provider = $provider;
        $this->normalizer = $normalizer ?? new LocationNormalizer();
    }

    public function resolve(
        LocationNormalization $decision,
        string $language = 'en',
        string $country = ''
    ): GeocodingResolution {
        if ($decision->action() === LocationNormalization::ACTION_NONE) {
            return GeocodingResolution::notRequired($decision);
        }

        $input = $decision->geocodingInput();
        if ($input === null || $input === '') {
            throw new \LogicException(
                'Actionable location decision has no provider input.'
            );
        }
        $request = new GeocodingRequest(
            $decision->action(),
            $input,
            $language,
            $country
        );
        $providerResult = $this->provider->geocode($request);

        if (!$providerResult->isSuccess()) {
            return GeocodingResolution::failure(
                $this->failedNormalization(
                    $decision,
                    $providerResult->isRetryable()
                ),
                $request,
                $providerResult
            );
        }

        return GeocodingResolution::success(
            $this->successfulNormalization(
                $decision,
                $providerResult
            ),
            $request
        );
    }

    private function successfulNormalization(
        LocationNormalization $decision,
        GeocodingProviderResult $providerResult
    ): LocationNormalization {
        $public = $decision->publicLocation();
        if ($public === null) {
            throw new \LogicException(
                'An actionable location decision must contain public data.'
            );
        }
        $address = $providerResult->address();
        $latitude = $providerResult->latitude();
        $longitude = $providerResult->longitude();
        if ($address === null || $latitude === null || $longitude === null) {
            throw new \LogicException(
                'Provider success is missing normalized location data.'
            );
        }

        if ($decision->action() === LocationNormalization::ACTION_FORWARD) {
            $public['geoPoint'] = array(
                'lat' => $latitude,
                'lng' => $longitude,
            );
        } elseif (!isset($public['geoPoint'])) {
            throw new \LogicException(
                'Reverse-geocoding decision has no source geoPoint.'
            );
        }
        $public['address'] = $address;

        return $this->normalizer->fromPublic($public);
    }

    private function failedNormalization(
        LocationNormalization $decision,
        bool $retryable
    ): LocationNormalization {
        $status = $retryable
            ? LocationStatus::FAILED_RETRY
            : LocationStatus::FAILED_NO_RETRY;
        $storage = $decision->storage();
        $storage['location_geocoding_status'] = $status;

        return new LocationNormalization(
            $decision->publicLocation(),
            $storage,
            $status,
            LocationNormalization::ACTION_NONE,
            null
        );
    }
}
