import { PRODUCT_EMBED_HTML as defProductEmbedHtml } from "./productEmbedDefault"
import { BUILTIN_TEMPLATE_HTML } from "./templatePresets"
import { DEFAULT_TYPOGRAPHY } from "../Core/typography"
import { toTemplateEntry } from "./templateEntry"

const defRegionTemplate =
  "<div>\n" +
  "  <p>This is the demo content of the <strong>Region %templateType%</strong>.</p>\n" +
  '  <p>How to edit it: if you are in mapsvg control panel now, click on the following link to open the template editor for this view: <a href="#" class="mapsvg-template-link" data-template="%templateTypeSnake%Region">Menu > Templates > Region %templateType%</a>.</p>\n' +
  '  <p>More information about templates: <a href="https://mapsvg.com/docs/map-editor/templates" target="_blank">mapsvg.com/docs/map-editor/templates</a></p>\n' +
  "</div>\n" +
  "<hr />\n\n" +
  "<!-- Region fields are available in this template -->\n" +
  "<h5>{{#if title}} {{title}} {{else}} {{id}} {{/if}}</h5>\n" +
  "<p>Status: {{status_text}}</p>\n\n" +
  "<!-- Show all linked Database Objects: -->\n" +
  "{{#each objects}}\n\n" +
  "  <!-- DB Object are available inside of this block -->\n\n" +
  "  <h5>{{title}}</h5>\n" +
  "  <!-- When you need to render a field as HTML, use 3 curly braces instead of 2:-->\n" +
  "  <p>{{{description}}}</p>\n" +
  "  <p><em>{{location.address.formatted}}</em></p>\n\n" +
  "  <!-- Show all images: -->\n" +
  "  {{#each images}}\n" +
  '    <!-- Image fields "thumbnail", "medium", "full" -->\n' +
  "    <!-- are available in this block                -->\n" +
  '    <img src="{{thumbnail}}" />\n' +
  "  {{/each}}\n\n" +
  "{{/each}}"

const defDBTemplate =
  "<div>\n" +
  "  <p>This is the demo content of the <strong>DB Object %templateType%</strong>.</p>\n" +
  '  <p>How to edit it: if you are in mapsvg control panel now, click on the following link to open the template editor for this view: <a href="#" class="mapsvg-template-link" data-template="%templateTypeSnake%">Menu > Templates > DB Object %templateType%</a>.</p>\n' +
  '  <p>More information about templates: <a href="https://mapsvg.com/docs/map-editor/templates" target="_blank">mapsvg.com/docs/map-editor/templates</a></p>\n' +
  "</div>\n" +
  "<hr />\n\n" +
  "<!-- DB Object fields are available in this template. -->\n" +
  "<h5>{{title}}</h5>\n" +
  "<!-- When you need to render a fields as HTML, use 3 curly braces instead of 2:-->\n" +
  "<p>{{{description}}}</p>\n" +
  "<p><em>{{location.address.formatted}}</em></p>\n\n" +
  "<!-- Show all images: -->\n" +
  "{{#each images}}\n" +
  '  <!-- Image fields "thumbnail", "medium", "full" -->\n' +
  "  <!-- are available in this block                -->\n" +
  '  <img src="{{thumbnail}}" />\n' +
  "{{/each}}\n\n" +
  "<!-- Show all linked Regions, comma-separated: -->\n" +
  "<p> Regions: \n" +
  "  {{#each regions}}\n" +
  "    <!-- Region fields are available in this block -->\n" +
  "    {{#if title}}\n" +
  "      {{title}}\n" +
  "    {{else}}\n" +
  "      {{id}}\n" +
  "    {{/if}}{{#unless @last}}, {{/unless}}\n" +
  "  {{/each}}\n" +
  "</p>"

