import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { _i as t, ai as n, bi as r, ci as i, fi as a, hi as o, ii as s, oi as c, si as l, ui as u } from "./admin-startup-D4zZmPq_.js";
//#region node_modules/.pnpm/@radix-ui+react-collapsible@1.1.18_@types+react-dom@19.2.3_@types+react@19.2.17__@types_e4d5d33ddc5b9b9a7cc23593405888f6/node_modules/@radix-ui/react-collapsible/dist/index.mjs
var d = /* @__PURE__ */ e(r(), 1), f = o(), p = Object.defineProperty, m = (e, t) => p(e, "name", {
	value: t,
	configurable: !0
}), h = "Collapsible", [g, _] = u(h), [v, y] = g(h), b = /* @__PURE__ */ d.forwardRef(/* @__PURE__ */ m(function(e, t) {
	let { __scopeCollapsible: n, open: r, defaultOpen: i, disabled: o, onOpenChange: l, ...u } = e, [p, m] = c({
		prop: r,
		defaultProp: i ?? !1,
		onChange: l,
		caller: h
	});
	return /* @__PURE__ */ (0, f.jsx)(v, {
		scope: n,
		disabled: o,
		contentId: s(),
		open: p,
		onOpenToggle: d.useCallback(() => m((e) => !e), [m]),
		children: /* @__PURE__ */ (0, f.jsx)(a.div, {
			"data-state": E(p),
			"data-disabled": o ? "" : void 0,
			...u,
			ref: t
		})
	});
}, "Collapsible")), x = "CollapsibleTrigger", S = /* @__PURE__ */ d.forwardRef(/* @__PURE__ */ m(function(e, t) {
	let { __scopeCollapsible: n, ...r } = e, o = y(x, n);
	return /* @__PURE__ */ (0, f.jsx)(a.button, {
		type: "button",
		"aria-controls": o.open ? o.contentId : void 0,
		"aria-expanded": o.open || !1,
		"data-state": E(o.open),
		"data-disabled": o.disabled ? "" : void 0,
		disabled: o.disabled,
		...r,
		ref: t,
		onClick: i(e.onClick, o.onOpenToggle)
	});
}, "CollapsibleTrigger")), C = "CollapsibleContent", w = /* @__PURE__ */ d.forwardRef(/* @__PURE__ */ m(function(e, t) {
	let { forceMount: r, ...i } = e, a = y(C, e.__scopeCollapsible);
	return /* @__PURE__ */ (0, f.jsx)(n, {
		present: r || a.open,
		children: ({ present: e }) => /* @__PURE__ */ (0, f.jsx)(T, {
			...i,
			ref: t,
			present: e
		})
	});
}, "CollapsibleContent")), T = /* @__PURE__ */ d.forwardRef(/* @__PURE__ */ m(function(e, n) {
	let { __scopeCollapsible: r, present: i, children: o, ...s } = e, c = y(C, r), [u, p] = d.useState(i), m = d.useRef(null), h = t(n, m), g = d.useRef(0), _ = g.current, v = d.useRef(0), b = v.current, x = c.open || u, S = d.useRef(x), w = d.useRef(void 0);
	return d.useEffect(() => {
		let e = requestAnimationFrame(() => S.current = !1);
		return () => cancelAnimationFrame(e);
	}, []), l(() => {
		let e = m.current;
		if (e) {
			w.current = w.current || {
				transitionDuration: e.style.transitionDuration,
				animationName: e.style.animationName
			}, e.style.transitionDuration = "0s", e.style.animationName = "none";
			let t = e.getBoundingClientRect();
			g.current = t.height, v.current = t.width, S.current || (e.style.transitionDuration = w.current.transitionDuration, e.style.animationName = w.current.animationName), p(i);
		}
	}, [c.open, i]), /* @__PURE__ */ (0, f.jsx)(a.div, {
		"data-state": E(c.open),
		"data-disabled": c.disabled ? "" : void 0,
		id: c.contentId,
		hidden: !x,
		...s,
		ref: h,
		style: {
			"--radix-collapsible-content-height": _ ? `${_}px` : void 0,
			"--radix-collapsible-content-width": b ? `${b}px` : void 0,
			...e.style
		},
		children: x && o
	});
}, "CollapsibleContentImpl"));
function E(e) {
	return e ? "open" : "closed";
}
m(E, "getState");
//#endregion
//#region src/components/ui/collapsible.tsx
function D({ ...e }) {
	return /* @__PURE__ */ (0, f.jsx)(b, {
		"data-slot": "collapsible",
		...e
	});
}
function O({ ...e }) {
	return /* @__PURE__ */ (0, f.jsx)(S, {
		"data-slot": "collapsible-trigger",
		...e
	});
}
function k({ ...e }) {
	return /* @__PURE__ */ (0, f.jsx)(w, {
		"data-slot": "collapsible-content",
		...e
	});
}
//#endregion
export { k as n, O as r, D as t };

//# sourceMappingURL=collapsible-CBCu6aOx.js.map