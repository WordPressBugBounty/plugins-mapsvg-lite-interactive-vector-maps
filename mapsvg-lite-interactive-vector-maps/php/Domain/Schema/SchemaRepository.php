<?php

namespace MapSVG;

use MapSVG\DataLayer\Schema\SchemaSqlDefinition;

class SchemaRepository extends Repository
{

	private const CATALOG_QUERY_MAX_PAGE_SIZE = 10000;

	/** @var \MapSVG\DataLayer\Schema\SchemaMutationService|null */
	private $schemaMutations;

	/** @var \MapSVG\DataLayer\Repository\CrudRepository|null */
	private $schemaCatalog;

	/** @var \MapSVG\DataLayer\DataLayerV2|null */
	private $schemaDataLayer;

	public static $className = 'Schema';

	/**
	 * Find schema by Collection name
	 *
	 * @param string $name Collection name
	 * @return Schema|null Returns Schema, if found; bool false if not found.
	 */
	function findByName($name)
	{
		return $this->schemaCatalog()->findOne([
			'name' => (string) $name,
		]);
	}

	public function findById($id)
	{
		return $this->schemaCatalog()->findById($id);
	}

	public function findOne($where)
	{
		return $this->schemaCatalog()->findOne((array) $where);
	}

	public function isPostTypeUsedByOtherSchema(
		string $postType,
		int $excludeId
	): bool {
		$this->initializeSchemaSubsystem();
		$service = new \MapSVG\DataLayer\Schema\SchemaCatalogUsageService(
			$this->schemaDataLayer,
			$this->schema
		);
		return $service->postTypeUsedElsewhere(
			$postType,
			$excludeId
		);
	}

	public function migratePrimaryKeyToString(Schema $schema): void
	{
		$this->initializeSchemaSubsystem();

		$service =
			new \MapSVG\DataLayer\Schema\PrimaryKeyStringMigrationService(
				$this->schemaDataLayer
			);
		$service->migrate($schema);

		$schemaObj = $this->findByName((string) $schema->name);
		if (!$schemaObj) {
			throw new \OutOfBoundsException(
				'Schema metadata not found after primary-key migration.'
			);
		}

		$primaryKey = (string) $schemaObj->getPrimaryKeyFieldName();
		$fields = (array) $schemaObj->fields;
		$changed = false;
		foreach ($fields as &$field) {
			if (isset($field->name)
				&& $field->name === $primaryKey
				&& isset($field->type)
				&& $field->type === 'id') {
				if (($field->db_type ?? '') !== 'varchar(255)'
					|| !isset($field->auto_increment)
					|| $field->auto_increment !== false) {
					$field->db_type = 'varchar(255)';
					$field->auto_increment = false;
					$changed = true;
				}
			}
		}
		unset($field);

		if ($changed) {
			$this->update(array(
				'id' => $schemaObj->id,
				'fields' => wp_json_encode(
					$fields,
					JSON_UNESCAPED_UNICODE
				),
			), true);
		}
	}

	public function find(?Query $query = null)
	{
		if ($query === null) {
			$query = new Query(['perpage' => 0]);
		}
		$this->initializeSchemaSubsystem();
		$resolution = $this->schemaDataLayer->resolveSchema($this->schema);
		$mapper = new \MapSVG\DataLayer\Schema\SchemaCatalogRecordMapper(
			$this->schema,
			$resolution
		);
		$service =
			\MapSVG\DataLayer\Query\SimpleQueryServiceFactory::forSchema(
				$this->schemaDataLayer,
				$this->schema,
				new \MapSVG\DataLayer\Query\QueryLimits(
					self::CATALOG_QUERY_MAX_PAGE_SIZE,
					self::CATALOG_QUERY_MAX_PAGE_SIZE
				),
				null,
				$mapper
			);
		return $service->findLegacy(
			$query,
			static function (array $data): Schema {
				return new Schema($data);
			}
		);
	}

