/** App-owned typography. Theme measurements are runtime state, never saved options. */
export type TypographyOptions = {
  mode: 'default' | 'theme' | 'custom'
  base: { fontFamily: string; size: number; lineHeight: number }
  links: { color: string; hoverColor: string; underline: boolean }
  h1: HeadingTypography; h2: HeadingTypography; h3: HeadingTypography
  p: { size: number; lineHeight: number; spacing: number }
}
type HeadingTypography = { size: number; weight: number; lineHeight: number; color: string }
export type ThemeTypography = {
  base: Record<string, string>; links: Record<string, string>; hover: Record<string, string>
  h1: Record<string, string>; h2: Record<string, string>; h3: Record<string, string>; p: Record<string, string>
  fonts: string
}
export const DEFAULT_TYPOGRAPHY: TypographyOptions = {
  mode: 'default', base: { fontFamily: 'Helvetica, Arial, sans-serif', size: 14, lineHeight: 150 },
  links: { color: '#2271b1', hoverColor: '#135e96', underline: true },
  h1: { size: 28, weight: 600, lineHeight: 125, color: '' },
  h2: { size: 24, weight: 600, lineHeight: 125, color: '' },
  h3: { size: 20, weight: 600, lineHeight: 125, color: '' },
  p: { size: 14, lineHeight: 150, spacing: 14 },
}
export function normalizeTypography(value?: Partial<TypographyOptions>): TypographyOptions {
  const fallback = DEFAULT_TYPOGRAPHY
  const options = value?.mode === 'custom' ? value : fallback
  const result = { ...fallback, ...options } as TypographyOptions
  for (const key of ['base', 'links', 'h1', 'h2', 'h3', 'p'] as const) result[key] = { ...fallback[key], ...options[key] } as never
  return result
}
function positive(value: number, fallback: number): number { return Number.isFinite(Number(value)) && Number(value) > 0 ? Number(value) : fallback }
// Styles are inserted via textContent. Reject CSS rule/declaration injection in saved text values.
function cssValue(value: string, fallback: string): string { return typeof value === 'string' && value.trim() && !/[;{}<>\\]/.test(value) ? value.trim() : fallback }
export function typographyCss(token: string, value?: Partial<TypographyOptions>, theme?: ThemeTypography): string {
  const options = normalizeTypography(value)
  const root = `[data-mapsvg-typography="${token.replace(/[^a-zA-Z0-9-]/g, '')}"]`
  const measured = value?.mode === 'theme' ? theme : undefined
  const base: Record<string, string> = measured?.base ?? {
    fontFamily: cssValue(options.base.fontFamily, DEFAULT_TYPOGRAPHY.base.fontFamily),
    fontSize: `${positive(options.base.size, 14)}px`, lineHeight: String(positive(options.base.lineHeight, 150) / 100),
  }
  const declarations = (styles: Record<string, string>) => Object.entries(styles).map(([key, value]) => `${key.replace(/[A-Z]/g, m => '-' + m.toLowerCase())}:${cssValue(value, 'inherit')}`).join(';')
  const family = cssValue(base.fontFamily, DEFAULT_TYPOGRAPHY.base.fontFamily)
  let css = `${root}{--mapsvg-font-family:${family};--mapsvg-font-size:${cssValue(base.fontSize, '14px')};--mapsvg-line-height:${cssValue(base.lineHeight, '1.5')}}`
  css += `:where(${root}){font-family:var(--mapsvg-font-family);font-size:var(--mapsvg-font-size);line-height:var(--mapsvg-line-height);color:${cssValue(base.color || 'var(--mapsvg-text-primary, #333)', '#333')}}`
  css += `:where(${root}) :where(button,input,select,textarea){font-size:var(--mapsvg-font-size)}`
  const links = measured?.links ?? { color: options.links.color, textDecorationLine: options.links.underline ? 'underline' : 'none' }
  const hover = measured?.hover ?? { color: options.links.hoverColor }
  css += `:where(${root}) :where(a){${declarations(links)}}:where(${root}) :where(a:hover){${declarations(hover)}}`
  for (const tag of ['h1', 'h2', 'h3'] as const) {
    const settings = options[tag]
    const heading = measured?.[tag] ?? { fontFamily: 'var(--mapsvg-font-family)', fontSize: `${positive(settings.size, DEFAULT_TYPOGRAPHY[tag].size)}px`, fontWeight: String(positive(settings.weight, 600)), lineHeight: String(positive(settings.lineHeight, 125) / 100), color: settings.color || 'inherit' }
    css += `:where(${root}) :where(${tag}){${declarations(heading)}}`
  }
  const p = measured?.p ?? { fontFamily: 'var(--mapsvg-font-family)', fontSize: `${positive(options.p.size, 14)}px`, lineHeight: String(positive(options.p.lineHeight, 150) / 100), marginTop: '0px', marginBottom: `${Math.max(0, Number(options.p.spacing) || 0)}px` }
  return css + `:where(${root}) :where(p){${declarations(p)}}`
}
