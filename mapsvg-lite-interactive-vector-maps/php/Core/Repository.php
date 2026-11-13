<?php

namespace MapSVG;

use Exception;
use JsonSerializable;

/**
 * Core Repository class.
 * Doing CRUD operations for Entities in the database.
 * Stores cached list of Entities received from the last query.
 * Contains Schema of the Entity.
 * @package MapSVG
 */
class Repository implements JsonSerializable
{
    public function __call($method, $arguments)
    {
        $callback = apply_filters('mapsvg_repository_method', null, $method);
        if (!is_callable($callback)) throw new \BadMethodCallException('Repository method is unavailable: ' . $method);
        return $callback($this, ...$arguments);
    }


	/** @var string Name of the Entity class */
	public static $className = 'Object';

	/* @var string $id Unique short name of the table */
	public $id;

	/* @var array  Array of Entities received from the database */
	protected $objects;

	/**
	 * @var Schema $schema  Class containing the list of DB fields and their settings
	 */
	public $schema;

	/**
	 * @var boolean Is repository remote or local
	 */
	public $remote;

	/* @var boolean Whether output JSON data should be provided with the Schema */
	private $renderJsonWithSchema = false;

	public $geocodingErrors;

	/** @var object Active concrete repository source selected by composition. */
	public $source;

	/** @var \MapSVG\DataLayer\Post\WordPressPostEnricher|null */
	private $v2PostEnricher;

	/** @var array<string,mixed>|null Original input for the scoped controller update. */
	private $controllerUpdateInput;

	/** @var mixed Exact merged record belonging to the controller input scope. */
	private $controllerUpdateRecord;

	/**
	 * @param Schema $schema
	 */
	public function __construct($schema = null)
	{

		if ($schema !== null) {
			$this->schema = $schema;
		} else {
			$this->loadSchema(static::getDefaultSchema());
		}

		$this->id = $this->schema->name;
		$this->geocodingErrors = [];
		$this->source =
			\MapSVG\DataLayer\Compatibility\RepositoryDataSourceFactory::forSchema(
				$this->schema
			);
	}

	/**
	 * Instance builder - calls setter methods for every given parameter
	 * @param array $params
	 * @return $this
	 */
	public function build($params)
	{
		foreach ($params as $paramName => $options) {
			$methodName = 'set' . ucfirst($paramName);
			if (method_exists($this, $methodName)) {
				$this->{$methodName}($options);
			}
		}
		return $this;
	}

	/**
	 * Returns the namespaced Entity class name
	 * @return string
	 */
	public function getModelClass()
	{
		return __NAMESPACE__ . '\\' . static::$className;
	}

	/**
	 * Creates new instance of the Entity class
	 * @return object
	 */
	public function newObject($data)
	{
		$class = $this->getModelClass();
		return new $class($data);
	}

	/**
	 * Tells that the result JSON should be provided with the Schema
	 * @return string
	 */
	public function withSchema()
	{
		$this->renderJsonWithSchema = true;
	}

	/**
	 * Specifies what data should be used for wp_json_encode()
	 * @return mixed
	 */
	#[\ReturnTypeWillChange]
	public function jsonSerialize()
	{
		$data = new \stdClass();
		if (empty($this->objects)) {
			$this->fill();
		}

		$data->{$this->schema->objectNamePlural} = array("items" => $this->objects);

		if ($this->renderJsonWithSchema) {
			$data->{$this->schema->objectNamePlural}["schema"] = $this->schema;
		}

		return $data;
	}

	/**
	 * Fills repository cache with Entities by using the Query object
	 * @param Query $query - Query for the database
	 * @param boolean $skipSchema - whether Schema loading should be skipped
	 * @return string
	 */
	public function fill($query = array(), $skipSchema = false)
	{
		$query = new Query($query);
		$this->objects = $this->find($query);
		if (!$skipSchema) {
			$this->loadSchema();
		}
		return $this;
	}

	/**
	 * Clears the Entity table in the database
	 */
	public function clear()
	{
		\MapSVG\Core\PostDataFeature::assertSchema($this->schema);
		if ($this->schema->isRemote()) {
			// Preserve the historical remote/API path exactly.
			$this->source->truncate();
			return;
		}

		if ($this->source instanceof
			\MapSVG\DataLayer\Compatibility\PlasmaDataSource) {
			$this->clearLocalCollection(false);
			return;
		}

		// Temporary diagnostic rollback path.
		$this->source->truncate();
	}

