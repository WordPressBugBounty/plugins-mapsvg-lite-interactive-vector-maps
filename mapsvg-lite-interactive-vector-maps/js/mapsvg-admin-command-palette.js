/* Native WordPress Command Palette, loaded only on its first keyboard shortcut. */
(function () {
  "use strict";
  var flight = null;
  var ready = false;
  var notice = null;

  function status(message, retry) {
    if (!notice) {
      notice = document.createElement("div");
      notice.setAttribute("role", "status");
      notice.style.cssText = "position:fixed;top:16px;right:16px;z-index:2147483647;background:#fff;color:#1e1e1e;border:1px solid #ccc;border-radius:6px;padding:12px 16px;font:13px sans-serif;box-shadow:0 2px 8px #0002";
      document.body.appendChild(notice);
    }
    notice.replaceChildren(document.createTextNode(message));
    if (retry) {
      var button = document.createElement("button");
      button.textContent = "Retry";
      button.style.marginLeft = "12px";
      button.onclick = open;
      notice.appendChild(button);
    }
  }

  function append(original) {
    if (original.id && document.getElementById(original.id)) return Promise.resolve();
    var node = document.createElement(original.tagName.toLowerCase());
    Array.from(original.attributes).forEach(function (attribute) { node.setAttribute(attribute.name, attribute.value); });
    // Browsers hide a nonce's attribute value when reading it; the property retains it.
    if (original.nonce) node.nonce = original.nonce;
    node.textContent = original.textContent;
    var external = node.tagName === "SCRIPT" && node.src || node.tagName === "LINK" && node.rel === "stylesheet";
    return new Promise(function (resolve, reject) {
      var timer;
      if (external) {
        node.onload = function () { clearTimeout(timer); resolve(); };
        node.onerror = function () { clearTimeout(timer); node.remove(); reject(new Error("WordPress commands could not be loaded.")); };
        timer = setTimeout(function () { node.remove(); reject(new Error("WordPress commands took too long to load.")); }, 30000);
      }
      document.head.appendChild(node);
      if (!external) resolve();
    });
  }

  function load() {
    if (flight) return flight;
    var template = document.createElement("template");
    template.innerHTML = (window.mapsvgDeferredCommandPalette || {}).html || "";
    flight = Array.from(template.content.querySelectorAll("script,link[rel=stylesheet],style")).reduce(function (chain, node) {
      return chain.then(function () { return append(node); });
    }, Promise.resolve()).then(function () {
      if (!window.wp || !wp.commands || !wp.data) throw new Error("WordPress commands are unavailable.");
      ready = true;
      document.removeEventListener("keydown", shortcut);
    }).catch(function (error) { flight = null; throw error; });
    return flight;
  }

  function open() {
    status("Loading WordPress commands…", false);
    return load().then(function () {
      if (notice) { notice.remove(); notice = null; }
      wp.data.dispatch(wp.commands.store).open();
    }).catch(function () { status("WordPress commands could not be loaded.", true); });
  }

  function shortcut(event) {
    var platform = window.navigator.platform;
    var apple = platform.indexOf("Mac") !== -1 || platform === "iPad" || platform === "iPhone";
    var primary = apple ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
    if (ready || event.defaultPrevented || event.isComposing || event.keyCode === 229 || !primary || event.altKey || event.shiftKey || event.key.toLowerCase() !== "k") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    open();
  }
  // Inner editors may consume this chord before the native global handler sees it.
  document.addEventListener("keydown", shortcut);
})();
