<?php

namespace MapSVG;

/**
 * Map Controller Class
 * @package MapSVG
 */
class RepositoryFactory
{
  private const INTERNAL_SCHEMA_NAMES = ['map', 'schema', 'token', 'log', 'postType', 'import_settings'];

  /** Reserved repositories are available to server code, never through collection REST routes. */
  public static function isInternalSchemaName(string $name): bool
  {
    foreach (self::INTERNAL_SCHEMA_NAMES as $reserved) {
      if (strcasecmp($name, $reserved) === 0) return true;
    }
    return false;
  }

  /**
   * @var Schema
   */
  public $schema;

  public function __construct() {}

  public static function get($schemaName)
  {
    $schema = null;
    if (in_array($schemaName, self::INTERNAL_SCHEMA_NAMES, true)) {
      $schema = static::getDefaultSchema($schemaName);
    } else {
      $schema = static::loadSchema($schemaName);
    }

    if (!$schema) {
      return null;
    }

    return static::getRepo($schema);
  }

  /**
   * @param schemaNameOrObject string|Schema
   */
  public static function create($schemaNameOrObject)
  {
    $schema = null;
    if (is_string($schemaNameOrObject)) {
      $schema = static::getDefaultSchema($schemaNameOrObject);
      $schema->name = $schemaNameOrObject;
    } elseif (is_array($schemaNameOrObject) || is_object($schemaNameOrObject)) {
      $schema = $schemaNameOrObject;
    }

    $repo = static::getRepoForSchema("schema");
    $schemaInDb = $repo->findByName($schema->name);
    if (!$schemaInDb) {
      $repo->create($schema);
    }

    return static::getRepo($schema);
  }

  private static function getRepo($schema)
  {
    if (!is_object($schema)) {
      return null;
    }



    if ($schema->remote) {
      throw new \Error("Remote repository is unavaiable in Lite version");
      
    } else {
      $name = $schema->objectNameSingular;

      switch ($name) {
        case "schema":
          $repo = new SchemaRepository($schema);
          break;
        case "map":
          $repo = new MapsRepository($schema);
          break;
        case "region":
          $repo = new RegionsRepository($schema);
          break;
        
        
        case "postType":

          $repo = new PostTypesRepository($schema);
          break;
        case "importSetting":
          $repo = new ImportSettingsRepository($schema);
          break;
        case "object":
        default:
          $repo = new ObjectsRepository($schema);
          break;
      }
      return $repo;
    }
  }

  /**
   * Loads Entity table schema
   * @param Schema|string
   * @return Schema|null
   */
  public static function loadSchema($schemaNameOrObject)
  {
    $schema = null;
    if (is_string($schemaNameOrObject)) {
      /**
       * @var SchemaRepository
       */
      $schemaRepo = static::getRepoForSchema("schema");
      $schema = $schemaRepo->findByName($schemaNameOrObject);
    } else {
      $schema = new Schema($schemaNameOrObject);
    }

    return $schema;
  }

  private static function getRepoForSchema($schemaName)
  {
    $schema = static::getDefaultSchema($schemaName);
    return static::getRepo($schema);
  }

  /**
   * Reads the default schema from .json file which should be present in the same folder where
   * repository class is located
   *
   * @param Schema | string $name
   * @return \Mapsvg\Schema
   * @throws \ReflectionException
   */
  public static function getDefaultSchema($name, $schemaType = "")
  {
    $schemaType = $schemaType ? $schemaType : Schema::getTypeByName($name);

    $reflector = new \ReflectionClass(get_called_class());
    $filename = $reflector->getFileName();
    $dir = dirname($filename);
    $schema_file = $dir . '/schema/' . $schemaType . '.json';

    require_once(ABSPATH . 'wp-admin/includes/file.php');
    WP_Filesystem();
    global $wp_filesystem;

    if (!$wp_filesystem->exists($schema_file)) {
      throw new \Exception("Schema file not found: " . esc_html($schema_file));
    }

    $fileContents = $wp_filesystem->get_contents($schema_file);
    if ($fileContents === false) {
      throw new \Exception("Failed to read schema file");
    }

    $fileContents = str_replace("%name%", $name, $fileContents);
    $schemaJSON = json_decode($fileContents, true);
    if (!$schemaJSON) {
      throw new \Exception("Invalid JSON in schema file: " . esc_html($schema_file));
    }

    return new Schema($schemaJSON);
  }
}