	protected function clearLocalCollection(
		bool $clearObjectRelations
	): int {
		$dataLayer = \MapSVG\DataLayer\DataLayerFactory::createV2(
			null,
			['force' => true, 'observe' => false]
		);
		$service = \MapSVG\DataLayer\Workflow\CollectionClearServiceFactory::forSchema(
			$dataLayer,
			$this->schema,
			$clearObjectRelations
		);

		return $service->clear();
	}

	/**
	 * Returns the Schema
	 * @return Schema
	 */
	public function getSchema()
	{
		return $this->schema;
	}

	/**
	 * Returns the entity class name without the namespace
	 * @return string
	 */
	public function getClassName()
	{
		return static::$className;
	}

	/**
	 * Returns the ID (short Entity table name)
	 * @return string
	 */
	public function getId()
	{
		return $this->id;
	}

	/**
	 * Returns a cached array of Entity objects
	 * @return array
	 */
	public function getObjects()
	{
		return $this->objects;
	}

	/**
	 * Loads Entity table schema
	 * @param array|null $schema
	 * @return Schema
	 */
	public function loadSchema($schema = null)
	{

		$this->schema = new Schema($schema);

		if ($schema) {
			$this->schema = new Schema($schema);
		} else {
			return;
			// /**
			//  * @var SchemaRepository
			//  */
			// $schemaRepo = RepositoryFactory::get("schema");
			// $this->schema = $schemaRepo->findByName();
		}

		$this->remote = $this->schema->remote;
		return $this->schema;
	}

	/**
	 * Returns a full table name of the Entity
	 * @return mixed
	 */
	public static function tableName(string $shortTableName)
	{
		return (new \MapSVG\DataLayer\PlasmaProvider())->physicalPrefix()
			. $shortTableName;
	}

	/**
	 * Returns a full table name of the Entity
	 * @return mixed
	 */
	public function getTableName()
	{
		if (is_object($this->source)
			&& method_exists($this->source, 'getTableName')) {
			return $this->source->getTableName();
		}
		return static::tableName((string) $this->id);
	}

	/**
	 * Returns a short table name of the Entity (without prefixes)
	 * @return mixed
	 */
	public function getTableNameShort()
	{
		return $this->id;
	}

	/**
	 * Creates new object
	 * @param array $data
	 */
	public function create($data)
	{
		\MapSVG\Core\PostDataFeature::assertSchema($this->schema);

		if (is_string($data)) {
			$data = json_decode($data, true);
		}

		if (!is_object($data)) {
			$object    = $this->newObject($data);
		} else {
			$object    = $data;
		}

		$this->validateRecordForWrite($object, 'create');
		$dataForDB = $this->encodeParams($object->getData());

		$data = $this->source->create($dataForDB);
		$pkField = $this->schema->getPrimaryKeyFieldName();
		$object->setId($data[$pkField]);

		return $object;
	}

	/**
	 * Returns a single Entity object by ID
	 * @return mixed
	 */
	public function findById($id)
	{
		\MapSVG\Core\PostDataFeature::assertSchema($this->schema);
		$pkField = $this->schema->getPrimaryKeyFieldName();
		$data = $this->source->findOne([$pkField => $id]);

		if ($this->schema->isRemote()) {
			return $data;
		} else {
			return $this->decodeParams((array)$data);
		}
	}

	/**
	 * Returns a single Entity object by query
	 * @param array $where
	 * @return mixed
	 */
	public function findOne($where)
	{
		\MapSVG\Core\PostDataFeature::assertSchema($this->schema);
		$data = $this->source->findOne($where);
		if ($this->schema->isRemote()) {
			return $data;
		} else {
			return $this->decodeParams((array)$data);
		}
		return $data;
	}



