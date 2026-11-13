<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="profile" href="http://gmpg.org/xfn/11">

    <?php if (! get_theme_support('title-tag')) : ?>
        <title><?php wp_title(); ?></title>
    <?php endif; ?>

    <?php wp_head(); ?>
    <?php include __DIR__ . '/embed-base-styles.php'; ?>
</head>

<body <?php body_class('blank-slate mapsvg-embedded-post mapsvg-embedded-product'); ?>>

    <div class="mapsvg-embed-product">
        <div class="woocommerce">
            <?php while (have_posts()) : ?>
                <?php the_post(); ?>

                <?php
                global $product;
                $product = wc_get_product(get_the_ID());
                if ($product) {
                    wc_get_template_part('content', 'single-product');
                }
                ?>

            <?php endwhile; ?>
        </div>
    </div>

    <?php wp_footer(); ?>
    <?php include __DIR__ . '/embed-resize-script.php'; ?>

</body>

</html>
