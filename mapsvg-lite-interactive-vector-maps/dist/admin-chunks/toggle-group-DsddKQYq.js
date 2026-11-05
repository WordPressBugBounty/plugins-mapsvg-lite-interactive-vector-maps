import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Br as t, Lr as n, Pr as r, Rr as i, bi as a, ci as o, fi as s, hi as c, oi as l, ri as u, ui as d, yi as f, zr as p } from "./admin-startup-DaxvU-L8.js";
//#region node_modules/.pnpm/@radix-ui+react-toggle@1.1.16_@types+react-dom@19.2.3_@types+react@19.2.17__@types+reac_7bd677ec4d4b2da648b71747d0873161/node_modules/@radix-ui/react-toggle/dist/index.mjs
var m = /* @__PURE__ */ e(a(), 1), h = c(), g = Object.defineProperty, _ = (e, t) => g(e, "name", {
	value: t,
	configurable: !0
}), v = "Toggle", y = /* @__PURE__ */ m.forwardRef(/* @__PURE__ */ _(function(e, t) {
	let { pressed: n, defaultPressed: r, onPressedChange: i, ...a } = e, [c, u] = l({
		prop: n,
		onChange: i,
		defaultProp: r ?? !1,
		caller: v
	});
	return /* @__PURE__ */ (0, h.jsx)(s.button, {
		type: "button",
		"aria-pressed": c,
		"data-state": c ? "on" : "off",
		"data-disabled": e.disabled ? "" : void 0,
		...a,
		ref: t,
		onClick: o(e.onClick, () => {
			e.disabled || u(!c);
		})
	});
}, "Toggle")), b = Object.defineProperty, x = (e, t) => b(e, "name", {
	value: t,
	configurable: !0
}), S = "ToggleGroup", [C, w] = d(S, [t]), T = t(), E = /* @__PURE__ */ m.forwardRef(/* @__PURE__ */ x(function(e, t) {
	let { type: n, ...r } = e;
	if (n === "single") return /* @__PURE__ */ (0, h.jsx)(k, {
		role: "radiogroup",
		...r,
		ref: t
	});
	if (n === "multiple") return /* @__PURE__ */ (0, h.jsx)(A, {
		role: "toolbar",
		...r,
		ref: t
	});
	throw Error(`Missing prop \`type\` expected on \`${S}\``);
}, "ToggleGroup")), [D, O] = C(S), k = /* @__PURE__ */ m.forwardRef(/* @__PURE__ */ x(function(e, t) {
	let { value: n, defaultValue: r, onValueChange: i = /* @__PURE__ */ x(() => {}, "onValueChange"), ...a } = e, [o, s] = l({
		prop: n,
		defaultProp: r ?? "",
		onChange: i,
		caller: S
	});
	return /* @__PURE__ */ (0, h.jsx)(D, {
		scope: e.__scopeToggleGroup,
		type: "single",
		value: m.useMemo(() => o ? [o] : [], [o]),
		onItemActivate: s,
		onItemDeactivate: m.useCallback(() => s(""), [s]),
		children: /* @__PURE__ */ (0, h.jsx)(N, {
			...a,
			ref: t
		})
	});
}, "ToggleGroupImplSingle")), A = /* @__PURE__ */ m.forwardRef(/* @__PURE__ */ x(function(e, t) {
	let { value: n, defaultValue: r, onValueChange: i = /* @__PURE__ */ x(() => {}, "onValueChange"), ...a } = e, [o, s] = l({
		prop: n,
		defaultProp: r ?? [],
		onChange: i,
		caller: S
	}), c = m.useCallback((e) => s((t = []) => [...t, e]), [s]), u = m.useCallback((e) => s((t = []) => t.filter((t) => t !== e)), [s]);
	return /* @__PURE__ */ (0, h.jsx)(D, {
		scope: e.__scopeToggleGroup,
		type: "multiple",
		value: o,
		onItemActivate: c,
		onItemDeactivate: u,
		children: /* @__PURE__ */ (0, h.jsx)(N, {
			...a,
			ref: t
		})
	});
}, "ToggleGroupImplMultiple")), [j, M] = C(S), N = /* @__PURE__ */ m.forwardRef(/* @__PURE__ */ x(function(e, t) {
	let { __scopeToggleGroup: n, disabled: r = !1, rovingFocus: a = !0, orientation: o, dir: c, loop: l = !0, ...d } = e, f = T(n), p = u(c), m = {
		dir: p,
		...d
	};
	return /* @__PURE__ */ (0, h.jsx)(j, {
		scope: n,
		rovingFocus: a,
		disabled: r,
		children: a ? /* @__PURE__ */ (0, h.jsx)(i, {
			asChild: !0,
			...f,
			orientation: o,
			dir: p,
			loop: l,
			children: /* @__PURE__ */ (0, h.jsx)(s.div, {
				...m,
				ref: t
			})
		}) : /* @__PURE__ */ (0, h.jsx)(s.div, {
			...m,
			ref: t
		})
	});
}, "ToggleGroupImpl")), P = "ToggleGroupItem", F = /* @__PURE__ */ m.forwardRef(/* @__PURE__ */ x(function(e, t) {
	let n = O(P, e.__scopeToggleGroup), r = M(P, e.__scopeToggleGroup), i = T(e.__scopeToggleGroup), a = n.value.includes(e.value), o = r.disabled || e.disabled, s = {
		...e,
		pressed: a,
		disabled: o
	}, c = m.useRef(null);
	return r.rovingFocus ? /* @__PURE__ */ (0, h.jsx)(p, {
		asChild: !0,
		...i,
		focusable: !o,
		active: a,
		ref: c,
		children: /* @__PURE__ */ (0, h.jsx)(I, {
			...s,
			ref: t
		})
	}) : /* @__PURE__ */ (0, h.jsx)(I, {
		...s,
		ref: t
	});
}, "ToggleGroupItem")), I = /* @__PURE__ */ m.forwardRef(/* @__PURE__ */ x(function(e, t) {
	let { __scopeToggleGroup: n, value: r, ...i } = e, a = O(P, n), o = {
		role: "radio",
		"aria-checked": e.pressed,
		"aria-pressed": void 0
	};
	return /* @__PURE__ */ (0, h.jsx)(y, {
		...a.type === "single" ? o : void 0,
		...i,
		ref: t,
		onPressedChange: (e) => {
			e ? a.onItemActivate(r) : a.onItemDeactivate(r);
		}
	});
}, "ToggleGroupItemImpl")), L = r("mouse-pointer-2", [["path", {
	d: "M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z",
	key: "edeuup"
}]]), R = [
	"top-left",
	"top",
	"top-right",
	"left",
	"center",
	"right",
	"bottom-left",
	"bottom",
	"bottom-right"
];
function z(e, t) {
	let n = e?.settings?.responsiveLayout?.[t], r = n && typeof n == "object" ? n : {}, i = {};
	typeof r.hidden == "boolean" && (i.hidden = r.hidden), (r.position === "relative" || r.position === "absolute") && (i.position = r.position), R.includes(r.anchor) && (i.anchor = r.anchor);
	for (let e of ["width", "height"]) {
		let t = r[e];
		t && [
			"auto",
			"fill",
			"fixed"
		].includes(t.mode) && (i[e] = {
			mode: t.mode,
			...Number.isFinite(t.value) && Number(t.value) >= 0 ? { value: Number(t.value) } : {}
		});
	}
	for (let e of [
		"minWidth",
		"maxWidth",
		"minHeight",
		"maxHeight",
		"padding",
		"paddingBottom",
		"gap"
	]) typeof r[e] == "number" && Number.isFinite(r[e]) && r[e] >= 0 && (i[e] = r[e]);
	for (let e of [
		"widthPercent",
		"heightPercent",
		"minWidthPercent",
		"maxWidthPercent",
		"maxHeightPercent"
	]) typeof r[e] == "number" && Number.isFinite(r[e]) && r[e] >= 0 && r[e] <= 100 && (i[e] = r[e]);
	return r.align && [
		"start",
		"center",
		"end",
		"stretch"
	].includes(r.align) && (i.align = r.align), e?.type === "slot" && e.id === "Header" && i.padding === void 0 && i.paddingBottom === void 0 && (i.paddingBottom = 15), i;
}
function B(e, t) {
	let n = {
		...e,
		...t
	};
	for (let e of ["width", "height"]) {
		let r = e === "width" ? "widthPercent" : "heightPercent";
		Object.prototype.hasOwnProperty.call(t, e) && !Object.prototype.hasOwnProperty.call(t, r) && delete n[r];
	}
	Object.prototype.hasOwnProperty.call(t, "width") && (Object.prototype.hasOwnProperty.call(t, "minWidthPercent") || delete n.minWidthPercent, Object.prototype.hasOwnProperty.call(t, "maxWidthPercent") || delete n.maxWidthPercent);
	for (let e of ["minWidth", "maxWidth"]) {
		let r = e === "minWidth" ? "minWidthPercent" : "maxWidthPercent";
		Object.prototype.hasOwnProperty.call(t, e) && !Object.prototype.hasOwnProperty.call(t, r) && delete n[r];
	}
	return (Object.prototype.hasOwnProperty.call(t, "height") || Object.prototype.hasOwnProperty.call(t, "maxHeight")) && !Object.prototype.hasOwnProperty.call(t, "maxHeightPercent") && delete n.maxHeightPercent, n;
}
//#endregion
//#region src/components/ui/toggle.tsx
var V = f("inline-flex items-center justify-center gap-1.5 rounded-[5px] text-xs font-medium whitespace-nowrap transition-[color,box-shadow] outline-none hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground aria-[checked=true]:bg-accent aria-[checked=true]:text-accent-foreground aria-[pressed=true]:bg-accent aria-[pressed=true]:text-accent-foreground dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
	variants: {
		variant: {
			default: "bg-transparent",
			outline: "border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground"
		},
		size: {
			default: "h-7 min-w-7 px-1.5",
			sm: "h-6 min-w-6 px-1",
			lg: "h-8 min-w-8 px-2"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
}), H = m.createContext({
	size: "default",
	variant: "default",
	spacing: 0
});
function U({ className: e, variant: t, size: r, spacing: i = 0, children: a, ...o }) {
	return /* @__PURE__ */ (0, h.jsx)(E, {
		"data-slot": "toggle-group",
		"data-variant": t,
		"data-size": r,
		"data-spacing": i,
		style: { "--gap": i },
		className: n("group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))] rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs", e),
		...o,
		children: /* @__PURE__ */ (0, h.jsx)(H.Provider, {
			value: {
				variant: t,
				size: r,
				spacing: i
			},
			children: a
		})
	});
}
function W({ className: e, children: t, variant: r, size: i, ...a }) {
	let o = m.useContext(H);
	return /* @__PURE__ */ (0, h.jsx)(F, {
		"data-slot": "toggle-group-item",
		"data-variant": o.variant || r,
		"data-size": o.size || i,
		"data-spacing": o.spacing,
		className: n(V({
			variant: o.variant || r,
			size: o.size || i
		}), "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10", "data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l", e),
		...a,
		children: t
	});
}
//#endregion
export { B as a, z as i, W as n, L as o, R as r, U as t };

//# sourceMappingURL=toggle-group-DsddKQYq.js.map