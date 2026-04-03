<?php

namespace MapSVG;

/**
 * Parses location fields from CSV.
 *
 * One CSV column expands into six DB columns:
 *   location_lat, location_lng, location_address, location_x, location_y, location_img
 *
 * Accepted CSV formats:
 *   "45.1233, 56.9812"   → stored as lat/lng directly
 *   "Main st. 1, NY"     → stored as address; geocoded later if enabled
 *
 * Context keys used:
 *   - convertLatlngToAddress (bool): queue reverse-geocoding for lat/lng rows.
 *   - convertAddressToLatlng (bool): mark address rows for forward-geocoding.
 *   - needsGeocodingRef    (&bool): reference flag set to true when geocoding is needed.
 */
class LocationFieldParser implements FieldParserInterface {

	/** Matches "lat,lng" or "lat lng" within valid coordinate ranges. */
	private const LAT_LNG_REGEX = '/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)[\s]?[,\s]?[\s]?[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/';

	public function supports( string $fieldType ): bool {
		return $fieldType === 'location';
	}

	public function parse( string $rawValue, object $field, array &$context = [] ): array {
		$convertLatlngToAddress = (bool) ( $context['convertLatlngToAddress'] ?? false );
		$convertAddressToLatlng = (bool) ( $context['convertAddressToLatlng'] ?? false );
		$rawValue               = trim( $rawValue );

		if ( $rawValue === '' ) {
			return $this->emptyColumns();
		}

		if ( preg_match( self::LAT_LNG_REGEX, $rawValue ) ) {
			return $this->parseLatLng( $rawValue, $convertLatlngToAddress, $context );
		}

		return $this->parseAddress( $rawValue, $convertAddressToLatlng, $context );
	}

	// ── Private helpers ──────────────────────────────────────────────────────

	private function parseLatLng( string $rawValue, bool $reverseGeocode, array &$context ): array {
		$delimiter = str_contains( $rawValue, ',' ) ? ',' : ' ';
		$parts     = array_map( 'trim', explode( $delimiter, $rawValue, 2 ) );

		if ( $reverseGeocode ) {
			$context['needsGeocoding'] = true;
		}

		return [
			'location_lat'     => (float) $parts[0],
			'location_lng'     => isset( $parts[1] ) ? (float) $parts[1] : 0.0,
			'location_address' => '',
			'location_img'     => '',
			'location_x'       => null,
			'location_y'       => null,
		];
	}

	private function parseAddress( string $rawValue, bool $forwardGeocode, array &$context ): array {
		if ( $forwardGeocode ) {
			$context['needsGeocoding'] = true;
			$address = wp_json_encode( [ 'raw' => $rawValue ], JSON_UNESCAPED_UNICODE );
		} else {
			$address = $rawValue;
		}

		return [
			'location_address' => $address,
			'location_lat'     => null,
			'location_lng'     => null,
			'location_x'       => null,
			'location_y'       => null,
			'location_img'     => '',
		];
	}

	private function emptyColumns(): array {
		return [
			'location_address' => '',
			'location_lat'     => null,
			'location_lng'     => null,
			'location_x'       => null,
			'location_y'       => null,
			'location_img'     => '',
		];
	}
}
