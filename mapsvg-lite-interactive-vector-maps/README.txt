=== MapSVG - Vector maps, Google Maps, Image maps - with AI assistant ===
Contributors: oyatek
Tags: ai maps, interactive map, map, google maps, store locator
Requires at least: 5.0
Tested up to: 7.1.4
Stable tag: 9.0.7
Requires PHP: 7.4
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

AI maps for WordPress. Turn one prompt into interactive SVG maps, image maps, floor plans or Google Maps.

== Description ==

**Any map. One prompt.**

Describe the map you want. MapSVG AI helps you build and configure it directly in WordPress: connect your data, place it on the map, arrange the layout and set the styling. See the actual result in the preview, continue with another prompt or fine-tune it yourself in the visual editor.

Create store locators, country maps, real estate maps, campus guides, event maps, interactive floor plans and more. Start with an included SVG map, upload your own SVG or image, or use Google Maps. Available tools and integrations depend on your plan.

= Start with an idea =

Tell the assistant what you need, for example:

* "Create a map of Poland with clickable regions and a tooltip for each region."
* "Turn this floor plan into an interactive map with room names and details on click."
* "Create a map of our locations with address search and custom markers."

AI works through the editor's tools to create and update your map. Review the result, ask for changes and publish the draft when you are ready.

= Three map formats =

* **SVG maps**: Use 100+ included country and region maps, or upload your own vector artwork. Make areas clickable, connect them to your data and edit SVG geometry inside WordPress.
* **Image maps**: Add interactive regions to floor plans, illustrations, venue plans and other images.
* **Google Maps**: Show locations, markers and geographic overlays on a Google map. Google-powered maps and address search require your own configured Google Maps API key.

= Start free with MapSVG Lite =

* AI assistant with a free AI credit allowance.
* SVG maps, image maps and Google Maps.
* Unlimited maps and locations.
* Built-in data Collections with custom fields and reusable records.
* Interactive regions and markers, custom marker images and clickable links.
* Tooltips, popovers and detail views for your map content.
* Address search, country restrictions and postal-code search.
* Visual map settings, responsive layouts and device previews.
* Separate drafts and published configurations, with version history.

= More tools as your project grows =

MapSVG Personal, Professional and Business add-ons expand Lite with features such as directories, advanced filters, CSV import, Google Sheets sync, WordPress content and custom fields, marker clustering, image galleries, linked maps and code editors. Feature availability and included AI usage depend on the plan.

