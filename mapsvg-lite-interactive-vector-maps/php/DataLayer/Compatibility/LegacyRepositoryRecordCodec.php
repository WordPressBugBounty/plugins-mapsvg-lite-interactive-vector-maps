<?php

declare(strict_types=1);

namespace MapSVG\DataLayer\Compatibility;

use MapSVG\Geocoding;
use MapSVG\LocationGeocodingStatus;
use MapSVG\Schema;

/**
 * Exact legacy Repository record codec kept for the bounded rollback/public
 * compatibility surface.
 *
 * This owns the historical encodeParams/decodeParams behavior without keeping
 * field persistence, geocoding, or WordPress post enrichment inside the giant
 * Repository orchestration class.
 */
final class LegacyRepositoryRecordCodec
{
    private Schema $schema;
    /** @var callable */
    private $objectFactory;
    /** @var string[] */
    private array $geocodingErrors = array();

    public function __construct(Schema $schema, callable $objectFactory)
    {
        $this->schema = $schema;
        $this->objectFactory = $objectFactory;
    }

    public function encodeParams($data, $convertLatLngToAddress = false)
    {

    	$this->geocodingErrors = [];

    	if (is_object($data) && method_exists($data, 'getData')) {
    		$data = $data->getData();
    	}

    	// Map 'id' alias to the actual primary key column name
    	$pkField = $this->schema->getPrimaryKeyFieldName();
    	if ($pkField !== 'id' && isset($data['id']) && !isset($data[$pkField])) {
    		$data[$pkField] = $data['id'];
    		unset($data['id']);
    	}

    	$formattedData = array();
    	$fieldTypes = $this->schema->getFieldTypes();

    	foreach ($data as $key => $value) {
    		$field = $this->schema->getField($key);
    		if ($field) switch ($field->type) {
    			case 'post':
    				if (is_array($value)) {
    					$formattedData['post'] = $value['id'];
    				} elseif (is_object($value)) {
    					$formattedData['post'] = $value->id;
    				} else {
    					$formattedData['post'] = $value;
    				}
    				break;
    			case 'region':
    			case 'relation':
    				if (!empty($data[$key]) && is_array($data[$key])) {
    					$formattedData[$key] = wp_json_encode($data[$key], JSON_UNESCAPED_UNICODE);
    				} else {
    					$formattedData[$key] = '';
    				}
    				break;
    			case 'status':
    			case 'select':
    			case 'radio':
    				$key_text = $key . '_text';
    				$fieldOptions = $this->schema->getFieldOptions($field->name);

    				if (isset($field->multiselect) && filter_var($field->multiselect, FILTER_VALIDATE_BOOLEAN)) {
    					$formattedData[$key] = wp_json_encode($data[$key], JSON_UNESCAPED_UNICODE);
    				} else {
    					$formattedData[$key] = '';
    					$formattedData[$key_text] = '';
    					$found = false;
    					foreach ($fieldOptions as $option) {
    						if ((string)$option['value'] === (string)$value || (string)$option['label'] === (string)$value) {
    							// Found a match! Use $options[$key]
    							$formattedData[$key] = $option['value'];
    							$formattedData[$key_text] = $option['label'];
    							break;  // Exit loop after finding match								
    						}
    					}
    				}
    				break;
    			case 'checkbox':
    				$formattedData[$key] = (int)($data[$key] === true || $data[$key] === 'true' || $data[$key] === '1' || $data[$key] === 1);
    				break;
    			case 'image':
    			case 'marker':
    				if (is_array($data[$key])) {
    					$formattedData[$key] = wp_json_encode($data[$key], JSON_UNESCAPED_UNICODE);
    				} else {
    					$formattedData[$key] = $data[$key];
    				}
    				break;
    			case 'location':
    				if (!empty($data[$key])) {
    					$location = array();

    					if (is_array($data[$key])) {
    						$location = $data[$key];
    					} else {
    						$location = json_decode($data[$key]);
    					}

    					if (isset($location['geoPoint']) && !empty($location['geoPoint'])) {
    						$formattedData['location_lat'] = $location['geoPoint']['lat'];
    						$formattedData['location_lng'] = $location['geoPoint']['lng'];
    					} else if (isset($location['svgPoint']) && !empty($location['svgPoint'])) {
    						$formattedData['location_x'] = $location['svgPoint']['x'];
    						$formattedData['location_y'] = $location['svgPoint']['y'];
    					}
    					if (isset($location['address'])) {
    						$formattedData['location_address'] = isset($location['address']) ? wp_json_encode($location['address'], JSON_UNESCAPED_UNICODE) : '';
    					}

    					$formattedData['location_img'] = isset($location['img']) ? $location['img'] : '';


    					if (!empty($location)) {

    						$addressYesCoordsNo = (isset($location['address']) && !empty($location['address']) && is_string($location['address']))
    							&& (!isset($location['geoPoint']) || empty($location['geoPoint']));
    						$addressNoCoordsYes = (!isset($location['address']) || empty($location['address']))
    							&& (isset($location['geoPoint']) && !empty($location['geoPoint']));

    						if ($addressYesCoordsNo || $addressNoCoordsYes) {
    							$locationField = $this->schema->getField($key);
    							$language = $locationField->language ?? 'en';
    							$geo = new Geocoding();
    							if ($addressNoCoordsYes) {
    								$response = $geo->get($location['geoPoint']['lat'] . ',' . $location['geoPoint']['lng'], true, $convertLatLngToAddress, $language);
    							} elseif ($addressYesCoordsNo) {
    								$response = $geo->get($location['address'], true, true, $language);
    							}

    							if ($response && isset($response['status'])) {

    								switch ($response['status']) {
    									case 'OK':
    										$address = array();

    										if ($addressNoCoordsYes && $convertLatLngToAddress) {
    											$result = $response['results'][1];
    										} else {
    											$result = $response['results'][0];
    										}

    										if ($addressYesCoordsNo) {
    											$formattedData['location_lat'] = $result['geometry']['location']['lat'];
    											$formattedData['location_lng'] = $result['geometry']['location']['lng'];
    										} else {
    											$formattedData['location_lat'] = $location['geoPoint']['lat'];
    											$formattedData['location_lng'] = $location['geoPoint']['lng'];
    										}
    										$address = array();
    										$address['address_formatted'] = $result['formatted_address'];
    										$address['formatted']        = $result['formatted_address'];
    										foreach ($result['address_components'] as $addr_item) {
    											$type = $addr_item['types'][0];
    											$address[$type] = $addr_item['long_name'];
    											if ($addr_item['short_name'] != $addr_item['long_name']) {
    												$address[$type . '_short'] = $addr_item['short_name'];
    											}
    										}

    										$formattedData['location_address']           = wp_json_encode($address, JSON_UNESCAPED_UNICODE);
    										$formattedData['location_geocoding_status'] = LocationGeocodingStatus::DONE;

    										break;
    									case 'ZERO_RESULTS':
    									case 'OVER_DAILY_LIMIT':
    									case 'OVER_QUERY_LIMIT':
    									case 'REQUEST_DENIED':
    									case 'INVALID_REQUEST':
    									case 'UNKNOWN_ERROR':
    									case 'CONNECTION_ERROR':
    									case 'NO_API_KEY':
    										if (count($this->geocodingErrors) < 5) {
    											$this->geocodingErrors[] =  $response['status'];
    										}
    									default:
    										null;
    										break;
    								}
    							}
    						}
    					}
    					if (! empty($formattedData['location_lat']) && ! empty($formattedData['location_lng'])
    						&& (float) $formattedData['location_lat'] !== 0.0
    						&& ! empty($formattedData['location_address'])) {
    						$formattedData['location_geocoding_status'] = LocationGeocodingStatus::DONE;
    					}
    				} else {
    					$formattedData['location_address'] = '';
    					$formattedData['location_lat'] = null;
    					$formattedData['location_lng'] = null;
    					$formattedData['location_x'] = null;
    					$formattedData['location_y'] = null;
    					$formattedData['location_img'] = '';
    					$formattedData['location_geocoding_status'] = LocationGeocodingStatus::SKIPPED;
    				}
    				break;
    			case 'json':
    				$formattedData[$key] = wp_json_encode($value, JSON_UNESCAPED_UNICODE);
    				break;
    			case 'datetime':
    				$formattedData[$key] = $value;
    				break;
    			default:
    				$formattedData[$key] = $value;
    				break;
    		}
    	}

    	return $formattedData;
    }

