<?php

namespace MapSVG;

/** Serialize SVG ownership decisions with App/draft/version reference writes. */
final class AppSvgReferenceLock
{
    private static $held = [];

    public static function run($db, callable $operation)
    {
        $name = 'mapsvg-svg-' . hash('sha256', $db->mapsvg_prefix);
        $name = substr($name, 0, 64);
        $key = spl_object_hash($db->db ?? $db) . ':' . $name;
        if (isset(self::$held[$key])) return $operation();
        if ((int) $db->get_var($db->prepare('SELECT GET_LOCK(%s, 10)', $name)) !== 1) {
            throw new \RuntimeException('SVG references are busy. Please retry saving.', 503);
        }
        self::$held[$key] = true;
        try { return $operation(); }
        finally {
            unset(self::$held[$key]);
            $db->get_var($db->prepare('SELECT RELEASE_LOCK(%s)', $name));
        }
    }
}
