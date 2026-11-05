<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Relation;

use MapSVG\DataLayer\Location\LocationPreparationError;

/** Prepared physical row and normalized expected pre-write errors. */
final class ObjectWritePreparationResult
{
    /** @var array<string,mixed> */
    private array $storage;
    /** @var LocationPreparationError[] */
    private array $geocodingErrors;

    /**
     * @param array<string,mixed> $storage
     * @param LocationPreparationError[] $geocodingErrors
     */
    public function __construct(
        array $storage,
        array $geocodingErrors = array()
    ) {
        if ($storage === array()) {
            throw new \InvalidArgumentException(
                'Prepared object storage must not be empty.'
            );
        }

        foreach ($geocodingErrors as $error) {
            if (!$error instanceof LocationPreparationError) {
                throw new \InvalidArgumentException(
                    'Object geocoding errors must use LocationPreparationError.'
                );
            }
        }

        $this->storage = $storage;
        $this->geocodingErrors = array_values($geocodingErrors);
    }

    /** @return array<string,mixed> */
    public function storage(): array
    {
        return $this->storage;
    }

    /** @return LocationPreparationError[] */
    public function geocodingErrors(): array
    {
        return $this->geocodingErrors;
    }

    /** @return string[] */
    public function geocodingErrorCodes(): array
    {
        return array_map(
            static fn (LocationPreparationError $error): string =>
                $error->code(),
            $this->geocodingErrors
        );
    }
}
