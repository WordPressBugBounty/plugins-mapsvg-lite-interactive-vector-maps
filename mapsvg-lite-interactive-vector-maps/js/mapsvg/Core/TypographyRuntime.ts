import { DEFAULT_TYPOGRAPHY, typographyCss, type ThemeTypography, type TypographyOptions } from './typography'
import { loadThemeTypography, readThemeTypography } from './themeTypography'
let nextToken = 0

/** Per-App styles, shared with detached controllers; measurements never enter getData(). */
export class TypographyRuntime {
  private token = `app-${++nextToken}`
  private roots = new Map<Document | ShadowRoot, HTMLStyleElement>()
  private generation = 0
  private options?: Partial<TypographyOptions>
  private theme?: ThemeTypography
  private disposed = false
  status = ''
  constructor(private notify: () => void = () => {}) {}
  mount(element: HTMLElement, root: Document | ShadowRoot): void {
    element.dataset.mapsvgTypography = this.token
    if (!this.roots.has(root)) {
      const style = element.ownerDocument.createElement('style')
      style.dataset.mapsvgTypographyStyle = this.token
      ;(root instanceof element.ownerDocument.defaultView!.Document ? (root as Document).head : root).appendChild(style)
      this.roots.set(root, style)
    }
    this.render()
  }
  private render(): void {
    for (const [root, style] of this.roots) {
      if ('host' in root && !root.host.isConnected) { style.remove(); this.roots.delete(root); continue }
      style.textContent = typographyCss(this.token, this.options, this.theme)
    }
  }
  async update(options: Partial<TypographyOptions> | undefined, doc: Document, backend: boolean, probeUrl?: string): Promise<void> {
    const generation = ++this.generation
    this.options = options; this.status = ''; this.render()
    if (options?.mode !== 'theme' && !(backend && options?.mode === 'custom')) { this.notify(); return }
    this.status = options?.mode === 'theme' ? 'Loading WordPress theme typography…' : ''; this.notify()
    try {
      const theme = backend
        ? await loadThemeTypography(doc, probeUrl ?? '')
        : readThemeTypography(doc)
      if (this.disposed || generation !== this.generation) return
      this.theme = theme
      if (backend && theme.fonts) {
        let fonts = doc.head.querySelector<HTMLStyleElement>('style[data-mapsvg-theme-fonts]')
        if (!fonts) { fonts = doc.createElement('style'); fonts.dataset.mapsvgThemeFonts = ''; doc.head.append(fonts) }
        fonts.textContent = theme.fonts
      }
      this.status = ''; this.render(); this.notify()
    } catch (error) {
      if (this.disposed || generation !== this.generation) return
      this.theme = undefined
      this.status = error instanceof Error ? error.message : 'WordPress theme typography is unavailable. Using Default.'
      this.render(); this.notify()
    }
  }
  destroy(): void { this.disposed = true; this.generation++; for (const style of this.roots.values()) style.remove(); this.roots.clear() }
}
export { DEFAULT_TYPOGRAPHY }
