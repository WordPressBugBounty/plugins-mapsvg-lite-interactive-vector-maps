<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Mapping;

/** Pure legacy location virtual-field conversion; geocoding is deliberately external. */
final class LocationFieldCodec
{
    private const FORWARD_CANDIDATE = 1;
    private const REVERSE_CANDIDATE = 2;
    private const DONE = 3;
    private const SKIPPED = 6;

    private LegacyJsonCodec $json;

    public function __construct(?LegacyJsonCodec $json = null)
    {
        $this->json = $json ?? new LegacyJsonCodec();
    }

    /** @return array<string, mixed> */
    public function encode($value): array
    {
        if (empty($value)) {
            return $this->emptyStorage();
        }

        $location = $this->locationArray($value);
        if ($location === array()) {
            return $this->emptyStorage();
        }

        $storage = array();
        $geo = $this->nestedArray($location['geoPoint'] ?? null);
        $svg = $this->nestedArray($location['svgPoint'] ?? null);
        if ($geo !== array()) {
            if (array_key_exists('lat', $geo)) {
                $storage['location_lat'] = $geo['lat'];
            }
            if (array_key_exists('lng', $geo)) {
                $storage['location_lng'] = $geo['lng'];
            }
        } elseif ($svg !== array()) {
            if (array_key_exists('x', $svg)) {
                $storage['location_x'] = $svg['x'];
            }
            if (array_key_exists('y', $svg)) {
                $storage['location_y'] = $svg['y'];
            }
        }

        if (array_key_exists('address', $location)) {
            $storage['location_address'] = $this->json->encode($location['address']);
        }
        $storage['location_img'] = $location['img'] ?? '';

        $hasGeo = $this->hasCoordinates($geo, 'lat', 'lng');
        $hasAddress = !empty($location['address']);
        if ($hasGeo && $hasAddress) {
            $storage['location_geocoding_status'] = self::DONE;
        } elseif ($hasAddress) {
            $storage['location_geocoding_status'] = self::FORWARD_CANDIDATE;
        } elseif ($hasGeo) {
            $storage['location_geocoding_status'] = self::REVERSE_CANDIDATE;
        } else {
            $storage['location_geocoding_status'] = self::SKIPPED;
        }

        return $storage;
    }

    /** @param array<string, mixed> $row @return array<string, mixed>|string */
    public function decode(array $row)
    {
        $lat = $row['location_lat'] ?? null;
        $lng = $row['location_lng'] ?? null;
        $x = $row['location_x'] ?? null;
        $y = $row['location_y'] ?? null;

        $hasGeo = $this->hasCoordinates(
            array('lat' => $lat, 'lng' => $lng),
            'lat',
            'lng'
        );
        $hasSvg = !empty($x) && !empty($y);
        if (!$hasGeo && !$hasSvg) {
            return '';
        }

        $address = '';
        if (isset($row['location_address'])) {
            $decoded = $this->json->decode((string) $row['location_address'], false, false);
            $address = $decoded ?: '';
            if (is_object($address)
                && isset($address->address_formatted)
                && !isset($address->formatted)) {
                $address->formatted = $address->address_formatted;
            }
        }

        $location = array(
            'address' => $address,
            'img' => $row['location_img'] ?? '',
        );
        if ($hasGeo) {
            $location['geoPoint'] = array(
                'lat' => (float) $lat,
                'lng' => (float) $lng,
            );
        }
        if ($hasSvg) {
            $location['svgPoint'] = array(
                'x' => (float) $x,
                'y' => (float) $y,
            );
        }
        return $location;
    }

    /** @return array<string, mixed> */
    private function emptyStorage(): array
    {
        return array(
            'location_address' => '',
            'location_lat' => null,
            'location_lng' => null,
            'location_x' => null,
            'location_y' => null,
            'location_img' => '',
            'location_geocoding_status' => self::SKIPPED,
        );
    }

    /** @return array<string, mixed> */
    private function locationArray($value): array
    {
        if (is_array($value)) {
            return $value;
        }
        if (is_object($value)) {
            return get_object_vars($value);
        }
        if (is_string($value) && $value !== '') {
            $decoded = json_decode($value, true);
            return is_array($decoded) ? $decoded : array();
        }
        return array();
    }

    /** @return array<string, mixed> */
    private function nestedArray($value): array
    {
        if (is_array($value)) {
            return $value;
        }
        return is_object($value) ? get_object_vars($value) : array();
    }

    /** @param array<string, mixed> $coordinates */
    private function hasCoordinates(
        array $coordinates,
        string $first,
        string $second
    ): bool {
        return isset($coordinates[$first], $coordinates[$second])
            && $this->isCoordinate($coordinates[$first])
            && $this->isCoordinate($coordinates[$second]);
    }

    /** Zero is a coordinate; null, blanks and nonfinite/malformed values are not. */
    private function isCoordinate($value): bool
    {
        return (is_int($value) || is_float($value) || (is_string($value) && is_numeric($value)))
            && is_finite((float) $value);
    }
}
