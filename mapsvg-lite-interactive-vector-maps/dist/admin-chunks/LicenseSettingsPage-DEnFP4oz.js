import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Fr as t, bi as n, fn as r, hi as i, kt as a, pn as o } from "./admin-startup-CJQ1Yfhw.js";
import { n as s } from "./SettingsControlField-Cc88mmng.js";
import { t as c } from "./external-link-Cet6QFcd.js";
import { n as l, t as u } from "./alert-C9SMy_tl.js";
import { a as d, n as f, o as p, r as m, t as h } from "./card-CWcyual_.js";
//#region src/lib/global-settings-api.ts
var g = /* @__PURE__ */ e(n(), 1), _ = "mapsvg:license-changed";
function v(e, t) {
	let n = window.mapsvgReactAdminParams;
	if (!n) return;
	let r = n.options;
	n.options = {
		...r && typeof r == "object" && !Array.isArray(r) ? r : {},
		purchase_code: e
	}, n.license = {
		hasCode: !!e,
		maskedKey: w(e),
		currentDomain: n.license?.currentDomain ?? "",
		ok: !!e,
		message: "",
		code: "",
		warning: t?.warning ?? "",
		warningCode: t?.warningCode ?? "",
		domainsUsed: t?.domainsUsed ?? null,
		domainsMax: t?.domainsMax ?? null
	}, n.ai = {
		...n.ai,
		configured: !!e,
		openaiConfigured: !!e
	}, window.dispatchEvent?.(new Event(_));
}
var y = class extends Error {
	status;
	payload;
	constructor(e, t, n) {
		super(e), this.name = "MapSVGApiError", this.status = t, this.payload = n;
	}
};
function b() {
	let e = o();
	return {
		base: e.apiUrl.replace(/\/?$/, ""),
		nonce: e.nonce
	};
}
function x(e, t) {
	if (!e) return t;
	if (typeof e.error == "string" && e.error) return e.error;
	if (typeof e.message == "string" && e.message) return e.message;
	let n = e.data;
	if (n && typeof n == "object") {
		let e = n;
		if (typeof e.error == "string" && e.error) return e.error;
		if (typeof e.message == "string" && e.message) return e.message;
	}
	return t;
}
async function S(e, t = {}) {
	let { base: n, nonce: i } = b(), a = e.startsWith("/") ? e : `/${e}`, o = new Headers(t.headers);
	o.set("Accept", "application/json"), o.set("X-WP-Nonce", i), t.body != null && !o.has("Content-Type") && o.set("Content-Type", "application/json");
	let s = await r(`${n}${a}`, {
		...t,
		headers: o,
		credentials: "same-origin"
	}), c = await s.json().catch(() => null);
	if (!s.ok) throw new y(x(c, `API ${s.status}: ${e}`), s.status, c);
	return c;
}
function C(e) {
	let t = Array.isArray(e) ? e.map((e) => String(e)) : typeof e == "string" ? e.split(",") : [];
	return [...new Set(t.map((e) => e.trim()).filter(Boolean))];
}
function w(e) {
	let t = e.trim();
	if (!t) return "";
	let n = t.match(/^(?:[^-]+-){3}([^-]+)$/);
	return n ? `****-****-****-${n[1]}` : t.length <= 4 ? "*".repeat(t.length) : `${"*".repeat(t.length - 4)}${t.slice(-4)}`;
}
function T(e, t) {
	let n = t.token?.trim();
	if (!n) return "";
	let r = e.replace(/\/$/, "");
	return t.accessRights.wp ? `${r}/_mapsvg/login?key=${encodeURIComponent(n)}` : t.accessRights.logs ? `${r}/_mapsvg/logs?key=${encodeURIComponent(n)}` : "";
}
async function E(e) {
	let t = { ...e }, n = await S("/options/", {
		method: "POST",
		body: JSON.stringify({ options: JSON.stringify(t) })
	}), r = window.mapsvgReactAdminParams;
	if (r) {
		let e = {};
		for (let n of ["google_api_key", "google_geocoding_api_key"]) Object.prototype.hasOwnProperty.call(t, n) && (e[n] = t[n]);
		if (Object.keys(e).length > 0) {
			let t = r.options;
			r.options = {
				...t && typeof t == "object" && !Array.isArray(t) ? t : {},
				...e
			};
		}
	}
	return n;
}
async function D() {
	let e = await S("/tokens");
	return Array.isArray(e) ? e : Array.isArray(e.items) ? e.items : [];
}
async function O(e) {
	let t = await S("/tokens", {
		method: "POST",
		body: JSON.stringify({ token: { accessRights: e } })
	});
	if (!t.token) throw Error("MapSVG did not return the created access token.");
	return t.token;
}
async function k(e) {
	await S(`/tokens/${e}`, { method: "DELETE" });
}
async function A(e) {
	let t = await S("/purchasecode", {
		method: "PUT",
		body: JSON.stringify({ purchase_code: e })
	});
	return v(e.trim(), t), t;
}
async function j() {
	await S("/purchasecode", { method: "DELETE" }), v("");
}
function M() {
	return S("/ai/usage");
}
function N(e) {
	return S("/ai/lite-enrollment", {
		method: "POST",
		body: JSON.stringify({ email: e.trim() })
	});
}
function P() {
	return S("/ai/credit-packs");
}
function F(e, t) {
	return S("/ai/credit-purchases", {
		method: "POST",
		body: JSON.stringify({
			priceId: e,
			requestId: t
		})
	});
}
//#endregion
//#region src/components/global-settings/LicenseSettingsPage.tsx
var I = i();
function L(e) {
	return !(e instanceof y) || !e.payload ? "" : typeof e.payload.code == "string" ? e.payload.code : "";
}
function R(e, t) {
	return e instanceof Error && e.message ? e.message : t;
}
function z(e) {
	return [
		"domain_blocked",
		"domain_limit",
		"domain_mismatch",
		"domain_not_registered",
		"localhost_pending",
		"localhost_limit"
	].includes(e);
}
function B(e) {
	return e.warningCode === "domain_limit" ? e.domainsUsed != null && e.domainsMax != null ? "Domain limit reached (" + e.domainsUsed + "/" + e.domainsMax + "). Review your registered domains in MapSVG Dashboard." : e.warning || "Domain limit reached. Review your registered domains in MapSVG Dashboard." : e.warning;
}
function V({ activationOnly: e = !1 }) {
	let n = (0, g.useId)(), r = (0, g.useMemo)(() => o(), []), i = r.options && typeof r.options == "object" ? r.options : {}, _ = typeof i.purchase_code == "string" ? i.purchase_code.trim() : "", [v, y] = (0, g.useState)(_), [b, x] = (0, g.useState)(r.license?.maskedKey || w(_)), [S, C] = (0, g.useState)(r.license?.hasCode ?? !!_), [T, E] = (0, g.useState)({
		ok: r.license?.ok ?? !1,
		message: r.license?.message ?? "",
		code: r.license?.code ?? "",
		warning: r.license?.warning ?? "",
		warningCode: r.license?.warningCode ?? "",
		domainsUsed: r.license?.domainsUsed ?? null,
		domainsMax: r.license?.domainsMax ?? null
	}), [D, O] = (0, g.useState)(!S), [k, M] = (0, g.useState)(""), [N, P] = (0, g.useState)(!1), [F, V] = (0, g.useState)(""), [H, U] = (0, g.useState)(""), W = (e, t, n) => {
		y(e), x(w(e)), C(!0), O(!1), M(""), V(""), E({
			ok: !0,
			message: "",
			code: "",
			warning: t.warning ?? "",
			warningCode: t.warningCode ?? "",
			domainsUsed: t.domainsUsed ?? null,
			domainsMax: t.domainsMax ?? null
		}), U(n ? "License is valid. Domain settings are up to date." : "MapSVG is activated. Automatic updates are enabled on the WordPress Plugins page.");
	}, G = async (e, t = !1) => {
		let n = e.trim();
		if (!n) {
			V("Enter a license key.");
			return;
		}
		P(!0), V(""), U("");
		try {
			let e = await A(n);
			W(n, e, t);
		} catch (e) {
			let t = L(e), r = R(e, "Could not connect to MapSVG Dashboard. Please try again.");
			t === "localhost_pending" || t === "localhost_limit" ? (y(n), x(w(n)), C(!0), O(!1), M(""), E({
				ok: !1,
				message: r,
				code: t,
				warning: "",
				warningCode: "",
				domainsUsed: null,
				domainsMax: null
			})) : V(r);
		} finally {
			P(!1);
		}
	}, K = async () => {
		if (window.confirm("Deactivate MapSVG license on this site? Automatic updates will stop until you activate again. This does not remove the domain from MapSVG Dashboard.")) {
			P(!0), V(""), U("");
			try {
				await j(), y(""), x(""), C(!1), O(!0), M(""), E({
					ok: !1,
					message: "",
					code: "",
					warning: "",
					warningCode: "",
					domainsUsed: null,
					domainsMax: null
				}), U("License deactivated on this site.");
			} catch (e) {
				V(R(e, "Could not deactivate the license."));
			} finally {
				P(!1);
			}
		}
	}, q = /* @__PURE__ */ (0, I.jsxs)("a", {
		href: r.dashboardUrl || "https://mapsvg.com/dashboard",
		target: "_blank",
		rel: "noreferrer",
		className: "inline-flex items-center gap-1 font-medium text-primary underline underline-offset-4",
		children: ["MapSVG Dashboard ", /* @__PURE__ */ (0, I.jsx)(c, { className: "size-3.5" })]
	}), J = /* @__PURE__ */ (0, I.jsxs)(I.Fragment, { children: [
		/* @__PURE__ */ (0, I.jsxs)("p", {
			className: "text-sm leading-6 text-muted-foreground",
			children: [
				S ? "Enter a new license key to replace the current one. " : "Enter your license key to activate MapSVG. ",
				"Get your license key from ",
				q,
				"."
			]
		}),
		/* @__PURE__ */ (0, I.jsx)(s, {
			id: n,
			label: "License key",
			children: /* @__PURE__ */ (0, I.jsx)(a, {
				id: n,
				value: k,
				onChange: (e) => M(e.target.value),
				onKeyDown: (e) => {
					e.key === "Enter" && !N && (e.preventDefault(), G(k));
				},
				placeholder: "XXXX-XXXX-XXXX-XXXX",
				autoComplete: "off",
				autoFocus: !0
			})
		}),
		F ? /* @__PURE__ */ (0, I.jsx)(u, {
			variant: "destructive",
			children: /* @__PURE__ */ (0, I.jsx)(l, { children: F })
		}) : null,
		/* @__PURE__ */ (0, I.jsxs)("div", {
			className: "flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, I.jsx)(t, {
				type: "button",
				onClick: () => void G(k),
				disabled: N,
				children: N ? "Activating..." : "Activate"
			}), S && !e ? /* @__PURE__ */ (0, I.jsx)(t, {
				type: "button",
				variant: "outline",
				onClick: () => {
					O(!1), M(""), V("");
				},
				disabled: N,
				children: "Cancel"
			}) : null]
		})
	] });
	return e ? /* @__PURE__ */ (0, I.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [T.message && !T.ok && (S || z(T.code)) ? /* @__PURE__ */ (0, I.jsx)(u, {
			variant: "destructive",
			children: /* @__PURE__ */ (0, I.jsxs)(l, { children: [T.message, z(T.code) ? /* @__PURE__ */ (0, I.jsxs)("span", {
				className: "mt-1 block",
				children: [
					"Review the domain settings in ",
					q,
					"."
				]
			}) : null] })
		}) : null, J]
	}) : /* @__PURE__ */ (0, I.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [/* @__PURE__ */ (0, I.jsxs)("div", { children: [/* @__PURE__ */ (0, I.jsx)("h1", {
			className: "text-2xl font-semibold tracking-tight",
			children: "License"
		}), /* @__PURE__ */ (0, I.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: "Activate MapSVG on this WordPress installation to enable automatic updates."
		})] }), /* @__PURE__ */ (0, I.jsxs)(h, { children: [/* @__PURE__ */ (0, I.jsxs)(d, { children: [/* @__PURE__ */ (0, I.jsx)(p, { children: S && !D ? "License status" : "Activate MapSVG" }), /* @__PURE__ */ (0, I.jsx)(m, { children: S && !D ? "Manage the license currently used by this site." : "Enter your license key to enable automatic updates." })] }), /* @__PURE__ */ (0, I.jsxs)(f, {
			className: "space-y-5",
			children: [
				H ? /* @__PURE__ */ (0, I.jsx)(u, {
					variant: "success",
					children: /* @__PURE__ */ (0, I.jsx)(l, { children: H })
				}) : null,
				S && !D ? /* @__PURE__ */ (0, I.jsxs)(I.Fragment, { children: [
					T.message && !T.ok ? /* @__PURE__ */ (0, I.jsx)(u, {
						variant: "destructive",
						children: /* @__PURE__ */ (0, I.jsxs)(l, { children: [/* @__PURE__ */ (0, I.jsx)("span", { children: T.message }), z(T.code) ? /* @__PURE__ */ (0, I.jsxs)("span", {
							className: "mt-1 block",
							children: [
								"Review the domain settings in ",
								q,
								"."
							]
						}) : null] })
					}) : null,
					T.warning || T.warningCode === "domain_limit" ? /* @__PURE__ */ (0, I.jsx)(u, {
						variant: "warning",
						children: /* @__PURE__ */ (0, I.jsx)(l, { children: B(T) })
					}) : null,
					/* @__PURE__ */ (0, I.jsxs)("div", {
						className: "grid gap-4 rounded-lg border p-4",
						children: [/* @__PURE__ */ (0, I.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, I.jsx)("span", {
								className: "text-sm text-muted-foreground",
								children: "License key"
							}), /* @__PURE__ */ (0, I.jsx)("code", {
								className: "text-sm font-medium",
								children: b || "Active"
							})]
						}), r.license?.currentDomain ? /* @__PURE__ */ (0, I.jsxs)("div", {
							className: "grid gap-1",
							children: [/* @__PURE__ */ (0, I.jsx)("span", {
								className: "text-sm text-muted-foreground",
								children: "Registered domain"
							}), /* @__PURE__ */ (0, I.jsx)("code", {
								className: "text-sm font-medium",
								children: r.license.currentDomain
							})]
						}) : null]
					}),
					/* @__PURE__ */ (0, I.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, I.jsx)(t, {
								type: "button",
								variant: "outline",
								onClick: () => {
									O(!0), V(""), U("");
								},
								disabled: N,
								children: "Change license key"
							}),
							/* @__PURE__ */ (0, I.jsx)(t, {
								type: "button",
								variant: "outline",
								onClick: () => void G(v, !0),
								disabled: N || !v,
								children: N ? "Checking..." : "Recheck license"
							}),
							/* @__PURE__ */ (0, I.jsx)(t, {
								type: "button",
								variant: "destructive",
								onClick: () => void K(),
								disabled: N,
								children: "Deactivate"
							})
						]
					})
				] }) : /* @__PURE__ */ (0, I.jsx)(I.Fragment, { children: J }),
				!S && H ? /* @__PURE__ */ (0, I.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "You can enter another license key above at any time."
				}) : null
			]
		})] })]
	});
}
//#endregion
export { F as a, P as c, C as d, N as f, T as i, M as l, _ as n, O as o, E as p, y as r, k as s, V as t, D as u };

//# sourceMappingURL=LicenseSettingsPage-DEnFP4oz.js.map