[Explore MapSVG](https://mapsvg.com/) | [Documentation](https://mapsvg.com/docs/)

== Installation ==

1. Install and activate MapSVG Lite from the WordPress Plugins screen, or upload its ZIP.
2. Open MapSVG in your WordPress admin.
3. Connect your MapSVG account to activate AI access and view your credit allowance.
4. Describe the map you want, or choose "Create new map manually" to use the visual editor.
5. Add a Google Maps API key only if your map uses Google Maps or Google-powered address services.
6. Review your draft, publish it and embed the map on a page using its shortcode.

== Frequently Asked Questions ==

= Can I create a map with one prompt? =

Yes. Describe the result you want and let the AI assistant set up the map using the available editor tools. You can request further changes through chat or adjust the result manually. Use an included map, your own SVG or image, or Google Maps as the starting point. Some capabilities require a paid add-on.

= Can I use MapSVG without AI? =

Yes. The visual editor remains available for manual map creation and editing.

= How does the AI service work? =

The assistant uses MapSVG's hosted AI service. When you send a request, your prompt, relevant map context and any files you attach are sent to that service for processing. AI access requires a MapSVG account, an internet connection and available AI credits. The Usage panel shows your allowance and purchased credits.

= How much AI usage is included? =

Lite includes a free AI allowance. Paid plans include additional usage, and extra credits can be purchased inside the plugin. Usage depends on the complexity of your requests. See the Usage panel and current plans for your allowance.

= Do I need a Google Maps API key? =

Only for Google Maps and Google-powered services such as address search. An SVG or image map without those services does not need a Google Maps key. Google's own usage and billing terms apply.

= Can I use my own SVG or image? =

Yes. Upload a geographic map, floor plan, site plan or illustration, add interactive regions and connect them to your data. You can edit SVG geometry inside WordPress.

= Can I connect my own data? =

Yes. Lite includes MapSVG Collections and custom fields. Paid add-ons offer further data tools and integrations, including CSV, Google Sheets and WordPress content. Available integrations depend on your plan.

= Will editing a draft change my live map? =

Changes to a draft's map configuration stay in the draft until you publish it. Shared Collection records are different: editing those records can affect every map that uses them. Map version history is not a backup of shared data.

= Where can I get support? =

Use the Support button in MapSVG to open your Dashboard, then use the chat button in the bottom-right corner.

= How can I report a security bug? =

You can report security bugs through the Patchstack Vulnerability Disclosure Program. The Patchstack team helps validate, triage and handle any security vulnerabilities. [Report a security vulnerability.](https://patchstack.com/database/vdp/4b4b7989-18ec-4cef-82a4-c2225e5fceef)

== Changelog ==

= 9.0.7 =
* **Lite**: Improved marker positioning performance and Google Maps world-copy updates.
* **Lite**: Fixed startup errors on sites with a separate Composer autoloader, plus marker and geocoding class loading.
* **All plans**: Fixed image uploads creating SVG files with an undefined filename in the v8 editor.
* **Professional, Business, Pro, Elite, Envato and Demo**: Improved cluster zoom animation performance, including rapid zoom changes and offscreen markers. Update Lite and the add-on for the full improvement.

= 9.0.6 =
* **Lite**: Improved access checks for map and Collection data.
* **Lite**: Fixed saving and publishing maps upgraded from v8 with default templates.

= 9.0.5 =
* **Lite**: Security improvements for Collection data and embedded content.
* **Lite**: Fixed linked WordPress post fields in local Collections.
* **Lite**: Fixed loading individual Collection schemas and Region filter labels.
* **Lite**: Improved Google Maps zoom stability and overlapping marker interactions.
* **Professional, Business, Pro, Elite, Envato and Demo**: Added smooth cluster split/merge animations and animated expansion of markers at the same location.
* **Professional, Business, Pro, Elite, Envato and Demo**: Fixed cluster updates during rapid Google Maps zoom changes. These add-ons require Lite 9.0.5 or newer.

= 9.0.4 =
* Fixed saving records with empty location addresses after upgrading from v8.
* Location validation errors now return a validation response instead of a server error.

= 9.0.3 =
* **Lite**: Fixed publishing new maps with default settings.

= 9.0.2 =
* Minor bugfix.

= 9.0.1 =
* **Lite**: Fixed “Clean orphan region records” failing with a JavaScript permission error.

= 9.0.0 =
* **New map editor**: Redesigned workspace with live preview, responsive layouts and reusable data collections.
* **Drafts and version history**: Edit drafts separately from published maps, keep version history and restore earlier versions. Existing published maps retain their original renderer until migrated.
* **AI assistant**: Create and update maps through chat directly in the editor, with AI credit usage available inside the plugin.
* **More free features**: Upload custom marker images, add links to regions and markers, restrict address searches by country and search by postal code.
* **Google Maps**: Fixed marker positioning when panning across repeated copies of the world map.
* **Reliability**: Improved SVG editing, draft recovery and compatibility with existing maps during upgrades.

= 8.16.3 =
* **Site stability**: Fixed site-wide fatal error after updating to 8.16.2 on some sites.
* **Database migration**: The database migration is more robust and no longer retries on every request after a failure.

= 8.16.2 =
* **Security**: Several security-related fixes.
* **WordPress posts**: Permanently deleted posts now remove their linked MapSVG records.
* **Gutenberg Location**: Addresses containing escaped characters are preserved when a post is saved.
* **Region data**: Editing region fields preserves the internal orphan status and existing region records.
* **Remote CSV import**: The selected ID column is used when updating existing rows.
* **SVG editing**: Saved SVG changes refresh on the map instead of remaining cached.
* **Repeated SVG saves**: Saves made within the same second each receive a new SVG version.
* **Firefox**: Pages scroll normally while the pointer is over map regions.
* **Mobile Google Maps**: Switching between Map and List preserves the world zoom level.
* **Google Maps overlays**: SVG overlays stay aligned when the map container has fractional dimensions.
* **Hidden maps**: Maps redraw when their container becomes visible.
* **Visibility List**: Hiding an SVG path works when that path has an inline display style.
* **SVG panning**: The map can be panned after zooming out to the minimum level.
* **Region color picker**: The current HEX color value appears correctly.
* **Legacy maps**: Maps created in version 4.x load correctly after upgrading.
* **Map duplication**: Duplicating a map works on sites using plain permalinks.

= 8.16.1 =
* Fixed: **Security** — hardened WordPress post-type REST routes with additional access checks.
* Fixed: **Filters** — public maps no longer get stuck on a loading spinner when a cached page sends an expired WordPress REST nonce; those reads retry without the stale nonce.
* Fixed: **CSV import** — file uploads honor the selected ID column so existing region rows update instead of duplicating. "No ID" appends as expected, and Excel BOM headers no longer create blank IDs.
* Fixed: **Loading spinner** — the spinner sits next to the loading text, empty text is hidden, and the preloader is visible before JavaScript runs.
* Fixed: **Mobile toolbar** — Map/List icons show correctly when Shadow DOM is enabled.
* Fixed: **Pinch-zoom** — pinch-zoom no longer fails on some iPad browsers (including DuckDuckGo).
* Fixed: **USA counties map** — corrected the Orange County spelling.
* Fixed: **World map** — Oahu’s south-shore path now covers Sand Island / Honolulu Harbor so true WGS84 pins there sit on land.

= 8.16.0 =
* Improved: **Regions / SVG changes** — replacing or editing an SVG no longer deletes region records whose IDs disappeared. Those rows stay as orphans so you can copy their data, then remove them from Regions → Settings → Clean orphan region records.
* Improved: **Region labels** — more reliable label centering (better placement on awkward shapes, no flash before styles load). Bundled SVG maps were updated with the new centers.
* Fixed: **Security / REST API** — hardened remote CSV and API fetches so user-supplied URLs cannot reach private, loopback, or cloud-metadata hosts.
* Fixed: **CSV import** — Google Sheets web-view URLs are rejected; use a published CSV link instead.
* Fixed: **Admin** — stopped a map resize feedback loop that could keep resizing the preview.

= 8.15.0 =
* Improved: **Elementor + Gutenberg** — added native integrations (Elementor widget and Gutenberg block) with live map preview directly inside the page editor, so you can see map updates while editing.

= 8.14.2 =
* Improved: **Admin UI** — data sources list now shows collection name, type, and linked post type.
* Improved: **Compatibility** — declared tested with WordPress 7.0.1.
* Fixed: **WP Posts** — fixed allowing the same WordPress post type to be attached to more than one data source.
* Fixed: **API** — requests for a missing collection/data source now return a clear bad-request error instead of failing.

= 8.14.1 =
* Fixed: **SVG uploads** — strengthened upload checks so only valid SVG files are accepted.
* Fixed: **Security / REST API** — hardened post-type and distinct-value endpoints against SQL injection.
* Fixed: **Security / loading text** — sanitized and safely rendered map loading text to prevent stored XSS.
* Fixed: **Security / Handlebars** — updated Handlebars to the latest version with security fixes.

= 8.14.0 =
* Improved: **Data sources** — you can delete unused data sources from the admin (connected sources and region tables stay protected).
* Improved: **WP Posts** — clearer Connect / Edit / Connected controls for data sources, and more reliable linking of maps to WordPress post types.
* Improved: **Admin UI** — cleaner data source actions (icon buttons) and form layout tweaks.
* Fixed: **WP Posts / post types** — fixed empty or missing `postType` on legacy `posts_*` schemas so post filters and sync work correctly.
* Fixed: **Google Maps** — removed an incorrect viewport restriction that could block map interaction.

= 8.13.2 =
* Fixed: data table was not getting created for new or duplicated maps

= 8.13.1 =
* Fixed: **Forms** — improved multiselect tag layout so tags don’t overlap other elements.
* Fixed: **Popovers** — fixed popovers closing when clicking inside them.

= 8.13.0 =
* Improved: **Google Sheets auto-sync** — added a full Google Sheets/remote CSV data source flow with scheduled auto-refetch support.
* Improved: **CSV import** — improved import flow with preflight validation, clearer ID-field handling, and smarter append/upsert behavior.
* Improved: **Admin UX** — improved CSV/database/regions controls, including geocoding options, read-only behavior, and add/edit button state updates.

= 8.12.2 =
* Fixed: zoom to cluster with markers at the same location

= 8.12.1 =
* Improved: categories can now group by text fields

= 8.12.0 =
* Improved: CSV import — large files (100K+ rows) are now processed in the background using chunked server-side parsing and WordPress Cron. Progress is tracked live and survives page reloads. Supports all field types including Location (with background geocoding), Image (remote URLs downloaded to WP Media Library with deduplication), Regions, Select, Checkboxes, Post, and Date.
* Improved: Error handling — all errors now include unique error codes. Extended descriptions are available at [mapsvg.com/docs/errors](https://mapsvg.com/docs/errors).

= 8.11.1 =
* Fixed: map data now updates correctly when connected posts are published, unpublished, trashed, or restored.
* Fixed: directory item templates rendering issues.
* Fixed: zoom to a single marker after filtering.
* Fixed: region status colors not applying correctly.
* Fixed: Slovenia map calibration.

= 8.11.0 =
* Feature: load 1 post location only, for the currently opened post page
* Feature: choose AND/OR logic for the multiselect filters

= 8.10.1 =
* Fixed: show previous map button functionality

Examples:
* `wp mapsvg export` - Export all MapSVG database tables to SQL file
* `wp mapsvg export --toDomain=mapsvg.com` - Export and replace current domain with a new one in the .sql file
* `wp mapsvg import /path/to/file.sql` - Import MapSVG data from SQL file

= 8.10.0 =
* Feature: added wp-cli export/import commands.

= 8.9.3 =
* Fixed: Windows OS incompatibility

= 8.9.2 =
* Feature: rounded map buttons
* Fixed: check if phpinfo() is available

= 8.9.1 =
* Fixed: styles for multiselect fields

= 8.9.0 =
* Feature: map themes: default, rounded

= 8.8.4 =
* Fixed: map visibility in Classic Post Editor

= 8.8.3 =
* Fixed: tooltip flickering during mirroring near map edges

= 8.8.2 =
* Fixed: Handlebars templates not loading correctly when multiple maps were on the same page
* Fixed: location form styles in Gutenberg

= 8.8.1 = 
* Fixed: not working {{distanceTo ...}} Handlebars tag

= 8.8.0 = 
* Feature: Isolate CSS to shadow root (optional)
* Fixed: blurred map on zoom in Safari

= 8.7.23 = 
* Fixed: XSS vulnerability in shortcode attributes

= 8.7.22 = 
* Feature: Maximum zoom level for clustering
* Fixed: blurred map on zoom in Safari
* Fixed: zoom to cluster on Google Maps

= 8.7.21 = 
* Fixed: empty directory in duplicated maps
* Fixed: "deprecated" error in logs

= 8.7.20 = 
* Fixed: zoom to a cluster did not always reveal its markers

= 8.7.19 = 
* Fixed: filtering by ACF using checkboxes fields
* Fixed: migration issues

= 8.7.18 = 
* Fixed: filtering by ACF select and multiselect fields
* Fixed: added compatibility with PHP 7.4

= 8.7.17 = 
* Fixed: unserialized ACF field values in filter options

= 8.7.16 = 
* Fixed: duplicating maps created in older version of mapsvg was triggering an error about auto_increment
* Fixed: improved world.svg map calibration

= 8.7.15 = 
* Fixed: prevent loading of Google Maps API for incompatible (uncalibrated) maps
* Fixed: user and access token creation (for support)
* Fixed: Clockwork issues in Laravel environment
* Fixed: filter tags were not loading when no filterSchema was provided
* Fixed: passing correct data to custom event handlers on mobile devices

= 8.7.14 = 
* Fixed: SVG file reload failed when regions had no Title field.

= 8.7.13 = 
* Fixed: prevent setting region statuses before the data has loaded from the server

= 8.7.12 = 
* Fixed: marker drag & drop

= 8.7.11 = 
* Fixed: buttons that control enabled/disabled state of the region status options
* Fixed: mobile map scroll issues
* Fixed: WP CPT connection, Gutenberg/Classic Editor scripts loading

= 8.7.10 = 
* Fixed: lite version fatal error

= 8.7.9 = 
* Fixed: visibility toggles for SVG groups
* Fixed: shortcode rendering in templates

= 8.7.8 = 
* Fixed: scroll on mobile devices
* Fixed: null region titles

= 8.7.5 = 
* Fixed: fixed issues of the "show another map in the same container" feature

= 8.7.4 = 
* Fixed: security issue, checking uploaded file type

= 8.7.3 = 
* Fixed: directory rendering issues with enabled categories

= 8.7.2 = 
* Fixed: "Show another map" feature functionality
* Fixed: WP Rocket and LiteSpeed cache plugins were breaking MapSVG code. Added JavaScript files to exclusions in those plugins' settings.
* Fixed: premature jQuery call that was breaking the map when jQuery wasn't immediately available

= 8.7.1 = 
* Fixed: deleting a post did not delete marker from the map
* Fixed: scrolling of css/js/templates code editors on Firefox
* Fixed: map sizing issues with some WP themes

= 8.7.0 = 
* Feature: dynamic Region statuses
* Fixed: incorrect container height issues in the map editor

= 8.6.15 = 
* Fixed: filter by region

= 8.6.14 =
* Fixed: saving settings on the main screen
* Fixed: maps not working with disabled permalinks

= 8.6.13 =
* Fixed: Duplicating a map now correctly updates the map ID in the "CSS" tab, preventing conflicts with the original map.

= 8.6.12 =
* Fixed a few vulnerabilities

= 8.6.11 =
* Fixed unavailable filtering by ACF fields
* Fixed handling of post type names containing dashes

= 8.6.10 =
* Fixed security vulnerabilities related to unauthorized shortcode rendering in templates

= 8.6.9 =
* Minor bugfix for migrations

= 8.6.8 =
* Minor bugfix

= 8.6.7 =
* Added SVG file sanitization for non-admins

= 8.6.6 =
* Fixed post title being rendered as plain text (in popovers / details)

= 8.6.5 =
* Fixed XSS vulnerability
* Fixed SVG file copy vulnerability

= 8.6.4 =
* Fix loading of different kinds of data sources

= 8.6.3 =
* Fix map.destroy() method

= 8.6.0 =
* (Pro only) Filters for WP CPT
* (Pro only) Dynamic markers by WP CPT field values

= 8.5.42 =
* Fix clustering

= 8.5.41 =
* Fix Handlebars WP shortcode rendering

= 8.5.40 =
* Fix "select" field editing
* Fix shortcode rending function (for mapsvg templates)

= 8.5.39 =
* Fix filter tags (show clickable filter tags when filters are hidden)
* Fix search by regions

= 8.5.38 =
* Fix clicking on links in SVG 
* Fix broken options in 8.5.37

= 8.5.37 =
* Fix plugin activation issues

= 8.5.36 =
* Fix shortcode rendering in the templates

= 8.5.35 =
* Add "mapsvg_format_post_data" filter
* Improve upgrading scripts from old MapSVG versions
* Fix flush_rewrite_rules issues

= 8.5.34 =
* Change "Upgrade to Pro" links to mapsvg.com/pricing

= 8.5.32 =
* Fix handle click on HTML links in SVG files
* Fix duplicate map feature
* Fix on mobile devices, on directory item click - properly fit markers on google maps
* Fix keep text search field state on database fetch, when filters are located in directory

= 8.5.31 =
* Fix invisible settings tabs in the Map Editor
* Fix the flush_rewrite_rules() execution issues
* Defer JS scripts loading

= 8.5.30 =
* Fix zero header/footer size, when used with details view

= 8.5.29 =
* Fix mobile buttons list/map

= 8.5.6 =
* Adjust Australia SVG map for better region label placement

= 8.5.7 =
* Fix reloading filters state on directory redraw

= 8.5.8 =
* Limit zoom levels to 1-22 (same as Google Maps)

= 8.5.9 =
* Fix pagination

= 8.5.10 = 
* Fix tables creation on plugin activation
* Fix viewBox reset to initial value

= 8.5.11 = 
* Fix tables creation on plugin activation

= 8.5.14 =
* Fix filters

= 8.5.15 =
* Fixed: filters not working properlywhen "search" button is added to the form

= 8.5.17 =
* Fixed: show popover on directory item click

== Upgrade Notice ==

== Screenshots ==
1. Start with a prompt in the AI chat
2. Build and refine your map with AI and a live preview
3. Customize your map with visual settings and components
