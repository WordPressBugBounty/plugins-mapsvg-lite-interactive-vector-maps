<?php

namespace MapSVG;

class MapsRepository extends Repository
{
	public static $className = 'Map';
	private $updater;


	/**
	 * @param Schema $schema
	 */
	public function __construct($schema = null)
	{
		parent::__construct($schema);
		$this->updater = new MapUpdater();
	}


	/**
	 * Returns table name for the ObjectDynamic
	 * @return string
	 */
	/**
	 * Returns short table name for the ObjectDynamic
	 * @return string
	 */
	public function getTableNameShort()
	{
		return 'maps';
	}

	/**
	 * Formats Map parameters for the insertion to a database.
	 *
	 * @param $data - Raw data received from a client
	 * @param bool $convert - ?
	 *
	 * @return array - Array of formatted parameters
	 */
	public function encodeParams($data, $convert = false)
	{

		if (is_object($data) && method_exists($data, 'getData')) {
			$data = $data->getData();
		}

		if (isset($data['optionsBroken'])) {
			unset($data['optionsBroken']);
			unset($data['options']);
		} else {
			if (!$data['options']) {
				// Don't save broken JSON
				unset($data['options']);
			} else {
				if (!is_string($data['options'])) {
					$data['options'] = wp_json_encode($data['options'], JSON_UNESCAPED_UNICODE);
				}
			}
		}

		return $data;
	}


	public function decodeParams($data)
	{

		$data = (array)$data;

		// Check if map settings need to be upgraded
		$this->updater->maybeUpdate($data);

		return $this->newObject($data);
	}

	protected function createObjectFromV2PublicData(array $data)
	{
		$this->updater->maybeUpdate($data);
		// A projected row has no options; v2 may supply an empty default SVG path.
		// Do not construct SVGFile from that placeholder in the sidebar list.
		if (!isset($data['options']) && ($data['svgFilePath'] ?? null) === '') {
			unset($data['svgFilePath']);
		}
		return $this->newObject($data);
	}

	//	/**
	//	 * Formats Map parameters after retrieving from a database.
	//	 *
	//	 * @param $data - ata received from a database
	//	 *
	//	 * @return array - Array of formatted parameters
	//	 */
	//	public function decodeParams(array $data) {
	//		if(is_string($data['options'])){
	//			$data['options'] = json_decode($data['options']);
	//		}
	//
	//		return $data;
	//	}

	/**
	 * Updates map options and regions table.
	 * @param array $data - map options
	 * @return Map
	 */
	public function create($data)
	{
		return AppSvgReferenceLock::run(Database::get(), function () use ($data) { return parent::create($data); });
	}

	public function update($map)
	{
		return AppSvgReferenceLock::run(Database::get(), function () use ($map) { return parent::update($map); });
	}

	/**
	 * Updates map options and regions table from SVG file.
	 * @param array $data - map options
	 * @param boolean $updateTitles
	 * @return Map
	 */
	public function updateFromSvg($map, $updateTitles = null)
	{
		$this->update($map);
		$prefix = isset($map->options['regionPrefix']) ? $map->options['regionPrefix'] : '';

		/** @var Map $map */
		return $map->setRegionsTable($prefix, $updateTitles);
	}

	/**
	 * Finds a map by ID.
	 *
	 * @param $id
	 *
	 * @return Map
	 */
	public function findById($id)
	{
		$map = parent::findById($id);
		return $map;
	}

	/**
	 * Copies map and all related things: Regions table, Objects table, SVG File.
	 *
	 * @param int $id - ID of the map that needs to be copied
	 * @param array $newData - Array of new parameter values for the copied map. Used to pass new Map title.
	 *
	 * @return mixed
	 * @throws \Exception
	 */
	public function copy($id, $newData)
	{
		return \MapSVG\DataLayer\Workflow\MapCopyServiceFactory::forRepository(
			$this
		)->copy($id, (array) $newData);
	}

	/**
	 * Copies Regions and Objects tables from one map to another
	 *
	 * @param $fromMap
	 * @param $toMap
	 *
	 * @return boolean
	 */
	public function copyTables($fromMap, $toMap)
	{
		return \MapSVG\DataLayer\Workflow\MapCopyServiceFactory::forRepository(
			$this
		)->copyTables($fromMap, $toMap);
	}

	function serializeCorrector($serialized_string)
	{
		// at first, check if "fixing" is really needed at all. After that, security checkup.
		if (@unserialize($serialized_string) !== true &&  preg_match('/^[aOs]:/', $serialized_string)) {
			$serialized_string = preg_replace_callback('/s\:(\d+)\:\"(.*?)\";/s',    function ($matches) {
				return 's:' . strlen($matches[2]) . ':"' . $matches[2] . '";';
			},   $serialized_string);
		}
		return $serialized_string;
	}

	/**
	 * Deletes a map
	 * @param integer $id
	 */
	public function delete($id)
	{
		return parent::delete($id);
	}

	public function deleteAllRemovedOneDayAgo()
	{
		$dataLayer = \MapSVG\DataLayer\DataLayerFactory::createV2(
			null,
			['force' => true, 'observe' => false]
		);
		$service = \MapSVG\DataLayer\Workflow\MapMaintenanceServiceFactory::forSchema(
			$dataLayer,
			$this->schema
		);

		return $service->deleteSoftRemovedOlderThanTwoDays();
	}
}
