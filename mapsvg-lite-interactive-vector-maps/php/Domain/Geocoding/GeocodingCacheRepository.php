<?php

namespace MapSVG;

use MapSVG\DataLayer\Store\PluginTableStore;

class GeocodingCacheRepository
{
    private PluginTableStore $store;

    public function __construct()
    {
        $this->store = new PluginTableStore('geocoding_cache');
    }

    public function find(string $request): ?array
    {
        $row = $this->store->findOne(array('request' => $request));
        return $row
            ? json_decode((string) $row['response'], true)
            : null;
    }

    public function store(string $request, array $response): void
    {
        $value = wp_json_encode($response, JSON_UNESCAPED_UNICODE);
        if ($this->store->findOne(array('request' => $request)) !== null) {
            $this->store->update(
                array('response' => $value),
                array('request' => $request)
            );
            return;
        }

        $this->store->insert(array(
            'request' => $request,
            'response' => $value,
        ));
    }
}
