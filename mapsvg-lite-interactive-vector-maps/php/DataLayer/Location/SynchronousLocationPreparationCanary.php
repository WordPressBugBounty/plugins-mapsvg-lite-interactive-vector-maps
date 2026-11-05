<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

/** Explicit schema-bound preparation seam; nothing enables it automatically. */
final class SynchronousLocationPreparationCanary
{
    private SynchronousLocationPreparationService $service;
    private string $fieldName;
    private string $language;
    private string $country;

    public function __construct(
        SynchronousLocationPreparationService $service,
        string $fieldName,
        string $language = 'en',
        string $country = ''
    ) {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $fieldName)) {
            throw new \InvalidArgumentException(
                'Location field name must be a safe identifier.'
            );
        }
        $language = trim($language);
        $country = trim($country);
        if ($language === '' || strlen($language) > 32) {
            throw new \InvalidArgumentException(
                'Location language must be 1 to 32 characters.'
            );
        }

        if (strlen($country) > 100) {
            throw new \InvalidArgumentException(
                'Location country must not exceed 100 characters.'
            );
        }

        $this->service = $service;
        $this->fieldName = $fieldName;
        $this->language = $language;
        $this->country = $country;
    }

    public function fieldName(): string
    {
        return $this->fieldName;
    }

    /** @param mixed $value */
    public function prepareValue(
        $value,
        bool $convertLatLngToAddress = false
    ): LocationPreparationResult {
        return $this->service->prepare(
            $value,
            $this->language,
            $this->country,
            $convertLatLngToAddress
        );
    }

    /**
     * Omitted location means "do not touch location columns" on updates.
     *
     * @param array<string,mixed> $record
     */
    public function prepareRecord(
        array $record,
        bool $convertLatLngToAddress = false
    ): ?LocationPreparationResult {
        if (!array_key_exists($this->fieldName, $record)) {
            return null;
        }

        return $this->prepareValue(
            $record[$this->fieldName],
            $convertLatLngToAddress
        );
    }
}
