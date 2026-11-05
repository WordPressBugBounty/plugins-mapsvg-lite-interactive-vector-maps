<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

/** Normalized expected provider response; transport exceptions remain exceptions. */
final class GeocodingProviderResult
{
    private bool $successful;
    private ?float $latitude;
    private ?float $longitude;
    /** @var array<string,mixed>|null */
    private ?array $address;
    private ?string $errorCode;
    private ?string $errorMessage;
    private bool $retryable;

    /**
     * @param array<string,mixed>|null $address
     */
    private function __construct(
        bool $successful,
        ?float $latitude,
        ?float $longitude,
        ?array $address,
        ?string $errorCode,
        ?string $errorMessage,
        bool $retryable
    ) {
        $this->successful = $successful;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
        $this->address = $address;
        $this->errorCode = $errorCode;
        $this->errorMessage = $errorMessage;
        $this->retryable = $retryable;
    }

    /** @param array<string,mixed> $components */
    public static function success(
        $latitude,
        $longitude,
        string $formattedAddress,
        array $components = array()
    ): self {
        $latitude = self::coordinate(
            $latitude,
            'Provider latitude',
            -90,
            90
        );
        $longitude = self::coordinate(
            $longitude,
            'Provider longitude',
            -180,
            180
        );
        $formattedAddress = trim($formattedAddress);
        if ($formattedAddress === '' || strlen($formattedAddress) > 2000) {
            throw new \InvalidArgumentException(
                'Provider success requires a formatted address up to 2000 characters.'
            );
        }
        if (count($components) > 100) {
            throw new \LengthException(
                'Provider address components exceed the 100-item limit.'
            );
        }
        $address = array();
        foreach ($components as $name => $value) {
            if (!is_string($name)
                || $name === ''
                || strlen($name) > 100
                || in_array($name, array(
                    'formatted',
                    'address_formatted',
                ), true)) {
                throw new \InvalidArgumentException(
                    'Provider address component names must be non-empty and owned.'
                );
            }
            if (!is_scalar($value)
                || is_bool($value)
                || (is_float($value) && !is_finite($value))) {
                throw new \InvalidArgumentException(
                    'Provider address components must be finite scalar values.'
                );
            }
            if (strlen((string) $value) > 2000) {
                throw new \LengthException(
                    'Provider address component values exceed 2000 characters.'
                );
            }
            $address[$name] = $value;
        }
        $address['address_formatted'] = $formattedAddress;
        $address['formatted'] = $formattedAddress;

        return new self(
            true,
            $latitude,
            $longitude,
            $address,
            null,
            null,
            false
        );
    }

    public static function failure(
        string $errorCode,
        string $errorMessage = '',
        bool $retryable = false
    ): self {
        $errorCode = trim($errorCode);
        $errorMessage = trim($errorMessage);
        if ($errorCode === '' || strlen($errorCode) > 100) {
            throw new \InvalidArgumentException(
                'Provider failure requires an error code up to 100 characters.'
            );
        }
        if (strlen($errorMessage) > 2000) {
            throw new \InvalidArgumentException(
                'Provider failure message must not exceed 2000 characters.'
            );
        }

        return new self(
            false,
            null,
            null,
            null,
            $errorCode,
            $errorMessage === '' ? null : $errorMessage,
            $retryable
        );
    }

    public function isSuccess(): bool
    {
        return $this->successful;
    }

    public function latitude(): ?float
    {
        return $this->latitude;
    }

    public function longitude(): ?float
    {
        return $this->longitude;
    }

    /** @return array<string,mixed>|null */
    public function address(): ?array
    {
        return $this->address;
    }

    public function errorCode(): ?string
    {
        return $this->errorCode;
    }

    public function errorMessage(): ?string
    {
        return $this->errorMessage;
    }

    public function isRetryable(): bool
    {
        return $this->retryable;
    }

    /** @param mixed $value */
    private static function coordinate(
        $value,
        string $label,
        float $minimum,
        float $maximum
    ): float {
        if (is_bool($value)
            || (!is_int($value)
                && !is_float($value)
                && !(is_string($value) && is_numeric($value)))) {
            throw new \InvalidArgumentException(
                $label . ' must be a finite number.'
            );
        }
        $number = (float) $value;
        if (!is_finite($number) || $number < $minimum || $number > $maximum) {
            throw new \InvalidArgumentException(
                $label . ' is out of range.'
            );
        }
        return $number;
    }
}
