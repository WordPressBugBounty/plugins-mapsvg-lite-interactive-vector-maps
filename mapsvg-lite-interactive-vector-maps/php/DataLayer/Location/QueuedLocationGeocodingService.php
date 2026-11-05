<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

/**
 * Applies provider-neutral geocoding to one queued physical location row.
 *
 * Queue retry policy deliberately differs from synchronous writes: retryable
 * and historically unresolved failures leave the candidate status unchanged.
 */
final class QueuedLocationGeocodingService
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

    /**
     * @param array<string,mixed> $row
     * @return array<string,mixed> Empty means leave the candidate row unchanged.
     */
    public function resolveRow(
        array $row,
        bool $convertLatlngToAddress,
        bool $convertAddressToLatLng,
        string $language = 'en'
    ): array {

        $status = $this->status($row['location_geocoding_status'] ?? null);

        if ($status === LocationStatus::FORWARD_CANDIDATE) {
            if (!$convertAddressToLatLng) {
                return array();
            }
            if (!$this->hasLegacyForwardInput($row)) {
                return $this->terminalFailure();
            }
            try {
                $decision = $this->normalizer->fromStorage($row);
            } catch (\InvalidArgumentException $error) {
                return $this->terminalFailure();
            }
            return $this->resolveDecision(
                $decision,
                $language,
                LocationNormalization::ACTION_FORWARD
            );
        }

        if ($status === LocationStatus::REVERSE_CANDIDATE) {
            if (!$convertLatlngToAddress
                || !$this->legacyReverseEligible($row)) {
                return array();
            }
            try {
                $decision = $this->normalizer->fromStorage($row);
            } catch (\InvalidArgumentException $error) {
                return array();
            }
            return $this->resolveDecision(
                $decision,
                $language,
                LocationNormalization::ACTION_REVERSE
            );
        }

        return array();
    }

    private function resolveDecision(
        LocationNormalization $decision,
        string $language,
        string $expectedAction
    ): array {
        if ($decision->action() !== $expectedAction) {
            return array();
        }

        try {
            $resolution = $this->geocoding->resolve(
                $decision,
                $language
            );
        } catch (\UnexpectedValueException $error) {
            // Legacy queue ignored unknown provider statuses and retried later.
            return array();
        }

        if ($resolution->outcome() === GeocodingResolution::OUTCOME_FAILURE) {
            return $this->queueFailure($resolution->errorCode());
        }
        if ($resolution->outcome() !== GeocodingResolution::OUTCOME_SUCCESS) {
            return array();
        }

        $storage = $resolution->storage();
        if ($expectedAction === LocationNormalization::ACTION_FORWARD) {
            return array(
                'location_lat' => $storage['location_lat'],
                'location_lng' => $storage['location_lng'],
                'location_address' => $storage['location_address'],
                'location_geocoding_status' => LocationStatus::DONE,
            );
        }

        return array(
            'location_address' => $storage['location_address'],
            'location_geocoding_status' => LocationStatus::DONE,
        );
    }

    /** @param mixed $value */
    private function status($value): int
    {
        if (is_int($value)) {
            return LocationStatus::isValid($value)
                ? $value
                : LocationStatus::SKIPPED;
        }
        if (is_string($value) && preg_match('/^[1-6]$/D', $value)) {
            return (int) $value;
        }
        return LocationStatus::SKIPPED;
    }

    /** @param array<string,mixed> $row */
    private function hasLegacyForwardInput(array $row): bool
    {
        $addressJson = $row['location_address'] ?? '';
        if (!is_string($addressJson) || $addressJson === '') {
            return false;
        }
        $decoded = json_decode($addressJson, true);
        if (!is_array($decoded)) {
            return false;
        }
        $input = $decoded['address_formatted'] ?? '';
        return is_scalar($input)
            && !is_bool($input)
            && trim((string) $input) !== '';
    }

    /** @param array<string,mixed> $row */
    private function legacyReverseEligible(array $row): bool
    {
        $lat = $row['location_lat'] ?? null;
        $address = $row['location_address'] ?? '';

        return !empty($lat)
            && (float) $lat !== 0.0
            && (empty($address) || $address === '');
    }

    private function queueFailure(?string $errorCode): array
    {
        if ($errorCode !== null && in_array(
            $errorCode,
            array(
                'OVER_DAILY_LIMIT',
                'OVER_QUERY_LIMIT',
                'REQUEST_DENIED',
            ),
            true
        )) {
            return $this->terminalFailure();
        }

        // Preserve queue retry semantics: candidate status remains 1/2.
        return array();
    }

    /** @return array<string,int> */
    private function terminalFailure(): array
    {
        return array(
            'location_geocoding_status' =>
                LocationStatus::FAILED_NO_RETRY,
        );
    }
}
