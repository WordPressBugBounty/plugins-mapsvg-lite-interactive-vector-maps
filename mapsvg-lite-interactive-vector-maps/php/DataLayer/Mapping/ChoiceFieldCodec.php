<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Mapping;

/** Pure select/radio/status value and sidecar conversion. */
final class ChoiceFieldCodec
{
    private LegacyJsonCodec $json;

    public function __construct(?LegacyJsonCodec $json = null)
    {
        $this->json = $json ?? new LegacyJsonCodec();
    }

    public function criterion(object $field, $value)
    {
        if ($this->isMulti($field)) {
            return is_string($value) ? $value : $this->json->encode($value);
        }

        foreach ($this->options($field) as $option) {
            if ((string) ($option['value'] ?? null) === (string) $value
                || (string) ($option['label'] ?? null) === (string) $value) {
                return $option['value'] ?? null;
            }
        }
        return '';
    }

    /** @return array<string, mixed> */
    public function encode(object $field, $value): array
    {
        $name = (string) $field->name;
        if ($this->isMulti($field)) {
            return array($name => $this->json->encode($value));
        }

        $storage = array($name => '', $name . '_text' => '');
        foreach ($this->options($field) as $option) {
            $optionValue = $option['value'] ?? null;
            $optionLabel = $option['label'] ?? null;
            if ((string) $optionValue === (string) $value
                || (string) $optionLabel === (string) $value) {
                $storage[$name] = $optionValue;
                $storage[$name . '_text'] = $optionLabel;
                break;
            }
        }
        return $storage;
    }

    /** @param array<string, mixed> $row @return array<string, mixed> */
    public function decode(object $field, array $row): array
    {
        $name = (string) $field->name;
        $type = strtolower((string) ($field->type ?? 'select'));
        $public = array();

        if ($type === 'status') {
            $public[$name] = array_key_exists($name, $row)
                ? $this->legacyScalar($row[$name], false)
                : null;
        } elseif (!empty($row[$name])) {
            $value = $row[$name];
            if ($this->isMulti($field) && is_string($value)) {
                // Empty JSON lists are still lists. Leaving "[]" as text makes
                // template checks such as tags.length incorrectly render labels.
                $decoded = $this->json->decode($value, false);
                $public[$name] = is_array($decoded) ? $decoded : $value;
            } else {
                $public[$name] = is_string($value) && strpos($value, '[{') === 0
                    ? $this->json->decode($value, false)
                    : $this->legacyScalar($value, false);
            }
        }

        if (!empty($row[$name . '_text'])) {
            $public[$name . '_text'] = $row[$name . '_text'];
        }
        return $public;
    }

    private function isMulti(object $field): bool
    {
        return isset($field->multiselect)
            && filter_var($field->multiselect, FILTER_VALIDATE_BOOLEAN);
    }

    /** @return array<int, array<string, mixed>> */
    private function options(object $field): array
    {
        if (!isset($field->options) || !is_iterable($field->options)) {
            return array();
        }

        $options = array();
        foreach ($field->options as $option) {
            $options[] = is_object($option) ? get_object_vars($option) : (array) $option;
        }
        return $options;
    }

    private function legacyScalar($value, bool $nullAsEmpty)
    {
        if ($value === null) {
            return $nullAsEmpty ? '' : null;
        }
        if (is_bool($value)) {
            return $value ? '1' : '0';
        }
        if (is_int($value) || is_float($value)) {
            return (string) $value;
        }
        return $value;
    }
}
