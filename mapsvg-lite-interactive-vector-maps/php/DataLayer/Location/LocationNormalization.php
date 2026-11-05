<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

/** Immutable pure result of normalizing one MapSVG location value. */
final class LocationNormalization
{
    public const ACTION_NONE = 'none';
    public const ACTION_FORWARD = 'forward';
    public const ACTION_REVERSE = 'reverse';

    /** @var array<string,mixed>|null */
    private ?array $publicLocation;
    /** @var array<string,mixed> */
    private array $storage;
    private int $status;
    private string $action;
    private ?string $geocodingInput;

    /**
     * @param array<string,mixed>|null $publicLocation
     * @param array<string,mixed> $storage
     */
    public function __construct(
        ?array $publicLocation,
        array $storage,
        int $status,
        string $action,
        ?string $geocodingInput
    ) {
        if (!LocationStatus::isValid($status)) {
            throw new \InvalidArgumentException(
                'Location normalization status must be between 1 and 6.'
            );
        }
        if (($storage['location_geocoding_status'] ?? null) !== $status) {
            throw new \InvalidArgumentException(
                'Location storage status must match the decision status.'
            );
        }
        if (!in_array($action, array(
            self::ACTION_NONE,
            self::ACTION_FORWARD,
            self::ACTION_REVERSE,
        ), true)) {
            throw new \InvalidArgumentException(
                'Unknown location normalization action.'
            );
        }
        $expectedAction = self::ACTION_NONE;
        if ($status === LocationStatus::FORWARD_CANDIDATE) {
            $expectedAction = self::ACTION_FORWARD;
        } elseif ($status === LocationStatus::REVERSE_CANDIDATE) {
            $expectedAction = self::ACTION_REVERSE;
        }
        if ($action !== $expectedAction) {
            throw new \InvalidArgumentException(
                'Location action must match the workflow status.'
            );
        }
        if ($action === self::ACTION_NONE && $geocodingInput !== null) {
            throw new \InvalidArgumentException(
                'A no-op location decision cannot carry geocoding input.'
            );
        }
        if ($action !== self::ACTION_NONE
            && ($geocodingInput === null || $geocodingInput === '')) {
            throw new \InvalidArgumentException(
                'A geocoding action requires non-empty input.'
            );
        }

        $this->publicLocation = $publicLocation;
        $this->storage = $storage;
        $this->status = $status;
        $this->action = $action;
        $this->geocodingInput = $geocodingInput;
    }

    /** @return array<string,mixed>|null */
    public function publicLocation(): ?array
    {
        return $this->publicLocation;
    }

    /** @return array<string,mixed> */
    public function storage(): array
    {
        return $this->storage;
    }

    public function status(): int
    {
        return $this->status;
    }

    public function action(): string
    {
        return $this->action;
    }

    public function geocodingInput(): ?string
    {
        return $this->geocodingInput;
    }

    public function isEmpty(): bool
    {
        return $this->publicLocation === null;
    }
}