	/**
	 * Returns an array of Entities by provided Query
	 * @param Query $query Query for the database
	 * @return array<Schema>3
	 */
	public function find(?Query $query = null)
	{
		\MapSVG\Core\PostDataFeature::assertSchema($this->schema);
		if (!$query) {
			$query = new Query(array('perpage' => 0));
		}

		if ($this->source instanceof
			\MapSVG\DataLayer\Compatibility\PlasmaDataSource) {
			return $this->source->findPublic(
				$query,
				function (array $data) {
					return $this->createObjectFromV2PublicData($data);
				}
			);
		}

		$data = $this->source->find($query);

		if ($this->schema->isRemote()) {

			// For remote API data sources, return data as-is
			return $data;
		} else {
			// For local data, format it
			$items = [];


			if ($data && $this->schema->getFieldTypes()) {
				foreach ($data as $index => $object) {
					try {
						$objectFormatted = $this->decodeParams($object);
						$items[] = $objectFormatted;
					} catch (\Throwable $e) {
						Logger::error("[SERVER-017] " . $e->getMessage() . " — Read more: https://mapsvg.com/docs/errors#SERVER-017");
					}
				}
			}


			$response = array();
			$hasMore = $query->perpage > 0 && count($data) > $query->perpage;

			if ($hasMore) {
				array_pop($items);
			}

			$response = array(
				"items" => $items,
				"page" => $query->page,
				"take" => $query->perpage,
				"perpage" => $query->perpage,
				"hasMore" => $hasMore
			);
			if ($query->withCount && $this->source instanceof DbDataSource) {
				$response['count'] = $this->source->getLastCount();
			}
			return $response;
		}
	}

	/**
	 * Insert or update an entity matched by a given field value.
	 *
	 * Looks up an existing record where $idFieldName equals the corresponding
	 * value in $data. If found it merges and updates; otherwise it creates a new
	 * record. Always returns the resulting entity object.
	 *
	 * @param array  $data
	 * @param string $idFieldName Field to match on (defaults to 'id').
	 * @return mixed
	 */
	public function upsert(array $data, ?string $idFieldName = null)
	{
		if ($idFieldName === null) {
			$idFieldName = $this->schema->getPrimaryKeyFieldName();
		}
		$idValue = $data[$idFieldName] ?? ($data['id'] ?? null);

		if ($idValue !== null) {
			$existing = $this->findOne([$idFieldName => $idValue]);
			if ($existing) {
				$merged = array_merge((array) $existing, $data);
				return $this->update($merged);
			}
		}

		return $this->create($data);
	}

	/**
	 * Updates an Entity in the database
	 * @param $object
	 *
	 * @return string
	 */
	public function update($object)
	{
		\MapSVG\Core\PostDataFeature::assertSchema($this->schema);
		$this->validateRecordForWrite($object, 'update');
		$params = $this->encodeParams($object);
		$pkField = $this->schema->getPrimaryKeyFieldName();
		$this->source->update($params, array($pkField => $params[$pkField]));
		return is_object($object) ? $object : $this->newObject($object);
	}

	/**
	 * @internal CollectionController keeps its existing full-object writer path,
	 * but operation validation must inspect the caller's input, not server fields.
	 * Full-record validation and concrete update overrides still run unchanged.
	 *
	 * @param mixed $object Existing record merged with the incoming input
	 * @param array<string,mixed> $input Original controller Update input
	 * @return mixed
	 */
	public function updateFromController($object, array $input)
	{
		\MapSVG\Core\PostDataFeature::assertSchema($this->schema);
		$data = $this->validationRecordData($object);
		$recordId = $data['id'] ?? null;
		$inputId = $input['id'] ?? null;
		if ($recordId === null || $inputId === null
			|| !is_scalar($recordId) || !is_scalar($inputId)
			|| (string) $recordId === ''
			|| (string) $recordId !== (string) $inputId) {
			throw new \MapSVG\DataLayer\Validation\OperationValidationException(
				'update',
				array(array(
					'path' => array('id'),
					'message' => 'Update input does not match the resolved record identity.',
					'keyword' => 'identity',
				))
			);
		}

		$previousInput = $this->controllerUpdateInput;
		$previousRecord = $this->controllerUpdateRecord;
		$this->controllerUpdateInput = $input;
		$this->controllerUpdateRecord = $object;
		try {
			return $this->update($object);
		} finally {
			$this->controllerUpdateInput = $previousInput;
			$this->controllerUpdateRecord = $previousRecord;
		}
	}

	/**
	 * Deletes an Entity from the database
	 * @param $object
	 *
	 * @return string
	 */
	public function delete($id)
	{
		\MapSVG\Core\PostDataFeature::assertSchema($this->schema);
		$pkField = $this->schema->getPrimaryKeyFieldName();
		return $this->source->delete(array($pkField => $id));
	}

