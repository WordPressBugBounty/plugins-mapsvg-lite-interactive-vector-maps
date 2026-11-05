<?php

namespace MapSVG;


class LogsRepository extends Repository
{
    public function __construct($schema = null)
    {
        parent::__construct($schema);
        $this->source = new LogsDataSource();
    }

    public function find(Query $query = null)
    {
        return ["items" => $this->source->find($query), "hasMore" => false];
    }
}
