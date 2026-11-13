import { dn as e, fn as t, pn as n } from "./admin-startup-D4zZmPq_.js";
//#region src/lib/svg-assets.ts
async function r(r, i) {
	let a = n();
	if (!a.svgRegistryEnabled) return r;
	let o = [], s = 0;
	do {
		let n = new URL(e(a.apiUrl, "/svg-assets"), window.location.href);
		n.searchParams.set("limit", "200"), n.searchParams.set("after", String(s));
		let r = await t(n.href, {
			signal: i,
			credentials: "same-origin",
			cache: "no-store",
			headers: {
				Accept: "application/json",
				"X-WP-Nonce": a.nonce
			}
		}), c = await r.json();
		if (!r.ok || !Array.isArray(c?.files)) throw Error(c?.message ?? "The SVG library could not be loaded.");
		for (let e of c.files) {
			if (!Number.isSafeInteger(e.assetId) || e.assetId <= 0 || !Number.isSafeInteger(e.revisionId) || e.revisionId <= 0 || typeof e.name != "string" || typeof e.pathShort != "string" || typeof e.relativeUrl != "string" || !e.relativeUrl.startsWith("/") || e.relativeUrl.startsWith("//")) throw Error("The server returned an invalid SVG resource.");
			o.push(e);
		}
		if (c.nextAfter == null) break;
		if (!Number.isSafeInteger(c.nextAfter) || c.nextAfter <= s) throw Error("The SVG catalog cursor did not advance.");
		s = c.nextAfter;
	} while (!i?.aborted);
	i?.throwIfAborted();
	let c = new Set(o.map((e) => e.originalUrl).filter(Boolean));
	return [...r.filter((e) => !e.assetId && !e.relativeUrl.includes("/svg-registry/") && !c.has(e.relativeUrl)), ...o];
}
//#endregion
export { r as t };

//# sourceMappingURL=svg-assets-BVMbZbgP.js.map