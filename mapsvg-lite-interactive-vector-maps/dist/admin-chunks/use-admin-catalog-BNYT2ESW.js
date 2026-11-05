import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Pr as t, bi as n, dn as r, fn as i, pn as a } from "./admin-startup-DaxvU-L8.js";
var o = t("image", [
	["rect", {
		width: "18",
		height: "18",
		x: "3",
		y: "3",
		rx: "2",
		ry: "2",
		key: "1m3agn"
	}],
	["circle", {
		cx: "9",
		cy: "9",
		r: "2",
		key: "af1f0g"
	}],
	["path", {
		d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21",
		key: "1xmnt7"
	}]
]), s = /* @__PURE__ */ e(n(), 1), c = /* @__PURE__ */ new Map(), l = /* @__PURE__ */ new Map();
function u(e) {
	let t = a();
	return e === "svg" ? t.svgFiles : e === "image" ? t.imageFiles ?? [] : t.markerImages;
}
function d(e, t) {
	let n = (e) => "assetId" in e && e.assetId ? `asset:${e.assetId}` : e.relativeUrl, r = new Set([...e, ...t].flatMap((e) => "assetId" in e && e.assetId && "originalUrl" in e && e.originalUrl ? [e.originalUrl] : [])), i = (e) => "assetId" in e && e.assetId || !r.has(e.relativeUrl), a = new Map(e.filter(i).map((e) => [n(e), e]));
	for (let e of t) {
		if (!i(e)) continue;
		let t = a.get(n(e));
		(!t || "revisionId" in e && (e.revisionId ?? 0) > (t.revisionId ?? 0)) && a.set(n(e), e);
	}
	return [...a.values()];
}
function f(e) {
	let t = a();
	if (!t.deferredCatalogs) return Promise.resolve(u(e));
	let n = JSON.stringify([
		t.apiUrl,
		t.user.id,
		e
	]), o = c.get(n);
	if (o) return o;
	if (e === "markers" && l.has(n)) return Promise.resolve(d(l.get(n), u(e)));
	let s = new URL(r(t.apiUrl, "/admin-catalogs"), window.location.href);
	s.searchParams.set("kind", e);
	let f = new AbortController(), p = window.setTimeout(() => f.abort(), 15e3), m = i(s.href, {
		signal: f.signal,
		credentials: "same-origin",
		cache: "no-store",
		headers: {
			Accept: "application/json",
			"X-WP-Nonce": t.nonce
		}
	}).then(async (t) => {
		let r = await t.json();
		if (!t.ok || !Array.isArray(r?.files)) throw Error(r?.message ?? "The file library could not be loaded.");
		if (r.files.some((e) => !e || typeof e != "object" || [
			"name",
			"relativeUrl",
			"pathShort"
		].some((t) => typeof e[t] != "string"))) throw Error("The server returned an invalid file library.");
		let i = d(r.files, u(e));
		return e === "markers" && l.set(n, i), i;
	}).catch((e) => {
		throw f.signal.aborted ? Error("The file library took too long to load. Please retry.") : e;
	}).finally(() => {
		window.clearTimeout(p), c.get(n) === m && c.delete(n);
	});
	return c.set(n, m), m;
}
//#endregion
//#region src/lib/use-admin-catalog.ts
function p(e, t, n) {
	let [r, i] = (0, s.useState)([]), [a, o] = (0, s.useState)(!1), [c, l] = (0, s.useState)(!1), [u, p] = (0, s.useState)(null), [m, h] = (0, s.useState)(0);
	return (0, s.useEffect)(() => {
		if (!t) {
			o(!1), l(!1);
			return;
		}
		let n = !1;
		return o(!0), p(null), f(e).then((e) => {
			n || i(e);
		}).catch((e) => {
			n || p(e instanceof Error ? e.message : "The file library could not be loaded.");
		}).finally(() => {
			n || (o(!1), l(!0));
		}), () => {
			n = !0;
		};
	}, [
		e,
		t,
		m
	]), {
		files: (0, s.useMemo)(() => d(r, n), [r, n]),
		loading: t && (!c || a),
		error: u,
		retry: () => {
			o(!0), h((e) => e + 1);
		}
	};
}
//#endregion
export { f as n, o as r, p as t };

//# sourceMappingURL=use-admin-catalog-BNYT2ESW.js.map