/** Carry the existing signed draft context from the preview page into subsequent data reads. */
export function withDraftPreview(url: string, search: string, mapId: number): string {
  const source = new URLSearchParams(search)
  if (mapId <= 0 || Number(source.get("mapsvg_preview_app")) !== mapId) return url
  const target = new URL(url, window.location.href)
  for (const key of ["mapsvg_preview_app", "mapsvg_preview_draft", "mapsvg_preview_nonce"]) {
    const value = source.get(key)
    if (value) target.searchParams.set(key, value)
  }
  return target.toString()
}
