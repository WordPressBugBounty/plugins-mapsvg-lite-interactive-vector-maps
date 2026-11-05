import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Br as t, Lr as n, Rr as r, ai as i, bi as a, ci as o, fi as s, hi as c, ii as l, oi as u, ri as d, ui as f, yi as p, zr as m } from "./admin-startup-DaxvU-L8.js";
//#region node_modules/.pnpm/@radix-ui+react-tabs@1.1.19_@types+react-dom@19.2.3_@types+react@19.2.17__@types+react@_531d8d66fb0d0af1d046c6792e4fa5f5/node_modules/@radix-ui/react-tabs/dist/index.mjs
var h = /* @__PURE__ */ e(a(), 1), g = c(), _ = Object.defineProperty, v = (e, t) => _(e, "name", {
	value: t,
	configurable: !0
}), y = "Tabs", [b, x] = f(y, [t]), S = t(), [C, w] = b(y), T = /* @__PURE__ */ h.forwardRef(/* @__PURE__ */ v(function(e, t) {
	let { __scopeTabs: n, value: r, onValueChange: i, defaultValue: a, orientation: o = "horizontal", dir: c, activationMode: f = "automatic", ...p } = e, m = d(c), [h, _] = u({
		prop: r,
		onChange: i,
		defaultProp: a ?? "",
		caller: y
	});
	return /* @__PURE__ */ (0, g.jsx)(C, {
		scope: n,
		baseId: l(),
		value: h,
		onValueChange: _,
		orientation: o,
		dir: m,
		activationMode: f,
		children: /* @__PURE__ */ (0, g.jsx)(s.div, {
			dir: m,
			"data-orientation": o,
			...p,
			ref: t
		})
	});
}, "Tabs")), E = "TabsList", D = /* @__PURE__ */ h.forwardRef(/* @__PURE__ */ v(function(e, t) {
	let { __scopeTabs: n, loop: i = !0, ...a } = e, o = w(E, n), c = S(n);
	return /* @__PURE__ */ (0, g.jsx)(r, {
		asChild: !0,
		...c,
		orientation: o.orientation,
		dir: o.dir,
		loop: i,
		children: /* @__PURE__ */ (0, g.jsx)(s.div, {
			role: "tablist",
			"aria-orientation": o.orientation,
			...a,
			ref: t
		})
	});
}, "TabsList")), O = "TabsTrigger", k = /* @__PURE__ */ h.forwardRef(/* @__PURE__ */ v(function(e, t) {
	let { __scopeTabs: n, value: r, disabled: i = !1, ...a } = e, c = w(O, n), l = S(n), u = M(c.baseId, r), d = N(c.baseId, r), f = r === c.value;
	return /* @__PURE__ */ (0, g.jsx)(m, {
		asChild: !0,
		...l,
		focusable: !i,
		active: f,
		children: /* @__PURE__ */ (0, g.jsx)(s.button, {
			type: "button",
			role: "tab",
			"aria-selected": f,
			"aria-controls": d,
			"data-state": f ? "active" : "inactive",
			"data-disabled": i ? "" : void 0,
			disabled: i,
			id: u,
			...a,
			ref: t,
			onMouseDown: o(e.onMouseDown, (e) => {
				!i && e.button === 0 && e.ctrlKey === !1 ? c.onValueChange(r) : e.preventDefault();
			}),
			onKeyDown: o(e.onKeyDown, (e) => {
				i || e.target !== e.currentTarget || [" ", "Enter"].includes(e.key) && c.onValueChange(r);
			}),
			onFocus: o(e.onFocus, () => {
				let e = c.activationMode !== "manual";
				!f && !i && e && c.onValueChange(r);
			})
		})
	});
}, "TabsTrigger")), A = "TabsContent", j = /* @__PURE__ */ h.forwardRef(/* @__PURE__ */ v(function(e, t) {
	let { __scopeTabs: n, value: r, forceMount: a, children: o, ...c } = e, l = w(A, n), u = M(l.baseId, r), d = N(l.baseId, r), f = r === l.value, p = h.useRef(f);
	return h.useEffect(() => {
		let e = requestAnimationFrame(() => p.current = !1);
		return () => cancelAnimationFrame(e);
	}, []), /* @__PURE__ */ (0, g.jsx)(i, {
		present: a || f,
		children: ({ present: n }) => /* @__PURE__ */ (0, g.jsx)(s.div, {
			"data-state": f ? "active" : "inactive",
			"data-orientation": l.orientation,
			role: "tabpanel",
			"aria-labelledby": u,
			hidden: !n,
			id: d,
			tabIndex: 0,
			...c,
			ref: t,
			style: {
				...e.style,
				animationDuration: p.current ? "0s" : void 0
			},
			children: n && o
		})
	});
}, "TabsContent"));
function M(e, t) {
	return `${e}-trigger-${t}`;
}
v(M, "makeTriggerId");
function N(e, t) {
	return `${e}-content-${t}`;
}
v(N, "makeContentId");
//#endregion
//#region src/components/ui/tabs.tsx
function P({ className: e, orientation: t = "horizontal", ...r }) {
	return /* @__PURE__ */ (0, g.jsx)(T, {
		"data-slot": "tabs",
		"data-orientation": t,
		orientation: t,
		className: n("group/tabs flex gap-2 data-[orientation=horizontal]:flex-col", e),
		...r
	});
}
var F = p("group/tabs-list inline-flex w-fit items-center justify-center rounded-md p-0.5 text-muted-foreground group-data-[orientation=horizontal]/tabs:h-7 group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col data-[variant=line]:rounded-none", {
	variants: { variant: {
		default: "bg-muted",
		line: "gap-1 bg-transparent"
	} },
	defaultVariants: { variant: "default" }
});
function I({ className: e, variant: t = "default", ...r }) {
	return /* @__PURE__ */ (0, g.jsx)(D, {
		"data-slot": "tabs-list",
		"data-variant": t,
		className: n(F({ variant: t }), e),
		...r
	});
}
function L({ className: e, ...t }) {
	return /* @__PURE__ */ (0, g.jsx)(k, {
		"data-slot": "tabs-trigger",
		className: n("relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1 rounded-[5px] border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap text-foreground/60 transition-all group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent", "data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 dark:data-[state=active]:text-foreground", "after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] group-data-[orientation=horizontal]/tabs:after:h-0.5 group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100", e),
		...t
	});
}
function R({ className: e, ...t }) {
	return /* @__PURE__ */ (0, g.jsx)(j, {
		"data-slot": "tabs-content",
		className: n("flex-1 outline-none", e),
		...t
	});
}
//#endregion
export { L as i, R as n, I as r, P as t };

//# sourceMappingURL=tabs-DS7E4GS_.js.map