<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

/** Immutable provider request derived from a LocationNormalization decision. */
final class GeocodingRequest
{
    private string $action;
    private string $input;
    private string $language;
    private string $country;

    public function __construct(
        string $action,
        string $input,
        string $language = 'en',
        string $country = ''
    ) {
        if (!in_array($action, array(
            LocationNormalization::ACTION_FORWARD,
            LocationNormalization::ACTION_REVERSE,
        ), true)) {
            throw new \InvalidArgumentException(
                'Geocoding request action must be forward or reverse.'
            );
        }
        $input = trim($input);
        $language = trim($language);
        $country = trim($country);
        if ($input === '' || strlen($input) > 2000) {
            throw new \InvalidArgumentException(
                'Geocoding request input must be 1 to 2000 characters.'
            );
        }
        if ($language === '' || strlen($language) > 32) {
            throw new \InvalidArgumentException(
                'Geocoding request language must be 1 to 32 characters.'
            );
        }
        if (strlen($country) > 100) {
            throw new \InvalidArgumentException(
                'Geocoding request country must not exceed 100 characters.'
            );
        }

        $this->action = $action;
        $this->input = $input;
        $this->language = $language;
        $this->country = $country;
    }

    public function action(): string
    {
        return $this->action;
    }

    public function input(): string
    {
        return $this->input;
    }

    public function language(): string
    {
        return $this->language;
    }

    public function country(): string
    {
        return $this->country;
    }
}
