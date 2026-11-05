<?php

namespace MapSVG;

class RegionsRepository extends Repository
{

	public static $className = 'Region';
	public $prefix = "";

	public function __construct($tableName = null)
	{
		$this->prefix = "";
		parent::__construct($tableName);
	}

	public function setPrefix($prefix)
	{
		$this->prefix = $prefix;
	}

	/**
	 * Returns an array of Entities by provided Query.
	 * By default excludes rows with orphaned=1 unless filters.includeOrphans is set.
	 *
	 * @param Query|null $query
	 * @return array
	 */
	public function find($query = null)
	{
		if ($query === null) {
			$query = new Query(array('perpage' => 0, 'filters' => array()));
		}
		if ($this->prefix) {
			$query->filters["prefix"] = $this->prefix;
		}
		if (!$query || !$query->sort) {
			$query->sort = [["field" => "id", "order" => "ASC"]];
		}

		$includeOrphans = !empty($query->filters['includeOrphans']);
		unset($query->filters['includeOrphans']);

		if (!$includeOrphans && $this->schema && $this->schema->getField('orphaned')) {
			if (!is_array($query->filterout)) {
				$query->filterout = array();
			}
			if (!array_key_exists('orphaned', $query->filterout)) {
				$query->filterout['orphaned'] = 1;
			}
		}

		return parent::find($query);
	}

	/**
	 * Bulk-set the orphaned flag for the given region IDs (does not touch other columns).
	 *
	 * @param string[] $ids
	 * @param int      $orphaned 1 = orphaned, 0 = active
	 */
	public function setOrphanedByIds(array $ids, int $orphaned): void
	{
		if (empty($ids) || !$this->schema || !$this->schema->getField('orphaned')) {
			return;
		}

		$this->orphanService()->markByIds($ids, $orphaned);
	}

	/**
	 * Count rows currently marked orphaned (ignores prefix / default find filters).
	 */
	public function countOrphaned(): int
	{
		if (!$this->schema || !$this->schema->getField('orphaned')) {
			return 0;
		}

		return $this->orphanService()->count((string) $this->prefix);
	}

	/**
	 * Permanently delete all orphaned region rows and detach related r2o links.
	 *
	 * Respects regionPrefix when set (same scope as setRegionsTable / find).
	 *
	 * @return array{deleted: int, r2oDeleted: int, ids: string[]}
	 */
	public function deleteOrphaned(): array
	{
		if (!$this->schema || !$this->schema->getField('orphaned')) {
			return array(
				'deleted'    => 0,
				'r2oDeleted' => 0,
				'ids'        => array(),
			);
		}

		return $this->orphanService()->delete((string) $this->prefix);
	}

	/**
	 * Remove object↔region links for the given region IDs in this regions table.
	 *
	 * @param string[] $regionIds
	 */
	public function deleteR2oLinksForRegionIds(array $regionIds): int
	{
		$regionIds = array_values(array_filter(array_map('strval', $regionIds)));
		if (empty($regionIds)) {
			return 0;
		}

		return $this->relationStore()->deleteForRegionsTableIds(
			(string) $this->id,
			$regionIds
		);
	}

	/**
	 * Updates all provided regions in the database
	 * @param array $objects
	 */
	public function createOrUpdateAll($objects)
	{
		$objects = is_array($objects) ? $objects : array();
		if ($objects === array()) {
			return;
		}

		$fields = array();
		foreach ($objects as $object) {
			foreach (array_keys((array) $object) as $name) {
				if (is_string($name)
					&& $this->schema->getField($name)
					&& !in_array($name, $fields, true)) {
					$fields[] = $name;
				}
			}
		}
		if ($fields === array()) {
			return;
		}

		$rows = array();
		foreach ($objects as $object) {
			$object = (array) $object;
			$row = array();
			foreach ($fields as $name) {
				// Preserve legacy bulk semantics: missing/null values become ''.
				$row[$name] = isset($object[$name]) ? $object[$name] : '';
			}
			$rows[] = $row;
		}

		$this->import($rows);
	}

	private function relationStore(): \MapSVG\DataLayer\Relation\WpdbRegionRelationStore
	{
		$dataLayer = $this->runtimeDataLayer();
		return new \MapSVG\DataLayer\Relation\WpdbRegionRelationStore(
			$dataLayer->client()->getAdapter()
		);
	}

	private function runtimeDataLayer(): \MapSVG\DataLayer\DataLayerV2
	{
		if ($this->source instanceof
			\MapSVG\DataLayer\Compatibility\PlasmaDataSource) {
			return $this->source->dataLayer();
		}

		return \MapSVG\DataLayer\DataLayerFactory::createV2(
			null,
			array('force' => true, 'observe' => false)
		);
	}

	private function orphanService(): \MapSVG\DataLayer\Workflow\RegionOrphanService
	{
		return \MapSVG\DataLayer\Workflow\RegionOrphanServiceFactory::forSchema(
			$this->runtimeDataLayer(),
			$this->schema
		);
	}

}
