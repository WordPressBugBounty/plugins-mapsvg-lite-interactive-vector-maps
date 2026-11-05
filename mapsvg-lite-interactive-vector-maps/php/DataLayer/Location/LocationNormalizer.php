<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

use MapSVG\DataLayer\Mapping\LegacyJsonCodec;

/** Pure public-location ↔ physical-column normalization and workflow decision. */
final class LocationNormalizer
{
    private LegacyJsonCodec $json;

    public function __construct(?LegacyJsonCodec $json = null)
    {
        $this->json = $json ?? new LegacyJsonCodec();
    }

    /** @param mixed $value */
    public function fromPublic($value): LocationNormalization
    {
        $location = $this->publicInput($value);
        if ($location === null) {
            return $this->emptyNormalization();
        }

        $geo = $this->coordinatePair(
            $location['geoPoint'] ?? null,
            'lat',
            'lng',
            true
        );
        $svg = $this->coordinatePair(
            $location['svgPoint'] ?? null,
            'x',
            'y',
            false
        );
        $address = $this->address($location['address'] ?? null);
        $image = $this->image($location['img'] ?? '');

        if ($geo === null
            && $svg === null
            && !$this->hasAddress($address)
            && $image === '') {
            return $this->emptyNormalization();
        }

        $status = $this->derivedStatus($geo, $address);
        $action = $this->actionForStatus($status);
        $input = $this->geocodingInput($action, $geo, $address);
        $public = $this->publicLocation($geo, $svg, $address, $image);
        $storage = $this->storage(
            $geo,
            $svg,
            $address,
            $image,
            $status
        );

        return new LocationNormalization(
            $public,
            $storage,
            $status,
            $action,
            $input
        );
    }

    /** @param array<string,mixed> $row */
    public function fromStorage(array $row): LocationNormalization
    {
        $geo = $this->coordinatePairFromStorage(
            $row,
            'location_lat',
            'location_lng',
            'lat',
            'lng',
            true
        );
        $svg = $this->coordinatePairFromStorage(
            $row,
            'location_x',
            'location_y',
            'x',
            'y',
            false
        );
        $address = $this->storedAddress(
            $row['location_address'] ?? null
        );
        $image = $this->image($row['location_img'] ?? '');
        $status = $this->storedStatus(
            $row['location_geocoding_status'] ?? null,
            $geo,
            $address
        );
        $action = $this->actionForStatus($status);
        $input = $this->geocodingInput($action, $geo, $address);

        $isEmpty = $geo === null
            && $svg === null
            && !$this->hasAddress($address)
            && $image === '';
        $public = $isEmpty
            ? null
            : $this->publicLocation($geo, $svg, $address, $image);
        $storage = $this->storage(
            $geo,
            $svg,
            $address,
            $image,
            $status
        );

        return new LocationNormalization(
            $public,
            $storage,
            $status,
            $action,
            $input
        );
    }

    /** @param mixed $value @return array<string,mixed>|null */
    private function publicInput($value): ?array
    {
        if ($value === null || $value === '' || $value === array()) {
            return null;
        }
        if (is_object($value)) {
            return $this->arrayValue($value);
        }
        if (is_array($value)) {
            $location = $this->arrayValue($value);
            $this->assertLocationObject($location);
            return $location;
        }
        if (!is_string($value)) {
            throw new \InvalidArgumentException(
                'Location input must be an array, object, JSON string, or empty.'
            );
        }

        try {
            $decoded = json_decode(
                $value,
                true,
                512,
                JSON_THROW_ON_ERROR
            );
        } catch (\JsonException $error) {
            throw new \InvalidArgumentException(
                'Location JSON input is invalid.',
                0,
                $error
            );
        }
        if (!is_array($decoded)) {
            throw new \InvalidArgumentException(
                'Location JSON input must decode to an object.'
            );
        }
        $location = $this->arrayValue($decoded);
        $this->assertLocationObject($location);
        return $location;
    }