const defProductCardHtml = `<!--
  ProductCard — WooCommerce product card (inline fields).

  Recommended: Details View + style preset "Card".

  Usage as partial (e.g. in Region Details):
  [[>ProductCard product=objects.0.post]]

  Replace [] symbols in the example with {}

  Buttons:
  - Add to cart — optional: replace the Book now block with [[[product.add_to_cart_html]]]
    (Woo form HTML for simple purchasable products; use triple braces so HTML is not escaped).
  - Book now — shown when product.book_now_url is set (checkout URL that adds the product).
  - View product — fallback link to product.url when book_now_url is empty.
  - Variable/grouped/external products: when product.use_product_embed is true, the full
    Woo embed [[[product]]] is used instead of this card.
-->
{{#if product}}
  {{#if product.use_product_embed}}
    {{product}}
  {{else}}
    <article class="mapsvg-product-simple">
      <div class="mapsvg-product-gallery">
        {{#if product.gallery.0.full}}
          <img src="{{product.gallery.0.full}}" alt="{{product.post_title}}" class="mapsvg-product-image" loading="lazy" />
        {{/if}}
      </div>

      <div class="mapsvg-product-body">
        <h2 class="mapsvg-product-title">{{product.post_title}}</h2>

        {{#if product.sku}}
          <div class="mapsvg-product-badges">
            <span class="mapsvg-product-badge">{{product.sku}}</span>
            {{#if product.is_on_sale}}
              <span class="mapsvg-product-badge">Sale</span>
            {{/if}}
          </div>
        {{else}}
          {{#if product.is_on_sale}}
            <div class="mapsvg-product-badges">
              <span class="mapsvg-product-badge">Sale</span>
            </div>
          {{/if}}
        {{/if}}

        {{#if product.short_description}}
          <div class="mapsvg-product-excerpt">{{{product.short_description}}}</div>
        {{/if}}

        <div class="mapsvg-product-footer">
          {{#if product.price_html}}
            <div class="mapsvg-product-price-wrap">
              <span class="mapsvg-product-price-label">Price</span>
              <div class="mapsvg-product-price">{{{product.price_html}}}</div>
            </div>
          {{/if}}

          {{#if product.book_now_url}}
            <div class="mapsvg-product-cart">
              <a class="mapsvg-product-cart-link" href="{{product.book_now_url}}">Book now</a>
            </div>
          {{else}}
            <div class="mapsvg-product-cart">
              <a class="mapsvg-product-cart-link" href="{{product.url}}" target="_blank" rel="noopener">View product</a>
            </div>
          {{/if}}
        </div>
      </div>
    </article>
  {{/if}}
{{/if}}`

