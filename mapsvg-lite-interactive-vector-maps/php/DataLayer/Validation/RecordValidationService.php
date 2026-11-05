<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Validation;

use MapSVG\Schema;
use Opis\JsonSchema\Errors\ErrorFormatter;
use Opis\JsonSchema\Errors\ValidationError;
use Opis\JsonSchema\Validator;

/**
 * Validates the public/domain record shape against Schema::zodSettings.
 *
 * Validation happens before record mapping. A temporary projection may
 * normalize legacy form scalars for validation only; the original record is
 * never mutated or returned from this service.
 */
final class RecordValidationService
{
    private const MAX_ERRORS = 50;

    /** @param mixed $record */
    public function validate(
        Schema $schema,
        $record,
        string $operation = 'write'
    ): void {
        $settings = $schema->zodSettings ?? null;
        if ($settings === null || $settings === '') {
            return;
        }

        try {
            $settings = Schema::normalizeZodSettings($settings);
        } catch (\Throwable $error) {
            throw RecordValidationException::forConfiguration(
                $error->getMessage()
            );
        }

        if ($settings === null
            || ($settings['writeValidation'] ?? null) === 'off') {
            return;
        }

        $schemaArray = json_decode($settings['jsonSchema'], true);
        $schemaObject = json_decode($settings['jsonSchema']);
        if (!is_array($schemaArray) || !is_object($schemaObject)) {
            throw RecordValidationException::forConfiguration(
                'Record validation JSON Schema must be an object.'
            );
        }

        $recordData = self::recordData($record);
        $projected = self::projectRecordForValidation(
            $recordData,
            $schemaArray
        );

        try {
            $json = ValidationJson::encode(
                (object) $projected,
                JSON_UNESCAPED_UNICODE
                    | JSON_UNESCAPED_SLASHES
                    | JSON_THROW_ON_ERROR
            );
            $validationData = json_decode(
                $json,
                false,
                512,
                JSON_THROW_ON_ERROR
            );
        } catch (\Throwable $error) {
            throw RecordValidationException::forIssues(array(array(
                'path' => array(),
                'message' => 'Record must be JSON-compatible: '
                    . $error->getMessage(),
                'keyword' => 'json',
            )));
        }

        try {
            $validator = new Validator(
                null,
                self::MAX_ERRORS,
                false
            );
            $result = $validator->validate(
                $validationData,
                $schemaObject
            );
        } catch (\Throwable $error) {
            throw RecordValidationException::forConfiguration(
                $error->getMessage()
            );
        }

        if ($result->isValid()) {
            return;
        }

        $error = $result->error();
        if ($error === null) {
            throw RecordValidationException::forIssues(array(array(
                'path' => array(),
                'message' => 'Record validation failed.',
                'keyword' => 'validation',
            )));
        }

        throw RecordValidationException::forIssues(
            $this->normalizeIssues($error)
        );
    }

    /**
     * Build the validation-only equivalent of the JS projection.
     *
     * Historical MapSVG forms can expose numeric values as strings. Those
     * strings are validated as JSON numbers while the original legacy value is
     * still persisted unchanged. An empty optional numeric control is omitted
     * from the validation projection.
     *
     * @param array<string,mixed> $record
     * @param array<string,mixed> $jsonSchema
     * @return array<string,mixed>
     */
    public static function projectRecordForValidation(
        array $record,
        array $jsonSchema
    ): array {
        $properties = $jsonSchema['properties'] ?? null;
        if (!is_array($properties)) {
            return $record;
        }

        $required = array();
        if (isset($jsonSchema['required'])
            && is_array($jsonSchema['required'])) {
            foreach ($jsonSchema['required'] as $name) {
                if (is_string($name)) {
                    $required[$name] = true;
                }
            }
        }

        $projected = $record;
        foreach ($properties as $name => $node) {
            if (!is_string($name)
                || !array_key_exists($name, $projected)
                || !is_array($node)) {
                continue;
            }

            $type = self::propertyType($node);
            if ($type !== 'number' && $type !== 'integer') {
                continue;
            }

            $value = $projected[$name];
            if ($value === '' && !isset($required[$name])) {
                unset($projected[$name]);
                continue;
            }

            if (!is_string($value)) {
                continue;
            }

            $trimmed = trim($value);
            if ($trimmed === ''
                || !preg_match(
                    '/^[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][+-]?\\d+)?$/D',
                    $trimmed
                )) {
                continue;
            }

            $projected[$name] = $trimmed + 0;
        }

        return $projected;
    }

    /** @param mixed $record @return array<string,mixed> */
    private static function recordData($record): array
    {
        if (is_object($record) && method_exists($record, 'getData')) {
            $record = $record->getData();
        } elseif (is_object($record)) {
            $record = get_object_vars($record);
        }

        if (!is_array($record)) {
            throw new \InvalidArgumentException(
                'Record validation requires an array or object.'
            );
        }

        return $record;
    }

    /** @param array<string,mixed> $node */
    private static function propertyType(array $node): ?string
    {
        $type = $node['type'] ?? null;
        if (is_string($type)) {
            return $type;
        }
        if (!is_array($type)) {
            return null;
        }

        $nonNull = array_values(array_filter(
            $type,
            static function ($value): bool {
                return $value !== 'null';
            }
        ));
        if (count($nonNull) === 1 && is_string($nonNull[0])) {
            return $nonNull[0];
        }

        return null;
    }

    /**
     * @return array<int,array{path:array<int|string>,message:string,keyword:string}>
     */
    private function normalizeIssues(ValidationError $error): array
    {
        $formatter = new ErrorFormatter();
        $issues = array();

        foreach ($this->leafErrors($error) as $leaf) {
            if ($leaf->keyword() === 'required') {
                $missing = $leaf->args()['missing'] ?? array();
                if (is_array($missing) && $missing !== array()) {
                    foreach ($missing as $name) {
                        if (!is_string($name) && !is_int($name)) {
                            continue;
                        }
                        $issues[] = array(
                            'path' => array_merge(
                                $leaf->data()->fullPath(),
                                array($name)
                            ),
                            'message' => 'Required',
                            'keyword' => 'required',
                        );
                    }
                    continue;
                }
            }

            $issues[] = array(
                'path' => $leaf->data()->fullPath(),
                'message' => $formatter->formatErrorMessage($leaf),
                'keyword' => $leaf->keyword(),
            );
        }

        if ($issues === array()) {
            $issues[] = array(
                'path' => array(),
                'message' => 'Record validation failed.',
                'keyword' => 'validation',
            );
        }

        return $issues;
    }

    /** @return ValidationError[] */
    private function leafErrors(ValidationError $error): array
    {
        $children = $error->subErrors();
        if ($children === array()) {
            return array($error);
        }

        $leaves = array();
        foreach ($children as $child) {
            foreach ($this->leafErrors($child) as $leaf) {
                $leaves[] = $leaf;
            }
        }
        return $leaves;
    }
}
