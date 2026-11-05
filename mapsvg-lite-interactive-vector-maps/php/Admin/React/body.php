<?php
/** React shell; WordPress owns only the first bootstrap status. */
?>
<div id="mapsvg-admin-react-root" class="mapsvg-react-admin-host">
    <section data-mapsvg-admin-startup role="status" style="position:absolute;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:32px;box-sizing:border-box;font:15px/1.6 system-ui;color:#222;background:#fff;text-align:center">
        <img src="<?php echo esc_url(MAPSVG_PLUGIN_URL . 'img/mapsvg-loader.svg'); ?>" width="56" height="56" alt="" aria-hidden="true">
        <p style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0">Loading MapSVG editor…</p>
    </section>
</div>
