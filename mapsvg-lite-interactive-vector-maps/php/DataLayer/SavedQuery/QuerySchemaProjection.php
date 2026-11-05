<?php

declare(strict_types=1);
namespace MapSVG\DataLayer\SavedQuery;

use MapSVG\Schema;

/** Logical metadata only: no endpoints, credentials or runtime Schema objects cross the App seam. */
final class QuerySchemaProjection
{
    public static function fields(Schema $schema): array
    {
        $fields = array();
        foreach ($schema->getFields() as $field) {
            $name = $field->name;
            $fields[$name] = array('type' => $field->type, 'multiselect' => !empty($field->multiselect),
                'options' => $field->options ?? array(), 'dbType' => $field->db_type ?? null);
        }
        return $fields;
    }
    public static function revision(Schema $schema): string
    {
        return hash('sha256', json_encode(array($schema->id, $schema->name, $schema->type,
            $schema->getPrimaryKeyFieldName(), self::fields($schema)), JSON_THROW_ON_ERROR));
    }
}
