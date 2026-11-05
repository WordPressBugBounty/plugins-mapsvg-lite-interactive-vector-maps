<?php

declare(strict_types=1);
namespace MapSVG\DataLayer\SavedQuery;

/** Publishing or editing exposed Queries is more privileged than ordinary Query CRUD. */
final class QueryRpcManagementPolicy
{
    public static function assertWrite(?array $current, array $payload): void
    {
        $old = $current['rpc']['access'] ?? 'editor';
        $new = $payload['rpc']['access'] ?? $old;
        if (in_array($old, array('public', 'authenticated'), true)
            || in_array($new, array('public', 'authenticated'), true)) {
            if (!function_exists('current_user_can') || !current_user_can('manage_options')) {
                throw new \DomainException('Administrator permission is required to change exposed Queries.');
            }
        }
    }
}
