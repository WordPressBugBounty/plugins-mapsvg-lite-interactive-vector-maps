import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { At as t, Bt as n, Dr as r, Fr as i, Ln as a, Lr as o, Mt as s, Pt as c, bi as l, gn as u, hi as d, hn as f, vn as p, zt as m } from "./admin-startup-D4zZmPq_.js";
import { a as h, i as g, t as _ } from "./AppVersions-BNLwd5y3.js";
import { t as v } from "./external-link-DCs2S7K5.js";
//#region src/components/ui/kbd.tsx
var y = /* @__PURE__ */ e(l(), 1), b = d();
function x({ className: e, ...t }) {
	return /* @__PURE__ */ (0, b.jsx)("kbd", {
		"data-slot": "kbd",
		className: o("pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none", "[&_svg:not([class*='size-'])]:size-3", "[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10", e),
		...t
	});
}
//#endregion
//#region src/lib/use-app-preview.ts
function S(e, t) {
	let [n, r] = (0, y.useState)(!1), [i, o] = (0, y.useState)(null);
	async function s() {
		if (!e) return;
		o(null);
		let t = window.open("about:blank", "_blank");
		if (!t) {
			o("Allow popups to open preview.");
			return;
		}
		t.opener = null, r(!0);
		try {
			let n = a();
			n?.id === e.mapId && e.capture(n.getData()), t.location.href = await e.preview();
		} catch (e) {
			t.close(), o(e instanceof Error ? e.message : String(e));
		} finally {
			r(!1);
		}
	}
	return {
		busy: n,
		error: i,
		preview: s,
		disabled: t || n || !e?.ready || !e.active || e.busy || e.transitioning || !!e.active?.conflicted
	};
}
//#endregion
//#region src/components/AppWorkspaceActions.tsx
function C({ session: e, publishing: a, publishDisabled: l, onPublish: d, osShortcut: C, ...w }) {
	let T = (0, y.useRef)(null), E = (0, y.useRef)(null), D = (0, y.useRef)(null), O = (0, y.useRef)(!1), [k, A] = (0, y.useState)(!1), [j, M] = (0, y.useState)(!1), [N, P] = (0, y.useState)(!1), F = S(e, w.disabled || !!e?.offline), I = C === "cmd" ? "⌘S" : "Ctrl S";
	return (0, y.useLayoutEffect)(() => {
		let e = T.current?.closest("[data-slot=\"settings-panel-toolbar\"]"), t = e?.querySelector("[aria-label=\"Editor panels\"]"), n = E.current;
		if (!e || !t || !n) return;
		let r = () => {
			let r = e.getBoundingClientRect().width;
			if (!r) return;
			let i = getComputedStyle(e), a = r - (parseFloat(i.paddingLeft) || 0) - (parseFloat(i.paddingRight) || 0) - t.getBoundingClientRect().width - (parseFloat(i.columnGap) || 0), o = n.getBoundingClientRect().width > a;
			A(o), o || M(!1);
		}, i = new ResizeObserver(r);
		for (let r of [
			e,
			t,
			n
		]) i.observe(r);
		return r(), () => i.disconnect();
	}, []), /* @__PURE__ */ (0, b.jsxs)("div", {
		ref: T,
		className: "relative flex min-w-0 items-center",
		children: [
			/* @__PURE__ */ (0, b.jsxs)("div", {
				ref: E,
				"data-slot": "workspace-actions-expanded",
				"aria-hidden": k || void 0,
				inert: k,
				className: o("flex w-max shrink-0 items-center gap-2", k && "pointer-events-none invisible absolute right-0 top-0"),
				children: [
					e ? /* @__PURE__ */ (0, b.jsx)(_, {
						...w,
						session: e,
						open: N,
						onOpenChange: P,
						overflowAnchor: k ? D : void 0
					}) : null,
					e ? /* @__PURE__ */ (0, b.jsxs)(f, { children: [/* @__PURE__ */ (0, b.jsx)(p, {
						asChild: !0,
						children: /* @__PURE__ */ (0, b.jsxs)(i, {
							type: "button",
							size: "xs",
							variant: "outline",
							disabled: F.disabled,
							onClick: () => void F.preview(),
							children: [/* @__PURE__ */ (0, b.jsx)(v, {}), F.busy ? "Opening…" : "Preview"]
						})
					}), /* @__PURE__ */ (0, b.jsx)(u, {
						side: "bottom",
						children: "Preview current draft"
					})] }) : null,
					/* @__PURE__ */ (0, b.jsxs)(f, { children: [/* @__PURE__ */ (0, b.jsx)(p, {
						asChild: !0,
						children: /* @__PURE__ */ (0, b.jsx)(i, {
							type: "button",
							size: "xs",
							disabled: l,
							onClick: d,
							children: a ? "Publishing..." : "Publish"
						})
					}), /* @__PURE__ */ (0, b.jsxs)(u, {
						side: "bottom",
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, b.jsx)("span", { children: "Publish changes" }), /* @__PURE__ */ (0, b.jsx)(x, { children: I })]
					})] })
				]
			}),
			k ? /* @__PURE__ */ (0, b.jsxs)(t, {
				open: j,
				onOpenChange: M,
				children: [/* @__PURE__ */ (0, b.jsxs)(f, { children: [/* @__PURE__ */ (0, b.jsx)(p, {
					asChild: !0,
					children: /* @__PURE__ */ (0, b.jsx)(n, {
						asChild: !0,
						children: /* @__PURE__ */ (0, b.jsx)(i, {
							ref: D,
							type: "button",
							size: "icon-xs",
							variant: "ghost",
							"aria-label": "Show more",
							children: /* @__PURE__ */ (0, b.jsx)(r, {})
						})
					})
				}), /* @__PURE__ */ (0, b.jsx)(u, {
					side: "bottom",
					children: "Show more"
				})] }), /* @__PURE__ */ (0, b.jsxs)(s, {
					align: "end",
					onCloseAutoFocus: (e) => {
						(N || O.current) && e.preventDefault(), O.current = !1;
					},
					children: [
						/* @__PURE__ */ (0, b.jsxs)(c, {
							disabled: w.disabled || !e?.ready,
							onSelect: () => P(!0),
							children: [/* @__PURE__ */ (0, b.jsx)(g, {}), "Versions"]
						}),
						/* @__PURE__ */ (0, b.jsxs)(c, {
							disabled: F.disabled,
							onSelect: () => void F.preview(),
							children: [/* @__PURE__ */ (0, b.jsx)(v, {}), F.busy ? "Opening…" : "Preview"]
						}),
						/* @__PURE__ */ (0, b.jsxs)(c, {
							disabled: l,
							onSelect: () => {
								O.current = !0, d();
							},
							children: [
								/* @__PURE__ */ (0, b.jsx)(h, {}),
								a ? "Publishing..." : "Publish",
								/* @__PURE__ */ (0, b.jsx)(m, { children: I })
							]
						})
					]
				})]
			}) : null,
			F.error ? /* @__PURE__ */ (0, b.jsx)("span", {
				role: "alert",
				className: "absolute right-0 top-full z-10 w-64 rounded border bg-background p-2 text-xs text-destructive",
				children: F.error
			}) : null
		]
	});
}
//#endregion
export { C as AppWorkspaceActions };

//# sourceMappingURL=AppWorkspaceActions-CHoR03wR.js.map