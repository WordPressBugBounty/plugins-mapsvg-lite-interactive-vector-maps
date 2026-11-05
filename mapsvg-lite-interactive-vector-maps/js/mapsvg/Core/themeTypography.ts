import type { ThemeTypography } from './typography'

/** Measure outside MapSVG, using the same theme body/content context on frontend and probe. */
export function readThemeTypography(doc: Document): ThemeTypography {
  const win = doc.defaultView!
  const content = doc.createElement('div')
  content.className = 'entry-content'
  content.style.cssText = 'position:absolute;left:-100000px;top:0;visibility:hidden;pointer-events:none'
  content.innerHTML = '<h1>Heading</h1><h2>Heading</h2><h3>Heading</h3><p>Paragraph</p><a href="#">Link</a>'
  doc.body.append(content)
  const read = (element: Element, properties: string[]) => {
    const style = win.getComputedStyle(element)
    return Object.fromEntries(properties.map(key => [key, style[key as keyof CSSStyleDeclaration] as string]))
  }
  const text = ['fontFamily', 'fontSize', 'lineHeight']
  const result = {
    base: read(doc.body, [...text, 'color']), links: read(content.querySelector('a')!, ['color', 'textDecorationLine']),
    hover: {}, h1: {}, h2: {}, h3: {}, p: {}, fonts: '',
  } as ThemeTypography
  for (const tag of ['h1', 'h2', 'h3', 'p'] as const) result[tag] = read(content.querySelector(tag)!, [...text, 'fontWeight', 'color', ...['marginTop', 'marginBottom']])
  // CSSOM can resolve ordinary theme :hover rules without clicking/navigating a link.
  const anchor = content.querySelector('a')!
  anchor.style.transition = 'none'; anchor.style.animation = 'none'
  const fontImports = new Set<string>()
  function rules(sheet: CSSStyleSheet | null): void {
    if (!sheet) return
    let entries: CSSRuleList
    try { entries = sheet.cssRules } catch {
      if (sheet.href && /^https?:/.test(sheet.href)) fontImports.add(`@import url(${JSON.stringify(sheet.href)}) layer(mapsvg-theme-fonts);`)
      return
    }
    for (const rule of Array.from(entries)) {
      if (rule.type === 3) rules((rule as CSSImportRule).styleSheet)
      else if (rule.type === 5) result.fonts += rule.cssText.replace(/url\((['"]?)(.*?)\1\)/g, (_, _quote, url) => `url(${JSON.stringify(new URL(url, sheet.href || doc.baseURI).href)})`)
      else if (rule.type === 1) {
        const style = rule as CSSStyleRule
        for (const selector of style.selectorText.split(',')) {
          if (!selector.includes(':hover')) continue
          try {
            if (anchor.matches(selector.replace(/:hover/g, ''))) {
              if (style.style.color) { anchor.style.color = style.style.color; result.hover.color = win.getComputedStyle(anchor).color }
              if (style.style.textDecorationLine) { anchor.style.textDecorationLine = style.style.textDecorationLine; result.hover.textDecorationLine = win.getComputedStyle(anchor).textDecorationLine }
            }
          } catch { /* unsupported selectors do not block typography */ }
        }
      } else if ('cssRules' in rule) {
        if (rule.type === 4 && win.matchMedia && !win.matchMedia((rule as CSSMediaRule).conditionText).matches) continue
        if (rule.type === 12 && win.CSS?.supports && !win.CSS.supports((rule as CSSSupportsRule).conditionText)) continue
        rules({ cssRules: (rule as CSSGroupingRule).cssRules, href: sheet.href } as CSSStyleSheet)
      }
    }
  }
  for (const sheet of Array.from(doc.styleSheets)) rules(sheet)
  result.fonts = [...fontImports].join("\n") + "\n" + result.fonts
  content.remove()
  return result
}

const probes = new WeakMap<Document, Map<string, Promise<ThemeTypography>>>()
/** The backend document has wp-admin styles; measure in a dedicated frontend shell. */
export function loadThemeTypography(doc: Document, url: string): Promise<ThemeTypography> {
  let cache = probes.get(doc)
  if (!cache) { cache = new Map(); probes.set(doc, cache) }
  const width = doc.defaultView!.innerWidth, height = doc.defaultView!.innerHeight
  const viewport = `${width}:${height}`
  if (cache.has(viewport)) return cache.get(viewport)!
  const promise = new Promise<ThemeTypography>((resolve, reject) => {
    const win = doc.defaultView!
    const target = new URL(url, doc.baseURI)
    const frame = doc.createElement('iframe')
    frame.title = 'WordPress theme typography'
    frame.setAttribute('aria-hidden', 'true'); frame.tabIndex = -1
    frame.style.cssText = `position:absolute;left:-100000px;top:0;width:${width}px;height:${height}px;opacity:0;pointer-events:none;border:0`
    const finish = () => { win.clearTimeout(timer); win.removeEventListener('message', received); frame.remove() }
    const timer = win.setTimeout(() => { finish(); reject(new Error('WordPress theme typography could not be loaded. Default typography is being used.')) }, 12000)
    const received = (event: MessageEvent) => {
      if (event.source !== frame.contentWindow || event.origin !== target.origin || event.data?.type !== 'mapsvg:theme-typography') return
      const value = event.data.typography
      if (!value?.base?.fontFamily || !value?.base?.fontSize || typeof value.fonts !== 'string') return
      finish(); resolve(value)
    }
    win.addEventListener('message', received)
    frame.src = target.href; doc.body.append(frame)
  })
  cache.set(viewport, promise)
  if (cache.size > 8) cache.delete(cache.keys().next().value!)
  promise.catch(() => { if (cache?.get(viewport) === promise) cache.delete(viewport) })
  return promise
}
