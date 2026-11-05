<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Schema;

use MapSVG\Schema;

/** Derives explicit, idempotent row transforms from old/new UI fields. */
final class SchemaDataTransformPlanner
{
    /** @return SchemaDataTransform[] */
    public function plan(Schema $previous, Schema $next): array
    {
        $oldFields = $this->fieldsByName($previous);
        $newFields = $this->fieldsByName($next);
        $transforms = array();

        foreach ($newFields as $name => $newField) {
            if (!isset($oldFields[$name])) {
                continue;
            }
            $oldField = $oldFields[$name];
            $oldType = strtolower((string) ($oldField['type'] ?? 'text'));
            $newType = strtolower((string) ($newField['type'] ?? 'text'));
            $oldMulti = $oldType === 'select'
                && $this->isMultiselect($oldField);
            $newMulti = $newType === 'select'
                && $this->isMultiselect($newField);

            if (($oldType === 'select' || $newType === 'select')
                && $oldMulti !== $newMulti) {
                $transforms[] = SchemaDataTransform::clearColumn($name);
                continue;
            }

            $oldOptions = $this->options($oldField);
            $newOptions = $this->options($newField);
            foreach ($newOptions as $valueKey => $newOption) {
                $newLabel = $newOption['label'];
                $oldLabel = isset($oldOptions[$valueKey])
                    ? $oldOptions[$valueKey]['label']
                    : null;

                if ($newMulti) {
                    if ($oldLabel !== null && $oldLabel !== $newLabel) {
                        $transforms[] = SchemaDataTransform::replaceMultiLabel(
                            $name,
                            $oldLabel,
                            $newLabel
                        );
                    }
                    continue;
                }

                if ($this->hasTextSidecar($newType, $newField)
                    && $oldLabel !== $newLabel) {
                    $transforms[] = SchemaDataTransform::updateChoiceText(
                        $name,
                        $name . '_text',
                        $newOption['value'],
                        $newLabel
                    );
                }
            }
        }

        return $transforms;
    }

    /** @return array<string, array<string, mixed>> */
    private function fieldsByName(Schema $schema): array
    {
        $fields = array();
        foreach ($schema->getFields() as $rawField) {
            $field = is_object($rawField)
                ? get_object_vars($rawField)
                : (array) $rawField;
            $name = trim((string) ($field['name'] ?? ''));
            if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $name)) {
                throw new \InvalidArgumentException(
                    'Invalid schema-transform field identifier.'
                );
            }
            $fields[$name] = $field;
        }
        return $fields;
    }

    /**
     * @param array<string, mixed> $field
     * @return array<string, array{value:mixed,label:string}>
     */
    private function options(array $field): array
    {
        if (!isset($field['options']) || !is_iterable($field['options'])) {
            return array();
        }
        $options = array();
        foreach ($field['options'] as $rawOption) {
            $option = is_object($rawOption)
                ? get_object_vars($rawOption)
                : (array) $rawOption;
            if (!array_key_exists('value', $option)) {
                continue;
            }
            $value = $option['value'];
            if (!is_scalar($value) || is_bool($value)) {
                throw new \InvalidArgumentException(
                    'Choice option values must be strings or numbers.'
                );
            }
            $label = (string) ($option['label'] ?? $value);
            $options[gettype($value) . ':' . (string) $value] = array(
                'value' => $value,
                'label' => $label,
            );
        }
        return $options;
    }

    /** @param array<string, mixed> $field */
    private function isMultiselect(array $field): bool
    {
        return isset($field['multiselect'])
            && filter_var($field['multiselect'], FILTER_VALIDATE_BOOLEAN);
    }

    /** @param array<string, mixed> $field */
    private function hasTextSidecar(
        string $type,
        array $field
    ): bool {
        return ($type === 'select' && !$this->isMultiselect($field))
            || $type === 'radio'
            || $type === 'status';
    }
}
