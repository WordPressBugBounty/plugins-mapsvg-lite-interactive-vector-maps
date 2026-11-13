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

<body <?php body_class('blank-slate mapsvg-embedded-post'); ?>>

    <?php while (have_posts()) : ?>

        <?php the_post(); ?>

        <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
            <?php $title = the_title('<h1 class="entry-title">', '</h1>', false); ?>
            <?php if ($title && strlen($title) > 29 && !isset($_GET["mapsvg_shortcode"])) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended, WordPress.Security.NonceVerification.Missing
            ?>
                <header class="entry-header page-header">
                    <?php echo $title; ?>
                </header>
            <?php } ?>

            <div class="entry-content">
                <?php the_content(); ?>
            </div>

        </article><!-- #post-<?php the_ID(); ?> -->

    <?php endwhile; ?>

    <?php wp_footer(); ?>
    <?php include __DIR__ . '/embed-resize-script.php'; ?>

</body>

</html>
