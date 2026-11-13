import { dn as e, fn as t, pn as n } from "./admin-startup-D4zZmPq_.js";
import { n as r, t as i } from "./admin-frame-DxRvvShf.js";
//#region src/lib/preview-frame.ts
async function a(e, t) {
	let r = n().previewScripts;
	if (!r?.length || !window.mapsvgFrontendParams) throw Error("Preview runtime configuration is unavailable. Reload the editor.");
	let a = window.setTimeout(() => l(/* @__PURE__ */ Error("The preview runtime took too long to load.")), 3e4), o, s = [], c;
	function l(e) {
		c = e, o?.(e);
	}
	let u = () => l(t.reason ?? new DOMException("Preview closed", "AbortError"));
	t.addEventListener("abort", u, { once: !0 });
	function d(e) {
		return t.aborted && u(), c ? Promise.reject(c) : new Promise((t, n) => {
			o = n, e(t, n);
		});
	}
	try {
		await d((t) => {
			i(e), t();
		});
		let t = e.contentWindow, n = e.contentDocument;
		if (!t || !n) throw Error("The preview frame is unavailable.");
		n.documentElement.style.height = "auto", n.body.style.cssText = "margin:0;min-height:100vh;height:auto;display:flex;flex-direction:column;padding:16px;box-sizing:border-box;background:#fff", t.mapsvgFrontendParams = JSON.parse(JSON.stringify(window.mapsvgFrontendParams)), Object.defineProperty(t, "mapsvgReactAdminParams", {
			configurable: !0,
			get: () => window.mapsvgReactAdminParams
		});
		let a = (e) => {
			let t = n.createElement("script");
			t.textContent = e, n.head.append(t);
		};
		for (let e of r) {
			for (let t of e.before) a(t);
			await d((t, r) => {
				let i = n.createElement("script");
				i.src = e.src, i.type = e.type, i.onload = () => t(), i.onerror = () => r(/* @__PURE__ */ Error(`Could not load preview asset: ${e.src}`)), n.head.append(i);
			});
			for (let t of e.after) a(t);
		}
		if (t.mapsvg?.map || await d((e) => {
			let n = () => e();
			t.addEventListener("mapsvgClientInitialized", n, { once: !0 }), s.push(() => t.removeEventListener("mapsvgClientInitialized", n));
		}), !t.mapsvg?.map) throw Error("The preview runtime did not initialize.");
		return t.mapsvg;
	} finally {
		window.clearTimeout(a), t.removeEventListener("abort", u);
		for (let e of s) e();
	}
}
//#endregion
//#region src/components/form-builder/location-field/adapter.ts
async function o(e, t) {
	let n = window.google;
	if (!n?.maps?.Geocoder) return null;
	let r = new n.maps.Geocoder();
	return await new Promise((n, i) => {
		r.geocode({
			address: e,
			...t ? { language: t } : {}
		}, (e, t) => {
			if (t === "OK") {
				n(Array.isArray(e) ? e : []);
				return;
			}
			if (t === "ZERO_RESULTS") {
				n([]);
				return;
			}
			i(/* @__PURE__ */ Error(`Google geocoding failed: ${t}`));
		});
	});
}
async function s(t, r) {
	let i = n(), a = e(i.apiUrl, "/geocoding"), o = new URLSearchParams({
		address: t,
		...r ? { language: r } : {}
	}), s = await fetch(a + (a.includes("?") ? "&" : "?") + o.toString(), {
		credentials: "same-origin",
		headers: {
			Accept: "application/json",
			"X-WP-Nonce": i.nonce
		}
	});
	if (!s.ok) throw Error(`MapSVG geocoding failed: ${s.status}`);
	let c = await s.json();
	if (c.error_message) throw Error(c.error_message);
	return Array.isArray(c.results) ? c.results : [];
}
async function c(e, t) {
	let n = await o(e, t);
	return n === null ? await s(e, t) : n;
}
async function l(e, t) {
	try {
		await r();
		let n = await o(e, t);
		if (n !== null) return n;
	} catch {}
	return await s(e, t);
}
async function u(r) {
	let i = n(), a = e(i.apiUrl, "/markers"), o = new FormData();
	o.append("file", r);
	let s = await t(a, {
		method: "POST",
		credentials: "same-origin",
		headers: { "X-WP-Nonce": i.nonce },
		body: o
	});
	if (!s.ok) throw Error(`Marker upload failed: ${s.status}`);
	let c = await s.json();
	if (c.error || !c.marker) throw Error(c.error || "Marker upload returned no marker.");
	let l = window.mapsvgReactAdminParams;
	if (l) {
		let e = l.markerImages ??= [];
		e.some((e) => e.relativeUrl === c.marker.relativeUrl) || e.push({
			name: r.name,
			relativeUrl: c.marker.relativeUrl,
			pathShort: c.marker.relativeUrl
		});
	}
	return c.marker;
}
function d(e, t) {
	(t.img || t.imagePath || t.markerImagePath) && e.setImage?.(t.img || t.markerImagePath || t.imagePath), t.address && e.setAddress?.(t.address), t.geoPoint && e.setGeoPoint?.(t.geoPoint), t.svgPoint && e.setSvgPoint?.(t.svgPoint);
}
function f(e = {}) {
	let t = [...e.markerImages ?? []];
	return {
		isGeo: !0,
		markerDefaults: e.markerDefaults,
		picker: e.picker,
		hasMapInteraction: !!e.picker,
		search: l,
		markerImages: () => [...t],
		async uploadMarker(e) {
			let n = await u(e);
			return t.push(n), n;
		},
		async getMarkerFields() {
			return [];
		},
		async getMarkerFieldOptions() {
			return [];
		},
		bind() {
			return () => void 0;
		},
		sync() {}
	};
}
function p(e, t = {}) {
	let n = [...t.markerImages ?? []], r, i, a, o, s = () => {
		a?.events && o && a.events.off("change", o), a = void 0, o = void 0;
	}, l = (e) => {
		if (s(), !e?.events || !e.location) return;
		a = e;
		let t = i;
		o = () => {
			!t || i !== t || e.isMoving?.() || r?.(e.location?.getData?.() ?? null);
		}, e.events.on("change", o);
	}, f = (n) => {
		e.setMarkerEditHandler?.((a) => {
			if (i !== n) return;
			let o = a?.marker;
			o && (e.setEditingMarker?.(o), t.markerDefaults?.image && a.setImage?.(t.markerDefaults.image), o.setImage?.(), l(o)), r?.(a?.getData?.() ?? null);
		});
		let a = e.getEditingMarker?.();
		a && l(a);
	};
	return {
		isGeo: !!e.isGeo?.(),
		markerDefaults: t.markerDefaults,
		hasMapInteraction: !0,
		search: c,
		markerImages: () => [...n],
		async uploadMarker(e) {
			let t = await u(e);
			return n.push(t), t;
		},
		setDefaultMarkerPath(t) {
			e.setDefaultMarkerImage?.(t);
		},
		async getMarkerFields() {
			return [...t.filterableFields ?? []];
		},
		async getMarkerFieldOptions(t) {
			if (!t || !e.objectsRepository?.getOptionsByField) return [];
			let n = t.startsWith("Object.") ? t.slice(7) : t, r = await Promise.resolve(e.objectsRepository.getOptionsByField(n));
			return Array.isArray(r) ? r.map((e) => ({
				label: String(e.label ?? e.value ?? ""),
				value: e.value
			})) : [];
		},
		bind(t) {
			let n = {};
			return i = n, r = t, f(n), () => {
				i === n && (i = void 0, r = void 0, s(), e.setMarkerEditHandler?.(null), e.unsetEditingMarker?.());
			};
		},
		sync(n) {
			let r = e.getEditingMarker?.();
			if (!n) {
				r && e.markerDelete?.(r), e.unsetEditingMarker?.(), s();
				return;
			}
			if (r?.location) {
				d(r.location, n), r.setImage?.(), l(r);
				return;
			}
			let i = t.runtimeClient ?? window.mapsvg;
			if (!i?.location || !i?.marker) return;
			let a = new i.location(n), o = new i.marker({
				location: a,
				mapsvg: e
			});
			e.setEditingMarker?.(o), l(o);
		}
	};
}
//#endregion
//#region src/components/form-builder/location-field/value.ts
function m(e) {
	if (typeof e == "function") return Number(e());
	if (typeof e == "number") return Number(e);
}
function h(e) {
	return e && typeof e == "object" ? { ...e } : null;
}
function g(e) {
	let t = h(e);
	if (!t) return "";
	let n = t.address, r = n && (n.formatted || n.address_formatted || n.formatted_address);
	return typeof r == "string" && r ? r : t.geoPoint ? `${t.geoPoint.lat},${t.geoPoint.lng}` : t.svgPoint ? `${t.svgPoint.x},${t.svgPoint.y}` : "";
}
function _(e, t) {
	let n = m(e.geometry?.location?.lat), r = m(e.geometry?.location?.lng);
	if (n == null || r == null || Number.isNaN(n) || Number.isNaN(r)) return null;
	let i = { formatted: e.formatted_address };
	return (e.address_components ?? []).forEach((e) => {
		let t = e.types?.[0];
		t && (i[t] = e.long_name, e.short_name && e.short_name !== e.long_name && (i[`${t}_short`] = e.short_name));
	}), {
		address: i,
		geoPoint: {
			lat: n,
			lng: r
		},
		img: t,
		imagePath: t,
		markerImagePath: t
	};
}
function v(e, t) {
	let n = e.trim().match(/^([-+]?(?:\d+(?:\.\d+)?)),\s*([-+]?(?:\d+(?:\.\d+)?))$/);
	if (!n) return null;
	let r = Number(n[1]), i = Number(n[2]);
	return Number.isNaN(r) || Number.isNaN(i) || r < -90 || r > 90 || i < -180 || i > 180 ? null : {
		address: { formatted: `${r},${i}` },
		geoPoint: {
			lat: r,
			lng: i
		},
		img: t,
		imagePath: t,
		markerImagePath: t
	};
}
function y(e, t) {
	let n = h(e);
	return n ? {
		...n,
		img: t,
		imagePath: t,
		markerImagePath: t
	} : null;
}
function b(e, t = "") {
	let n = h(e), r = n?.markerImagePath || n?.imagePath || n?.img;
	return typeof r == "string" && r ? r : t;
}
function x(e) {
	return e.relativeUrl || e.url || "";
}
//#endregion
export { x as a, p as c, a as d, h as i, f as l, v as n, b as o, _ as r, y as s, g as t, u };

//# sourceMappingURL=value-34BVfJA4.js.map