const defProductCardCss = `.mapsvg-product-simple {
  --ms-text: #111;
  --ms-muted: #8a8a8e;
  --ms-desc: #5c5c62;
  --ms-line: #e4e4ea;
  --ms-bg: #fff;
  --ms-accent: #5c5890;
  --ms-accent-hover: #4f4b7e;
  --ms-grad-from: #c4c0ff;
  --ms-grad-to: #6b6698;
  --ms-btn-radius: 12px;

  background: var(--ms-bg);
  overflow: hidden;
  color: var(--ms-text);
  font-family: var(--mapsvg-font-family, Helvetica, Arial, sans-serif);
  -webkit-font-smoothing: antialiased;
  width: 100%;
}

.mapsvg-product-gallery {
  position: relative;
  margin: 0;
  padding: 0;
  height: fit-content;
  display: block;
  overflow: hidden;
}

.mapsvg-product-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: center;
}

.mapsvg-product-body {
  padding: 10px 20px 20px 15px;
}

.mapsvg-product-title {
  margin: 0 0 10px;
  font-size: 1.35rem;
  line-height: 1.25;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.mapsvg-product-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0 0 12px;
}

.mapsvg-product-badge {
  display: inline-block;
  padding: 3px 8px;
  border: 1px solid var(--ms-line);
  border-radius: 6px;
  color: var(--ms-muted);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  line-height: 1.4;
}

.mapsvg-product-excerpt {
  margin: 0 0 18px;
  color: var(--ms-desc);
  font-size: 0.92rem;
  line-height: 1.55;
}

.mapsvg-product-excerpt p {
  margin: 0;
}

.mapsvg-product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.mapsvg-product-price-wrap {
  flex: 0 0 auto;
  min-width: 0;
}

.mapsvg-product-price-label {
  display: block;
  margin: 0 0 2px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--ms-muted);
}

.mapsvg-product-price {
  margin: 0;
  font-size: 1.25rem;
  line-height: 1.2;
  font-weight: 700;
  color: var(--ms-text);
}

.mapsvg-product-price del {
  color: var(--ms-muted);
  font-weight: 500;
  font-size: 0.85em;
  margin-right: 0.35em;
}

.mapsvg-product-price ins {
  text-decoration: none;
  color: var(--ms-text);
  font-weight: 700;
}

.mapsvg-product-price .amount {
  white-space: nowrap;
}

.mapsvg-product-cart {
  flex: 1 1 auto;
  margin: 0;
  max-width: 62%;
}

.mapsvg-product-cart form.cart {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0;
  margin: 0;
}

.mapsvg-product-cart .quantity,
.mapsvg-product-cart input.qty {
  display: none !important;
}

.mapsvg-product-cart button,
.mapsvg-product-cart .single_add_to_cart_button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45em;
  width: 100%;
  min-height: 46px;
  border: 0;
  border-radius: var(--ms-btn-radius);
  padding: 0 18px;
  background: var(--ms-accent);
  color: #fff !important;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  white-space: nowrap;
  line-height: 1;
}

.mapsvg-product-cart button svg,
.mapsvg-product-cart .single_add_to_cart_button svg {
  display: block;
  flex-shrink: 0;
  width: 1.15em;
  height: 1.15em;
  stroke: currentColor;
}

.mapsvg-product-cart button:hover,
.mapsvg-product-cart .single_add_to_cart_button:hover {
  background: var(--ms-accent-hover);
}

.mapsvg-product-cart-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 46px;
  border-radius: var(--ms-btn-radius);
  padding: 0 18px;
  background: var(--ms-accent);
  color: #fff !important;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none !important;
}

.mapsvg-product-cart-link:hover {
  background: var(--ms-accent-hover);
  color: #fff !important;
}
`



/**
 * @ignore
 */