	/**
	 * Validate public/domain input before any storage mapping or writes.
	 *
	 * Update validation is two-stage: validate the patch contract, then merge
	 * the patch with the current public record for full-record validation while
	 * still persisting only the caller's original patch.
	 *
	 * @param mixed $record
	 */
	protected function validateRecordForWrite(
		$record,
		string $operation = 'write'
	): void {
		if (!$this->schema || $this->schema->isRemote()) {
			return;
		}

		$data = $this->validationRecordData($record);
		$fullRecord = $data;
		$operationValidation =
			($operation === 'create' || $operation === 'update')
			&& \MapSVG\DataLayer\Validation\OperationValidationService::writeValidationEnabled(
				$this->schema
			);

		if ($operationValidation) {
			$validator =
				new \MapSVG\DataLayer\Validation\OperationValidationService(
					$this->schema
				);

			if ($operation === 'create') {
				$validator->validateCreate($data);
			} else {
				$validator->validateUpdate(
					$this->controllerUpdateInput !== null
						&& $record === $this->controllerUpdateRecord
						? $this->controllerUpdateInput
						: $data
				);
				$fullRecord = $this->mergeUpdateForValidation($data);
			}

			if (\MapSVG\DataLayer\Validation\SystemModelSchemaRegistry::supports(
				$this->schema
			)) {
				$validator->validateRecord($fullRecord);
				return;
			}
		}

		(new \MapSVG\DataLayer\Validation\RecordValidationService())
			->validate($this->schema, $fullRecord, $operation);
	}

	/**
	 * @param mixed $record
	 * @return array<string,mixed>
	 */
	private function validationRecordData($record): array
	{
		if (is_object($record) && method_exists($record, 'getData')) {
			return (array) $record->getData();
		}
		if (is_object($record)) {
			return get_object_vars($record);
		}
		return (array) $record;
	}

	/**
	 * @param array<string,mixed> $patch
	 * @return array<string,mixed>
	 */
	private function mergeUpdateForValidation(array $patch): array
	{
		$primary = (string) $this->schema->getPrimaryKeyFieldName();
		$id = $primary !== '' && array_key_exists($primary, $patch)
			? $patch[$primary]
			: ($patch['id'] ?? null);

		if ($id === null || $id === '') {
			return $patch;
		}

		$existing = $this->findById($id);
		if (!$existing) {
			return $patch;
		}

		return array_merge(
			$this->validationRecordData($existing),
			$patch
		);
	}


	/**
	 * Static method that creates a new table
	 * @param string|array|Schema $schemaOrName
	 * @return string
	 */
	public static function createRepository($schemaOrName)
	{
		$repo = RepositoryFactory::get("schema");
		$name = '';
		if (is_string($schemaOrName)) {
			$schemaData = static::getDefaultSchema();
			$schemaData['name'] = $schemaOrName;
		} elseif (is_array($schemaOrName) || is_object($schemaOrName)) {
			$schemaData = $schemaOrName;
		}

		$schema = $repo->create($schemaData);
		return new static($schemaData['name']);
	}

	/**
	 * Import decoded records into a collection
	 */
	public function import($data, $convertLatlngToAddress = false)
	{
		$data = CollectionFieldSanitizer::sanitizeObjects($data, $this->schema);
		// Validate the complete public batch before encoding. This keeps a later
		// invalid row from allowing earlier rows to trigger mapping/geocoding
		// side effects before the import is rejected.
		foreach ($data as $object) {
			$this->validateRecordForWrite($object, 'import');
		}

		$_data  = array();
		foreach ($data as $index => $object) {
			$_data[$index] = $this->encodeParams(
				$object,
				$convertLatlngToAddress
			);
		}

		$this->source->import($_data);

		$hasRelationData = false;
		if (!empty($_data[0]) && is_array($_data[0])) {
			foreach ($this->schema->getRelationFields() as $field) {
				$name = $field->name ?? '';
				if ($name !== '' && isset($_data[0][$name])) {
					$hasRelationData = true;
					break;
				}
			}
		}
		if ($hasRelationData) {
			$this->setRelationsForAllObjects();
		}
	}

	public function setRelationsForAllObjects() {}

	/**
	 * Formats data for the insertion into a database
	 *
	 * @param object|array $data
	 * @param bool $convertLatLngToAddress
	 *
	 * @return array
	 */
	public function encodeParams($data, $convertLatLngToAddress = false)
	{
		if ($this->source instanceof
			\MapSVG\DataLayer\Compatibility\PlasmaDataSource) {
			$preparer = $this->v2WritePreparer();
			$result = $preparer->prepare(
				$data,
				(bool) $convertLatLngToAddress
			);
			$this->geocodingErrors = $result->geocodingErrorCodes();
			return $result->storage();
		}

		$codec = $this->legacyRecordCodec();
		$storage = $codec->encodeParams($data, $convertLatLngToAddress);
		$this->geocodingErrors = $codec->geocodingErrors();
		return $storage;
	}

