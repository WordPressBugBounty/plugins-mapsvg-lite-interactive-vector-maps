<?php
namespace MapSVG;

/** Detached appearance projection. No Collection/status/Location records are changed. */
final class LegacyAppearanceMigration
{
    private static function enabled($value): bool
    {
        if (is_bool($value)) return $value;
        if ($value === null || $value === '') return false;
        if (is_scalar($value)) {
            $flag = strtolower((string) $value);
            if (in_array($flag, ['1', 'true', 'on', 'yes', 'y'], true)) return true;
            if (in_array($flag, ['0', 'false', 'off', 'no', 'n'], true)) return false;
        }
        throw new \UnexpectedValueException('A legacy appearance setting is not a supported boolean.');
    }
    private static function value($value): string { return is_bool($value) ? ($value ? 'true' : 'false') : (string) $value; }
    private static function path(string $field, string $source): string
    {
        $field = preg_replace('/\A(?:region|object)\./i', '', $field);
        if ($field === '' || array_intersect(explode('.', $field), ['', '__proto__', 'prototype', 'constructor'])) throw new \UnexpectedValueException('The legacy Choropleth field is invalid; review its data source before migration.');
        return ($source === 'objects' ? 'object.' : 'region.') . $field;
    }
    private static function number($value): ?float
    {
        if ($value === null || $value === '') return null;
        if (!is_numeric($value) || !is_finite((float) $value)) throw new \UnexpectedValueException('A legacy Choropleth boundary is not numeric.');
        return (float) $value;
    }

