import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Fr as t, _r as n, bi as r, cr as i, dr as a, fr as o, hi as s, kr as ee, kt as c, or as l, pn as u } from "./admin-startup-CJQ1Yfhw.js";
import { r as d } from "./SettingsControlField-Cc88mmng.js";
import { t as f } from "./label-mmXv6K5N.js";
import { t as te } from "./external-link-Cet6QFcd.js";
import { t as ne } from "./badge-DeTgd5ec.js";
import { a as p, i as m, n as re, o as h, r as g, t as ie } from "./table-De7IgFWb.js";
import { n as _, t as v } from "./alert-C9SMy_tl.js";
import { a as y, n as b, o as x, r as S, t as C } from "./card-CWcyual_.js";
import { d as w, i as ae, o as T, p as E, s as oe, t as D, u as O } from "./LicenseSettingsPage-DEnFP4oz.js";
//#region src/components/global-settings/GeneralSettingsPage.tsx
var k = /* @__PURE__ */ e(r(), 1), A = s();
function j(e, t) {
	return e instanceof Error && e.message ? e.message : t;
}
async function M(e) {
	if (!e) return !1;
	try {
		return await navigator.clipboard.writeText(e), !0;
	} catch {
		let t = document.createElement("textarea");
		t.value = e, t.setAttribute("readonly", ""), t.style.position = "fixed", t.style.left = "-9999px", document.body.appendChild(t), t.select();
		let n = document.execCommand("copy");
		return t.remove(), n;
	}
}
function N(e) {
	if (!e) return "Never used";
	let t = new Date(e);
	return Number.isNaN(t.getTime()) ? e : t.toLocaleDateString();
}
function P() {
	let e = (0, k.useMemo)(() => u(), []), r = (0, k.useMemo)(() => e.options && typeof e.options == "object" ? e.options : {}, [e.options]), [i, a] = (0, k.useState)(typeof r.google_api_key == "string" ? r.google_api_key : ""), [o, s] = (0, k.useState)(typeof r.google_geocoding_api_key == "string" ? r.google_geocoding_api_key : ""), [l, D] = (0, k.useState)(w(r.allowed_shortcodes).join(", ")), [P, F] = (0, k.useState)(!1), [I, L] = (0, k.useState)(null), [R, z] = (0, k.useState)(!1), [B, V] = (0, k.useState)(!1), [H, U] = (0, k.useState)([]), [W, G] = (0, k.useState)(!1), [K, q] = (0, k.useState)(!1), [J, Y] = (0, k.useState)(null), [X, Z] = (0, k.useState)(""), Q = e.license != null, $ = (0, k.useCallback)(async () => {
		if (!(!Q || !e.user.isAdmin)) {
			G(!0);
			try {
				U(await O());
			} catch (e) {
				Y({
					kind: "error",
					text: j(e, "Could not load support access tokens.")
				});
			} finally {
				G(!1);
			}
		}
	}, [e.user.isAdmin, Q]);
	(0, k.useEffect)(() => {
		$();
	}, [$]), (0, k.useEffect)(() => {
		let e = (e) => {
			let t = e.detail?.settings?.allowedShortcodes;
			Array.isArray(t) && D(t.filter((e) => typeof e == "string").join(", ")), L({
				kind: "success",
				text: "Settings updated by AI."
			});
		};
		return window.addEventListener("mapsvg:global-settings-mutation", e), () => window.removeEventListener("mapsvg:global-settings-mutation", e);
	}, []);
	let se = async () => {
		F(!0), L(null);
		try {
			let t = {
				google_api_key: i.trim(),
				google_geocoding_api_key: o.trim()
			};
			e.user.isAdmin && (t.allowed_shortcodes = w(l)), await E(t), D(e.user.isAdmin ? w(l).join(", ") : l), L({
				kind: "success",
				text: "Settings saved."
			});
		} catch (e) {
			L({
				kind: "error",
				text: j(e, "Could not save settings.")
			});
		} finally {
			F(!1);
		}
	}, ce = async () => {
		if (e.user.isAdmin) {
			if (!R) {
				Y({
					kind: "error",
					text: "Enable \"Access to logs\" before creating a support token."
				});
				return;
			}
			q(!0), Y(null), Z("");
			try {
				let t = await T({
					logs: !0,
					...B ? { wp: !0 } : {}
				}), n = ae(e.homeUrl, t);
				if (!n) throw Error("MapSVG did not return a usable support token.");
				Z(n);
				let r = await M(n);
				Y({
					kind: "success",
					text: r ? "Magic link created and copied to the clipboard. Save it now: it is shown only once." : "Magic link created. Save it now: it is shown only once."
				}), z(!1), V(!1), await $();
			} catch (e) {
				Y({
					kind: "error",
					text: j(e, "Could not create a support token.")
				});
			} finally {
				q(!1);
			}
		}
	}, le = async (t) => {
		if (e.user.isAdmin && window.confirm("Delete this support access token?")) {
			q(!0), Y(null);
			try {
				await oe(t.id), U((e) => e.filter((e) => e.id !== t.id)), Y({
					kind: "success",
					text: "Support access token deleted."
				});
			} catch (e) {
				Y({
					kind: "error",
					text: j(e, "Could not delete the support access token.")
				});
			} finally {
				q(!1);
			}
		}
	};
	return /* @__PURE__ */ (0, A.jsxs)("div", {
		className: "flex flex-col gap-6",
		children: [
			/* @__PURE__ */ (0, A.jsxs)("div", { children: [/* @__PURE__ */ (0, A.jsx)("h1", {
				className: "text-2xl font-semibold tracking-tight",
				children: "Settings"
			}), /* @__PURE__ */ (0, A.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Global MapSVG settings for this WordPress installation."
			})] }),
			/* @__PURE__ */ (0, A.jsxs)(C, { children: [/* @__PURE__ */ (0, A.jsx)(y, { children: /* @__PURE__ */ (0, A.jsx)(x, { children: "Map services" }) }), /* @__PURE__ */ (0, A.jsxs)(b, {
				className: "space-y-5",
				children: [
					/* @__PURE__ */ (0, A.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, A.jsx)(f, {
							htmlFor: "mapsvg-google-api-key",
							children: "Google Maps API key"
						}), /* @__PURE__ */ (0, A.jsx)(c, {
							id: "mapsvg-google-api-key",
							value: i,
							onChange: (e) => a(e.target.value),
							autoComplete: "off"
						})]
					}),
					/* @__PURE__ */ (0, A.jsxs)("div", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ (0, A.jsx)(f, {
								htmlFor: "mapsvg-google-geocoding-api-key",
								children: "Google Geocoding API key"
							}),
							/* @__PURE__ */ (0, A.jsx)(c, {
								id: "mapsvg-google-geocoding-api-key",
								value: o,
								onChange: (e) => s(e.target.value),
								autoComplete: "off"
							}),
							/* @__PURE__ */ (0, A.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Google Geocoding API is used to convert address to lat/lng coordinates and back."
							})
						]
					}),
					/* @__PURE__ */ (0, A.jsxs)("div", {
						className: "grid gap-2",
						children: [
							/* @__PURE__ */ (0, A.jsx)(f, {
								htmlFor: "mapsvg-allowed-shortcodes",
								children: "Allowed shortcodes"
							}),
							/* @__PURE__ */ (0, A.jsx)(c, {
								id: "mapsvg-allowed-shortcodes",
								value: l,
								onChange: (e) => D(e.target.value),
								disabled: !e.user.isAdmin
							}),
							/* @__PURE__ */ (0, A.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Comma-separated list of shortcodes that are allowed to be used in map templates. Can be edited by site Admins only."
							})
						]
					}),
					I ? /* @__PURE__ */ (0, A.jsx)(v, {
						variant: I.kind === "error" ? "destructive" : "success",
						children: /* @__PURE__ */ (0, A.jsx)(_, { children: I.text })
					}) : null,
					/* @__PURE__ */ (0, A.jsx)(t, {
						type: "button",
						onClick: () => void se(),
						disabled: P,
						children: P ? "Saving..." : "Save"
					})
				]
			})] }),
			Q ? /* @__PURE__ */ (0, A.jsxs)(C, { children: [/* @__PURE__ */ (0, A.jsxs)(y, { children: [/* @__PURE__ */ (0, A.jsx)(x, { children: "Access for support" }), /* @__PURE__ */ (0, A.jsx)(S, { children: "Please grant the MapSVG support team some level of access when submitting a bug report for quicker issue resolution. The more access you grant, the faster the issue can be resolved, but at least Access to logs is required." })] }), /* @__PURE__ */ (0, A.jsx)(b, {
				className: "space-y-6",
				children: e.user.isAdmin ? /* @__PURE__ */ (0, A.jsxs)(A.Fragment, { children: [
					/* @__PURE__ */ (0, A.jsxs)("div", {
						className: "space-y-5",
						children: [/* @__PURE__ */ (0, A.jsxs)("div", {
							className: "flex items-start justify-between gap-5",
							children: [/* @__PURE__ */ (0, A.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, A.jsx)(f, {
									htmlFor: "mapsvg-support-logs",
									children: "Access to logs"
								}), /* @__PURE__ */ (0, A.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "Grants access to WordPress logs, database queries, and other diagnostic information. This access level is required."
								})]
							}), /* @__PURE__ */ (0, A.jsx)(d, {
								id: "mapsvg-support-logs",
								checked: R,
								onCheckedChange: z,
								disabled: K
							})]
						}), /* @__PURE__ */ (0, A.jsxs)("div", {
							className: "flex items-start justify-between gap-5",
							children: [/* @__PURE__ */ (0, A.jsxs)("div", {
								className: "space-y-1",
								children: [/* @__PURE__ */ (0, A.jsx)(f, {
									htmlFor: "mapsvg-support-wp",
									children: "Access to WP-admin"
								}), /* @__PURE__ */ (0, A.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "Creates an administrator user named \"mapsvg\". The user is removed when all access tokens with WP-admin permission are deleted."
								})]
							}), /* @__PURE__ */ (0, A.jsx)(d, {
								id: "mapsvg-support-wp",
								checked: B,
								onCheckedChange: V,
								disabled: K
							})]
						})]
					}),
					/* @__PURE__ */ (0, A.jsx)(t, {
						type: "button",
						onClick: () => void ce(),
						disabled: K || !R,
						children: K ? "Working..." : "Create access token"
					}),
					X ? /* @__PURE__ */ (0, A.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, A.jsx)(f, {
							htmlFor: "mapsvg-support-magic-link",
							children: "Magic link"
						}), /* @__PURE__ */ (0, A.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, A.jsx)(c, {
								id: "mapsvg-support-magic-link",
								value: X,
								readOnly: !0,
								className: "font-mono text-xs"
							}), /* @__PURE__ */ (0, A.jsx)(t, {
								type: "button",
								variant: "outline",
								size: "icon",
								"aria-label": "Copy magic link",
								onClick: () => void M(X),
								children: /* @__PURE__ */ (0, A.jsx)(ee, {})
							})]
						})]
					}) : null,
					J ? /* @__PURE__ */ (0, A.jsx)(v, {
						variant: J.kind === "error" ? "destructive" : "success",
						children: /* @__PURE__ */ (0, A.jsx)(_, { children: J.text })
					}) : null,
					/* @__PURE__ */ (0, A.jsxs)("div", {
						className: "space-y-3",
						children: [/* @__PURE__ */ (0, A.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, A.jsx)("h3", {
								className: "text-sm font-semibold",
								children: "Access tokens"
							}), /* @__PURE__ */ (0, A.jsx)(t, {
								type: "button",
								variant: "ghost",
								size: "sm",
								onClick: () => void $(),
								disabled: W || K,
								children: "Refresh"
							})]
						}), W ? /* @__PURE__ */ (0, A.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Loading access tokens..."
						}) : H.length === 0 ? /* @__PURE__ */ (0, A.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "No active support access tokens."
						}) : /* @__PURE__ */ (0, A.jsx)("div", {
							className: "rounded-md border",
							children: /* @__PURE__ */ (0, A.jsxs)(ie, { children: [/* @__PURE__ */ (0, A.jsx)(p, { children: /* @__PURE__ */ (0, A.jsxs)(h, { children: [
								/* @__PURE__ */ (0, A.jsx)(m, { children: "Token" }),
								/* @__PURE__ */ (0, A.jsx)(m, { children: "Created" }),
								/* @__PURE__ */ (0, A.jsx)(m, { children: "Last used" }),
								/* @__PURE__ */ (0, A.jsx)(m, { children: "Access to" }),
								/* @__PURE__ */ (0, A.jsx)(m, { className: "w-12" })
							] }) }), /* @__PURE__ */ (0, A.jsx)(re, { children: H.map((e) => /* @__PURE__ */ (0, A.jsxs)(h, { children: [
								/* @__PURE__ */ (0, A.jsxs)(g, {
									className: "font-mono",
									children: [e.tokenFirstFour || "????", "****"]
								}),
								/* @__PURE__ */ (0, A.jsx)(g, { children: N(e.createdAt) }),
								/* @__PURE__ */ (0, A.jsx)(g, { children: N(e.lastUsedAt) }),
								/* @__PURE__ */ (0, A.jsx)(g, { children: /* @__PURE__ */ (0, A.jsx)("div", {
									className: "flex flex-wrap gap-1",
									children: Object.entries(e.accessRights).filter(([, e]) => e).map(([e]) => /* @__PURE__ */ (0, A.jsx)(ne, {
										variant: "secondary",
										children: e
									}, e))
								}) }),
								/* @__PURE__ */ (0, A.jsx)(g, { children: /* @__PURE__ */ (0, A.jsx)(t, {
									type: "button",
									variant: "ghost",
									size: "icon",
									"aria-label": "Delete support access token",
									disabled: K,
									onClick: () => void le(e),
									children: /* @__PURE__ */ (0, A.jsx)(n, {})
								}) })
							] }, e.id)) })] })
						})]
					}),
					/* @__PURE__ */ (0, A.jsxs)("p", {
						className: "text-xs text-muted-foreground",
						children: [
							"Need to manage support from your MapSVG account?",
							" ",
							/* @__PURE__ */ (0, A.jsxs)("a", {
								href: "https://mapsvg.com/dashboard",
								target: "_blank",
								rel: "noreferrer",
								className: "inline-flex items-center gap-1 underline underline-offset-4",
								children: ["MapSVG Dashboard ", /* @__PURE__ */ (0, A.jsx)(te, { className: "size-3" })]
							})
						]
					})
				] }) : /* @__PURE__ */ (0, A.jsx)(v, {
					variant: "warning",
					children: /* @__PURE__ */ (0, A.jsx)(_, { children: "Only WordPress administrators can create or revoke support access." })
				})
			})] }) : null
		]
	});
}
//#endregion
//#region src/components/global-settings/GlobalSettingsPanel.tsx
function F() {
	return /* @__PURE__ */ (0, A.jsx)("div", {
		className: "h-full min-h-0 overflow-y-auto overscroll-contain bg-background",
		children: /* @__PURE__ */ (0, A.jsxs)("div", {
			className: "mx-auto flex w-full max-w-4xl flex-col gap-8 p-6",
			children: [u().license == null ? null : /* @__PURE__ */ (0, A.jsxs)(A.Fragment, { children: [/* @__PURE__ */ (0, A.jsx)(D, {}), /* @__PURE__ */ (0, A.jsx)("div", { className: "border-t border-border" })] }), /* @__PURE__ */ (0, A.jsx)(P, {})]
		})
	});
}
//#endregion
//#region src/components/global-settings/GlobalSettingsDialog.tsx
function I({ open: e, onOpenChange: t }) {
	return /* @__PURE__ */ (0, A.jsx)(l, {
		open: e,
		onOpenChange: t,
		children: /* @__PURE__ */ (0, A.jsxs)(i, {
			className: "flex h-[85vh] max-h-[900px] flex-col overflow-hidden p-0 sm:max-w-5xl",
			"aria-describedby": void 0,
			children: [/* @__PURE__ */ (0, A.jsx)(a, {
				className: "shrink-0 border-b border-border px-6 py-5",
				children: /* @__PURE__ */ (0, A.jsx)(o, { children: "Settings" })
			}), /* @__PURE__ */ (0, A.jsx)("div", {
				"data-slot": "global-settings-body",
				className: "min-h-0 flex-1 overflow-hidden",
				onWheel: (e) => e.stopPropagation(),
				onTouchMove: (e) => e.stopPropagation(),
				children: /* @__PURE__ */ (0, A.jsx)(F, {})
			})]
		})
	});
}
//#endregion
export { I as GlobalSettingsDialog };

//# sourceMappingURL=GlobalSettingsDialog-1bjTNWDJ.js.map