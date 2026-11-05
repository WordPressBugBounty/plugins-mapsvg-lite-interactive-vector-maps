import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Gr as t, Lr as n, Mr as r, _i as i, ai as a, bi as o, ci as s, fi as c, hi as l, oi as u, ui as d, yi as f } from "./admin-startup-DaxvU-L8.js";
import { t as p } from "./label-C9XVn_0K.js";
//#region node_modules/.pnpm/@radix-ui+react-checkbox@1.3.9_@types+react-dom@19.2.3_@types+react@19.2.17__@types+rea_314b715aaa41f9d689db74f0f2e88755/node_modules/@radix-ui/react-checkbox/dist/index.mjs
var m = /* @__PURE__ */ e(o(), 1), h = l(), g = Object.defineProperty, _ = (e, t) => g(e, "name", {
	value: t,
	configurable: !0
}), v = "Checkbox", [y, b] = d(v), [x, S] = y(v);
function C(e) {
	let { __scopeCheckbox: t, checked: n, children: r, defaultChecked: i, disabled: a, form: o, name: s, onCheckedChange: c, required: l, value: d = "on", internal_do_not_use_render: f } = e, [p, g] = u({
		prop: n,
		defaultProp: i ?? !1,
		onChange: c,
		caller: v
	}), [_, y] = m.useState(null), [b, S] = m.useState(null), C = m.useRef(!1), [w, T] = m.useReducer((e) => e + 1, 0), E = !_ || !!o || !!_.closest("form"), D = {
		checked: p,
		disabled: a,
		setChecked: g,
		control: _,
		setControl: y,
		name: s,
		form: o,
		value: d,
		hasConsumerStoppedPropagationRef: C,
		userInteractionCount: w,
		onUserInteraction: T,
		required: l,
		defaultChecked: !j(i) && i,
		isFormControl: E,
		bubbleInput: b,
		setBubbleInput: S
	};
	return /* @__PURE__ */ (0, h.jsx)(x, {
		scope: t,
		...D,
		children: A(f) ? f(D) : r
	});
}
_(C, "CheckboxProvider");
var w = "CheckboxTrigger", T = /* @__PURE__ */ m.forwardRef(/* @__PURE__ */ _(function({ __scopeCheckbox: e, onKeyDown: t, onClick: n, ...r }, a) {
	let { control: o, value: l, disabled: u, checked: d, required: f, setControl: p, setChecked: g, hasConsumerStoppedPropagationRef: v, onUserInteraction: y, isFormControl: b, bubbleInput: x } = S(w, e), C = i(a, p), T = m.useRef(d);
	return m.useEffect(() => {
		let e = o?.form;
		if (e) {
			let t = /* @__PURE__ */ _(() => g(T.current), "reset");
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [o, g]), /* @__PURE__ */ (0, h.jsx)(c.button, {
		type: "button",
		role: "checkbox",
		"aria-checked": j(d) ? "mixed" : d,
		"aria-required": f,
		"data-state": M(d),
		"data-disabled": u ? "" : void 0,
		disabled: u,
		value: l,
		...r,
		ref: C,
		onKeyDown: s(t, (e) => {
			e.key === "Enter" && e.preventDefault();
		}),
		onClick: s(n, (e) => {
			y(), g((e) => j(e) ? !0 : !e), x && b && (v.current = e.isPropagationStopped(), v.current || e.stopPropagation());
		})
	});
}, "CheckboxTrigger")), E = /* @__PURE__ */ m.forwardRef(/* @__PURE__ */ _(function(e, t) {
	let { __scopeCheckbox: n, name: r, checked: i, defaultChecked: a, required: o, disabled: s, value: c, onCheckedChange: l, form: u, ...d } = e;
	return /* @__PURE__ */ (0, h.jsx)(C, {
		__scopeCheckbox: n,
		checked: i,
		defaultChecked: a,
		disabled: s,
		required: o,
		onCheckedChange: l,
		name: r,
		form: u,
		value: c,
		internal_do_not_use_render: ({ isFormControl: e }) => /* @__PURE__ */ (0, h.jsxs)(h.Fragment, { children: [/* @__PURE__ */ (0, h.jsx)(T, {
			...d,
			ref: t,
			__scopeCheckbox: n
		}), e && /* @__PURE__ */ (0, h.jsx)(ee, { __scopeCheckbox: n })] })
	});
}, "Checkbox")), D = "CheckboxIndicator", O = /* @__PURE__ */ m.forwardRef(/* @__PURE__ */ _(function(e, t) {
	let { __scopeCheckbox: n, forceMount: r, ...i } = e, o = S(D, n);
	return /* @__PURE__ */ (0, h.jsx)(a, {
		present: r || j(o.checked) || o.checked === !0,
		children: /* @__PURE__ */ (0, h.jsx)(c.span, {
			"data-state": M(o.checked),
			"data-disabled": o.disabled ? "" : void 0,
			...i,
			ref: t,
			style: {
				pointerEvents: "none",
				...e.style
			}
		})
	});
}, "CheckboxIndicator")), k = "CheckboxBubbleInput", ee = /* @__PURE__ */ m.forwardRef(/* @__PURE__ */ _(function({ __scopeCheckbox: e, onClick: n, ...r }, a) {
	let { control: o, hasConsumerStoppedPropagationRef: l, userInteractionCount: u, checked: d, defaultChecked: f, required: p, disabled: g, name: _, value: v, form: y, bubbleInput: b, setBubbleInput: x } = S(k, e), C = i(a, x), w = t(o), T = m.useRef(!1), E = m.useRef(d), D = m.useRef(u);
	m.useEffect(() => {
		let e = b;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "checked").set, r = u !== D.current;
		D.current = u;
		let i = E.current !== d;
		E.current = d;
		let a = !(r && l.current);
		if (i && n) {
			T.current = !r;
			let t = new Event("click", { bubbles: a });
			e.indeterminate = j(d), n.call(e, !j(d) && d), e.dispatchEvent(t), T.current = !1;
		}
	}, [
		b,
		d,
		l,
		u
	]);
	let O = m.useRef(!j(d) && d);
	return /* @__PURE__ */ (0, h.jsx)(c.input, {
		type: "checkbox",
		"aria-hidden": !0,
		defaultChecked: f ?? O.current,
		required: p,
		disabled: g,
		name: _,
		value: v,
		form: y,
		...r,
		tabIndex: -1,
		ref: C,
		onClick: s(n, (e) => {
			T.current && e.stopPropagation();
		}),
		style: {
			...r.style,
			...w,
			position: "absolute",
			pointerEvents: "none",
			opacity: 0,
			margin: 0,
			transform: "translateX(-100%)"
		}
	});
}, "CheckboxBubbleInput"));
function A(e) {
	return typeof e == "function";
}
_(A, "isFunction");
function j(e) {
	return e === "indeterminate";
}
_(j, "isIndeterminate");
function M(e) {
	return j(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
_(M, "getState");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-switch@1.3.5_@types+react-dom@19.2.3_@types+react@19.2.17__@types+react_ded3f1d08d07b9b90a2492749639a809/node_modules/@radix-ui/react-switch/dist/index.mjs
var N = Object.defineProperty, P = (e, t) => N(e, "name", {
	value: t,
	configurable: !0
}), F = "Switch", [te, ne] = d(F), [I, L] = te(F);
function R(e) {
	let { __scopeSwitch: t, checked: n, children: r, defaultChecked: i, disabled: a, form: o, name: s, onCheckedChange: c, required: l, value: d = "on", internal_do_not_use_render: f } = e, [p, g] = u({
		prop: n,
		defaultProp: i ?? !1,
		onChange: c,
		caller: F
	}), [_, v] = m.useState(null), [y, b] = m.useState(null), x = m.useRef(!1), [S, C] = m.useReducer((e) => e + 1, 0), w = {
		checked: p,
		setChecked: g,
		disabled: a,
		control: _,
		setControl: v,
		name: s,
		form: o,
		value: d,
		hasConsumerStoppedPropagationRef: x,
		userInteractionCount: S,
		onUserInteraction: C,
		required: l,
		defaultChecked: i,
		isFormControl: !_ || !!o || !!_.closest("form"),
		bubbleInput: y,
		setBubbleInput: b
	};
	return /* @__PURE__ */ (0, h.jsx)(I, {
		scope: t,
		...w,
		children: K(f) ? f(w) : r
	});
}
P(R, "SwitchProvider");
var z = "SwitchTrigger", B = /* @__PURE__ */ m.forwardRef(/* @__PURE__ */ P(function({ __scopeSwitch: e, onClick: t, ...n }, r) {
	let { control: a, form: o, value: l, disabled: u, checked: d, required: f, setControl: p, setChecked: g, hasConsumerStoppedPropagationRef: _, onUserInteraction: v, isFormControl: y, bubbleInput: b } = L(z, e), x = i(r, p), S = m.useRef(d);
	return m.useEffect(() => {
		let e = o ? a?.ownerDocument.getElementById(o) : a?.form;
		if (e instanceof HTMLFormElement) {
			let t = /* @__PURE__ */ P(() => g(S.current), "reset");
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [
		a,
		o,
		g
	]), /* @__PURE__ */ (0, h.jsx)(c.button, {
		type: "button",
		role: "switch",
		"aria-checked": d,
		"aria-required": f,
		"data-state": q(d),
		"data-disabled": u ? "" : void 0,
		disabled: u,
		value: l,
		...n,
		ref: x,
		onClick: s(t, (e) => {
			v(), g((e) => !e), b && y && (_.current = e.isPropagationStopped(), _.current || e.stopPropagation());
		})
	});
}, "SwitchTrigger")), V = /* @__PURE__ */ m.forwardRef(/* @__PURE__ */ P(function(e, t) {
	let { __scopeSwitch: n, name: r, checked: i, defaultChecked: a, required: o, disabled: s, value: c, onCheckedChange: l, form: u, ...d } = e;
	return /* @__PURE__ */ (0, h.jsx)(R, {
		__scopeSwitch: n,
		checked: i,
		defaultChecked: a,
		disabled: s,
		required: o,
		onCheckedChange: l,
		name: r,
		form: u,
		value: c,
		internal_do_not_use_render: ({ isFormControl: e }) => /* @__PURE__ */ (0, h.jsxs)(h.Fragment, { children: [/* @__PURE__ */ (0, h.jsx)(B, {
			...d,
			ref: t,
			__scopeSwitch: n
		}), e && /* @__PURE__ */ (0, h.jsx)(G, { __scopeSwitch: n })] })
	});
}, "Switch")), H = "SwitchThumb", U = /* @__PURE__ */ m.forwardRef(/* @__PURE__ */ P(function(e, t) {
	let { __scopeSwitch: n, ...r } = e, i = L(H, n);
	return /* @__PURE__ */ (0, h.jsx)(c.span, {
		"data-state": q(i.checked),
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: t
	});
}, "SwitchThumb")), W = "SwitchBubbleInput", G = /* @__PURE__ */ m.forwardRef(/* @__PURE__ */ P(function({ __scopeSwitch: e, onClick: n, ...r }, a) {
	let { control: o, hasConsumerStoppedPropagationRef: l, userInteractionCount: u, checked: d, defaultChecked: f, required: p, disabled: g, name: _, value: v, form: y, bubbleInput: b, setBubbleInput: x } = L(W, e), S = i(a, x), C = t(o), w = m.useRef(!1), T = m.useRef(d), E = m.useRef(u);
	m.useEffect(() => {
		let e = b;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "checked").set, r = u !== E.current;
		E.current = u;
		let i = T.current !== d;
		T.current = d;
		let a = !(r && l.current);
		if (i && n) {
			w.current = !r;
			let t = new Event("click", { bubbles: a });
			n.call(e, d), e.dispatchEvent(t), w.current = !1;
		}
	}, [
		b,
		d,
		l,
		u
	]);
	let D = m.useRef(d);
	return /* @__PURE__ */ (0, h.jsx)(c.input, {
		type: "checkbox",
		"aria-hidden": !0,
		defaultChecked: f ?? D.current,
		required: p,
		disabled: g,
		name: _,
		value: v,
		form: y,
		...r,
		tabIndex: -1,
		ref: S,
		onClick: s(n, (e) => {
			w.current && e.stopPropagation();
		}),
		style: {
			...r.style,
			...C,
			position: "absolute",
			pointerEvents: "none",
			opacity: 0,
			margin: 0,
			transform: "translateX(-100%)"
		}
	});
}, "SwitchBubbleInput"));
function K(e) {
	return typeof e == "function";
}
P(K, "isFunction");
function q(e) {
	return e ? "checked" : "unchecked";
}
P(q, "getState");
//#endregion
//#region src/components/ui/field.tsx
function J({ className: e, ...t }) {
	return /* @__PURE__ */ (0, h.jsx)("div", {
		"data-slot": "field-group",
		className: n("group/field-group @container/field-group flex min-w-0 w-full max-w-full flex-col gap-5 data-[slot=checkbox-group]:gap-2.5 [&>[data-slot=field-group]]:gap-3", e),
		...t
	});
}
var re = f("group/field flex min-w-0 w-full max-w-full gap-2 data-[invalid=true]:text-destructive", {
	variants: { orientation: {
		vertical: ["flex-col [&>*]:w-full [&>.sr-only]:w-auto"],
		horizontal: [
			"flex-row items-center",
			"[&>[data-slot=field-label]]:flex-auto",
			"has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
		],
		responsive: [
			"flex-col @md/field-group:flex-row @md/field-group:items-center [&>*]:w-full @md/field-group:[&>*]:w-auto [&>.sr-only]:w-auto",
			"@md/field-group:[&>[data-slot=field-label]]:flex-auto",
			"@md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px"
		]
	} },
	defaultVariants: { orientation: "vertical" }
});
function Y({ className: e, orientation: t = "vertical", ...r }) {
	return /* @__PURE__ */ (0, h.jsx)("div", {
		role: "group",
		"data-slot": "field",
		"data-orientation": t,
		className: n(re({ orientation: t }), e),
		...r
	});
}
function X({ className: e, ...t }) {
	return /* @__PURE__ */ (0, h.jsx)("div", {
		"data-slot": "field-content",
		className: n("group/field-content flex min-w-0 max-w-full flex-1 flex-col gap-1 leading-snug", e),
		...t
	});
}
function Z({ className: e, ...t }) {
	return /* @__PURE__ */ (0, h.jsx)(p, {
		"data-slot": "field-label",
		className: n("group/field-label peer/field-label flex min-w-0 w-fit max-w-full gap-2 leading-snug group-data-[disabled=true]/field:opacity-50", "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border [&>*]:data-[slot=field]:p-4", "has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 dark:has-data-[state=checked]:bg-primary/10", e),
		...t
	});
}
function ie({ className: e, ...t }) {
	return /* @__PURE__ */ (0, h.jsx)("div", {
		"data-slot": "field-label",
		className: n("flex w-fit items-center gap-1.5 text-xs leading-snug font-medium group-data-[disabled=true]/field:opacity-50", e),
		...t
	});
}
function Q({ className: e, ...t }) {
	return /* @__PURE__ */ (0, h.jsx)("p", {
		"data-slot": "field-description",
		className: n("text-xs leading-normal font-normal text-muted-foreground group-has-[[data-orientation=horizontal]]/field:text-balance", "last:mt-0 nth-last-2:-mt-1 [[data-variant=legend]+&]:-mt-1.5", "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary", e),
		...t
	});
}
function ae({ className: e, children: t, errors: r, ...i }) {
	let a = (0, m.useMemo)(() => {
		if (t) return t;
		if (!r?.length) return null;
		let e = [...new Map(r.map((e) => [e?.message, e])).values()];
		return e?.length == 1 ? e[0]?.message : /* @__PURE__ */ (0, h.jsx)("ul", {
			className: "ml-4 flex list-disc flex-col gap-1",
			children: e.map((e, t) => e?.message && /* @__PURE__ */ (0, h.jsx)("li", { children: e.message }, t))
		});
	}, [t, r]);
	return a ? /* @__PURE__ */ (0, h.jsx)("div", {
		role: "alert",
		"data-slot": "field-error",
		className: n("text-xs font-normal text-destructive", e),
		...i,
		children: a
	}) : null;
}
//#endregion
//#region src/components/ui/checkbox.tsx
function $({ className: e, ...t }) {
	return /* @__PURE__ */ (0, h.jsx)(E, {
		"data-slot": "checkbox",
		className: n("peer size-4 shrink-0 rounded-[4px] border border-input shadow-xs transition-[background-color,border-color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[state=checked]:border-foreground/20 data-[state=checked]:bg-muted data-[state=checked]:text-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:data-[state=checked]:bg-muted", e),
		...t,
		children: /* @__PURE__ */ (0, h.jsx)(O, {
			"data-slot": "checkbox-indicator",
			className: "grid place-content-center text-current transition-none",
			children: /* @__PURE__ */ (0, h.jsx)(r, { className: "size-3" })
		})
	});
}
//#endregion
//#region src/components/ui/switch.tsx
function oe({ className: e, size: t = "default", ...r }) {
	return /* @__PURE__ */ (0, h.jsx)(V, {
		"data-slot": "switch",
		"data-size": t,
		className: n("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent transition-all outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-3.5 data-[size=default]:w-6 data-[size=sm]:h-3 data-[size=sm]:w-5 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", e),
		...r,
		children: /* @__PURE__ */ (0, h.jsx)(U, {
			"data-slot": "switch-thumb",
			className: n("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-3 group-data-[size=sm]/switch:size-2.5 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
//#endregion
//#region src/components/settings-form/SettingsControlField.tsx
function se({ id: e, label: t, help: n, disabled: r, className: i, children: a }) {
	return /* @__PURE__ */ (0, h.jsxs)(Y, {
		orientation: "vertical",
		"data-disabled": r || void 0,
		className: i,
		children: [t ? /* @__PURE__ */ (0, h.jsx)(Z, {
			htmlFor: e,
			"data-role": "settings-input-label",
			className: "text-[11px] leading-4 font-normal text-foreground/55",
			children: t
		}) : null, /* @__PURE__ */ (0, h.jsxs)(X, { children: [a, n ? /* @__PURE__ */ (0, h.jsx)(Q, { children: n }) : null] })]
	});
}
function ce({ id: e, label: t, help: r, disabled: i, className: a, checked: o, onCheckedChange: s, "aria-label": c }) {
	return /* @__PURE__ */ (0, h.jsxs)(Y, {
		orientation: "horizontal",
		"data-disabled": i || void 0,
		className: n("items-start justify-start gap-2", a),
		children: [/* @__PURE__ */ (0, h.jsx)($, {
			id: e,
			"aria-label": c,
			checked: o,
			disabled: i,
			className: "mt-0.5",
			onCheckedChange: (e) => s(e === !0)
		}), /* @__PURE__ */ (0, h.jsxs)(X, {
			className: "translate-y-px",
			children: [t ? /* @__PURE__ */ (0, h.jsx)(Z, {
				htmlFor: e,
				className: "font-normal",
				children: t
			}) : null, r ? /* @__PURE__ */ (0, h.jsx)(Q, { children: r }) : null]
		})]
	});
}
//#endregion
export { Y as a, ae as c, ie as d, $ as i, J as l, se as n, X as o, oe as r, Q as s, ce as t, Z as u };

//# sourceMappingURL=SettingsControlField-BtpHWA60.js.map