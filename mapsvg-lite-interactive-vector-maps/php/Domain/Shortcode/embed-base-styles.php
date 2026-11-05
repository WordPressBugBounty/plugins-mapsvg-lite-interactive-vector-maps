<?php
/**
 * Shared CSS for MapSVG post/product iframe embed shells.
 */
?>
<style>
    #wpadminbar {
        display: none;
    }

    html {
        margin-top: 0 !important;
    }

    body {
        position: relative;
        background-color: transparent !important;
    }

    article .entry-header {
        margin: 0 !important;
    }

    article .entry-content,
    .mapsvg-embed-product .woocommerce {
        margin-left: 0 !important;
        margin-right: 0 !important;
        max-width: 100% !important;
        padding: 0 !important;
    }

    article .entry-content>*:first-child,
    .mapsvg-embed-product .woocommerce>*:first-child {
        margin-top: 0 !important;
    }

    article .entry-content>*,
    .mapsvg-embed-product .woocommerce>* {
        margin-left: 0 !important;
        margin-right: 0 !important;
        max-width: 100% !important;
    }

    article .entry-header>* {
        margin-left: 0 !important;
        margin-right: 0 !important;
        max-width: 100% !important;
    }

    .edit-link {
        display: none !important;
    }

    .mapsvg-embed-product .woocommerce div.product {
        margin-bottom: 0;
    }
</style>
