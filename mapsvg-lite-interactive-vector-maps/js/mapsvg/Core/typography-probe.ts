import { readThemeTypography } from './themeTypography'
async function send() {
  // Theme styles and web-font declarations are available after the document loads.
  const typography = readThemeTypography(document)
  window.parent.postMessage({ type: 'mapsvg:theme-typography', typography }, window.location.origin)
}
if (document.readyState === 'complete') void send()
else window.addEventListener('load', () => void send(), { once: true })
