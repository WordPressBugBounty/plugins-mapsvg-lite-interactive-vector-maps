/** WordPress-owned first bootstrap UI; independent of Vite and React chunks. */
export function startEditorStartup(host) {
  const doc = host.ownerDocument;
  const view = doc.defaultView;
  const selector = '[data-mapsvg-admin-startup]';
  const panel = host.shadowRoot?.querySelector(selector) ?? host.querySelector(selector) ?? doc.createElement('section');
  panel.setAttribute('data-mapsvg-admin-startup', '');
  panel.setAttribute('role', 'status');
  panel.style.cssText = 'position:absolute;inset:0;z-index:100;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:32px;box-sizing:border-box;font:15px/1.6 system-ui;color:#222;background:#fff;text-align:center';
  let logo = panel.querySelector('img');
  if (!logo) {
    logo = doc.createElement('img');
    logo.src = new URL('../img/mapsvg-loader.svg', import.meta.url).href;
    logo.width = 56; logo.height = 56; logo.alt = '';
    logo.setAttribute('aria-hidden', 'true');
    panel.appendChild(logo);
  }
  let message = panel.querySelector('p');
  if (!message) {
    message = doc.createElement('p');
    message.textContent = 'Loading MapSVG editor…';
    panel.appendChild(message);
  }
  message.style.cssText = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0';
  (host.shadowRoot ?? host).appendChild(panel);

  let finished = false;
  const clear = () => { view.clearInterval(poll); view.clearTimeout(timeout); observer.disconnect(); };
  const check = () => {
    if (finished) return true;
    const shadow = host.shadowRoot;
    if (shadow?.querySelector('#mapsvg-admin-react-app')?.childElementCount) {
      finished = true; clear(); panel.remove(); return true;
    }
    if (shadow) {
      observer.observe(shadow, { childList: true, subtree: true });
      if (panel.parentNode !== shadow) shadow.appendChild(panel);
    }
    return false;
  };
  const fail = (reason = 'MapSVG editor could not start. Reload the editor and try again.') => {
    if (check()) return;
    view.clearTimeout(timeout);
    logo.hidden = true;
    message.style.cssText = 'margin:0;max-width:600px';
    message.textContent = reason;
    panel.setAttribute('role', 'alert');
    if (!panel.querySelector('button')) {
      const retry = doc.createElement('button');
      retry.type = 'button';
      retry.textContent = 'Reload editor';
      retry.style.cssText = 'padding:6px 12px;cursor:pointer';
      retry.addEventListener('click', () => view.location.reload());
      panel.appendChild(retry);
    }
    // Retain recovery detection: an import can reject before a late mount succeeds.
    (host.shadowRoot ?? host).appendChild(panel);
  };
  const observer = new view.MutationObserver(check);
  observer.observe(host, { childList: true });
  const poll = view.setInterval(check, 250);
  const timeout = view.setTimeout(fail, 20000);
  check();
  return { fail, stop: () => { finished = true; clear(); panel.remove(); } };
}

export function startViteEditor(host, viteUrl, loadModule = (url) => import(url)) {
  const startup = startEditorStartup(host);
  Promise.resolve().then(() => loadModule(viteUrl.replace(/\/$/, '') + '/src/dev.ts'))
    .catch((error) => {
      startup.fail('MapSVG editor could not start. The development server may be unavailable or its modules failed to load.');
      console.error('[mapsvg-admin-react] Vite startup failed', error);
    });
  return startup.stop;
}

const host = typeof document === 'undefined' ? null : document.getElementById('mapsvg-admin-react-root');
if (host) {
  if (window.mapsvgReactAdminVite?.url) startViteEditor(host, window.mapsvgReactAdminVite.url);
  else startEditorStartup(host);
}
