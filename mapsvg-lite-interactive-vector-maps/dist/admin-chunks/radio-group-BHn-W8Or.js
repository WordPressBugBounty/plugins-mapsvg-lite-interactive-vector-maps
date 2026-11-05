import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Br as t, Gr as n, Lr as r, Rr as i, _i as a, ai as o, bi as s, ci as c, fi as l, hi as u, jr as d, oi as f, ri as p, ui as m, zr as h } from "./admin-startup-DaxvU-L8.js";
//#region node_modules/.pnpm/@radix-ui+react-radio-group@1.4.5_@types+react-dom@19.2.3_@types+react@19.2.17__@types+_7a1ca473fd53e55e6b70c05b7875acfb/node_modules/@radix-ui/react-radio-group/dist/index.mjs
var g = /* @__PURE__ */ e(s(), 1), _ = u(), v = Object.defineProperty, y = (e, t) => v(e, "name", {
	value: t,
	configurable: !0
}), b = "Radio", [x, S] = m(b), [C, w] = x(b);
function T(e) {
	let { __scopeRadio: t, checked: n = !1, children: r, disabled: i, form: a, name: o, onCheck: s, required: c, value: l = "on", internal_do_not_use_render: u } = e, [d, f] = g.useState(null), [p, m] = g.useState(null), h = g.useRef(!1), [v, b] = g.useReducer((e) => e + 1, 0), x = {
		checked: n,
		disabled: i,
		required: c,
		name: o,
		form: a,
		value: l,
		control: d,
		setControl: f,
		hasConsumerStoppedPropagationRef: h,
		userInteractionCount: v,
		onUserInteraction: b,
		isFormControl: !d || !!a || !!d.closest("form"),
		bubbleInput: p,
		setBubbleInput: m,
		onCheck: /* @__PURE__ */ y(() => s?.(), "onCheck")
	};
	return /* @__PURE__ */ (0, _.jsx)(C, {
		scope: t,
		...x,
		children: M(u) ? u(x) : r
	});
}
y(T, "RadioProvider");
var E = "RadioTrigger", D = /* @__PURE__ */ g.forwardRef(/* @__PURE__ */ y(function({ __scopeRadio: e, onClick: t, ...n }, r) {
	let { checked: i, disabled: o, value: s, setControl: u, onCheck: d, hasConsumerStoppedPropagationRef: f, onUserInteraction: p, isFormControl: m, bubbleInput: h } = w(E, e), g = a(r, u);
	return /* @__PURE__ */ (0, _.jsx)(l.button, {
		type: "button",
		role: "radio",
		"aria-checked": i,
		"data-state": N(i),
		"data-disabled": o ? "" : void 0,
		disabled: o,
		value: s,
		...n,
		ref: g,
		onClick: c(t, (e) => {
			i || (p(), d()), h && m && (f.current = e.isPropagationStopped(), f.current || e.stopPropagation());
		})
	});
}, "RadioTrigger")), O = "RadioIndicator", k = /* @__PURE__ */ g.forwardRef(/* @__PURE__ */ y(function(e, t) {
	let { __scopeRadio: n, forceMount: r, ...i } = e, a = w(O, n);
	return /* @__PURE__ */ (0, _.jsx)(o, {
		present: r || a.checked,
		children: /* @__PURE__ */ (0, _.jsx)(l.span, {
			"data-state": N(a.checked),
			"data-disabled": a.disabled ? "" : void 0,
			...i,
			ref: t
		})
	});
}, "RadioIndicator")), A = "RadioBubbleInput", j = /* @__PURE__ */ g.forwardRef(/* @__PURE__ */ y(function({ __scopeRadio: e, onClick: t, ...r }, i) {
	let { control: o, checked: s, required: u, disabled: d, name: f, value: p, form: m, bubbleInput: h, setBubbleInput: v, hasConsumerStoppedPropagationRef: y, userInteractionCount: b } = w(A, e), x = a(i, v), S = n(o), C = g.useRef(!1), T = g.useRef(s), E = g.useRef(b);
	g.useEffect(() => {
		let e = h;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "checked").set, r = b !== E.current;
		E.current = b;
		let i = T.current !== s;
		T.current = s;
		let a = !(r && y.current);
		if (i && n) {
			C.current = !r;
			let t = new Event("click", { bubbles: a });
			n.call(e, s), e.dispatchEvent(t), C.current = !1;
		}
	}, [
		h,
		s,
		y,
		b
	]);
	let D = g.useRef(s);
	return /* @__PURE__ */ (0, _.jsx)(l.input, {
		type: "radio",
		"aria-hidden": !0,
		defaultChecked: D.current,
		required: u,
		disabled: d,
		name: f,
		value: p,
		form: m,
		...r,
		tabIndex: -1,
		ref: x,
		onClick: c(t, (e) => {
			C.current && e.stopPropagation();
		}),
		style: {
			...r.style,
			...S,
			position: "absolute",
			pointerEvents: "none",
			opacity: 0,
			margin: 0,
			transform: "translateX(-100%)"
		}
	});
}, "RadioBubbleInput"));
function M(e) {
	return typeof e == "function";
}
y(M, "isFunction");
function N(e) {
	return e ? "checked" : "unchecked";
}
y(N, "getState");
var P = [
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight"
], F = "RadioGroup", [I, L] = m(F, [t, S]), R = t(), z = S(), [B, V] = I(F), H = /* @__PURE__ */ g.forwardRef(/* @__PURE__ */ y(function(e, t) {
	let { __scopeRadioGroup: n, name: r, form: o, defaultValue: s, value: c, required: u = !1, disabled: d = !1, orientation: m, dir: h, loop: v = !0, onValueChange: b, ...x } = e, S = R(n), C = p(h), [w, T] = f({
		prop: c,
		defaultProp: s ?? null,
		onChange: b,
		caller: F
	}), [E, D] = g.useState(null), O = a(t, D), k = g.useRef(w);
	return g.useEffect(() => {
		let e = o ? E?.ownerDocument.getElementById(o) : E?.closest("form");
		if (e instanceof HTMLFormElement) {
			let t = /* @__PURE__ */ y(() => T(k.current), "reset");
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [
		E,
		o,
		T
	]), /* @__PURE__ */ (0, _.jsx)(B, {
		scope: n,
		name: r,
		form: o,
		required: u,
		disabled: d,
		value: w,
		onValueChange: T,
		children: /* @__PURE__ */ (0, _.jsx)(i, {
			asChild: !0,
			...S,
			orientation: m,
			dir: C,
			loop: v,
			children: /* @__PURE__ */ (0, _.jsx)(l.div, {
				role: "radiogroup",
				"aria-required": u,
				"aria-orientation": m,
				"data-disabled": d ? "" : void 0,
				dir: C,
				...x,
				ref: O
			})
		})
	});
}, "RadioGroup")), U = "RadioGroupItemProvider", W = "RadioGroupItemTrigger";
function G(e) {
	let { __scopeRadioGroup: t, value: n, disabled: r, children: i, internal_do_not_use_render: a } = e, o = V(U, t), s = z(t), c = o.disabled || r;
	return /* @__PURE__ */ (0, _.jsx)(T, {
		...s,
		checked: o.value === n,
		disabled: c,
		required: o.required,
		name: o.name,
		form: o.form,
		value: n,
		onCheck: () => o.onValueChange(n),
		internal_do_not_use_render: a,
		children: i
	});
}
y(G, "RadioGroupItemProvider");
var K = /* @__PURE__ */ g.forwardRef(/* @__PURE__ */ y(function(e, t) {
	let { __scopeRadioGroup: n, ...r } = e, i = R(n), o = z(n), { checked: s, disabled: l } = w(W, o.__scopeRadio), u = g.useRef(null), d = a(t, u), f = g.useRef(!1);
	return g.useEffect(() => {
		let e = /* @__PURE__ */ y((e) => {
			P.includes(e.key) && (f.current = !0);
		}, "handleKeyDown"), t = /* @__PURE__ */ y(() => f.current = !1, "handleKeyUp");
		return document.addEventListener("keydown", e), document.addEventListener("keyup", t), () => {
			document.removeEventListener("keydown", e), document.removeEventListener("keyup", t);
		};
	}, []), /* @__PURE__ */ (0, _.jsx)(h, {
		asChild: !0,
		...i,
		focusable: !l,
		active: s,
		children: /* @__PURE__ */ (0, _.jsx)(D, {
			...o,
			...r,
			ref: d,
			onKeyDown: c(r.onKeyDown, (e) => {
				e.key === "Enter" && e.preventDefault();
			}),
			onFocus: c(r.onFocus, () => {
				f.current && u.current?.click();
			})
		})
	});
}, "RadioGroupItemTrigger")), q = /* @__PURE__ */ g.forwardRef(/* @__PURE__ */ y(function(e, t) {
	let { __scopeRadioGroup: n, value: r, disabled: i, ...a } = e;
	return /* @__PURE__ */ (0, _.jsx)(G, {
		__scopeRadioGroup: n,
		value: r,
		disabled: i,
		internal_do_not_use_render: ({ isFormControl: e }) => /* @__PURE__ */ (0, _.jsxs)(_.Fragment, { children: [/* @__PURE__ */ (0, _.jsx)(K, {
			...a,
			ref: t,
			__scopeRadioGroup: n
		}), e && /* @__PURE__ */ (0, _.jsx)(J, { __scopeRadioGroup: n })] })
	});
}, "RadioGroupItem")), J = /* @__PURE__ */ g.forwardRef(/* @__PURE__ */ y(function(e, t) {
	let { __scopeRadioGroup: n, ...r } = e;
	return /* @__PURE__ */ (0, _.jsx)(j, {
		...z(n),
		...r,
		ref: t
	});
}, "RadioGroupItemBubbleInput")), Y = /* @__PURE__ */ g.forwardRef(/* @__PURE__ */ y(function(e, t) {
	let { __scopeRadioGroup: n, ...r } = e;
	return /* @__PURE__ */ (0, _.jsx)(k, {
		...z(n),
		...r,
		ref: t
	});
}, "RadioGroupIndicator"));
//#endregion
//#region src/components/ui/radio-group.tsx
function X({ className: e, ...t }) {
	return /* @__PURE__ */ (0, _.jsx)(H, {
		"data-slot": "radio-group",
		className: r("grid gap-3", e),
		...t
	});
}
function Z({ className: e, ...t }) {
	return /* @__PURE__ */ (0, _.jsx)(q, {
		"data-slot": "radio-group-item",
		className: r("aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40", e),
		...t,
		children: /* @__PURE__ */ (0, _.jsx)(Y, {
			"data-slot": "radio-group-indicator",
			className: "relative flex items-center justify-center",
			children: /* @__PURE__ */ (0, _.jsx)(d, { className: "absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-primary" })
		})
	});
}
//#endregion
export { Z as n, q as r, X as t };

//# sourceMappingURL=radio-group-BHn-W8Or.js.map