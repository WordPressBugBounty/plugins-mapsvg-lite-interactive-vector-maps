<?php

namespace MapSVG;

class ObjectsRepository extends Repository
{

	public static $className = 'ObjectDynamic';

	/** @var \MapSVG\DataLayer\Relation\ObjectsRepositoryRelationCanary|null */
	private $relationWriteCanary;

	public function __construct($schema = null)
	{
		parent::__construct($schema);
		if ($this->source instanceof
			\MapSVG\DataLayer\Compatibility\PlasmaDataSource) {
			$this->relationWriteCanary =
				\MapSVG\DataLayer\Relation\ObjectsRepositoryRelationCanaryFactory::forSchema(
					$this->source->dataLayer(),
					$this->schema
				);
		}
	}

	/**
	 * Creates new record in the database and creates relation records
	 * @param array $data
	 * @return string
	 */
	public function create($data)
	{
		\MapSVG\Core\PostDataFeature::assertSchema($this->schema);
		if ($this->relationWriteCanary !== null) {
			$object = $this->prepareRelationObject($data);
			$this->validateRecordForWrite($object, 'create');
			$storage = $this->relationWriteCanary->preparesWrites()
				? null
				: $this->encodeParams($object->getData());
			$result = $this->relationWriteCanary->create($object, $storage);
			$this->geocodingErrors =
				$this->relationWriteCanary->preparationErrorCodes();
			return $result;
		}

		$object = parent::create($data);
		$this->setRelationsForObject($object);
		return $object;
	}

	/**
	 * Updates the record in the database and updates relation records
	 * @param array $data
	 * @return string
	 */
	public function update($data)
	{
		\MapSVG\Core\PostDataFeature::assertSchema($this->schema);
		if ($this->relationWriteCanary !== null) {
			$object = $this->prepareRelationObject($data);
			$this->validateRecordForWrite($object, 'update');
			$storage = $this->relationWriteCanary->preparesWrites()
				? null
				: $this->encodeParams($object->getData());
			$result = $this->relationWriteCanary->update($object, $storage);
			$this->geocodingErrors =
				$this->relationWriteCanary->preparationErrorCodes();
			return $result;
		}

		$object = parent::update($data);
		$this->setRelationsForObject($object);
		return $object;
	}

	/**
	 * Deletes the record from the database and deletes all relation records from the intermediate table
	 * @param array $data
	 * @return string
	 */
	public function delete($id)
	{
		\MapSVG\Core\PostDataFeature::assertSchema($this->schema);
		if ($this->relationWriteCanary !== null) {
			$this->relationWriteCanary->delete($id);
			return 1;
		}

		parent::delete($id);
		$this->deleteRelations($id);
		return 1;
	}

	/**
	 * Clears the table
	 * @return int|void
	 */
	public function clear()
	{
		\MapSVG\Core\PostDataFeature::assertSchema($this->schema);
		if ($this->relationWriteCanary !== null) {
			$this->relationWriteCanary->clear();
			return 1;
		}

		if ($this->schema->isRemote()) {
			// Preserve the historical remote path until compatibility cutover.
			parent::clear();
			$this->deleteAllRelations();
			return 1;
		}

		$this->clearLocalCollection(true);
		return 1;
	}

	/** Explicitly opt this repository instance into atomic relation writes. */
	public function setRelationWriteCanary(
		?\MapSVG\DataLayer\Relation\ObjectsRepositoryRelationCanary $canary
	): void {
		$this->relationWriteCanary = $canary;
	}

	/**
	 * Clears all relations for an object
	 * @param $id
	 * @return int
	 */
	public function deleteRelations($id)
	{
		if ($this->schema->isRemote()) {
			return;
		}
		if ($this->source instanceof
			\MapSVG\DataLayer\Compatibility\PlasmaDataSource) {
			$this->relationStore()->deleteForObject(
				(string) $this->id,
				$id
			);
			return 1;
		}

		// Rollback-only legacy behavior.
		$db = Database::get();
		$db->delete($db->mapsvg_prefix . 'r2o', array('objects_table' => $this->id, 'object_id' => $id));
		return 1;
	}

	/**
	 * Deletes all relations for the whole table
	 * @param $id
	 * @return int
	 */
	public function deleteAllRelations()
	{
		if ($this->schema->isRemote()) {
			return;
		}
		if ($this->source instanceof
			\MapSVG\DataLayer\Compatibility\PlasmaDataSource) {
			$this->relationStore()->deleteForObjectsTable(
				(string) $this->id
			);
			return 1;
		}

		// Rollback-only legacy behavior.
		$db = Database::get();
		$db->delete($db->mapsvg_prefix . 'r2o', array('objects_table' => $this->id));
		return 1;
	}

