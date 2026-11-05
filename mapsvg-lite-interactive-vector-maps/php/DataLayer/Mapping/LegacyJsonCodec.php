<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Mapping;

/** Legacy text/JSON conversion without persistence or WordPress dependencies. */
final class LegacyJsonCodec
{
    public function encode($value): string
    {
        return json_encode(
            $value,
            JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR
        );
    }

    public function decode(
        string $value,
        bool $associative,
        bool $stripSlashes = true
    ) {
        $json = $stripSlashes ? stripslashes($value) : $value;
        $decoded = json_decode($json, $associative);
        return json_last_error() === JSON_ERROR_NONE ? $decoded : null;
    }

    public function encodeProfile($value)
    {
        if ($value === null || is_string($value)) {
            return $value;
        }
        return $this->encode($value);
    }

    public function decodeProfile(
        $value,
        string $mode,
        bool $nullAsEmpty
    ) {
        if ($value === null && $nullAsEmpty) {
            return '';
        }
        if ($mode === RecordMappingProfile::JSON_RAW
            || $value === null
            || !is_string($value)) {
            return $value;
        }
        if ($value === '') {
            return null;
        }

        return $this->decode(
            $value,
            $mode === RecordMappingProfile::JSON_ASSOC,
            false
        );
    }
}