	/**
	 * Creates a new schema and table
	 *
	 * @param Schema $schema
	 * @return Schema
	 */
	function create($schema)
	{
		if (!is_object($schema)) {
			$schema = $this->newObject(SchemaSqlDefinition::input($schema));
		}

		$schema = clone $schema;

		if (isset($schema->id)) {
			unset($schema->id);
		}

		if ($schema->type === 'post' && !empty($schema->postType)) {
			$existingPostSchema = $this->schemaCatalog()->findOne([
				'type' => 'post',
				'postType' => $schema->postType,
			]);
			if ($existingPostSchema !== null) {
				throw new \Exception(
					"A schema for post type '{$schema->postType}' already exists."
				);
			}
		}

		if ($this->findByName((string) $schema->getName()) !== null) {
			throw new \DomainException('Collection name already exists.');
		}

		// Get default fields for schema
		if ($schema->type === "object" || $schema->type === "region" || $schema->type === "post" || $schema->type === "api") {
			if (empty($schema->fields)) {
				$defSchema = RepositoryFactory::getDefaultSchema($schema->name, $schema->type);
				if ($schema->type === "post") {
					foreach ($defSchema->fields as $field) {
						if (isset($field->type) && $field->type === 'post') {
							$field->post_type = $schema->postType;
						}
					}
				}
				$schema->fields = $defSchema->fields;
			}

			if ($schema->type === "region") {
				$schema->ensureInternalFields();
				$schema->ensureSvgBinding();
			}

		}

		SchemaSqlDefinition::validate($schema);

		$this->validateRecordForWrite($schema, 'create');

		return $this->schemaMutations()->create(
			$schema,
			function (Schema $schema) {
				return $this->schemaCatalog()->create($schema);
			}
		);
	}

	/**
	 * Updates a schema and optionally alters its database table.
	 *
	 * @param array|Schema $data Schema instance or array of schema options.
	 * @param bool         $skip_db_update If true, table will not be altered (only the schema is saved).
	 * @return Schema
	 */
	public function update($data, $skip_db_update = false)
	{
		if (!($data instanceof Schema)) {
			/** @var Schema $schema */
			$data = SchemaSqlDefinition::input($data);
			$schema = $this->findById($data['id'] ?? null);
			if (!$schema) {
				throw new \InvalidArgumentException('Schema not found.', 404);
			}
			$previous = new Schema($schema->getData());
			$schema = clone $schema;
			$schema->update($data);
		} else {
			$schema = clone $data;
			// An already-mutated Schema object does not retain its original name.
			$stored = $this->findById($schema->id);
			if (!$stored) throw new \InvalidArgumentException('Schema not found.', 404);
			$previous = new Schema($stored->getData());
		}

		$schema->ensureInternalFields();
		SchemaSqlDefinition::validate($schema);
		$this->validateRecordForWrite($schema, 'update');

		return $this->schemaMutations()->update(
			$previous,
			$schema,
			function (Schema $schema) {
				$result = $this->schemaCatalog()->update($schema);
				$schema->clearPrevFields();
				return $result;
			},
			(bool) $skip_db_update
		);
	}

	/**
	 * Deletes a schema row and drops its physical data table (if any).
	 *
	 * @param int $id Schema id.
	 * @return mixed
	 */
	public function delete($id)
	{
		$schema = $this->findById($id);
		if (!$schema) {
			return false;
		}
		if ($schema->hasSvgBinding()) {
			throw new \Exception('Region data sources cannot be deleted.');
		}

		(new \MapSVG\DataLayer\Collection\CollectionReferenceGuard(Database::get()))
			->assertUnreferenced((int) $schema->id);

		return $this->schemaMutations()->delete(
			$schema,
			function () use ($id) {
				return $this->schemaCatalog()->delete($id);
			},
			function (Schema $schema) {
				if (!empty($schema->name)
					&& in_array($schema->type, ['object', 'post'], true)) {
					$this->relationStore()->deleteForObjectsTable(
						(string) $schema->name
					);
				}
			}
		);
	}

	/**
	 * Ensure post schema has a `regions` field and matching DB column when regionSupport is on.
	 *
	 * @param Schema $schema
	 * @return Schema
	 */
	public function ensureRegionsField(Schema $schema): Schema
	{
		if (($schema->type ?? '') !== 'post' || empty($schema->regionSupport)) {
			return $schema;
		}

		$hasRegions = false;
		$fields = $schema->getFields() ?: [];
		foreach ($fields as $field) {
			$field = (array) $field;
			if (($field['name'] ?? '') === 'regions' || \MapSVG\Schema::isRelationFieldType($field['type'] ?? null)) {
				$hasRegions = true;
				break;
			}
		}

		if (!$hasRegions) {
			$fields[] = (object) [
				'name' => 'regions',
				'label' => 'Regions',
				'type' => 'relation',
				'db_type' => 'text',
				'visible' => true,
				'multiselect' => true,
			];
			$schema->setFields($fields);
			$this->update($schema, false);
		} else {
			$this->schemaMutations()->repair($schema);
		}

		return $schema;
	}

