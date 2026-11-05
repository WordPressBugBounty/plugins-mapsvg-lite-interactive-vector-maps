<?php
namespace MapSVG;

/** Renderer identity belongs to the document, independently of plugin/database versions. */
final class AppEngine
{
    public const KEY = '_mapsvgEngine';
    public static function version(array $options): int { return isset($options[self::KEY]) ? ((int) $options[self::KEY] === 8 ? 8 : 9) : self::classify($options); }
    public static function classify(array $options): int
    {
        if (isset($options[self::KEY])) return (int) $options[self::KEY] === 8 ? 8 : 9;
        if (($options['layout']['mountMode'] ?? null) === 'tree' || isset($options['stateGraph'])) return 9;
        foreach (($options['templates'] ?? []) as $value) if (is_array($value) || is_object($value)) return 9;
        return 8;
    }

    /** Transform a detached working copy. Never writes shared schemas or the live Map. */
    public static function toV9(array $snapshot, $db = null): array
    {
        $legacy = self::version(json_decode(wp_json_encode($snapshot['options']), true)) === 8;
        if (!$legacy) return $snapshot;
        $options = json_decode(wp_json_encode($snapshot['options']));
        if (!$options instanceof \stdClass) throw new \InvalidArgumentException('Invalid legacy App document.');
        $savedOptions = json_decode(wp_json_encode($options));
        $options = LegacyLayoutMigration::defaults($options);
        if ($legacy) LegacyDataOptionsMigration::apply($options);
        if ($legacy) LegacyGalleryMigration::apply($options);
        $options->{self::KEY} = 9;
        foreach (($options->templates ?? new \stdClass()) as $name => $entry) {
            if (is_string($entry)) $options->templates->{$name} = (object) ['html' => $entry, 'css' => '', 'js' => '', 'type' => in_array($name, ['detailsViewRegion', 'detailsViewMarker', 'directoryItem', 'labelRegion', 'labelMarker'], true) ? 'partial' : 'default'];
        }
        $schemaStatuses = [];
        if (is_array($options->regionStatuses ?? null)) $options->regionStatuses = (object) $options->regionStatuses;
        if ($db) {
            if (isset($options->source) && is_string($options->source)) $options->source = LegacyV8::source($options->source);
            $name = $options->database->schemas->regions->name ?? $options->database->regionsTableName ?? ('regions_' . $snapshot['id']);
            $row = $db->get_row($db->prepare('SELECT fields FROM `' . $db->mapsvg_prefix . 'schema` WHERE name=%s', $name));
            foreach (json_decode($row->fields ?? '[]') ?: [] as $field) {
                if (($field->type ?? '') !== 'status' && ($field->name ?? '') !== 'status') continue;
                $schemaStatuses = (array) ($field->options ?? []);
                if (!isset($options->regionStatuses)) $options->regionStatuses = new \stdClass();
                foreach (($field->options ?? []) as $option) {
                    if (!isset($option->value) || $option->value === '') continue;
                    $key = is_bool($option->value) ? ($option->value ? 'true' : 'false') : (string) $option->value;
                    if (!isset($options->regionStatuses->{$key})) $options->regionStatuses->{$key} = $option;
                }
            }
            (new \MapSVG\DataLayer\SavedQuery\PageBindingMigration($db))->migrateOptions($options, (int) $snapshot['id']);
        }
        if ($legacy) LegacyAppearanceMigration::apply($options, $schemaStatuses, $savedOptions);
        LegacyLayoutMigration::apply($options);
        $snapshot['options'] = (array) $options;
        return $snapshot;
    }
}