	public function decodeParams($data)
	{
		if ($this->source instanceof
			\MapSVG\DataLayer\Compatibility\PlasmaDataSource) {
			if (!$data) {
				return null;
			}
			$public = $this->v2RecordMapper()->fromStorage((array) $data);
			return $public === null
				? null
				: $this->createObjectFromV2PublicData($public);
		}

		return $this->legacyRecordCodec()->decodeParams($data);
	}

	/**
	 * Build one domain object from already-public v2 query data.
	 *
	 * Single-row findOne/findById still use the existing decodeParams() path.
	 * List queries arrive here after SchemaRecordMapper, so only external
	 * WordPress post enrichment remains to be applied.
	 *
	 * @param array<string,mixed> $data
	 * @return object
	 */
	protected function createObjectFromV2PublicData(array $data)
	{
		$postField = $this->schema->getFieldByType('post');
		if ($postField !== null && !empty($postField->name)) {
			$name = (string) $postField->name;
			if (array_key_exists($name, $data)) {
				if ($this->v2PostEnricher === null) {
					$this->v2PostEnricher =
						new \MapSVG\DataLayer\Post\WordPressPostEnricher();
				}
				$data[$name] = $this->v2PostEnricher->enrich($data[$name]);
			}
		}
		return $this->newObject($data);
	}

	private function v2RecordMapper(): \MapSVG\DataLayer\Mapping\SchemaRecordMapper
	{
		$dataLayer = $this->source->dataLayer();
		$resolution = $dataLayer->resolveSchema($this->schema);

		return new \MapSVG\DataLayer\Mapping\SchemaRecordMapper(
			$this->schema,
			\MapSVG\DataLayer\Mapping\RecordMappingProfile::forSchema(
				$this->schema
			),
			$resolution->primaryKey()
		);
	}

	private function v2WritePreparer(): \MapSVG\DataLayer\Relation\ObjectWritePreparationAdapter
	{
		$location = null;
		if ($this->schema->getFieldByType('location') !== null) {
			$location =
				\MapSVG\DataLayer\Location\SynchronousLocationPreparationCanaryFactory::forSchema(
					$this->schema
				);
		}

		return new \MapSVG\DataLayer\Relation\ObjectWritePreparationAdapter(
			$this->v2RecordMapper(),
			$location
		);
	}

	private function legacyRecordCodec(): \MapSVG\DataLayer\Compatibility\LegacyRepositoryRecordCodec
	{
		return new \MapSVG\DataLayer\Compatibility\LegacyRepositoryRecordCodec(
			$this->schema,
			function (array $data) {
				return $this->newObject($data);
			}
		);
	}

	public function getSort($sort)
	{
		return $sort;
	}

	/**
	 * Reads the default schema from .json file which should be present in the same folder where
	 * repository class is located
	 *
	 * @return \Mapsvg\Schema
	 * @throws \ReflectionException
	 */
	public static function getDefaultSchema()
	{
		$reflector = new \ReflectionClass(get_called_class());
		$filename = $reflector->getFileName();
		$dir = dirname($filename);
		$schema_file = $dir . '/schema.json';

		require_once(ABSPATH . 'wp-admin/includes/file.php');
		WP_Filesystem();
		global $wp_filesystem;

		if (!$wp_filesystem->exists($schema_file)) {
			throw new \Exception("Schema file not found: " . esc_html($schema_file));
		}

		$schema = $wp_filesystem->get_contents($schema_file);
		if ($schema === false) {
			throw new \Exception("Failed to read schema file");
		}

		$schema = json_decode($schema, true);
		if (!$schema) {
			throw new \Exception("Invalid JSON in schema file: " . esc_html($schema_file));
		}

		return $schema;
	}

	/**
	 * Get distinct values for a given field from the repository's table.
	 *
	 * @param string $fieldName
	 * @return array
	 */
	public function getDistinctValues($fieldName)
	{
		if ($this->schema->isRemote() || !is_string($fieldName)) {
			return [];
		}

		$dataLayer = \MapSVG\DataLayer\DataLayerFactory::createV2(
			null,
			['force' => true, 'observe' => false]
		);
		$service = \MapSVG\DataLayer\Query\DistinctValueServiceFactory::forSchema(
			$dataLayer,
			$this->schema
		);

		return $service->values($fieldName);
	}
}
