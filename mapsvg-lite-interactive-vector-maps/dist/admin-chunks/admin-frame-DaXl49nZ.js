import { pn as e } from "./admin-startup-DaxvU-L8.js";
//#region src/lib/google-maps-loader.ts
function t() {
	let t = e().options;
	if (!t || typeof t != "object") return "";
	let n = t.google_api_key;
	return typeof n == "string" ? n.trim() : "";
}
function n(e = window, n) {
	if (n?.aborted) return Promise.reject(n.reason);
	if (e.google?.maps?.Geocoder) return Promise.resolve();
	if (e.mapsvgReactGoogleMapsPromise) return e.mapsvgReactGoogleMapsPromise;
	let r = t();
	if (!r) return Promise.reject(/* @__PURE__ */ Error("Google Maps API key is not configured. Add it in Settings → General."));
	let i = e.document, a = Array.from(i.scripts).find((e) => e.src.includes("maps.googleapis.com/maps/api/js")), o = a ?? i.createElement("script"), s = e.gm_authFailure, c = e.mapsvgReactGoogleMapsReady;
	return e.mapsvgReactGoogleMapsPromise = new Promise((t, l) => {
		let u = !1, d, f, p = () => {
			d && clearInterval(d), f && clearTimeout(f), n?.removeEventListener("abort", g), o.removeEventListener("load", h), o.removeEventListener("error", _), e.gm_authFailure === v && (e.gm_authFailure = s), e.mapsvgReactGoogleMapsReady === h && (e.mapsvgReactGoogleMapsReady = c);
		}, m = (e) => {
			u || (u = !0, p(), e ? (a || o.remove(), l(e)) : t());
		}, h = () => {
			e.google?.maps?.Geocoder && m();
		}, g = () => m(n?.reason ?? new DOMException("Google Maps closed.", "AbortError")), _ = () => m(/* @__PURE__ */ Error("Google Maps API failed to load.")), v = () => {
			m(/* @__PURE__ */ Error("Google Maps API key is incorrect or is not authorized for this site.")), s?.();
		};
		e.gm_authFailure = v, e.mapsvgReactGoogleMapsReady = h, n?.addEventListener("abort", g, { once: !0 }), a && o.addEventListener("load", h), o.addEventListener("error", _), a && (d = setInterval(h, 50)), f = setTimeout(() => m(/* @__PURE__ */ Error("Google Maps API took too long to load. Please try again.")), 3e4), a || (o.async = !0, o.defer = !0, o.dataset.mapsvgReactGoogleMaps = "1", o.src = "https://maps.googleapis.com/maps/api/js?loading=async&callback=mapsvgReactGoogleMapsReady&key=" + encodeURIComponent(r), i.head.appendChild(o)), a && h();
	}).catch((t) => {
		throw e.mapsvgReactGoogleMapsPromise = void 0, t;
	}), e.mapsvgReactGoogleMapsPromise;
}
//#endregion
//#region src/lib/admin-frame.html?raw
var r = "<!doctype html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n  <title>MapSVG preview</title>\n  <style>\n    html, body { width: 100%; height: 100%; margin: 0; background: #fff; }\n    *, *::before, *::after { box-sizing: border-box; }\n  </style>\n</head>\n<body></body>\n</html>\n";
//#endregion
//#region src/lib/admin-frame.ts
function i() {
	let { pluginUrl: t, version: n } = e();
	if (!t) throw Error("The preview frame URL is unavailable. Reload the editor.");
	let r = new URL(t.replace(/\/?$/, "/"), document.baseURI);
	if (r.origin !== window.location.origin || !["http:", "https:"].includes(r.protocol)) throw Error("The preview frame must use this site's origin.");
	let i = new URL("js/mapsvg-admin-frame.html", r);
	return n && i.searchParams.set("v", n), i.href;
}
function a(e) {
	let t = i(), n = e.contentDocument, a = e.contentWindow;
	if (!n || !a) throw Error("The preview frame is unavailable.");
	if (e.removeAttribute("srcdoc"), n.open(), n.write(r), n.close(), a.history.replaceState(null, "", t), n.URL !== t) throw Error("The preview frame URL could not initialize.");
}
//#endregion
export { n, a as t };

//# sourceMappingURL=admin-frame-DaXl49nZ.js.map