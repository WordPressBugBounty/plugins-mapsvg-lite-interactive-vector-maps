import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Fr as t, Jr as n, Kr as r, Lr as i, Mr as a, Pr as o, Yr as s, bi as c, fi as l, gi as u, hi as d, ii as f, qr as p, yr as m } from "./admin-startup-D4zZmPq_.js";
import { i as h, r as g, t as _ } from "./popover-DPTHd16N.js";
import { r as v, t as y } from "./radio-group-D0tNIHyZ.js";
var b = o("chevrons-up-down", [["path", {
	d: "m7 15 5 5 5-5",
	key: "1hf1tw"
}], ["path", {
	d: "m7 9 5-5 5 5",
	key: "sgt6xg"
}]]), x = /* @__PURE__ */ e(c(), 1), S = 1, C = .9, w = .8, T = .17, E = .1, D = .999, O = .9999, k = .99, A = /[\\\/_+.#"@\[\(\{&]/, j = /[\\\/_+.#"@\[\(\{&]/g, M = /[\s-]/, N = /[\s-]/g;
function P(e, t, n, r, i, a, o) {
	if (a === t.length) return i === e.length ? S : k;
	var s = `${i},${a}`;
	if (o[s] !== void 0) return o[s];
	for (var c = r.charAt(a), l = n.indexOf(c, i), u = 0, d, f, p, m; l >= 0;) d = P(e, t, n, r, l + 1, a + 1, o), d > u && (l === i ? d *= S : A.test(e.charAt(l - 1)) ? (d *= w, p = e.slice(i, l - 1).match(j), p && i > 0 && (d *= D ** +p.length)) : M.test(e.charAt(l - 1)) ? (d *= C, m = e.slice(i, l - 1).match(N), m && i > 0 && (d *= D ** +m.length)) : (d *= T, i > 0 && (d *= D ** +(l - i))), e.charAt(l) !== t.charAt(a) && (d *= O)), (d < E && n.charAt(l - 1) === r.charAt(a + 1) || r.charAt(a + 1) === r.charAt(a) && n.charAt(l - 1) !== r.charAt(a)) && (f = P(e, t, n, r, l + 1, a + 2, o), f * E > d && (d = f * E)), d > u && (u = d), l = n.indexOf(c, l + 1);
	return o[s] = u, u;
}
function F(e) {
	return e.toLowerCase().replace(N, " ");
}
function I(e, t, n) {
	return e = n && n.length > 0 ? `${e + " " + n.join(" ")}` : e, P(e, t, F(e), F(t), 0, 0, {});
}
//#endregion
//#region node_modules/.pnpm/cmdk@1.1.1_@types+react-dom@19.2.3_@types+react@19.2.17__@types+react@19.2.17_react-dom_60d538ac8b3b3d77a9a153b095ee057f/node_modules/cmdk/dist/index.mjs
var L = "[cmdk-group=\"\"]", ee = "[cmdk-group-items=\"\"]", te = "[cmdk-group-heading=\"\"]", ne = "[cmdk-item=\"\"]", re = `${ne}:not([aria-disabled="true"])`, R = "cmdk-item-select", z = "data-value", ie = (e, t, n) => I(e, t, n), ae = x.createContext(void 0), B = () => x.useContext(ae), oe = x.createContext(void 0), V = () => x.useContext(oe), H = x.createContext(void 0), U = x.forwardRef((e, t) => {
	let n = K(() => ({
		search: "",
		value: e.value ?? e.defaultValue ?? "",
		selectedItemId: void 0,
		filtered: {
			count: 0,
			items: /* @__PURE__ */ new Map(),
			groups: /* @__PURE__ */ new Set()
		}
	})), r = K(() => /* @__PURE__ */ new Set()), i = K(() => /* @__PURE__ */ new Map()), a = K(() => /* @__PURE__ */ new Map()), o = K(() => /* @__PURE__ */ new Set()), s = _e(e), { label: c, children: u, value: d, onValueChange: p, filter: m, shouldFilter: h, loop: g, disablePointerSelection: _ = !1, vimBindings: v = !0, ...y } = e, b = f(), S = f(), C = f(), w = x.useRef(null), T = ye();
	G(() => {
		if (d !== void 0) {
			let e = d.trim();
			n.current.value = e, E.emit();
		}
	}, [d]), G(() => {
		T(6, M);
	}, []);
	let E = x.useMemo(() => ({
		subscribe: (e) => (o.current.add(e), () => o.current.delete(e)),
		snapshot: () => n.current,
		setState: (e, t, r) => {
			var i, a, o;
			if (!Object.is(n.current[e], t)) {
				if (n.current[e] = t, e === "search") j(), k(), T(1, A);
				else if (e === "value") {
					if (document.activeElement.hasAttribute("cmdk-input") || document.activeElement.hasAttribute("cmdk-root")) {
						let e = document.getElementById(C);
						e ? e.focus() : (i = document.getElementById(b)) == null || i.focus();
					}
					if (T(7, () => {
						n.current.selectedItemId = N()?.id, E.emit();
					}), r || T(5, M), s.current?.value !== void 0) {
						let e = t ?? "";
						(o = (a = s.current).onValueChange) == null || o.call(a, e);
						return;
					}
				}
				E.emit();
			}
		},
		emit: () => {
			o.current.forEach((e) => e());
		}
	}), []), D = x.useMemo(() => ({
		value: (e, t, r) => {
			t !== a.current.get(e)?.value && (a.current.set(e, {
				value: t,
				keywords: r
			}), n.current.filtered.items.set(e, O(t, r)), T(2, () => {
				k(), E.emit();
			}));
		},
		item: (e, t) => (r.current.add(e), t && (i.current.has(t) ? i.current.get(t).add(e) : i.current.set(t, /* @__PURE__ */ new Set([e]))), T(3, () => {
			j(), k(), n.current.value || A(), E.emit();
		}), () => {
			a.current.delete(e), r.current.delete(e), n.current.filtered.items.delete(e);
			let t = N();
			T(4, () => {
				j(), t?.getAttribute("id") === e && A(), E.emit();
			});
		}),
		group: (e) => (i.current.has(e) || i.current.set(e, /* @__PURE__ */ new Set()), () => {
			a.current.delete(e), i.current.delete(e);
		}),
		filter: () => s.current.shouldFilter,
		label: c || e["aria-label"],
		getDisablePointerSelection: () => s.current.disablePointerSelection,
		listId: b,
		inputId: C,
		labelId: S,
		listInnerRef: w
	}), []);
	function O(e, t) {
		let r = s.current?.filter ?? ie;
		return e ? r(e, n.current.search, t) : 0;
	}
	function k() {
		if (!n.current.search || s.current.shouldFilter === !1) return;
		let e = n.current.filtered.items, t = [];
		n.current.filtered.groups.forEach((n) => {
			let r = i.current.get(n), a = 0;
			r.forEach((t) => {
				let n = e.get(t);
				a = Math.max(n, a);
			}), t.push([n, a]);
		});
		let r = w.current;
		P().sort((t, n) => {
			let r = t.getAttribute("id"), i = n.getAttribute("id");
			return (e.get(i) ?? 0) - (e.get(r) ?? 0);
		}).forEach((e) => {
			let t = e.closest(ee);
			t ? t.appendChild(e.parentElement === t ? e : e.closest(`${ee} > *`)) : r.appendChild(e.parentElement === r ? e : e.closest(`${ee} > *`));
		}), t.sort((e, t) => t[1] - e[1]).forEach((e) => {
			let t = w.current?.querySelector(`${L}[${z}="${encodeURIComponent(e[0])}"]`);
			t?.parentElement.appendChild(t);
		});
	}
	function A() {
		let e = P().find((e) => e.getAttribute("aria-disabled") !== "true")?.getAttribute(z);
		E.setState("value", e || void 0);
	}
	function j() {
		if (!n.current.search || s.current.shouldFilter === !1) {
			n.current.filtered.count = r.current.size;
			return;
		}
		n.current.filtered.groups = /* @__PURE__ */ new Set();
		let e = 0;
		for (let t of r.current) {
			let r = O(a.current.get(t)?.value ?? "", a.current.get(t)?.keywords ?? []);
			n.current.filtered.items.set(t, r), r > 0 && e++;
		}
		for (let [e, t] of i.current) for (let r of t) if (n.current.filtered.items.get(r) > 0) {
			n.current.filtered.groups.add(e);
			break;
		}
		n.current.filtered.count = e;
	}
	function M() {
		var e;
		let t = N();
		t && (t.parentElement?.firstChild === t && ((e = t.closest(L)?.querySelector(te)) == null || e.scrollIntoView({ block: "nearest" })), t.scrollIntoView({ block: "nearest" }));
	}
	function N() {
		return w.current?.querySelector(`${ne}[aria-selected="true"]`);
	}
	function P() {
		return Array.from(w.current?.querySelectorAll(re) || []);
	}
	function F(e) {
		let t = P()[e];
		t && E.setState("value", t.getAttribute(z));
	}
	function I(e) {
		var t;
		let n = N(), r = P(), i = r.findIndex((e) => e === n), a = r[i + e];
		(t = s.current) != null && t.loop && (a = i + e < 0 ? r[r.length - 1] : i + e === r.length ? r[0] : r[i + e]), a && E.setState("value", a.getAttribute(z));
	}
	function B(e) {
		let t = N()?.closest(L), n;
		for (; t && !n;) t = e > 0 ? he(t, L) : ge(t, L), n = t?.querySelector(re);
		n ? E.setState("value", n.getAttribute(z)) : I(e);
	}
	let V = () => F(P().length - 1), H = (e) => {
		e.preventDefault(), e.metaKey ? V() : e.altKey ? B(1) : I(1);
	}, U = (e) => {
		e.preventDefault(), e.metaKey ? F(0) : e.altKey ? B(-1) : I(-1);
	};
	return x.createElement(l.div, {
		ref: t,
		tabIndex: -1,
		...y,
		"cmdk-root": "",
		onKeyDown: (e) => {
			var t;
			(t = y.onKeyDown) == null || t.call(y, e);
			let n = e.nativeEvent.isComposing || e.keyCode === 229;
			if (!(e.defaultPrevented || n)) switch (e.key) {
				case "n":
				case "j":
					v && e.ctrlKey && H(e);
					break;
				case "ArrowDown":
					H(e);
					break;
				case "p":
				case "k":
					v && e.ctrlKey && U(e);
					break;
				case "ArrowUp":
					U(e);
					break;
				case "Home":
					e.preventDefault(), F(0);
					break;
				case "End":
					e.preventDefault(), V();
					break;
				case "Enter": {
					e.preventDefault();
					let t = N();
					if (t) {
						let e = new Event(R);
						t.dispatchEvent(e);
					}
				}
			}
		}
	}, x.createElement("label", {
		"cmdk-label": "",
		htmlFor: D.inputId,
		id: D.labelId,
		style: xe
	}, c), J(e, (e) => x.createElement(oe.Provider, { value: E }, x.createElement(ae.Provider, { value: D }, e))));
}), se = x.forwardRef((e, t) => {
	let n = f(), r = x.useRef(null), i = x.useContext(H), a = B(), o = _e(e), s = o.current?.forceMount ?? i?.forceMount;
	G(() => {
		if (!s) return a.item(n, i?.id);
	}, [s]);
	let c = ve(n, r, [
		e.value,
		e.children,
		r
	], e.keywords), d = V(), p = q((e) => e.value && e.value === c.current), m = q((e) => s || a.filter() === !1 ? !0 : !e.search || e.filtered.items.get(n) > 0);
	x.useEffect(() => {
		let t = r.current;
		if (!(!t || e.disabled)) return t.addEventListener(R, h), () => t.removeEventListener(R, h);
	}, [
		m,
		e.onSelect,
		e.disabled
	]);
	function h() {
		var e, t;
		g(), (t = (e = o.current).onSelect) == null || t.call(e, c.current);
	}
	function g() {
		d.setState("value", c.current, !0);
	}
	if (!m) return null;
	let { disabled: _, value: v, onSelect: y, forceMount: b, keywords: S, ...C } = e;
	return x.createElement(l.div, {
		ref: u(r, t),
		...C,
		id: n,
		"cmdk-item": "",
		role: "option",
		"aria-disabled": !!_,
		"aria-selected": !!p,
		"data-disabled": !!_,
		"data-selected": !!p,
		onPointerMove: _ || a.getDisablePointerSelection() ? void 0 : g,
		onClick: _ ? void 0 : h
	}, e.children);
}), ce = x.forwardRef((e, t) => {
	let { heading: n, children: r, forceMount: i, ...a } = e, o = f(), s = x.useRef(null), c = x.useRef(null), d = f(), p = B(), m = q((e) => i || p.filter() === !1 ? !0 : !e.search || e.filtered.groups.has(o));
	G(() => p.group(o), []), ve(o, s, [
		e.value,
		e.heading,
		c
	]);
	let h = x.useMemo(() => ({
		id: o,
		forceMount: i
	}), [i]);
	return x.createElement(l.div, {
		ref: u(s, t),
		...a,
		"cmdk-group": "",
		role: "presentation",
		hidden: !m || void 0
	}, n && x.createElement("div", {
		ref: c,
		"cmdk-group-heading": "",
		"aria-hidden": !0,
		id: d
	}, n), J(e, (e) => x.createElement("div", {
		"cmdk-group-items": "",
		role: "group",
		"aria-labelledby": n ? d : void 0
	}, x.createElement(H.Provider, { value: h }, e))));
}), le = x.forwardRef((e, t) => {
	let { alwaysRender: n, ...r } = e, i = x.useRef(null), a = q((e) => !e.search);
	return !n && !a ? null : x.createElement(l.div, {
		ref: u(i, t),
		...r,
		"cmdk-separator": "",
		role: "separator"
	});
}), ue = x.forwardRef((e, t) => {
	let { onValueChange: n, ...r } = e, i = e.value != null, a = V(), o = q((e) => e.search), s = q((e) => e.selectedItemId), c = B();
	return x.useEffect(() => {
		e.value != null && a.setState("search", e.value);
	}, [e.value]), x.createElement(l.input, {
		ref: t,
		...r,
		"cmdk-input": "",
		autoComplete: "off",
		autoCorrect: "off",
		spellCheck: !1,
		"aria-autocomplete": "list",
		role: "combobox",
		"aria-expanded": !0,
		"aria-controls": c.listId,
		"aria-labelledby": c.labelId,
		"aria-activedescendant": s,
		id: c.inputId,
		type: "text",
		value: i ? e.value : o,
		onChange: (e) => {
			i || a.setState("search", e.target.value), n?.(e.target.value);
		}
	});
}), de = x.forwardRef((e, t) => {
	let { children: n, label: r = "Suggestions", ...i } = e, a = x.useRef(null), o = x.useRef(null), s = q((e) => e.selectedItemId), c = B();
	return x.useEffect(() => {
		if (o.current && a.current) {
			let e = o.current, t = a.current, n, r = new ResizeObserver(() => {
				n = requestAnimationFrame(() => {
					let n = e.offsetHeight;
					t.style.setProperty("--cmdk-list-height", n.toFixed(1) + "px");
				});
			});
			return r.observe(e), () => {
				cancelAnimationFrame(n), r.unobserve(e);
			};
		}
	}, []), x.createElement(l.div, {
		ref: u(a, t),
		...i,
		"cmdk-list": "",
		role: "listbox",
		tabIndex: -1,
		"aria-activedescendant": s,
		"aria-label": r,
		id: c.listId
	}, J(e, (e) => x.createElement("div", {
		ref: u(o, c.listInnerRef),
		"cmdk-list-sizer": ""
	}, e)));
}), fe = x.forwardRef((e, t) => {
	let { open: i, onOpenChange: a, overlayClassName: o, contentClassName: c, container: l, ...u } = e;
	return x.createElement(r, {
		open: i,
		onOpenChange: a
	}, x.createElement(s, { container: l }, x.createElement(n, {
		"cmdk-overlay": "",
		className: o
	}), x.createElement(p, {
		"aria-label": e.label,
		"cmdk-dialog": "",
		className: c
	}, x.createElement(U, {
		ref: t,
		...u
	}))));
}), pe = x.forwardRef((e, t) => q((e) => e.filtered.count === 0) ? x.createElement(l.div, {
	ref: t,
	...e,
	"cmdk-empty": "",
	role: "presentation"
}) : null), me = x.forwardRef((e, t) => {
	let { progress: n, children: r, label: i = "Loading...", ...a } = e;
	return x.createElement(l.div, {
		ref: t,
		...a,
		"cmdk-loading": "",
		role: "progressbar",
		"aria-valuenow": n,
		"aria-valuemin": 0,
		"aria-valuemax": 100,
		"aria-label": i
	}, J(e, (e) => x.createElement("div", { "aria-hidden": !0 }, e)));
}), W = Object.assign(U, {
	List: de,
	Item: se,
	Input: ue,
	Group: ce,
	Separator: le,
	Dialog: fe,
	Empty: pe,
	Loading: me
});
function he(e, t) {
	let n = e.nextElementSibling;
	for (; n;) {
		if (n.matches(t)) return n;
		n = n.nextElementSibling;
	}
}
function ge(e, t) {
	let n = e.previousElementSibling;
	for (; n;) {
		if (n.matches(t)) return n;
		n = n.previousElementSibling;
	}
}
function _e(e) {
	let t = x.useRef(e);
	return G(() => {
		t.current = e;
	}), t;
}
var G = typeof window > "u" ? x.useEffect : x.useLayoutEffect;
function K(e) {
	let t = x.useRef();
	return t.current === void 0 && (t.current = e()), t;
}
function q(e) {
	let t = V(), n = () => e(t.snapshot());
	return x.useSyncExternalStore(t.subscribe, n, n);
}
function ve(e, t, n, r = []) {
	let i = x.useRef(), a = B();
	return G(() => {
		var o;
		let s = (() => {
			for (let e of n) {
				if (typeof e == "string") return e.trim();
				if (typeof e == "object" && "current" in e) return e.current ? e.current.textContent?.trim() : i.current;
			}
		})(), c = r.map((e) => e.trim());
		a.value(e, s, c), (o = t.current) == null || o.setAttribute(z, s), i.current = s;
	}), i;
}
var ye = () => {
	let [e, t] = x.useState(), n = K(() => /* @__PURE__ */ new Map());
	return G(() => {
		n.current.forEach((e) => e()), n.current = /* @__PURE__ */ new Map();
	}, [e]), (e, r) => {
		n.current.set(e, r), t({});
	};
};
function be(e) {
	let t = e.type;
	return typeof t == "function" ? t(e.props) : "render" in t ? t.render(e.props) : e;
}
function J({ asChild: e, children: t }, n) {
	return e && x.isValidElement(t) ? x.cloneElement(be(t), { ref: t.ref }, n(t.props.children)) : n(t);
}
var xe = {
	position: "absolute",
	width: "1px",
	height: "1px",
	padding: "0",
	margin: "-1px",
	overflow: "hidden",
	clip: "rect(0, 0, 0, 0)",
	whiteSpace: "nowrap",
	borderWidth: "0"
}, Y = d();
function X({ className: e, ...t }) {
	return /* @__PURE__ */ (0, Y.jsx)(W, {
		"data-slot": "command",
		className: i("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", e),
		...t
	});
}
function Z({ className: e, ...t }) {
	return /* @__PURE__ */ (0, Y.jsxs)("div", {
		"data-slot": "command-input-wrapper",
		className: "flex h-8 items-center gap-1.5 border-b px-2",
		children: [/* @__PURE__ */ (0, Y.jsx)(m, { className: "size-4 shrink-0 opacity-50" }), /* @__PURE__ */ (0, Y.jsx)(W.Input, {
			"data-slot": "command-input",
			className: i("flex h-8 w-full rounded-md bg-transparent py-2 text-xs outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", e),
			...t
		})]
	});
}
function Q({ className: e, ...t }) {
	return /* @__PURE__ */ (0, Y.jsx)(W.List, {
		"data-slot": "command-list",
		className: i("max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto", e),
		...t
	});
}
function Se({ ...e }) {
	return /* @__PURE__ */ (0, Y.jsx)(W.Empty, {
		"data-slot": "command-empty",
		className: "py-6 text-center text-sm",
		...e
	});
}
function $({ className: e, ...t }) {
	return /* @__PURE__ */ (0, Y.jsx)(W.Group, {
		"data-slot": "command-group",
		className: i("overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground", e),
		...t
	});
}
function Ce({ className: e, ...t }) {
	return /* @__PURE__ */ (0, Y.jsx)(W.Item, {
		"data-slot": "command-item",
		className: i("relative flex cursor-default items-center gap-1.5 rounded-sm px-2 py-1 text-xs outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...t
	});
}
//#endregion
//#region src/components/form-builder/FormBuilderCombobox.tsx
function we(e, t) {
	return t.length ? t.flatMap((e) => e.options) : e;
}
function Te(e, t, n, r) {
	return !e && r ? r : we(t, n).find((t) => t.value === e)?.label ?? e;
}
function Ee({ options: e, selected: t, onSelect: n }) {
	return e.map((e) => /* @__PURE__ */ (0, Y.jsxs)(Ce, {
		value: e.label + " " + e.value,
		"data-option-value": e.value,
		disabled: e.disabled,
		onSelect: () => n(e.value),
		children: [/* @__PURE__ */ (0, Y.jsx)(a, { className: i("size-4", t.has(e.value) ? "opacity-100" : "opacity-0") }), /* @__PURE__ */ (0, Y.jsx)("span", {
			className: "truncate",
			children: e.label
		})]
	}, e.value));
}
function De({ value: e, onValueChange: n, options: r = [], groups: o = [], emptyLabel: s, placeholder: c = "Select...", searchPlaceholder: l = "Search...", disabled: u, className: d, ...f }) {
	let [p, m] = (0, x.useState)(!1), v = (0, x.useRef)(null), y = (0, x.useMemo)(() => new Set(e ? [e] : []), [e]), S = Te(e, r, o, s), C = (e) => {
		u || (n(e), m(!1));
	};
	return /* @__PURE__ */ (0, Y.jsxs)(_, {
		open: p,
		onOpenChange: m,
		children: [/* @__PURE__ */ (0, Y.jsx)(h, {
			asChild: !0,
			children: /* @__PURE__ */ (0, Y.jsxs)(t, {
				...f,
				type: "button",
				variant: "outline",
				role: "combobox",
				"aria-expanded": p,
				disabled: u,
				className: i("w-full justify-between font-normal", d),
				children: [/* @__PURE__ */ (0, Y.jsx)("span", {
					className: i("truncate", !S && "text-muted-foreground"),
					children: S || c
				}), /* @__PURE__ */ (0, Y.jsx)(b, { className: "ml-2 size-4 shrink-0 opacity-50" })]
			})
		}), /* @__PURE__ */ (0, Y.jsx)(g, {
			align: "start",
			className: "w-[var(--radix-popover-trigger-width)] p-0",
			onOpenAutoFocus: (e) => {
				e.preventDefault(), v.current?.focus();
			},
			children: /* @__PURE__ */ (0, Y.jsxs)(X, { children: [/* @__PURE__ */ (0, Y.jsx)(Z, {
				ref: v,
				placeholder: l
			}), /* @__PURE__ */ (0, Y.jsxs)(Q, { children: [
				/* @__PURE__ */ (0, Y.jsx)(Se, { children: "No results." }),
				s ? /* @__PURE__ */ (0, Y.jsx)($, { children: /* @__PURE__ */ (0, Y.jsxs)(Ce, {
					"data-option-value": "",
					value: s,
					onSelect: () => C(""),
					children: [/* @__PURE__ */ (0, Y.jsx)(a, { className: i("size-4", e === "" ? "opacity-100" : "opacity-0") }), /* @__PURE__ */ (0, Y.jsx)("span", {
						className: "truncate",
						children: s
					})]
				}) }) : null,
				o.length ? o.map((e) => /* @__PURE__ */ (0, Y.jsx)($, {
					heading: e.label,
					children: /* @__PURE__ */ (0, Y.jsx)(Ee, {
						options: e.options,
						selected: y,
						onSelect: C
					})
				}, e.label)) : /* @__PURE__ */ (0, Y.jsx)($, { children: /* @__PURE__ */ (0, Y.jsx)(Ee, {
					options: r,
					selected: y,
					onSelect: C
				}) })
			] })] })
		})]
	});
}
function Oe({ values: e, onValuesChange: n, options: r, placeholder: a = "Select...", searchPlaceholder: o = "Search...", disabled: s, className: c, ...l }) {
	let [u, d] = (0, x.useState)(!1), f = (0, x.useRef)(null), p = (0, x.useMemo)(() => new Set(e), [e]), m = r.filter((e) => p.has(e.value)).map((e) => e.label), v = (e) => {
		if (s) return;
		let t = new Set(p);
		t.has(e) ? t.delete(e) : t.add(e), n(r.map((e) => e.value).filter((e) => t.has(e)));
	};
	return /* @__PURE__ */ (0, Y.jsxs)(_, {
		open: u,
		onOpenChange: d,
		children: [/* @__PURE__ */ (0, Y.jsx)(h, {
			asChild: !0,
			children: /* @__PURE__ */ (0, Y.jsxs)(t, {
				...l,
				type: "button",
				variant: "outline",
				role: "combobox",
				"aria-expanded": u,
				disabled: s,
				className: i("w-full justify-between font-normal", c),
				children: [/* @__PURE__ */ (0, Y.jsx)("span", {
					className: i("truncate", !m.length && "text-muted-foreground"),
					children: m.length ? m.join(", ") : a
				}), /* @__PURE__ */ (0, Y.jsx)(b, { className: "ml-2 size-4 shrink-0 opacity-50" })]
			})
		}), /* @__PURE__ */ (0, Y.jsx)(g, {
			align: "start",
			className: "w-[var(--radix-popover-trigger-width)] p-0",
			onOpenAutoFocus: (e) => {
				e.preventDefault(), f.current?.focus();
			},
			children: /* @__PURE__ */ (0, Y.jsxs)(X, { children: [/* @__PURE__ */ (0, Y.jsx)(Z, {
				ref: f,
				placeholder: o
			}), /* @__PURE__ */ (0, Y.jsxs)(Q, { children: [/* @__PURE__ */ (0, Y.jsx)(Se, { children: "No results." }), /* @__PURE__ */ (0, Y.jsx)($, { children: /* @__PURE__ */ (0, Y.jsx)(Ee, {
				options: r,
				selected: p,
				onSelect: v
			}) })] })] })
		})]
	});
}
//#endregion
//#region src/components/settings-form/ChoiceRadioGroup.tsx
function ke({ options: e, value: n, onValueChange: r, disabled: a, className: o, id: s, ...c }) {
	let l = (0, x.useId)(), u = s ?? l;
	return /* @__PURE__ */ (0, Y.jsx)(y, {
		...c,
		id: s,
		value: n,
		disabled: a,
		orientation: "horizontal",
		"data-presentation": "buttons",
		className: i("flex w-fit max-w-full min-w-0 flex-wrap gap-0.5 rounded-md bg-muted p-0.5", o),
		onValueChange: (t) => {
			!a && e.some((e) => e.value === t && !e.disabled) && r(t);
		},
		children: e.map((e, n) => /* @__PURE__ */ (0, Y.jsxs)("div", {
			className: "grid max-w-full min-w-0 content-start gap-1.5",
			children: [/* @__PURE__ */ (0, Y.jsx)(v, {
				asChild: !0,
				id: `${u}-option-${n}`,
				value: e.value,
				"data-option-value": e.value,
				disabled: a || e.disabled,
				children: /* @__PURE__ */ (0, Y.jsx)(t, {
					type: "button",
					variant: "ghost",
					size: "xs",
					className: "h-auto min-h-6 min-w-0 shrink whitespace-normal break-words px-2 py-1 text-muted-foreground aria-[checked=true]:bg-background aria-[checked=true]:text-foreground aria-[checked=true]:shadow-xs",
					children: e.label
				})
			}), e.help]
		}, e.value))
	});
}
//#endregion
//#region src/components/settings-form/SettingsChoice.tsx
function Ae(e) {
	let t = e.emptyLabel ? [{
		value: "",
		label: e.emptyLabel
	}, ...e.options] : e.options;
	return t.length === 0 || t.length > 3 ? /* @__PURE__ */ (0, Y.jsx)(De, { ...e }) : /* @__PURE__ */ (0, Y.jsx)(ke, {
		...e,
		options: t
	});
}
//#endregion
//#region src/components/MonacoCodeEditor.tsx
function je(e) {
	let t = window.MapSVG?.extensions?.get("admin.panel", "code-editor");
	return t ? /* @__PURE__ */ (0, Y.jsx)(t.Editor, { ...e }) : null;
}
//#endregion
export { Oe as a, Z as c, De as i, Ce as l, Ae as n, X as o, ke as r, Se as s, je as t, Q as u };

//# sourceMappingURL=MonacoCodeEditor-BUG37g1c.js.map