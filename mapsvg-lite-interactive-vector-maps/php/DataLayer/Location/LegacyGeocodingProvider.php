<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

/**
 * Adapts the current MapSVG\Geocoding response shape to the v2 provider seam.
 *
 * The default factory is intentionally lazy so this class remains testable
 * without WordPress globals or network access.
 */
final class LegacyGeocodingProvider implements GeocodingProvider
{
    /** @var callable */
    private $factory;
    /** @var object|null */
    private $geocoder;

    public function __construct(?callable $factory = null)
    {
        $this->factory = $factory ?? static function () {
            return new \MapSVG\Geocoding();
        };
    }

    public function geocode(
        GeocodingRequest $request
    ): GeocodingProviderResult {
        $response = $this->geocoder()->get(
            $request->input(),
            true,
            true,
            $request->language(),
            $request->country()
        );

        return $this->normalizeResponse($request, $response);
    }

    /** @return object */
    private function geocoder()
    {
        if ($this->geocoder === null) {
            $geocoder = call_user_func($this->factory);
            if (!is_object($geocoder) || !method_exists($geocoder, 'get')) {
                throw new \UnexpectedValueException(
                    'Legacy geocoding factory must return an object with get().'
                );
            }
            $this->geocoder = $geocoder;
        }
        return $this->geocoder;
    }

    /** @param mixed $response */
    private function normalizeResponse(
        GeocodingRequest $request,
        $response
    ): GeocodingProviderResult {
        if ($response === false || $response === null) {
            return GeocodingProviderResult::failure(
                'CONNECTION_ERROR',
                'Legacy geocoder returned no response.',
                true
            );
        }

        if (!is_array($response)) {
            throw new \UnexpectedValueException(
                'Legacy geocoder response must be an array.'
            );
        }
        $status = isset($response['status'])
            ? trim((string) $response['status'])
            : '';
        if ($status === '') {
            return GeocodingProviderResult::failure(
                'CONNECTION_ERROR',
                $this->errorMessage($response),
                true
            );
        }

        if ($status === 'OK') {
            return $this->success($request, $response);
        }

        $terminal = array(
            'ZERO_RESULTS',
            'OVER_DAILY_LIMIT',
            'OVER_QUERY_LIMIT',
            'REQUEST_DENIED',
            'INVALID_REQUEST',
            'NO_API_KEY',
        );
        if (in_array($status, $terminal, true)) {
            return GeocodingProviderResult::failure(
                $status,
                $this->errorMessage($response),
                false
            );
        }

        if (in_array($status, array(
            'UNKNOWN_ERROR',
            'CONNECTION_ERROR',
        ), true)) {
            return GeocodingProviderResult::failure(
                $status,
                $this->errorMessage($response),
                true
            );
        }

        throw new \UnexpectedValueException(
            'Unsupported legacy geocoding status: ' . $status
        );
    }

    /** @param array<string,mixed> $response */
    private function success(
        GeocodingRequest $request,
        array $response
    ): GeocodingProviderResult {
        $results = $response['results'] ?? null;
        if (!is_array($results) || $results === array()) {
            throw new \UnexpectedValueException(
                'Legacy OK response contains no results.'
            );
        }

        $index = $request->action()
            === LocationNormalization::ACTION_REVERSE
            && array_key_exists(1, $results)
            ? 1
            : 0;
        $result = $results[$index] ?? null;
        if (!is_array($result)) {
            throw new \UnexpectedValueException(
                'Legacy geocoding result must be an array.'
            );
        }

        $location = $result['geometry']['location'] ?? null;
        if (!is_array($location)
            || !array_key_exists('lat', $location)
            || !array_key_exists('lng', $location)) {
            throw new \UnexpectedValueException(
                'Legacy geocoding result has no coordinates.'
            );
        }
        $formatted = isset($result['formatted_address'])
            ? (string) $result['formatted_address']
            : '';
        $components = $this->components(
            $result['address_components'] ?? array()
        );

        return GeocodingProviderResult::success(
            $location['lat'],
            $location['lng'],
            $formatted,
            $components
        );
    }

    /** @param mixed $items @return array<string,string> */
    private function components($items): array
    {
        if ($items === null || $items === array()) {
            return array();
        }
        if (!is_array($items)) {
            throw new \UnexpectedValueException(
                'Legacy address components must be an array.'
            );
        }

        $components = array();

        foreach ($items as $item) {
            if (!is_array($item)
                || !isset($item['types'][0], $item['long_name'])) {
                throw new \UnexpectedValueException(
                    'Legacy address component is malformed.'
                );
            }
            $type = (string) $item['types'][0];
            $long = (string) $item['long_name'];
            if ($type === '') {
                throw new \UnexpectedValueException(
                    'Legacy address component type must not be empty.'
                );
            }
            $components[$type] = $long;

            if (array_key_exists('short_name', $item)
                && (string) $item['short_name'] !== $long) {
                $components[$type . '_short'] = (string) $item['short_name'];
            }
        }
        return $components;
    }

    /** @param array<string,mixed> $response */
    private function errorMessage(array $response): string
    {
        if (!isset($response['error_message'])) {
            return '';
        }
        $message = trim((string) $response['error_message']);
        return strlen($message) <= 2000
            ? $message
            : substr($message, 0, 2000);
    }
}
