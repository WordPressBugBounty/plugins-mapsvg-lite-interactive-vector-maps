<?php

use MapSVG\Options;
use MapSVG\Shortcode;

if (!class_exists('WP_EX_PAGE_ON_THE_FLY')) {
	class WP_EX_PAGE_ON_THE_FLY
	{

		public $slug = '';
		public $args = array();
		public $post_content = '';
		/**
		 * __construct
		 * @param array $args post to create on the fly
		 * @author Ohad Raz
		 *
		 */
		function __construct($args)
		{
			$this->args = $args;
			$this->slug = $args['slug'];
			$this->post_content = $args['post_content'];

			// Add the filter only for the next query
			add_filter('the_posts', array($this, 'fly_page'), 10, 2);
		}

		/**
		 * function that catches the request and returns the page as if it was retrieved from the database
		 * @param  array $posts
		 * @return array
		 * @author Ohad Raz
		 */
		public function fly_page($posts, $query = null)
		{
			global $wp;

			// Only run for the main query and only for our intended slug
			if (
				$query && $query->is_main_query() &&
				count($posts) == 0 &&
				(strtolower($wp->request) == $this->slug || (isset($wp->query_vars['page_id']) && ($wp->query_vars['page_id'] == $this->slug)))
			) {

				// Try to find an existing post of type mapsvg_shortcode with this slug
				$existing = get_posts([
					'name' => $this->slug,
					'post_type' => 'mapsvg_shortcode',
					'post_status' => 'publish',
					'numberposts' => 1,
				]);


				if ($existing) {
					$post = $existing[0];
					// Optionally, update content dynamically
					$post->post_content = $this->post_content;
				} else {
					$admin_users = get_users([
						'role'    => 'administrator',
						'orderby' => 'ID',
						'order'   => 'ASC',
						'number'  => 1,
					]);
					$admin_id = !empty($admin_users) ? $admin_users[0]->ID : 1;


					// Create a new post in the DB
					$post_id = wp_insert_post([
						'post_title'   => 'MapSVG Shortcode: ' . $this->slug,
						'post_name'    => $this->slug,
						'post_type'    => 'mapsvg_shortcode',
						'post_status'  => 'publish',
						'post_content' => '',
						'post_author'  => $admin_id,
					]);
					$post = get_post($post_id);
				}

				// Remove the filter so it doesn't affect other queries
				remove_filter('the_posts', array($this, 'fly_page'), 10);
				return [$post];
			}

			// Remove the filter for all other queries as well
			remove_filter('the_posts', array($this, 'fly_page'), 10);
			return $posts;
		}
	} //end class
} //end if


// blank template


if (! function_exists('blank_slate_bootstrap')) {

	/**
	 * Initialize the plugin.
	 */
	function blank_slate_bootstrap()
	{

		// load_plugin_textdomain('blank-slate', false, __DIR__ . '/languages');

		// Register the blank slate template
		blank_slate_add_template(
			'blank-slate-template.php',
			'mapsvg-lite'
			
		);

		// Add our template(s) to the dropdown in the admin
		add_filter(
			'theme_page_templates',
			function (array $templates) {
				return array_merge($templates, blank_slate_get_templates());
			}
		);

		// Ensure our template is loaded on the front end
		add_filter(
			'template_include',
			function ($template) {

				if (is_singular()) {

					$assigned_template = get_post_meta(get_the_ID(), '_wp_page_template', true);

					if (blank_slate_get_template($assigned_template)) {

						if (file_exists($assigned_template)) {
							return $assigned_template;
						}

						//$file = wp_normalize_path( plugin_dir_path( __FILE__ ) . '/templates/' . $assigned_template );
						$file = wp_normalize_path(plugin_dir_path(__FILE__) .  $assigned_template);

						if (file_exists($file)) {
							return $file;
						}
					}
				}

				return $template;
			}
		);
	}
}

if (! function_exists('blank_slate_get_templates')) {

	/**
	 * Get all registered templates.
	 *
	 * @return array
	 */
	function blank_slate_get_templates()
	{
		return (array) apply_filters('blank_slate_templates', array());
	}
}

if (! function_exists('blank_slate_get_template')) {

	/**
	 * Get a registered template.
	 *
	 * @param string $file Template file/path
	 *
	 * @return string|null
	 */
	function blank_slate_get_template($file)
	{
		$templates = blank_slate_get_templates();

		return isset($templates[$file]) ? $templates[$file] : null;
	}
}

if (! function_exists('blank_slate_add_template')) {

	/**
	 * Register a new template.
	 *
	 * @param string $file Template file/path
	 * @param string $label Label for the template
	 */
	function blank_slate_add_template($file, $label)
	{
		add_filter(
			'blank_slate_templates',
			function (array $templates) use ($file, $label) {
				$templates[$file] = $label;

				return $templates;
			}
		);
	}
}

add_action('plugins_loaded', 'blank_slate_bootstrap');


function mapsvg_blank_template()
{
	include("blank-template.php");
	exit;
}

if (isset($_GET['mapsvg_shortcode'])) {  // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.NonceVerification.Missing

	add_action('template_redirect', 'mapsvg_blank_template');

	// Properly sanitize and unslash the shortcode parameter
	$shortcode = sanitize_text_field(wp_unslash($_GET['mapsvg_shortcode']));  // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.NonceVerification.Missing
	$shortcodeName = Shortcode::getName($shortcode);

	$allowedShortcodes = Options::get('allowed_shortcodes');
	if (!in_array($shortcodeName, $allowedShortcodes)) {
		$shortcode = "Add \"$shortcodeName\" to the allowed shortcodes in the MapSVG settings.";
	}

	// Optional: Add validation
	if (empty($shortcode)) {
		wp_die('Invalid shortcode parameter');
	}

	$args = array(
		'slug' => 'mapsvg_sc',
		'post_title' => '',
		'post_content' => $shortcode
	);

	// Add all CF7 parameters from shortodes
	add_filter('shortcode_atts_wpcf7', 'custom_shortcode_atts_wpcf7_filter', 10, 3);
	function custom_shortcode_atts_wpcf7_filter($out, $pairs, $atts)
	{
		//		$my_attr = 'field-one';
		//		if ( isset( $atts[$my_attr] ) ) {
		//			$out[$my_attr] = $atts[$my_attr];
		//		}
		//		$my_attr = 'field-two';
		//		if ( isset( $atts[$my_attr] ) ) {
		//			$out[$my_attr] = $atts[$my_attr];
		//		}
		foreach ($atts as $key => $val) {
			$out[$key] = $atts[$key];
		}
		return $out;
	}

	new WP_EX_PAGE_ON_THE_FLY($args);
}


if (isset($_GET['mapsvg_embed_post'])) {  // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.NonceVerification.Missing
	add_action('wp_enqueue_scripts', 'mapsvg_add_jquery');
	add_action('template_redirect', 'mapsvg_blank_template');

	$post_id = (int)$_GET['mapsvg_embed_post'];  // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.NonceVerification.Missing
	$post = get_post($post_id, ARRAY_A);
	$post['slug'] = 'mapsvg_sc';

	new WP_EX_PAGE_ON_THE_FLY($post);
}
