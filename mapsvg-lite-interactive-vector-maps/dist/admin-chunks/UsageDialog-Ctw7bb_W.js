import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Fr as t, Lr as n, Nr as r, Pr as i, bi as a, cr as o, dr as s, fr as c, hi as l, kt as u, mn as d, or as f, pn as p, ur as m } from "./admin-startup-DJLlIy1H.js";
import { l as h, n as g } from "./SettingsControlField-DCs3--PS.js";
import { n as ee, t as te } from "./radio-group-iWfHAx06.js";
import { i as _, n as v, r as y, t as b } from "./tabs-mg7k67Y-.js";
import { t as x } from "./chevron-down-B73pozMb.js";
import { t as S } from "./chevron-right-CU1G14ol.js";
import { t as ne } from "./external-link-c99FiEWw.js";
import { n as C, t as w } from "./alert-C_GgSvXo.js";
import { t as re } from "./SettingsSection-B17XCUbQ.js";
import { n as T, t as E } from "./card-86gi3m_T.js";
import { t as ie } from "./spinner-PS2GAoMY.js";
import { a as ae, c as oe, f as D, l as se, n as O, r as ce, t as le } from "./LicenseSettingsPage-CnlHe3FA.js";
var k = i("calendar-days", [
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
]), A = i("earth", [
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
]), j = /* @__PURE__ */ e(a(), 1);
function M(e) {
	return e.toLocaleString("en-US", { maximumFractionDigits: 4 });
}
var ue = {
	daily: "Daily usage",
	weekly: "Weekly usage",
	monthly: "Monthly usage",
	annual: "Annual usage"
};
function N(e) {
	let t = e?.periodKind, n = e?.allowance;
	if (!t || t === "single" || n == null || !Number.isFinite(n) || n <= 0) return null;
	let r = ue[t];
	return typeof r == "string" ? {
		kind: t,
		title: r,
		allowance: n
	} : null;
}
//#endregion
//#region src/lib/use-license-summary.ts
function P(e) {
	return window.addEventListener(O, e), () => window.removeEventListener(O, e);
}
function de() {
	return (0, j.useSyncExternalStore)(P, () => window.mapsvgReactAdminParams?.license ?? null);
}
//#endregion
//#region src/components/global-settings/UsageDialog.tsx
var F = l(), I = 1e3, L = (e, t) => Math.min(100, Math.max(0, t > 0 ? e / t * 100 : e > 0 ? 100 : 0)), R = (e) => new Date(e).toLocaleDateString("en-US", {
	month: "short",
	day: "numeric",
	year: "numeric",
	timeZone: "UTC"
});
function fe() {
	let e = (0, j.useId)(), [n, r] = (0, j.useState)(""), [i, a] = (0, j.useState)(!1), [o, s] = (0, j.useState)(!1), [c, l] = (0, j.useState)(""), [d, f] = (0, j.useState)(0), [p, m] = (0, j.useState)(Date.now()), h = Math.max(0, Math.ceil((d - p) / 1e3));
	return (0, j.useEffect)(() => {
		if (!d) return;
		let e = window.setInterval(() => m(Date.now()), 1e3);
		return () => window.clearInterval(e);
	}, [d]), /* @__PURE__ */ (0, F.jsx)(re, {
		title: "Free AI usage for MapSVG Lite",
		help: "A free Lite license includes a one-time grant of 10 AI credits that never expire. Verify your email to create a MapSVG Dashboard account and receive your license key.",
		children: /* @__PURE__ */ (0, F.jsxs)("form", {
			className: "flex flex-col gap-4",
			onSubmit: async (e) => {
				if (e.preventDefault(), !(i || h)) {
					a(!0), l("");
					try {
						let e = await D(n);
						s(!0);
						let t = Math.max(1, Math.min(3600, Number(e.retryAfter) || 60));
						f(Date.now() + t * 1e3), m(Date.now());
					} catch (e) {
						if (e instanceof ce && e.status === 429) {
							let t = Number(e.payload?.retryAfter) || 60;
							f(Date.now() + Math.max(1, Math.min(3600, t)) * 1e3), m(Date.now());
						}
						l(e instanceof Error ? e.message : "Could not request your license. Please try again.");
					} finally {
						a(!1);
					}
				}
			},
			children: [
				/* @__PURE__ */ (0, F.jsx)(g, {
					id: e,
					label: "Email",
					help: "We will email a confirmation link. After you confirm, your license key will be available in Dashboard and sent to your email.",
					children: /* @__PURE__ */ (0, F.jsx)(u, {
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
				o ? /* @__PURE__ */ (0, F.jsx)("p", {
					role: "status",
					className: "text-sm text-muted-foreground",
					children: "Check your email for the confirmation link. If a request can be processed for this address, we will send you an email."
				}) : null,
				c ? /* @__PURE__ */ (0, F.jsx)(w, {
					variant: "destructive",
					children: /* @__PURE__ */ (0, F.jsx)(C, { children: c })
				}) : null,
				/* @__PURE__ */ (0, F.jsx)("div", { children: /* @__PURE__ */ (0, F.jsx)(t, {
					type: "submit",
					variant: "outline",
					disabled: i || h > 0,
					children: i ? "Sending…" : h ? `Send again in ${h}s` : o ? "Send again" : "Send me a free license key"
				}) })
			]
		})
	});
}
function z({ license: e }) {
	return /* @__PURE__ */ (0, F.jsxs)("div", { children: [/* @__PURE__ */ (0, F.jsx)("p", {
		className: "pb-3 text-xs text-muted-foreground",
		children: "Last 3 months · Up to 30 active days · UTC"
	}), e.dailyUsage.length ? /* @__PURE__ */ (0, F.jsx)("ul", {
		className: "divide-y",
		"aria-label": "Daily AI usage",
		children: e.dailyUsage.map((e) => /* @__PURE__ */ (0, F.jsxs)("li", {
			className: "flex items-center justify-between gap-3 py-3 text-sm",
			children: [/* @__PURE__ */ (0, F.jsxs)("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ (0, F.jsx)(k, {
					className: "mt-0.5 size-4 text-muted-foreground",
					"aria-hidden": !0
				}), /* @__PURE__ */ (0, F.jsxs)("div", { children: [/* @__PURE__ */ (0, F.jsx)("time", {
					dateTime: e.date,
					children: R(`${e.date}T00:00:00Z`)
				}), /* @__PURE__ */ (0, F.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						e.calls.toLocaleString("en-US"),
						" ",
						e.calls === 1 ? "request" : "requests"
					]
				})] })]
			}), /* @__PURE__ */ (0, F.jsxs)("span", {
				className: "shrink-0 tabular-nums",
				children: [M(e.credits), " credits"]
			})]
		}, e.date))
	}) : /* @__PURE__ */ (0, F.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "No AI activity in the last 3 months."
	})] });
}
function B({ license: e }) {
	return /* @__PURE__ */ (0, F.jsx)("div", { children: e.siteUsage.length ? /* @__PURE__ */ (0, F.jsx)("ul", {
		className: "divide-y",
		"aria-label": "AI usage by site",
		children: e.siteUsage.map((e) => /* @__PURE__ */ (0, F.jsxs)("li", {
			className: "flex flex-wrap items-center justify-between gap-3 py-3 text-sm",
			children: [/* @__PURE__ */ (0, F.jsxs)("div", {
				className: "flex min-w-0 flex-1 items-start gap-3",
				children: [/* @__PURE__ */ (0, F.jsx)(A, {
					className: "mt-0.5 size-4 shrink-0 text-muted-foreground",
					"aria-hidden": !0
				}), /* @__PURE__ */ (0, F.jsxs)("div", {
					className: "min-w-0",
					children: [
						/* @__PURE__ */ (0, F.jsx)("p", {
							className: "break-all",
							children: e.siteUrl?.replace(/^https?:\/\//, "") ?? "Earlier or unattributed usage"
						}),
						/* @__PURE__ */ (0, F.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								e.calls.toLocaleString("en-US"),
								" ",
								e.calls === 1 ? "request" : "requests"
							]
						}),
						e.siteUrl ? null : /* @__PURE__ */ (0, F.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "This usage was recorded without a site breakdown."
						})
					]
				})]
			}), /* @__PURE__ */ (0, F.jsxs)("div", {
				className: "shrink-0 text-right tabular-nums",
				children: [/* @__PURE__ */ (0, F.jsxs)("p", { children: [M(e.credits), " credits"] }), e.pendingCredits > 0 ? /* @__PURE__ */ (0, F.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [M(e.pendingCredits), " credits reserved"]
				}) : null]
			})]
		}, e.siteUrl ?? "unattributed"))
	}) : /* @__PURE__ */ (0, F.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "No site activity to show yet."
	}) });
}
function pe({ license: e, onBuy: n }) {
	let [r, i] = (0, j.useState)(!1), a = e.numDomainsMax === 0 || e.numDomainsMax > 1, o = N(e), s = o ? L(e.used, o.allowance) : 0, c = s > 99 && s < 100 ? Math.floor(s * 100) / 100 : Math.round(s), l = o ? "Purchased credits" : "AI credits", u = o ? "Purchased credits used" : "AI credits used", d = Math.max(0, e.purchasedRemaining ?? 0), f = Math.max(0, e.purchasedTotal ?? d), p = Math.max(0, e.purchasedUsed ?? f - d), m = L(p, f);
	return /* @__PURE__ */ (0, F.jsxs)(F.Fragment, { children: [
		o ? /* @__PURE__ */ (0, F.jsx)(E, {
			role: "group",
			"aria-label": o.title,
			className: "shadow-none",
			children: /* @__PURE__ */ (0, F.jsxs)(T, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, F.jsx)("p", {
							className: "font-medium",
							children: o.title
						}), /* @__PURE__ */ (0, F.jsxs)("span", {
							className: "tabular-nums text-muted-foreground",
							children: [c, "% used"]
						})]
					}),
					/* @__PURE__ */ (0, F.jsx)("div", {
						role: "progressbar",
						"aria-label": "Plan usage",
						"aria-valuemin": 0,
						"aria-valuemax": 100,
						"aria-valuenow": s,
						className: "h-2 overflow-hidden rounded-full bg-muted",
						children: /* @__PURE__ */ (0, F.jsx)("div", {
							className: "h-full bg-primary transition-[width]",
							style: { width: `${s}%` }
						})
					}),
					e.expiresAt ? /* @__PURE__ */ (0, F.jsxs)("p", {
						className: "text-sm text-muted-foreground",
						children: [
							"Resets at ",
							R(e.expiresAt),
							" (UTC)"
						]
					}) : null
				]
			})
		}) : null,
		e.aiAvailable ? null : /* @__PURE__ */ (0, F.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "AI access is inactive for this license."
		}),
		/* @__PURE__ */ (0, F.jsx)(E, {
			role: "group",
			"aria-label": l,
			className: "shadow-none",
			children: /* @__PURE__ */ (0, F.jsxs)(T, {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, F.jsx)("p", {
							className: "font-medium",
							children: l
						}), /* @__PURE__ */ (0, F.jsxs)("span", {
							className: "tabular-nums text-muted-foreground",
							children: [
								M(p),
								" / ",
								M(f),
								" used"
							]
						})]
					}),
					/* @__PURE__ */ (0, F.jsx)("div", {
						role: "progressbar",
						"aria-label": u,
						"aria-valuemin": 0,
						"aria-valuemax": 100,
						"aria-valuenow": m,
						"aria-valuetext": `${M(p)} of ${M(f)} ${o ? "purchased credits" : "AI credits"} used`,
						className: "h-2 overflow-hidden rounded-full bg-muted",
						children: /* @__PURE__ */ (0, F.jsx)("div", {
							className: "h-full bg-primary transition-[width]",
							style: { width: `${m}%` }
						})
					}),
					/* @__PURE__ */ (0, F.jsxs)("div", {
						className: "flex flex-wrap items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, F.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, F.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No expiry"
							}), o ? /* @__PURE__ */ (0, F.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Used after your plan allowance"
							}) : null]
						}), /* @__PURE__ */ (0, F.jsx)(t, {
							type: "button",
							variant: "outline",
							onClick: n,
							children: "Buy AI credits"
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, F.jsxs)(t, {
			type: "button",
			variant: "link",
			className: "h-auto justify-start gap-1.5 p-0 has-[>svg]:px-0",
			onClick: () => i(!r),
			"aria-expanded": r,
			children: ["View usage", r ? /* @__PURE__ */ (0, F.jsx)(x, {
				className: "size-4",
				"aria-hidden": !0
			}) : /* @__PURE__ */ (0, F.jsx)(S, {
				className: "size-4",
				"aria-hidden": !0
			})]
		}),
		r ? /* @__PURE__ */ (0, F.jsx)(E, {
			role: "region",
			"aria-label": "AI usage details",
			children: /* @__PURE__ */ (0, F.jsxs)(T, { children: [o ? /* @__PURE__ */ (0, F.jsx)("p", {
				className: "mb-3 text-xs text-muted-foreground",
				children: "Usage includes credits covered by your plan."
			}) : null, a ? /* @__PURE__ */ (0, F.jsxs)(b, {
				defaultValue: "sites",
				children: [
					/* @__PURE__ */ (0, F.jsxs)(y, {
						className: "mb-3 grid grid-cols-2",
						children: [/* @__PURE__ */ (0, F.jsx)(_, {
							value: "sites",
							children: "Usage by site"
						}), /* @__PURE__ */ (0, F.jsx)(_, {
							value: "daily",
							children: "Recent usage"
						})]
					}),
					/* @__PURE__ */ (0, F.jsx)(v, {
						value: "sites",
						children: /* @__PURE__ */ (0, F.jsx)(B, { license: e })
					}),
					/* @__PURE__ */ (0, F.jsx)(v, {
						value: "daily",
						children: /* @__PURE__ */ (0, F.jsx)(z, { license: e })
					})
				]
			}) : /* @__PURE__ */ (0, F.jsx)(z, { license: e })] })
		}) : null
	] });
}
function V({ open: e, onOpenChange: i, initialScreen: a = "usage" }) {
	let l = p(), u = de(), g = !!(u?.hasCode && u.ok), [_, v] = (0, j.useState)(!1), y = g && !_, [b, x] = (0, j.useState)(null), [S, T] = (0, j.useState)(""), [E, D] = (0, j.useState)(!1), [O, k] = (0, j.useState)("usage"), [A, ue] = (0, j.useState)([]), [N, P] = (0, j.useState)(null), [L, R] = (0, j.useState)(""), [z, B] = (0, j.useState)(!1), [V, H] = (0, j.useState)(""), [me, U] = (0, j.useState)(!1), [he, W] = (0, j.useState)(!1), G = (0, j.useId)(), K = (0, j.useRef)(/* @__PURE__ */ new Map()), [ge, q] = (0, j.useState)(I), _e = (0, j.useRef)(null), ve = (0, j.useRef)(null), ye = (0, j.useRef)(null), J = (0, j.useRef)(0), Y = (0, j.useRef)(0), X = (0, j.useRef)(null), Z = (0, j.useRef)(!1), Q = (0, j.useCallback)(async () => {
		if (X.current !== null) return;
		let e = Z.current, t = ++Y.current;
		X.current = t, D(!0), T("");
		try {
			let n = await se();
			t === Y.current && (v(!1), x(n.licenses), window.dispatchEvent(new CustomEvent("mapsvg:ai-usage-updated", { detail: {
				licenses: n.licenses,
				...e ? { purchaseCompleted: !0 } : {}
			} })), e && (Z.current = !1));
		} catch (e) {
			t === Y.current && (T(e instanceof Error ? e.message : "Could not load AI usage."), e instanceof ce && e.payload?.code === "activation_required" && (v(!0), x(null), Z.current = !1));
		} finally {
			X.current === t && (X.current = null), t === Y.current && D(!1), t === Y.current && Z.current && !e && Q();
		}
	}, []);
	(0, j.useEffect)(() => (x(null), T(""), v(!1), k("usage"), P(null), ue([]), H(""), R(""), B(!1), U(!1), W(!1), K.current.clear(), Z.current = !1, J.current++, e && g ? Q() : D(!1), () => {
		Y.current += 1, J.current++, X.current = null;
	}), [
		e,
		g,
		u,
		Q
	]), (0, j.useEffect)(() => {
		if (!e || !y) return;
		let t = window.setInterval(() => void Q(), 3e4);
		return () => window.clearInterval(t);
	}, [
		e,
		y,
		Q
	]);
	let be = (0, j.useCallback)((e = !1) => {
		e && (Z.current = !0), J.current++, k("usage"), P(null), R(""), B(!1), U(!1), W(!1), H(""), K.current.clear(), Q();
	}, [Q]);
	(0, j.useEffect)(() => {
		if (!e || !N) return;
		let t = (e) => {
			e.origin !== new URL(N.checkoutUrl).origin || e.source !== _e.current?.contentWindow || e.data?.purchaseId !== N.purchaseId || (e.data?.type === "mapsvg:ai-credit-purchase" && (e.data.status === "fulfilled" ? be(!0) : e.data.status === "processing" ? U(!0) : e.data.status === "ready" || e.data.status === "error" ? (U(!1), W(!1)) : e.data.status === "loaded" && (W(!1), ye.current?.querySelector("[aria-checked=\"true\"]")?.focus({ preventScroll: !0 }), ve.current && (ve.current.scrollTop = 0))), e.data?.type === "mapsvg:ai-credit-checkout-height" && Number.isFinite(e.data.height) && q(Math.max(300, Math.min(1600, e.data.height))));
		};
		return window.addEventListener("message", t), () => window.removeEventListener("message", t);
	}, [
		e,
		N,
		be
	]);
	let xe = async () => {
		let e = ++J.current;
		k("packs"), P(null), H(""), U(!1), W(!1), q(I), B(!0), R("");
		try {
			let t = await oe();
			e === J.current && (ue(t.packs), t.packs[0] && Se(t.packs[0]));
		} catch (t) {
			e === J.current && R(t instanceof Error ? t.message : "Could not load usage packs");
		} finally {
			e === J.current && B(!1);
		}
	};
	(0, j.useEffect)(() => {
		e && y && a === "packs" && xe();
	}, [
		e,
		y,
		a
	]);
	let Se = async (e) => {
		if (me) return;
		let t = ++J.current;
		H(e.priceId), P(null), W(!0), q(I), B(!0), R("");
		let n = K.current.get(e.priceId);
		n || (n = { requestId: crypto.randomUUID() }, K.current.set(e.priceId, n));
		try {
			let r = n.purchase ?? await ae(e.priceId, n.requestId);
			t === J.current && (n.purchase = r, P(r), q(I));
		} catch (e) {
			t === J.current && (W(!1), R(e instanceof Error ? e.message : "Could not start checkout"));
		} finally {
			t === J.current && B(!1);
		}
	}, $ = b?.[0], Ce = y && O === "packs", we = z || he;
	return /* @__PURE__ */ (0, F.jsx)(f, {
		open: e,
		onOpenChange: i,
		children: /* @__PURE__ */ (0, F.jsxs)(o, {
			className: n("flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl", Ce && "h-[85vh]"),
			"aria-describedby": void 0,
			children: [
				/* @__PURE__ */ (0, F.jsx)(s, {
					className: "shrink-0 border-b border-border px-6 py-5",
					children: /* @__PURE__ */ (0, F.jsx)(c, { children: O === "usage" ? "Usage" : "Checkout" })
				}),
				/* @__PURE__ */ (0, F.jsx)("div", {
					ref: ve,
					"data-slot": "usage-body",
					className: n("min-h-0 overflow-y-auto overscroll-contain p-6", Ce && "flex-1"),
					onWheel: (e) => e.stopPropagation(),
					onTouchMove: (e) => e.stopPropagation(),
					children: y && O === "packs" ? /* @__PURE__ */ (0, F.jsxs)("div", {
						className: "flex flex-col gap-4",
						children: [
							/* @__PURE__ */ (0, F.jsx)("p", {
								id: `${G}-label`,
								className: "text-sm font-medium",
								children: "Amount to add"
							}),
							A.length ? /* @__PURE__ */ (0, F.jsx)(te, {
								ref: ye,
								"aria-labelledby": `${G}-label`,
								value: V,
								disabled: z || me,
								onValueChange: (e) => {
									let t = A.find((t) => t.priceId === e);
									t && Se(t);
								},
								className: "gap-2 rounded-lg border p-2",
								children: A.map((e, t) => /* @__PURE__ */ (0, F.jsxs)("label", {
									htmlFor: `${G}-${t}`,
									className: `flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm focus-within:ring-2 focus-within:ring-ring ${V === e.priceId ? "border-primary ring-1 ring-primary" : "border-transparent"}`,
									children: [/* @__PURE__ */ (0, F.jsx)(ee, {
										id: `${G}-${t}`,
										value: e.priceId
									}), /* @__PURE__ */ (0, F.jsxs)("span", {
										className: "flex flex-wrap items-baseline gap-x-2 gap-y-1",
										children: [
											/* @__PURE__ */ (0, F.jsx)("span", {
												className: "font-semibold",
												children: new Intl.NumberFormat("en-US", {
													style: "currency",
													currency: e.currency
												}).format(e.amountMinor / 100)
											}),
											" ",
											/* @__PURE__ */ (0, F.jsxs)("span", {
												className: "text-muted-foreground",
												children: [
													"· ",
													M(e.credits),
													" credits"
												]
											})
										]
									})]
								}, e.priceId))
							}) : null,
							L ? /* @__PURE__ */ (0, F.jsx)(w, {
								variant: "destructive",
								children: /* @__PURE__ */ (0, F.jsxs)(C, { children: [L, /* @__PURE__ */ (0, F.jsx)(t, {
									type: "button",
									variant: "link",
									disabled: z,
									onClick: () => {
										let e = A.find((e) => e.priceId === V);
										e ? Se(e) : xe();
									},
									children: "Try again"
								})] })
							}) : null,
							we || N ? /* @__PURE__ */ (0, F.jsxs)("div", {
								className: "relative",
								"aria-busy": we,
								"data-slot": "checkout-frame",
								style: { height: ge },
								children: [N ? /* @__PURE__ */ (0, F.jsx)("iframe", {
									ref: _e,
									title: "AI credits secure checkout",
									src: N.checkoutUrl,
									allow: "payment",
									referrerPolicy: "no-referrer",
									className: "h-full w-full border-0"
								}, N.purchaseId) : null, we ? /* @__PURE__ */ (0, F.jsx)("div", {
									className: "absolute inset-0 bg-background",
									children: /* @__PURE__ */ (0, F.jsxs)("div", {
										role: "status",
										"aria-live": "polite",
										className: "flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground",
										children: [/* @__PURE__ */ (0, F.jsx)(ie, {
											"aria-hidden": "true",
											role: "presentation"
										}), /* @__PURE__ */ (0, F.jsx)("span", { children: V ? N ? "Loading payment form…" : "Preparing checkout…" : "Loading credit packs…" })]
									})
								}) : null]
							}) : null,
							!z && !A.length && !L ? /* @__PURE__ */ (0, F.jsx)("p", { children: "Usage packs are currently unavailable." }) : null
						]
					}) : y ? /* @__PURE__ */ (0, F.jsxs)(h, {
						role: "region",
						"aria-label": "AI usage",
						className: "gap-6",
						children: [
							S ? /* @__PURE__ */ (0, F.jsx)(w, {
								variant: "destructive",
								children: /* @__PURE__ */ (0, F.jsxs)(C, { children: [/* @__PURE__ */ (0, F.jsx)("span", { children: S }), /* @__PURE__ */ (0, F.jsx)(t, {
									type: "button",
									variant: "link",
									onClick: () => void Q(),
									children: "Try again"
								})] })
							}) : null,
							!b && E ? /* @__PURE__ */ (0, F.jsx)("p", {
								role: "status",
								className: "text-sm text-muted-foreground",
								children: "Loading AI usage…"
							}) : null,
							b && !$ ? /* @__PURE__ */ (0, F.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No AI usage is available for this site."
							}) : null,
							$ ? /* @__PURE__ */ (0, F.jsx)(pe, {
								license: $,
								onBuy: () => void xe()
							}, $.id) : null
						]
					}) : /* @__PURE__ */ (0, F.jsxs)("div", {
						className: "flex flex-col gap-6",
						children: [
							_ && S ? /* @__PURE__ */ (0, F.jsx)(w, {
								variant: "destructive",
								children: /* @__PURE__ */ (0, F.jsx)(C, { children: S })
							}) : null,
							/* @__PURE__ */ (0, F.jsx)(re, {
								title: "Activate AI features",
								help: "Activate your MapSVG license on this site to access AI features and your included AI usage.",
								hideDivider: !0,
								children: /* @__PURE__ */ (0, F.jsx)(le, { activationOnly: !0 })
							}),
							d(l.licenseProductSlug || l.plan) ? /* @__PURE__ */ (0, F.jsx)(fe, {}) : null
						]
					})
				}),
				/* @__PURE__ */ (0, F.jsxs)(m, {
					className: "shrink-0 border-t border-border px-6 py-4",
					children: [O === "usage" ? null : /* @__PURE__ */ (0, F.jsxs)(t, {
						type: "button",
						variant: "outline",
						onClick: () => be(),
						children: [/* @__PURE__ */ (0, F.jsx)(r, { className: "size-4" }), "Go back"]
					}), /* @__PURE__ */ (0, F.jsx)(t, {
						asChild: !0,
						variant: "outline",
						children: /* @__PURE__ */ (0, F.jsxs)("a", {
							href: l.dashboardUrl || "https://mapsvg.com/dashboard",
							target: "_blank",
							rel: "noreferrer",
							children: ["Open MapSVG Dashboard", /* @__PURE__ */ (0, F.jsx)(ne, { className: "size-3.5" })]
						})
					})]
				})
			]
		})
	});
}
//#endregion
export { fe as LiteEnrollmentForm, V as UsageDialog, de as t };

//# sourceMappingURL=UsageDialog-Ctw7bb_W.js.map