<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Validation;

use MapSVG\Schema;

/**
 * Code-owned public record contracts for MapSVG internal/system models.
 *
 * These schemas are intentionally conservative around historical scalar/null
 * representations. They are not editable through Database -> Fields.
 */
final class SystemModelSchemaRegistry
{
    private const DRAFT = 'https://json-schema.org/draft/2020-12/schema';

    /** @return array<string,mixed>|null */
    public static function forSchema(Schema $schema): ?array
    {
        $name = strtolower((string) $schema->getName());

        if ($name === 'maps' || $name === 'map') {
            return self::mapSchema();
        }
        if ($name === 'schema') {
            return self::schemaCatalogSchema();
        }
        if ($name === 'import_settings') {
            return self::importSettingsSchema();
        }

        return null;
    }

    public static function supports(Schema $schema): bool
    {
        return self::forSchema($schema) !== null;
    }

    /** @return array<string,mixed> */
    private static function mapSchema(): array
    {
        return self::looseObject(array(
            'id' => self::nullable(array('type' => 'integer')),
            'title' => self::nullable(array('type' => 'string')),
            'options' => array(
                'anyOf' => array(
                    array('type' => 'object'),
                    array('type' => 'array'),
                    array('type' => 'null'),
                ),
            ),
            'svgFilePath' => self::nullable(array('type' => 'string')),
            'svgFileLastChanged' => self::legacyInteger(),
            'version' => self::nullable(array('type' => 'string')),
            'status' => self::legacyInteger(),
            'statusChangedAt' => self::nullable(array('type' => 'string')),
            'optionsBroken' => array(
                'anyOf' => array(
                    array('type' => 'boolean'),
                    array('type' => 'integer'),
                ),
            ),
        ));
    }

    /** @return array<string,mixed> */
    private static function schemaCatalogSchema(): array
    {
        $nullableString = self::nullable(array('type' => 'string'));

        return self::looseObject(array(
            'id' => self::legacyInteger(),
            'title' => $nullableString,
            'name' => $nullableString,
            'type' => $nullableString,
            'fields' => array('type' => 'array'),
            'primaryKeyField' => $nullableString,
            'postType' => $nullableString,
            'objectNameSingular' => $nullableString,
            'objectNamePlural' => $nullableString,
            'apiEndpoints' => array(
                'anyOf' => array(
                    array('type' => 'array'),
                    array('type' => 'null'),
                ),
            ),
            'apiBaseUrl' => $nullableString,
            'apiAuthorization' => array(
                'anyOf' => array(
                    array('type' => 'object'),
                    array('type' => 'string'),
                    array('type' => 'null'),
                ),
            ),
            'regionSupport' => self::legacyBoolean(),
            'markerSupport' => self::legacyBoolean(),
            'bindings' => array(
                'anyOf' => array(
                    array('type' => 'object'),
                    array('type' => 'null'),
                ),
            ),
            'zodSettings' => array(
                'anyOf' => array(
                    array('type' => 'object'),
                    array('type' => 'null'),
                ),
            ),
        ));
    }

    /** @return array<string,mixed> */
    private static function importSettingsSchema(): array
    {
        $properties = array(
            'id' => self::legacyInteger(),
            'schema_id' => self::legacyInteger(),
            'schema_name' => self::nullable(array('type' => 'string')),
            'gsSync' => self::legacyBoolean(),
            'gsAutoRefetch' => self::legacyBoolean(),
            'gsSyncMode' => self::nullable(array('type' => 'string')),
            'gsCsvUrl' => self::nullable(array('type' => 'string')),
            'gsCsvHash' => self::nullable(array('type' => 'string')),
            'gsRefetchInterval' => self::legacyInteger(),
            'gsAutoId' => self::legacyBoolean(),
            'gsIdFieldName' => self::nullable(array('type' => 'string')),
            'gsSheetName' => self::nullable(array('type' => 'string')),
            'gsGeocode' => self::legacyBoolean(),
            'gsGeocodeConvertLatLngToAddress' => self::legacyBoolean(),
            'gsGeocodeConvertAddressToLatLng' => self::legacyBoolean(),
            'gsPaidGeocoding' => self::legacyBoolean(),
            'gsAppScriptUrl' => self::nullable(array('type' => 'string')),
            'gsSecret' => self::nullable(array('type' => 'string')),
            'gsImportFinishedAt' => self::nullable(array('type' => 'string')),
            'gsImportStartedAt' => self::nullable(array('type' => 'string')),
            'gsImportLastUpdatedAt' => self::nullable(array('type' => 'string')),
            'gsImportEstimatedSeconds' => self::legacyInteger(),
            'gsImportSource' => self::nullable(array('type' => 'string')),
            'gsImportSourceValid' => self::legacyBoolean(),
            'gsImportSkipFields' => self::nullable(array('type' => 'string')),
            'preflightToken' => self::nullable(array('type' => 'string')),
            'preflightStatus' => self::nullable(array('type' => 'string')),
            'preflightExpiresAt' => self::nullable(array('type' => 'string')),
            'preflightFilePath' => self::nullable(array('type' => 'string')),
            'preflightFileHash' => self::nullable(array('type' => 'string')),
            // Persistence boundary keeps this as raw JSON text.
            'preflightMeta' => self::nullable(array('type' => 'string')),
        );

        return self::looseObject($properties);
    }

    /**
     * @param array<string,mixed> $properties
     * @return array<string,mixed>
     */
    private static function looseObject(array $properties): array
    {
        return array(
            '$schema' => self::DRAFT,
            'type' => 'object',
            'properties' => $properties,
        );
    }

    /** @param array<string,mixed> $schema @return array<string,mixed> */
    private static function nullable(array $schema): array
    {
        return array(
            'anyOf' => array(
                $schema,
                array('type' => 'null'),
            ),
        );
    }

    /** @return array<string,mixed> */
    private static function legacyInteger(): array
    {
        return array(
            'anyOf' => array(
                array('type' => 'integer'),
                array('type' => 'string'),
                array('type' => 'null'),
            ),
        );
    }

    /** @return array<string,mixed> */
    private static function legacyBoolean(): array
    {
        return array(
            'anyOf' => array(
                array('type' => 'boolean'),
                array('type' => 'integer', 'enum' => array(0, 1)),
                array('type' => 'string', 'enum' => array('0', '1')),
                array('type' => 'null'),
            ),
        );
    }

    private function __construct()
    {
    }
}
