<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Location;

/** One normalized expected geocoding failure surfaced by preparation. */
final class LocationPreparationError
{
    private string $code;
    private ?string $message;
    private bool $retryable;

    public function __construct(
        string $code,
        ?string $message,
        bool $retryable
    ) {
        $code = trim($code);
        if ($code === '' || strlen($code) > 100) {
            throw new \InvalidArgumentException(
                'Location preparation error code must be 1 to 100 characters.'
            );
        }

        $message = $message === null ? null : trim($message);
        if ($message === '') {
            $message = null;
        }
        if ($message !== null && strlen($message) > 2000) {
            throw new \InvalidArgumentException(
                'Location preparation error message exceeds 2000 characters.'
            );
        }

        $this->code = $code;
        $this->message = $message;
        $this->retryable = $retryable;
    }

    public function code(): string
    {
        return $this->code;
    }

    public function message(): ?string
    {
        return $this->message;
    }

    public function isRetryable(): bool
    {
        return $this->retryable;
    }

    /** @return array{code:string,message:?string,retryable:bool} */
    public function toArray(): array
    {
        return array(
            'code' => $this->code,
            'message' => $this->message,
            'retryable' => $this->retryable,
        );
    }
}