const DefaultOptions = {
  source: "",
  useShadowRoot: true,
  typography: DEFAULT_TYPOGRAPHY,
  theme: {
    name: "default",
  },
  markerLastID: 0,
  regionLastID: 0,
  dataLastID: 1,
  disableAll: false,
  width: undefined,
  height: undefined,
  lockAspectRatio: false,
  padding: { top: 0, left: 0, right: 0, bottom: 0 },
  maxWidth: undefined,
  maxHeight: undefined,
  minWidth: undefined,
  minHeight: undefined,
  loadingText: "",
  //colors              : {base: "#E1F1F1", background: "#eeeeee", hover: "#548eac", selected: "#065A85", stroke: "#7eadc0"},
  colorsIgnore: false,
  colors: {
    baseDefault: "#000000",
    background: "#eeeeee",
    selected: 40,
    hover: 20,
    directory: "#fafafa",
    detailsView: "#ffffff",
    status: {},
    clusters: "",
    clustersBorders: "",
    clustersText: "",
    clustersHover: "",
    clustersHoverBorders: "",
    clustersHoverText: "",
    markers: {
      base: { opacity: 100, saturation: 100 },
      hovered: { opacity: 100, saturation: 100 },
      unhovered: { opacity: 40, saturation: 100 },
      active: { opacity: 100, saturation: 100 },
      inactive: { opacity: 40, saturation: 100 },
    },
  },
  regions: {},
  regionsDynamicStatus: {
    filtered: undefined,
    noObjects: undefined,
  },
  regionsDynamicStatusOrder: ["statusSync", "noObjects", "filtered"],
  statusSyncOn: false,
  statusSyncSource: "objects",
  statusSyncField: "",
  statusSyncMultiStrategy: "priority",
  statusSyncMap: [],
  clustering: { on: false, maxZoom: 17 },
  viewBox: [],
  cursor: "default",
  manualRegions: false,
  onClick: null,
  mouseOver: null,
  mouseOut: null,
  menuOnClick: null,
  beforeLoad: null,
  afterLoad: null,
  zoom: {
    on: true,
    limit: [0, 22],
    delta: 2,
    buttons: { on: true, location: "right" },
    mousewheel: true,
    fingers: true,
    hideSvg: false,
    hideSvgZoomLevel: 7,
  },
  scroll: { on: true, limit: false, background: false, spacebar: false },
  responsive: true,
  tooltips: { on: false, position: "bottom-right", template: "", maxWidth: "", minWidth: 100 },
  popovers: {
    on: false,
    position: "top",
    template: "",
    centerOn: true,
    width: 300,
    maxWidth: 50,
    maxHeight: 50,
  },
  multiSelect: false,
  regionStatuses: {
    "1": { label: "Enabled", value: "1", color: "", disabled: false },
    "0": { label: "Disabled", value: "0", color: "", disabled: true },
  },
  middlewares: {
    mapLoad: `function(data, ctx){
  const { map } = ctx

  // Example: Modify map options dynamically before applying them.
  // You can conditionally change map settings based on factors like the current URL,
  // user roles, or other runtime conditions.

  // IMPORTANT: Consider checking if the map is being displayed in the WordPress admin area 
  // (by verifying map.inBackend). Typically, you don't want to run this middleware in the backend, 
  // because if you modify the map options here and then save the map, those modifications 
  // will be saved as default options in the database.

  // For example, if the map is not in the backend and the user is viewing a specific post, 
  // you might disable the zoom controls:
  // 
  // if (!map.inBackend && window.location.href.includes("/a-post-about-cats")) {
  //   data.controls.zoom = false;
  // }

  // Always return the modified or unmodified data from the middleware:
  return data
}`,
    render: `function(data, ctx){
  const { controller } = ctx;

  // This middleware function allows you to modify the data before it is sent to a specific controller.
  // Available controllers: details, popover, tooltip, directory, filters.
  // You can customize the data for different controllers, such as formatting numbers, strings, etc.

  // Example: If the controller is "details", format the "totalAmount" field from "1000000" to "1,000,000".
  // Uncomment and customize the following block to apply such transformations:
  //
  // if(controller.is("details")){
  //    return { ...data, totalAmount: data.totalAmount.toLocaleString('en-US') };  
  // }

  // Always return the data object after processing to ensure it continues through the middleware chain.
  return data;      
}`,
    request: `function(data, ctx){
  const { request, repository, map } = ctx;
  
  // This middleware function allows you to modify the request data before it is sent to the server.
  // Use this when you need to interact with a custom API that expects a different query format from MapSVG.
  
  // Example: If the request is for the "users" repository and the action is "index",
  // you can modify the request data by appending "_bar" to the "foo" property.
  //
  // if(repository.schema.objectNamePlural === "users" && request.action === "index") {
  //   data = {
  //     ...data,
  //     foo: data.foo + "_bar"
  //   };
  // }

  // Always return the data object after processing to ensure it continues through the middleware chain.
  return data;
}`,
    response: `function(data, ctx){
  const { request, response, repository, map } = ctx;
  
  // This middleware function allows you to modify the response data received from the server.
  // Use this when working with a custom API that returns data in a format different from what MapSVG expects.
  
  // Example: A response format that is compatible with MapSVG might look like this:
  // {
  //   users: {
  //     items: [
  //       {id: 1, name: "John"},
  //       {id: 2, name: "Anna"},
  //     ],
  //     hasMore: true
  //   }
  // }
  //
  // Suppose your actual API response has this structure:
  // {
  //   items: [
  //     {id: 1, name: "John"},
  //     {id: 2, name: "Anna"},
  //   ],
  //   page: 3,
  //   totalPages: 120
  // }
  //
  // The following code modifies the response for the "users" repository 
  // when fetching a list of models (the "index" action).
  // 
  // if(repository.schema.objectNamePlural === "users" && request.action === "index") {
  //   const dataParsed = typeof response.data === "string" ? JSON.parse(response.data) : data;
  //   const dataFormatted = {
  //     users: {
  //       items: dataParsed.items,
  //       hasMore: dataParsed.page < dataParsed.totalPages
  //     }
  //   };
  //   return dataFormatted;
  // } 
  
  // Always return the data object after processing to ensure it continues through the middleware chain.
  return data;    
}
`,
  },
  events: {
    afterInit: `function(event) {
  const { map } = event;

  // This event handler triggers after the map has fully initialized and all data has loaded.
  // It's a good place to execute any custom logic or manipulation that requires the map to be fully set up.

  // "map" gives you access to the MapSVG instance, allowing you to:
  // - Interact with the map's regions, markers, and other elements.
  // - Access or modify the map's settings, such as zoom level, center position, etc.
  // - Attach additional event listeners or perform post-initialization tasks.
}
`,
    beforeInit: `function(event) {
  const { map } = event;

  // This event handler triggers just before the map begins its initialization process.
  // It's a good place to set up any pre-initialization configurations or modifications.

  // "map" provides access to the MapSVG instance, allowing you to:
  // - Set or modify map settings before initialization starts (e.g., set default options).
  // - Add or alter data that will be used during initialization, such as regions or markers.
  // - Prepare any custom logic that needs to run early in the initialization phase.
}
`,
    zoom: `function(event) {
  const { map } = event;

  // This event handler triggers whenever the map is zoomed in or out.
  // It's useful for executing actions based on the zoom level of the map.

  // "map.zoomLevel" provides the current zoom level of the map.
  // You can use this to perform tasks like:
  // - Adjusting the visibility of certain elements based on zoom.
  // - Logging or displaying the current zoom level for debugging or user information.
  // - Dynamically loading additional data or layers depending on the zoom level.

  // Example usage:
  // console.log(map.zoomLevel);
}
`,
    afterLoadRegions: `function(event) {
  const { map } = event;

  // This event triggers after all regions from the regionsRepository have been fully loaded onto the map.
  // At this point:
  // - Regions are connected to their respective data objects.
  // - The directory (if present) is refreshed and populated with the updated data.

  // This is a good place to:
  // - Perform actions that depend on the regions being fully available on the map.
  // - Update or manipulate the directory based on the newly loaded data.
  // - Implement custom logic or effects that require all regions to be loaded.

  // Example:
  // console.log('Regions are fully loaded and connected to data:', map.regions);
}
`,
    afterLoadObjects: `function(event) {
  const { map } = event;

  // This event triggers after all objects from the objectsRepository have been fully loaded onto the map.
  // At this point:
  // - Objects are connected to their respective markers and regions.
  // - The directory (if present) is updated with the new data for these objects.

  // This is a good place to:
  // - Perform actions that depend on the objects being fully loaded and connected.
  // - Update or manipulate the map’s markers or regions based on the newly loaded objects.
  // - Implement custom logic or visual effects that require all objects to be loaded and displayed.

  // Example:
  // console.log('Objects are fully loaded and connected to markers and regions:', map.objects);
}
`,

    /**
     * Repository (Regions/Objects)
     */
    "beforeLoad.repository": `function(event) {
  const { map, data: { repository } } = event  

  // Perform actions or logging before the data is fetched from an API source into repository internal storage.

}`,
    "afterLoad.repository": `function(event) {
  const { map, data: { repository } } = event  

  // Perform actions or logging before the data is fetched from an API source into repository internal storage.

}`,
    /**
     * Region
     */
    "click.region": `function(event) {
  const { map, data: { region } } = event

  // Triggered when a region on the map is clicked.
  // You can access the clicked region's data using the 'region' property.
}`,
    "mouseover.region": `function(event) {
  const { map, data: { region } } = event

  // Triggered when the mouse pointer hovers over a region on the map.
  // You can access the hovered region's data using the 'region' property.
}`,
    "mouseout.region": `function(event) {
  const { map, data: { region } } = event

  // Triggered when the mouse pointer moves out of a region on the map.
  // You can access the region's data using the 'region' property.
}`,

    /**
     * Marker
     */
    "click.marker": `function(event) {
  const { map, data: { marker } } = event  
  
}`,
    "mouseover.marker": `function(event) {
  const { map, data: { marker } } = event  
  
}`,
    "mouseout.marker": `function(event) {
  const { map, data: { marker } } = event  
  
}`,
    /**
     * Popover
     */
    "beforeRedraw.popover": `function(event) {
  const { map, data: { controller } } = event      
}`,
    "afterRedraw.popover": `function(event) {
  const { map, data: { controller } } = event      
}`,
    "beforeShow.popover": `function(event) {
  const { map, data: { controller } } = event      
}`,
    "afterShow.popover": `function(event) {
  const { map, data: { controller } } = event      
  
}`,
    "beforeClose.popover": `function(event) {
  const { map, data: { controller } } = event      
  
}`,
    "afterClose.popover": `function(event) {
  const { map, data: { controller } } = event      

}`,
    /**
     * Details
     */
    "beforeRedraw.detailsView": `function(event) {
  const { map, data: { controller } } = event      
}`,
    "afterRedraw.detailsView": `function(event) {
  const { map, data: { controller } } = event      
  
}`,
    "beforeClose.detailsView": `function(event) {
  const { map, data: { controller } } = event      
  
}`,
    "afterClose.detailsView": `function(event) {
  const { map, data: { controller } } = event      
  
}`,
    "beforeShow.detailsView": `function(event) {
  const { map, data: { controller } } = event          

}`,
    "afterShow.detailsView": `function(event) {
  const { map, data: { controller } } = event          

}`,
    /**
     * Tooltip
     */
    "beforeRedraw.tooltip": `function(event) {
  const { map, data: { controller } } = event      
}`,
    "afterRedraw.tooltip": `function(event) {
  const { map, data: { controller } } = event      
}`,
    "beforeClose.tooltip": `function(event) {
  const { map, data: { controller } } = event      
}`,
    "afterClose.tooltip": `function(event) {
  const { map, data: { controller } } = event      
}`,
    "beforeShow.tooltip": `function(event) {
  const { map, data: { controller } } = event          
}`,
    "afterShow.tooltip": `function(event) {
  const { map, data: { controller } } = event          
}`,
  },
  css:
    "#mapsvg-map-%id% .mapsvg-tooltip {\n\n}\n" +
    "#mapsvg-map-%id% .mapsvg-popover {\n\n}\n" +
    "#mapsvg-map-%id% .mapsvg-details-container {\n\n}\n" +
    "#mapsvg-map-%id% .mapsvg-directory-item {\n\n}\n" +
    "#mapsvg-map-%id% .mapsvg-region-label {\n" +
    "  /* background-color: rgba(255,255,255,.6); */\n" +
    "  font-size: 11px;\n" +
    "  padding: 3px 5px;\n" +
    "  border-radius: 4px;\n" +
    "}\n" +
    "#mapsvg-map-%id% .mapsvg-marker-label {\n" +
    "  padding: 3px 5px;\n" +
    "  /*\n" +
    "  border-radius: 4px;\n" +
    "  background-color: white;\n" +
    "  margin-top: -4px;\n" +
    "  */\n}\n" +
    "#mapsvg-map-%id% .mapsvg-filters-wrap {\n\n}\n" +
    "\n\n\n\n\n\n",
  templates: {
    list: toTemplateEntry(BUILTIN_TEMPLATE_HTML.list),
    default: toTemplateEntry(BUILTIN_TEMPLATE_HTML.default),
    post: toTemplateEntry(BUILTIN_TEMPLATE_HTML.post),
    ProductCard: toTemplateEntry(defProductCardHtml, "default", defProductCardCss),
    ProductEmbed: toTemplateEntry(defProductEmbedHtml),
    title: toTemplateEntry(BUILTIN_TEMPLATE_HTML.title),
    description: toTemplateEntry(BUILTIN_TEMPLATE_HTML.description),
    imageTitle: toTemplateEntry(BUILTIN_TEMPLATE_HTML.imageTitle),
    address: toTemplateEntry(BUILTIN_TEMPLATE_HTML.address),
    popoverRegion: toTemplateEntry(
      defRegionTemplate
        .replace(/%templateType%/g, "Popover")
        .replace(/%templateTypeSnake%/g, "popover"),
    ),
    popoverMarker: toTemplateEntry(
      defDBTemplate
        .replace(/%templateType%/g, "Popover")
        .replace(/%templateTypeSnake%/g, "popover"),
    ),
    tooltipRegion: toTemplateEntry("{{id}} - {{title}}"),
    tooltipMarker: toTemplateEntry("{{title}}"),
    detailsView: toTemplateEntry(
      defDBTemplate
        .replace(/%templateType%/g, "Details View")
        .replace(/%templateTypeSnake%/g, "detailsView"),
    ),
    detailsViewRegion: toTemplateEntry(
      defRegionTemplate
        .replace(/%templateType%/g, "Details View")
        .replace(/%templateTypeSnake%/g, "detailsView"),
    ),
    labelMarker: toTemplateEntry(`{{#if location.address.formatted}}
        {{location.address.formatted}}
      {{else}}
        {{#if location.geoPoint.lat}}
          {{location.geoPoint.lat}}, {{location.geoPoint.lng}}
        {{/if}}
      {{/if}}`),
    labelRegion: toTemplateEntry("{{title}}"),
    labelLocation: toTemplateEntry("You are here!"),
  },
  choropleth: {
    on: false,
    source: "regions",
    sourceFieldSelect: {
      on: false,
      variants: [],
    },
    bubbleMode: false,
    bubbleSize: {
      min: 20,
      max: 40,
    },
    labels: { low: "low", high: "high" },
    colors: { lowRGB: null, highRGB: null, low: "#550000", high: "#ee0000", noData: "#333333" },
    min: 0,
    max: 0,
    coloring: {
      mode: "gradient",
      noData: {
        color: "#999999",
        description: "No data",
      },
      gradient: {
        colors: {
          lowRGB: null,
          highRGB: null,
          diffRGB: null,
          low: "#550000",
          high: "#ee0000",
        },
        labels: {
          low: "low",
          high: "high",
        },
        values: {
          min: null,
          max: null,
          maxAdjusted: null,
        },
      },
      palette: {
        outOfRange: {
          color: "#ececec",
          description: "Out of range",
        },
        colors: [
          {
            color: "#550000",
            valueFrom: 0,
            valueTo: 50,
            description: "",
          },
        ],
      },
      legend: {
        on: true,
        layout: "vertical",
        container: "bottom-left",
        title: "Choropleth map",
        text: "",
        description: "",
        width: "20%",
        height: "20%",
      },
    },
  },
  filters: {
    on: true,
    source: "database",
    location: "header",
    modalLocation: "map",
    width: "100%",
    hide: false,
    showButtonText: "Filters",
    clearButtonText: "Clear all",
    clearButton: false,
    searchButton: false,
    searchButtonText: "Search",
    padding: "",
  },
  menu: {
    on: false,
    hideOnMobile: true,
    location: "leftSidebar",
    locationMobile: "leftSidebar",
    search: false,
    containerId: "",
    searchPlaceholder: "Search...",
    searchFallback: false,
    source: "database",
    showFirst: "map",
    showMapOnClick: true,
    minHeight: "400",
    sortBy: "id",
    sortDirection: "desc",
    categories: {
      on: false,
      groupBy: "",
      hideEmpty: true,
      collapse: true,
      collapseOther: true,
    },
    clickActions: {
      region: "default",
      marker: "default",
      directoryItem: {
        triggerClick: true,
        showPopover: false,
        showDetails: true,
      },
    },
    detailsViewLocation: "overDirectory",
    noResultsText: "No results found",
    filterout: { field: "", cond: "=", val: "" },
  },
  database: {
    on: true,
    regionsTableName: "",
    objectsTableName: "",
    pagination: {
      on: true,
      perpage: 30,
      next: "Next",
      prev: "Prev.",
      showIn: "both",
    },
    loadOnStart: true,
    autoRefetch: {
      on: false,
      value: 5,
      unit: "s",
    },
    regionsAutoRefetch: {
      on: false,
      value: 5,
      unit: "s",
    },
    table: "",
    schemas: {
      regions: {
        objectNameSingular: "region",
        objectNamePlural: "regions",
        name: "",
        apiEndpoints: [
          { url: "regions/%name%", method: "GET", name: "index" },
          { url: "regions/%name%/[:id]", method: "GET", name: "show" },
          { url: "regions/%name%", method: "POST", name: "create" },
          { url: "regions/%name%/[:id]", method: "PUT", name: "update" },
          { url: "regions/%name%/[:id]", method: "DELETE", name: "delete" },
          { url: "regions/%name%", method: "DELETE", name: "clear" },
        ],
      },
      objects: {
        objectNameSingular: "object",
        objectNamePlural: "objects",
        name: "",
        apiEndpoints: [
          { url: "objects/%name%", method: "GET", name: "index" },
          { url: "objects/%name%/[:id]", method: "GET", name: "show" },
          { url: "objects/%name%", method: "POST", name: "create" },
          { url: "objects/%name%/[:id]", method: "PUT", name: "update" },
          { url: "objects/%name%/[:id]", method: "DELETE", name: "delete" },
          { url: "objects/%name%", method: "DELETE", name: "clear" },
        ],
      },
    },
  },
  actions: {
    map: {
      afterLoad: {
        selectRegion: true,
        selectMarker: true,
        loadPost: false,
      },
    },
    region: {
      mouseover: {
        showTooltip: false,
        tooltipTemplate: "title",
      },
      click: {
        addIdToUrl: false,
        showDetails: true,
        showDetailsFor: "region",
        // START templates
        detailsViewTemplate: "detailsViewRegion",
        // REPLACE
        // detailsViewTemplate: "default",
        // END
        filterDirectory: false,
        loadObjects: false,
        showPopover: false,
        showPopoverFor: "region",
        popoverTemplate: "default",
        goToLink: false,
        linkField: "Region.link",
      },
      touch: {
        showPopover: false,
      },
    },
    marker: {
      mouseover: {
        showTooltip: false,
        tooltipTemplate: "address",
      },
      click: {
        addIdToUrl: false,
        showDetails: true,
        detailsViewTemplate: "default",
        showPopover: false,
        popoverTemplate: "default",
        goToLink: false,
        linkField: "Object.link",
      },
      touch: {
        showPopover: false,
      },
    },
    directoryItem: {
      click: {
        showDetails: true,
        detailsViewTemplate: "default",
        showPopover: false,
        goToLink: false,
        selectRegion: true,
        fireRegionOnClick: true,
        linkField: "Object.link",
      },
      hover: {
        centerOnMarker: false,
      },
    },
  },
  detailsView: {
    location: "map",
    containerId: "",
    width: "100%",
    mobileFullscreen: true,
    borderRadius: 0,
    padding: {
      top: 15,
      right: 15,
      bottom: 15,
      left: 15,
    },
    boxShadow: {
      on: false,
      value: 20,
    },
  },
  mobileView: {
    labelMap: "Map",
    labelList: "List",
    labelClose: "Close",
  },
  googleMaps: {
    on: false,
    apiKey: "",
    loaded: false,
    center: "auto", // or {lat: 12, lon: 13}
    type: "roadmap",
    minZoom: 1,
    style: "default",
    styleJSON: [],
    language: "en",
  },
  groups: [],
  floors: [],
  layersControl: {
    on: false,
    position: "top-left",
    label: "Show on map",
    expanded: true,
    maxHeight: "100%",
  },
  floorsControl: {
    on: false,
    position: "top-left",
    label: "Floors",
    expanded: false,
    maxHeight: "100%",
  },
  containers: {
    leftSidebar: { on: false, width: "250px" },
    rightSidebar: { on: false, width: "250px" },
    header: { on: true, height: "auto" },
    footer: { on: false, height: "auto" },
  },
  labelsMarkers: { on: false },
  labelsRegions: { on: false },
  svgFileVersion: 1,
  fitMarkers: false,
  fitMarkersOnStart: false,
  fitSingleMarkerZoom: 20,
  controls: {
    location: "right",
    zoom: true,
    zoomReset: false,
    userLocation: false,
    previousMap: false,
  },
  nodes: [],
  scenes: [],
  previousMapsIds: [],
}

export { DefaultOptions }