    /**
     * @param mixed $value
     * @return array<string,float>|null
     */
    private function coordinatePair(
        $value,
        string $first,
        string $second,
        bool $geographic
    ): ?array {
        if ($value === null || $value === '' || $value === array()) {
            return null;
        }
        $pair = $this->arrayValue($value);
        $hasFirst = array_key_exists($first, $pair)
            && $pair[$first] !== ''
            && $pair[$first] !== null;
        $hasSecond = array_key_exists($second, $pair)
            && $pair[$second] !== ''
            && $pair[$second] !== null;
        if (!$hasFirst && !$hasSecond) {
            throw new \InvalidArgumentException(
                'Location coordinate pairs must contain both expected fields.'
            );
        }
        if (!$hasFirst || !$hasSecond) {
            throw new \InvalidArgumentException(
                'Location coordinate pairs must be complete.'
            );
        }

        $firstValue = $this->number(
            $pair[$first],
            'Location ' . $first
        );
        $secondValue = $this->number(
            $pair[$second],
            'Location ' . $second
        );
        if ($geographic) {
            if ($firstValue < -90 || $firstValue > 90) {
                throw new \InvalidArgumentException(
                    'Location latitude is out of range.'
                );
            }
            if ($secondValue < -180 || $secondValue > 180) {
                throw new \InvalidArgumentException(
                    'Location longitude is out of range.'
                );
            }
        }

        return array(
            $first => $firstValue,
            $second => $secondValue,
        );
    }

    /**
     * @param array<string,mixed> $row
     * @return array<string,float>|null
     */
    private function coordinatePairFromStorage(
        array $row,
        string $firstColumn,
        string $secondColumn,
        string $first,
        string $second,
        bool $geographic
    ): ?array {
        $firstValue = $row[$firstColumn] ?? null;
        $secondValue = $row[$secondColumn] ?? null;
        if (($firstValue === null || $firstValue === '')
            && ($secondValue === null || $secondValue === '')) {
            return null;
        }
        return $this->coordinatePair(
            array(
                $first => $firstValue,
                $second => $secondValue,
            ),
            $first,
            $second,
            $geographic
        );
    }

    /** @param mixed $value @return string|array<string,mixed> */
    private function address($value)
    {
        if ($value === null || $value === '') {
            return '';
        }
        if (is_string($value)) {
            $formatted = trim($value);
            return $formatted === ''
                ? ''
                : $this->canonicalAddress(array(), $formatted);
        }
        if (!is_array($value) && !is_object($value)) {
            throw new \InvalidArgumentException(
                'Location address must be a string, array, object, or empty.'
            );
        }

        $address = $this->arrayValue($value);
        if ($address === array()) {
            return '';
        }
        if (self::isList($address)) {
            throw new \InvalidArgumentException(
                'Location address must be an object, not a list.'
            );
        }

        $formatted = $this->formattedAddress($address);
        if ($formatted === null) {
            throw new \InvalidArgumentException(
                'Location address requires formatted text.'
            );
        }
        return $this->canonicalAddress($address, $formatted);
    }

    /** @param array<string,mixed> $address */
    private function formattedAddress(array $address): ?string
    {
        $values = array();
        foreach (array('formatted', 'address_formatted') as $field) {
            if (!array_key_exists($field, $address)) {
                continue;
            }
            $value = $address[$field];
            if (!is_scalar($value) || is_bool($value)) {
                throw new \InvalidArgumentException(
                    'Formatted location address must be scalar text.'
                );
            }
            $value = trim((string) $value);
            if ($value !== '') {
                $values[$value] = $value;
            }
        }
        if (count($values) > 1) {
            throw new \InvalidArgumentException(
                'Location formatted-address aliases conflict.'
            );
        }
        return $values === array() ? null : reset($values);
    }

    /** @param array<string,mixed> $address @return array<string,mixed> */
    private function canonicalAddress(array $address, string $formatted): array
    {
        $address['address_formatted'] = $formatted;
        $address['formatted'] = $formatted;
        return $address;
    }

