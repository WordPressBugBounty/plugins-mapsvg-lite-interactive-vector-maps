/** App-owned template presets. IDs and legacy option keys are stable. */
export type GalleryOptions = {
  id: string | number
  title?: string
  type?: "original" | "multi" | "justified" | "single" | "combo" | "slider"
  background?: string
  thumb_width?: string | number
  thumb_height?: string | number
  thumb_margin?: string | number
  max_height?: string | number
  lightbox?: boolean | number | string
  lb_button_show?: boolean | number | string
  lb_button_text?: string
  [key: string]: unknown
}

export const GALLERY_DEFAULTS = {
  title: "",
  type: "multi",
  background: "",
  thumb_width: 50,
  thumb_height: 50,
  thumb_margin: 3,
  max_height: 250,
  lightbox: true,
  lb_button_show: false,
  lb_button_text: "View all ({{counter}})",
} as const

export function readGalleries(value: unknown): GalleryOptions[] {
  return Array.isArray(value)
    ? Array.from(value).filter(
        (item): item is GalleryOptions =>
          item !== null &&
          typeof item === "object" &&
          !Array.isArray(item) &&
          (typeof item.id === "string" || typeof item.id === "number"),
      )
    : []
}

export function galleryTitle(gallery: GalleryOptions): string {
  return typeof gallery.title === "string" && gallery.title.trim()
    ? gallery.title.trim()
    : `Gallery ${gallery.id}`
}

export function newGallery(galleries: GalleryOptions[]): GalleryOptions {
  // Never reuse deleted numeric IDs: an old template must not start showing a new gallery.
  const id = crypto.randomUUID()
  let number = 1
  const titles = new Set(galleries.map(galleryTitle))
  while (titles.has(`Gallery ${number}`)) number++
  return { ...GALLERY_DEFAULTS, id, title: `Gallery ${number}` }
}

export function galleryBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === "1" || value === "true"
}

/** A field path is evaluated by Handlebars in the calling record's context. */
export function validGalleryFieldPath(path: string): boolean {
  return (
    /^(?:[A-Za-z_$][\w$]*)(?:\.(?:[A-Za-z_$][\w$]*|\d+))*$/.test(path) &&
    !path.split(".").some((part) => ["__proto__", "prototype", "constructor"].includes(part))
  )
}

export function galleryTemplateTag(
  mapId: number,
  galleryId: string | number,
  fieldPath: string,
): string {
  if (!validGalleryFieldPath(fieldPath))
    throw new Error("Choose an image field or enter a valid field path.")
  return `{{mapsvg_gallery ${JSON.stringify(`${mapId}.${galleryId}`)} ${fieldPath}}}`
}
