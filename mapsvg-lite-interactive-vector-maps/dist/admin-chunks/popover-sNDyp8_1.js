import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { $r as t, Hr as n, Lr as r, Pr as i, Qr as a, Ur as o, Vr as s, Wr as c, Xr as l, Zr as u, _i as d, ai as f, bi as p, ci as m, ei as h, fi as g, hi as _, hr as v, ii as y, mi as b, oi as x, ti as S, ui as C } from "./admin-startup-CJQ1Yfhw.js";
//#region node_modules/.pnpm/@radix-ui+react-popover@1.1.21_@types+react-dom@19.2.3_@types+react@19.2.17__@types+rea_8de20cccc6806677ce56ebb2c4924f2c/node_modules/@radix-ui/react-popover/dist/index.mjs
var w = /* @__PURE__ */ e(p(), 1), T = _(), E = Object.defineProperty, D = (e, t) => E(e, "name", {
	value: t,
	configurable: !0
}), O = "Popover", [k, ee] = C(O, [c]), A = c(), [j, M] = k(O), N = /* @__PURE__ */ D((e) => {
	let { __scopePopover: t, children: n, open: r, defaultOpen: i, onOpenChange: a, modal: o = !1 } = e, c = A(t), l = w.useRef(null), [u, d] = w.useState(!1), [f, p] = w.useState(0), [m, h] = w.useState(0), [g, _] = x({
		prop: r,
		defaultProp: i ?? !1,
		onChange: a,
		caller: O
	});
	return /* @__PURE__ */ (0, T.jsx)(s, {
		...c,
		children: /* @__PURE__ */ (0, T.jsx)(j, {
			scope: t,
			contentId: y(),
			titleId: y(),
			descriptionId: y(),
			titlePresent: f > 0,
			descriptionPresent: m > 0,
			setTitleCount: p,
			setDescriptionCount: h,
			triggerRef: l,
			open: g,
			onOpenChange: _,
			onOpenToggle: w.useCallback(() => _((e) => !e), [_]),
			hasCustomAnchor: u,
			onCustomAnchorAdd: w.useCallback(() => d(!0), []),
			onCustomAnchorRemove: w.useCallback(() => d(!1), []),
			modal: o,
			children: n
		})
	});
}, "Popover"), P = "PopoverAnchor", F = /* @__PURE__ */ w.forwardRef(/* @__PURE__ */ D(function(e, t) {
	let { __scopePopover: r, ...i } = e, a = M(P, r), o = A(r), { onCustomAnchorAdd: s, onCustomAnchorRemove: c } = a;
	return w.useEffect(() => (s(), () => c()), [s, c]), /* @__PURE__ */ (0, T.jsx)(n, {
		...o,
		...i,
		ref: t
	});
}, "PopoverAnchor")), I = "PopoverTrigger", L = /* @__PURE__ */ w.forwardRef(/* @__PURE__ */ D(function(e, t) {
	let { __scopePopover: r, ...i } = e, a = M(I, r), o = A(r), s = d(t, a.triggerRef), c = /* @__PURE__ */ (0, T.jsx)(g.button, {
		type: "button",
		"aria-haspopup": "dialog",
		"aria-expanded": a.open,
		"aria-controls": a.open ? a.contentId : void 0,
		"data-state": J(a.open),
		...i,
		ref: s,
		onClick: m(e.onClick, a.onOpenToggle)
	});
	return a.hasCustomAnchor ? c : /* @__PURE__ */ (0, T.jsx)(n, {
		asChild: !0,
		...o,
		children: c
	});
}, "PopoverTrigger")), R = "PopoverPortal", [z, B] = k(R, { forceMount: void 0 }), V = /* @__PURE__ */ D((e) => {
	let { __scopePopover: n, forceMount: r, children: i, container: a } = e, o = M(R, n);
	return /* @__PURE__ */ (0, T.jsx)(z, {
		scope: n,
		forceMount: r,
		children: /* @__PURE__ */ (0, T.jsx)(f, {
			present: r || o.open,
			children: /* @__PURE__ */ (0, T.jsx)(t, {
				asChild: !0,
				container: a,
				children: i
			})
		})
	});
}, "PopoverPortal"), H = "PopoverContent", U = /* @__PURE__ */ w.forwardRef(/* @__PURE__ */ D(function(e, t) {
	let n = B(H, e.__scopePopover), { forceMount: r = n.forceMount, ...i } = e, a = M(H, e.__scopePopover);
	return /* @__PURE__ */ (0, T.jsx)(f, {
		present: r || a.open,
		children: a.modal ? /* @__PURE__ */ (0, T.jsx)(G, {
			...i,
			ref: t
		}) : /* @__PURE__ */ (0, T.jsx)(K, {
			...i,
			ref: t
		})
	});
}, "PopoverContent")), W = b("PopoverContent.RemoveScroll"), G = /* @__PURE__ */ w.forwardRef(/* @__PURE__ */ D(function(e, t) {
	let n = M(H, e.__scopePopover), r = w.useRef(null), i = d(t, r), a = w.useRef(!1);
	return w.useEffect(() => {
		let e = r.current;
		if (e) return l(e);
	}, []), /* @__PURE__ */ (0, T.jsx)(u, {
		as: W,
		allowPinchZoom: !0,
		children: /* @__PURE__ */ (0, T.jsx)(q, {
			...e,
			ref: i,
			trapFocus: n.open,
			disableOutsidePointerEvents: !0,
			onCloseAutoFocus: m(e.onCloseAutoFocus, (e) => {
				e.preventDefault(), a.current || n.triggerRef.current?.focus();
			}),
			onPointerDownOutside: m(e.onPointerDownOutside, (e) => {
				let t = e.detail.originalEvent, n = t.button === 0 && t.ctrlKey === !0, r = t.button === 2 || n;
				a.current = r;
			}, { checkForDefaultPrevented: !1 }),
			onFocusOutside: m(e.onFocusOutside, (e) => e.preventDefault(), { checkForDefaultPrevented: !1 })
		})
	});
}, "PopoverContentModal")), K = /* @__PURE__ */ w.forwardRef(/* @__PURE__ */ D(function(e, t) {
	let n = M(H, e.__scopePopover), r = w.useRef(!1), i = w.useRef(!1);
	return /* @__PURE__ */ (0, T.jsx)(q, {
		...e,
		ref: t,
		trapFocus: !1,
		disableOutsidePointerEvents: !1,
		onCloseAutoFocus: (t) => {
			e.onCloseAutoFocus?.(t), t.defaultPrevented || (r.current || n.triggerRef.current?.focus(), t.preventDefault()), r.current = !1, i.current = !1;
		},
		onInteractOutside: (t) => {
			e.onInteractOutside?.(t), t.defaultPrevented || (r.current = !0, t.detail.originalEvent.type === "pointerdown" && (i.current = !0));
			let a = t.target;
			n.triggerRef.current?.contains(a) && t.preventDefault(), t.detail.originalEvent.type === "focusin" && i.current && t.preventDefault();
		}
	});
}, "PopoverContentNonModal")), q = /* @__PURE__ */ w.forwardRef(/* @__PURE__ */ D(function(e, t) {
	let { __scopePopover: n, trapFocus: r, onOpenAutoFocus: i, onCloseAutoFocus: s, disableOutsidePointerEvents: c, onEscapeKeyDown: l, onPointerDownOutside: u, onFocusOutside: d, onInteractOutside: f, "aria-describedby": p, ...m } = e, g = M(H, n), _ = A(n);
	return a(), /* @__PURE__ */ (0, T.jsx)(h, {
		asChild: !0,
		loop: !0,
		trapped: r,
		onMountAutoFocus: i,
		onUnmountAutoFocus: s,
		children: /* @__PURE__ */ (0, T.jsx)(S, {
			asChild: !0,
			disableOutsidePointerEvents: c,
			onInteractOutside: f,
			onEscapeKeyDown: l,
			onPointerDownOutside: u,
			onFocusOutside: d,
			onDismiss: () => g.onOpenChange(!1),
			deferPointerDownOutside: !0,
			children: /* @__PURE__ */ (0, T.jsx)(o, {
				"data-state": J(g.open),
				role: "dialog",
				id: g.contentId,
				"aria-labelledby": g.titlePresent ? g.titleId : void 0,
				"aria-describedby": g.descriptionPresent ? Y(p, g.descriptionId) : p,
				..._,
				...m,
				ref: t,
				style: {
					...m.style,
					"--radix-popover-content-transform-origin": "var(--radix-popper-transform-origin)",
					"--radix-popover-content-available-width": "var(--radix-popper-available-width)",
					"--radix-popover-content-available-height": "var(--radix-popper-available-height)",
					"--radix-popover-trigger-width": "var(--radix-popper-anchor-width)",
					"--radix-popover-trigger-height": "var(--radix-popper-anchor-height)"
				}
			})
		})
	});
}, "PopoverContentImpl"));
function J(e) {
	return e ? "open" : "closed";
}
D(J, "getState");
function Y(...e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) if (typeof n == "string") for (let e of String(n).trim().split(/\s+/)) e && t.add(e);
	return t.size > 0 ? Array.from(t).join(" ") : void 0;
}
D(Y, "concatAriaDescribedby");
var X = i("plus", [["path", {
	d: "M5 12h14",
	key: "1ays0h"
}], ["path", {
	d: "M12 5v14",
	key: "s699le"
}]]);
//#endregion
//#region src/components/ui/popover.tsx
function Z({ ...e }) {
	return /* @__PURE__ */ (0, T.jsx)(N, {
		"data-slot": "popover",
		...e
	});
}
function Q({ ...e }) {
	return /* @__PURE__ */ (0, T.jsx)(L, {
		"data-slot": "popover-trigger",
		...e
	});
}
function $({ className: e, align: t = "center", sideOffset: n = 4, ...i }) {
	let a = v();
	return /* @__PURE__ */ (0, T.jsx)(V, {
		container: a,
		children: /* @__PURE__ */ (0, T.jsx)(U, {
			"data-slot": "popover-content",
			align: t,
			sideOffset: n,
			className: r("z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", e),
			...i
		})
	});
}
function te({ ...e }) {
	return /* @__PURE__ */ (0, T.jsx)(F, {
		"data-slot": "popover-anchor",
		...e
	});
}
//#endregion
export { X as a, Q as i, te as n, $ as r, Z as t };

//# sourceMappingURL=popover-sNDyp8_1.js.map