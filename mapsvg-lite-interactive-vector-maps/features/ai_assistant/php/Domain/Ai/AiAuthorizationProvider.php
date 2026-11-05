<?php

namespace MapSVG;

/** Optional server-owned authorization. Providers never contribute public secrets. */
interface AiAuthorizationProvider
{
    /** Cheap local availability check; must not enroll or perform network requests. */
    public function configured(): bool;

    public function credential(): string;

    /** Reauthorize immediately before each request, including retained clients. */
    public function transport(string $url, string $credential, string $body = ''): array;
}