	/**
	 * Sets relations for an object from all relation/region fields.
	 * Each field value is `[{ id, tableName }, …]`; r2o rows use per-entry tableName.
	 */
	public function setRelationsForObject($object)
	{
		if ($this->schema->isRemote()) {
			return;
		}

		$data = $object->getData();
		if ($this->source instanceof
			\MapSVG\DataLayer\Compatibility\PlasmaDataSource) {
			$normalizer = new \MapSVG\DataLayer\Relation\RegionRelationNormalizer(
				$this->schema
			);
			if (!$normalizer->hasRelationFields() || empty($data['id'])) {
				return;
			}
			$this->relationStore()->replaceForObject(
				(string) $this->id,
				$data['id'],
				$normalizer->linksFromRecord($object)
			);
			return;
		}

		// Rollback-only legacy behavior.
		$db = Database::get();

		if (empty($data['id'])) {
			return;
		}

		$relationFields = $this->schema->getRelationFields();
		if (empty($relationFields)) {
			return;
		}

		$db->delete($db->mapsvg_prefix . 'r2o', array(
			'objects_table' => $this->id,
			'object_id' => $data['id']
		));

		$regions_sql_values = array();
		$seen = array();

		foreach ($relationFields as $field) {
			$fieldName = $field->name ?? '';
			if ($fieldName === '' || !isset($data[$fieldName]) || !is_array($data[$fieldName])) {
				continue;
			}
			foreach ($data[$fieldName] as $region) {
				$region = (array) $region;
				$tableName = $region['tableName'] ?? '';
				$regionId = $region['id'] ?? '';
				if ($tableName === '' || $regionId === '') {
					continue;
				}
				$key = $tableName . "\0" . $regionId;
				if (isset($seen[$key])) {
					continue;
				}
				$seen[$key] = true;
				$regions_sql_values[] = "('" . esc_sql($this->id) . "','" . esc_sql($tableName) . "','" . esc_sql($data['id']) . "','" . esc_sql($regionId) . "')";
			}
		}

		if (!empty($regions_sql_values)) {
			$query2 = "INSERT INTO " . $db->mapsvg_prefix . 'r2o' . " (objects_table, regions_table, object_id, region_id) VALUES ";
			$query2 .= implode(", ", $regions_sql_values);
			$db->query($query2);
		}
	}


	/**
	 * Sets relations for all objects, processed in chunks to avoid memory exhaustion
	 * on large tables. Scans every relation/region field column.
	 */
	public function setRelationsForAllObjects()
	{
		if ($this->schema->isRemote()) {
			return;
		}

		$relationFields = $this->schema->getRelationFields();
		if (empty($relationFields)) {
			return;
		}

		if ($this->source instanceof
			\MapSVG\DataLayer\Compatibility\PlasmaDataSource) {
			\MapSVG\DataLayer\Relation\RegionRelationRebuilderFactory::forSchema(
				$this->source->dataLayer(),
				$this->schema
			)->runToCompletion(500);
			return;
		}

		// Rollback-only legacy behavior.
		$db       = Database::get();
		$table    = esc_sql($db->mapsvg_prefix . $this->id);
		$r2oTable = $db->mapsvg_prefix . 'r2o';
		$pkField  = $this->schema->getPrimaryKeyFieldName();

		$columnNames = [];
		foreach ($relationFields as $field) {
			$name = $field->name ?? '';
			if ($name !== '') {
				$columnNames[] = $name;
			}
		}
		$columnNames = array_values(array_unique($columnNames));
		if (empty($columnNames)) {
			return;
		}

		$selectCols = [ '`' . esc_sql($pkField) . '`' ];
		$whereParts = [];
		foreach ($columnNames as $col) {
			$colEsc = esc_sql($col);
			$selectCols[] = '`' . $colEsc . '`';
			$whereParts[] = "(`{$colEsc}` IS NOT NULL AND `{$colEsc}` != '' AND `{$colEsc}` != '[]')";
		}

		$this->deleteAllRelations();

		$chunkSize = 500;
		$offset    = 0;
		$selectSql = implode(', ', $selectCols);
		$whereSql  = implode(' OR ', $whereParts);

		do {
			// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared
			$rows = $db->get_results(
				$db->prepare(
					"SELECT {$selectSql} FROM `{$table}` WHERE {$whereSql} LIMIT %d OFFSET %d",
					[ $chunkSize, $offset ]
				),
				ARRAY_A
			);

			if (empty($rows)) {
				break;
			}

			$r2oValues = [];
			foreach ($rows as $row) {
				$objectId = $row[$pkField] ?? null;
				if ($objectId === null || $objectId === '') {
					continue;
				}
				$seen = [];
				foreach ($columnNames as $col) {
					$_regions = json_decode( (string) ( $row[$col] ?? '' ) );
					if ( ! is_array( $_regions ) ) {
						continue;
					}
					foreach ( $_regions as $region ) {
						if ( empty( $region->tableName ) || empty( $region->id ) ) {
							continue;
						}
						$key = $region->tableName . "\0" . $region->id;
						if ( isset( $seen[$key] ) ) {
							continue;
						}
						$seen[$key] = true;
						$r2oValues[] = "('"
							. esc_sql( $this->id ) . "','"
							. esc_sql( $region->tableName ) . "','"
							. esc_sql( $objectId ) . "','"
							. esc_sql( $region->id ) . "')";
					}
				}
			}

			if ( ! empty( $r2oValues ) ) {
				// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
				$db->query(
					"INSERT INTO `{$r2oTable}` (objects_table, regions_table, object_id, region_id) VALUES "
					. implode( ', ', $r2oValues )
				);
			}

			$offset += $chunkSize;
		} while ( count( $rows ) === $chunkSize );
	}
	private function relationStore(): \MapSVG\DataLayer\Relation\WpdbRegionRelationStore
	{
		return new \MapSVG\DataLayer\Relation\WpdbRegionRelationStore(
			$this->source->dataLayer()->client()->getAdapter()
		);
	}

	/**
	 * Construct the public domain object before canary preparation begins.
	 *
	 * @param mixed $data
	 * @return object
	 */
	private function prepareRelationObject($data)
	{
		if (is_string($data)) {
			$data = json_decode($data, true);
			if (!is_array($data)) {
				throw new \InvalidArgumentException(
					'Object write JSON must decode to an object.'
				);
			}
		}

		$object = is_object($data) ? $data : $this->newObject($data);
		if (!is_object($object) || !method_exists($object, 'getData')) {
			throw new \InvalidArgumentException(
				'Object write input must produce a MapSVG domain object.'
			);
		}

		return $object;
	}

}
