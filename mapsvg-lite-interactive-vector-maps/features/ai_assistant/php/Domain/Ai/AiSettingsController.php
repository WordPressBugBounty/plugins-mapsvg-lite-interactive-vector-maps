<?php

namespace MapSVG;

/**
 * AI provider settings (OpenAI / DeepSeek). Secrets never returned to the client.
 */
class AiSettingsController extends Controller
{
	/**
	 * GET /mapsvg/v1/ai/settings
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function get($request)
	{
		return self::render(AiProviderConfig::publicSettings());
	}

	/**
	 * PUT /mapsvg/v1/ai/settings
	 *
	 * Compatibility endpoint: returns managed AI settings.
	 * Provider credentials belong to the dashboard server.
	 *
	 * @param \WP_REST_Request $request
	 * @return \WP_REST_Response
	 */
	public static function update($request)
	{
		// Model selection and provider credentials are managed by the MapSVG service.

		return self::render(AiProviderConfig::publicSettings());
	}
}
