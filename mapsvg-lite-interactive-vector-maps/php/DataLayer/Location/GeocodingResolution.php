<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

/** Final synchronous geocoding outcome with complete physical location data. */
final class GeocodingResolution
{
    public const OUTCOME_NOT_REQUIRED = 'not-required';
    public const OUTCOME_SUCCESS = 'success';
    public const OUTCOME_FAILURE = 'failure';

    private LocationNormalization $normalization;
    private string $outcome;
    private ?GeocodingRequest $request;
    private ?string $errorCode;
    private ?string $errorMessage;
    private bool $retryable;

    private function __construct(
        LocationNormalization $normalization,
        string $outcome,
        ?GeocodingRequest $request,
        ?string $errorCode,
        ?string $errorMessage,
        bool $retryable
    ) {
        $this->normalization = $normalization;
        $this->outcome = $outcome;
        $this->request = $request;
        $this->errorCode = $errorCode;
        $this->errorMessage = $errorMessage;
        $this->retryable = $retryable;
    }

    public static function notRequired(
        LocationNormalization $normalization
    ): self {
        if ($normalization->action() !== LocationNormalization::ACTION_NONE) {
            throw new \InvalidArgumentException(
                'A not-required result cannot contain a geocoding action.'
            );
        }
        return new self(
            $normalization,
            self::OUTCOME_NOT_REQUIRED,
            null,
            null,
            null,
            false
        );
    }

    public static function success(
        LocationNormalization $normalization,
        GeocodingRequest $request
    ): self {
        if ($normalization->status() !== LocationStatus::DONE
            || $normalization->action() !== LocationNormalization::ACTION_NONE) {
            throw new \InvalidArgumentException(
                'A successful geocoding result must be DONE and final.'
            );
        }
        return new self(
            $normalization,
            self::OUTCOME_SUCCESS,
            $request,
            null,
            null,
            false
        );
    }

    public static function failure(
        LocationNormalization $normalization,
        GeocodingRequest $request,
        GeocodingProviderResult $providerResult
    ): self {
        if ($providerResult->isSuccess()) {
            throw new \InvalidArgumentException(
                'A failure outcome requires a provider failure result.'
            );
        }
        $expected = $providerResult->isRetryable()
            ? LocationStatus::FAILED_RETRY
            : LocationStatus::FAILED_NO_RETRY;
        if ($normalization->status() !== $expected
            || $normalization->action() !== LocationNormalization::ACTION_NONE) {
            throw new \InvalidArgumentException(
                'Failure normalization status does not match retry policy.'
            );
        }

        return new self(
            $normalization,
            self::OUTCOME_FAILURE,
            $request,
            $providerResult->errorCode(),
            $providerResult->errorMessage(),
            $providerResult->isRetryable()
        );
    }

    public function normalization(): LocationNormalization
    {
        return $this->normalization;
    }

    public function outcome(): string
    {
        return $this->outcome;
    }

    public function request(): ?GeocodingRequest
    {
        return $this->request;
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

    public function providerWasCalled(): bool
    {
        return $this->request !== null;
    }

    /** @return array<string,mixed> */
    public function storage(): array
    {
        return $this->normalization->storage();
    }

    /** @return array<string,mixed>|null */
    public function publicLocation(): ?array
    {
        return $this->normalization->publicLocation();
    }
}