    /** @param mixed $value @return string|array<string,mixed> */
    private function storedAddress($value)
    {
        if ($value === null || $value === '') {
            return '';
        }
        if (is_array($value) || is_object($value)) {
            return $this->address($value);
        }
        if (!is_string($value)) {
            throw new \InvalidArgumentException(
                'Stored location address must be JSON, text, or empty.'
            );
        }

        try {
            $decoded = json_decode(
                $value,
                true,
                512,
                JSON_THROW_ON_ERROR
            );
            return $this->address($decoded);
        } catch (\JsonException $error) {
            // Old installations may contain raw, non-JSON address text.
            return $this->address($value);
        }
    }

    /** @param mixed $value */
    private function image($value): string
    {
        if ($value === null || $value === '') {
            return '';
        }
        if (!is_scalar($value) || is_bool($value)) {
            throw new \InvalidArgumentException(
                'Location image must be scalar text or empty.'
            );
        }
        return (string) $value;
    }

    /**
     * @param array<string,float>|null $geo
     * @param string|array<string,mixed> $address
     */
    private function derivedStatus(?array $geo, $address): int
    {
        $hasAddress = $this->hasAddress($address);
        if ($geo !== null && $hasAddress) {
            return LocationStatus::DONE;
        }
        if ($hasAddress) {
            return LocationStatus::FORWARD_CANDIDATE;
        }
        if ($geo !== null) {
            return LocationStatus::REVERSE_CANDIDATE;
        }
        return LocationStatus::SKIPPED;
    }

    /**
     * @param mixed $value
     * @param array<string,float>|null $geo
     * @param string|array<string,mixed> $address
     */
    private function storedStatus($value, ?array $geo, $address): int
    {
        if ($value === null || $value === '') {
            return $this->derivedStatus($geo, $address);
        }
        if (is_bool($value)
            || (!is_int($value)
                && !(is_string($value) && preg_match('/^[1-6]$/D', $value)))) {
            throw new \InvalidArgumentException(
                'Location geocoding status must be an integer from 1 to 6.'
            );
        }
        $status = (int) $value;
        if (!LocationStatus::isValid($status)) {
            throw new \InvalidArgumentException(
                'Location geocoding status must be an integer from 1 to 6.'
            );
        }
        return $status;
    }

    private function actionForStatus(int $status): string
    {
        if ($status === LocationStatus::FORWARD_CANDIDATE) {
            return LocationNormalization::ACTION_FORWARD;
        }
        if ($status === LocationStatus::REVERSE_CANDIDATE) {
            return LocationNormalization::ACTION_REVERSE;
        }
        return LocationNormalization::ACTION_NONE;
    }

    /**
     * @param array<string,float>|null $geo
     * @param string|array<string,mixed> $address
     */
    private function geocodingInput(
        string $action,
        ?array $geo,
        $address
    ): ?string {
        if ($action === LocationNormalization::ACTION_NONE) {
            return null;
        }
        if ($action === LocationNormalization::ACTION_REVERSE) {
            if ($geo === null) {
                throw new \InvalidArgumentException(
                    'Reverse-geocoding status requires a complete geoPoint.'
                );
            }
            return $this->formatNumber($geo['lat'])
                . ',' . $this->formatNumber($geo['lng']);
        }

        $query = $this->addressQuery($address);
        if ($query === null) {
            throw new \InvalidArgumentException(
                'Forward-geocoding status requires a formatted address.'
            );
        }
        return $query;
    }

    /** @param string|array<string,mixed> $address */
    private function hasAddress($address): bool
    {
        if (is_string($address)) {
            return trim($address) !== '';
        }
        return $address !== array();
    }