    public static function apply(\stdClass $options, array $schemaStatuses = [], ?\stdClass $savedOptions = null): void
    {
        $old = $options->choropleth ?? null;
        if (!$old instanceof \stdClass) return;
        $old->on = self::enabled($old->on ?? false);
        foreach (['bubbleMode'] as $flag) if (property_exists($old, $flag)) $old->{$flag} = self::enabled($old->{$flag});
        foreach (['sourceFieldSelect', 'coloring'] as $key) {
            $block = $key === 'coloring' ? ($old->coloring->legend ?? null) : ($old->{$key} ?? null);
            if ($block instanceof \stdClass && property_exists($block, 'on')) $block->on = self::enabled($block->on);
        }
        if (property_exists($options, 'statusSyncOn')) $options->statusSyncOn = self::enabled($options->statusSyncOn);
        // Authored native rules, including explicit off, are the source of truth.
        if (($options->regionDataRules ?? null) instanceof \stdClass || !$old->on) return;
        if (self::enabled($old->bubbleMode ?? false)) throw new \UnexpectedValueException('Legacy Choropleth bubble mode has no lossless v9 Data rules conversion; keep this publication in v8.');
        if (self::enabled($old->sourceFieldSelect->on ?? false)) throw new \UnexpectedValueException('Legacy Choropleth source-field switching requires review before conversion to one v9 Data rules field.');
        $source = ($old->source ?? 'regions') === 'database' ? 'objects' : 'regions';
        $field = (string) ($options->regionChoroplethField ?? $old->sourceField ?? '');
        $mode = ($old->coloring->mode ?? 'gradient') === 'palette' ? 'ranges' : 'gradient';
        $saved = $savedOptions->choropleth ?? $old;
        $exception = static function (): array { return ['on' => false, 'color' => '']; };
        $legend = $old->coloring->legend ?? new \stdClass();
        $rules = [
            'version' => 1, 'on' => true, 'field' => self::path($field, $source), 'source' => $source,
            'mode' => $mode, 'rows' => [], 'multiple' => 'first', 'priority' => ['field', 'filtered', 'noObjects'],
            // Persisted min/max/maxAdjusted in v8 were a loaded-data cache, not manual authoring bounds.
            'gradient' => ['min' => null, 'max' => null, 'low' => (string) ($saved->colors->low ?? $saved->coloring->gradient->colors->low ?? $old->colors->low), 'high' => (string) ($saved->colors->high ?? $saved->coloring->gradient->colors->high ?? $old->colors->high)],
            'exceptions' => ['noData' => $exception(), 'unmatched' => $exception(), 'filtered' => $exception(), 'noObjects' => $exception(), 'multiple' => $exception()],
            'legend' => ['on' => self::enabled($legend->on ?? true), 'title' => (string) ($legend->title ?? ''),
                'text' => (string) ($legend->text ?? ''), 'description' => (string) ($legend->description ?? ''),
                'layout' => ($legend->layout ?? 'vertical') === 'vertical' ? 'vertical' : 'horizontal',
                'lowLabel' => (string) ($saved->labels->low ?? $saved->coloring->gradient->labels->low ?? $old->labels->low),
                'highLabel' => (string) ($saved->labels->high ?? $saved->coloring->gradient->labels->high ?? $old->labels->high)],
        ];
        $rules['exceptions']['noData'] = ['on' => true, 'color' => (string) ($saved->colors->noData ?? $saved->coloring->noData->color ?? $old->colors->noData), 'label' => (string) ($old->coloring->noData->description ?? 'No data')];
        if ($mode === 'ranges') {
            foreach (($old->coloring->palette->colors ?? []) as $row) {
                $from = self::number($row->valueFrom ?? null); $to = self::number($row->valueTo ?? null);
                if ($from !== null && $to !== null && $from >= $to) throw new \UnexpectedValueException('A legacy Choropleth range is reversed or empty.');
                foreach ($rules['rows'] as $previous) if (($from ?? -INF) < ($previous['to'] ?? INF) && ($previous['from'] ?? -INF) < ($to ?? INF)) throw new \UnexpectedValueException('Legacy Choropleth ranges overlap; review them before migration.');
                $rules['rows'][] = ['label' => (string) ($row->description ?? ''), 'value' => '', 'from' => $from, 'to' => $to, 'color' => (string) ($row->color ?? '')];
            }
            $out = $old->coloring->palette->outOfRange ?? new \stdClass();
            $rules['exceptions']['unmatched'] = ['on' => (string) ($out->color ?? '') !== '', 'color' => (string) ($out->color ?? ''), 'label' => (string) ($out->description ?? 'Out of range')];
        }
        // Old status paint precedes Choropleth, and dynamic status can use a second field.
        // Keep that compatibility policy explicit rather than silently selecting one field.
        $statuses = ['0' => ['color' => '', 'disabled' => true], '1' => ['color' => '', 'disabled' => false]];
        foreach ($schemaStatuses as $status) {
            if (!isset($status->value) || $status->value === '') continue;
            $statuses[self::value($status->value)] = ['color' => (string) ($status->color ?? ''), 'disabled' => self::enabled($status->disabled ?? false)];
        }
        foreach ((array) ($options->regionStatuses ?? []) as $key => $status) {
            $previous = $statuses[$key] ?? ['color' => '', 'disabled' => false];
            $statuses[$key] = ['color' => (string) (($status->color ?? '') ?: ($options->colors->status->{$key} ?? $previous['color'])),
                'disabled' => property_exists($status, 'disabled') ? self::enabled($status->disabled) : $previous['disabled']];
        }
        foreach ((array) ($options->colors->status ?? []) as $key => $color) if (!isset($options->regionStatuses->{$key}) && (string) $color !== '') $statuses[$key] = ['color' => (string) $color, 'disabled' => $statuses[$key]['disabled'] ?? false];
        $priority = array_values(array_intersect((array) ($options->regionsDynamicStatusOrder ?? ['statusSync', 'noObjects', 'filtered']), ['statusSync', 'noObjects', 'filtered']));
        $priority = array_values(array_unique(array_merge($priority, ['statusSync', 'noObjects', 'filtered'])));
        $dynamic = [];
        foreach (['filtered', 'noObjects'] as $kind) {
            $value = $options->regionsDynamicStatus->{$kind} ?? null;
            // v8 treated filtered=false as unset, but noObjects=false as an explicit status identity.
            if ($value !== null && $value !== '' && !($kind === 'filtered' && $value === false)) $dynamic[$kind] = self::value($value);
        }
        if (!isset($dynamic['filtered']) && ($options->menu->source ?? '') === 'regions' && ($options->menu->filterout->field ?? '') === 'status') {
            $value = $options->menu->filterout->val ?? null;
            if ($value !== null && $value !== '' && $value !== false) $dynamic['filtered'] = self::value($value);
        }
        $sync = null;
        if (self::enabled($options->statusSyncOn ?? false) && !empty($options->statusSyncField)) {
            $sync = ['field' => (string) $options->statusSyncField, 'source' => ($options->statusSyncSource ?? 'objects') === 'regions' ? 'regions' : 'objects', 'multiple' => ($options->statusSyncMultiStrategy ?? 'priority') === 'special' ? 'special' : 'priority', 'rows' => []];
            foreach (($options->statusSyncMap ?? []) as $row) if (isset($row->status) && $row->status !== '') $sync['rows'][] = ['value' => self::value($row->value ?? ''), 'status' => self::value($row->status)];
        }
        $rules['legacyStatus'] = ['statuses' => (object) $statuses, 'priority' => $priority, 'dynamic' => (object) $dynamic, 'sync' => $sync];
        if ($mode === 'gradient' && $source === 'regions') $rules['legacyGradientDomain'] = 'svg-regions';
        $options->regionDataRules = json_decode(wp_json_encode($rules));
    }
}
