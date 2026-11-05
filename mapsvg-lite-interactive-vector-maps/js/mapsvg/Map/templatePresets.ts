/** Lite-owned built-ins, also available to paid template editors. */
export const BUILTIN_TEMPLATE_HTML = {
  "list": "<div class=\"mapsvg-details-list\">\n            {{#each objects}}\n          <div class=\"mapsvg-details-list-item\">\n                  <div class=\"mapsvg-details-list-item-image\">\n                    <img src=\"{{images.0.thumbnail}}\" />\n                  </div>\n                <div class=\"mapsvg-details-list-item-info\">    m\t      \n                    <h6>{{title}}</h6>\n                    <p class=\"mapsvg-details-address\">{{location.address.formatted}}</p>   \n              <p class=\"mapsvg-details-category\">{{category_text}}</p>                                   \n                    <p>{{description}}</p>  \n                <div class=\"mapsvg-details-link\"><a href=\"{{link}}\">{{link}}</a></div>              \n                  </div>\t            \n              </div>\n            {{/each}}\n          </div>",
  "default": "<div class=\"mapsvg-details-flex\">\n        \n        <div class=\"mapsvg-details-hero\">\n          <img src=\"{{images.0.full}}\" class=\"mapsvg-details-hero-image\"/>\n        </div>\n        <div class=\"mapsvg-details-info\">\n          <h4 class=\"mapsvg-details-header\">{{#if title}} {{title}} {{else}} {{id}} {{/if}}</h4>\n          {{description}}\n        </div>\n      </div>    \n    ",
  "post": "{{post}}",
  "title": "{{title}}",
  "description": "{{{description}}}",
  "imageTitle": "<div class=\"mapsvg-imageTitle-content\">\n  <div class=\"mapsvg-imageTitle-image\">\n    <img src=\"{{images.0.thumbnail}}\" />\n  </div>\n  <div class=\"mapsvg-imageTitle-title\">    \t      \n    {{title}}                                  \n  </div>\t            \n</div>",
  "address": "{{#if location.address.formatted}}\n        {{location.address.formatted}}\n      {{else}}\n        {{#if location.geoPoint.lat}}\n          {{location.geoPoint.lat}}, {{location.geoPoint.lng}}\n        {{/if}}\n      {{/if}}"
} as const
export const BUILTIN_TEMPLATE_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "title", label: "Title" },
  { value: "description", label: "Description (HTML)" },
  { value: "imageTitle", label: "Image and title" },
  { value: "address", label: "Address" },
  { value: "post", label: "WordPress post" },
  { value: "list", label: "List" }
]
