<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Validation;

use MapSVG\DataLayer\Query\QueryLimits;
use MapSVG\Schema;
use Opis\JsonSchema\Errors\ErrorFormatter;
use Opis\JsonSchema\Errors\ValidationError;
use Opis\JsonSchema\Validator;

/** Validates generated operation contracts without replacing planner safety guards. */
final class OperationValidationService
{
    private Schema $schema;
    private OperationSchemaCompiler $compiler;

    public function __construct(
        Schema $schema,
        ?QueryLimits $limits = null
    ) {
        $this->schema = $schema;
        $this->compiler = new OperationSchemaCompiler($limits);
    }

    public static function writeValidationEnabled(Schema $schema): bool
    {
        if (SystemModelSchemaRegistry::supports($schema)) {
            return true;
        }

        $settings = $schema->zodSettings ?? null;
        if ($settings === null || $settings === '') {
            return false;
        }

        $settings = Schema::normalizeZodSettings($settings);
        return $settings !== null
            && ($settings['writeValidation'] ?? null) !== 'off';
    }

    /** @param array<string,mixed> $input */
    public function validateRecord(array $input): void
    {
        $jsonSchema = $this->compiler->recordSchema($this->schema);
        $this->validate(
            'record',
            RecordValidationService::projectRecordForValidation(
                $input,
                $jsonSchema
            ),
            $jsonSchema
        );
    }

    /** @param array<string,mixed> $input */
    public function validateFindMany(array $input): void
    {
        $this->validate(
            'findMany',
            $input,
            $this->compiler->findManyInputSchema($this->schema)
        );
    }

    /** @param array<string,mixed> $input */
    public function validateCreate(array $input): void
    {
        $jsonSchema = $this->compiler->createInputSchema($this->schema);
        $this->validate(
            'create',
            RecordValidationService::projectRecordForValidation(
                $input,
                $jsonSchema
            ),
            $jsonSchema
        );
    }

    /** @param array<string,mixed> $input */
    public function validateUpdate(array $input): void
    {
        $jsonSchema = $this->compiler->updateInputSchema($this->schema);
        $validationInput = $input;

        // Canonical operation schemas use the public `id` alias. Preserve
        // compatibility with direct PHP callers that still send the schema's
        // physical/custom primary-key field instead.
        $primary = (string) $this->schema->getPrimaryKeyFieldName();
        if ($primary !== ''
            && $primary !== 'id'
            && !array_key_exists('id', $validationInput)
            && array_key_exists($primary, $validationInput)) {
            $validationInput['id'] = $validationInput[$primary];
        }

        $this->validate(
            'update',
            RecordValidationService::projectRecordForValidation(
                $validationInput,
                $jsonSchema
            ),
            $jsonSchema
        );
    }

    /**
     * @param array<string,mixed> $input
     * @param array<string,mixed> $jsonSchema
     */
    private function validate(
        string $operation,
        array $input,
        array $jsonSchema
    ): void {
        try {
            $schemaObject = json_decode(
                ValidationJson::encode(
                    $jsonSchema,
                    JSON_UNESCAPED_UNICODE
                        | JSON_UNESCAPED_SLASHES
                        | JSON_THROW_ON_ERROR
                ),
                false,
                512,
                JSON_THROW_ON_ERROR
            );
            $dataObject = json_decode(
                ValidationJson::encode(
                    $input === array() ? new \stdClass() : $input,
                    JSON_UNESCAPED_UNICODE
                        | JSON_UNESCAPED_SLASHES
                        | JSON_THROW_ON_ERROR
                ),
                false,
                512,
                JSON_THROW_ON_ERROR
            );

            $result = (new Validator(null, 50, false))->validate(
                $dataObject,
                $schemaObject
            );
        } catch (\Throwable $error) {
            throw new OperationValidationException(
                $operation,
                array(array(
                    'path' => array(),
                    'message' => $error->getMessage(),
                    'keyword' => 'schema',
                )),
                'Invalid ' . $operation . ' operation schema.'
            );
        }

        if ($result->isValid()) {
            return;
        }

        $error = $result->error();
        $issues = $error === null
            ? array(array(
                'path' => array(),
                'message' => 'Operation validation failed.',
                'keyword' => 'validation',
            ))
            : $this->normalizeIssues($error);

        throw new OperationValidationException(
            $operation,
            $issues
        );
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
                if (is_array($missing)) {
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
                    if ($missing !== array()) {
                        continue;
                    }
                }
            }

            $issues[] = array(
                'path' => $leaf->data()->fullPath(),
                'message' => $formatter->formatErrorMessage($leaf),
                'keyword' => $leaf->keyword(),
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
