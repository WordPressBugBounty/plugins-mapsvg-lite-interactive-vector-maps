import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Fr as t, Lr as n, Nr as r, Pr as i, bi as a, cr as o, dr as ee, fr as s, hi as c, kt as l, mn as u, or as d, pn as te, ur as f } from "./admin-startup-CJQ1Yfhw.js";
import { l as p, n as m } from "./SettingsControlField-Cc88mmng.js";
import { n as ne, t as re } from "./radio-group-BnfE7XZd.js";
import { i as h, n as g, r as _, t as v } from "./tabs-DM1yy0Iq.js";
import { t as y } from "./chevron-down-XoxtvsFh.js";
import { t as b } from "./chevron-right-D88vapMI.js";
import { t as ie } from "./external-link-Cet6QFcd.js";
import { n as x, t as S } from "./alert-C9SMy_tl.js";
import { t as ae } from "./SettingsSection-wWOqHpFq.js";
import { n as C, t as w } from "./card-CWcyual_.js";
import { t as oe } from "./spinner-_2q8AEpY.js";
import { a as se, c as ce, f as T, l as le, n as E, r as ue, t as de } from "./LicenseSettingsPage-DEnFP4oz.js";
var D = i("calendar-days", [
	["path", {
		d: "M8 2v4",
		key: "1cmpym"
	}],
	["path", {
		d: "M16 2v4",
		key: "4m81vk"
	}],
	["rect", {
		width: "18",
		height: "18",
		x: "3",
		y: "4",
		rx: "2",
		key: "1hopcy"
	}],
	["path", {
		d: "M3 10h18",
		key: "8toen8"
	}],
	["path", {
		d: "M8 14h.01",
		key: "6423bh"
	}],
	["path", {
		d: "M12 14h.01",
		key: "1etili"
	}],
	["path", {
		d: "M16 14h.01",
		key: "1gbofw"
	}],
	["path", {
		d: "M8 18h.01",
		key: "lrp35t"
	}],
	["path", {
		d: "M12 18h.01",
		key: "mhygvu"
	}],
	["path", {
		d: "M16 18h.01",
		key: "kzsmim"
	}]
]), O = i("earth", [
	["path", {
		d: "M21.54 15H17a2 2 0 0 0-2 2v4.54",
		key: "1djwo0"
	}],
	["path", {
		d: "M7 3.34V5a3 3 0 0 0 3 3a2 2 0 0 1 2 2c0 1.1.9 2 2 2a2 2 0 0 0 2-2c0-1.1.9-2 2-2h3.17",
		key: "1tzkfa"
	}],
	["path", {
		d: "M11 21.95V18a2 2 0 0 0-2-2a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05",
		key: "14pb5j"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}]
]), k = /* @__PURE__ */ e(a(), 1);
function A(e) {
	return e.toLocaleString("en-US", { maximumFractionDigits: 4 });
}
//#endregion
//#region src/lib/use-license-summary.ts
function j(e) {
	return window.addEventListener(E, e), () => window.removeEventListener(E, e);
}
function fe() {
	return (0, k.useSyncExternalStore)(j, () => window.mapsvgReactAdminParams?.license ?? null);
}
//#endregion
//#region src/components/global-settings/UsageDialog.tsx
var M = c(), N = 1e3, P = {
	daily: {
		title: "Daily usage",
		unit: "day",
		adjective: "daily"
	},
	weekly: {
		title: "Weekly usage",
		unit: "week",
		adjective: "weekly"
	},
	monthly: {
		title: "Monthly usage",
		unit: "month",
		adjective: "monthly"
	},
	annual: {
		title: "Annual usage",
		unit: "year",
		adjective: "annual"
	}
}, F = (e, t) => Math.min(100, Math.max(0, t > 0 ? e / t * 100 : e > 0 ? 100 : 0)), I = (e) => new Date(e).toLocaleDateString("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
	timeZone: "UTC"
});
function pe() {
	let e = (0, k.useId)(), [n, r] = (0, k.useState)(""), [i, a] = (0, k.useState)(!1), [o, ee] = (0, k.useState)(!1), [s, c] = (0, k.useState)(""), [u, d] = (0, k.useState)(0), [te, f] = (0, k.useState)(Date.now()), p = Math.max(0, Math.ceil((u - te) / 1e3));
	return (0, k.useEffect)(() => {
		if (!u) return;
		let e = window.setInterval(() => f(Date.now()), 1e3);
		return () => window.clearInterval(e);
	}, [u]), /* @__PURE__ */ (0, M.jsx)(ae, {
		title: "Free AI usage for MapSVG Lite",
		help: "Get a free AI allowance that resets every week. Verify your email to create a MapSVG Dashboard account and receive your free license key.",
		children: /* @__PURE__ */ (0, M.jsxs)("form", {
			className: "flex flex-col gap-4",
			onSubmit: async (e) => {
				if (e.preventDefault(), !(i || p)) {
					a(!0), c("");
					try {
						let e = await T(n);
						ee(!0);
						let t = Math.max(1, Math.min(3600, Number(e.retryAfter) || 60));
						d(Date.now() + t * 1e3), f(Date.now());
					} catch (e) {
						if (e instanceof ue && e.status === 429) {
							let t = Number(e.payload?.retryAfter) || 60;
							d(Date.now() + Math.max(1, Math.min(3600, t)) * 1e3), f(Date.now());
						}
						c(e instanceof Error ? e.message : "Could not request your license. Please try again.");
					} finally {
						a(!1);
					}
				}
			},
			children: [
				/* @__PURE__ */ (0, M.jsx)(m, {
					id: e,
					label: "Email",
					help: "We will email a confirmation link. After you confirm, your license key will be available in Dashboard and sent to your email.",
					children: /* @__PURE__ */ (0, M.jsx)(l, {
						id: e,
						type: "email",
						required: !0,
						maxLength: 254,
						autoComplete: "email",
						placeholder: "you@example.com",
						value: n,
						onChange: (e) => r(e.target.value),
						disabled: i
					})
				}),
				o ? /* @__PURE__ */ (0, M.jsx)("p", {
					role: "status",
					className: "text-sm text-muted-foreground",
					children: "Check your email for the confirmation link. If a request can be processed for this address, we will send you an email."
				}) : null,
				s ? /* @__PURE__ */ (0, M.jsx)(S, {
					variant: "destructive",
					children: /* @__PURE__ */ (0, M.jsx)(x, { children: s })
				}) : null,
				/* @__PURE__ */ (0, M.jsx)("div", { children: /* @__PURE__ */ (0, M.jsx)(t, {
					type: "submit",
					variant: "outline",
					disabled: i || p > 0,
					children: i ? "Sending…" : p ? `Send again in ${p}s` : o ? "Send again" : "Send me a free license key"
				}) })
			]
		})
	});
}
function L({ license: e }) {
	return /* @__PURE__ */ (0, M.jsxs)("div", { children: [/* @__PURE__ */ (0, M.jsx)("p", {
		className: "pb-3 text-xs text-muted-foreground",
		children: "Last 3 months · Up to 30 active days · UTC"
	}), e.dailyUsage.length ? /* @__PURE__ */ (0, M.jsx)("ul", {
		className: "divide-y",
		"aria-label": "Daily AI usage",
		children: e.dailyUsage.map((e) => /* @__PURE__ */ (0, M.jsxs)("li", {
			className: "flex items-center justify-between gap-3 py-3 text-sm",
			children: [/* @__PURE__ */ (0, M.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, M.jsx)(D, {
					className: "mt-0.5 size-4 text-muted-foreground",
					"aria-hidden": !0
				}), /* @__PURE__ */ (0, M.jsxs)("div", { children: [/* @__PURE__ */ (0, M.jsx)("time", {
					dateTime: e.date,
					children: I(`${e.date}T00:00:00Z`)
				}), /* @__PURE__ */ (0, M.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						e.calls.toLocaleString("en-US"),
						" ",
						e.calls === 1 ? "request" : "requests"
					]
				})] })]
			}), /* @__PURE__ */ (0, M.jsxs)("span", {
				className: "shrink-0 tabular-nums",
				children: [A(e.credits), " credits"]
			})]
		}, e.date))
	}) : /* @__PURE__ */ (0, M.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "No AI activity in the last 3 months."
	})] });
}
function R({ license: e }) {
	return /* @__PURE__ */ (0, M.jsx)("div", { children: e.siteUsage.length ? /* @__PURE__ */ (0, M.jsx)("ul", {
		className: "divide-y",
		"aria-label": "AI usage by site",
		children: e.siteUsage.map((e) => /* @__PURE__ */ (0, M.jsxs)("li", {
			className: "flex flex-wrap items-center justify-between gap-3 py-3 text-sm",
			children: [/* @__PURE__ */ (0, M.jsxs)("div", {
				className: "flex min-w-0 flex-1 items-start gap-3",
				children: [/* @__PURE__ */ (0, M.jsx)(O, {
					className: "mt-0.5 size-4 shrink-0 text-muted-foreground",
					"aria-hidden": !0
				}), /* @__PURE__ */ (0, M.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, M.jsx)("p", {
							className: "break-all",
							children: e.siteUrl?.replace(/^https?:\/\//, "") ?? "Earlier or unattributed usage"
						}),
						/* @__PURE__ */ (0, M.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								e.calls.toLocaleString("en-US"),
								" ",
								e.calls === 1 ? "request" : "requests"
							]
						}),
						e.siteUrl ? null : /* @__PURE__ */ (0, M.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "This usage was recorded without a site breakdown."
						})
					]
				})]
			}), /* @__PURE__ */ (0, M.jsxs)("div", {
				className: "shrink-0 text-right tabular-nums",
				children: [/* @__PURE__ */ (0, M.jsxs)("p", { children: [A(e.credits), " credits"] }), e.pendingCredits > 0 ? /* @__PURE__ */ (0, M.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [A(e.pendingCredits), " credits reserved"]
				}) : null]
			})]
		}, e.siteUrl ?? "unattributed"))
	}) : /* @__PURE__ */ (0, M.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "No site activity in this period yet."
	}) });
}
function me({ license: e, onBuy: n }) {
	let [r, i] = (0, k.useState)(!1), a = e.numDomainsMax === 0 || e.numDomainsMax > 1, o = F(e.used, e.allowance), ee = o > 99 && o < 100 ? Math.floor(o * 100) / 100 : Math.round(o), s = P[e.periodKind], c = Math.max(0, e.purchasedRemaining ?? 0), l = Math.max(0, e.purchasedTotal ?? c), u = Math.max(0, e.purchasedUsed ?? l - c), d = F(u, l);
	return /* @__PURE__ */ (0, M.jsxs)(M.Fragment, { children: [
		/* @__PURE__ */ (0, M.jsx)(w, {
			role: "group",
			"aria-label": s.title,
			className: "shadow-none",
			children: /* @__PURE__ */ (0, M.jsxs)(C, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, M.jsxs)("div", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, M.jsx)("p", {
							className: "font-medium",
							children: s.title
						}), /* @__PURE__ */ (0, M.jsxs)("span", {
							className: "tabular-nums text-muted-foreground",
							children: [ee, "% used"]
						})]
					}),
					/* @__PURE__ */ (0, M.jsx)("div", {
						role: "progressbar",
						"aria-label": "Plan usage",
						"aria-valuemin": 0,
						"aria-valuemax": 100,
						"aria-valuenow": o,
						className: "h-2 overflow-hidden rounded-full bg-muted",
						children: /* @__PURE__ */ (0, M.jsx)("div", {
							className: "h-full bg-primary transition-[width]",
							style: { width: `${o}%` }
						})
					}),
					/* @__PURE__ */ (0, M.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Resets at ",
							I(e.expiresAt),
							" (UTC)"
						]
					}),
					e.aiAvailable ? null : /* @__PURE__ */ (0, M.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: "AI access is inactive for this license."
					})
				]
			})
		}),
		/* @__PURE__ */ (0, M.jsx)(w, {
			role: "group",
			"aria-label": "Purchased credits",
			className: "shadow-none",
			children: /* @__PURE__ */ (0, M.jsxs)(C, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, M.jsxs)("div", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, M.jsx)("p", {
							className: "font-medium",
							children: "Purchased credits"
						}), /* @__PURE__ */ (0, M.jsxs)("span", {
							className: "tabular-nums text-muted-foreground",
							children: [
								A(u),
								" / ",
								A(l),
								" used"
							]
						})]
					}),
					/* @__PURE__ */ (0, M.jsx)("div", {
						role: "progressbar",
						"aria-label": "Purchased credits used",
						"aria-valuemin": 0,
						"aria-valuemax": 100,
						"aria-valuenow": d,
						"aria-valuetext": `${A(u)} of ${A(l)} purchased credits used`,
						className: "h-2 overflow-hidden rounded-full bg-muted",
						children: /* @__PURE__ */ (0, M.jsx)("div", {
							className: "h-full bg-primary transition-[width]",
							style: { width: `${d}%` }
						})
					}),
					/* @__PURE__ */ (0, M.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, M.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, M.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No expiry"
							}), /* @__PURE__ */ (0, M.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Used after your plan allowance"
							})]
						}), /* @__PURE__ */ (0, M.jsx)(t, {
							type: "button",
							variant: "outline",
							onClick: n,
							children: "Buy AI credits"
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, M.jsxs)(t, {
			type: "button",
			variant: "link",
			className: "h-auto justify-start gap-1.5 p-0 has-[>svg]:px-0",
			onClick: () => i(!r),
			"aria-expanded": r,
			children: ["View usage", r ? /* @__PURE__ */ (0, M.jsx)(y, {
				className: "size-4",
				"aria-hidden": !0
			}) : /* @__PURE__ */ (0, M.jsx)(b, {
				className: "size-4",
				"aria-hidden": !0
			})]
		}),
		r ? /* @__PURE__ */ (0, M.jsx)(w, {
			role: "region",
			"aria-label": "AI usage details",
			children: /* @__PURE__ */ (0, M.jsxs)(C, { children: [/* @__PURE__ */ (0, M.jsx)("p", {
				className: "mb-3 text-xs text-muted-foreground",
				children: "Usage includes credits covered by your plan."
			}), a ? /* @__PURE__ */ (0, M.jsxs)(v, {
				defaultValue: "sites",
				children: [
					/* @__PURE__ */ (0, M.jsxs)(_, {
						className: "mb-3 grid grid-cols-2",
						children: [/* @__PURE__ */ (0, M.jsx)(h, {
							value: "sites",
							children: "Usage by site"
						}), /* @__PURE__ */ (0, M.jsx)(h, {
							value: "daily",
							children: "Recent usage"
						})]
					}),
					/* @__PURE__ */ (0, M.jsx)(g, {
						value: "sites",
						children: /* @__PURE__ */ (0, M.jsx)(R, { license: e })
					}),
					/* @__PURE__ */ (0, M.jsx)(g, {
						value: "daily",
						children: /* @__PURE__ */ (0, M.jsx)(L, { license: e })
					})
				]
			}) : /* @__PURE__ */ (0, M.jsx)(L, { license: e })] })
		}) : null
	] });
}
function z({ open: e, onOpenChange: i, initialScreen: a = "usage" }) {
	let c = te(), l = fe(), m = !!(l?.hasCode && l.ok), [h, g] = (0, k.useState)(!1), _ = m && !h, [v, y] = (0, k.useState)(null), [b, C] = (0, k.useState)(""), [w, T] = (0, k.useState)(!1), [E, D] = (0, k.useState)("usage"), [O, j] = (0, k.useState)([]), [P, F] = (0, k.useState)(null), [I, L] = (0, k.useState)(""), [R, z] = (0, k.useState)(!1), [B, V] = (0, k.useState)(""), [he, H] = (0, k.useState)(!1), [ge, U] = (0, k.useState)(!1), W = (0, k.useId)(), G = (0, k.useRef)(/* @__PURE__ */ new Map()), [_e, K] = (0, k.useState)(N), ve = (0, k.useRef)(null), q = (0, k.useRef)(null), ye = (0, k.useRef)(null), J = (0, k.useRef)(0), Y = (0, k.useRef)(0), X = (0, k.useRef)(null), Z = (0, k.useRef)(!1), Q = (0, k.useCallback)(async () => {
		if (X.current !== null) return;
		let e = Z.current, t = ++Y.current;
		X.current = t, T(!0), C("");
		try {
			let n = await le();
			t === Y.current && (g(!1), y(n.licenses), window.dispatchEvent(new CustomEvent("mapsvg:ai-usage-updated", { detail: {
				licenses: n.licenses,
				...e ? { purchaseCompleted: !0 } : {}
			} })), e && (Z.current = !1));
		} catch (e) {
			t === Y.current && (C(e instanceof Error ? e.message : "Could not load AI usage."), e instanceof ue && e.payload?.code === "activation_required" && (g(!0), y(null), Z.current = !1));
		} finally {
			X.current === t && (X.current = null), t === Y.current && T(!1), t === Y.current && Z.current && !e && Q();
		}
	}, []);
	(0, k.useEffect)(() => (y(null), C(""), g(!1), D("usage"), F(null), j([]), V(""), L(""), z(!1), H(!1), U(!1), G.current.clear(), Z.current = !1, J.current++, e && m ? Q() : T(!1), () => {
		Y.current += 1, J.current++, X.current = null;
	}), [
		e,
		m,
		l,
		Q
	]), (0, k.useEffect)(() => {
		if (!e || !_) return;
		let t = window.setInterval(() => void Q(), 3e4);
		return () => window.clearInterval(t);
	}, [
		e,
		_,
		Q
	]);
	let be = (0, k.useCallback)((e = !1) => {
		e && (Z.current = !0), J.current++, D("usage"), F(null), L(""), z(!1), H(!1), U(!1), V(""), G.current.clear(), Q();
	}, [Q]);
	(0, k.useEffect)(() => {
		if (!e || !P) return;
		let t = (e) => {
			e.origin !== new URL(P.checkoutUrl).origin || e.source !== ve.current?.contentWindow || e.data?.purchaseId !== P.purchaseId || (e.data?.type === "mapsvg:ai-credit-purchase" && (e.data.status === "fulfilled" ? be(!0) : e.data.status === "processing" ? H(!0) : e.data.status === "ready" || e.data.status === "error" ? (H(!1), U(!1)) : e.data.status === "loaded" && (U(!1), ye.current?.querySelector("[aria-checked=\"true\"]")?.focus({ preventScroll: !0 }), q.current && (q.current.scrollTop = 0))), e.data?.type === "mapsvg:ai-credit-checkout-height" && Number.isFinite(e.data.height) && K(Math.max(300, Math.min(1600, e.data.height))));
		};
		return window.addEventListener("message", t), () => window.removeEventListener("message", t);
	}, [
		e,
		P,
		be
	]);
	let xe = async () => {
		let e = ++J.current;
		D("packs"), F(null), V(""), H(!1), U(!1), K(N), z(!0), L("");
		try {
			let t = await ce();
			e === J.current && (j(t.packs), t.packs[0] && Se(t.packs[0]));
		} catch (t) {
			e === J.current && L(t instanceof Error ? t.message : "Could not load usage packs");
		} finally {
			e === J.current && z(!1);
		}
	};
	(0, k.useEffect)(() => {
		e && _ && a === "packs" && xe();
	}, [
		e,
		_,
		a
	]);
	let Se = async (e) => {
		if (he) return;
		let t = ++J.current;
		V(e.priceId), F(null), U(!0), K(N), z(!0), L("");
		let n = G.current.get(e.priceId);
		n || (n = { requestId: crypto.randomUUID() }, G.current.set(e.priceId, n));
		try {
			let r = n.purchase ?? await se(e.priceId, n.requestId);
			t === J.current && (n.purchase = r, F(r), K(N));
		} catch (e) {
			t === J.current && (U(!1), L(e instanceof Error ? e.message : "Could not start checkout"));
		} finally {
			t === J.current && z(!1);
		}
	}, $ = v?.[0], Ce = _ && E === "packs", we = R || ge;
	return /* @__PURE__ */ (0, M.jsx)(d, {
		open: e,
		onOpenChange: i,
		children: /* @__PURE__ */ (0, M.jsxs)(o, {
			className: n("flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl", Ce && "h-[85vh]"),
			"aria-describedby": void 0,
			children: [
				/* @__PURE__ */ (0, M.jsx)(ee, {
					className: "shrink-0 border-b border-border px-6 py-5",
					children: /* @__PURE__ */ (0, M.jsx)(s, { children: E === "usage" ? "Usage" : "Checkout" })
				}),
				/* @__PURE__ */ (0, M.jsx)("div", {
					ref: q,
					"data-slot": "usage-body",
					className: n("min-h-0 overflow-y-auto overscroll-contain p-6", Ce && "flex-1"),
					onWheel: (e) => e.stopPropagation(),
					onTouchMove: (e) => e.stopPropagation(),
					children: _ && E === "packs" ? /* @__PURE__ */ (0, M.jsxs)("div", {
						className: "flex flex-col gap-4",
						children: [
							/* @__PURE__ */ (0, M.jsx)("p", {
								id: `${W}-label`,
								className: "text-sm font-medium",
								children: "Amount to add"
							}),
							O.length ? /* @__PURE__ */ (0, M.jsx)(re, {
								ref: ye,
								"aria-labelledby": `${W}-label`,
								value: B,
								disabled: R || he,
								onValueChange: (e) => {
									let t = O.find((t) => t.priceId === e);
									t && Se(t);
								},
								className: "gap-2 rounded-lg border p-2",
								children: O.map((e, t) => /* @__PURE__ */ (0, M.jsxs)("label", {
									htmlFor: `${W}-${t}`,
									className: `flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm focus-within:ring-2 focus-within:ring-ring ${B === e.priceId ? "border-primary ring-1 ring-primary" : "border-transparent"}`,
									children: [/* @__PURE__ */ (0, M.jsx)(ne, {
										id: `${W}-${t}`,
										value: e.priceId
									}), /* @__PURE__ */ (0, M.jsxs)("span", {
										className: "flex flex-wrap items-baseline gap-x-2 gap-y-1",
										children: [
											/* @__PURE__ */ (0, M.jsx)("span", {
												className: "font-semibold",
												children: new Intl.NumberFormat("en-US", {
													style: "currency",
													currency: e.currency
												}).format(e.amountMinor / 100)
											}),
											" ",
											/* @__PURE__ */ (0, M.jsxs)("span", {
												className: "text-muted-foreground",
												children: [
													"· ",
													A(e.credits),
													" credits"
												]
											})
										]
									})]
								}, e.priceId))
							}) : null,
							I ? /* @__PURE__ */ (0, M.jsx)(S, {
								variant: "destructive",
								children: /* @__PURE__ */ (0, M.jsxs)(x, { children: [I, /* @__PURE__ */ (0, M.jsx)(t, {
									type: "button",
									variant: "link",
									disabled: R,
									onClick: () => {
										let e = O.find((e) => e.priceId === B);
										e ? Se(e) : xe();
									},
									children: "Try again"
								})] })
							}) : null,
							we || P ? /* @__PURE__ */ (0, M.jsxs)("div", {
								className: "relative",
								"aria-busy": we,
								"data-slot": "checkout-frame",
								style: { height: _e },
								children: [P ? /* @__PURE__ */ (0, M.jsx)("iframe", {
									ref: ve,
									title: "AI credits secure checkout",
									src: P.checkoutUrl,
									allow: "payment",
									referrerPolicy: "no-referrer",
									className: "h-full w-full border-0"
								}, P.purchaseId) : null, we ? /* @__PURE__ */ (0, M.jsx)("div", {
									className: "absolute inset-0 bg-background",
									children: /* @__PURE__ */ (0, M.jsxs)("div", {
										role: "status",
										"aria-live": "polite",
										className: "flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground",
										children: [/* @__PURE__ */ (0, M.jsx)(oe, {
											"aria-hidden": "true",
											role: "presentation"
										}), /* @__PURE__ */ (0, M.jsx)("span", { children: B ? P ? "Loading payment form…" : "Preparing checkout…" : "Loading credit packs…" })]
									})
								}) : null]
							}) : null,
							!R && !O.length && !I ? /* @__PURE__ */ (0, M.jsx)("p", { children: "Usage packs are currently unavailable." }) : null
						]
					}) : _ ? /* @__PURE__ */ (0, M.jsxs)(p, {
						role: "region",
						"aria-label": "AI usage",
						className: "gap-6",
						children: [
							b ? /* @__PURE__ */ (0, M.jsx)(S, {
								variant: "destructive",
								children: /* @__PURE__ */ (0, M.jsxs)(x, { children: [/* @__PURE__ */ (0, M.jsx)("span", { children: b }), /* @__PURE__ */ (0, M.jsx)(t, {
									type: "button",
									variant: "link",
									onClick: () => void Q(),
									children: "Try again"
								})] })
							}) : null,
							!v && w ? /* @__PURE__ */ (0, M.jsx)("p", {
								role: "status",
								className: "text-sm text-muted-foreground",
								children: "Loading AI usage…"
							}) : null,
							v && !$ ? /* @__PURE__ */ (0, M.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No AI usage is available for this site."
							}) : null,
							$ ? /* @__PURE__ */ (0, M.jsx)(me, {
								license: $,
								onBuy: () => void xe()
							}, $.id) : null
						]
					}) : /* @__PURE__ */ (0, M.jsxs)("div", {
						className: "flex flex-col gap-6",
						children: [
							h && b ? /* @__PURE__ */ (0, M.jsx)(S, {
								variant: "destructive",
								children: /* @__PURE__ */ (0, M.jsx)(x, { children: b })
							}) : null,
							/* @__PURE__ */ (0, M.jsx)(ae, {
								title: "Activate AI features",
								help: "Activate your MapSVG license on this site to access AI features and your included AI usage.",
								hideDivider: !0,
								children: /* @__PURE__ */ (0, M.jsx)(de, { activationOnly: !0 })
							}),
							u(c.licenseProductSlug || c.plan) ? /* @__PURE__ */ (0, M.jsx)(pe, {}) : null
						]
					})
				}),
				/* @__PURE__ */ (0, M.jsxs)(f, {
					className: "shrink-0 border-t border-border px-6 py-4",
					children: [E === "usage" ? null : /* @__PURE__ */ (0, M.jsxs)(t, {
						type: "button",
						variant: "outline",
						onClick: () => be(),
						children: [/* @__PURE__ */ (0, M.jsx)(r, { className: "size-4" }), "Go back"]
					}), /* @__PURE__ */ (0, M.jsx)(t, {
						asChild: !0,
						variant: "outline",
						children: /* @__PURE__ */ (0, M.jsxs)("a", {
							href: c.dashboardUrl || "https://mapsvg.com/dashboard",
							target: "_blank",
							rel: "noreferrer",
							children: ["Open MapSVG Dashboard", /* @__PURE__ */ (0, M.jsx)(ie, { className: "size-3.5" })]
						})
					})]
				})
			]
		})
	});
}
//#endregion
export { pe as LiteEnrollmentForm, z as UsageDialog, fe as t };

//# sourceMappingURL=UsageDialog-DFyyd2_W.js.map