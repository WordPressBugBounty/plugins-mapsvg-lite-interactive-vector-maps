<?php

namespace MapSVG;

/**
 * WooCommerce integration for MapSVG post embeds and Handlebars post fields.
 */
final class WooCommerceIntegration
{
	/** @var int|null Post ID being rendered inside /_mapsvg/post/{id} iframe embed. */
	private static $embedPostId = null;
	/** @var bool Prevent duplicate hook registration. */
	private static $hooksRegistered = false;

	/**
	 * Register hooks when WooCommerce is active.
	 */
	public static function boot(): void
	{
		if (self::$hooksRegistered) {
			return;
		}
		if (!self::isActive()) {
			return;
		}

		add_filter('mapsvg_format_post_data', array(self::class, 'formatPostData'), 10, 1);
		add_action('wp_enqueue_scripts', array(self::class, 'enqueueEmbedAssets'), 20);
		add_action('wp_enqueue_scripts', array(self::class, 'enqueueFrontendCartAssets'), 100);
		add_filter('body_class', array(self::class, 'embedBodyClasses'));
		self::$hooksRegistered = true;
	}

	/**
	 * Whether WooCommerce plugin is installed and active.
	 */
	public static function isActive(): bool
	{
		return class_exists('WooCommerce');
	}

	/**
	 * Mark the current request as a product/post embed iframe.
	 */
	public static function setEmbedPostId(?int $postId): void
	{
		self::$embedPostId = $postId > 0 ? $postId : null;
	}

	/**
	 * @return int|null
	 */
	public static function getEmbedPostId(): ?int
	{
		return self::$embedPostId;
	}

	/**
	 * Whether the embed URL targets a WooCommerce product.
	 */
	public static function isProductEmbed(): bool
	{
		if (self::$embedPostId === null) {
			return false;
		}

		return get_post_type(self::$embedPostId) === 'product';
	}

	/**
	 * Path to the Woo product embed shell template, if applicable.
	 */
	public static function getEmbedTemplatePath(): ?string
	{
		if (!self::isProductEmbed()) {
			return null;
		}

		$path = MAPSVG_PLUGIN_DIR . DIRECTORY_SEPARATOR . 'php' . DIRECTORY_SEPARATOR . 'Domain'
			. DIRECTORY_SEPARATOR . 'Shortcode' . DIRECTORY_SEPARATOR . 'product-embed-template.php';

		return file_exists($path) ? $path : null;
	}

	/**
	 * Enrich linked WP posts with WooCommerce data for Handlebars templates.
	 *
	 * @param \WP_Post|null $post
	 * @return \WP_Post|null
	 */
	public static function formatPostData($post)
	{
		if (!$post instanceof \WP_Post || $post->post_type !== 'product') {
			return $post;
		}

		$product = wc_get_product($post->ID);
		if (!$product) {
			return $post;
		}

		$post->product_type     = $product->get_type();
		$post->price_html       = $product->get_price_html();
		$post->regular_price    = $product->get_regular_price();
		$post->sale_price       = $product->get_sale_price();
		$post->sku              = $product->get_sku();
		$post->is_in_stock      = $product->is_in_stock();
		$post->is_on_sale       = $product->is_on_sale();
		$post->is_purchasable   = $product->is_purchasable();
		$post->short_description = apply_filters(
			'woocommerce_short_description',
			$product->get_short_description()
		);
		$post->gallery          = self::buildGalleryData($product);
		$post->add_to_cart_html = self::renderAddToCartHtml($product);
		$post->book_now_url     = self::buildBookNowUrl($product);
		$post->use_product_embed = $product->is_type('variable') || $product->is_type('grouped')
			|| $product->is_type('external');

		return $post;
	}

	/**
	 * Enqueue WooCommerce AJAX cart scripts on pages that load MapSVG.
	 */
	public static function enqueueFrontendCartAssets(): void
	{
		if (!self::isActive() || !function_exists('WC')) {
			return;
		}
		if (!wp_script_is('mapsvg', 'enqueued')) {
			return;
		}

		wp_enqueue_script('wc-add-to-cart');
		wp_enqueue_script('wc-cart-fragments');
	}

	/**
	 * Enqueue WooCommerce frontend assets for iframe product embeds.
	 */
	public static function enqueueEmbedAssets(): void
	{
		if (!self::isProductEmbed() || !function_exists('WC')) {
			return;
		}

		$product = wc_get_product(self::$embedPostId);
		if (!$product) {
			return;
		}

		if (function_exists('wc_enqueue_styles')) {
			\wc_enqueue_styles();
		}

		wp_enqueue_script('wc-single-product');

		if ($product->is_type('variable')) {
			wp_enqueue_script('wc-add-to-cart-variation');
		}

		wp_enqueue_script('wc-add-to-cart');
	}

	/**
	 * @param string[] $classes
	 * @return string[]
	 */
	public static function embedBodyClasses(array $classes): array
	{
		if (!self::isProductEmbed()) {
			return $classes;
		}

		$classes[] = 'woocommerce';
		$classes[] = 'single-product';
		$classes[] = 'mapsvg-embedded-product';

		return $classes;
	}

	/**
	 * @param \WC_Product $product
	 * @return array<int, array{thumbnail: string, medium: string, large: string, full: string}>
	 */
	private static function buildGalleryData($product): array
	{
		$gallery = array();
		$image_ids = array_filter(array_merge(
			array($product->get_image_id()),
			$product->get_gallery_image_ids()
		));

		foreach ($image_ids as $image_id) {
			if (!$image_id) {
				continue;
			}

			$gallery[] = array(
				'thumbnail' => (string) wp_get_attachment_image_url($image_id, 'thumbnail'),
				'medium'    => (string) wp_get_attachment_image_url($image_id, 'medium'),
				'large'     => (string) wp_get_attachment_image_url($image_id, 'large'),
				'full'      => (string) wp_get_attachment_image_url($image_id, 'full'),
			);
		}

		return $gallery;
	}

	/**
	 * Checkout URL that adds the product to cart (simple purchasable products).
	 *
	 * @param \WC_Product $wcProduct
	 */
	private static function buildBookNowUrl($wcProduct): string
	{
		if (!$wcProduct->is_purchasable() || !$wcProduct->is_in_stock()) {
			return '';
		}

		if (
			$wcProduct->is_type('variable')
			|| $wcProduct->is_type('grouped')
			|| $wcProduct->is_type('external')
		) {
			return '';
		}

		return (string) add_query_arg(
			array(
				'add-to-cart' => $wcProduct->get_id(),
				'quantity'    => 1,
			),
			wc_get_checkout_url()
		);
	}

	/**
	 * Render add-to-cart markup for simple products (Handlebars inline layout).
	 *
	 * @param \WC_Product $wcProduct
	 */
	private static function renderAddToCartHtml($wcProduct): string
	{
		if (!$wcProduct->is_type('simple') || !$wcProduct->is_purchasable()) {
			return '';
		}

		global $product;
		$previousProduct = $product;
		$product = $wcProduct;

		ob_start();
		woocommerce_template_single_add_to_cart();
		$html = (string) ob_get_clean();

		$product = $previousProduct;

		return $html;
	}
}
