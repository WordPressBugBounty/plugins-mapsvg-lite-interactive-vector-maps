import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Fr as t, Lr as n, Mr as r, Nr as i, Pr as a, bi as o, cr as s, dr as ee, fn as c, fr as te, gr as ne, hi as l, hr as u, kt as re, mn as ie, or as ae, pn as oe, ur as se, vi as ce } from "./admin-startup-DaxvU-L8.js";
import { n as le, r as ue, t as de } from "./collapsible-taNtsly_.js";
import { n as fe, t as pe } from "./radio-group-BHn-W8Or.js";
import { t as me } from "./chevron-right-6Y_3kTu1.js";
import { t as he } from "./external-link-Cht-Pr0M.js";
import { t as ge } from "./upload-CvuY2M11.js";
import { n as d, t as f } from "./alert-CIXnjER7.js";
import { t as _e } from "./SettingsSection-CBGP9ic5.js";
import { t as ve } from "./spinner-DLGk-l9_.js";
import { l as ye, r as p, t as be } from "./LicenseSettingsPage-D-exq0Xn.js";
import { LiteEnrollmentForm as xe, t as Se } from "./UsageDialog-DJElxgEQ.js";
var Ce = a("download", [
	["path", {
		d: "M12 15V3",
		key: "m9g1x1"
	}],
	["path", {
		d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",
		key: "ih7n3h"
	}],
	["path", {
		d: "m7 10 5 5 5-5",
		key: "brsn70"
	}]
]), we = a("globe", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20",
		key: "13o1zl"
	}],
	["path", {
		d: "M2 12h20",
		key: "9i4pu4"
	}]
]), Te = a("sparkles", [
	["path", {
		d: "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z",
		key: "1s2grr"
	}],
	["path", {
		d: "M20 2v4",
		key: "1rf3ol"
	}],
	["path", {
		d: "M22 4h-4",
		key: "gwowj6"
	}],
	["circle", {
		cx: "4",
		cy: "20",
		r: "2",
		key: "6kqj1y"
	}]
]), m = /* @__PURE__ */ e(o(), 1), h = l();
function Ee({ checkoutUrl: e, frame: t, onNavigationStart: n }) {
	return (0, m.useEffect)(() => {
		let r = t.current;
		if (!r) return;
		let i = !1, a = 0, o = Date.now() + 1e4, s = () => {
			if (!(i || t.current !== r)) {
				if (!r.isConnected) {
					Date.now() < o && (a = window.requestAnimationFrame(s));
					return;
				}
				n(), r.src = e;
			}
		};
		return a = window.requestAnimationFrame(s), () => {
			i = !0, window.cancelAnimationFrame(a);
		};
	}, [
		e,
		t,
		n
	]), /* @__PURE__ */ (0, h.jsx)("iframe", {
		ref: t,
		title: "MapSVG upgrade secure checkout",
		allow: "payment",
		loading: "eager",
		referrerPolicy: "no-referrer",
		className: "h-full w-full border-0",
		onLoad: n
	});
}
//#endregion
//#region src/components/global-settings/UpgradeCelebration.tsx
var g = /* @__PURE__ */ e(ce(), 1), _ = [
	"#f59e0b",
	"#ec4899",
	"#8b5cf6",
	"#3b82f6",
	"#22c55e",
	"#ef4444"
];
function De() {
	let e = (0, m.useRef)(null), t = (0, m.useRef)(null), n = u(), [r, i] = (0, m.useState)(0);
	return (0, m.useEffect)(() => {
		let e = (e) => {
			e.code !== "KeyC" || !e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey || e.repeat || (e.preventDefault(), e.stopPropagation(), i((e) => e + 1));
		};
		return window.addEventListener("keydown", e, !0), () => window.removeEventListener("keydown", e, !0);
	}, []), (0, m.useEffect)(() => {
		let n = t.current, r = e.current;
		if (!n || !r || !Element.prototype.animate) return;
		let i = window.matchMedia?.("(prefers-reduced-motion: reduce)");
		if (i?.matches) return;
		let a = [], o = () => {
			a.forEach((e) => e.cancel()), n.replaceChildren();
		}, s = () => {
			i?.matches && o();
		};
		i?.addEventListener("change", s);
		let ee = window.setTimeout(() => {
			let e = r.getBoundingClientRect(), t = n.getBoundingClientRect(), o = e.left + e.width / 2 - t.left, s = e.top + e.height / 2 - t.top;
			if (!i?.matches) for (let e = 0; e < 64; e++) {
				let r = document.createElement("span"), i = 2800 + Math.random() * 1200, ee = (Math.random() - .5) * t.width * 1.25, c = -t.height * (.4 + Math.random() * .35), te = Math.random() * 360, ne = (Math.random() - .5) * 1440;
				Object.assign(r.style, {
					position: "absolute",
					left: "0",
					top: "0",
					width: "6px",
					height: "10px",
					borderRadius: e % 3 == 0 ? "50%" : "1px",
					backgroundColor: _[e % _.length]
				}), n.appendChild(r);
				let l = Array.from({ length: 25 }, (e, n) => {
					let r = n / 24, a = r * i / 1e3;
					return {
						offset: r,
						transform: `translate3d(${o + ee * a * .55}px, ${s + c * a + .5 * t.height * .85 * a ** 2}px, 0) rotate(${te + ne * r}deg) rotateY(${r * 720}deg)`,
						opacity: r > .8 ? (1 - r) / .2 : 1
					};
				}), u = r.animate(l, {
					duration: i,
					easing: "linear",
					fill: "both"
				});
				a.push(u), u.finished.then(() => r.remove(), () => {});
			}
		}, 220);
		return () => {
			window.clearTimeout(ee), i?.removeEventListener("change", s), o();
		};
	}, [n, r]), /* @__PURE__ */ (0, h.jsxs)(h.Fragment, { children: [/* @__PURE__ */ (0, h.jsx)("span", {
		ref: e,
		"aria-hidden": "true",
		className: "block text-[32px] leading-8",
		children: "🎉"
	}), (0, g.createPortal)(/* @__PURE__ */ (0, h.jsx)("div", {
		ref: t,
		"aria-hidden": "true",
		"data-slot": "upgrade-confetti",
		className: "pointer-events-none fixed inset-0 z-[60] overflow-hidden"
	}), n ?? document.body)] });
}
//#endregion
//#region src/lib/license-upgrade-api.ts
async function v(e, t, n = 2e4) {
	let r = oe(), i = new AbortController(), a = window.setTimeout(() => i.abort(), n);
	try {
		let n = await c(`${r.apiUrl.replace(/\/?$/, "")}/license-upgrades${e}`, {
			method: t === void 0 ? "GET" : "POST",
			credentials: "same-origin",
			cache: "no-store",
			signal: i.signal,
			headers: {
				Accept: "application/json",
				"X-WP-Nonce": r.nonce,
				...t === void 0 ? {} : { "Content-Type": "application/json" }
			},
			...t === void 0 ? {} : { body: JSON.stringify(t) }
		}), a = await n.json().catch(() => null);
		if (!n.ok) throw new p(a?.error || a?.message || "Could not complete the upgrade. Please try again.", n.status, a);
		if (!a || typeof a != "object") throw Error("MapSVG returned an invalid upgrade response.");
		return a;
	} finally {
		window.clearTimeout(a);
	}
}
var Oe = () => v("/plans"), ke = (e, t) => v("/purchases", {
	priceId: e,
	requestId: t
}), Ae = (e) => v(`/purchases/${encodeURIComponent(e)}`);
async function je(e, t) {
	let n = oe(), r = new FormData();
	r.append("purchaseId", e), r.append("pluginZip", t, t.name);
	let i = new AbortController(), a = window.setTimeout(() => i.abort(), 18e4);
	try {
		let e = await c(`${n.apiUrl.replace(/\/?$/, "")}/license-upgrades/install-upload`, {
			method: "POST",
			credentials: "same-origin",
			cache: "no-store",
			body: r,
			signal: i.signal,
			headers: {
				Accept: "application/json",
				"X-WP-Nonce": n.nonce
			}
		}), t = await e.json().catch(() => null);
		if (!e.ok) throw new p(t?.error || t?.message || "Could not install your uploaded ZIP. Try again or upload it from WordPress Plugins.", e.status, t);
		if (!t || typeof t != "object") throw Error("WordPress returned an invalid installation response.");
		return t;
	} finally {
		window.clearTimeout(a);
	}
}
//#endregion
//#region src/components/global-settings/UpgradeDialog.tsx
var Me = 1e3, Ne = 12e4, y = {
	"mapsvg-personal": "MapSVG Personal",
	"mapsvg-professional": "MapSVG Professional",
	"mapsvg-business": "MapSVG Business"
}, Pe = {
	"mapsvg-personal": "Standard AI usage",
	"mapsvg-professional": "x3 AI usage",
	"mapsvg-business": "x5 AI usage"
}, Fe = /* @__PURE__ */ new Set(["upgrade_purchase_superseded", "upgrade_purchase_canceled"]), Ie = class extends Error {};
function Le(e) {
	if (!(e instanceof p)) return;
	let t = e.payload?.code ?? e.payload?.data?.code;
	return typeof t == "string" ? t : void 0;
}
function Re(e) {
	let t = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: e.currency
	}).format(e.amountMinor / 100), n = e.billingCycle;
	return `${t}${n ? ` / ${n.frequency > 1 ? `${n.frequency} ${n.interval}s` : n.interval}` : " one-time"}`;
}
function ze(e) {
	if (typeof e != "string" || !e) return null;
	try {
		let t = new URL(e, window.location.href);
		return t.origin === window.location.origin && ["http:", "https:"].includes(t.protocol) ? t.href : null;
	} catch {
		return null;
	}
}
function Be({ open: e, onOpenChange: a, onReloadEditor: o }) {
	let c = oe(), l = Se(), u = !!(l?.hasCode && l.ok), [ce, g] = (0, m.useState)(!1), _ = u && !ce, [v, Be] = (0, m.useState)(null), [b, Ve] = (0, m.useState)(!1), [He, x] = (0, m.useState)(""), [S, Ue] = (0, m.useState)(null), [We, Ge] = (0, m.useState)(null), [C, Ke] = (0, m.useState)(""), [w, T] = (0, m.useState)(!1), [qe, E] = (0, m.useState)(!1), [Je, Ye] = (0, m.useState)(Me), [D, O] = (0, m.useState)("checkout"), [Xe, k] = (0, m.useState)(""), [A, Ze] = (0, m.useState)(null), [Qe, $e] = (0, m.useState)(""), [et, tt] = (0, m.useState)(""), [j, M] = (0, m.useState)(null), [nt, N] = (0, m.useState)(""), [P, F] = (0, m.useState)("idle"), [rt, I] = (0, m.useState)(!1), it = (0, m.useRef)(null), L = (0, m.useRef)(!1), R = (0, m.useRef)(!1), at = (0, m.useRef)(null), ot = (0, m.useRef)(o);
	ot.current = o;
	let st = (0, m.useId)(), ct = `mapsvg-upgrade-download-${st.replace(/[^a-zA-Z0-9_-]/g, "")}`, lt = (0, m.useRef)(null), ut = (0, m.useRef)(null), z = (0, m.useRef)(null), dt = (0, m.useRef)(null), B = (0, m.useRef)(0), V = (0, m.useRef)(0), H = (0, m.useRef)(e);
	H.current = e;
	let U = (0, m.useRef)(!1), ft = (0, m.useRef)(/* @__PURE__ */ new Set()), W = (0, m.useRef)(null), pt = (0, m.useRef)(async () => {}), G = (0, m.useCallback)(() => {
		z.current && (z.current.scrollTop = 0);
	}, []);
	(0, m.useEffect)(() => {
		if (!e || !b && !w) return;
		G();
		let t = window.requestAnimationFrame(G);
		return () => window.cancelAnimationFrame(t);
	}, [
		e,
		b,
		w,
		C,
		S?.purchaseId,
		G
	]);
	let K = (0, m.useCallback)((e) => {
		W.current = null, Ue(null), Ge(null), E(!1), T(!1), O("checkout"), x(e);
	}, []), mt = (0, m.useCallback)((e) => {
		U.current = !0, $e(e.slug || ""), Ze(ze(e.manualDownloadUrl)), e.accountEmail && tt(e.accountEmail), E(!1), T(!1), k(""), O("complete"), at.current?.purchaseId === e.purchaseId && at.current.slug === e.slug && F("installed"), z.current && (z.current.scrollTop = 0), ft.current.has(e.purchaseId) || (ft.current.add(e.purchaseId), ye().then((e) => {
			window.dispatchEvent(new CustomEvent("mapsvg:ai-usage-updated", { detail: {
				licenses: e.licenses,
				purchaseCompleted: !0
			} }));
		}).catch(() => {}));
	}, []), q = (0, m.useCallback)(async (e) => {
		if (U.current) return;
		let t = B.current, n = ++V.current, r = W.current;
		if (Ke(e.priceId), Ue(null), Ge(null), x(""), e.updateRequired) {
			T(!1);
			return;
		}
		T(!0), Ye(Me), x(""), W.current?.priceId !== e.priceId && (W.current = {
			priceId: e.priceId,
			requestId: crypto.randomUUID()
		});
		let i = W.current.requestId;
		try {
			let r = await ke(e.priceId, i);
			H.current && t === B.current && n === V.current && (W.current?.requestId === i && (W.current.purchase = r), Ue(r));
		} catch (e) {
			if (H.current && t === B.current && n === V.current) {
				let t = Le(e);
				if (t && Fe.has(t) && (W.current = null), t === "upgrade_license_changed" || t === "upgrade_lite_update_required") {
					W.current = null, pt.current();
					return;
				}
				if (t === "upgrade_payment_processing") {
					E(!0);
					let t = e instanceof p ? e.payload?.purchaseId : null, n = typeof t == "string" ? t : r?.purchase?.purchaseId;
					if (n) {
						W.current = r, Ge(n), O("confirming"), T(!1);
						return;
					}
				}
				T(!1), x(e instanceof Error ? e.message : "Could not prepare checkout.");
			}
		}
	}, []), ht = (0, m.useCallback)(async () => {
		let e = ++B.current;
		V.current++, Ve(!0), x("");
		try {
			let t = await Oe();
			if (!H.current || e !== B.current) return;
			Be(t), tt(t.accountEmail || ""), g(!1), t.installation ? O("confirming") : t.plans[0] && q(t.plans[0]);
		} catch (t) {
			H.current && e === B.current && (t instanceof p && t.payload?.code === "activation_required" && g(!0), x(t instanceof Error ? t.message : "Could not load upgrade plans."));
		} finally {
			H.current && e === B.current && Ve(!1);
		}
	}, [q]);
	pt.current = ht, (0, m.useEffect)(() => (Be(null), g(!1), Ue(null), Ge(null), Ke(""), T(!1), E(!1), Ye(Me), O("checkout"), x(""), k(""), Ze(null), $e(""), M(null), N(""), F("idle"), I(!1), L.current = !1, R.current = !1, U.current = !1, tt(""), W.current = null, e && u ? ht() : Ve(!1), () => {
		B.current++, V.current++;
	}), [
		e,
		u,
		l,
		ht
	]);
	let J = We ?? S?.purchaseId ?? v?.installation?.purchaseId;
	(0, m.useEffect)(() => {
		if (!e || !_ || !J || D === "verification-error" || D === "complete") return;
		let t = B.current, n = V.current, r = !1, i = !1, a = 0, o = async () => {
			if (!(r || i)) {
				i = !0;
				try {
					let e = await Ae(J);
					if (r || t !== B.current || n !== V.current) return;
					if (e.purchaseId !== J || e.licenseId !== v?.license.id) throw new Ie("This purchase does not match the activated license.");
					if (a = 0, e.status === "fulfilled") mt(e);
					else if (["superseded", "canceled"].includes(e.status)) r = !0, K("This checkout is no longer available. Choose your plan or try again to open a new checkout.");
					else if (e.status === "processing") E(!0);
					else if (!["ready", "creating"].includes(e.status)) throw new Ie("This checkout is no longer available. Your paid license, if completed, remains in Dashboard.");
				} catch (e) {
					if (r || t !== B.current || n !== V.current) return;
					let i = Le(e);
					if (i && Fe.has(i)) {
						r = !0, K(e instanceof Error ? e.message : "This checkout is no longer available.");
						return;
					}
					a++, (a >= 6 || e instanceof Ie || e instanceof p && [
						400,
						401,
						403,
						404,
						410
					].includes(e.status)) && (r = !0, O("verification-error"), T(!1), k(e instanceof Error ? e.message : "Could not check your payment. Retry without starting another purchase."));
				} finally {
					i = !1;
				}
			}
		};
		o();
		let s = window.setInterval(() => void o(), 2500);
		return () => {
			r = !0, window.clearInterval(s);
		};
	}, [
		e,
		_,
		J,
		D,
		v?.license.id,
		mt,
		K
	]), (0, m.useEffect)(() => {
		if (!e || !S) return;
		let t = (e) => {
			e.origin !== new URL(S.checkoutUrl).origin || e.source !== ut.current?.contentWindow || e.data?.purchaseId !== S.purchaseId || (e.data.type === "mapsvg:license-upgrade-checkout-height" && Number.isFinite(e.data.height) && Ye(Math.max(300, Math.min(1600, e.data.height))), e.data.type === "mapsvg:license-upgrade-purchase" && D === "checkout" && (e.data.status === "loaded" ? (T(!1), dt.current?.querySelector("[aria-checked=\"true\"]")?.focus({ preventScroll: !0 }), z.current && (z.current.scrollTop = 0)) : [
				"processing",
				"paid",
				"fulfilled"
			].includes(e.data.status) ? (E(!0), (e.data.status === "paid" || e.data.status === "fulfilled") && O("confirming")) : e.data.status === "ready" || e.data.status === "error" ? (E(!1), T(!1)) : ["superseded", "canceled"].includes(e.data.status) && K("This checkout is no longer available. Choose your plan or try again to open a new checkout.")));
		};
		return window.addEventListener("message", t), () => window.removeEventListener("message", t);
	}, [
		e,
		S,
		D,
		K
	]), (0, m.useEffect)(() => {
		if (!e || D !== "confirming") return;
		let t = window.setTimeout(() => {
			O("verification-error"), T(!1), k("Payment confirmation is taking longer than expected. Check its status without starting another purchase.");
		}, Ne);
		return () => window.clearTimeout(t);
	}, [
		e,
		D,
		J
	]);
	let gt = v?.uploadMaxBytes && v.uploadMaxBytes > 0 ? v.uploadMaxBytes : 50 * 1024 * 1024, _t = (e) => {
		if (L.current || P === "installed" || P === "reloading") return;
		if (M(null), N(""), e.length !== 1) {
			N("Choose one plugin ZIP file.");
			return;
		}
		let t = e[0];
		if (!/\.zip$/i.test(t.name)) {
			N("Choose a plugin file in .zip format.");
			return;
		}
		if (!t.size) {
			N("This ZIP file is empty. Choose the downloaded plugin ZIP.");
			return;
		}
		if (t.size > gt) {
			N(`This ZIP is too large. The upload limit is ${Math.round(gt / 1024 / 1024 * 10) / 10} MB.`);
			return;
		}
		M(t);
	}, vt = async () => {
		if (!j || !J || !U.current || L.current) return;
		let e = B.current;
		L.current = !0, N(""), F("installing");
		try {
			let t = await je(J, j);
			if (!H.current || e !== B.current) return;
			if (t.installed !== !0 || t.reloadRequired !== !0 || t.slug !== Qe) throw Error("WordPress did not confirm installation of your purchased plan. Retry or upload the ZIP from WordPress Plugins.");
			at.current = {
				purchaseId: J,
				slug: t.slug
			}, F("installed");
		} catch (t) {
			H.current && e === B.current && (F("idle"), N(t instanceof Error ? t.message : "Could not install the uploaded ZIP. Try again or use WordPress Plugins → Add New Plugin → Upload Plugin."));
		} finally {
			L.current = !1;
		}
	}, yt = async () => {
		if (!ot.current || P !== "installed" || R.current) return;
		R.current = !0;
		let e = B.current;
		N(""), F("reloading");
		try {
			await ot.current(), H.current && e === B.current && F("installed");
		} catch (t) {
			H.current && e === B.current && (F("installed"), N(t instanceof Error ? t.message : "Could not save your workspace before reloading. Save your changes and try again."));
		} finally {
			R.current = !1;
		}
	}, Y = P === "installed" || P === "reloading", X = P === "installing" || P === "reloading";
	(0, m.useEffect)(() => {
		if (!e || D !== "complete") return;
		let t = (e) => {
			Array.from(e.dataTransfer?.types || []).includes("Files") && e.preventDefault();
		};
		return window.addEventListener("dragover", t), window.addEventListener("drop", t), () => {
			window.removeEventListener("dragover", t), window.removeEventListener("drop", t);
		};
	}, [e, D]);
	let Z = e && (D === "confirming" || X);
	(0, m.useLayoutEffect)(() => {
		if (!Z) return;
		let e = [], t = lt.current;
		for (; t && t !== document.body;) {
			let n = t.parentNode;
			if (!(n instanceof Element || n instanceof ShadowRoot)) break;
			for (let r of n.children) r === t || r.hasAttribute("inert") || (r.setAttribute("inert", ""), e.push(() => r.removeAttribute("inert")));
			t = n instanceof ShadowRoot ? n.host : n;
		}
		let n = (e) => {
			e.preventDefault(), e.stopImmediatePropagation();
		}, r = [
			"click",
			"auxclick",
			"dblclick",
			"pointerdown",
			"keydown",
			"submit"
		];
		for (let e of r) window.addEventListener(e, n, !0);
		return lt.current?.focus({ preventScroll: !0 }), () => {
			for (let e of r) window.removeEventListener(e, n, !0);
			for (let t of e.reverse()) t();
		};
	}, [Z]);
	let bt = D !== "checkout" || !!v?.installation, Q = y[Qe] || "MapSVG", xt = c.dashboardUrl || "https://mapsvg.com/dashboard", $ = v?.plans.find((e) => e.priceId === C);
	return /* @__PURE__ */ (0, h.jsx)(ae, {
		open: e,
		onOpenChange: (e) => {
			Z || a(e);
		},
		children: /* @__PURE__ */ (0, h.jsxs)(s, {
			ref: lt,
			"aria-describedby": void 0,
			"aria-busy": Z,
			showCloseButton: !Z,
			onEscapeKeyDown: (e) => {
				Z && e.preventDefault();
			},
			onInteractOutside: (e) => e.preventDefault(),
			className: n("flex max-h-[85vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl", _ && "h-[85vh]"),
			children: [
				/* @__PURE__ */ (0, h.jsx)(ee, {
					className: "shrink-0 border-b border-border px-6 py-5",
					children: /* @__PURE__ */ (0, h.jsx)(te, { children: D === "complete" ? Y ? "Installed" : "Payment confirmed" : _ ? "Checkout" : "Upgrade MapSVG" })
				}),
				/* @__PURE__ */ (0, h.jsx)("div", {
					ref: z,
					className: "min-h-0 flex-1 overflow-y-auto overscroll-contain p-6",
					"data-slot": "upgrade-body",
					onWheel: (e) => e.stopPropagation(),
					onTouchMove: (e) => e.stopPropagation(),
					onFocusCapture: () => {
						(b || w) && G();
					},
					children: _ ? bt ? D === "complete" ? /* @__PURE__ */ (0, h.jsxs)("div", {
						className: "flex min-h-full flex-col justify-center gap-6",
						children: [
							/* @__PURE__ */ (0, h.jsxs)("div", {
								className: "space-y-3 text-center",
								children: [
									Y ? /* @__PURE__ */ (0, h.jsx)(r, {
										"aria-hidden": "true",
										className: "mx-auto size-8"
									}) : /* @__PURE__ */ (0, h.jsx)(De, {}),
									/* @__PURE__ */ (0, h.jsx)("h2", {
										className: "text-lg font-semibold",
										children: Y ? `${Q} is installed and active` : `Your ${Q} upgrade is ready`
									}),
									Y ? /* @__PURE__ */ (0, h.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "Reload the editor when you are ready to use your new features."
									}) : null
								]
							}),
							/* @__PURE__ */ (0, h.jsxs)("div", {
								className: "my-6 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-rows-[auto_auto_auto]",
								"data-slot": "upgrade-package-actions",
								children: [/* @__PURE__ */ (0, h.jsxs)("div", {
									className: "grid min-w-0 items-center justify-items-center gap-3 rounded-lg border p-4 text-center sm:row-span-3 sm:grid-rows-subgrid",
									children: [
										/* @__PURE__ */ (0, h.jsx)(Ce, {
											"aria-hidden": "true",
											className: "size-6 text-muted-foreground"
										}),
										/* @__PURE__ */ (0, h.jsx)("p", {
											className: "flex self-stretch items-center justify-center text-sm font-medium",
											children: "Download your plugin"
										}),
										X ? /* @__PURE__ */ (0, h.jsxs)(t, {
											disabled: !0,
											children: ["Download ", Q]
										}) : /* @__PURE__ */ (0, h.jsx)(t, {
											asChild: !0,
											children: /* @__PURE__ */ (0, h.jsxs)("a", {
												href: A || xt,
												target: A ? ct : "_blank",
												rel: A ? void 0 : "noreferrer",
												referrerPolicy: "no-referrer",
												children: [/* @__PURE__ */ (0, h.jsx)(Ce, {
													"aria-hidden": "true",
													className: "size-4"
												}), A ? `Download ${Q}` : "Download from Dashboard"]
											})
										}),
										A ? /* @__PURE__ */ (0, h.jsx)("iframe", {
											name: ct,
											title: "Plugin download",
											hidden: !0,
											"aria-hidden": "true",
											referrerPolicy: "no-referrer"
										}) : null
									]
								}), /* @__PURE__ */ (0, h.jsxs)("div", {
									className: n("grid min-w-0 items-center justify-items-center gap-3 rounded-lg border border-dashed p-4 text-center sm:row-span-3 sm:grid-rows-subgrid", rt && !X && "bg-accent"),
									role: "group",
									"aria-label": "Upload plugin ZIP",
									"aria-busy": X,
									onDragOver: (e) => {
										e.preventDefault(), e.stopPropagation(), X || I(!0);
									},
									onDragLeave: (e) => {
										e.currentTarget.contains(e.relatedTarget) || I(!1);
									},
									onDrop: (e) => {
										e.preventDefault(), e.stopPropagation(), I(!1), X || _t(Array.from(e.dataTransfer.files));
									},
									children: [/* @__PURE__ */ (0, h.jsx)(re, {
										ref: it,
										type: "file",
										accept: ".zip,application/zip,application/x-zip-compressed",
										"aria-label": "Choose plugin ZIP",
										className: "sr-only",
										disabled: X || Y,
										onChange: (e) => {
											_t(Array.from(e.target.files || [])), e.target.value = "";
										}
									}), X ? /* @__PURE__ */ (0, h.jsxs)(h.Fragment, { children: [/* @__PURE__ */ (0, h.jsx)(ve, {
										"aria-hidden": "true",
										className: "size-6"
									}), /* @__PURE__ */ (0, h.jsx)("p", {
										role: "status",
										className: "flex self-stretch items-center justify-center text-sm",
										children: P === "reloading" ? "Saving your workspace and reloading…" : `Installing ${Q}…`
									})] }) : Y ? /* @__PURE__ */ (0, h.jsxs)(h.Fragment, { children: [
										/* @__PURE__ */ (0, h.jsx)(r, {
											"aria-hidden": "true",
											className: "size-6"
										}),
										/* @__PURE__ */ (0, h.jsx)("p", {
											className: "flex self-stretch items-center justify-center text-sm font-medium",
											children: "Installed and active"
										}),
										o ? /* @__PURE__ */ (0, h.jsx)(t, {
											onClick: () => void yt(),
											children: "Reload editor"
										}) : /* @__PURE__ */ (0, h.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Reload this page after saving your work."
										})
									] }) : /* @__PURE__ */ (0, h.jsxs)(h.Fragment, { children: [/* @__PURE__ */ (0, h.jsx)(ge, {
										"aria-hidden": "true",
										className: "size-6 text-muted-foreground"
									}), j ? /* @__PURE__ */ (0, h.jsxs)(h.Fragment, { children: [/* @__PURE__ */ (0, h.jsx)("p", {
										className: "flex max-w-full self-stretch items-center justify-center break-all text-sm",
										"aria-live": "polite",
										children: j.name
									}), /* @__PURE__ */ (0, h.jsxs)("div", {
										className: "flex flex-wrap justify-center gap-2",
										children: [/* @__PURE__ */ (0, h.jsx)(t, {
											onClick: () => void vt(),
											children: "Install"
										}), /* @__PURE__ */ (0, h.jsxs)(t, {
											variant: "outline",
											onClick: () => {
												M(null), N("");
											},
											"aria-label": "Remove selected ZIP",
											children: [/* @__PURE__ */ (0, h.jsx)(ne, {
												"aria-hidden": "true",
												className: "size-3.5"
											}), "Remove"]
										})]
									})] }) : /* @__PURE__ */ (0, h.jsxs)(h.Fragment, { children: [/* @__PURE__ */ (0, h.jsx)("p", {
										className: "flex self-stretch items-center justify-center text-sm",
										children: "Upload (drag and drop) to install your plugin"
									}), /* @__PURE__ */ (0, h.jsx)(t, {
										variant: "outline",
										onClick: () => it.current?.click(),
										children: "Browse"
									})] })] })]
								})]
							}),
							nt ? /* @__PURE__ */ (0, h.jsx)(f, {
								variant: "destructive",
								children: /* @__PURE__ */ (0, h.jsx)(d, { children: nt })
							}) : null,
							/* @__PURE__ */ (0, h.jsxs)("div", {
								className: "flex flex-col gap-2",
								children: [/* @__PURE__ */ (0, h.jsxs)(de, {
									className: "text-sm text-muted-foreground",
									children: [/* @__PURE__ */ (0, h.jsx)(ue, {
										asChild: !0,
										children: /* @__PURE__ */ (0, h.jsxs)(t, {
											variant: "ghost",
											className: "group justify-start px-0 text-sm text-foreground",
											children: [/* @__PURE__ */ (0, h.jsx)(me, { className: "size-4 group-data-[state=open]:rotate-90" }), "Other ways to download"]
										})
									}), /* @__PURE__ */ (0, h.jsxs)(le, {
										className: "space-y-3 pt-3",
										children: [/* @__PURE__ */ (0, h.jsxs)("p", { children: [
											"You can always download ",
											Q,
											" from your",
											" ",
											/* @__PURE__ */ (0, h.jsx)("a", {
												className: "underline",
												href: xt,
												target: "_blank",
												rel: "noreferrer",
												children: "MapSVG Dashboard"
											}),
											"."
										] }), et ? /* @__PURE__ */ (0, h.jsxs)("p", { children: [
											"Sign in with",
											" ",
											/* @__PURE__ */ (0, h.jsx)("strong", {
												className: "break-all font-medium",
												children: et
											}),
											" — the same email you used to activate Lite."
										] }) : /* @__PURE__ */ (0, h.jsx)("p", { children: "Sign in with the same email you used to activate Lite." })]
									})]
								}), /* @__PURE__ */ (0, h.jsxs)(de, {
									className: "text-sm text-muted-foreground",
									children: [/* @__PURE__ */ (0, h.jsx)(ue, {
										asChild: !0,
										children: /* @__PURE__ */ (0, h.jsxs)(t, {
											variant: "ghost",
											className: "group justify-start px-0 text-sm text-foreground",
											children: [/* @__PURE__ */ (0, h.jsx)(me, { className: "size-4 group-data-[state=open]:rotate-90" }), "How to install manually"]
										})
									}), /* @__PURE__ */ (0, h.jsx)(le, {
										className: "pt-2",
										children: /* @__PURE__ */ (0, h.jsxs)("ol", {
											className: "list-decimal space-y-2 pl-5",
											children: [
												/* @__PURE__ */ (0, h.jsx)("li", { children: "Download the plugin ZIP, then drop it in the upload zone above or use Browse." }),
												/* @__PURE__ */ (0, h.jsxs)("li", { children: [
													"Click Install to install and activate the ",
													Q,
													" add-on. You can also use Plugins → Add New Plugin → Upload Plugin."
												] }),
												/* @__PURE__ */ (0, h.jsx)("li", { children: "Keep MapSVG Lite active. Your license key stays the same. Reload the editor after installation." })
											]
										})
									})]
								})]
							})
						]
					}) : /* @__PURE__ */ (0, h.jsxs)("div", {
						className: "flex min-h-full flex-col justify-center gap-4 text-center",
						children: [
							D === "confirming" ? /* @__PURE__ */ (0, h.jsx)(ve, { className: "mx-auto size-6" }) : null,
							/* @__PURE__ */ (0, h.jsx)("p", {
								role: "status",
								className: "text-sm",
								children: D === "verification-error" ? "Your payment status needs to be checked." : "Confirming your upgrade…"
							}),
							Xe ? /* @__PURE__ */ (0, h.jsx)(f, {
								variant: "destructive",
								children: /* @__PURE__ */ (0, h.jsx)(d, { children: Xe })
							}) : null,
							D === "verification-error" ? /* @__PURE__ */ (0, h.jsx)(t, {
								className: "mx-auto",
								onClick: () => {
									k(""), S && T(!0), O(S ? "checkout" : "confirming");
								},
								children: "Check payment status"
							}) : null
						]
					}) : /* @__PURE__ */ (0, h.jsxs)("div", {
						className: "space-y-5",
						children: [
							He ? /* @__PURE__ */ (0, h.jsx)(f, {
								variant: "destructive",
								children: /* @__PURE__ */ (0, h.jsxs)(d, { children: [He, /* @__PURE__ */ (0, h.jsx)(t, {
									variant: "link",
									onClick: () => {
										let e = v?.plans.find((e) => e.priceId === C);
										e ? q(e) : ht();
									},
									children: "Try again"
								})] })
							}) : null,
							v?.plans.length ? /* @__PURE__ */ (0, h.jsxs)("div", {
								ref: dt,
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, h.jsx)("p", {
										className: "mx-px px-4 text-sm font-medium",
										children: "Choose your plan"
									}),
									/* @__PURE__ */ (0, h.jsx)(pe, {
										value: C,
										"aria-label": "Upgrade plan",
										disabled: qe || b,
										onValueChange: (e) => {
											let t = v.plans.find((t) => t.priceId === e);
											t && !qe && q(t);
										},
										className: "gap-1 rounded-lg border",
										children: v.plans.map((e, t) => /* @__PURE__ */ (0, h.jsxs)("label", {
											htmlFor: `${st}-${t}`,
											className: n("flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 text-sm ring-1 ring-inset", C === e.priceId ? "ring-foreground" : "ring-transparent"),
											children: [/* @__PURE__ */ (0, h.jsxs)("span", {
												className: "flex min-w-0 flex-1 flex-wrap items-center justify-between gap-2",
												children: [/* @__PURE__ */ (0, h.jsxs)("span", {
													className: "space-y-1",
													children: [/* @__PURE__ */ (0, h.jsx)("span", {
														className: "block font-medium",
														children: y[e.slug] || e.title
													}), /* @__PURE__ */ (0, h.jsxs)("span", {
														className: "block space-y-1 text-xs text-muted-foreground",
														children: [
															/* @__PURE__ */ (0, h.jsxs)("span", {
																className: "flex items-center gap-1.5",
																children: [/* @__PURE__ */ (0, h.jsx)(we, {
																	"aria-hidden": "true",
																	className: "size-3.5 shrink-0"
																}), e.numDomainsMax === 0 ? "Unlimited sites" : `${e.numDomainsMax} ${e.numDomainsMax === 1 ? "site" : "sites"}`]
															}),
															Pe[e.slug] ? /* @__PURE__ */ (0, h.jsxs)("span", {
																className: "flex items-center gap-1.5",
																children: [/* @__PURE__ */ (0, h.jsx)(Te, {
																	"aria-hidden": "true",
																	className: "size-3.5 shrink-0"
																}), Pe[e.slug]]
															}) : null,
															e.updateRequired ? /* @__PURE__ */ (0, h.jsx)("span", {
																className: "text-amber-700",
																children: "Update Lite to continue"
															}) : null
														]
													})]
												}), /* @__PURE__ */ (0, h.jsx)("strong", {
													className: "font-semibold tabular-nums",
													children: Re(e)
												})]
											}), /* @__PURE__ */ (0, h.jsx)(fe, {
												id: `${st}-${t}`,
												value: e.priceId,
												"aria-label": `${y[e.slug] || e.title} · ${Re(e)}`
											})]
										}, e.priceId))
									}),
									/* @__PURE__ */ (0, h.jsx)("p", {
										className: "mx-px px-4 text-xs text-muted-foreground",
										children: "Your license key, connected sites and purchased AI credits stay with your license."
									})
								]
							}) : !b && !He ? /* @__PURE__ */ (0, h.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "No upgrade plans are available for this license."
							}) : null,
							$?.updateRequired ? /* @__PURE__ */ (0, h.jsx)(f, { children: /* @__PURE__ */ (0, h.jsxs)(d, {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, h.jsxs)("p", { children: [
										y[$.slug] || $.title,
										$.version ? ` ${$.version}` : "",
										" requires MapSVG Lite",
										" ",
										$.requiresLiteVersion,
										" or newer. Update Lite before purchasing."
									] }),
									/* @__PURE__ */ (0, h.jsx)(t, {
										asChild: !0,
										children: /* @__PURE__ */ (0, h.jsxs)("a", {
											href: new URL("update-core.php", window.location.href).href,
											target: "_blank",
											rel: "noreferrer",
											children: ["Open WordPress updates", /* @__PURE__ */ (0, h.jsx)(he, {
												"aria-hidden": "true",
												className: "size-3.5"
											})]
										})
									}),
									/* @__PURE__ */ (0, h.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "After updating Lite, reload this editor to continue."
									})
								]
							}) }) : null,
							b || w || S ? /* @__PURE__ */ (0, h.jsxs)("div", {
								className: "relative",
								style: { height: Je },
								"data-slot": "upgrade-checkout-frame",
								"aria-busy": b || w,
								children: [S ? /* @__PURE__ */ (0, h.jsx)(Ee, {
									frame: ut,
									checkoutUrl: S.checkoutUrl,
									onNavigationStart: G
								}, S.purchaseId) : null, b || w ? /* @__PURE__ */ (0, h.jsx)("div", {
									className: "absolute inset-0 bg-background",
									children: /* @__PURE__ */ (0, h.jsxs)("div", {
										role: "status",
										className: "sticky top-0 flex h-40 items-center justify-center gap-2 text-sm text-muted-foreground",
										children: [/* @__PURE__ */ (0, h.jsx)(ve, { "aria-hidden": "true" }), b ? "Loading upgrade plans…" : S ? "Loading payment form…" : "Preparing checkout…"]
									})
								}) : null]
							}) : null
						]
					}) : /* @__PURE__ */ (0, h.jsxs)("div", {
						className: "space-y-6",
						children: [/* @__PURE__ */ (0, h.jsx)(_e, {
							title: "Activate your Lite license",
							help: "Activate your existing key, or verify your email to get a free Lite key before upgrading. Your license ID and key stay the same when you upgrade.",
							hideDivider: !0,
							children: /* @__PURE__ */ (0, h.jsx)(be, { activationOnly: !0 })
						}), ie(c.licenseProductSlug || c.plan) ? /* @__PURE__ */ (0, h.jsx)(xe, {}) : null]
					})
				}),
				/* @__PURE__ */ (0, h.jsxs)(se, {
					className: "shrink-0 border-t border-border px-6 py-4",
					children: [/* @__PURE__ */ (0, h.jsxs)(t, {
						variant: "outline",
						disabled: Z,
						onClick: () => {
							Z || a(!1);
						},
						children: [D === "complete" ? null : /* @__PURE__ */ (0, h.jsx)(i, { className: "size-4" }), D === "complete" ? "Done" : "Go back"]
					}), Z ? /* @__PURE__ */ (0, h.jsxs)(t, {
						variant: "outline",
						disabled: !0,
						children: ["Open MapSVG Dashboard", /* @__PURE__ */ (0, h.jsx)(he, { className: "size-3.5" })]
					}) : /* @__PURE__ */ (0, h.jsx)(t, {
						asChild: !0,
						variant: "outline",
						children: /* @__PURE__ */ (0, h.jsxs)("a", {
							href: xt,
							target: "_blank",
							rel: "noreferrer",
							children: ["Open MapSVG Dashboard", /* @__PURE__ */ (0, h.jsx)(he, { className: "size-3.5" })]
						})
					})]
				})
			]
		})
	});
}
//#endregion
export { Be as UpgradeDialog };

//# sourceMappingURL=UpgradeDialog-3LPLNye8.js.map