    public function decodeParams($data)
    {

    	if (!$data) {
    		return null;
    	}

    	$data_formatted = array();

    	$pkField = $this->schema->getPrimaryKeyFieldName();
    	$data_formatted['id'] = isset($data[$pkField]) ? $data[$pkField] : (isset($data['id']) ? $data['id'] : null);
    	$fieldTypes = $this->schema->getFieldTypes();


    	foreach ($fieldTypes as $field_name => $field_type) {
    		switch ($field_type) {
    			case 'status':
    				$data_formatted[$field_name] = $data[$field_name];
    				if (!empty($data[$field_name . '_text'])) {
    					$data_formatted[$field_name . '_text'] = $data[$field_name . '_text'];
    				}
    				break;
    			case 'radio':
    			case 'select':
    				if (!empty($data[$field_name])) {
    					if (strpos($data[$field_name], '[{') === 0) {
    						$data_formatted[$field_name] = json_decode(stripslashes($data[$field_name]));
    					} else {
    						$data_formatted[$field_name] = $data[$field_name];
    					}
    				}
    				if (!empty($data[$field_name . '_text'])) {
    					$data_formatted[$field_name . '_text'] = $data[$field_name . '_text'];
    				}
    				break;
    			case 'region':
    			case 'relation':
    				if (!empty($data[$field_name])) {
    					$data_formatted[$field_name] = json_decode(stripslashes($data[$field_name]));
    				}
    				break;
    			case 'post':
    				if (!empty($data['post'])) {
    					$data_formatted['post'] = (int)$data['post'];
    					$data_formatted['post'] = get_post((int)$data['post']);
    					if ($data_formatted['post']) {
    						$data_formatted['post']->id = $data_formatted['post']->ID;

    						// $data_formatted['post']->post_content = wpautop($data_formatted['post']->post_content);
    						// $data_formatted['post']->post_content = apply_filters( 'the_content', do_blocks( preg_replace( '/\[mapsvg.*?\]/', '', $data_formatted['post']->post_content ) ) );

    						$data_formatted['post']->post_content = preg_replace('/\[mapsvg.*?\]/', '', $data_formatted['post']->post_content);

    						if (has_blocks($data_formatted['post']->post_content)) {
    							$blocks = parse_blocks($data_formatted['post']->post_content);
    							$content_markup = '';
    							foreach ($blocks as $block) {
    								// render_block renders a single block into a HTML string
    								$content_markup .= render_block($block);
    							}
    							global $wp_embed;
    							$content_markup = $wp_embed->autoembed(do_blocks($content_markup)); //render youtube block properly
    							$data_formatted['post']->post_content = wpautop($content_markup);
    						}

    						$data_formatted['post']->url = get_permalink($data_formatted['post']);
    						$data_formatted['post']->image = get_the_post_thumbnail_url($data_formatted['post']->ID, 'full');
    						$data_formatted['post']->images = array(
    							'thumbnail' => get_the_post_thumbnail_url($data_formatted['post']->ID, 'thumbnail'),
    							'medium' => get_the_post_thumbnail_url($data_formatted['post']->ID, 'medium'),
    							'large' => get_the_post_thumbnail_url($data_formatted['post']->ID, 'large'),
    							'full' => get_the_post_thumbnail_url($data_formatted['post']->ID, 'full')
    						);
    						// Get ACF fields
    						if (self::isAcfActive()) {
    							$data_formatted['post']->acf = get_fields($data['post']);
    						}
    						// Get Metabox fields
    						if (self::isMetaboxActive()) {
    							$metabox_fields = rwmb_get_object_fields($data_formatted['post']->ID);
    							$data_formatted['post']->metabox = [];
    							foreach ($metabox_fields as $field_id => $field) {
    								$data_formatted['post']->metabox[$field_id] = rwmb_get_value($field_id, [], $data_formatted['post']->ID);
    							}
    						}
    						$data_formatted['post']->meta = get_post_meta($data_formatted['post']->ID);

    						// Add all taxonomies
    						$taxonomies = get_object_taxonomies($data_formatted['post']->post_type);
    						$data_formatted['post']->taxonomy = array();
    						foreach ($taxonomies as $taxonomy) {
    							$terms = get_the_terms($data_formatted['post']->ID, $taxonomy);
    							if (!is_wp_error($terms) && !empty($terms)) {
    								$data_formatted['post']->taxonomy[$taxonomy] = $terms;
    							} else {
    								$data_formatted['post']->taxonomy[$taxonomy] = array();
    							}
    						}

    						// Allow users adding more data to the post object
    						$data_formatted['post'] = apply_filters('mapsvg_format_post_data', $data_formatted['post']);
    					}
    				}
    				break;
    			case 'checkbox':
    				$data_formatted[$field_name] = (bool)($data[$field_name] ?? false);
    				break;
    			case 'image':
    			case 'marker':
    				if (!empty($data[$field_name])) {
    					$data_formatted[$field_name] = json_decode(stripslashes($data[$field_name]));
    				}
    				break;
    			case 'location':
    				$locationLat = $data['location_lat'] ?? null;
    				$locationLng = $data['location_lng'] ?? null;
    				$locationX = $data['location_x'] ?? null;
    				$locationY = $data['location_y'] ?? null;
    				if (($locationLat && $locationLng &&
    						(float)$locationLat !== (float)0 && (float)$locationLng !== (float)0)
    					||
    					($locationX && $locationY)
    				) {
    					$addrRaw = isset($data['location_address']) ? json_decode($data['location_address']) : '';
    					if (is_object($addrRaw) && isset($addrRaw->address_formatted) && ! isset($addrRaw->formatted)) {
    						$addrRaw->formatted = $addrRaw->address_formatted;
    					}
    					$data_formatted[$field_name] = array(
    						'address' => $addrRaw ?: '',
    						'img'     => isset($data['location_img'])     ? $data['location_img'] : ''
    					);
    					if (!empty($data['location_lat']) && !empty($data['location_lng'])) {
    						$data_formatted[$field_name]['geoPoint'] = array('lat' => (float)$data['location_lat'], 'lng' => (float)$data['location_lng']);
    					}
    					if (!empty($data['location_x']) && !empty($data['location_y'])) {
    						$data_formatted[$field_name]['svgPoint'] = array('x' => (float)$data['location_x'], 'y' => (float)$data['location_y']);
    					}
    				} else {
    					$data_formatted[$field_name] = '';
    				}
    				break;
    			case 'datetime':
    				if (!empty($data[$field_name])) {
    					$data_formatted[$field_name] = $data[$field_name];
    				} else {
    					$data_formatted[$field_name] = '';
    				}
    				break;
    			case 'json':
    				if (!empty($data[$field_name])) {
    					$data_formatted[$field_name] = json_decode($data[$field_name], true);
    				} else {
    					$data_formatted[$field_name] = [];
    				}
    				break;
    			default:
    				$data_formatted[$field_name] = isset($data[$field_name]) ? $data[$field_name] : '';
    				break;
    		}
    	}


    	return $this->newObject($data_formatted);
    }

    /** @return string[] */
    public function geocodingErrors(): array
    {
        return $this->geocodingErrors;
    }

    /** @param array<string,mixed> $data @return object */
    private function newObject(array $data)
    {
        $object = call_user_func($this->objectFactory, $data);
        if (!is_object($object)) {
            throw new \UnexpectedValueException(
                'Legacy record codec object factory must return an object.'
            );
        }
        return $object;
    }

    private static function isAcfActive(): bool
    {
        return function_exists('get_fields');
    }

    private static function isMetaboxActive(): bool
    {
        return function_exists('rwmb_meta');
    }
}
