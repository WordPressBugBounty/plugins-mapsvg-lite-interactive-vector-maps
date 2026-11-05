<?php
/** Shortcode preview inside the active WordPress theme, without iframe resets. */
get_header();
?>
<main id="mapsvg-shortcode-preview" class="site-main">
    <?php while (have_posts()) : the_post(); ?>
        <div class="entry-content">
            <?php the_content(); ?>
        </div>
    <?php endwhile; ?>
</main>
<?php get_footer(); ?>
