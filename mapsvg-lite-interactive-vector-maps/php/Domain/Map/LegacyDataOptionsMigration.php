<?php
namespace MapSVG;

/** Normalize only legacy scalar authoring options before creating Page bindings. */
final class LegacyDataOptionsMigration
{
    private static function boolean($value): bool
    {
        if (is_bool($value)) return $value;
        if ($value === null || $value === '') return false;
        if (!is_scalar($value)) throw new \UnexpectedValueException('A legacy data setting is not a supported boolean.');
        if (in_array(strtolower((string) $value), ['1', 'true', 'on', 'yes', 'y'], true)) return true;
        if (in_array(strtolower((string) $value), ['0', 'false', 'off', 'no', 'n'], true)) return false;
        throw new \UnexpectedValueException('A legacy data setting is not a supported boolean.');
    }

    private static function flags(\stdClass $options, array $names): void
    {
        foreach ($names as $name) if (property_exists($options, $name)) $options->{$name} = self::boolean($options->{$name});
    }

    private static function integer($value): int
    {
        if ($value === null || $value === '') return 0;
        // Match the old client parseInt(value,10), including numeric strings.
        if ((!is_string($value) && !is_int($value) && !is_float($value)) || !preg_match('/\A\s*([+-]?\d+)/', (string) $value, $match)) {
            throw new \UnexpectedValueException('A legacy pagination/refetch setting is not numeric.');
        }
        if (!is_finite((float) $match[1]) || abs((float) $match[1]) > PHP_INT_MAX) throw new \UnexpectedValueException('A legacy pagination/refetch number is too large.');
        return (int) $match[1];
    }

    private static function object(\stdClass $options, string $key): ?\stdClass
    {
        if (!property_exists($options, $key)) return null;
        if (!$options->{$key} instanceof \stdClass) throw new \UnexpectedValueException('Invalid legacy ' . $key . ' settings.');
        return $options->{$key};
    }

    public static function apply(\stdClass $options): void
    {
        $database = self::object($options, 'database');
        if ($database) {
            self::flags($database, ['on', 'loadOnStart', 'noFiltersNoLoad']);
            $pagination = self::object($database, 'pagination');
            if ($pagination) {
                self::flags($pagination, ['on']);
                if (property_exists($pagination, 'perpage')) {
                    $pagination->perpage = max(0, self::integer($pagination->perpage));
                    // v8 used zero/negative perpage as "no LIMIT"; native take=0
                    // means zero rows. Use the native unpaged compatibility path.
                    if ($pagination->perpage === 0) $pagination->on = false;
                    if (!empty($pagination->on) && $pagination->perpage > 5000) throw new \UnexpectedValueException('The legacy page size exceeds the v9 limit of 5000; review pagination before migration.');
                }
            }
            foreach (['autoRefetch', 'regionsAutoRefetch'] as $name) {
                if (property_exists($database, $name) && ($database->{$name} === null || $database->{$name} === [])) $database->{$name} = (object) ['on' => false, 'value' => 0, 'unit' => 's'];
                $refetch = self::object($database, $name);
                if (!$refetch) continue;
                self::flags($refetch, ['on']);
                if (property_exists($refetch, 'value')) $refetch->value = self::integer($refetch->value);
                // Old runtime treated unknown units as seconds, never hours.
                if (property_exists($refetch, 'unit') && !in_array($refetch->unit, ['s', 'm', 'h'], true)) $refetch->unit = 's';
            }
        }
        $menu = self::object($options, 'menu');
        if ($menu) {
            self::flags($menu, ['on', 'hideOnMobile', 'search', 'searchFallback', 'showMapOnClick', 'customContainer']);
            if (property_exists($menu, 'categories') && ($menu->categories === null || $menu->categories === [])) $menu->categories = (object) ['on' => false];
            $categories = self::object($menu, 'categories');
            if ($categories) self::flags($categories, ['on', 'hideEmpty', 'collapse', 'collapseOther']);
            if (isset($menu->sortDirection)) {
                $direction = strtolower((string) $menu->sortDirection);
                if (!in_array($direction, ['asc', 'desc'], true)) throw new \UnexpectedValueException('Invalid legacy Directory sort direction.');
                $menu->sortDirection = $direction;
            }
        }
        $filters = self::object($options, 'filters');
        if ($filters) self::flags($filters, ['on', 'hide', 'clearButton', 'searchButton']);
        // Native scenes[].dataBindings, params, filter values (including zero
        // and false), source metadata and opaque extension dictionaries stay raw.
    }
}