	/**
	 * Replace the physical schema subsystem in tests or integrations.
	 */
	public function setSchemaMutationService(
		\MapSVG\DataLayer\Schema\SchemaMutationService $service
	): void {
		$this->schemaMutations = $service;
	}

	public function setSchemaCatalogRepository(
		\MapSVG\DataLayer\Repository\CrudRepository $repository
	): void {
		$this->schemaCatalog = $repository;
	}

	private function schemaMutations()
	{
		$this->initializeSchemaSubsystem();
		return $this->schemaMutations;
	}

	private function schemaCatalog()
	{
		$this->initializeSchemaSubsystem();
		return $this->schemaCatalog;
	}

	private function relationStore()
	{
		$this->initializeSchemaSubsystem();
		return new \MapSVG\DataLayer\Relation\WpdbRegionRelationStore(
			$this->schemaDataLayer->client()->getAdapter()
		);
	}

	private function initializeSchemaSubsystem(): void
	{
		if ($this->schemaMutations !== null
			&& $this->schemaCatalog !== null
			&& $this->schemaDataLayer !== null) {
			return;
		}

		if ($this->schemaDataLayer === null) {
			$this->schemaDataLayer =
				\MapSVG\DataLayer\DataLayerFactory::createV2(
					null,
					['force' => true, 'observe' => false]
				);
		}

		$registry = $this->schemaDataLayer->registry();
		if ($this->schemaCatalog === null) {
			$this->schemaCatalog =
				new \MapSVG\DataLayer\Repository\SchemaCatalogV2Repository(
					$this->schema,
					$registry
				);
		}
		if ($this->schemaMutations === null) {
			$this->schemaMutations =
				\MapSVG\DataLayer\Schema\SchemaMutationServiceFactory::create(
					$this->schemaDataLayer->provider()->wpdb(),
					new \MapSVG\DataLayer\Schema\StorageModelRegistrySynchronizer(
						$registry
					)
				);
		}
	}

	public function decodeParams($data)
	{
		$data['fields'] = json_decode($data['fields']);
		if (isset($data["apiEndpoints"]) && is_string($data["apiEndpoints"])) {
			$data['apiEndpoints'] = json_decode($data['apiEndpoints'], true);
		}
		if (isset($data["bindings"]) && is_string($data["bindings"])) {
			$decoded = json_decode($data["bindings"], true);
			$data['bindings'] = is_array($decoded) ? $decoded : null;
		}
		if (array_key_exists("zodSettings", $data)) {
			$data['zodSettings'] = Schema::normalizeZodSettings(
				$data["zodSettings"]
			);
		}

		return $this->newObject($data);
	}

	public function encodeParams($data, $options = false)
	{

		if (is_object($data) && method_exists($data, 'getData')) {
			$data = $data->getData();
		}

		$data = (array)$data;

		foreach ($data as $key => $val) {
			if ($val === null) {
				unset($data[$key]);
			}
		}
		if (isset($data["fields"]) && !is_string($data['fields'])) {
			$data['fields'] = wp_json_encode($data['fields'], JSON_UNESCAPED_UNICODE);
		}


		if (isset($data["apiEndpoints"]) && !is_string($data["apiEndpoints"])) {
			$data["apiEndpoints"] = wp_json_encode($data["apiEndpoints"], JSON_UNESCAPED_UNICODE);
		}

		if (isset($data["bindings"]) && !is_string($data["bindings"])) {
			$data["bindings"] = wp_json_encode($data["bindings"], JSON_UNESCAPED_UNICODE);
		}
		if (array_key_exists("zodSettings", $data)) {
			$settings = Schema::normalizeZodSettings($data["zodSettings"]);
			if ($settings !== null) {
				$data["zodSettings"] = wp_json_encode(
					$settings,
					JSON_UNESCAPED_UNICODE
				);
			}
		}

		return $data;
	}

	public static function tableExists($name)
	{
		// Preserve the legacy public helper's sanitizing behavior while routing
		// the physical lookup through the validated v2 adapter.
		$logicalTable = preg_replace(
			'/[^a-zA-Z0-9_]/',
			'',
			(string) $name
		);
		if ($logicalTable === '') {
			return false;
		}

		$dataLayer = \MapSVG\DataLayer\DataLayerFactory::createV2(
			null,
			['force' => true, 'observe' => false]
		);
		$service = new \MapSVG\DataLayer\Schema\SchemaTableExistenceService(
			$dataLayer->client()->getAdapter(),
			$dataLayer->provider()->physicalPrefix()
		);

		return $service->exists($logicalTable);
	}
}