    /** @param string|array<string,mixed> $address */
    private function addressQuery($address): ?string
    {
        if (is_string($address)) {
            $address = trim($address);
            return $address === '' ? null : $address;
        }
        foreach (array('formatted', 'address_formatted') as $field) {
            if (!array_key_exists($field, $address)) {
                continue;
            }
            $value = $address[$field];
            if (!is_scalar($value) || is_bool($value)) {
                throw new \InvalidArgumentException(
                    'Formatted location address must be scalar text.'
                );
            }
            $value = trim((string) $value);
            if ($value !== '') {
                return $value;
            }
        }
        return null;
    }

    /**
     * @param array<string,float>|null $geo
     * @param array<string,float>|null $svg
     * @param string|array<string,mixed> $address
     * @return array<string,mixed>
     */
    private function publicLocation(
        ?array $geo,
        ?array $svg,
        $address,
        string $image
    ): array {
        $location = array(
            'address' => $address,
            'img' => $image,
        );
        if ($geo !== null) {
            $location['geoPoint'] = $geo;
        }
        if ($svg !== null) {
            $location['svgPoint'] = $svg;
        }
        return $location;
    }

    /**
     * @param array<string,float>|null $geo
     * @param array<string,float>|null $svg
     * @param string|array<string,mixed> $address
     * @return array<string,mixed>
     */
    private function storage(
        ?array $geo,
        ?array $svg,
        $address,
        string $image,
        int $status
    ): array {
        $storage = $this->emptyStorage();
        if ($geo !== null) {
            $storage['location_lat'] = $geo['lat'];
            $storage['location_lng'] = $geo['lng'];
        }
        if ($svg !== null) {
            $storage['location_x'] = $svg['x'];
            $storage['location_y'] = $svg['y'];
        }
        if ($this->hasAddress($address)) {
            $storage['location_address'] = $this->json->encode($address);
        }
        $storage['location_img'] = $image;
        $storage['location_geocoding_status'] = $status;
        return $storage;
    }

    private function emptyNormalization(): LocationNormalization
    {
        return new LocationNormalization(
            null,
            $this->emptyStorage(),
            LocationStatus::SKIPPED,
            LocationNormalization::ACTION_NONE,
            null
        );
    }

    /** @return array<string,mixed> */
    private function emptyStorage(): array
    {
        return array(
            'location_lat' => null,
            'location_lng' => null,
            'location_x' => null,
            'location_y' => null,
            'location_address' => '',
            'location_img' => '',
            'location_geocoding_status' => LocationStatus::SKIPPED,
        );
    }

    /** @param mixed $value */
    private function number($value, string $label): float
    {
        if (is_bool($value)
            || (!is_int($value)
                && !is_float($value)
                && !(is_string($value) && is_numeric($value)))) {
            throw new \InvalidArgumentException(
                $label . ' must be a finite number.'
            );
        }
        $number = (float) $value;
        if (!is_finite($number)) {
            throw new \InvalidArgumentException(
                $label . ' must be a finite number.'
            );
        }
        return $number;
    }

    /** @param array<mixed> $location */
    private function assertLocationObject(array $location): void
    {
        if ($location !== array() && self::isList($location)) {
            throw new \InvalidArgumentException(
                'Location input must be an object, not a list.'
            );
        }
    }

    /** @param array<mixed>|object $value @return array<mixed> */
    private function arrayValue($value): array
    {
        if (is_object($value)) {
            $value = get_object_vars($value);
        }
        if (!is_array($value)) {
            throw new \InvalidArgumentException(
                'Location object values must be arrays or objects.'
            );
        }

        $normalized = array();
        foreach ($value as $key => $item) {
            if (is_object($item) || is_array($item)) {
                $item = $this->arrayValue($item);
            }
            $normalized[$key] = $item;
        }
        return $normalized;
    }

    private static function isList(array $value): bool
    {
        return $value === array()
            || array_keys($value) === range(0, count($value) - 1);
    }

    private function formatNumber(float $number): string
    {
        $formatted = rtrim(
            rtrim(sprintf('%.12F', $number), '0'),
            '.'
        );
        return $formatted === '-0' ? '0' : $formatted;
    }
}
