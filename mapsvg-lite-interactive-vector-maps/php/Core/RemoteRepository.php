<?php

namespace MapSVG;

/**
 * Map Controller Class
 * @package MapSVG
 */
class RemoteRepository extends Repository {
  /**
	 * Returns an empty array 
	 * @param Query $query Query for the database
	 * @return array
	 */
	public function find(Query $query = null) {
    return array();
  }

	/**
	 * Returns a single Entity object by ID
	 * @return mixed
	 */
	public function findById($id){
    return array();
  }

	/**
	 * Specifies what data should be used for json_encode()
	 * @return mixed
	 */
	#[\ReturnTypeWillChange]
	public function jsonSerialize()
	{
		$data = new \stdClass();
		
		$data->{$this->schema->objectNamePlural} = array("data"=>$this->objects);
				
		return $data;
	}  

}