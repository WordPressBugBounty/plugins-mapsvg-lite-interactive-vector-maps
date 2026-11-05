<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

/** Prepared location columns plus expected geocoding failures. */
final class LocationPreparationResult
{
    private LocationNormalization $normalization;
    /** @var LocationPreparationError[] */
    private array $errors;

    /** @param LocationPreparationError[] $errors */
    public function __construct(
        LocationNormalization $normalization,
        array $errors = array()
    ) {
        foreach ($errors as $error) {
            if (!$error instanceof LocationPreparationError) {
                throw new \InvalidArgumentException(
                    'Location preparation errors must use LocationPreparationError.'
                );
            }
        }
        $this->normalization = $normalization;
        $this->errors = array_values($errors);
    }

    public function normalization(): LocationNormalization
    {
        return $this->normalization;
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

    /** @return LocationPreparationError[] */
    public function errors(): array
    {
        return $this->errors;
    }

    public function hasErrors(): bool
    {
        return $this->errors !== array();
    }

    /** @return array<int,array{code:string,message:?string,retryable:bool}> */
    public function errorData(): array
    {
        return array_map(
            static fn (LocationPreparationError $error): array =>
                $error->toArray(),
            $this->errors
        );
    }
}
