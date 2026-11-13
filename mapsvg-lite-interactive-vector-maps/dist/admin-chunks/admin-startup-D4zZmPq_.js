import { n as e, r as t, t as n } from "./rolldown-runtime-Dqa2HsxW.js";
//#region \0mapsvg-shared-react:react
var r = /* @__PURE__ */ n(((e, t) => {
	t.exports = globalThis.MapSVGReact.React;
})), i = /* @__PURE__ */ t(r(), 1);
function a(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") if (Array.isArray(e)) {
		var i = e.length;
		for (t = 0; t < i; t++) e[t] && (n = a(e[t])) && (r && (r += " "), r += n);
	} else for (n in e) e[n] && (r && (r += " "), r += n);
	return r;
}
function o() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = a(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/.pnpm/class-variance-authority@0.7.1/node_modules/class-variance-authority/dist/index.mjs
var s = (e) => typeof e == "boolean" ? `${e}` : e === 0 ? "0" : e, c = o, l = (e, t) => (n) => {
	if (t?.variants == null) return c(e, n?.class, n?.className);
	let { variants: r, defaultVariants: i } = t, a = Object.keys(r).map((e) => {
		let t = n?.[e], a = i?.[e];
		if (t === null) return null;
		let o = s(t) || s(a);
		return r[e][o];
	}), o = n && Object.entries(n).reduce((e, t) => {
		let [n, r] = t;
		return r === void 0 || (e[n] = r), e;
	}, {});
	return c(e, a, t?.compoundVariants?.reduce((e, t) => {
		let { class: n, className: r, ...a } = t;
		return Object.entries(a).every((e) => {
			let [t, n] = e;
			return Array.isArray(n) ? n.includes({
				...i,
				...o
			}[t]) : {
				...i,
				...o
			}[t] === n;
		}) ? [
			...e,
			n,
			r
		] : e;
	}, []), n?.class, n?.className);
}, u = /* @__PURE__ */ n(((e, t) => {
	t.exports = globalThis.MapSVGReact.ReactDOM;
})), d = Object.defineProperty, f = (e, t) => d(e, "name", {
	value: t,
	configurable: !0
});
function p(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
f(p, "setRef");
function m(...e) {
	return (t) => {
		let n = !1, r = e.map((e) => {
			let r = p(e, t);
			return !n && typeof r == "function" && (n = !0), r;
		});
		if (n) return () => {
			for (let t = 0; t < r.length; t++) {
				let n = r[t];
				typeof n == "function" ? n() : p(e[t], null);
			}
		};
	};
}
f(m, "composeRefs");
function h(...e) {
	return i.useCallback(m(...e), e);
}
f(h, "useComposedRefs");
//#endregion
//#region \0mapsvg-shared-react:react/jsx-runtime
var g = /* @__PURE__ */ n(((e, t) => {
	t.exports = globalThis.MapSVGReact.jsxRuntime;
})), _ = /* @__PURE__ */ t(u(), 1), v = g(), y = Object.defineProperty, b = (e, t) => y(e, "name", {
	value: t,
	configurable: !0
}), x = /* @__PURE__ */ b(((e, t) => {
	let n = { ...t };
	for (let r in t) {
		let i = e[r], a = t[r];
		if (/^on[A-Z]/.test(r)) if (i && a) {
			let e = typeof i == "function", t = typeof a == "function";
			n[r] = (...n) => {
				let r = t ? a(...n) : void 0;
				return e && i(...n), r;
			};
		} else i && (n[r] = i);
		else r === "style" ? n[r] = {
			...typeof i == "object" ? i : null,
			...typeof a == "object" ? a : null
		} : r === "className" ? n[r] = [i, a].filter(Boolean).join(" ") : r === "aria-describedby" && (n[r] = S(a, i));
	}
	return {
		...e,
		...n
	};
}), "mergeProps");
function S(...e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) if (typeof n == "string") for (let e of String(n).trim().split(/\s+/)) e && t.add(e);
	return t.size > 0 ? Array.from(t).join(" ") : void 0;
}
b(S, "concatAriaDescribedby");
var C = i.createContext(x);
C.displayName = "SlotContext";
// @__NO_SIDE_EFFECTS__
function w(e) {
	let t = i.forwardRef((t, n) => {
		let r = i.useContext(C), { children: a, mergeProps: o = r, ...s } = t, c = null, l = !1, u = [];
		M(a) && typeof P == "function" && (a = P(a._payload)), i.Children.forEach(a, (e) => {
			if (A(e)) {
				l = !0;
				let t = e, n = "child" in t.props ? t.props.child : t.props.children;
				M(n) && typeof P == "function" && (n = P(n._payload)), c = O(t, n), u.push(c?.props?.children);
			} else u.push(e);
		}), c ? c = i.cloneElement(c, void 0, u) : !l && i.Children.count(a) === 1 && i.isValidElement(a) && (c = a);
		let d = c ? k(c) : void 0, f = h(n, d);
		if (!c) {
			if (a || a === 0) throw Error(l ? te(e) : N(e));
			return a;
		}
		let p = o(s, c.props ?? {});
		return c.type !== i.Fragment && (p.ref = n ? f : d), i.cloneElement(c, p);
	});
	return t.displayName = `${e}.Slot`, t;
}
b(w, "createSlot");
var T = /* @__PURE__ */ w("Slot"), E = Symbol.for("radix.slottable");
// @__NO_SIDE_EFFECTS__
function D(e) {
	let t = /* @__PURE__ */ b((e) => "child" in e ? e.children(e.child) : e.children, "Slottable");
	return t.displayName = `${e}.Slottable`, t.__radixId = E, t;
}
b(D, "createSlottable");
var O = /* @__PURE__ */ b((e, t) => {
	if ("child" in e.props) {
		let t = e.props.child;
		return i.isValidElement(t) ? i.cloneElement(t, void 0, e.props.children(t.props.children)) : null;
	}
	return i.isValidElement(t) ? t : null;
}, "getSlottableElementFromSlottable");
function k(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
b(k, "getElementRef");
function A(e) {
	return i.isValidElement(e) && typeof e.type == "function" && "__radixId" in e.type && e.type.__radixId === E;
}
b(A, "isSlottable");
var j = Symbol.for("react.lazy");
function M(e) {
	return typeof e == "object" && !!e && "$$typeof" in e && e.$$typeof === j && "_payload" in e && ee(e._payload);
}
b(M, "isLazyComponent");
function ee(e) {
	return typeof e == "object" && !!e && "then" in e;
}
b(ee, "isPromiseLike");
var N = /* @__PURE__ */ b((e) => `${e} failed to slot onto its children. Expected a single React element child or \`Slottable\`.`, "createSlotError"), te = /* @__PURE__ */ b((e) => `${e} failed to slot onto its \`Slottable\`. Expected \`Slottable\` to receive a single React element child.`, "createSlottableError"), P = i.use, ne = Object.defineProperty, re = (e, t) => ne(e, "name", {
	value: t,
	configurable: !0
}), F = [
	"a",
	"button",
	"div",
	"form",
	"h2",
	"h3",
	"img",
	"input",
	"label",
	"li",
	"nav",
	"ol",
	"p",
	"select",
	"span",
	"svg",
	"ul"
].reduce((e, t) => {
	let n = /* @__PURE__ */ w(`Primitive.${t}`), r = i.forwardRef((e, r) => {
		let { asChild: i, ...a } = e, o = i ? n : t;
		return typeof window < "u" && (window[Symbol.for("radix-ui")] = !0), /* @__PURE__ */ (0, v.jsx)(o, {
			...a,
			ref: r
		});
	});
	return r.displayName = `Primitive.${t}`, {
		...e,
		[t]: r
	};
}, {});
function I(e, t) {
	e && _.flushSync(() => e.dispatchEvent(t));
}
re(I, "dispatchDiscreteCustomEvent");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-visually-hidden@1.2.9_@types+react-dom@19.2.3_@types+react@19.2.17__@ty_4961a2cca0723cefd8e6bef967bae484/node_modules/@radix-ui/react-visually-hidden/dist/index.mjs
var ie = Object.defineProperty, ae = (e, t) => ie(e, "name", {
	value: t,
	configurable: !0
}), oe = Object.freeze({
	position: "absolute",
	border: 0,
	width: 1,
	height: 1,
	padding: 0,
	margin: -1,
	overflow: "hidden",
	clip: "rect(0, 0, 0, 0)",
	whiteSpace: "nowrap",
	wordWrap: "normal"
}), se = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ ae(function(e, t) {
	return /* @__PURE__ */ (0, v.jsx)(F.span, {
		...e,
		ref: t,
		style: {
			...oe,
			...e.style
		}
	});
}, "VisuallyHidden")), L = Object.defineProperty, ce = (e, t) => L(e, "name", {
	value: t,
	configurable: !0
});
// @__NO_SIDE_EFFECTS__
function le(e, t) {
	let n = i.createContext(t);
	n.displayName = e + "Context";
	let r = /* @__PURE__ */ ce((e) => {
		let { children: t, ...r } = e, a = i.useMemo(() => r, Object.values(r));
		return /* @__PURE__ */ (0, v.jsx)(n.Provider, {
			value: a,
			children: t
		});
	}, "Provider");
	r.displayName = e + "Provider";
	function a(r, a = {}) {
		let { optional: o = !1 } = a, s = i.useContext(n);
		if (s) return s;
		if (t !== void 0) return t;
		if (!o) throw Error(`\`${r}\` must be used within \`${e}\``);
	}
	return ce(a, "useContext"), [r, a];
}
ce(le, "createContext");
// @__NO_SIDE_EFFECTS__
function ue(e, t = []) {
	let n = [];
	function r(t, r) {
		let a = i.createContext(r);
		a.displayName = t + "Context";
		let o = n.length;
		n = [...n, r];
		let s = /* @__PURE__ */ ce((t) => {
			let { scope: n, children: r, ...s } = t, c = n?.[e]?.[o] || a, l = i.useMemo(() => s, Object.values(s));
			return /* @__PURE__ */ (0, v.jsx)(c.Provider, {
				value: l,
				children: r
			});
		}, "Provider");
		s.displayName = t + "Provider";
		function c(n, s, c = {}) {
			let { optional: l = !1 } = c, u = s?.[e]?.[o] || a, d = i.useContext(u);
			if (d) return d;
			if (r !== void 0) return r;
			if (!l) throw Error(`\`${n}\` must be used within \`${t}\``);
		}
		return ce(c, "useContext"), [s, c];
	}
	ce(r, "createContext");
	let a = /* @__PURE__ */ ce(() => {
		let t = n.map((e) => i.createContext(e));
		return /* @__PURE__ */ ce(function(n) {
			let r = n?.[e] || t;
			return i.useMemo(() => ({ [`__scope${e}`]: {
				...n,
				[e]: r
			} }), [n, r]);
		}, "useScope");
	}, "createScope");
	return a.scopeName = e, [r, de(a, ...t)];
}
ce(ue, "createContextScope");
function de(...e) {
	let t = e[0];
	if (e.length === 1) return t;
	let n = /* @__PURE__ */ ce(() => {
		let n = e.map((e) => ({
			useScope: e(),
			scopeName: e.scopeName
		}));
		return /* @__PURE__ */ ce(function(e) {
			let r = n.reduce((t, { useScope: n, scopeName: r }) => {
				let i = n(e)[`__scope${r}`];
				return {
					...t,
					...i
				};
			}, {});
			return i.useMemo(() => ({ [`__scope${t.scopeName}`]: r }), [r]);
		}, "useComposedScopes");
	}, "createScope");
	return n.scopeName = t.scopeName, n;
}
ce(de, "composeContextScopes");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-collection@1.1.13_@types+react-dom@19.2.3_@types+react@19.2.17__@types+_2b46d7e99315431b8b5afe1dcb4c547b/node_modules/@radix-ui/react-collection/dist/index.mjs
var R = Object.defineProperty, z = (e, t) => R(e, "name", {
	value: t,
	configurable: !0
});
// @__NO_SIDE_EFFECTS__
function fe(e) {
	let t = e + "CollectionProvider", [n, r] = /* @__PURE__ */ ue(t), [a, o] = n(t, {
		collectionRef: { current: null },
		itemMap: /* @__PURE__ */ new Map()
	}), s = /* @__PURE__ */ z((e) => {
		let { scope: t, children: n } = e, r = i.useRef(null), o = i.useRef(/* @__PURE__ */ new Map()).current;
		return /* @__PURE__ */ (0, v.jsx)(a, {
			scope: t,
			itemMap: o,
			collectionRef: r,
			children: n
		});
	}, "CollectionProvider");
	s.displayName = t;
	let c = e + "CollectionSlot", l = /* @__PURE__ */ w(c), u = i.forwardRef((e, t) => {
		let { scope: n, children: r } = e, i = h(t, o(c, n).collectionRef);
		return /* @__PURE__ */ (0, v.jsx)(l, {
			ref: i,
			children: r
		});
	});
	u.displayName = c;
	let d = e + "CollectionItemSlot", f = "data-radix-collection-item", p = /* @__PURE__ */ w(d), m = i.forwardRef((e, t) => {
		let { scope: n, children: r, ...a } = e, s = i.useRef(null), c = h(t, s), l = o(d, n);
		return i.useEffect(() => (l.itemMap.set(s, {
			ref: s,
			...a
		}), () => void l.itemMap.delete(s))), /* @__PURE__ */ (0, v.jsx)(p, {
			[f]: "",
			ref: c,
			children: r
		});
	});
	m.displayName = d;
	function g(t) {
		let n = o(e + "CollectionConsumer", t);
		return i.useCallback(() => {
			let e = n.collectionRef.current;
			if (!e) return [];
			let t = Array.from(e.querySelectorAll(`[${f}]`));
			return Array.from(n.itemMap.values()).sort((e, n) => t.indexOf(e.ref.current) - t.indexOf(n.ref.current));
		}, [n.collectionRef, n.itemMap]);
	}
	return z(g, "useCollection"), [
		{
			Provider: s,
			Slot: u,
			ItemSlot: m
		},
		g,
		r
	];
}
z(fe, "createCollection");
var pe = /* @__PURE__ */ new WeakMap(), me = class e extends Map {
	static {
		z(this, "OrderedDict");
	}
	#e;
	constructor(e) {
		super(e), this.#e = [...super.keys()], pe.set(this, !0);
	}
	set(e, t) {
		return pe.get(this) && (this.has(e) ? this.#e[this.#e.indexOf(e)] = e : this.#e.push(e)), super.set(e, t), this;
	}
	insert(e, t, n) {
		let r = this.has(t), i = this.#e.length, a = _e(e), o = a >= 0 ? a : i + a, s = o < 0 || o >= i ? -1 : o;
		if (s === this.size || r && s === this.size - 1 || s === -1) return this.set(t, n), this;
		let c = this.size + +!r;
		a < 0 && o++;
		let l = [...this.#e], u, d = !1;
		for (let e = o; e < c; e++) if (o === e) {
			let i = l[e];
			l[e] === t && (i = l[e + 1]), r && this.delete(t), u = this.get(i), this.set(t, n);
		} else {
			!d && l[e - 1] === t && (d = !0);
			let n = l[d ? e : e - 1], r = u;
			u = this.get(n), this.delete(n), this.set(n, r);
		}
		return this;
	}
	with(t, n, r) {
		let i = new e(this);
		return i.insert(t, n, r), i;
	}
	before(e) {
		let t = this.#e.indexOf(e) - 1;
		if (!(t < 0)) return this.entryAt(t);
	}
	setBefore(e, t, n) {
		let r = this.#e.indexOf(e);
		return r === -1 ? this : this.insert(r, t, n);
	}
	after(e) {
		let t = this.#e.indexOf(e);
		if (t = t === -1 || t === this.size - 1 ? -1 : t + 1, t !== -1) return this.entryAt(t);
	}
	setAfter(e, t, n) {
		let r = this.#e.indexOf(e);
		return r === -1 ? this : this.insert(r + 1, t, n);
	}
	first() {
		return this.entryAt(0);
	}
	last() {
		return this.entryAt(-1);
	}
	clear() {
		return this.#e = [], super.clear();
	}
	delete(e) {
		let t = super.delete(e);
		return t && this.#e.splice(this.#e.indexOf(e), 1), t;
	}
	deleteAt(e) {
		let t = this.keyAt(e);
		return t !== void 0 && this.delete(t);
	}
	at(e) {
		let t = he(this.#e, e);
		if (t !== void 0) return this.get(t);
	}
	entryAt(e) {
		let t = he(this.#e, e);
		if (t !== void 0) return [t, this.get(t)];
	}
	indexOf(e) {
		return this.#e.indexOf(e);
	}
	keyAt(e) {
		return he(this.#e, e);
	}
	from(e, t) {
		let n = this.indexOf(e);
		if (n === -1) return;
		let r = n + t;
		return r < 0 && (r = 0), r >= this.size && (r = this.size - 1), this.at(r);
	}
	keyFrom(e, t) {
		let n = this.indexOf(e);
		if (n === -1) return;
		let r = n + t;
		return r < 0 && (r = 0), r >= this.size && (r = this.size - 1), this.keyAt(r);
	}
	find(e, t) {
		let n = 0;
		for (let r of this) {
			if (Reflect.apply(e, t, [
				r,
				n,
				this
			])) return r;
			n++;
		}
	}
	findIndex(e, t) {
		let n = 0;
		for (let r of this) {
			if (Reflect.apply(e, t, [
				r,
				n,
				this
			])) return n;
			n++;
		}
		return -1;
	}
	filter(t, n) {
		let r = [], i = 0;
		for (let e of this) Reflect.apply(t, n, [
			e,
			i,
			this
		]) && r.push(e), i++;
		return new e(r);
	}
	map(t, n) {
		let r = [], i = 0;
		for (let e of this) r.push([e[0], Reflect.apply(t, n, [
			e,
			i,
			this
		])]), i++;
		return new e(r);
	}
	reduce(...e) {
		let [t, n] = e, r = 0, i = n ?? this.at(0);
		for (let n of this) i = r === 0 && e.length === 1 ? n : Reflect.apply(t, this, [
			i,
			n,
			r,
			this
		]), r++;
		return i;
	}
	reduceRight(...e) {
		let [t, n] = e, r = n ?? this.at(-1);
		for (let n = this.size - 1; n >= 0; n--) {
			let i = this.at(n);
			r = n === this.size - 1 && e.length === 1 ? i : Reflect.apply(t, this, [
				r,
				i,
				n,
				this
			]);
		}
		return r;
	}
	toSorted(t) {
		let n = [...this.entries()].sort(t);
		return new e(n);
	}
	toReversed() {
		let t = new e();
		for (let e = this.size - 1; e >= 0; e--) {
			let n = this.keyAt(e), r = this.get(n);
			t.set(n, r);
		}
		return t;
	}
	toSpliced(...t) {
		let n = [...this.entries()];
		return n.splice(...t), new e(n);
	}
	slice(t, n) {
		let r = new e(), i = this.size - 1;
		if (t === void 0) return r;
		t < 0 && (t += this.size), n !== void 0 && n > 0 && (i = n - 1);
		for (let e = t; e <= i; e++) {
			let t = this.keyAt(e), n = this.get(t);
			r.set(t, n);
		}
		return r;
	}
	every(e, t) {
		let n = 0;
		for (let r of this) {
			if (!Reflect.apply(e, t, [
				r,
				n,
				this
			])) return !1;
			n++;
		}
		return !0;
	}
	some(e, t) {
		let n = 0;
		for (let r of this) {
			if (Reflect.apply(e, t, [
				r,
				n,
				this
			])) return !0;
			n++;
		}
		return !1;
	}
};
function he(e, t) {
	if ("at" in Array.prototype) return Array.prototype.at.call(e, t);
	let n = ge(e, t);
	return n === -1 ? void 0 : e[n];
}
z(he, "at");
function ge(e, t) {
	let n = e.length, r = _e(t), i = r >= 0 ? r : n + r;
	return i < 0 || i >= n ? -1 : i;
}
z(ge, "toSafeIndex");
function _e(e) {
	return e !== e || e === 0 ? 0 : Math.trunc(e);
}
z(_e, "toSafeInteger");
// @__NO_SIDE_EFFECTS__
function ve(e) {
	let t = e + "CollectionProvider", [n, r] = /* @__PURE__ */ ue(t), [a, o] = n(t, {
		collectionElement: null,
		collectionRef: { current: null },
		collectionRefObject: { current: null },
		itemMap: new me(),
		setItemMap: /* @__PURE__ */ z(() => void 0, "setItemMap")
	}), s = /* @__PURE__ */ z(({ state: e, ...t }) => e ? /* @__PURE__ */ (0, v.jsx)(l, {
		...t,
		state: e
	}) : /* @__PURE__ */ (0, v.jsx)(c, { ...t }), "CollectionProvider");
	s.displayName = t;
	let c = /* @__PURE__ */ z((e) => {
		let t = _();
		return /* @__PURE__ */ (0, v.jsx)(l, {
			...e,
			state: t
		});
	}, "CollectionInit");
	c.displayName = t + "Init";
	let l = /* @__PURE__ */ z((e) => {
		let { scope: t, children: n, state: r } = e, o = i.useRef(null), [s, c] = i.useState(null), l = h(o, c), [u, d] = r;
		return i.useEffect(() => {
			if (!s) return;
			let e = Se(() => {});
			return e.observe(s, {
				childList: !0,
				subtree: !0
			}), () => {
				e.disconnect();
			};
		}, [s]), /* @__PURE__ */ (0, v.jsx)(a, {
			scope: t,
			itemMap: u,
			setItemMap: d,
			collectionRef: l,
			collectionRefObject: o,
			collectionElement: s,
			children: n
		});
	}, "CollectionProviderImpl");
	l.displayName = t + "Impl";
	let u = e + "CollectionSlot", d = /* @__PURE__ */ w(u), f = i.forwardRef((e, t) => {
		let { scope: n, children: r } = e, i = h(t, o(u, n).collectionRef);
		return /* @__PURE__ */ (0, v.jsx)(d, {
			ref: i,
			children: r
		});
	});
	f.displayName = u;
	let p = e + "CollectionItemSlot", m = /* @__PURE__ */ w(p), g = i.forwardRef((e, t) => {
		let { scope: n, children: r, ...a } = e, s = i.useRef(null), [c, l] = i.useState(null), u = h(t, s, l), { setItemMap: d } = o(p, n), f = i.useRef(a);
		ye(f.current, a) || (f.current = a);
		let g = f.current;
		return i.useEffect(() => {
			let e = g;
			return d((t) => c ? t.has(c) ? t.set(c, {
				...e,
				element: c
			}).toSorted(xe) : (t.set(c, {
				...e,
				element: c
			}), t.toSorted(xe)) : t), () => {
				d((e) => !c || !e.has(c) ? e : (e.delete(c), new me(e)));
			};
		}, [
			c,
			g,
			d
		]), /* @__PURE__ */ (0, v.jsx)(m, {
			"data-radix-collection-item": "",
			ref: u,
			children: r
		});
	});
	g.displayName = p;
	function _() {
		return i.useState(new me());
	}
	z(_, "useInitCollection");
	function y(t) {
		let { itemMap: n } = o(e + "CollectionConsumer", t);
		return n;
	}
	return z(y, "useCollection"), [{
		Provider: s,
		Slot: f,
		ItemSlot: g
	}, {
		createCollectionScope: r,
		useCollection: y,
		useInitCollection: _
	}];
}
z(ve, "createCollection");
function ye(e, t) {
	if (e === t) return !0;
	if (typeof e != "object" || typeof t != "object" || e == null || t == null) return !1;
	let n = Object.keys(e), r = Object.keys(t);
	if (n.length !== r.length) return !1;
	for (let r of n) if (!Object.prototype.hasOwnProperty.call(t, r) || e[r] !== t[r]) return !1;
	return !0;
}
z(ye, "shallowEqual");
function be(e, t) {
	return !!(t.compareDocumentPosition(e) & Node.DOCUMENT_POSITION_PRECEDING);
}
z(be, "isElementPreceding");
function xe(e, t) {
	return !e[1].element || !t[1].element ? 0 : be(e[1].element, t[1].element) ? -1 : 1;
}
z(xe, "sortByDocumentPosition");
function Se(e) {
	return new MutationObserver((t) => {
		for (let n of t) if (n.type === "childList") {
			e();
			return;
		}
	});
}
z(Se, "getChildListObserver");
//#endregion
//#region node_modules/.pnpm/@radix-ui+primitive@1.1.7/node_modules/@radix-ui/primitive/dist/index.mjs
var Ce = Object.defineProperty, we = (e, t) => Ce(e, "name", {
	value: t,
	configurable: !0
}), Te = !!(typeof window < "u" && window.document && window.document.createElement);
function B(e, t, { checkForDefaultPrevented: n = !0 } = {}) {
	return /* @__PURE__ */ we(function(r) {
		if (e?.(r), n === !1 || !r || !r.defaultPrevented) return t?.(r);
	}, "handleEvent");
}
we(B, "composeEventHandlers");
function Ee(e) {
	if (!Te) throw Error("Cannot access window outside of the DOM");
	return e?.ownerDocument?.defaultView ?? window;
}
we(Ee, "getOwnerWindow");
function De(e) {
	if (!Te) throw Error("Cannot access document outside of the DOM");
	return e?.ownerDocument ?? document;
}
we(De, "getOwnerDocument");
function Oe(e, t = !1) {
	let { activeElement: n } = De(e);
	if (!n?.nodeName) return null;
	if (ke(n) && n.contentDocument) return Oe(n.contentDocument.body, t);
	if (t) {
		let e = n.getAttribute("aria-activedescendant");
		if (e) {
			let t = De(n).getElementById(e);
			if (t) return t;
		}
	}
	return n;
}
we(Oe, "getActiveElement");
function ke(e) {
	return e.tagName === "IFRAME";
}
we(ke, "isFrame");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-use-layout-effect@1.1.3_@types+react@19.2.17_react@19.2.8/node_modules/@radix-ui/react-use-layout-effect/dist/index.mjs
var V = globalThis?.document ? i.useLayoutEffect : () => {}, Ae = Object.defineProperty, je = (e, t) => Ae(e, "name", {
	value: t,
	configurable: !0
}), Me = i.useEffectEvent, Ne = i.useInsertionEffect;
function Pe(e) {
	if (typeof Me == "function") return Me(e);
	let t = i.useRef(() => {
		throw Error("Cannot call an event handler while rendering.");
	});
	return typeof Ne == "function" ? Ne(() => {
		t.current = e;
	}) : V(() => {
		t.current = e;
	}), i.useMemo(() => ((...e) => t.current?.(...e)), []);
}
je(Pe, "useEffectEvent");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-use-controllable-state@1.2.5_@types+react@19.2.17_react@19.2.8/node_modules/@radix-ui/react-use-controllable-state/dist/index.mjs
var Fe = Object.defineProperty, Ie = (e, t) => Fe(e, "name", {
	value: t,
	configurable: !0
}), Le = i.useInsertionEffect || V;
function Re({ prop: e, defaultProp: t, onChange: n = /* @__PURE__ */ Ie(() => {}, "onChange"), caller: r }) {
	let [a, o, s] = ze({
		defaultProp: t,
		onChange: n
	}), c = e !== void 0;
	return [c ? e : a, i.useCallback((t) => {
		if (c) {
			let n = Be(t) ? t(e) : t;
			n !== e && s.current?.(n);
		} else o(t);
	}, [
		c,
		e,
		o,
		s
	])];
}
Ie(Re, "useControllableState");
function ze({ defaultProp: e, onChange: t }) {
	let [n, r] = i.useState(e), a = i.useRef(n), o = i.useRef(t);
	return Le(() => {
		o.current = t;
	}, [t]), i.useEffect(() => {
		a.current !== n && (o.current?.(n), a.current = n);
	}, [n, a]), [
		n,
		r,
		o
	];
}
Ie(ze, "useUncontrolledState");
function Be(e) {
	return typeof e == "function";
}
Ie(Be, "isFunction");
var Ve = Symbol("RADIX:SYNC_STATE");
function He(e, t, n, r) {
	let { prop: a, defaultProp: o, onChange: s, caller: c } = t, l = a !== void 0, u = Pe(s), d = [{
		...n,
		state: o
	}];
	r && d.push(r);
	let [f, p] = i.useReducer((t, n) => {
		if (n.type === Ve) return {
			...t,
			state: n.state
		};
		let r = e(t, n);
		return l && !Object.is(r.state, t.state) && u(r.state), r;
	}, ...d), m = f.state, h = i.useRef(m);
	i.useEffect(() => {
		h.current !== m && (h.current = m, l || u(m));
	}, [
		m,
		h,
		l
	]);
	let g = i.useMemo(() => a === void 0 ? f : {
		...f,
		state: a
	}, [f, a]);
	return i.useEffect(() => {
		l && !Object.is(a, f.state) && p({
			type: Ve,
			state: a
		});
	}, [
		a,
		f.state,
		l
	]), [g, p];
}
Ie(He, "useControllableStateReducer");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-presence@1.1.9_@types+react-dom@19.2.3_@types+react@19.2.17__@types+rea_72e6ea704280437516187724bdaec8bd/node_modules/@radix-ui/react-presence/dist/index.mjs
var Ue = Object.defineProperty, We = (e, t) => Ue(e, "name", {
	value: t,
	configurable: !0
});
function Ge(e, t) {
	return i.useReducer((e, n) => t[e][n] ?? e, e);
}
We(Ge, "useStateMachine");
var H = /* @__PURE__ */ We((e) => {
	let { present: t, children: n } = e, r = Ke(t), a = typeof n == "function" ? n({ present: r.isPresent }) : i.Children.only(n), o = qe(r.ref, Ye(a));
	return typeof n == "function" || r.isPresent ? i.cloneElement(a, { ref: o }) : null;
}, "Presence");
function Ke(e) {
	let [t, n] = i.useState(), r = i.useRef(null), a = i.useRef(e), o = i.useRef("none"), s = i.useRef(void 0), [c, l] = Ge(e ? "mounted" : "unmounted", {
		mounted: {
			UNMOUNT: "unmounted",
			ANIMATION_OUT: "unmountSuspended"
		},
		unmountSuspended: {
			MOUNT: "mounted",
			ANIMATION_END: "unmounted"
		},
		unmounted: { MOUNT: "mounted" }
	});
	return i.useEffect(() => {
		c === "mounted" ? (o.current = s.current ?? Je(r.current), s.current = void 0) : o.current = "none";
	}, [c]), V(() => {
		let t = r.current, n = a.current;
		if (n !== e) {
			let r = o.current, i = Je(t);
			e ? (s.current = i, l("MOUNT")) : i === "none" || t?.display === "none" ? l("UNMOUNT") : l(n && r !== i ? "ANIMATION_OUT" : "UNMOUNT"), a.current = e;
		}
	}, [e, l]), V(() => {
		if (t) {
			let e, n = t.ownerDocument.defaultView ?? window, i = /* @__PURE__ */ We((i) => {
				let o = Je(r.current).includes(CSS.escape(i.animationName));
				if (i.target === t && o && (l("ANIMATION_END"), !a.current)) {
					let r = t.style.animationFillMode;
					t.style.animationFillMode = "forwards", e = n.setTimeout(() => {
						t.style.animationFillMode === "forwards" && (t.style.animationFillMode = r);
					});
				}
			}, "handleAnimationEnd"), s = /* @__PURE__ */ We((e) => {
				e.target === t && (o.current = Je(r.current));
			}, "handleAnimationStart");
			return t.addEventListener("animationstart", s), t.addEventListener("animationcancel", i), t.addEventListener("animationend", i), () => {
				n.clearTimeout(e), t.removeEventListener("animationstart", s), t.removeEventListener("animationcancel", i), t.removeEventListener("animationend", i);
			};
		} else l("ANIMATION_END");
	}, [t, l]), {
		isPresent: ["mounted", "unmountSuspended"].includes(c),
		ref: i.useCallback((e) => {
			if (e) {
				let t = getComputedStyle(e);
				r.current = t, s.current = Je(t);
			} else r.current = null;
			n(e);
		}, [])
	};
}
We(Ke, "usePresence");
function U(e, t) {
	if (typeof e == "function") return e(t);
	e != null && (e.current = t);
}
We(U, "setRef");
function qe(...e) {
	let t = i.useRef(e);
	return t.current = e, i.useCallback((e) => {
		let n = t.current, r = !1, i = n.map((t) => {
			let n = U(t, e);
			return !r && typeof n == "function" && (r = !0), n;
		});
		if (r) return () => {
			for (let e = 0; e < i.length; e++) {
				let t = i[e];
				typeof t == "function" ? t() : U(n[e], null);
			}
		};
	}, []);
}
We(qe, "useStableComposedRefs");
function Je(e) {
	return e?.animationName || "none";
}
We(Je, "getAnimationName");
function Ye(e) {
	let t = Object.getOwnPropertyDescriptor(e.props, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning;
	return n ? e.ref : (t = Object.getOwnPropertyDescriptor(e, "ref")?.get, n = t && "isReactWarning" in t && t.isReactWarning, n ? e.props.ref : e.props.ref || e.ref);
}
We(Ye, "getElementRef");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-id@1.1.3_@types+react@19.2.17_react@19.2.8/node_modules/@radix-ui/react-id/dist/index.mjs
var W = Object.defineProperty, Xe = (e, t) => W(e, "name", {
	value: t,
	configurable: !0
}), Ze = i.useId || (() => void 0), Qe = 0;
function $e(e) {
	let [t, n] = i.useState(Ze());
	return V(() => {
		e || n((e) => e ?? String(Qe++));
	}, [e]), e || (t ? `radix-${t}` : "");
}
Xe($e, "useId");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-direction@1.1.3_@types+react@19.2.17_react@19.2.8/node_modules/@radix-ui/react-direction/dist/index.mjs
var G = Object.defineProperty, et = (e, t) => G(e, "name", {
	value: t,
	configurable: !0
}), tt = i.createContext(void 0);
function nt(e) {
	let t = i.useContext(tt);
	return e || t || "ltr";
}
et(nt, "useDirection");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-use-callback-ref@1.1.3_@types+react@19.2.17_react@19.2.8/node_modules/@radix-ui/react-use-callback-ref/dist/index.mjs
var rt = Object.defineProperty, it = (e, t) => rt(e, "name", {
	value: t,
	configurable: !0
});
function at(e) {
	let t = i.useRef(e);
	return i.useEffect(() => {
		t.current = e;
	}), i.useMemo(() => ((...e) => t.current?.(...e)), []);
}
it(at, "useCallbackRef");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-dismissable-layer@1.1.17_@types+react-dom@19.2.3_@types+react@19.2.17___5c8f3e6e76ce47c058351a084b46994d/node_modules/@radix-ui/react-dismissable-layer/dist/index.mjs
var ot = Object.defineProperty, st = (e, t) => ot(e, "name", {
	value: t,
	configurable: !0
}), ct = "dismissableLayer.update", lt = "dismissableLayer.pointerDownOutside", ut = "dismissableLayer.focusOutside", dt, ft = i.createContext({
	layers: /* @__PURE__ */ new Set(),
	layersWithOutsidePointerEventsDisabled: /* @__PURE__ */ new Set(),
	branches: /* @__PURE__ */ new Set(),
	dismissableSurfaces: /* @__PURE__ */ new Set()
}), pt = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ st(function(e, t) {
	let { disableOutsidePointerEvents: n = !1, deferPointerDownOutside: r = !1, onEscapeKeyDown: a, onPointerDownOutside: o, onFocusOutside: s, onInteractOutside: c, onDismiss: l, ...u } = e, d = i.useContext(ft), [f, p] = i.useState(null), m = f?.ownerDocument ?? globalThis?.document, [, g] = i.useState({}), _ = h(t, p), y = Array.from(d.layers), [b] = [...d.layersWithOutsidePointerEventsDisabled].slice(-1), x = b ? y.indexOf(b) : -1, S = f ? y.indexOf(f) : -1, C = d.layersWithOutsidePointerEventsDisabled.size > 0, w = S >= x, T = i.useRef(!1), E = _t((e) => {
		o?.(e), c?.(e), e.defaultPrevented || l?.();
	}, {
		ownerDocument: m,
		deferPointerDownOutside: r,
		isDeferredPointerDownOutsideRef: T,
		dismissableSurfaces: d.dismissableSurfaces,
		shouldHandlePointerDownOutside: i.useCallback((e) => {
			if (!(e instanceof Node)) return !1;
			let t = [...d.branches].some((t) => t.contains(e));
			return w && !t;
		}, [d.branches, w])
	}), D = vt((e) => {
		if (r && T.current) return;
		let t = e.target;
		[...d.branches].some((e) => e.contains(t)) || (s?.(e), c?.(e), e.defaultPrevented || l?.());
	}, m), O = f ? S === y.length - 1 : !1, k = at((e) => {
		e.key === "Escape" && (a?.(e), !e.defaultPrevented && l && (e.preventDefault(), l()));
	});
	return i.useEffect(() => {
		if (O) return m.addEventListener("keydown", k, { capture: !0 }), () => m.removeEventListener("keydown", k, { capture: !0 });
	}, [
		m,
		O,
		k
	]), i.useEffect(() => {
		if (f) return n && (d.layersWithOutsidePointerEventsDisabled.size === 0 && (dt = m.body.style.pointerEvents, m.body.style.pointerEvents = "none"), d.layersWithOutsidePointerEventsDisabled.add(f)), d.layers.add(f), yt(), () => {
			n && (d.layersWithOutsidePointerEventsDisabled.delete(f), d.layersWithOutsidePointerEventsDisabled.size === 0 && (m.body.style.pointerEvents = dt));
		};
	}, [
		f,
		m,
		n,
		d
	]), i.useEffect(() => () => {
		f && (d.layers.delete(f), d.layersWithOutsidePointerEventsDisabled.delete(f), yt());
	}, [f, d]), i.useEffect(() => {
		let e = /* @__PURE__ */ st(() => g({}), "handleUpdate");
		return document.addEventListener(ct, e), () => document.removeEventListener(ct, e);
	}, []), /* @__PURE__ */ (0, v.jsx)(F.div, {
		...u,
		ref: _,
		style: {
			pointerEvents: C ? w ? "auto" : "none" : void 0,
			...e.style
		},
		onFocusCapture: B(e.onFocusCapture, D.onFocusCapture),
		onBlurCapture: B(e.onBlurCapture, D.onBlurCapture),
		onPointerDownCapture: B(e.onPointerDownCapture, E.onPointerDownCapture)
	});
}, "DismissableLayer")), mt = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ st(function(e, t) {
	let n = i.useContext(ft), r = i.useRef(null), a = h(t, r);
	return i.useEffect(() => {
		let e = r.current;
		if (e) return n.branches.add(e), () => {
			n.branches.delete(e);
		};
	}, [n.branches]), /* @__PURE__ */ (0, v.jsx)(F.div, {
		...e,
		ref: a
	});
}, "DismissableLayerBranch"));
function ht() {
	let e = i.useContext(ft), [t, n] = i.useState(null);
	return i.useEffect(() => {
		if (t) return e.dismissableSurfaces.add(t), () => {
			e.dismissableSurfaces.delete(t);
		};
	}, [t, e.dismissableSurfaces]), n;
}
st(ht, "useDismissableLayerSurface");
var gt = /* @__PURE__ */ st(() => !0, "IS_TRUE");
function _t(e, t) {
	let { ownerDocument: n = globalThis?.document, deferPointerDownOutside: r = !1, isDeferredPointerDownOutsideRef: a, dismissableSurfaces: o, shouldHandlePointerDownOutside: s = gt } = t, c = at(e), l = i.useRef(!1), u = i.useRef(!1), d = i.useRef(/* @__PURE__ */ new Map()), f = i.useRef(() => {});
	return i.useEffect(() => {
		function e() {
			u.current = !1, a.current = !1, d.current.clear();
		}
		st(e, "resetOutsideInteraction");
		function t() {
			return Array.from(d.current.values()).some(Boolean);
		}
		st(t, "isOutsideInteractionIntercepted");
		function i(e) {
			if (!u.current) return;
			let t = e.target;
			t instanceof Node && [...o].some((e) => e.contains(t)) || d.current.set(e.type, !0), e.type === "click" && window.setTimeout(() => {
				u.current && f.current();
			}, 0);
		}
		st(i, "handleInteractionCapture");
		function p(e) {
			u.current && d.current.set(e.type, !1);
		}
		st(p, "handleInteractionBubble");
		let m = /* @__PURE__ */ st((i) => {
			if (i.target && !l.current) {
				let o = function() {
					n.removeEventListener("click", f.current);
					let r = t();
					e(), r || bt(lt, c, p, { discrete: !0 });
				};
				if (st(o, "handleAndDispatchPointerDownOutsideEvent"), !s(i.target)) {
					n.removeEventListener("click", f.current), e(), l.current = !1;
					return;
				}
				let p = { originalEvent: i };
				u.current = !0, a.current = r && i.button === 0, d.current.clear(), !r || i.button !== 0 ? o() : (n.removeEventListener("click", f.current), f.current = o, n.addEventListener("click", f.current, { once: !0 }));
			} else n.removeEventListener("click", f.current), e();
			l.current = !1;
		}, "handlePointerDown"), h = [
			"pointerup",
			"mousedown",
			"mouseup",
			"touchstart",
			"touchend",
			"click"
		];
		for (let e of h) n.addEventListener(e, i, !0), n.addEventListener(e, p);
		let g = window.setTimeout(() => {
			n.addEventListener("pointerdown", m);
		}, 0);
		return () => {
			window.clearTimeout(g), n.removeEventListener("pointerdown", m), n.removeEventListener("click", f.current);
			for (let e of h) n.removeEventListener(e, i, !0), n.removeEventListener(e, p);
		};
	}, [
		n,
		c,
		r,
		a,
		o,
		s
	]), { onPointerDownCapture: /* @__PURE__ */ st(() => l.current = !0, "onPointerDownCapture") };
}
st(_t, "usePointerDownOutside");
function vt(e, t = globalThis?.document) {
	let n = at(e), r = i.useRef(!1);
	return i.useEffect(() => {
		let e = /* @__PURE__ */ st((e) => {
			e.target && !r.current && bt(ut, n, { originalEvent: e }, { discrete: !1 });
		}, "handleFocus");
		return t.addEventListener("focusin", e), () => t.removeEventListener("focusin", e);
	}, [t, n]), {
		onFocusCapture: /* @__PURE__ */ st(() => r.current = !0, "onFocusCapture"),
		onBlurCapture: /* @__PURE__ */ st(() => r.current = !1, "onBlurCapture")
	};
}
st(vt, "useFocusOutside");
function yt() {
	let e = new CustomEvent(ct);
	document.dispatchEvent(e);
}
st(yt, "dispatchUpdate");
function bt(e, t, n, { discrete: r }) {
	let i = n.originalEvent.target, a = new CustomEvent(e, {
		bubbles: !1,
		cancelable: !0,
		detail: n
	});
	t && i.addEventListener(e, t, { once: !0 }), r ? I(i, a) : i.dispatchEvent(a);
}
st(bt, "handleAndDispatchCustomEvent");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-focus-scope@1.1.14_@types+react-dom@19.2.3_@types+react@19.2.17__@types_64c0dd537bfd5c932deab82f76993003/node_modules/@radix-ui/react-focus-scope/dist/index.mjs
var xt = Object.defineProperty, St = (e, t) => xt(e, "name", {
	value: t,
	configurable: !0
}), Ct = "focusScope.autoFocusOnMount", wt = "focusScope.autoFocusOnUnmount", Tt = {
	bubbles: !1,
	cancelable: !0
}, Et = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ St(function(e, t) {
	let { loop: n = !1, trapped: r = !1, onMountAutoFocus: a, onUnmountAutoFocus: o, ...s } = e, [c, l] = i.useState(null), u = at(a), d = at(o), f = i.useRef(null), p = h(t, l), m = i.useRef({
		paused: !1,
		pause() {
			this.paused = !0;
		},
		resume() {
			this.paused = !1;
		}
	}).current;
	i.useEffect(() => {
		if (r) {
			let e = function(e) {
				if (m.paused || !c) return;
				let t = e.target;
				c.contains(t) ? f.current = t : Nt(f.current, { select: !0 });
			}, t = function(e) {
				if (m.paused || !c) return;
				let t = e.relatedTarget;
				t !== null && (c.contains(t) || Nt(f.current, { select: !0 }));
			}, n = function(e) {
				if (document.activeElement === document.body) for (let t of e) t.removedNodes.length > 0 && Nt(c);
			};
			St(e, "handleFocusIn"), St(t, "handleFocusOut"), St(n, "handleMutations"), document.addEventListener("focusin", e), document.addEventListener("focusout", t);
			let r = new MutationObserver(n);
			return c && r.observe(c, {
				childList: !0,
				subtree: !0
			}), () => {
				document.removeEventListener("focusin", e), document.removeEventListener("focusout", t), r.disconnect();
			};
		}
	}, [
		r,
		c,
		m.paused
	]), i.useEffect(() => {
		if (c) {
			Pt.add(m);
			let e = document.activeElement;
			if (!c.contains(e)) {
				let t = new CustomEvent(Ct, Tt);
				c.addEventListener(Ct, u), c.dispatchEvent(t), t.defaultPrevented || (Dt(Lt(kt(c)), { select: !0 }), document.activeElement === e && Nt(c));
			}
			return () => {
				c.removeEventListener(Ct, u), setTimeout(() => {
					let t = new CustomEvent(wt, Tt);
					c.addEventListener(wt, d), c.dispatchEvent(t), t.defaultPrevented || Nt(e ?? document.body, { select: !0 }), c.removeEventListener(wt, d), Pt.remove(m);
				}, 0);
			};
		}
	}, [
		c,
		u,
		d,
		m
	]);
	let g = i.useCallback((e) => {
		if (!n && !r || m.paused) return;
		let t = e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey, i = document.activeElement;
		if (t && i) {
			let t = e.currentTarget, [r, a] = Ot(t);
			r && a ? !e.shiftKey && i === a ? (e.preventDefault(), n && Nt(r, { select: !0 })) : e.shiftKey && i === r && (e.preventDefault(), n && Nt(a, { select: !0 })) : i === t && e.preventDefault();
		}
	}, [
		n,
		r,
		m.paused
	]);
	return /* @__PURE__ */ (0, v.jsx)(F.div, {
		tabIndex: -1,
		...s,
		ref: p,
		onKeyDown: g
	});
}, "FocusScope"));
function Dt(e, { select: t = !1 } = {}) {
	let n = document.activeElement;
	for (let r of e) if (Nt(r, { select: t }), document.activeElement !== n) return;
}
St(Dt, "focusFirst");
function Ot(e) {
	let t = kt(e);
	return [At(t, e), At(t.reverse(), e)];
}
St(Ot, "getTabbableEdges");
function kt(e) {
	let t = [], n = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, { acceptNode: /* @__PURE__ */ St((e) => {
		let t = e.tagName === "INPUT" && e.type === "hidden";
		return e.disabled || e.hidden || t ? NodeFilter.FILTER_SKIP : e.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
	}, "acceptNode") });
	for (; n.nextNode();) t.push(n.currentNode);
	return t;
}
St(kt, "getTabbableCandidates");
function At(e, t) {
	let n = typeof t.checkVisibility == "function" && t.checkVisibility({ checkVisibilityCSS: !0 });
	for (let r of e) if (!(n ? !r.checkVisibility({ checkVisibilityCSS: !0 }) : jt(r, { upTo: t }))) return r;
}
St(At, "findVisible");
function jt(e, { upTo: t }) {
	if (getComputedStyle(e).visibility === "hidden") return !0;
	for (; e;) {
		if (t !== void 0 && e === t) return !1;
		if (getComputedStyle(e).display === "none") return !0;
		e = e.parentElement;
	}
	return !1;
}
St(jt, "isHidden");
function Mt(e) {
	return e instanceof HTMLInputElement && "select" in e;
}
St(Mt, "isSelectableInput");
function Nt(e, { select: t = !1 } = {}) {
	if (e && e.focus) {
		let n = document.activeElement;
		e.focus({ preventScroll: !0 }), e !== n && Mt(e) && t && e.select();
	}
}
St(Nt, "focus");
var Pt = Ft();
function Ft() {
	let e = [];
	return {
		add(t) {
			let n = e[0];
			t !== n && n?.pause(), e = It(e, t), e.unshift(t);
		},
		remove(t) {
			e = It(e, t), e[0]?.resume();
		}
	};
}
St(Ft, "createFocusScopesStack");
function It(e, t) {
	let n = [...e], r = n.indexOf(t);
	return r !== -1 && n.splice(r, 1), n;
}
St(It, "arrayRemove");
function Lt(e) {
	return e.filter((e) => e.tagName !== "A");
}
St(Lt, "removeLinks");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-portal@1.1.15_@types+react-dom@19.2.3_@types+react@19.2.17__@types+reac_835fdb50e921ab143bf8543839f816a2/node_modules/@radix-ui/react-portal/dist/index.mjs
var Rt = Object.defineProperty, zt = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ ((e, t) => Rt(e, "name", {
	value: t,
	configurable: !0
}))(function(e, t) {
	let { container: n, ...r } = e, [a, o] = i.useState(!1);
	V(() => o(!0), []);
	let s = n || a && globalThis?.document?.body;
	return s ? _.createPortal(/* @__PURE__ */ (0, v.jsx)(F.div, {
		...r,
		ref: t
	}), s) : null;
}, "Portal")), Bt = Object.defineProperty, Vt = (e, t) => Bt(e, "name", {
	value: t,
	configurable: !0
}), Ht = 0, Ut = null;
function Wt(e) {
	return Gt(), e.children;
}
Vt(Wt, "FocusGuards");
function Gt() {
	i.useEffect(() => {
		Ut ||= {
			start: Kt(),
			end: Kt()
		};
		let { start: e, end: t } = Ut;
		return document.body.firstElementChild !== e && document.body.insertAdjacentElement("afterbegin", e), document.body.lastElementChild !== t && document.body.insertAdjacentElement("beforeend", t), Ht++, () => {
			Ht === 1 && (Ut?.start.remove(), Ut?.end.remove(), Ut = null), Ht = Math.max(0, Ht - 1);
		};
	}, []);
}
Vt(Gt, "useFocusGuards");
function Kt() {
	let e = document.createElement("span");
	return e.setAttribute("data-radix-focus-guard", ""), e.tabIndex = 0, e.style.outline = "none", e.style.opacity = "0", e.style.position = "fixed", e.style.pointerEvents = "none", e;
}
Vt(Kt, "createFocusGuard");
//#endregion
//#region ../../node_modules/.pnpm/tslib@2.6.2/node_modules/tslib/tslib.es6.mjs
var qt = function() {
	return qt = Object.assign || function(e) {
		for (var t, n = 1, r = arguments.length; n < r; n++) for (var i in t = arguments[n], t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
		return e;
	}, qt.apply(this, arguments);
};
function Jt(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
function Yt(e, t, n) {
	if (n || arguments.length === 2) for (var r = 0, i = t.length, a; r < i; r++) (a || !(r in t)) && (a ||= Array.prototype.slice.call(t, 0, r), a[r] = t[r]);
	return e.concat(a || Array.prototype.slice.call(t));
}
//#endregion
//#region node_modules/.pnpm/react-remove-scroll-bar@2.3.8_@types+react@19.2.17_react@19.2.8/node_modules/react-remove-scroll-bar/dist/es2015/constants.js
var Xt = "right-scroll-bar-position", Zt = "width-before-scroll-bar", Qt = "with-scroll-bars-hidden", $t = "--removed-body-scroll-bar-size";
//#endregion
//#region node_modules/.pnpm/use-callback-ref@1.3.3_@types+react@19.2.17_react@19.2.8/node_modules/use-callback-ref/dist/es2015/assignRef.js
function en(e, t) {
	return typeof e == "function" ? e(t) : e && (e.current = t), e;
}
//#endregion
//#region node_modules/.pnpm/use-callback-ref@1.3.3_@types+react@19.2.17_react@19.2.8/node_modules/use-callback-ref/dist/es2015/useRef.js
function tn(e, t) {
	var n = (0, i.useState)(function() {
		return {
			value: e,
			callback: t,
			facade: {
				get current() {
					return n.value;
				},
				set current(e) {
					var t = n.value;
					t !== e && (n.value = e, n.callback(e, t));
				}
			}
		};
	})[0];
	return n.callback = t, n.facade;
}
//#endregion
//#region node_modules/.pnpm/use-callback-ref@1.3.3_@types+react@19.2.17_react@19.2.8/node_modules/use-callback-ref/dist/es2015/useMergeRef.js
var nn = typeof window < "u" ? i.useLayoutEffect : i.useEffect, rn = /* @__PURE__ */ new WeakMap();
function an(e, t) {
	var n = tn(t || null, function(t) {
		return e.forEach(function(e) {
			return en(e, t);
		});
	});
	return nn(function() {
		var t = rn.get(n);
		if (t) {
			var r = new Set(t), i = new Set(e), a = n.current;
			r.forEach(function(e) {
				i.has(e) || en(e, null);
			}), i.forEach(function(e) {
				r.has(e) || en(e, a);
			});
		}
		rn.set(n, e);
	}, [e]), n;
}
//#endregion
//#region node_modules/.pnpm/use-sidecar@1.1.3_@types+react@19.2.17_react@19.2.8/node_modules/use-sidecar/dist/es2015/medium.js
function on(e) {
	return e;
}
function sn(e, t) {
	t === void 0 && (t = on);
	var n = [], r = !1;
	return {
		read: function() {
			if (r) throw Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
			return n.length ? n[n.length - 1] : e;
		},
		useMedium: function(e) {
			var i = t(e, r);
			return n.push(i), function() {
				n = n.filter(function(e) {
					return e !== i;
				});
			};
		},
		assignSyncMedium: function(e) {
			for (r = !0; n.length;) {
				var t = n;
				n = [], t.forEach(e);
			}
			n = {
				push: function(t) {
					return e(t);
				},
				filter: function() {
					return n;
				}
			};
		},
		assignMedium: function(e) {
			r = !0;
			var t = [];
			if (n.length) {
				var i = n;
				n = [], i.forEach(e), t = n;
			}
			var a = function() {
				var n = t;
				t = [], n.forEach(e);
			}, o = function() {
				return Promise.resolve().then(a);
			};
			o(), n = {
				push: function(e) {
					t.push(e), o();
				},
				filter: function(e) {
					return t = t.filter(e), n;
				}
			};
		}
	};
}
function cn(e) {
	e === void 0 && (e = {});
	var t = sn(null);
	return t.options = qt({
		async: !0,
		ssr: !1
	}, e), t;
}
//#endregion
//#region node_modules/.pnpm/use-sidecar@1.1.3_@types+react@19.2.17_react@19.2.8/node_modules/use-sidecar/dist/es2015/exports.js
var ln = function(e) {
	var t = e.sideCar, n = Jt(e, ["sideCar"]);
	if (!t) throw Error("Sidecar: please provide `sideCar` property to import the right car");
	var r = t.read();
	if (!r) throw Error("Sidecar medium not found");
	return i.createElement(r, qt({}, n));
};
ln.isSideCarExport = !0;
function un(e, t) {
	return e.useMedium(t), ln;
}
//#endregion
//#region node_modules/.pnpm/react-remove-scroll@2.7.2_@types+react@19.2.17_react@19.2.8/node_modules/react-remove-scroll/dist/es2015/medium.js
var dn = cn(), fn = function() {}, pn = i.forwardRef(function(e, t) {
	var n = i.useRef(null), r = i.useState({
		onScrollCapture: fn,
		onWheelCapture: fn,
		onTouchMoveCapture: fn
	}), a = r[0], o = r[1], s = e.forwardProps, c = e.children, l = e.className, u = e.removeScrollBar, d = e.enabled, f = e.shards, p = e.sideCar, m = e.noRelative, h = e.noIsolation, g = e.inert, _ = e.allowPinchZoom, v = e.as, y = v === void 0 ? "div" : v, b = e.gapMode, x = Jt(e, [
		"forwardProps",
		"children",
		"className",
		"removeScrollBar",
		"enabled",
		"shards",
		"sideCar",
		"noRelative",
		"noIsolation",
		"inert",
		"allowPinchZoom",
		"as",
		"gapMode"
	]), S = p, C = an([n, t]), w = qt(qt({}, x), a);
	return i.createElement(i.Fragment, null, d && i.createElement(S, {
		sideCar: dn,
		removeScrollBar: u,
		shards: f,
		noRelative: m,
		noIsolation: h,
		inert: g,
		setCallbacks: o,
		allowPinchZoom: !!_,
		lockRef: n,
		gapMode: b
	}), s ? i.cloneElement(i.Children.only(c), qt(qt({}, w), { ref: C })) : i.createElement(y, qt({}, w, {
		className: l,
		ref: C
	}), c));
});
pn.defaultProps = {
	enabled: !0,
	removeScrollBar: !0,
	inert: !1
}, pn.classNames = {
	fullWidth: Zt,
	zeroRight: Xt
};
//#endregion
//#region node_modules/.pnpm/get-nonce@1.0.1/node_modules/get-nonce/dist/es2015/index.js
var mn, hn = function() {
	if (mn) return mn;
	if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
//#endregion
//#region node_modules/.pnpm/react-style-singleton@2.2.3_@types+react@19.2.17_react@19.2.8/node_modules/react-style-singleton/dist/es2015/singleton.js
function gn() {
	if (!document) return null;
	var e = document.createElement("style");
	e.type = "text/css";
	var t = hn();
	return t && e.setAttribute("nonce", t), e;
}
function _n(e, t) {
	e.styleSheet ? e.styleSheet.cssText = t : e.appendChild(document.createTextNode(t));
}
function vn(e) {
	(document.head || document.getElementsByTagName("head")[0]).appendChild(e);
}
var yn = function() {
	var e = 0, t = null;
	return {
		add: function(n) {
			e == 0 && (t = gn()) && (_n(t, n), vn(t)), e++;
		},
		remove: function() {
			e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), t = null);
		}
	};
}, bn = function() {
	var e = yn();
	return function(t, n) {
		i.useEffect(function() {
			return e.add(t), function() {
				e.remove();
			};
		}, [t && n]);
	};
}, xn = function() {
	var e = bn();
	return function(t) {
		var n = t.styles, r = t.dynamic;
		return e(n, r), null;
	};
}, Sn = {
	left: 0,
	top: 0,
	right: 0,
	gap: 0
}, Cn = function(e) {
	return parseInt(e || "", 10) || 0;
}, wn = function(e) {
	var t = window.getComputedStyle(document.body), n = t[e === "padding" ? "paddingLeft" : "marginLeft"], r = t[e === "padding" ? "paddingTop" : "marginTop"], i = t[e === "padding" ? "paddingRight" : "marginRight"];
	return [
		Cn(n),
		Cn(r),
		Cn(i)
	];
}, Tn = function(e) {
	if (e === void 0 && (e = "margin"), typeof window > "u") return Sn;
	var t = wn(e), n = document.documentElement.clientWidth, r = window.innerWidth;
	return {
		left: t[0],
		top: t[1],
		right: t[2],
		gap: Math.max(0, r - n + t[2] - t[0])
	};
}, En = xn(), Dn = "data-scroll-locked", On = function(e, t, n, r) {
	var i = e.left, a = e.top, o = e.right, s = e.gap;
	return n === void 0 && (n = "margin"), `
  .${Qt} {
   overflow: hidden ${r};
   padding-right: ${s}px ${r};
  }
  body[${Dn}] {
    overflow: hidden ${r};
    overscroll-behavior: contain;
    ${[
		t && `position: relative ${r};`,
		n === "margin" && `
    padding-left: ${i}px;
    padding-top: ${a}px;
    padding-right: ${o}px;
    margin-left:0;
    margin-top:0;
    margin-right: ${s}px ${r};
    `,
		n === "padding" && `padding-right: ${s}px ${r};`
	].filter(Boolean).join("")}
  }
  
  .${Xt} {
    right: ${s}px ${r};
  }
  
  .${Zt} {
    margin-right: ${s}px ${r};
  }
  
  .${Xt} .${Xt} {
    right: 0 ${r};
  }
  
  .${Zt} .${Zt} {
    margin-right: 0 ${r};
  }
  
  body[${Dn}] {
    ${$t}: ${s}px;
  }
`;
}, kn = function() {
	var e = parseInt(document.body.getAttribute("data-scroll-locked") || "0", 10);
	return isFinite(e) ? e : 0;
}, An = function() {
	i.useEffect(function() {
		return document.body.setAttribute(Dn, (kn() + 1).toString()), function() {
			var e = kn() - 1;
			e <= 0 ? document.body.removeAttribute(Dn) : document.body.setAttribute(Dn, e.toString());
		};
	}, []);
}, jn = function(e) {
	var t = e.noRelative, n = e.noImportant, r = e.gapMode, a = r === void 0 ? "margin" : r;
	An();
	var o = i.useMemo(function() {
		return Tn(a);
	}, [a]);
	return i.createElement(En, { styles: On(o, !t, a, n ? "" : "!important") });
}, Mn = !1;
if (typeof window < "u") try {
	var Nn = Object.defineProperty({}, "passive", { get: function() {
		return Mn = !0, !0;
	} });
	window.addEventListener("test", Nn, Nn), window.removeEventListener("test", Nn, Nn);
} catch {
	Mn = !1;
}
var Pn = Mn ? { passive: !1 } : !1, Fn = function(e) {
	return e.tagName === "TEXTAREA";
}, In = function(e, t) {
	if (!(e instanceof Element)) return !1;
	var n = window.getComputedStyle(e);
	return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !Fn(e) && n[t] === "visible");
}, Ln = function(e) {
	return In(e, "overflowY");
}, Rn = function(e) {
	return In(e, "overflowX");
}, zn = function(e, t) {
	var n = t.ownerDocument, r = t;
	do {
		if (typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host), Hn(e, r)) {
			var i = Un(e, r);
			if (i[1] > i[2]) return !0;
		}
		r = r.parentNode;
	} while (r && r !== n.body);
	return !1;
}, Bn = function(e) {
	return [
		e.scrollTop,
		e.scrollHeight,
		e.clientHeight
	];
}, Vn = function(e) {
	return [
		e.scrollLeft,
		e.scrollWidth,
		e.clientWidth
	];
}, Hn = function(e, t) {
	return e === "v" ? Ln(t) : Rn(t);
}, Un = function(e, t) {
	return e === "v" ? Bn(t) : Vn(t);
}, Wn = function(e, t) {
	return e === "h" && t === "rtl" ? -1 : 1;
}, Gn = function(e, t, n, r, i) {
	var a = Wn(e, window.getComputedStyle(t).direction), o = a * r, s = n.target, c = t.contains(s), l = !1, u = o > 0, d = 0, f = 0;
	do {
		if (!s) break;
		var p = Un(e, s), m = p[0], h = p[1] - p[2] - a * m;
		(m || h) && Hn(e, s) && (d += h, f += m);
		var g = s.parentNode;
		s = g && g.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? g.host : g;
	} while (!c && s !== document.body || c && (t.contains(s) || t === s));
	return (u && (i && Math.abs(d) < 1 || !i && o > d) || !u && (i && Math.abs(f) < 1 || !i && -o > f)) && (l = !0), l;
}, Kn = function(e) {
	return "changedTouches" in e ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY] : [0, 0];
}, qn = function(e) {
	return [e.deltaX, e.deltaY];
}, Jn = function(e) {
	return e && "current" in e ? e.current : e;
}, Yn = function(e, t) {
	return e[0] === t[0] && e[1] === t[1];
}, Xn = function(e) {
	return `
  .block-interactivity-${e} {pointer-events: none;}
  .allow-interactivity-${e} {pointer-events: all;}
`;
}, Zn = 0, Qn = [];
function $n(e) {
	var t = i.useRef([]), n = i.useRef([0, 0]), r = i.useRef(), a = i.useState(Zn++)[0], o = i.useState(xn)[0], s = i.useRef(e);
	i.useEffect(function() {
		s.current = e;
	}, [e]), i.useEffect(function() {
		if (e.inert) {
			document.body.classList.add(`block-interactivity-${a}`);
			var t = Yt([e.lockRef.current], (e.shards || []).map(Jn), !0).filter(Boolean);
			return t.forEach(function(e) {
				return e.classList.add(`allow-interactivity-${a}`);
			}), function() {
				document.body.classList.remove(`block-interactivity-${a}`), t.forEach(function(e) {
					return e.classList.remove(`allow-interactivity-${a}`);
				});
			};
		}
	}, [
		e.inert,
		e.lockRef.current,
		e.shards
	]);
	var c = i.useCallback(function(e, t) {
		if ("touches" in e && e.touches.length === 2 || e.type === "wheel" && e.ctrlKey) return !s.current.allowPinchZoom;
		var i = Kn(e), a = n.current, o = "deltaX" in e ? e.deltaX : a[0] - i[0], c = "deltaY" in e ? e.deltaY : a[1] - i[1], l, u = e.target, d = Math.abs(o) > Math.abs(c) ? "h" : "v";
		if ("touches" in e && d === "h" && u.type === "range") return !1;
		var f = window.getSelection(), p = f && f.anchorNode;
		if (p && (p === u || p.contains(u))) return !1;
		var m = zn(d, u);
		if (!m) return !0;
		if (m ? l = d : (l = d === "v" ? "h" : "v", m = zn(d, u)), !m) return !1;
		if (!r.current && "changedTouches" in e && (o || c) && (r.current = l), !l) return !0;
		var h = r.current || l;
		return Gn(h, t, e, h === "h" ? o : c, !0);
	}, []), l = i.useCallback(function(e) {
		var n = e;
		if (!(!Qn.length || Qn[Qn.length - 1] !== o)) {
			var r = "deltaY" in n ? qn(n) : Kn(n), i = t.current.filter(function(e) {
				return e.name === n.type && (e.target === n.target || n.target === e.shadowParent) && Yn(e.delta, r);
			})[0];
			if (i && i.should) {
				n.cancelable && n.preventDefault();
				return;
			}
			if (!i) {
				var a = (s.current.shards || []).map(Jn).filter(Boolean).filter(function(e) {
					return e.contains(n.target);
				});
				(a.length > 0 ? c(n, a[0]) : !s.current.noIsolation) && n.cancelable && n.preventDefault();
			}
		}
	}, []), u = i.useCallback(function(e, n, r, i) {
		var a = {
			name: e,
			delta: n,
			target: r,
			should: i,
			shadowParent: er(r)
		};
		t.current.push(a), setTimeout(function() {
			t.current = t.current.filter(function(e) {
				return e !== a;
			});
		}, 1);
	}, []), d = i.useCallback(function(e) {
		n.current = Kn(e), r.current = void 0;
	}, []), f = i.useCallback(function(t) {
		u(t.type, qn(t), t.target, c(t, e.lockRef.current));
	}, []), p = i.useCallback(function(t) {
		u(t.type, Kn(t), t.target, c(t, e.lockRef.current));
	}, []);
	i.useEffect(function() {
		return Qn.push(o), e.setCallbacks({
			onScrollCapture: f,
			onWheelCapture: f,
			onTouchMoveCapture: p
		}), document.addEventListener("wheel", l, Pn), document.addEventListener("touchmove", l, Pn), document.addEventListener("touchstart", d, Pn), function() {
			Qn = Qn.filter(function(e) {
				return e !== o;
			}), document.removeEventListener("wheel", l, Pn), document.removeEventListener("touchmove", l, Pn), document.removeEventListener("touchstart", d, Pn);
		};
	}, []);
	var m = e.removeScrollBar, h = e.inert;
	return i.createElement(i.Fragment, null, h ? i.createElement(o, { styles: Xn(a) }) : null, m ? i.createElement(jn, {
		noRelative: e.noRelative,
		gapMode: e.gapMode
	}) : null);
}
function er(e) {
	for (var t = null; e !== null;) e instanceof ShadowRoot && (t = e.host, e = e.host), e = e.parentNode;
	return t;
}
//#endregion
//#region node_modules/.pnpm/react-remove-scroll@2.7.2_@types+react@19.2.17_react@19.2.8/node_modules/react-remove-scroll/dist/es2015/sidecar.js
var tr = un(dn, $n), nr = i.forwardRef(function(e, t) {
	return i.createElement(pn, qt({}, e, {
		ref: t,
		sideCar: tr
	}));
});
nr.classNames = pn.classNames;
//#endregion
//#region node_modules/.pnpm/aria-hidden@1.2.6/node_modules/aria-hidden/dist/es2015/index.js
var rr = function(e) {
	return typeof document > "u" ? null : (Array.isArray(e) ? e[0] : e).ownerDocument.body;
}, ir = /* @__PURE__ */ new WeakMap(), ar = /* @__PURE__ */ new WeakMap(), or = {}, sr = 0, cr = function(e) {
	return e && (e.host || cr(e.parentNode));
}, lr = function(e, t) {
	return t.map(function(t) {
		if (e.contains(t)) return t;
		var n = cr(t);
		return n && e.contains(n) ? n : (console.error("aria-hidden", t, "in not contained inside", e, ". Doing nothing"), null);
	}).filter(function(e) {
		return !!e;
	});
}, ur = function(e, t, n, r) {
	var i = lr(t, Array.isArray(e) ? e : [e]);
	or[n] || (or[n] = /* @__PURE__ */ new WeakMap());
	var a = or[n], o = [], s = /* @__PURE__ */ new Set(), c = new Set(i), l = function(e) {
		!e || s.has(e) || (s.add(e), l(e.parentNode));
	};
	i.forEach(l);
	var u = function(e) {
		!e || c.has(e) || Array.prototype.forEach.call(e.children, function(e) {
			if (s.has(e)) u(e);
			else try {
				var t = e.getAttribute(r), i = t !== null && t !== "false", c = (ir.get(e) || 0) + 1, l = (a.get(e) || 0) + 1;
				ir.set(e, c), a.set(e, l), o.push(e), c === 1 && i && ar.set(e, !0), l === 1 && e.setAttribute(n, "true"), i || e.setAttribute(r, "true");
			} catch (t) {
				console.error("aria-hidden: cannot operate on ", e, t);
			}
		});
	};
	return u(t), s.clear(), sr++, function() {
		o.forEach(function(e) {
			var t = ir.get(e) - 1, i = a.get(e) - 1;
			ir.set(e, t), a.set(e, i), t || (ar.has(e) || e.removeAttribute(r), ar.delete(e)), i || e.removeAttribute(n);
		}), sr--, sr || (ir = /* @__PURE__ */ new WeakMap(), ir = /* @__PURE__ */ new WeakMap(), ar = /* @__PURE__ */ new WeakMap(), or = {});
	};
}, dr = function(e, t, n) {
	n === void 0 && (n = "data-aria-hidden");
	var r = Array.from(Array.isArray(e) ? e : [e]), i = t || rr(e);
	return i ? (r.push.apply(r, Array.from(i.querySelectorAll("[aria-live], script"))), ur(r, i, n, "aria-hidden")) : function() {
		return null;
	};
}, fr = Object.defineProperty, pr = (e, t) => fr(e, "name", {
	value: t,
	configurable: !0
}), mr = "Dialog", [hr, gr] = /* @__PURE__ */ ue(mr), [_r, vr] = hr(mr), yr = /* @__PURE__ */ pr((e) => {
	let { __scopeDialog: t, children: n, open: r, defaultOpen: a, onOpenChange: o, modal: s = !0 } = e, c = i.useRef(null), l = i.useRef(null), [u, d] = Re({
		prop: r,
		defaultProp: a ?? !1,
		onChange: o,
		caller: mr
	}), [f, p] = i.useState(0), [m, h] = i.useState(0);
	return /* @__PURE__ */ (0, v.jsx)(_r, {
		scope: t,
		triggerRef: c,
		contentRef: l,
		contentId: $e(),
		titleId: $e(),
		descriptionId: $e(),
		titlePresent: f > 0,
		descriptionPresent: m > 0,
		setTitleCount: p,
		setDescriptionCount: h,
		open: u,
		onOpenChange: d,
		onOpenToggle: i.useCallback(() => d((e) => !e), [d]),
		modal: s,
		children: n
	});
}, "Dialog"), br = "DialogTrigger", xr = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ pr(function(e, t) {
	let { __scopeDialog: n, ...r } = e, i = vr(br, n), a = h(t, i.triggerRef);
	return /* @__PURE__ */ (0, v.jsx)(F.button, {
		type: "button",
		"aria-haspopup": "dialog",
		"aria-expanded": i.open,
		"aria-controls": i.open ? i.contentId : void 0,
		"data-state": Br(i.open),
		...r,
		ref: a,
		onClick: B(e.onClick, i.onOpenToggle)
	});
}, "DialogTrigger")), Sr = "DialogPortal", [Cr, wr] = hr(Sr, { forceMount: void 0 }), Tr = /* @__PURE__ */ pr((e) => {
	let { __scopeDialog: t, forceMount: n, children: r, container: a } = e, o = vr(Sr, t);
	return /* @__PURE__ */ (0, v.jsx)(Cr, {
		scope: t,
		forceMount: n,
		children: i.Children.map(r, (e) => /* @__PURE__ */ (0, v.jsx)(H, {
			present: n || o.open,
			children: /* @__PURE__ */ (0, v.jsx)(zt, {
				asChild: !0,
				container: a,
				children: e
			})
		}))
	});
}, "DialogPortal"), Er = "DialogOverlay", Dr = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ pr(function(e, t) {
	let n = wr(Er, e.__scopeDialog), { forceMount: r = n.forceMount, ...i } = e, a = vr(Er, e.__scopeDialog);
	return a.modal ? /* @__PURE__ */ (0, v.jsx)(H, {
		present: r || a.open,
		children: /* @__PURE__ */ (0, v.jsx)(kr, {
			...i,
			ref: t
		})
	}) : null;
}, "DialogOverlay")), Or = /* @__PURE__ */ w("DialogOverlay.RemoveScroll"), kr = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ pr(function(e, t) {
	let { __scopeDialog: n, ...r } = e, i = vr(Er, n), a = h(t, ht());
	return /* @__PURE__ */ (0, v.jsx)(nr, {
		as: Or,
		allowPinchZoom: !0,
		shards: [i.contentRef],
		children: /* @__PURE__ */ (0, v.jsx)(F.div, {
			"data-state": Br(i.open),
			...r,
			ref: a,
			style: {
				pointerEvents: "auto",
				...r.style
			}
		})
	});
}, "DialogOverlayImpl")), Ar = "DialogContent", jr = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ pr(function(e, t) {
	let n = wr(Ar, e.__scopeDialog), { forceMount: r = n.forceMount, ...i } = e, a = vr(Ar, e.__scopeDialog);
	return /* @__PURE__ */ (0, v.jsx)(H, {
		present: r || a.open,
		children: a.modal ? /* @__PURE__ */ (0, v.jsx)(Mr, {
			...i,
			ref: t
		}) : /* @__PURE__ */ (0, v.jsx)(Nr, {
			...i,
			ref: t
		})
	});
}, "DialogContent")), Mr = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ pr(function(e, t) {
	let n = vr(Ar, e.__scopeDialog), r = i.useRef(null), a = h(t, n.contentRef, r);
	return i.useEffect(() => {
		let e = r.current;
		if (e) return dr(e);
	}, []), /* @__PURE__ */ (0, v.jsx)(Pr, {
		...e,
		ref: a,
		trapFocus: n.open,
		disableOutsidePointerEvents: n.open,
		onCloseAutoFocus: B(e.onCloseAutoFocus, (e) => {
			e.preventDefault(), n.triggerRef.current?.focus();
		}),
		onPointerDownOutside: B(e.onPointerDownOutside, (e) => {
			let t = e.detail.originalEvent, n = t.button === 0 && t.ctrlKey === !0;
			(t.button === 2 || n) && e.preventDefault();
		}),
		onFocusOutside: B(e.onFocusOutside, (e) => e.preventDefault())
	});
}, "DialogContentModal")), Nr = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ pr(function(e, t) {
	let n = vr(Ar, e.__scopeDialog), r = i.useRef(!1), a = i.useRef(!1);
	return /* @__PURE__ */ (0, v.jsx)(Pr, {
		...e,
		ref: t,
		trapFocus: !1,
		disableOutsidePointerEvents: !1,
		onCloseAutoFocus: (t) => {
			e.onCloseAutoFocus?.(t), t.defaultPrevented || (r.current || n.triggerRef.current?.focus(), t.preventDefault()), r.current = !1, a.current = !1;
		},
		onInteractOutside: (t) => {
			e.onInteractOutside?.(t), t.defaultPrevented || (r.current = !0, t.detail.originalEvent.type === "pointerdown" && (a.current = !0));
			let i = t.target;
			n.triggerRef.current?.contains(i) && t.preventDefault(), t.detail.originalEvent.type === "focusin" && a.current && t.preventDefault();
		}
	});
}, "DialogContentNonModal")), Pr = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ pr(function(e, t) {
	let { __scopeDialog: n, trapFocus: r, onOpenAutoFocus: i, onCloseAutoFocus: a, "aria-describedby": o, ...s } = e, c = vr(Ar, n);
	return Gt(), /* @__PURE__ */ (0, v.jsx)(v.Fragment, { children: /* @__PURE__ */ (0, v.jsx)(Et, {
		asChild: !0,
		loop: !0,
		trapped: r,
		onMountAutoFocus: i,
		onUnmountAutoFocus: a,
		children: /* @__PURE__ */ (0, v.jsx)(pt, {
			role: "dialog",
			id: c.contentId,
			"aria-labelledby": c.titlePresent ? c.titleId : void 0,
			"aria-describedby": c.descriptionPresent ? zr(o, c.descriptionId) : o,
			"data-state": Br(c.open),
			...s,
			ref: t,
			deferPointerDownOutside: !0,
			onDismiss: () => c.onOpenChange(!1)
		})
	}) });
}, "DialogContentImpl")), Fr = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ pr(function(e, t) {
	let { __scopeDialog: n, ...r } = e, i = vr("DialogTitle", n), { setTitleCount: a } = i;
	return V(() => (a((e) => e + 1), () => a((e) => e - 1)), [a]), /* @__PURE__ */ (0, v.jsx)(F.h2, {
		id: i.titleId,
		...r,
		ref: t
	});
}, "DialogTitle")), Ir = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ pr(function(e, t) {
	let { __scopeDialog: n, ...r } = e, i = vr("DialogDescription", n), { setDescriptionCount: a } = i;
	return V(() => (a((e) => e + 1), () => a((e) => e - 1)), [a]), /* @__PURE__ */ (0, v.jsx)(F.p, {
		id: i.descriptionId,
		...r,
		ref: t
	});
}, "DialogDescription")), Lr = "DialogClose", Rr = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ pr(function(e, t) {
	let { __scopeDialog: n, ...r } = e, i = vr(Lr, n);
	return /* @__PURE__ */ (0, v.jsx)(F.button, {
		type: "button",
		...r,
		ref: t,
		onClick: B(e.onClick, () => i.onOpenChange(!1))
	});
}, "DialogClose"));
function zr(...e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) if (typeof n == "string") for (let e of String(n).trim().split(/\s+/)) e && t.add(e);
	return t.size > 0 ? Array.from(t).join(" ") : void 0;
}
pr(zr, "concatAriaDescribedby");
function Br(e) {
	return e ? "open" : "closed";
}
pr(Br, "getState");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-alert-dialog@1.1.21_@types+react-dom@19.2.3_@types+react@19.2.17__@type_de2dcecb43f179bc364eac794aacef25/node_modules/@radix-ui/react-alert-dialog/dist/index.mjs
var Vr = Object.defineProperty, Hr = (e, t) => Vr(e, "name", {
	value: t,
	configurable: !0
}), [Ur, Wr] = /* @__PURE__ */ ue("AlertDialog", [gr]), Gr = gr(), Kr = /* @__PURE__ */ Hr((e) => {
	let { __scopeAlertDialog: t, ...n } = e, r = Gr(t);
	return /* @__PURE__ */ (0, v.jsx)(yr, {
		...r,
		...n,
		modal: !0
	});
}, "AlertDialog");
i.forwardRef(/* @__PURE__ */ Hr(function(e, t) {
	let { __scopeAlertDialog: n, ...r } = e, i = Gr(n);
	return /* @__PURE__ */ (0, v.jsx)(xr, {
		...i,
		...r,
		ref: t
	});
}, "AlertDialogTrigger"));
var qr = /* @__PURE__ */ Hr((e) => {
	let { __scopeAlertDialog: t, ...n } = e, r = Gr(t);
	return /* @__PURE__ */ (0, v.jsx)(Tr, {
		...r,
		...n
	});
}, "AlertDialogPortal"), Jr = i.forwardRef(/* @__PURE__ */ Hr(function(e, t) {
	let { __scopeAlertDialog: n, ...r } = e, i = Gr(n);
	return /* @__PURE__ */ (0, v.jsx)(Dr, {
		...i,
		...r,
		ref: t
	});
}, "AlertDialogOverlay")), [Yr, Xr] = Ur("AlertDialogContent"), Zr = i.forwardRef(/* @__PURE__ */ Hr(function(e, t) {
	let { __scopeAlertDialog: n, children: r, ...a } = e, o = Gr(n), s = h(t, i.useRef(null)), c = i.useRef(null);
	return /* @__PURE__ */ (0, v.jsx)(Yr, {
		scope: n,
		cancelRef: c,
		children: /* @__PURE__ */ (0, v.jsx)(jr, {
			role: "alertdialog",
			...o,
			...a,
			ref: s,
			onOpenAutoFocus: B(a.onOpenAutoFocus, (e) => {
				e.preventDefault(), c.current?.focus({ preventScroll: !0 });
			}),
			onPointerDownOutside: (e) => e.preventDefault(),
			onInteractOutside: (e) => e.preventDefault(),
			children: r
		})
	});
}, "AlertDialogContent")), Qr = i.forwardRef(/* @__PURE__ */ Hr(function(e, t) {
	let { __scopeAlertDialog: n, ...r } = e, i = Gr(n);
	return /* @__PURE__ */ (0, v.jsx)(Fr, {
		...i,
		...r,
		ref: t
	});
}, "AlertDialogTitle")), $r = i.forwardRef(/* @__PURE__ */ Hr(function(e, t) {
	let { __scopeAlertDialog: n, ...r } = e, i = Gr(n);
	return /* @__PURE__ */ (0, v.jsx)(Ir, {
		...i,
		...r,
		ref: t
	});
}, "AlertDialogDescription")), ei = i.forwardRef(/* @__PURE__ */ Hr(function(e, t) {
	let { __scopeAlertDialog: n, ...r } = e, i = Gr(n);
	return /* @__PURE__ */ (0, v.jsx)(Rr, {
		...i,
		...r,
		ref: t
	});
}, "AlertDialogAction")), ti = "AlertDialogCancel", ni = i.forwardRef(/* @__PURE__ */ Hr(function(e, t) {
	let { __scopeAlertDialog: n, ...r } = e, { cancelRef: i } = Xr(ti, n), a = Gr(n), o = h(t, i);
	return /* @__PURE__ */ (0, v.jsx)(Rr, {
		...a,
		...r,
		ref: o
	});
}, "AlertDialogCancel")), ri = Object.defineProperty, ii = (e, t) => ri(e, "name", {
	value: t,
	configurable: !0
});
function ai(e) {
	let [t, n] = i.useState(void 0);
	return V(() => {
		if (e) {
			n({
				width: e.offsetWidth,
				height: e.offsetHeight
			});
			let t = new ResizeObserver((t) => {
				if (!Array.isArray(t) || !t.length) return;
				let r = t[0], i, a;
				if ("borderBoxSize" in r) {
					let e = r.borderBoxSize, t = Array.isArray(e) ? e[0] : e;
					i = t.inlineSize, a = t.blockSize;
				} else i = e.offsetWidth, a = e.offsetHeight;
				n({
					width: i,
					height: a
				});
			});
			return t.observe(e, { box: "border-box" }), () => t.unobserve(e);
		} else n(void 0);
	}, [e]), t;
}
ii(ai, "useSize");
//#endregion
//#region node_modules/.pnpm/@floating-ui+utils@0.2.12/node_modules/@floating-ui/utils/dist/floating-ui.utils.mjs
var oi = [
	"top",
	"right",
	"bottom",
	"left"
], si = Math.min, ci = Math.max, li = Math.round, ui = Math.floor, di = (e) => ({
	x: e,
	y: e
}), fi = {
	left: "right",
	right: "left",
	bottom: "top",
	top: "bottom"
};
function pi(e, t, n) {
	return ci(e, si(t, n));
}
function mi(e, t) {
	return typeof e == "function" ? e(t) : e;
}
function hi(e) {
	return e.split("-")[0];
}
function gi(e) {
	return e.split("-")[1];
}
function _i(e) {
	return e === "x" ? "y" : "x";
}
function vi(e) {
	return e === "y" ? "height" : "width";
}
function yi(e) {
	let t = e[0];
	return t === "t" || t === "b" ? "y" : "x";
}
function bi(e) {
	return _i(yi(e));
}
function xi(e, t, n) {
	n === void 0 && (n = !1);
	let r = gi(e), i = bi(e), a = vi(i), o = i === "x" ? r === (n ? "end" : "start") ? "right" : "left" : r === "start" ? "bottom" : "top";
	return t.reference[a] > t.floating[a] && (o = Ai(o)), [o, Ai(o)];
}
function Si(e) {
	let t = Ai(e);
	return [
		Ci(e),
		t,
		Ci(t)
	];
}
function Ci(e) {
	return e.includes("start") ? e.replace("start", "end") : e.replace("end", "start");
}
var wi = ["left", "right"], Ti = ["right", "left"], Ei = ["top", "bottom"], Di = ["bottom", "top"];
function Oi(e, t, n) {
	switch (e) {
		case "top":
		case "bottom": return n ? t ? Ti : wi : t ? wi : Ti;
		case "left":
		case "right": return t ? Ei : Di;
		default: return [];
	}
}
function ki(e, t, n, r) {
	let i = gi(e), a = Oi(hi(e), n === "start", r);
	return i && (a = a.map((e) => e + "-" + i), t && (a = a.concat(a.map(Ci)))), a;
}
function Ai(e) {
	let t = hi(e);
	return fi[t] + e.slice(t.length);
}
function ji(e) {
	return {
		top: e.top ?? 0,
		right: e.right ?? 0,
		bottom: e.bottom ?? 0,
		left: e.left ?? 0
	};
}
function Mi(e) {
	return typeof e == "number" ? {
		top: e,
		right: e,
		bottom: e,
		left: e
	} : ji(e);
}
function Ni(e) {
	let { x: t, y: n, width: r, height: i } = e;
	return {
		width: r,
		height: i,
		top: n,
		left: t,
		right: t + r,
		bottom: n + i,
		x: t,
		y: n
	};
}
//#endregion
//#region node_modules/.pnpm/@floating-ui+core@1.8.0/node_modules/@floating-ui/core/dist/floating-ui.core.mjs
function Pi(e, t, n) {
	let { reference: r, floating: i } = e, a = yi(t), o = bi(t), s = vi(o), c = hi(t), l = a === "y", u = r.x + r.width / 2 - i.width / 2, d = r.y + r.height / 2 - i.height / 2, f = r[s] / 2 - i[s] / 2, p;
	switch (c) {
		case "top":
			p = {
				x: u,
				y: r.y - i.height
			};
			break;
		case "bottom":
			p = {
				x: u,
				y: r.y + r.height
			};
			break;
		case "right":
			p = {
				x: r.x + r.width,
				y: d
			};
			break;
		case "left":
			p = {
				x: r.x - i.width,
				y: d
			};
			break;
		default: p = {
			x: r.x,
			y: r.y
		};
	}
	let m = gi(t);
	return m && (p[o] += f * (m === "end" ? 1 : -1) * (n && l ? -1 : 1)), p;
}
async function Fi(e, t) {
	t === void 0 && (t = {});
	let { x: n, y: r, platform: i, rects: a, elements: o, strategy: s } = e, { boundary: c = "clippingAncestors", rootBoundary: l = "viewport", elementContext: u = "floating", altBoundary: d = !1, padding: f = 0 } = mi(t, e), p = Mi(f), m = o[d ? u === "floating" ? "reference" : "floating" : u], h = Ni(await i.getClippingRect({
		element: await (i.isElement == null ? void 0 : i.isElement(m)) ?? !0 ? m : m.contextElement || await (i.getDocumentElement == null ? void 0 : i.getDocumentElement(o.floating)),
		boundary: c,
		rootBoundary: l,
		strategy: s
	})), g = u === "floating" ? {
		x: n,
		y: r,
		width: a.floating.width,
		height: a.floating.height
	} : a.reference, _ = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(o.floating)), v = await (i.isElement == null ? void 0 : i.isElement(_)) && await (i.getScale == null ? void 0 : i.getScale(_)) || {
		x: 1,
		y: 1
	}, y = Ni(i.convertOffsetParentRelativeRectToViewportRelativeRect ? await i.convertOffsetParentRelativeRectToViewportRelativeRect({
		elements: o,
		rect: g,
		offsetParent: _,
		strategy: s
	}) : g);
	return {
		top: (h.top - y.top + p.top) / v.y,
		bottom: (y.bottom - h.bottom + p.bottom) / v.y,
		left: (h.left - y.left + p.left) / v.x,
		right: (y.right - h.right + p.right) / v.x
	};
}
var Ii = 50, Li = async (e, t, n) => {
	let { placement: r = "bottom", strategy: i = "absolute", middleware: a = [], platform: o } = n, s = o.detectOverflow ? o : {
		...o,
		detectOverflow: Fi
	}, c = await (o.isRTL == null ? void 0 : o.isRTL(t)), l = await o.getElementRects({
		reference: e,
		floating: t,
		strategy: i
	}), { x: u, y: d } = Pi(l, r, c), f = r, p = 0, m = {};
	for (let n = 0; n < a.length; n++) {
		let h = a[n];
		if (!h) continue;
		let { name: g, fn: _ } = h, { x: v, y, data: b, reset: x } = await _({
			x: u,
			y: d,
			initialPlacement: r,
			placement: f,
			strategy: i,
			middlewareData: m,
			rects: l,
			platform: s,
			elements: {
				reference: e,
				floating: t
			}
		});
		u = v ?? u, d = y ?? d, m[g] = {
			...m[g],
			...b
		}, x && p < Ii && (p++, typeof x == "object" && (x.placement && (f = x.placement), x.rects && (l = x.rects === !0 ? await o.getElementRects({
			reference: e,
			floating: t,
			strategy: i
		}) : x.rects), {x: u, y: d} = Pi(l, f, c)), n = -1);
	}
	return {
		x: u,
		y: d,
		placement: f,
		strategy: i,
		middlewareData: m
	};
}, Ri = (e) => ({
	name: "arrow",
	options: e,
	async fn(t) {
		let { x: n, y: r, placement: i, rects: a, platform: o, elements: s, middlewareData: c } = t, { element: l, padding: u = 0 } = mi(e, t) || {};
		if (l == null) return {};
		let d = Mi(u), f = {
			x: n,
			y: r
		}, p = bi(i), m = vi(p), h = await o.getDimensions(l), g = p === "y", _ = g ? "top" : "left", v = g ? "bottom" : "right", y = g ? "clientHeight" : "clientWidth", b = a.reference[m] + a.reference[p] - f[p] - a.floating[m], x = f[p] - a.reference[p], S = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l)), C = S ? S[y] : 0;
		(!C || !await (o.isElement == null ? void 0 : o.isElement(S))) && (C = s.floating[y] || a.floating[m]);
		let w = b / 2 - x / 2, T = C / 2 - h[m] / 2 - 1, E = si(d[_], T), D = si(d[v], T), O = C - h[m] - D, k = C / 2 - h[m] / 2 + w, A = pi(E, k, O), j = !c.arrow && gi(i) != null && k !== A && a.reference[m] / 2 - (k < E ? E : D) - h[m] / 2 < 0, M = j ? k < E ? k - E : k - O : 0;
		return {
			[p]: f[p] + M,
			data: {
				[p]: A,
				centerOffset: k - A - M,
				...j && { alignmentOffset: M }
			},
			reset: j
		};
	}
}), zi = function(e) {
	return e === void 0 && (e = {}), {
		name: "flip",
		options: e,
		async fn(t) {
			var n;
			let { placement: r, middlewareData: i, rects: a, initialPlacement: o, platform: s, elements: c } = t, { mainAxis: l = !0, crossAxis: u = !0, fallbackPlacements: d, fallbackStrategy: f = "bestFit", fallbackAxisSideDirection: p = "none", flipAlignment: m = !0, ...h } = mi(e, t);
			if ((n = i.arrow) != null && n.alignmentOffset) return {};
			let g = hi(r), _ = yi(o), v = hi(o) === o, y = await (s.isRTL == null ? void 0 : s.isRTL(c.floating)), b = d || (v || !m ? [Ai(o)] : Si(o)), x = p !== "none";
			!d && x && b.push(...ki(o, m, p, y));
			let S = [o, ...b], C = await s.detectOverflow(t, h), w = [], T = i.flip?.overflows || [];
			if (l && w.push(C[g]), u) {
				let e = xi(r, a, y);
				w.push(C[e[0]], C[e[1]]);
			}
			if (T = [...T, {
				placement: r,
				overflows: w
			}], !w.every((e) => e <= 0)) {
				let e = (i.flip?.index || 0) + 1, t = S[e];
				if (t && (!(u === "alignment" && _ !== yi(t)) || T.every((e) => yi(e.placement) !== _ || e.overflows[0] > 0))) return {
					data: {
						index: e,
						overflows: T
					},
					reset: { placement: t }
				};
				let n = T.filter((e) => e.overflows[0] <= 0).sort((e, t) => e.overflows[1] - t.overflows[1])[0]?.placement;
				if (!n) switch (f) {
					case "bestFit": {
						let e = T.filter((e) => {
							if (x) {
								let t = yi(e.placement);
								return t === _ || t === "y";
							}
							return !0;
						}).map((e) => [e.placement, e.overflows.filter((e) => e > 0).reduce((e, t) => e + t, 0)]).sort((e, t) => e[1] - t[1])[0]?.[0];
						e && (n = e);
						break;
					}
					case "initialPlacement":
						n = o;
						break;
				}
				if (r !== n) return { reset: { placement: n } };
			}
			return {};
		}
	};
};
function Bi(e, t) {
	return {
		top: e.top - t.height,
		right: e.right - t.width,
		bottom: e.bottom - t.height,
		left: e.left - t.width
	};
}
function Vi(e) {
	return oi.some((t) => e[t] >= 0);
}
var Hi = function(e) {
	return e === void 0 && (e = {}), {
		name: "hide",
		options: e,
		async fn(t) {
			let { rects: n, platform: r } = t, { strategy: i = "referenceHidden", ...a } = mi(e, t);
			switch (i) {
				case "referenceHidden": {
					let e = Bi(await r.detectOverflow(t, {
						...a,
						elementContext: "reference"
					}), n.reference);
					return { data: {
						referenceHiddenOffsets: e,
						referenceHidden: Vi(e)
					} };
				}
				case "escaped": {
					let e = Bi(await r.detectOverflow(t, {
						...a,
						altBoundary: !0
					}), n.floating);
					return { data: {
						escapedOffsets: e,
						escaped: Vi(e)
					} };
				}
				default: return {};
			}
		}
	};
}, Ui = /*#__PURE__*/ new Set(["left", "top"]);
async function Wi(e, t) {
	let { placement: n, platform: r, elements: i } = e, a = await (r.isRTL == null ? void 0 : r.isRTL(i.floating)), o = hi(n), s = gi(n), c = yi(n) === "y", l = Ui.has(o) ? -1 : 1, u = a && c ? -1 : 1, d = mi(t, e), { mainAxis: f, crossAxis: p, alignmentAxis: m } = typeof d == "number" ? {
		mainAxis: d,
		crossAxis: 0,
		alignmentAxis: null
	} : {
		mainAxis: d.mainAxis || 0,
		crossAxis: d.crossAxis || 0,
		alignmentAxis: d.alignmentAxis
	};
	return s && typeof m == "number" && (p = s === "end" ? m * -1 : m), c ? {
		x: p * u,
		y: f * l
	} : {
		x: f * l,
		y: p * u
	};
}
var Gi = function(e) {
	return e === void 0 && (e = 0), {
		name: "offset",
		options: e,
		async fn(t) {
			var n;
			let { x: r, y: i, placement: a, middlewareData: o } = t, s = await Wi(t, e);
			return a === o.offset?.placement && (n = o.arrow) != null && n.alignmentOffset ? {} : {
				x: r + s.x,
				y: i + s.y,
				data: {
					...s,
					placement: a
				}
			};
		}
	};
}, Ki = function(e) {
	return e === void 0 && (e = {}), {
		name: "shift",
		options: e,
		async fn(t) {
			let { x: n, y: r, placement: i, platform: a } = t, { mainAxis: o = !0, crossAxis: s = !1, limiter: c = { fn: (e) => {
				let { x: t, y: n } = e;
				return {
					x: t,
					y: n
				};
			} }, ...l } = mi(e, t), u = {
				x: n,
				y: r
			}, d = await a.detectOverflow(t, l), f = yi(i), p = _i(f), m = u[p], h = u[f], g = (e, t) => pi(t + d[e === "y" ? "top" : "left"], t, t - d[e === "y" ? "bottom" : "right"]);
			o && (m = g(p, m)), s && (h = g(f, h));
			let _ = c.fn({
				...t,
				[p]: m,
				[f]: h
			});
			return {
				..._,
				data: {
					x: _.x - n,
					y: _.y - r,
					enabled: {
						[p]: o,
						[f]: s
					}
				}
			};
		}
	};
}, qi = function(e) {
	return e === void 0 && (e = {}), {
		options: e,
		fn(t) {
			let { x: n, y: r, placement: i, rects: a, middlewareData: o } = t, { offset: s = 0, mainAxis: c = !0, crossAxis: l = !0 } = mi(e, t), u = {
				x: n,
				y: r
			}, d = yi(i), f = _i(d), p = u[f], m = u[d], h = mi(s, t), g = typeof h == "number" ? {
				mainAxis: h,
				crossAxis: 0
			} : {
				mainAxis: h.mainAxis ?? 0,
				crossAxis: h.crossAxis ?? 0
			};
			if (c) {
				let e = f === "y" ? "height" : "width", t = a.reference[f] - a.floating[e] + g.mainAxis, n = a.reference[f] + a.reference[e] - g.mainAxis;
				p < t ? p = t : p > n && (p = n);
			}
			if (l) {
				let e = f === "y" ? "width" : "height", t = Ui.has(hi(i)), n = a.reference[d] - a.floating[e] + (t && o.offset?.[d] || 0) + (t ? 0 : g.crossAxis), r = a.reference[d] + a.reference[e] + (t ? 0 : o.offset?.[d] || 0) - (t ? g.crossAxis : 0);
				m < n ? m = n : m > r && (m = r);
			}
			return {
				[f]: p,
				[d]: m
			};
		}
	};
}, Ji = function(e) {
	return e === void 0 && (e = {}), {
		name: "size",
		options: e,
		async fn(t) {
			let { placement: n, rects: r, platform: i, elements: a } = t, { apply: o = () => {}, ...s } = mi(e, t), c = await i.detectOverflow(t, s), l = hi(n), u = gi(n), d = yi(n) === "y", { width: f, height: p } = r.floating, m, h;
			l === "top" || l === "bottom" ? (m = l, h = u === (await (i.isRTL == null ? void 0 : i.isRTL(a.floating)) ? "start" : "end") ? "left" : "right") : (h = l, m = u === "end" ? "top" : "bottom");
			let g = p - c.top - c.bottom, _ = f - c.left - c.right, v = si(p - c[m], g), y = si(f - c[h], _), b = t.middlewareData.shift, x = !b, S = v, C = y;
			b != null && b.enabled.x && (C = _), b != null && b.enabled.y && (S = g), x && !u && (d ? C = f - 2 * ci(c.left, c.right) : S = p - 2 * ci(c.top, c.bottom)), await o({
				...t,
				availableWidth: C,
				availableHeight: S
			});
			let w = await i.getDimensions(a.floating);
			return f !== w.width || p !== w.height ? { reset: { rects: !0 } } : {};
		}
	};
};
//#endregion
//#region node_modules/.pnpm/@floating-ui+utils@0.2.12/node_modules/@floating-ui/utils/dist/floating-ui.utils.dom.mjs
function Yi() {
	return typeof window < "u";
}
function Xi(e) {
	return $i(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function Zi(e) {
	var t;
	return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function Qi(e) {
	return (($i(e) ? e.ownerDocument : e.document) || window.document)?.documentElement;
}
function $i(e) {
	return Yi() ? e instanceof Node || e instanceof Zi(e).Node : !1;
}
function ea(e) {
	return Yi() ? e instanceof Element || e instanceof Zi(e).Element : !1;
}
function ta(e) {
	return Yi() ? e instanceof HTMLElement || e instanceof Zi(e).HTMLElement : !1;
}
function na(e) {
	return !Yi() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof Zi(e).ShadowRoot;
}
function ra(e) {
	let { overflow: t, overflowX: n, overflowY: r, display: i } = ma(e);
	return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && i !== "inline" && i !== "contents";
}
function ia(e) {
	return /^(table|td|th)$/.test(Xi(e));
}
function aa(e) {
	try {
		if (e.matches(":popover-open")) return !0;
	} catch {}
	try {
		return e.matches(":modal");
	} catch {
		return !1;
	}
}
var oa = /transform|translate|scale|rotate|perspective|filter/, sa = /paint|layout|strict|content/, ca = (e) => !!e && e !== "none", la;
function ua(e) {
	let t = ea(e) ? ma(e) : e;
	return ca(t.transform) || ca(t.translate) || ca(t.scale) || ca(t.rotate) || ca(t.perspective) || !fa() && (ca(t.backdropFilter) || ca(t.filter)) || oa.test(t.willChange || "") || sa.test(t.contain || "");
}
function da(e) {
	let t = ga(e);
	for (; ta(t) && !pa(t);) {
		if (ua(t)) return t;
		if (aa(t)) return null;
		t = ga(t);
	}
	return null;
}
function fa() {
	return la ??= typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none"), la;
}
function pa(e) {
	return /^(html|body|#document)$/.test(Xi(e));
}
function ma(e) {
	return Zi(e).getComputedStyle(e);
}
function ha(e) {
	return ea(e) ? {
		scrollLeft: e.scrollLeft,
		scrollTop: e.scrollTop
	} : {
		scrollLeft: e.scrollX,
		scrollTop: e.scrollY
	};
}
function ga(e) {
	if (Xi(e) === "html") return e;
	let t = e.assignedSlot || e.parentNode || na(e) && e.host || Qi(e);
	return na(t) ? t.host : t;
}
function _a(e) {
	let t = ga(e);
	return pa(t) ? (e.ownerDocument || e).body : ta(t) && ra(t) ? t : _a(t);
}
function va(e, t, n) {
	t === void 0 && (t = []), n === void 0 && (n = !0);
	let r = _a(e), i = r === e.ownerDocument?.body, a = Zi(r);
	if (i) {
		let e = ya(a);
		return t.concat(a, a.visualViewport || [], ra(r) ? r : [], e && n ? va(e) : []);
	} else return t.concat(r, va(r, [], n));
}
function ya(e) {
	return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
//#endregion
//#region node_modules/.pnpm/@floating-ui+dom@1.8.0/node_modules/@floating-ui/dom/dist/floating-ui.dom.mjs
function ba(e) {
	let t = ma(e), n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0, i = ta(e), a = i ? e.offsetWidth : n, o = i ? e.offsetHeight : r, s = li(n) !== a || li(r) !== o;
	return s && (n = a, r = o), {
		width: n,
		height: r,
		$: s
	};
}
function xa(e) {
	return ea(e) ? e : e.contextElement;
}
function Sa(e) {
	let t = xa(e);
	if (!ta(t)) return di(1);
	let n = t.getBoundingClientRect(), { width: r, height: i, $: a } = ba(t), o = (a ? li(n.width) : n.width) / r, s = (a ? li(n.height) : n.height) / i;
	return (!o || !Number.isFinite(o)) && (o = 1), (!s || !Number.isFinite(s)) && (s = 1), {
		x: o,
		y: s
	};
}
var Ca = /*#__PURE__*/ di(0);
function wa(e) {
	let t = Zi(e);
	return !fa() || !t.visualViewport ? Ca : {
		x: t.visualViewport.offsetLeft,
		y: t.visualViewport.offsetTop
	};
}
function Ta(e, t, n) {
	return t === void 0 && (t = !1), !!n && t && n === Zi(e);
}
function Ea(e, t, n, r) {
	t === void 0 && (t = !1), n === void 0 && (n = !1);
	let i = e.getBoundingClientRect(), a = xa(e), o = di(1);
	t && (r ? ea(r) && (o = Sa(r)) : o = Sa(e));
	let s = Ta(a, n, r) ? wa(a) : di(0), c = (i.left + s.x) / o.x, l = (i.top + s.y) / o.y, u = i.width / o.x, d = i.height / o.y;
	if (a && r) {
		let e = Zi(a), t = ea(r) ? Zi(r) : r, n = e, i = ya(n);
		for (; i && t !== n;) {
			let e = Sa(i), t = i.getBoundingClientRect(), r = ma(i), a = t.left + (i.clientLeft + parseFloat(r.paddingLeft)) * e.x, o = t.top + (i.clientTop + parseFloat(r.paddingTop)) * e.y;
			c *= e.x, l *= e.y, u *= e.x, d *= e.y, c += a, l += o, n = Zi(i), i = ya(n);
		}
	}
	return Ni({
		width: u,
		height: d,
		x: c,
		y: l
	});
}
function Da(e, t) {
	let n = ha(e).scrollLeft;
	return t ? t.left + n : Ea(Qi(e)).left + n;
}
function Oa(e, t) {
	let n = e.getBoundingClientRect();
	return {
		x: n.left + t.scrollLeft - Da(e, n),
		y: n.top + t.scrollTop
	};
}
function ka(e) {
	let { elements: t, rect: n, offsetParent: r, strategy: i } = e, a = i === "fixed", o = Qi(r), s = t ? aa(t.floating) : !1;
	if (r === o || s && a) return n;
	let c = {
		scrollLeft: 0,
		scrollTop: 0
	}, l = di(1), u = di(0), d = ta(r);
	if ((d || !a) && ((Xi(r) !== "body" || ra(o)) && (c = ha(r)), d)) {
		let e = Ea(r);
		l = Sa(r), u.x = e.x + r.clientLeft, u.y = e.y + r.clientTop;
	}
	let f = o && !d && !a ? Oa(o, c) : di(0);
	return {
		width: n.width * l.x,
		height: n.height * l.y,
		x: n.x * l.x - c.scrollLeft * l.x + u.x + f.x,
		y: n.y * l.y - c.scrollTop * l.y + u.y + f.y
	};
}
function Aa(e) {
	return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function ja(e) {
	let t = ha(e), n = e.ownerDocument.body, r = ci(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), i = ci(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight), a = -t.scrollLeft + Da(e), o = -t.scrollTop;
	return ma(n).direction === "rtl" && (a += ci(e.clientWidth, n.clientWidth) - r), {
		width: r,
		height: i,
		x: a,
		y: o
	};
}
var Ma = 25;
function Na(e, t, n) {
	n === void 0 && (n = "viewport");
	let r = n === "layoutViewport", i = Zi(e), a = Qi(e), o = i.visualViewport, s = a.clientWidth, c = a.clientHeight, l = 0, u = 0;
	if (o) {
		let e = !fa() || t === "fixed";
		r ? e || (l = -o.offsetLeft, u = -o.offsetTop) : (s = o.width, c = o.height, e && (l = o.offsetLeft, u = o.offsetTop));
	}
	if (Da(a) <= 0) {
		let e = a.ownerDocument, t = e.body, n = getComputedStyle(t), r = e.compatMode === "CSS1Compat" && parseFloat(n.marginLeft) + parseFloat(n.marginRight) || 0, i = Math.abs(a.clientWidth - t.clientWidth - r), o = getComputedStyle(a).scrollbarGutter === "stable both-edges" ? i / 2 : i;
		o <= Ma && (s -= o);
	}
	return {
		width: s,
		height: c,
		x: l,
		y: u
	};
}
function Pa(e, t) {
	let n = Ea(e, !0, t === "fixed"), r = n.top + e.clientTop, i = n.left + e.clientLeft, a = Sa(e);
	return {
		width: e.clientWidth * a.x,
		height: e.clientHeight * a.y,
		x: i * a.x,
		y: r * a.y
	};
}
function Fa(e, t, n) {
	let r;
	if (t === "viewport" || t === "layoutViewport") r = Na(e, n, t);
	else if (t === "document") r = ja(Qi(e));
	else if (ea(t)) r = Pa(t, n);
	else {
		let n = wa(e);
		r = {
			x: t.x - n.x,
			y: t.y - n.y,
			width: t.width,
			height: t.height
		};
	}
	return Ni(r);
}
function Ia(e, t) {
	let n = t.get(e);
	if (n) return n;
	let r = va(e, [], !1).filter((e) => ea(e) && Xi(e) !== "body"), i = null, a = ma(e).position === "fixed", o = a ? ga(e) : e;
	for (; ea(o) && !pa(o);) {
		let e = ma(o), t = ua(o), n = i ? i.position : a ? "fixed" : "";
		!t && (n === "fixed" || n === "absolute" && e.position === "static") ? r = r.filter((e) => e !== o) : i = e, o = ga(o);
	}
	return t.set(e, r), r;
}
function La(e) {
	let { element: t, boundary: n, rootBoundary: r, strategy: i } = e, a = [...n === "clippingAncestors" ? aa(t) ? [] : Ia(t, this._c) : [].concat(n), r], o = Fa(t, a[0], i), s = o.top, c = o.right, l = o.bottom, u = o.left;
	for (let e = 1; e < a.length; e++) {
		let n = Fa(t, a[e], i);
		s = ci(n.top, s), c = si(n.right, c), l = si(n.bottom, l), u = ci(n.left, u);
	}
	return {
		width: c - u,
		height: l - s,
		x: u,
		y: s
	};
}
function Ra(e) {
	let { width: t, height: n } = ba(e);
	return {
		width: t,
		height: n
	};
}
function za(e, t, n) {
	let r = ta(t), i = Qi(t), a = n === "fixed", o = Ea(e, !0, a, t), s = {
		scrollLeft: 0,
		scrollTop: 0
	}, c = di(0);
	if ((r || !a) && ((Xi(t) !== "body" || ra(i)) && (s = ha(t)), r)) {
		let e = Ea(t, !0, a, t);
		c.x = e.x + t.clientLeft, c.y = e.y + t.clientTop;
	}
	!r && i && (c.x = Da(i));
	let l = i && !r && !a ? Oa(i, s) : di(0);
	return {
		x: o.left + s.scrollLeft - c.x - l.x,
		y: o.top + s.scrollTop - c.y - l.y,
		width: o.width,
		height: o.height
	};
}
function Ba(e) {
	return ma(e).position === "static";
}
function Va(e, t) {
	if (!ta(e) || ma(e).position === "fixed") return null;
	if (t) return t(e);
	let n = e.offsetParent;
	return Qi(e) === n && (n = n.ownerDocument.body), n;
}
function Ha(e, t) {
	let n = Zi(e);
	if (aa(e)) return n;
	if (!ta(e)) {
		let t = ga(e);
		for (; t && !pa(t);) {
			if (ea(t) && !Ba(t)) return t;
			t = ga(t);
		}
		return n;
	}
	let r = Va(e, t);
	for (; r && ia(r) && Ba(r);) r = Va(r, t);
	return r && pa(r) && Ba(r) && !ua(r) ? n : r || da(e) || n;
}
var Ua = async function(e) {
	let t = this.getOffsetParent || Ha, n = this.getDimensions, r = await n(e.floating);
	return {
		reference: za(e.reference, await t(e.floating), e.strategy),
		floating: {
			x: 0,
			y: 0,
			width: r.width,
			height: r.height
		}
	};
};
function Wa(e) {
	return ma(e).direction === "rtl";
}
var Ga = {
	convertOffsetParentRelativeRectToViewportRelativeRect: ka,
	getDocumentElement: Qi,
	getClippingRect: La,
	getOffsetParent: Ha,
	getElementRects: Ua,
	getClientRects: Aa,
	getDimensions: Ra,
	getScale: Sa,
	isElement: ea,
	isRTL: Wa
};
function Ka(e, t) {
	return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function qa(e, t, n) {
	let r = null, i, a = Qi(e);
	function o() {
		var e;
		clearTimeout(i), (e = r) == null || e.disconnect(), r = null;
	}
	function s(n, c) {
		n === void 0 && (n = !1), c === void 0 && (c = 1), o();
		let l = e.getBoundingClientRect(), { left: u, top: d, width: f, height: p } = l;
		if (n || t(), !f || !p) return;
		let m = ui(d), h = ui(a.clientWidth - (u + f)), g = ui(a.clientHeight - (d + p)), _ = ui(u), v = {
			rootMargin: -m + "px " + -h + "px " + -g + "px " + -_ + "px",
			threshold: ci(0, si(1, c)) || 1
		}, y = !0;
		function b(t) {
			let n = t[0].intersectionRatio;
			if (!Ka(l, e.getBoundingClientRect())) return s();
			if (n !== c) {
				if (!y) return s();
				n ? s(!1, n) : i = setTimeout(() => {
					s(!1, 1e-7);
				}, 1e3);
			}
			y = !1;
		}
		try {
			r = new IntersectionObserver(b, {
				...v,
				root: a.ownerDocument
			});
		} catch {
			r = new IntersectionObserver(b, v);
		}
		r.observe(e);
	}
	let c = Zi(e), l = () => s(n);
	return c.addEventListener("resize", l), s(!0), () => {
		c.removeEventListener("resize", l), o();
	};
}
function Ja(e, t, n, r) {
	r === void 0 && (r = {});
	let { ancestorScroll: i = !0, ancestorResize: a = !0, elementResize: o = typeof ResizeObserver == "function", layoutShift: s = typeof IntersectionObserver == "function", animationFrame: c = !1 } = r, l = xa(e), u = i || a ? [...l ? va(l) : [], ...t ? va(t) : []] : [];
	u.forEach((e) => {
		i && e.addEventListener("scroll", n), a && e.addEventListener("resize", n);
	});
	let d = l && s ? qa(l, n, a) : null, f = -1, p = null;
	o && (p = new ResizeObserver((e) => {
		let [r] = e;
		r && r.target === l && p && t && (p.unobserve(t), cancelAnimationFrame(f), f = requestAnimationFrame(() => {
			var e;
			(e = p) == null || e.observe(t);
		})), n();
	}), l && !c && p.observe(l), t && p.observe(t));
	let m, h = c ? Ea(e) : null;
	c && g();
	function g() {
		let t = Ea(e);
		h && !Ka(h, t) && n(), h = t, m = requestAnimationFrame(g);
	}
	return n(), () => {
		var e;
		u.forEach((e) => {
			i && e.removeEventListener("scroll", n), a && e.removeEventListener("resize", n);
		}), d?.(), (e = p) == null || e.disconnect(), p = null, c && cancelAnimationFrame(m);
	};
}
var Ya = Gi, Xa = Ki, Za = zi, Qa = Ji, $a = Hi, eo = Ri, to = qi, no = (e, t, n) => {
	let r = /* @__PURE__ */ new Map(), i = n ?? {}, a = {
		...Ga,
		...i.platform,
		_c: r
	};
	return Li(e, t, {
		...i,
		platform: a
	});
}, ro = typeof document < "u" ? i.useLayoutEffect : function() {};
function io(e, t) {
	if (e === t) return !0;
	if (typeof e != typeof t) return !1;
	if (typeof e == "function" && e.toString() === t.toString()) return !0;
	let n, r, i;
	if (e && t && typeof e == "object") {
		if (Array.isArray(e)) {
			if (n = e.length, n !== t.length) return !1;
			for (r = n; r-- !== 0;) if (!io(e[r], t[r])) return !1;
			return !0;
		}
		if (i = Object.keys(e), n = i.length, n !== Object.keys(t).length) return !1;
		for (r = n; r-- !== 0;) if (!{}.hasOwnProperty.call(t, i[r])) return !1;
		for (r = n; r-- !== 0;) {
			let n = i[r];
			if (!(n === "_owner" && e.$$typeof) && !io(e[n], t[n])) return !1;
		}
		return !0;
	}
	return e !== e && t !== t;
}
function ao(e) {
	return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function oo(e, t) {
	let n = ao(e);
	return Math.round(t * n) / n;
}
function so(e) {
	let t = i.useRef(e);
	return ro(() => {
		t.current = e;
	}), t;
}
function co(e) {
	e === void 0 && (e = {});
	let { placement: t = "bottom", strategy: n = "absolute", middleware: r = [], platform: a, elements: { reference: o, floating: s } = {}, transform: c = !0, whileElementsMounted: l, open: u } = e, [d, f] = i.useState({
		x: 0,
		y: 0,
		strategy: n,
		placement: t,
		middlewareData: {},
		isPositioned: !1
	}), [p, m] = i.useState(r);
	io(p, r) || m(r);
	let [h, g] = i.useState(null), [v, y] = i.useState(null), b = i.useCallback((e) => {
		e !== w.current && (w.current = e, g(e));
	}, []), x = i.useCallback((e) => {
		e !== T.current && (T.current = e, y(e));
	}, []), S = o || h, C = s || v, w = i.useRef(null), T = i.useRef(null), E = i.useRef(d), D = l != null, O = so(l), k = so(a), A = so(u), j = i.useCallback(() => {
		if (!w.current || !T.current) return;
		let e = {
			placement: t,
			strategy: n,
			middleware: p
		};
		k.current && (e.platform = k.current), no(w.current, T.current, e).then((e) => {
			let t = {
				...e,
				isPositioned: A.current !== !1
			};
			M.current && !io(E.current, t) && (E.current = t, _.flushSync(() => {
				f(t);
			}));
		});
	}, [
		p,
		t,
		n,
		k,
		A
	]);
	ro(() => {
		u === !1 && E.current.isPositioned && (E.current.isPositioned = !1, f((e) => ({
			...e,
			isPositioned: !1
		})));
	}, [u]);
	let M = i.useRef(!1);
	ro(() => (M.current = !0, () => {
		M.current = !1;
	}), []), ro(() => {
		if (S && (w.current = S), C && (T.current = C), S && C) {
			if (O.current) return O.current(S, C, j);
			j();
		}
	}, [
		S,
		C,
		j,
		O,
		D
	]);
	let ee = i.useMemo(() => ({
		reference: w,
		floating: T,
		setReference: b,
		setFloating: x
	}), [b, x]), N = i.useMemo(() => ({
		reference: S,
		floating: C
	}), [S, C]), te = i.useMemo(() => {
		let e = {
			position: n,
			left: 0,
			top: 0
		};
		if (!N.floating) return e;
		let t = oo(N.floating, d.x), r = oo(N.floating, d.y);
		return c ? {
			...e,
			transform: "translate(" + t + "px, " + r + "px)",
			...ao(N.floating) >= 1.5 && { willChange: "transform" }
		} : {
			position: n,
			left: t,
			top: r
		};
	}, [
		n,
		c,
		N.floating,
		d.x,
		d.y
	]);
	return i.useMemo(() => ({
		...d,
		update: j,
		refs: ee,
		elements: N,
		floatingStyles: te
	}), [
		d,
		j,
		ee,
		N,
		te
	]);
}
var lo = (e) => {
	function t(e) {
		return {}.hasOwnProperty.call(e, "current");
	}
	return {
		name: "arrow",
		options: e,
		fn(n) {
			let { element: r, padding: i } = typeof e == "function" ? e(n) : e;
			return r && t(r) ? r.current == null ? {} : eo({
				element: r.current,
				padding: i
			}).fn(n) : r ? eo({
				element: r,
				padding: i
			}).fn(n) : {};
		}
	};
}, uo = (e, t) => {
	let n = Ya(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, fo = (e, t) => {
	let n = Xa(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, po = (e, t) => ({
	fn: to(e).fn,
	options: [e, t]
}), mo = (e, t) => {
	let n = Za(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, ho = (e, t) => {
	let n = Qa(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, go = (e, t) => {
	let n = $a(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, _o = (e, t) => {
	let n = lo(e);
	return {
		name: n.name,
		fn: n.fn,
		options: [e, t]
	};
}, vo = Object.defineProperty, yo = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ ((e, t) => vo(e, "name", {
	value: t,
	configurable: !0
}))(function(e, t) {
	let { children: n, width: r = 10, height: i = 5, ...a } = e;
	return /* @__PURE__ */ (0, v.jsx)(F.svg, {
		...a,
		ref: t,
		width: r,
		height: i,
		viewBox: "0 0 30 10",
		preserveAspectRatio: "none",
		children: e.asChild ? n : /* @__PURE__ */ (0, v.jsx)("polygon", { points: "0,0 30,0 15,10" })
	});
}, "Arrow")), bo = Object.defineProperty, xo = (e, t) => bo(e, "name", {
	value: t,
	configurable: !0
}), So = "Popper", [Co, wo] = /* @__PURE__ */ ue(So), [To, Eo] = Co(So), Do = /* @__PURE__ */ xo((e) => {
	let { __scopePopper: t, children: n } = e, [r, a] = i.useState(null), [o, s] = i.useState(void 0);
	return /* @__PURE__ */ (0, v.jsx)(To, {
		scope: t,
		anchor: r,
		onAnchorChange: a,
		placementState: o,
		setPlacementState: s,
		children: n
	});
}, "Popper"), Oo = "PopperAnchor", ko = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ xo(function(e, t) {
	let { __scopePopper: n, virtualRef: r, ...a } = e, o = Eo(Oo, n), s = i.useRef(null), c = o.onAnchorChange, l = h(t, i.useCallback((e) => {
		s.current = e, e && c(e);
	}, [c])), u = i.useRef(null);
	i.useEffect(() => {
		if (!r) return;
		let e = u.current;
		u.current = r.current, e !== u.current && c(u.current);
	});
	let d = o.placementState && zo(o.placementState), f = d?.[0], p = d?.[1];
	return r ? null : /* @__PURE__ */ (0, v.jsx)(F.div, {
		"data-radix-popper-side": f,
		"data-radix-popper-align": p,
		...a,
		ref: l
	});
}, "PopperAnchor")), Ao = "PopperContent", [jo, Mo] = Co(Ao), No = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ xo(function(e, t) {
	let { __scopePopper: n, side: r = "bottom", sideOffset: a = 0, align: o = "center", alignOffset: s = 0, arrowPadding: c = 0, avoidCollisions: l = !0, collisionBoundary: u = [], collisionPadding: d = 0, sticky: f = "partial", hideWhenDetached: p = !1, updatePositionStrategy: m = "optimized", onPlaced: g, ..._ } = e, y = Eo(Ao, n), [b, x] = i.useState(null), S = h(t, x), [C, w] = i.useState(null), T = ai(C), E = T?.width ?? 0, D = T?.height ?? 0, O = r + (o === "center" ? "" : "-" + o), k = typeof d == "number" ? d : {
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		...d
	}, A = Array.isArray(u) ? u : [u], j = A.length > 0, M = {
		padding: k,
		boundary: A.filter(Lo),
		altBoundary: j
	}, { refs: ee, floatingStyles: N, placement: te, isPositioned: P, middlewareData: ne } = co({
		strategy: "fixed",
		placement: O,
		whileElementsMounted: /* @__PURE__ */ xo((...e) => Ja(...e, { animationFrame: m === "always" }), "whileElementsMounted"),
		elements: { reference: y.anchor },
		middleware: [
			uo({
				mainAxis: a + D,
				alignmentAxis: s
			}),
			l && fo({
				mainAxis: !0,
				crossAxis: !1,
				limiter: f === "partial" ? po() : void 0,
				...M
			}),
			l && mo({ ...M }),
			ho({
				...M,
				apply: /* @__PURE__ */ xo(({ elements: e, rects: t, availableWidth: n, availableHeight: r }) => {
					let { width: i, height: a } = t.reference, o = e.floating.style;
					o.setProperty("--radix-popper-available-width", `${n}px`), o.setProperty("--radix-popper-available-height", `${r}px`), o.setProperty("--radix-popper-anchor-width", `${i}px`), o.setProperty("--radix-popper-anchor-height", `${a}px`);
				}, "apply")
			}),
			C && _o({
				element: C,
				padding: c
			}),
			Ro({
				arrowWidth: E,
				arrowHeight: D
			}),
			p && go({
				strategy: "referenceHidden",
				...M,
				boundary: j ? M.boundary : void 0
			})
		]
	}), re = y.setPlacementState;
	V(() => (re(te), () => {
		re(void 0);
	}), [te, re]);
	let [I, ie] = zo(te), ae = at(g);
	V(() => {
		P && ae?.();
	}, [P, ae]);
	let oe = ne.arrow?.x, se = ne.arrow?.y, L = ne.arrow?.centerOffset !== 0, [ce, le] = i.useState();
	return V(() => {
		b && le(window.getComputedStyle(b).zIndex);
	}, [b]), /* @__PURE__ */ (0, v.jsx)("div", {
		ref: ee.setFloating,
		"data-radix-popper-content-wrapper": "",
		style: {
			...N,
			transform: P ? N.transform : "translate(0, -200%)",
			minWidth: "max-content",
			zIndex: ce,
			"--radix-popper-transform-origin": [ne.transformOrigin?.x, ne.transformOrigin?.y].join(" "),
			...ne.hide?.referenceHidden && {
				visibility: "hidden",
				pointerEvents: "none"
			}
		},
		dir: e.dir,
		children: /* @__PURE__ */ (0, v.jsx)(jo, {
			scope: n,
			placedSide: I,
			placedAlign: ie,
			onArrowChange: w,
			arrowX: oe,
			arrowY: se,
			shouldHideArrow: L,
			children: /* @__PURE__ */ (0, v.jsx)(F.div, {
				"data-side": I,
				"data-align": ie,
				..._,
				ref: S,
				style: {
					..._.style,
					animation: P ? _.style?.animation : "none"
				}
			})
		})
	});
}, "PopperContent")), Po = "PopperArrow", Fo = {
	top: "bottom",
	right: "left",
	bottom: "top",
	left: "right"
}, Io = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ xo(function(e, t) {
	let { __scopePopper: n, ...r } = e, i = Mo(Po, n), a = Fo[i.placedSide];
	return /* @__PURE__ */ (0, v.jsx)("span", {
		ref: i.onArrowChange,
		style: {
			position: "absolute",
			left: i.arrowX,
			top: i.arrowY,
			[a]: 0,
			transformOrigin: {
				top: "",
				right: "0 0",
				bottom: "center 0",
				left: "100% 0"
			}[i.placedSide],
			transform: {
				top: "translateY(100%)",
				right: "translateY(50%) rotate(90deg) translateX(-50%)",
				bottom: "rotate(180deg)",
				left: "translateY(50%) rotate(-90deg) translateX(50%)"
			}[i.placedSide],
			visibility: i.shouldHideArrow ? "hidden" : void 0
		},
		children: /* @__PURE__ */ (0, v.jsx)(yo, {
			...r,
			ref: t,
			style: {
				...r.style,
				display: "block"
			}
		})
	});
}, "PopperArrow"));
function Lo(e) {
	return e !== null;
}
xo(Lo, "isNotNull");
var Ro = /* @__PURE__ */ xo((e) => ({
	name: "transformOrigin",
	options: e,
	fn(t) {
		let { placement: n, rects: r, middlewareData: i } = t, a = i.arrow?.centerOffset !== 0, o = a ? 0 : e.arrowWidth, s = a ? 0 : e.arrowHeight, [c, l] = zo(n), u = {
			start: "0%",
			center: "50%",
			end: "100%"
		}[l], d = (i.arrow?.x ?? 0) + o / 2, f = (i.arrow?.y ?? 0) + s / 2, p = "", m = "";
		return c === "bottom" ? (p = a ? u : `${d}px`, m = `${-s}px`) : c === "top" ? (p = a ? u : `${d}px`, m = `${r.floating.height + s}px`) : c === "right" ? (p = `${-s}px`, m = a ? u : `${f}px`) : c === "left" && (p = `${r.floating.width + s}px`, m = a ? u : `${f}px`), { data: {
			x: p,
			y: m
		} };
	}
}), "transformOrigin");
function zo(e) {
	let [t, n = "center"] = e.split("-");
	return [t, n];
}
xo(zo, "getSideAndAlignFromPlacement");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-use-is-hydrated@0.1.2_@types+react@19.2.17_react@19.2.8/node_modules/@radix-ui/react-use-is-hydrated/dist/index.mjs
var Bo = Object.defineProperty, Vo = (e, t) => Bo(e, "name", {
	value: t,
	configurable: !0
}), Ho = !1;
function Uo() {
	let [e, t] = i.useState(Ho);
	return i.useEffect(() => {
		Ho || (Ho = !0, t(!0));
	}, []), e;
}
Vo(Uo, "useIsHydrated");
var Wo = i.useSyncExternalStore;
function Go() {
	return () => {};
}
Vo(Go, "subscribe");
function Ko() {
	return Wo(Go, () => !0, () => !1);
}
Vo(Ko, "useIsHydratedModern");
var qo = typeof Wo == "function" ? Ko : Uo, Jo = Object.defineProperty, Yo = (e, t) => Jo(e, "name", {
	value: t,
	configurable: !0
}), Xo = "rovingFocusGroup.onEntryFocus", Zo = {
	bubbles: !1,
	cancelable: !0
}, Qo = "RovingFocusGroup", [$o, es, ts] = /* @__PURE__ */ fe(Qo), [ns, rs] = /* @__PURE__ */ ue(Qo, [ts]), [is, as] = ns(Qo), os = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ Yo(function(e, t) {
	return /* @__PURE__ */ (0, v.jsx)($o.Provider, {
		scope: e.__scopeRovingFocusGroup,
		children: /* @__PURE__ */ (0, v.jsx)($o.Slot, {
			scope: e.__scopeRovingFocusGroup,
			children: /* @__PURE__ */ (0, v.jsx)(ss, {
				...e,
				ref: t
			})
		})
	});
}, "RovingFocusGroup")), ss = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ Yo(function(e, t) {
	let { __scopeRovingFocusGroup: n, orientation: r, loop: a = !1, dir: o, currentTabStopId: s, defaultCurrentTabStopId: c, onCurrentTabStopIdChange: l, onEntryFocus: u, preventScrollOnEntryFocus: d = !1, ...f } = e, p = i.useRef(null), m = h(t, p), g = nt(o), [_, y] = Re({
		prop: s,
		defaultProp: c ?? null,
		onChange: l,
		caller: Qo
	}), [b, x] = i.useState(!1), S = at(u), C = es(n), w = i.useRef(!1), [T, E] = i.useState(0);
	return i.useEffect(() => {
		let e = p.current;
		if (e) return e.addEventListener(Xo, S), () => e.removeEventListener(Xo, S);
	}, [S]), /* @__PURE__ */ (0, v.jsx)(is, {
		scope: n,
		orientation: r,
		dir: g,
		loop: a,
		currentTabStopId: _,
		onItemFocus: i.useCallback((e) => y(e), [y]),
		onItemShiftTab: i.useCallback(() => x(!0), []),
		onFocusableItemAdd: i.useCallback(() => E((e) => e + 1), []),
		onFocusableItemRemove: i.useCallback(() => E((e) => e - 1), []),
		children: /* @__PURE__ */ (0, v.jsx)(F.div, {
			tabIndex: b || T === 0 ? -1 : 0,
			"data-orientation": r,
			...f,
			ref: m,
			style: {
				outline: "none",
				...e.style
			},
			onMouseDown: B(e.onMouseDown, () => {
				w.current = !0;
			}),
			onFocus: B(e.onFocus, (e) => {
				let t = !w.current;
				if (e.target === e.currentTarget && t && !b) {
					let t = new CustomEvent(Xo, Zo);
					if (e.currentTarget.dispatchEvent(t), !t.defaultPrevented) {
						let e = C().filter((e) => e.focusable);
						ps([
							e.find((e) => e.active),
							e.find((e) => e.id === _),
							...e
						].filter(Boolean).map((e) => e.ref.current), d);
					}
				}
				w.current = !1;
			}),
			onBlur: B(e.onBlur, () => x(!1))
		})
	});
}, "RovingFocusGroupImpl")), cs = "RovingFocusGroupItem", ls = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ Yo(function(e, t) {
	let { __scopeRovingFocusGroup: n, focusable: r = !0, active: a = !1, tabStopId: o, children: s, ...c } = e, l = $e(), u = o || l, d = as(cs, n), f = d.currentTabStopId === u, p = es(n), { onFocusableItemAdd: m, onFocusableItemRemove: h, currentTabStopId: g } = d, _ = qo();
	return V(() => {
		if (!(!_ || !r)) return m(), () => h();
	}, [
		_,
		r,
		m,
		h
	]), i.useEffect(() => {
		if (!(_ || !r)) return m(), () => h();
	}, [
		_,
		r,
		m,
		h
	]), /* @__PURE__ */ (0, v.jsx)($o.ItemSlot, {
		scope: n,
		id: u,
		focusable: r,
		active: a,
		children: /* @__PURE__ */ (0, v.jsx)(F.span, {
			tabIndex: f ? 0 : -1,
			"data-orientation": d.orientation,
			...c,
			ref: t,
			onMouseDown: B(e.onMouseDown, (e) => {
				r ? d.onItemFocus(u) : e.preventDefault();
			}),
			onFocus: B(e.onFocus, () => d.onItemFocus(u)),
			onKeyDown: B(e.onKeyDown, (e) => {
				if (e.key === "Tab" && e.shiftKey) {
					d.onItemShiftTab();
					return;
				}
				if (e.target !== e.currentTarget) return;
				let t = fs(e, d.orientation, d.dir);
				if (t !== void 0) {
					if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
					e.preventDefault();
					let n = p().filter((e) => e.focusable).map((e) => e.ref.current);
					if (t === "last") n.reverse();
					else if (t === "prev" || t === "next") {
						t === "prev" && n.reverse();
						let r = n.indexOf(e.currentTarget);
						n = d.loop ? ms(n, r + 1) : n.slice(r + 1);
					}
					setTimeout(() => ps(n));
				}
			}),
			children: typeof s == "function" ? s({
				isCurrentTabStop: f,
				hasTabStop: g != null
			}) : s
		})
	});
}, "RovingFocusGroupItem")), us = {
	ArrowLeft: "prev",
	ArrowUp: "prev",
	ArrowRight: "next",
	ArrowDown: "next",
	PageUp: "first",
	Home: "first",
	PageDown: "last",
	End: "last"
};
function ds(e, t) {
	return t === "rtl" ? e === "ArrowLeft" ? "ArrowRight" : e === "ArrowRight" ? "ArrowLeft" : e : e;
}
Yo(ds, "getDirectionAwareKey");
function fs(e, t, n) {
	let r = ds(e.key, n);
	if (!(t === "vertical" && ["ArrowLeft", "ArrowRight"].includes(r)) && !(t === "horizontal" && ["ArrowUp", "ArrowDown"].includes(r))) return us[r];
}
Yo(fs, "getFocusIntent");
function ps(e, t = !1) {
	let n = document.activeElement;
	for (let r of e) if (r === n || (r.focus({ preventScroll: t }), document.activeElement !== n)) return;
}
Yo(ps, "focusFirst");
function ms(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
Yo(ms, "wrapArray");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-menu@2.1.22_@types+react-dom@19.2.3_@types+react@19.2.17__@types+react@_dbe44cd30a3ccab7b832a5aca4038762/node_modules/@radix-ui/react-menu/dist/index.mjs
var hs = Object.defineProperty, K = (e, t) => hs(e, "name", {
	value: t,
	configurable: !0
}), gs = ["Enter", " "], _s = [
	"ArrowDown",
	"PageUp",
	"Home"
], vs = [
	"ArrowUp",
	"PageDown",
	"End"
], ys = [..._s, ...vs];
[...gs], [...gs];
var bs = "Menu", [xs, Ss, Cs] = /* @__PURE__ */ fe(bs), [ws, Ts] = /* @__PURE__ */ ue(bs, [
	Cs,
	wo,
	rs
]), Es = wo(), Ds = rs(), [Os, ks] = ws(bs), [As, js] = ws(bs), Ms = /* @__PURE__ */ K((e) => {
	let { __scopeMenu: t, open: n = !1, children: r, dir: a, onOpenChange: o, modal: s = !0 } = e, c = Es(t), [l, u] = i.useState(null), d = i.useRef(!1), f = at(o), p = nt(a);
	return i.useEffect(() => {
		let e = /* @__PURE__ */ K(() => {
			d.current = !0, document.addEventListener("pointerdown", t, {
				capture: !0,
				once: !0
			}), document.addEventListener("pointermove", t, {
				capture: !0,
				once: !0
			});
		}, "handleKeyDown"), t = /* @__PURE__ */ K(() => d.current = !1, "handlePointer");
		return document.addEventListener("keydown", e, { capture: !0 }), () => {
			document.removeEventListener("keydown", e, { capture: !0 }), document.removeEventListener("pointerdown", t, { capture: !0 }), document.removeEventListener("pointermove", t, { capture: !0 });
		};
	}, []), i.useEffect(() => {
		if (!n) return;
		let e = /* @__PURE__ */ K(() => f(!1), "handleBlur");
		return window.addEventListener("blur", e), () => window.removeEventListener("blur", e);
	}, [n, f]), /* @__PURE__ */ (0, v.jsx)(Do, {
		...c,
		children: /* @__PURE__ */ (0, v.jsx)(Os, {
			scope: t,
			open: n,
			onOpenChange: f,
			content: l,
			onContentChange: u,
			children: /* @__PURE__ */ (0, v.jsx)(As, {
				scope: t,
				onClose: i.useCallback(() => f(!1), [f]),
				isUsingKeyboardRef: d,
				dir: p,
				modal: s,
				children: r
			})
		})
	});
}, "Menu"), Ns = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ K(function(e, t) {
	let { __scopeMenu: n, ...r } = e, i = Es(n);
	return /* @__PURE__ */ (0, v.jsx)(ko, {
		...i,
		...r,
		ref: t
	});
}, "MenuAnchor")), Ps = "MenuPortal", [Fs, Is] = ws(Ps, { forceMount: void 0 }), Ls = /* @__PURE__ */ K((e) => {
	let { __scopeMenu: t, forceMount: n, children: r, container: i } = e, a = ks(Ps, t);
	return /* @__PURE__ */ (0, v.jsx)(Fs, {
		scope: t,
		forceMount: n,
		children: /* @__PURE__ */ (0, v.jsx)(H, {
			present: n || a.open,
			children: /* @__PURE__ */ (0, v.jsx)(zt, {
				asChild: !0,
				container: i,
				children: r
			})
		})
	});
}, "MenuPortal"), Rs = "MenuContent", [zs, Bs] = ws(Rs), Vs = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ K(function(e, t) {
	let n = Is(Rs, e.__scopeMenu), { forceMount: r = n.forceMount, ...i } = e, a = ks(Rs, e.__scopeMenu), o = js(Rs, e.__scopeMenu);
	return /* @__PURE__ */ (0, v.jsx)(xs.Provider, {
		scope: e.__scopeMenu,
		children: /* @__PURE__ */ (0, v.jsx)(H, {
			present: r || a.open,
			children: /* @__PURE__ */ (0, v.jsx)(xs.Slot, {
				scope: e.__scopeMenu,
				children: o.modal ? /* @__PURE__ */ (0, v.jsx)(Hs, {
					...i,
					ref: t
				}) : /* @__PURE__ */ (0, v.jsx)(Us, {
					...i,
					ref: t
				})
			})
		})
	});
}, "MenuContent")), Hs = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ K(function(e, t) {
	let n = ks(Rs, e.__scopeMenu), r = i.useRef(null), a = h(t, r);
	return i.useEffect(() => {
		let e = r.current;
		if (e) return dr(e);
	}, []), /* @__PURE__ */ (0, v.jsx)(Gs, {
		...e,
		ref: a,
		trapFocus: n.open,
		disableOutsidePointerEvents: n.open,
		disableOutsideScroll: !0,
		onFocusOutside: B(e.onFocusOutside, (e) => e.preventDefault(), { checkForDefaultPrevented: !1 }),
		onDismiss: () => n.onOpenChange(!1)
	});
}, "MenuRootContentModal")), Us = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ K(function(e, t) {
	let n = ks(Rs, e.__scopeMenu);
	return /* @__PURE__ */ (0, v.jsx)(Gs, {
		...e,
		ref: t,
		trapFocus: !1,
		disableOutsidePointerEvents: !1,
		disableOutsideScroll: !1,
		onDismiss: () => n.onOpenChange(!1)
	});
}, "MenuRootContentNonModal")), Ws = /* @__PURE__ */ w("MenuContent.ScrollLock"), Gs = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ K(function(e, t) {
	let { __scopeMenu: n, loop: r = !1, trapFocus: a, onOpenAutoFocus: o, onCloseAutoFocus: s, disableOutsidePointerEvents: c, onEntryFocus: l, onEscapeKeyDown: u, onPointerDownOutside: d, onFocusOutside: f, onInteractOutside: p, onDismiss: m, disableOutsideScroll: g, ..._ } = e, y = ks(Rs, n), b = js(Rs, n), x = Es(n), S = Ds(n), C = Ss(n), [w, T] = i.useState(null), E = i.useRef(null), D = h(t, E, y.onContentChange), O = i.useRef(0), k = i.useRef(""), A = i.useRef(0), j = i.useRef(null), M = i.useRef("right"), ee = i.useRef(0), N = g ? nr : i.Fragment, te = g ? {
		as: Ws,
		allowPinchZoom: !0
	} : void 0, P = /* @__PURE__ */ K((e) => {
		let t = k.current + e, n = C().filter((e) => !e.disabled), r = document.activeElement, i = n.find((e) => e.ref.current === r)?.textValue, a = gc(n.map((e) => e.textValue), t, i), o = n.find((e) => e.textValue === a)?.ref.current;
		(/* @__PURE__ */ K((function e(t) {
			k.current = t, window.clearTimeout(O.current), t !== "" && (O.current = window.setTimeout(() => e(""), 1e3));
		}), "updateSearch"))(t), o && setTimeout(() => o.focus());
	}, "handleTypeaheadSearch");
	i.useEffect(() => () => window.clearTimeout(O.current), []), Gt();
	let ne = i.useCallback((e) => M.current === j.current?.side && vc(e, j.current?.area), []);
	return /* @__PURE__ */ (0, v.jsx)(zs, {
		scope: n,
		searchRef: k,
		onItemEnter: i.useCallback((e) => {
			ne(e) && e.preventDefault();
		}, [ne]),
		onItemLeave: i.useCallback((e) => {
			ne(e) || (E.current?.focus(), T(null));
		}, [ne]),
		onTriggerLeave: i.useCallback((e) => {
			ne(e) && e.preventDefault();
		}, [ne]),
		pointerGraceTimerRef: A,
		onPointerGraceIntentChange: i.useCallback((e) => {
			j.current = e;
		}, []),
		children: /* @__PURE__ */ (0, v.jsx)(N, {
			...te,
			children: /* @__PURE__ */ (0, v.jsx)(Et, {
				asChild: !0,
				trapped: a,
				onMountAutoFocus: B(o, (e) => {
					e.preventDefault(), E.current?.focus({ preventScroll: !0 });
				}),
				onUnmountAutoFocus: s,
				children: /* @__PURE__ */ (0, v.jsx)(pt, {
					asChild: !0,
					disableOutsidePointerEvents: c,
					onEscapeKeyDown: u,
					onPointerDownOutside: d,
					onFocusOutside: f,
					onInteractOutside: p,
					onDismiss: m,
					children: /* @__PURE__ */ (0, v.jsx)(os, {
						asChild: !0,
						...S,
						dir: b.dir,
						orientation: "vertical",
						loop: r,
						currentTabStopId: w,
						onCurrentTabStopIdChange: T,
						onEntryFocus: B(l, (e) => {
							b.isUsingKeyboardRef.current || e.preventDefault();
						}),
						preventScrollOnEntryFocus: !0,
						children: /* @__PURE__ */ (0, v.jsx)(No, {
							role: "menu",
							"aria-orientation": "vertical",
							"data-state": dc(y.open),
							"data-radix-menu-content": "",
							dir: b.dir,
							...x,
							..._,
							ref: D,
							style: {
								outline: "none",
								..._.style
							},
							onKeyDown: B(_.onKeyDown, (e) => {
								let t = e.target.closest("[data-radix-menu-content]") === e.currentTarget, n = e.ctrlKey || e.altKey || e.metaKey, r = e.key.length === 1;
								t && (e.key === "Tab" && e.preventDefault(), !n && r && P(e.key));
								let i = E.current;
								if (e.target !== i || !ys.includes(e.key)) return;
								e.preventDefault();
								let a = C().filter((e) => !e.disabled).map((e) => e.ref.current);
								vs.includes(e.key) && a.reverse(), mc(a);
							}),
							onBlur: B(e.onBlur, (e) => {
								e.currentTarget.contains(e.target) || (window.clearTimeout(O.current), k.current = "");
							}),
							onPointerMove: B(e.onPointerMove, yc((e) => {
								let t = e.target, n = ee.current !== e.clientX;
								if (e.currentTarget.contains(t) && n) {
									let t = e.clientX > ee.current ? "right" : "left";
									M.current = t, ee.current = e.clientX;
								}
							}))
						})
					})
				})
			})
		})
	});
}, "MenuContentImpl")), Ks = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ K(function(e, t) {
	let { __scopeMenu: n, ...r } = e;
	return /* @__PURE__ */ (0, v.jsx)(F.div, {
		role: "group",
		...r,
		ref: t
	});
}, "MenuGroup")), qs = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ K(function(e, t) {
	let { __scopeMenu: n, ...r } = e;
	return /* @__PURE__ */ (0, v.jsx)(F.div, {
		...r,
		ref: t
	});
}, "MenuLabel")), Js = "MenuItem", Ys = "menu.itemSelect", Xs = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ K(function(e, t) {
	let { disabled: n = !1, onSelect: r, ...a } = e, o = i.useRef(null), s = js(Js, e.__scopeMenu), c = Bs(Js, e.__scopeMenu), l = h(t, o), u = i.useRef(!1), d = /* @__PURE__ */ K(() => {
		let e = o.current;
		if (!n && e) {
			let t = new CustomEvent(Ys, {
				bubbles: !0,
				cancelable: !0
			});
			e.addEventListener(Ys, (e) => r?.(e), { once: !0 }), I(e, t), t.defaultPrevented ? u.current = !1 : s.onClose();
		}
	}, "handleSelect");
	return /* @__PURE__ */ (0, v.jsx)(Zs, {
		...a,
		ref: l,
		disabled: n,
		onClick: B(e.onClick, d),
		onPointerDown: (t) => {
			e.onPointerDown?.(t), u.current = !0;
		},
		onPointerUp: B(e.onPointerUp, (e) => {
			u.current || e.currentTarget?.click();
		}),
		onKeyDown: B(e.onKeyDown, (e) => {
			n || e.target !== e.currentTarget || c.searchRef.current !== "" && e.key === " " || gs.includes(e.key) && (e.currentTarget.click(), e.preventDefault());
		})
	});
}, "MenuItem")), Zs = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ K(function(e, t) {
	let { __scopeMenu: n, disabled: r = !1, textValue: a, ...o } = e, s = Bs(Js, n), c = Ds(n), l = i.useRef(null), u = h(t, l), [d, f] = i.useState(!1), [p, m] = i.useState("");
	return i.useEffect(() => {
		let e = l.current;
		e && m((e.textContent ?? "").trim());
	}, [o.children]), /* @__PURE__ */ (0, v.jsx)(xs.ItemSlot, {
		scope: n,
		disabled: r,
		textValue: a ?? p,
		children: /* @__PURE__ */ (0, v.jsx)(ls, {
			asChild: !0,
			...c,
			focusable: !r,
			children: /* @__PURE__ */ (0, v.jsx)(F.div, {
				role: "menuitem",
				"data-highlighted": d ? "" : void 0,
				"aria-disabled": r || void 0,
				"data-disabled": r ? "" : void 0,
				...o,
				ref: u,
				onPointerMove: B(e.onPointerMove, yc((e) => {
					r ? s.onItemLeave(e) : (s.onItemEnter(e), e.defaultPrevented || e.currentTarget.focus({ preventScroll: !0 }));
				})),
				onPointerLeave: B(e.onPointerLeave, yc((e) => s.onItemLeave(e))),
				onFocus: B(e.onFocus, () => f(!0)),
				onBlur: B(e.onBlur, () => f(!1))
			})
		})
	});
}, "MenuItemImpl")), Qs = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ K(function(e, t) {
	let { checked: n = !1, onCheckedChange: r, ...i } = e;
	return /* @__PURE__ */ (0, v.jsx)(ac, {
		scope: e.__scopeMenu,
		checked: n,
		children: /* @__PURE__ */ (0, v.jsx)(Xs, {
			role: "menuitemcheckbox",
			"aria-checked": fc(n) ? "mixed" : n,
			...i,
			ref: t,
			"data-state": pc(n),
			onSelect: B(i.onSelect, () => r?.(fc(n) ? !0 : !n), { checkForDefaultPrevented: !1 })
		})
	});
}, "MenuCheckboxItem")), [$s, ec] = ws("MenuRadioGroup", {
	value: void 0,
	onValueChange: /* @__PURE__ */ K(() => {}, "onValueChange")
}), tc = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ K(function(e, t) {
	let { value: n, onValueChange: r, ...i } = e, a = at(r);
	return /* @__PURE__ */ (0, v.jsx)($s, {
		scope: e.__scopeMenu,
		value: n,
		onValueChange: a,
		children: /* @__PURE__ */ (0, v.jsx)(Ks, {
			...i,
			ref: t
		})
	});
}, "MenuRadioGroup")), nc = "MenuRadioItem", rc = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ K(function(e, t) {
	let { value: n, ...r } = e, i = ec(nc, e.__scopeMenu), a = n === i.value;
	return /* @__PURE__ */ (0, v.jsx)(ac, {
		scope: e.__scopeMenu,
		checked: a,
		children: /* @__PURE__ */ (0, v.jsx)(Xs, {
			role: "menuitemradio",
			"aria-checked": a,
			...r,
			ref: t,
			"data-state": pc(a),
			onSelect: B(r.onSelect, () => i.onValueChange?.(n), { checkForDefaultPrevented: !1 })
		})
	});
}, "MenuRadioItem")), ic = "MenuItemIndicator", [ac, oc] = ws(ic, { checked: !1 }), sc = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ K(function(e, t) {
	let { __scopeMenu: n, forceMount: r, ...i } = e, a = oc(ic, n);
	return /* @__PURE__ */ (0, v.jsx)(H, {
		present: r || fc(a.checked) || a.checked === !0,
		children: /* @__PURE__ */ (0, v.jsx)(F.span, {
			...i,
			ref: t,
			"data-state": pc(a.checked)
		})
	});
}, "MenuItemIndicator")), cc = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ K(function(e, t) {
	let { __scopeMenu: n, ...r } = e;
	return /* @__PURE__ */ (0, v.jsx)(F.div, {
		role: "separator",
		"aria-orientation": "horizontal",
		...r,
		ref: t
	});
}, "MenuSeparator")), [lc, uc] = ws("MenuSub");
function dc(e) {
	return e ? "open" : "closed";
}
K(dc, "getOpenState");
function fc(e) {
	return e === "indeterminate";
}
K(fc, "isIndeterminate");
function pc(e) {
	return fc(e) ? "indeterminate" : e ? "checked" : "unchecked";
}
K(pc, "getCheckedState");
function mc(e) {
	let t = document.activeElement;
	for (let n of e) if (n === t || (n.focus(), document.activeElement !== t)) return;
}
K(mc, "focusFirst");
function hc(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
K(hc, "wrapArray");
function gc(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = hc(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
K(gc, "getNextMatch");
function _c(e, t) {
	let { x: n, y: r } = e, i = !1;
	for (let e = 0, a = t.length - 1; e < t.length; a = e++) {
		let o = t[e], s = t[a], c = o.x, l = o.y, u = s.x, d = s.y;
		l > r != d > r && n < (u - c) * (r - l) / (d - l) + c && (i = !i);
	}
	return i;
}
K(_c, "isPointInPolygon");
function vc(e, t) {
	return t ? _c({
		x: e.clientX,
		y: e.clientY
	}, t) : !1;
}
K(vc, "isPointerInGraceArea");
function yc(e) {
	return (t) => t.pointerType === "mouse" ? e(t) : void 0;
}
K(yc, "whenMouse");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-dropdown-menu@2.1.22_@types+react-dom@19.2.3_@types+react@19.2.17__@typ_96c14e467b4dac0e9372e3b8059d2d93/node_modules/@radix-ui/react-dropdown-menu/dist/index.mjs
var bc = Object.defineProperty, xc = (e, t) => bc(e, "name", {
	value: t,
	configurable: !0
}), Sc = "DropdownMenu", [Cc, wc] = /* @__PURE__ */ ue(Sc, [Ts]), Tc = Ts(), [Ec, Dc] = Cc(Sc), Oc = /* @__PURE__ */ xc((e) => {
	let { __scopeDropdownMenu: t, children: n, dir: r, open: a, defaultOpen: o, onOpenChange: s, modal: c = !0 } = e, l = Tc(t), u = i.useRef(null), [d, f] = Re({
		prop: a,
		defaultProp: o ?? !1,
		onChange: s,
		caller: Sc
	});
	return /* @__PURE__ */ (0, v.jsx)(Ec, {
		scope: t,
		triggerId: $e(),
		triggerRef: u,
		contentId: $e(),
		open: d,
		onOpenChange: f,
		onOpenToggle: i.useCallback(() => f((e) => !e), [f]),
		modal: c,
		children: /* @__PURE__ */ (0, v.jsx)(Ms, {
			...l,
			open: d,
			onOpenChange: f,
			dir: r,
			modal: c,
			children: n
		})
	});
}, "DropdownMenu"), kc = "DropdownMenuTrigger", Ac = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ xc(function(e, t) {
	let { __scopeDropdownMenu: n, disabled: r = !1, ...i } = e, a = Dc(kc, n), o = Tc(n), s = h(t, a.triggerRef);
	return /* @__PURE__ */ (0, v.jsx)(Ns, {
		asChild: !0,
		...o,
		children: /* @__PURE__ */ (0, v.jsx)(F.button, {
			type: "button",
			id: a.triggerId,
			"aria-haspopup": "menu",
			"aria-expanded": a.open,
			"aria-controls": a.open ? a.contentId : void 0,
			"data-state": a.open ? "open" : "closed",
			"data-disabled": r ? "" : void 0,
			disabled: r,
			...i,
			ref: s,
			onPointerDown: B(e.onPointerDown, (e) => {
				!r && e.button === 0 && e.ctrlKey === !1 && (a.onOpenToggle(), a.open || e.preventDefault());
			}),
			onKeyDown: B(e.onKeyDown, (e) => {
				r || (["Enter", " "].includes(e.key) && a.onOpenToggle(), e.key === "ArrowDown" && a.onOpenChange(!0), [
					"Enter",
					" ",
					"ArrowDown"
				].includes(e.key) && e.preventDefault());
			})
		})
	});
}, "DropdownMenuTrigger")), jc = /* @__PURE__ */ xc((e) => {
	let { __scopeDropdownMenu: t, ...n } = e, r = Tc(t);
	return /* @__PURE__ */ (0, v.jsx)(Ls, {
		...r,
		...n
	});
}, "DropdownMenuPortal"), Mc = "DropdownMenuContent", Nc = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ xc(function(e, t) {
	let { __scopeDropdownMenu: n, ...r } = e, a = Dc(Mc, n), o = Tc(n), s = i.useRef(!1);
	return /* @__PURE__ */ (0, v.jsx)(Vs, {
		id: a.contentId,
		"aria-labelledby": a.triggerId,
		...o,
		...r,
		ref: t,
		onCloseAutoFocus: B(e.onCloseAutoFocus, (e) => {
			s.current || a.triggerRef.current?.focus(), s.current = !1, e.preventDefault();
		}),
		onInteractOutside: B(e.onInteractOutside, (e) => {
			let t = e.detail.originalEvent, n = t.button === 0 && t.ctrlKey === !0, r = t.button === 2 || n;
			(!a.modal || r) && (s.current = !0);
		}),
		style: {
			...e.style,
			"--radix-dropdown-menu-content-transform-origin": "var(--radix-popper-transform-origin)",
			"--radix-dropdown-menu-content-available-width": "var(--radix-popper-available-width)",
			"--radix-dropdown-menu-content-available-height": "var(--radix-popper-available-height)",
			"--radix-dropdown-menu-trigger-width": "var(--radix-popper-anchor-width)",
			"--radix-dropdown-menu-trigger-height": "var(--radix-popper-anchor-height)"
		}
	});
}, "DropdownMenuContent")), Pc = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ xc(function(e, t) {
	let { __scopeDropdownMenu: n, ...r } = e, i = Tc(n);
	return /* @__PURE__ */ (0, v.jsx)(Ks, {
		...i,
		...r,
		ref: t
	});
}, "DropdownMenuGroup")), Fc = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ xc(function(e, t) {
	let { __scopeDropdownMenu: n, ...r } = e, i = Tc(n);
	return /* @__PURE__ */ (0, v.jsx)(qs, {
		...i,
		...r,
		ref: t
	});
}, "DropdownMenuLabel")), Ic = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ xc(function(e, t) {
	let { __scopeDropdownMenu: n, ...r } = e, i = Tc(n);
	return /* @__PURE__ */ (0, v.jsx)(Xs, {
		...i,
		...r,
		ref: t
	});
}, "DropdownMenuItem")), Lc = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ xc(function(e, t) {
	let { __scopeDropdownMenu: n, ...r } = e, i = Tc(n);
	return /* @__PURE__ */ (0, v.jsx)(Qs, {
		...i,
		...r,
		ref: t
	});
}, "DropdownMenuCheckboxItem")), Rc = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ xc(function(e, t) {
	let { __scopeDropdownMenu: n, ...r } = e, i = Tc(n);
	return /* @__PURE__ */ (0, v.jsx)(tc, {
		...i,
		...r,
		ref: t
	});
}, "DropdownMenuRadioGroup")), zc = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ xc(function(e, t) {
	let { __scopeDropdownMenu: n, ...r } = e, i = Tc(n);
	return /* @__PURE__ */ (0, v.jsx)(rc, {
		...i,
		...r,
		ref: t
	});
}, "DropdownMenuRadioItem")), Bc = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ xc(function(e, t) {
	let { __scopeDropdownMenu: n, ...r } = e, i = Tc(n);
	return /* @__PURE__ */ (0, v.jsx)(sc, {
		...i,
		...r,
		ref: t
	});
}, "DropdownMenuItemIndicator")), Vc = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ xc(function(e, t) {
	let { __scopeDropdownMenu: n, ...r } = e, i = Tc(n);
	return /* @__PURE__ */ (0, v.jsx)(cc, {
		...i,
		...r,
		ref: t
	});
}, "DropdownMenuSeparator")), Hc = Object.defineProperty, Uc = (e, t) => Hc(e, "name", {
	value: t,
	configurable: !0
}), [Wc, Gc] = /* @__PURE__ */ ue("Tooltip", [wo]), Kc = wo(), qc = "TooltipProvider", Jc = 700, Yc = "tooltip.open", [Xc, Zc] = Wc(qc), Qc = /* @__PURE__ */ Uc((e) => {
	let { __scopeTooltip: t, delayDuration: n = Jc, skipDelayDuration: r = 300, disableHoverableContent: a = !1, children: o } = e, s = i.useRef(!0), c = i.useRef(!1), l = i.useRef(0);
	return i.useEffect(() => {
		let e = l.current;
		return () => window.clearTimeout(e);
	}, []), /* @__PURE__ */ (0, v.jsx)(Xc, {
		scope: t,
		isOpenDelayedRef: s,
		delayDuration: n,
		onOpen: i.useCallback(() => {
			r <= 0 || (window.clearTimeout(l.current), s.current = !1);
		}, [r]),
		onClose: i.useCallback(() => {
			r <= 0 || (window.clearTimeout(l.current), l.current = window.setTimeout(() => s.current = !0, r));
		}, [r]),
		isPointerInTransitRef: c,
		onPointerInTransitChange: i.useCallback((e) => {
			c.current = e;
		}, []),
		disableHoverableContent: a,
		children: o
	});
}, "TooltipProvider"), $c = "Tooltip", [el, tl] = Wc($c), nl = /* @__PURE__ */ Uc((e) => {
	let { __scopeTooltip: t, children: n, open: r, defaultOpen: a, onOpenChange: o, disableHoverableContent: s, delayDuration: c } = e, l = Zc($c, e.__scopeTooltip), u = Kc(t), [d, f] = i.useState(null), [p, m] = i.useState(void 0), h = $e(), g = i.useRef(0), _ = s ?? l.disableHoverableContent, y = c ?? l.delayDuration, b = i.useRef(!1), [x, S] = Re({
		prop: r,
		defaultProp: a ?? !1,
		onChange: /* @__PURE__ */ Uc((e) => {
			e ? (l.onOpen(), document.dispatchEvent(new CustomEvent(Yc))) : l.onClose(), o?.(e);
		}, "onChange"),
		caller: $c
	}), C = i.useMemo(() => x ? b.current ? "delayed-open" : "instant-open" : "closed", [x]), w = i.useCallback(() => {
		window.clearTimeout(g.current), g.current = 0, b.current = !1, S(!0);
	}, [S]), T = i.useCallback(() => {
		window.clearTimeout(g.current), g.current = 0, S(!1);
	}, [S]), E = i.useCallback(() => {
		window.clearTimeout(g.current), g.current = window.setTimeout(() => {
			b.current = !0, S(!0), g.current = 0;
		}, y);
	}, [y, S]);
	i.useEffect(() => () => {
		g.current &&= (window.clearTimeout(g.current), 0);
	}, []);
	let D = p ?? h;
	return /* @__PURE__ */ (0, v.jsx)(Do, {
		...u,
		children: /* @__PURE__ */ (0, v.jsx)(el, {
			scope: t,
			contentId: D,
			setContentId: m,
			open: x,
			stateAttribute: C,
			trigger: d,
			onTriggerChange: f,
			onTriggerEnter: i.useCallback(() => {
				l.isOpenDelayedRef.current ? E() : w();
			}, [
				l.isOpenDelayedRef,
				E,
				w
			]),
			onTriggerLeave: i.useCallback(() => {
				_ ? T() : (window.clearTimeout(g.current), g.current = 0);
			}, [T, _]),
			onOpen: w,
			onClose: T,
			disableHoverableContent: _,
			children: n
		})
	});
}, "Tooltip"), rl = "TooltipTrigger", il = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ Uc(function(e, t) {
	let { __scopeTooltip: n, "aria-describedby": r, ...a } = e, o = tl(rl, n), s = Zc(rl, n), c = Kc(n), l = h(t, i.useRef(null), o.onTriggerChange), u = i.useRef(!1), d = i.useRef(!1), f = i.useCallback(() => u.current = !1, []);
	return i.useEffect(() => () => document.removeEventListener("pointerup", f), [f]), /* @__PURE__ */ (0, v.jsx)(ko, {
		asChild: !0,
		...c,
		children: /* @__PURE__ */ (0, v.jsx)(F.button, {
			"aria-describedby": o.open ? xl(r, o.contentId) : r,
			"data-state": o.stateAttribute,
			...a,
			ref: l,
			onPointerMove: B(e.onPointerMove, (e) => {
				e.pointerType !== "touch" && !d.current && !s.isPointerInTransitRef.current && (o.onTriggerEnter(), d.current = !0);
			}),
			onPointerLeave: B(e.onPointerLeave, () => {
				o.onTriggerLeave(), d.current = !1;
			}),
			onPointerDown: B(e.onPointerDown, () => {
				o.open && o.onClose(), u.current = !0, document.addEventListener("pointerup", f, { once: !0 });
			}),
			onFocus: B(e.onFocus, () => {
				u.current || o.onOpen();
			}),
			onBlur: B(e.onBlur, o.onClose),
			onClick: B(e.onClick, o.onClose)
		})
	});
}, "TooltipTrigger")), al = "TooltipPortal", [ol, sl] = Wc(al, { forceMount: void 0 }), cl = /* @__PURE__ */ Uc((e) => {
	let { __scopeTooltip: t, forceMount: n, children: r, container: i } = e, a = tl(al, t);
	return /* @__PURE__ */ (0, v.jsx)(ol, {
		scope: t,
		forceMount: n,
		children: /* @__PURE__ */ (0, v.jsx)(H, {
			present: n || a.open,
			children: /* @__PURE__ */ (0, v.jsx)(zt, {
				asChild: !0,
				container: i,
				children: r
			})
		})
	});
}, "TooltipPortal"), ll = "TooltipContent", ul = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ Uc(function(e, t) {
	let n = sl(ll, e.__scopeTooltip), { forceMount: r = n.forceMount, side: i = "top", ...a } = e, o = tl(ll, e.__scopeTooltip);
	return /* @__PURE__ */ (0, v.jsx)(H, {
		present: r || o.open,
		children: o.disableHoverableContent ? /* @__PURE__ */ (0, v.jsx)(pl, {
			side: i,
			...a,
			ref: t
		}) : /* @__PURE__ */ (0, v.jsx)(dl, {
			side: i,
			...a,
			ref: t
		})
	});
}, "TooltipContent")), dl = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ Uc(function(e, t) {
	let n = tl(ll, e.__scopeTooltip), r = Zc(ll, e.__scopeTooltip), a = i.useRef(null), o = h(t, a), [s, c] = i.useState(null), { trigger: l, onClose: u } = n, d = a.current, { onPointerInTransitChange: f } = r, p = i.useCallback(() => {
		c(null), f(!1);
	}, [f]), m = i.useCallback((e, t) => {
		let n = e.currentTarget, r = {
			x: e.clientX,
			y: e.clientY
		}, i = gl(r, hl(r, n.getBoundingClientRect())), a = _l(t.getBoundingClientRect()), o = yl([...i, ...a]);
		c(o), f(!0);
	}, [f]);
	return i.useEffect(() => () => p(), [p]), i.useEffect(() => {
		if (l && d) {
			let e = /* @__PURE__ */ Uc((e) => m(e, d), "handleTriggerLeave"), t = /* @__PURE__ */ Uc((e) => m(e, l), "handleContentLeave");
			return l.addEventListener("pointerleave", e), d.addEventListener("pointerleave", t), () => {
				l.removeEventListener("pointerleave", e), d.removeEventListener("pointerleave", t);
			};
		}
	}, [
		l,
		d,
		m,
		p
	]), i.useEffect(() => {
		if (s) {
			let e = /* @__PURE__ */ Uc((e) => {
				let t = e.target, n = {
					x: e.clientX,
					y: e.clientY
				}, r = l?.contains(t) || d?.contains(t), i = !vl(n, s);
				r ? p() : i && (p(), u());
			}, "handleTrackPointerGrace");
			return document.addEventListener("pointermove", e), () => document.removeEventListener("pointermove", e);
		}
	}, [
		l,
		d,
		s,
		u,
		p
	]), /* @__PURE__ */ (0, v.jsx)(pl, {
		...e,
		ref: o
	});
}, "TooltipContentHoverable")), fl = /* @__PURE__ */ D("TooltipContent"), pl = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ Uc(function(e, t) {
	let { __scopeTooltip: n, children: r, "aria-label": a, id: o, onEscapeKeyDown: s, onPointerDownOutside: c, ...l } = e, u = tl(ll, n), d = Kc(n), { onClose: f } = u;
	i.useEffect(() => (document.addEventListener(Yc, f), () => document.removeEventListener(Yc, f)), [f]), i.useEffect(() => {
		if (u.trigger) {
			let e = /* @__PURE__ */ Uc((e) => {
				e.target instanceof Node && e.target.contains(u.trigger) && f();
			}, "handleScroll");
			return window.addEventListener("scroll", e, { capture: !0 }), () => window.removeEventListener("scroll", e, { capture: !0 });
		}
	}, [u.trigger, f]);
	let { setContentId: p } = u;
	return V(() => (p(o), () => {
		p(void 0);
	}), [o, p]), /* @__PURE__ */ (0, v.jsx)(pt, {
		asChild: !0,
		disableOutsidePointerEvents: !1,
		onEscapeKeyDown: s,
		onPointerDownOutside: c,
		onFocusOutside: (e) => e.preventDefault(),
		onDismiss: f,
		children: /* @__PURE__ */ (0, v.jsxs)(No, {
			"data-state": u.stateAttribute,
			role: a ? void 0 : "tooltip",
			id: a ? void 0 : u.contentId,
			...d,
			...l,
			ref: t,
			style: {
				...l.style,
				"--radix-tooltip-content-transform-origin": "var(--radix-popper-transform-origin)",
				"--radix-tooltip-content-available-width": "var(--radix-popper-available-width)",
				"--radix-tooltip-content-available-height": "var(--radix-popper-available-height)",
				"--radix-tooltip-trigger-width": "var(--radix-popper-anchor-width)",
				"--radix-tooltip-trigger-height": "var(--radix-popper-anchor-height)"
			},
			children: [/* @__PURE__ */ (0, v.jsx)(fl, { children: r }), a ? /* @__PURE__ */ (0, v.jsx)(se, {
				id: u.contentId,
				role: "tooltip",
				children: a
			}) : null]
		})
	});
}, "TooltipContentImpl")), ml = /* @__PURE__ */ i.forwardRef(/* @__PURE__ */ Uc(function(e, t) {
	let { __scopeTooltip: n, ...r } = e, i = Kc(n);
	return /* @__PURE__ */ (0, v.jsx)(Io, {
		...i,
		...r,
		ref: t
	});
}, "TooltipArrow"));
function hl(e, t) {
	let n = Math.abs(t.top - e.y), r = Math.abs(t.bottom - e.y), i = Math.abs(t.right - e.x), a = Math.abs(t.left - e.x);
	switch (Math.min(n, r, i, a)) {
		case a: return "left";
		case i: return "right";
		case n: return "top";
		case r: return "bottom";
		default: throw Error("unreachable");
	}
}
Uc(hl, "getExitSideFromRect");
function gl(e, t, n = 5) {
	let r = [];
	switch (t) {
		case "top":
			r.push({
				x: e.x - n,
				y: e.y + n
			}, {
				x: e.x + n,
				y: e.y + n
			});
			break;
		case "bottom":
			r.push({
				x: e.x - n,
				y: e.y - n
			}, {
				x: e.x + n,
				y: e.y - n
			});
			break;
		case "left":
			r.push({
				x: e.x + n,
				y: e.y - n
			}, {
				x: e.x + n,
				y: e.y + n
			});
			break;
		case "right":
			r.push({
				x: e.x - n,
				y: e.y - n
			}, {
				x: e.x - n,
				y: e.y + n
			});
			break;
	}
	return r;
}
Uc(gl, "getPaddedExitPoints");
function _l(e) {
	let { top: t, right: n, bottom: r, left: i } = e;
	return [
		{
			x: i,
			y: t
		},
		{
			x: n,
			y: t
		},
		{
			x: n,
			y: r
		},
		{
			x: i,
			y: r
		}
	];
}
Uc(_l, "getPointsFromRect");
function vl(e, t) {
	let { x: n, y: r } = e, i = !1;
	for (let e = 0, a = t.length - 1; e < t.length; a = e++) {
		let o = t[e], s = t[a], c = o.x, l = o.y, u = s.x, d = s.y;
		l > r != d > r && n < (u - c) * (r - l) / (d - l) + c && (i = !i);
	}
	return i;
}
Uc(vl, "isPointInPolygon");
function yl(e) {
	let t = e.slice();
	return t.sort((e, t) => e.x < t.x ? -1 : e.x > t.x ? 1 : e.y < t.y ? -1 : +(e.y > t.y)), bl(t);
}
Uc(yl, "getHull");
function bl(e) {
	if (e.length <= 1) return e.slice();
	let t = [];
	for (let n = 0; n < e.length; n++) {
		let r = e[n];
		for (; t.length >= 2;) {
			let e = t[t.length - 1], n = t[t.length - 2];
			if ((e.x - n.x) * (r.y - n.y) >= (e.y - n.y) * (r.x - n.x)) t.pop();
			else break;
		}
		t.push(r);
	}
	t.pop();
	let n = [];
	for (let t = e.length - 1; t >= 0; t--) {
		let r = e[t];
		for (; n.length >= 2;) {
			let e = n[n.length - 1], t = n[n.length - 2];
			if ((e.x - t.x) * (r.y - t.y) >= (e.y - t.y) * (r.x - t.x)) n.pop();
			else break;
		}
		n.push(r);
	}
	return n.pop(), t.length === 1 && n.length === 1 && t[0].x === n[0].x && t[0].y === n[0].y ? t : t.concat(n);
}
Uc(bl, "getHullPresorted");
function xl(...e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) if (typeof n == "string") for (let e of String(n).trim().split(/\s+/)) e && t.add(e);
	return t.size > 0 ? Array.from(t).join(" ") : void 0;
}
Uc(xl, "concatAriaDescribedby");
//#endregion
//#region node_modules/.pnpm/tailwind-merge@3.6.0/node_modules/tailwind-merge/dist/bundle-mjs.mjs
var Sl = (e, t) => {
	let n = Array(e.length + t.length);
	for (let t = 0; t < e.length; t++) n[t] = e[t];
	for (let r = 0; r < t.length; r++) n[e.length + r] = t[r];
	return n;
}, Cl = (e, t) => ({
	classGroupId: e,
	validator: t
}), wl = (e = /* @__PURE__ */ new Map(), t = null, n) => ({
	nextPart: e,
	validators: t,
	classGroupId: n
}), Tl = "-", El = [], Dl = "arbitrary..", Ol = (e) => {
	let t = jl(e), { conflictingClassGroups: n, conflictingClassGroupModifiers: r } = e;
	return {
		getClassGroupId: (e) => {
			if (e.startsWith("[") && e.endsWith("]")) return Al(e);
			let n = e.split(Tl);
			return kl(n, +(n[0] === "" && n.length > 1), t);
		},
		getConflictingClassGroupIds: (e, t) => {
			if (t) {
				let t = r[e], i = n[e];
				return t ? i ? Sl(i, t) : t : i || El;
			}
			return n[e] || El;
		}
	};
}, kl = (e, t, n) => {
	if (e.length - t === 0) return n.classGroupId;
	let r = e[t], i = n.nextPart.get(r);
	if (i) {
		let n = kl(e, t + 1, i);
		if (n) return n;
	}
	let a = n.validators;
	if (a === null) return;
	let o = t === 0 ? e.join(Tl) : e.slice(t).join(Tl), s = a.length;
	for (let e = 0; e < s; e++) {
		let t = a[e];
		if (t.validator(o)) return t.classGroupId;
	}
}, Al = (e) => e.slice(1, -1).indexOf(":") === -1 ? void 0 : (() => {
	let t = e.slice(1, -1), n = t.indexOf(":"), r = t.slice(0, n);
	return r ? Dl + r : void 0;
})(), jl = (e) => {
	let { theme: t, classGroups: n } = e;
	return Ml(n, t);
}, Ml = (e, t) => {
	let n = wl();
	for (let r in e) {
		let i = e[r];
		Nl(i, n, r, t);
	}
	return n;
}, Nl = (e, t, n, r) => {
	let i = e.length;
	for (let a = 0; a < i; a++) {
		let i = e[a];
		Pl(i, t, n, r);
	}
}, Pl = (e, t, n, r) => {
	if (typeof e == "string") {
		Fl(e, t, n);
		return;
	}
	if (typeof e == "function") {
		Il(e, t, n, r);
		return;
	}
	Ll(e, t, n, r);
}, Fl = (e, t, n) => {
	let r = e === "" ? t : Rl(t, e);
	r.classGroupId = n;
}, Il = (e, t, n, r) => {
	if (zl(e)) {
		Nl(e(r), t, n, r);
		return;
	}
	t.validators === null && (t.validators = []), t.validators.push(Cl(n, e));
}, Ll = (e, t, n, r) => {
	let i = Object.entries(e), a = i.length;
	for (let e = 0; e < a; e++) {
		let [a, o] = i[e];
		Nl(o, Rl(t, a), n, r);
	}
}, Rl = (e, t) => {
	let n = e, r = t.split(Tl), i = r.length;
	for (let e = 0; e < i; e++) {
		let t = r[e], i = n.nextPart.get(t);
		i || (i = wl(), n.nextPart.set(t, i)), n = i;
	}
	return n;
}, zl = (e) => "isThemeGetter" in e && e.isThemeGetter === !0, Bl = (e) => {
	if (e < 1) return {
		get: () => void 0,
		set: () => {}
	};
	let t = 0, n = Object.create(null), r = Object.create(null), i = (i, a) => {
		n[i] = a, t++, t > e && (t = 0, r = n, n = Object.create(null));
	};
	return {
		get(e) {
			let t = n[e];
			if (t !== void 0) return t;
			if ((t = r[e]) !== void 0) return i(e, t), t;
		},
		set(e, t) {
			e in n ? n[e] = t : i(e, t);
		}
	};
}, Vl = "!", Hl = ":", Ul = [], Wl = (e, t, n, r, i) => ({
	modifiers: e,
	hasImportantModifier: t,
	baseClassName: n,
	maybePostfixModifierPosition: r,
	isExternal: i
}), Gl = (e) => {
	let { prefix: t, experimentalParseClassName: n } = e, r = (e) => {
		let t = [], n = 0, r = 0, i = 0, a, o = e.length;
		for (let s = 0; s < o; s++) {
			let o = e[s];
			if (n === 0 && r === 0) {
				if (o === Hl) {
					t.push(e.slice(i, s)), i = s + 1;
					continue;
				}
				if (o === "/") {
					a = s;
					continue;
				}
			}
			o === "[" ? n++ : o === "]" ? n-- : o === "(" ? r++ : o === ")" && r--;
		}
		let s = t.length === 0 ? e : e.slice(i), c = s, l = !1;
		s.endsWith(Vl) ? (c = s.slice(0, -1), l = !0) : s.startsWith(Vl) && (c = s.slice(1), l = !0);
		let u = a && a > i ? a - i : void 0;
		return Wl(t, l, c, u);
	};
	if (t) {
		let e = t + Hl, n = r;
		r = (t) => t.startsWith(e) ? n(t.slice(e.length)) : Wl(Ul, !1, t, void 0, !0);
	}
	if (n) {
		let e = r;
		r = (t) => n({
			className: t,
			parseClassName: e
		});
	}
	return r;
}, Kl = (e) => {
	let t = /* @__PURE__ */ new Map();
	return e.orderSensitiveModifiers.forEach((e, n) => {
		t.set(e, 1e6 + n);
	}), (e) => {
		let n = [], r = [];
		for (let i = 0; i < e.length; i++) {
			let a = e[i], o = a[0] === "[", s = t.has(a);
			o || s ? (r.length > 0 && (r.sort(), n.push(...r), r = []), n.push(a)) : r.push(a);
		}
		return r.length > 0 && (r.sort(), n.push(...r)), n;
	};
}, ql = (e) => ({
	cache: Bl(e.cacheSize),
	parseClassName: Gl(e),
	sortModifiers: Kl(e),
	postfixLookupClassGroupIds: Jl(e),
	...Ol(e)
}), Jl = (e) => {
	let t = Object.create(null), n = e.postfixLookupClassGroups;
	if (n) for (let e = 0; e < n.length; e++) t[n[e]] = !0;
	return t;
}, Yl = /\s+/, Xl = (e, t) => {
	let { parseClassName: n, getClassGroupId: r, getConflictingClassGroupIds: i, sortModifiers: a, postfixLookupClassGroupIds: o } = t, s = [], c = e.trim().split(Yl), l = "";
	for (let e = c.length - 1; e >= 0; --e) {
		let t = c[e], { isExternal: u, modifiers: d, hasImportantModifier: f, baseClassName: p, maybePostfixModifierPosition: m } = n(t);
		if (u) {
			l = t + (l.length > 0 ? " " + l : l);
			continue;
		}
		let h = !!m, g;
		if (h) {
			g = r(p.substring(0, m));
			let e = g && o[g] ? r(p) : void 0;
			e && e !== g && (g = e, h = !1);
		} else g = r(p);
		if (!g) {
			if (!h) {
				l = t + (l.length > 0 ? " " + l : l);
				continue;
			}
			if (g = r(p), !g) {
				l = t + (l.length > 0 ? " " + l : l);
				continue;
			}
			h = !1;
		}
		let _ = d.length === 0 ? "" : d.length === 1 ? d[0] : a(d).join(":"), v = f ? _ + Vl : _, y = v + g;
		if (s.indexOf(y) > -1) continue;
		s.push(y);
		let b = i(g, h);
		for (let e = 0; e < b.length; ++e) {
			let t = b[e];
			s.push(v + t);
		}
		l = t + (l.length > 0 ? " " + l : l);
	}
	return l;
}, Zl = (...e) => {
	let t = 0, n, r, i = "";
	for (; t < e.length;) (n = e[t++]) && (r = Ql(n)) && (i && (i += " "), i += r);
	return i;
}, Ql = (e) => {
	if (typeof e == "string") return e;
	let t, n = "";
	for (let r = 0; r < e.length; r++) e[r] && (t = Ql(e[r])) && (n && (n += " "), n += t);
	return n;
}, $l = (e, ...t) => {
	let n, r, i, a, o = (o) => (n = ql(t.reduce((e, t) => t(e), e())), r = n.cache.get, i = n.cache.set, a = s, s(o)), s = (e) => {
		let t = r(e);
		if (t) return t;
		let a = Xl(e, n);
		return i(e, a), a;
	};
	return a = o, (...e) => a(Zl(...e));
}, eu = [], tu = (e) => {
	let t = (t) => t[e] || eu;
	return t.isThemeGetter = !0, t;
}, nu = /^\[(?:(\w[\w-]*):)?(.+)\]$/i, ru = /^\((?:(\w[\w-]*):)?(.+)\)$/i, iu = /^\d+(?:\.\d+)?\/\d+(?:\.\d+)?$/, au = /^(\d+(\.\d+)?)?(xs|sm|md|lg|xl)$/, ou = /\d+(%|px|r?em|[sdl]?v([hwib]|min|max)|pt|pc|in|cm|mm|cap|ch|ex|r?lh|cq(w|h|i|b|min|max))|\b(calc|min|max|clamp)\(.+\)|^0$/, su = /^(rgba?|hsla?|hwb|(ok)?(lab|lch)|color-mix)\(.+\)$/, cu = /^(inset_)?-?((\d+)?\.?(\d+)[a-z]+|0)_-?((\d+)?\.?(\d+)[a-z]+|0)/, lu = /^(url|image|image-set|cross-fade|element|(repeating-)?(linear|radial|conic)-gradient)\(.+\)$/, uu = (e) => iu.test(e), q = (e) => !!e && !Number.isNaN(Number(e)), du = (e) => !!e && Number.isInteger(Number(e)), fu = (e) => e.endsWith("%") && q(e.slice(0, -1)), pu = (e) => au.test(e), mu = () => !0, hu = (e) => ou.test(e) && !su.test(e), gu = () => !1, _u = (e) => cu.test(e), vu = (e) => lu.test(e), yu = (e) => !J(e) && !Y(e), bu = (e) => e.startsWith("@container") && (e[10] === "/" && e[11] !== void 0 || e[11] === "s" && e[16] !== void 0 && e.startsWith("-size/", 10) || e[11] === "n" && e[18] !== void 0 && e.startsWith("-normal/", 10)), xu = (e) => Iu(e, Bu, gu), J = (e) => nu.test(e), Su = (e) => Iu(e, Vu, hu), Cu = (e) => Iu(e, Hu, q), wu = (e) => Iu(e, Wu, mu), Tu = (e) => Iu(e, Uu, gu), Eu = (e) => Iu(e, Ru, gu), Du = (e) => Iu(e, zu, vu), Ou = (e) => Iu(e, Gu, _u), Y = (e) => ru.test(e), ku = (e) => Lu(e, Vu), Au = (e) => Lu(e, Uu), ju = (e) => Lu(e, Ru), Mu = (e) => Lu(e, Bu), Nu = (e) => Lu(e, zu), Pu = (e) => Lu(e, Gu, !0), Fu = (e) => Lu(e, Wu, !0), Iu = (e, t, n) => {
	let r = nu.exec(e);
	return r ? r[1] ? t(r[1]) : n(r[2]) : !1;
}, Lu = (e, t, n = !1) => {
	let r = ru.exec(e);
	return r ? r[1] ? t(r[1]) : n : !1;
}, Ru = (e) => e === "position" || e === "percentage", zu = (e) => e === "image" || e === "url", Bu = (e) => e === "length" || e === "size" || e === "bg-size", Vu = (e) => e === "length", Hu = (e) => e === "number", Uu = (e) => e === "family-name", Wu = (e) => e === "number" || e === "weight", Gu = (e) => e === "shadow", Ku = /*#__PURE__*/ $l(() => {
	let e = tu("color"), t = tu("font"), n = tu("text"), r = tu("font-weight"), i = tu("tracking"), a = tu("leading"), o = tu("breakpoint"), s = tu("container"), c = tu("spacing"), l = tu("radius"), u = tu("shadow"), d = tu("inset-shadow"), f = tu("text-shadow"), p = tu("drop-shadow"), m = tu("blur"), h = tu("perspective"), g = tu("aspect"), _ = tu("ease"), v = tu("animate"), y = () => [
		"auto",
		"avoid",
		"all",
		"avoid-page",
		"page",
		"left",
		"right",
		"column"
	], b = () => [
		"center",
		"top",
		"bottom",
		"left",
		"right",
		"top-left",
		"left-top",
		"top-right",
		"right-top",
		"bottom-right",
		"right-bottom",
		"bottom-left",
		"left-bottom"
	], x = () => [
		...b(),
		Y,
		J
	], S = () => [
		"auto",
		"hidden",
		"clip",
		"visible",
		"scroll"
	], C = () => [
		"auto",
		"contain",
		"none"
	], w = () => [
		Y,
		J,
		c
	], T = () => [
		uu,
		"full",
		"auto",
		...w()
	], E = () => [
		du,
		"none",
		"subgrid",
		Y,
		J
	], D = () => [
		"auto",
		{ span: [
			"full",
			du,
			Y,
			J
		] },
		du,
		Y,
		J
	], O = () => [
		du,
		"auto",
		Y,
		J
	], k = () => [
		"auto",
		"min",
		"max",
		"fr",
		Y,
		J
	], A = () => [
		"start",
		"end",
		"center",
		"between",
		"around",
		"evenly",
		"stretch",
		"baseline",
		"center-safe",
		"end-safe"
	], j = () => [
		"start",
		"end",
		"center",
		"stretch",
		"center-safe",
		"end-safe"
	], M = () => ["auto", ...w()], ee = () => [
		uu,
		"auto",
		"full",
		"dvw",
		"dvh",
		"lvw",
		"lvh",
		"svw",
		"svh",
		"min",
		"max",
		"fit",
		...w()
	], N = () => [
		uu,
		"screen",
		"full",
		"dvw",
		"lvw",
		"svw",
		"min",
		"max",
		"fit",
		...w()
	], te = () => [
		uu,
		"screen",
		"full",
		"lh",
		"dvh",
		"lvh",
		"svh",
		"min",
		"max",
		"fit",
		...w()
	], P = () => [
		e,
		Y,
		J
	], ne = () => [
		...b(),
		ju,
		Eu,
		{ position: [Y, J] }
	], re = () => ["no-repeat", { repeat: [
		"",
		"x",
		"y",
		"space",
		"round"
	] }], F = () => [
		"auto",
		"cover",
		"contain",
		Mu,
		xu,
		{ size: [Y, J] }
	], I = () => [
		fu,
		ku,
		Su
	], ie = () => [
		"",
		"none",
		"full",
		l,
		Y,
		J
	], ae = () => [
		"",
		q,
		ku,
		Su
	], oe = () => [
		"solid",
		"dashed",
		"dotted",
		"double"
	], se = () => [
		"normal",
		"multiply",
		"screen",
		"overlay",
		"darken",
		"lighten",
		"color-dodge",
		"color-burn",
		"hard-light",
		"soft-light",
		"difference",
		"exclusion",
		"hue",
		"saturation",
		"color",
		"luminosity"
	], L = () => [
		q,
		fu,
		ju,
		Eu
	], ce = () => [
		"",
		"none",
		m,
		Y,
		J
	], le = () => [
		"none",
		q,
		Y,
		J
	], ue = () => [
		"none",
		q,
		Y,
		J
	], de = () => [
		q,
		Y,
		J
	], R = () => [
		uu,
		"full",
		...w()
	];
	return {
		cacheSize: 500,
		theme: {
			animate: [
				"spin",
				"ping",
				"pulse",
				"bounce"
			],
			aspect: ["video"],
			blur: [pu],
			breakpoint: [pu],
			color: [mu],
			container: [pu],
			"drop-shadow": [pu],
			ease: [
				"in",
				"out",
				"in-out"
			],
			font: [yu],
			"font-weight": [
				"thin",
				"extralight",
				"light",
				"normal",
				"medium",
				"semibold",
				"bold",
				"extrabold",
				"black"
			],
			"inset-shadow": [pu],
			leading: [
				"none",
				"tight",
				"snug",
				"normal",
				"relaxed",
				"loose"
			],
			perspective: [
				"dramatic",
				"near",
				"normal",
				"midrange",
				"distant",
				"none"
			],
			radius: [pu],
			shadow: [pu],
			spacing: ["px", q],
			text: [pu],
			"text-shadow": [pu],
			tracking: [
				"tighter",
				"tight",
				"normal",
				"wide",
				"wider",
				"widest"
			]
		},
		classGroups: {
			aspect: [{ aspect: [
				"auto",
				"square",
				uu,
				J,
				Y,
				g
			] }],
			container: ["container"],
			"container-type": [{ "@container": [
				"",
				"normal",
				"size",
				Y,
				J
			] }],
			"container-named": [bu],
			columns: [{ columns: [
				q,
				J,
				Y,
				s
			] }],
			"break-after": [{ "break-after": y() }],
			"break-before": [{ "break-before": y() }],
			"break-inside": [{ "break-inside": [
				"auto",
				"avoid",
				"avoid-page",
				"avoid-column"
			] }],
			"box-decoration": [{ "box-decoration": ["slice", "clone"] }],
			box: [{ box: ["border", "content"] }],
			display: [
				"block",
				"inline-block",
				"inline",
				"flex",
				"inline-flex",
				"table",
				"inline-table",
				"table-caption",
				"table-cell",
				"table-column",
				"table-column-group",
				"table-footer-group",
				"table-header-group",
				"table-row-group",
				"table-row",
				"flow-root",
				"grid",
				"inline-grid",
				"contents",
				"list-item",
				"hidden"
			],
			sr: ["sr-only", "not-sr-only"],
			float: [{ float: [
				"right",
				"left",
				"none",
				"start",
				"end"
			] }],
			clear: [{ clear: [
				"left",
				"right",
				"both",
				"none",
				"start",
				"end"
			] }],
			isolation: ["isolate", "isolation-auto"],
			"object-fit": [{ object: [
				"contain",
				"cover",
				"fill",
				"none",
				"scale-down"
			] }],
			"object-position": [{ object: x() }],
			overflow: [{ overflow: S() }],
			"overflow-x": [{ "overflow-x": S() }],
			"overflow-y": [{ "overflow-y": S() }],
			overscroll: [{ overscroll: C() }],
			"overscroll-x": [{ "overscroll-x": C() }],
			"overscroll-y": [{ "overscroll-y": C() }],
			position: [
				"static",
				"fixed",
				"absolute",
				"relative",
				"sticky"
			],
			inset: [{ inset: T() }],
			"inset-x": [{ "inset-x": T() }],
			"inset-y": [{ "inset-y": T() }],
			start: [{
				"inset-s": T(),
				start: T()
			}],
			end: [{
				"inset-e": T(),
				end: T()
			}],
			"inset-bs": [{ "inset-bs": T() }],
			"inset-be": [{ "inset-be": T() }],
			top: [{ top: T() }],
			right: [{ right: T() }],
			bottom: [{ bottom: T() }],
			left: [{ left: T() }],
			visibility: [
				"visible",
				"invisible",
				"collapse"
			],
			z: [{ z: [
				du,
				"auto",
				Y,
				J
			] }],
			basis: [{ basis: [
				uu,
				"full",
				"auto",
				s,
				...w()
			] }],
			"flex-direction": [{ flex: [
				"row",
				"row-reverse",
				"col",
				"col-reverse"
			] }],
			"flex-wrap": [{ flex: [
				"nowrap",
				"wrap",
				"wrap-reverse"
			] }],
			flex: [{ flex: [
				q,
				uu,
				"auto",
				"initial",
				"none",
				J
			] }],
			grow: [{ grow: [
				"",
				q,
				Y,
				J
			] }],
			shrink: [{ shrink: [
				"",
				q,
				Y,
				J
			] }],
			order: [{ order: [
				du,
				"first",
				"last",
				"none",
				Y,
				J
			] }],
			"grid-cols": [{ "grid-cols": E() }],
			"col-start-end": [{ col: D() }],
			"col-start": [{ "col-start": O() }],
			"col-end": [{ "col-end": O() }],
			"grid-rows": [{ "grid-rows": E() }],
			"row-start-end": [{ row: D() }],
			"row-start": [{ "row-start": O() }],
			"row-end": [{ "row-end": O() }],
			"grid-flow": [{ "grid-flow": [
				"row",
				"col",
				"dense",
				"row-dense",
				"col-dense"
			] }],
			"auto-cols": [{ "auto-cols": k() }],
			"auto-rows": [{ "auto-rows": k() }],
			gap: [{ gap: w() }],
			"gap-x": [{ "gap-x": w() }],
			"gap-y": [{ "gap-y": w() }],
			"justify-content": [{ justify: [...A(), "normal"] }],
			"justify-items": [{ "justify-items": [...j(), "normal"] }],
			"justify-self": [{ "justify-self": ["auto", ...j()] }],
			"align-content": [{ content: ["normal", ...A()] }],
			"align-items": [{ items: [...j(), { baseline: ["", "last"] }] }],
			"align-self": [{ self: [
				"auto",
				...j(),
				{ baseline: ["", "last"] }
			] }],
			"place-content": [{ "place-content": A() }],
			"place-items": [{ "place-items": [...j(), "baseline"] }],
			"place-self": [{ "place-self": ["auto", ...j()] }],
			p: [{ p: w() }],
			px: [{ px: w() }],
			py: [{ py: w() }],
			ps: [{ ps: w() }],
			pe: [{ pe: w() }],
			pbs: [{ pbs: w() }],
			pbe: [{ pbe: w() }],
			pt: [{ pt: w() }],
			pr: [{ pr: w() }],
			pb: [{ pb: w() }],
			pl: [{ pl: w() }],
			m: [{ m: M() }],
			mx: [{ mx: M() }],
			my: [{ my: M() }],
			ms: [{ ms: M() }],
			me: [{ me: M() }],
			mbs: [{ mbs: M() }],
			mbe: [{ mbe: M() }],
			mt: [{ mt: M() }],
			mr: [{ mr: M() }],
			mb: [{ mb: M() }],
			ml: [{ ml: M() }],
			"space-x": [{ "space-x": w() }],
			"space-x-reverse": ["space-x-reverse"],
			"space-y": [{ "space-y": w() }],
			"space-y-reverse": ["space-y-reverse"],
			size: [{ size: ee() }],
			"inline-size": [{ inline: ["auto", ...N()] }],
			"min-inline-size": [{ "min-inline": ["auto", ...N()] }],
			"max-inline-size": [{ "max-inline": ["none", ...N()] }],
			"block-size": [{ block: ["auto", ...te()] }],
			"min-block-size": [{ "min-block": ["auto", ...te()] }],
			"max-block-size": [{ "max-block": ["none", ...te()] }],
			w: [{ w: [
				s,
				"screen",
				...ee()
			] }],
			"min-w": [{ "min-w": [
				s,
				"screen",
				"none",
				...ee()
			] }],
			"max-w": [{ "max-w": [
				s,
				"screen",
				"none",
				"prose",
				{ screen: [o] },
				...ee()
			] }],
			h: [{ h: [
				"screen",
				"lh",
				...ee()
			] }],
			"min-h": [{ "min-h": [
				"screen",
				"lh",
				"none",
				...ee()
			] }],
			"max-h": [{ "max-h": [
				"screen",
				"lh",
				...ee()
			] }],
			"font-size": [{ text: [
				"base",
				n,
				ku,
				Su
			] }],
			"font-smoothing": ["antialiased", "subpixel-antialiased"],
			"font-style": ["italic", "not-italic"],
			"font-weight": [{ font: [
				r,
				Fu,
				wu
			] }],
			"font-stretch": [{ "font-stretch": [
				"ultra-condensed",
				"extra-condensed",
				"condensed",
				"semi-condensed",
				"normal",
				"semi-expanded",
				"expanded",
				"extra-expanded",
				"ultra-expanded",
				fu,
				J
			] }],
			"font-family": [{ font: [
				Au,
				Tu,
				t
			] }],
			"font-features": [{ "font-features": [J] }],
			"fvn-normal": ["normal-nums"],
			"fvn-ordinal": ["ordinal"],
			"fvn-slashed-zero": ["slashed-zero"],
			"fvn-figure": ["lining-nums", "oldstyle-nums"],
			"fvn-spacing": ["proportional-nums", "tabular-nums"],
			"fvn-fraction": ["diagonal-fractions", "stacked-fractions"],
			tracking: [{ tracking: [
				i,
				Y,
				J
			] }],
			"line-clamp": [{ "line-clamp": [
				q,
				"none",
				Y,
				Cu
			] }],
			leading: [{ leading: [a, ...w()] }],
			"list-image": [{ "list-image": [
				"none",
				Y,
				J
			] }],
			"list-style-position": [{ list: ["inside", "outside"] }],
			"list-style-type": [{ list: [
				"disc",
				"decimal",
				"none",
				Y,
				J
			] }],
			"text-alignment": [{ text: [
				"left",
				"center",
				"right",
				"justify",
				"start",
				"end"
			] }],
			"placeholder-color": [{ placeholder: P() }],
			"text-color": [{ text: P() }],
			"text-decoration": [
				"underline",
				"overline",
				"line-through",
				"no-underline"
			],
			"text-decoration-style": [{ decoration: [...oe(), "wavy"] }],
			"text-decoration-thickness": [{ decoration: [
				q,
				"from-font",
				"auto",
				Y,
				Su
			] }],
			"text-decoration-color": [{ decoration: P() }],
			"underline-offset": [{ "underline-offset": [
				q,
				"auto",
				Y,
				J
			] }],
			"text-transform": [
				"uppercase",
				"lowercase",
				"capitalize",
				"normal-case"
			],
			"text-overflow": [
				"truncate",
				"text-ellipsis",
				"text-clip"
			],
			"text-wrap": [{ text: [
				"wrap",
				"nowrap",
				"balance",
				"pretty"
			] }],
			indent: [{ indent: w() }],
			"tab-size": [{ tab: [
				du,
				Y,
				J
			] }],
			"vertical-align": [{ align: [
				"baseline",
				"top",
				"middle",
				"bottom",
				"text-top",
				"text-bottom",
				"sub",
				"super",
				Y,
				J
			] }],
			whitespace: [{ whitespace: [
				"normal",
				"nowrap",
				"pre",
				"pre-line",
				"pre-wrap",
				"break-spaces"
			] }],
			break: [{ break: [
				"normal",
				"words",
				"all",
				"keep"
			] }],
			wrap: [{ wrap: [
				"break-word",
				"anywhere",
				"normal"
			] }],
			hyphens: [{ hyphens: [
				"none",
				"manual",
				"auto"
			] }],
			content: [{ content: [
				"none",
				Y,
				J
			] }],
			"bg-attachment": [{ bg: [
				"fixed",
				"local",
				"scroll"
			] }],
			"bg-clip": [{ "bg-clip": [
				"border",
				"padding",
				"content",
				"text"
			] }],
			"bg-origin": [{ "bg-origin": [
				"border",
				"padding",
				"content"
			] }],
			"bg-position": [{ bg: ne() }],
			"bg-repeat": [{ bg: re() }],
			"bg-size": [{ bg: F() }],
			"bg-image": [{ bg: [
				"none",
				{
					linear: [
						{ to: [
							"t",
							"tr",
							"r",
							"br",
							"b",
							"bl",
							"l",
							"tl"
						] },
						du,
						Y,
						J
					],
					radial: [
						"",
						Y,
						J
					],
					conic: [
						du,
						Y,
						J
					]
				},
				Nu,
				Du
			] }],
			"bg-color": [{ bg: P() }],
			"gradient-from-pos": [{ from: I() }],
			"gradient-via-pos": [{ via: I() }],
			"gradient-to-pos": [{ to: I() }],
			"gradient-from": [{ from: P() }],
			"gradient-via": [{ via: P() }],
			"gradient-to": [{ to: P() }],
			rounded: [{ rounded: ie() }],
			"rounded-s": [{ "rounded-s": ie() }],
			"rounded-e": [{ "rounded-e": ie() }],
			"rounded-t": [{ "rounded-t": ie() }],
			"rounded-r": [{ "rounded-r": ie() }],
			"rounded-b": [{ "rounded-b": ie() }],
			"rounded-l": [{ "rounded-l": ie() }],
			"rounded-ss": [{ "rounded-ss": ie() }],
			"rounded-se": [{ "rounded-se": ie() }],
			"rounded-ee": [{ "rounded-ee": ie() }],
			"rounded-es": [{ "rounded-es": ie() }],
			"rounded-tl": [{ "rounded-tl": ie() }],
			"rounded-tr": [{ "rounded-tr": ie() }],
			"rounded-br": [{ "rounded-br": ie() }],
			"rounded-bl": [{ "rounded-bl": ie() }],
			"border-w": [{ border: ae() }],
			"border-w-x": [{ "border-x": ae() }],
			"border-w-y": [{ "border-y": ae() }],
			"border-w-s": [{ "border-s": ae() }],
			"border-w-e": [{ "border-e": ae() }],
			"border-w-bs": [{ "border-bs": ae() }],
			"border-w-be": [{ "border-be": ae() }],
			"border-w-t": [{ "border-t": ae() }],
			"border-w-r": [{ "border-r": ae() }],
			"border-w-b": [{ "border-b": ae() }],
			"border-w-l": [{ "border-l": ae() }],
			"divide-x": [{ "divide-x": ae() }],
			"divide-x-reverse": ["divide-x-reverse"],
			"divide-y": [{ "divide-y": ae() }],
			"divide-y-reverse": ["divide-y-reverse"],
			"border-style": [{ border: [
				...oe(),
				"hidden",
				"none"
			] }],
			"divide-style": [{ divide: [
				...oe(),
				"hidden",
				"none"
			] }],
			"border-color": [{ border: P() }],
			"border-color-x": [{ "border-x": P() }],
			"border-color-y": [{ "border-y": P() }],
			"border-color-s": [{ "border-s": P() }],
			"border-color-e": [{ "border-e": P() }],
			"border-color-bs": [{ "border-bs": P() }],
			"border-color-be": [{ "border-be": P() }],
			"border-color-t": [{ "border-t": P() }],
			"border-color-r": [{ "border-r": P() }],
			"border-color-b": [{ "border-b": P() }],
			"border-color-l": [{ "border-l": P() }],
			"divide-color": [{ divide: P() }],
			"outline-style": [{ outline: [
				...oe(),
				"none",
				"hidden"
			] }],
			"outline-offset": [{ "outline-offset": [
				q,
				Y,
				J
			] }],
			"outline-w": [{ outline: [
				"",
				q,
				ku,
				Su
			] }],
			"outline-color": [{ outline: P() }],
			shadow: [{ shadow: [
				"",
				"none",
				u,
				Pu,
				Ou
			] }],
			"shadow-color": [{ shadow: P() }],
			"inset-shadow": [{ "inset-shadow": [
				"none",
				d,
				Pu,
				Ou
			] }],
			"inset-shadow-color": [{ "inset-shadow": P() }],
			"ring-w": [{ ring: ae() }],
			"ring-w-inset": ["ring-inset"],
			"ring-color": [{ ring: P() }],
			"ring-offset-w": [{ "ring-offset": [q, Su] }],
			"ring-offset-color": [{ "ring-offset": P() }],
			"inset-ring-w": [{ "inset-ring": ae() }],
			"inset-ring-color": [{ "inset-ring": P() }],
			"text-shadow": [{ "text-shadow": [
				"none",
				f,
				Pu,
				Ou
			] }],
			"text-shadow-color": [{ "text-shadow": P() }],
			opacity: [{ opacity: [
				q,
				Y,
				J
			] }],
			"mix-blend": [{ "mix-blend": [
				...se(),
				"plus-darker",
				"plus-lighter"
			] }],
			"bg-blend": [{ "bg-blend": se() }],
			"mask-clip": [{ "mask-clip": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }, "mask-no-clip"],
			"mask-composite": [{ mask: [
				"add",
				"subtract",
				"intersect",
				"exclude"
			] }],
			"mask-image-linear-pos": [{ "mask-linear": [q] }],
			"mask-image-linear-from-pos": [{ "mask-linear-from": L() }],
			"mask-image-linear-to-pos": [{ "mask-linear-to": L() }],
			"mask-image-linear-from-color": [{ "mask-linear-from": P() }],
			"mask-image-linear-to-color": [{ "mask-linear-to": P() }],
			"mask-image-t-from-pos": [{ "mask-t-from": L() }],
			"mask-image-t-to-pos": [{ "mask-t-to": L() }],
			"mask-image-t-from-color": [{ "mask-t-from": P() }],
			"mask-image-t-to-color": [{ "mask-t-to": P() }],
			"mask-image-r-from-pos": [{ "mask-r-from": L() }],
			"mask-image-r-to-pos": [{ "mask-r-to": L() }],
			"mask-image-r-from-color": [{ "mask-r-from": P() }],
			"mask-image-r-to-color": [{ "mask-r-to": P() }],
			"mask-image-b-from-pos": [{ "mask-b-from": L() }],
			"mask-image-b-to-pos": [{ "mask-b-to": L() }],
			"mask-image-b-from-color": [{ "mask-b-from": P() }],
			"mask-image-b-to-color": [{ "mask-b-to": P() }],
			"mask-image-l-from-pos": [{ "mask-l-from": L() }],
			"mask-image-l-to-pos": [{ "mask-l-to": L() }],
			"mask-image-l-from-color": [{ "mask-l-from": P() }],
			"mask-image-l-to-color": [{ "mask-l-to": P() }],
			"mask-image-x-from-pos": [{ "mask-x-from": L() }],
			"mask-image-x-to-pos": [{ "mask-x-to": L() }],
			"mask-image-x-from-color": [{ "mask-x-from": P() }],
			"mask-image-x-to-color": [{ "mask-x-to": P() }],
			"mask-image-y-from-pos": [{ "mask-y-from": L() }],
			"mask-image-y-to-pos": [{ "mask-y-to": L() }],
			"mask-image-y-from-color": [{ "mask-y-from": P() }],
			"mask-image-y-to-color": [{ "mask-y-to": P() }],
			"mask-image-radial": [{ "mask-radial": [Y, J] }],
			"mask-image-radial-from-pos": [{ "mask-radial-from": L() }],
			"mask-image-radial-to-pos": [{ "mask-radial-to": L() }],
			"mask-image-radial-from-color": [{ "mask-radial-from": P() }],
			"mask-image-radial-to-color": [{ "mask-radial-to": P() }],
			"mask-image-radial-shape": [{ "mask-radial": ["circle", "ellipse"] }],
			"mask-image-radial-size": [{ "mask-radial": [{
				closest: ["side", "corner"],
				farthest: ["side", "corner"]
			}] }],
			"mask-image-radial-pos": [{ "mask-radial-at": b() }],
			"mask-image-conic-pos": [{ "mask-conic": [q] }],
			"mask-image-conic-from-pos": [{ "mask-conic-from": L() }],
			"mask-image-conic-to-pos": [{ "mask-conic-to": L() }],
			"mask-image-conic-from-color": [{ "mask-conic-from": P() }],
			"mask-image-conic-to-color": [{ "mask-conic-to": P() }],
			"mask-mode": [{ mask: [
				"alpha",
				"luminance",
				"match"
			] }],
			"mask-origin": [{ "mask-origin": [
				"border",
				"padding",
				"content",
				"fill",
				"stroke",
				"view"
			] }],
			"mask-position": [{ mask: ne() }],
			"mask-repeat": [{ mask: re() }],
			"mask-size": [{ mask: F() }],
			"mask-type": [{ "mask-type": ["alpha", "luminance"] }],
			"mask-image": [{ mask: [
				"none",
				Y,
				J
			] }],
			filter: [{ filter: [
				"",
				"none",
				Y,
				J
			] }],
			blur: [{ blur: ce() }],
			brightness: [{ brightness: [
				q,
				Y,
				J
			] }],
			contrast: [{ contrast: [
				q,
				Y,
				J
			] }],
			"drop-shadow": [{ "drop-shadow": [
				"",
				"none",
				p,
				Pu,
				Ou
			] }],
			"drop-shadow-color": [{ "drop-shadow": P() }],
			grayscale: [{ grayscale: [
				"",
				q,
				Y,
				J
			] }],
			"hue-rotate": [{ "hue-rotate": [
				q,
				Y,
				J
			] }],
			invert: [{ invert: [
				"",
				q,
				Y,
				J
			] }],
			saturate: [{ saturate: [
				q,
				Y,
				J
			] }],
			sepia: [{ sepia: [
				"",
				q,
				Y,
				J
			] }],
			"backdrop-filter": [{ "backdrop-filter": [
				"",
				"none",
				Y,
				J
			] }],
			"backdrop-blur": [{ "backdrop-blur": ce() }],
			"backdrop-brightness": [{ "backdrop-brightness": [
				q,
				Y,
				J
			] }],
			"backdrop-contrast": [{ "backdrop-contrast": [
				q,
				Y,
				J
			] }],
			"backdrop-grayscale": [{ "backdrop-grayscale": [
				"",
				q,
				Y,
				J
			] }],
			"backdrop-hue-rotate": [{ "backdrop-hue-rotate": [
				q,
				Y,
				J
			] }],
			"backdrop-invert": [{ "backdrop-invert": [
				"",
				q,
				Y,
				J
			] }],
			"backdrop-opacity": [{ "backdrop-opacity": [
				q,
				Y,
				J
			] }],
			"backdrop-saturate": [{ "backdrop-saturate": [
				q,
				Y,
				J
			] }],
			"backdrop-sepia": [{ "backdrop-sepia": [
				"",
				q,
				Y,
				J
			] }],
			"border-collapse": [{ border: ["collapse", "separate"] }],
			"border-spacing": [{ "border-spacing": w() }],
			"border-spacing-x": [{ "border-spacing-x": w() }],
			"border-spacing-y": [{ "border-spacing-y": w() }],
			"table-layout": [{ table: ["auto", "fixed"] }],
			caption: [{ caption: ["top", "bottom"] }],
			transition: [{ transition: [
				"",
				"all",
				"colors",
				"opacity",
				"shadow",
				"transform",
				"none",
				Y,
				J
			] }],
			"transition-behavior": [{ transition: ["normal", "discrete"] }],
			duration: [{ duration: [
				q,
				"initial",
				Y,
				J
			] }],
			ease: [{ ease: [
				"linear",
				"initial",
				_,
				Y,
				J
			] }],
			delay: [{ delay: [
				q,
				Y,
				J
			] }],
			animate: [{ animate: [
				"none",
				v,
				Y,
				J
			] }],
			backface: [{ backface: ["hidden", "visible"] }],
			perspective: [{ perspective: [
				h,
				Y,
				J
			] }],
			"perspective-origin": [{ "perspective-origin": x() }],
			rotate: [{ rotate: le() }],
			"rotate-x": [{ "rotate-x": le() }],
			"rotate-y": [{ "rotate-y": le() }],
			"rotate-z": [{ "rotate-z": le() }],
			scale: [{ scale: ue() }],
			"scale-x": [{ "scale-x": ue() }],
			"scale-y": [{ "scale-y": ue() }],
			"scale-z": [{ "scale-z": ue() }],
			"scale-3d": ["scale-3d"],
			skew: [{ skew: de() }],
			"skew-x": [{ "skew-x": de() }],
			"skew-y": [{ "skew-y": de() }],
			transform: [{ transform: [
				Y,
				J,
				"",
				"none",
				"gpu",
				"cpu"
			] }],
			"transform-origin": [{ origin: x() }],
			"transform-style": [{ transform: ["3d", "flat"] }],
			translate: [{ translate: R() }],
			"translate-x": [{ "translate-x": R() }],
			"translate-y": [{ "translate-y": R() }],
			"translate-z": [{ "translate-z": R() }],
			"translate-none": ["translate-none"],
			zoom: [{ zoom: [
				du,
				Y,
				J
			] }],
			accent: [{ accent: P() }],
			appearance: [{ appearance: ["none", "auto"] }],
			"caret-color": [{ caret: P() }],
			"color-scheme": [{ scheme: [
				"normal",
				"dark",
				"light",
				"light-dark",
				"only-dark",
				"only-light"
			] }],
			cursor: [{ cursor: [
				"auto",
				"default",
				"pointer",
				"wait",
				"text",
				"move",
				"help",
				"not-allowed",
				"none",
				"context-menu",
				"progress",
				"cell",
				"crosshair",
				"vertical-text",
				"alias",
				"copy",
				"no-drop",
				"grab",
				"grabbing",
				"all-scroll",
				"col-resize",
				"row-resize",
				"n-resize",
				"e-resize",
				"s-resize",
				"w-resize",
				"ne-resize",
				"nw-resize",
				"se-resize",
				"sw-resize",
				"ew-resize",
				"ns-resize",
				"nesw-resize",
				"nwse-resize",
				"zoom-in",
				"zoom-out",
				Y,
				J
			] }],
			"field-sizing": [{ "field-sizing": ["fixed", "content"] }],
			"pointer-events": [{ "pointer-events": ["auto", "none"] }],
			resize: [{ resize: [
				"none",
				"",
				"y",
				"x"
			] }],
			"scroll-behavior": [{ scroll: ["auto", "smooth"] }],
			"scrollbar-thumb-color": [{ "scrollbar-thumb": P() }],
			"scrollbar-track-color": [{ "scrollbar-track": P() }],
			"scrollbar-gutter": [{ "scrollbar-gutter": [
				"auto",
				"stable",
				"both"
			] }],
			"scrollbar-w": [{ scrollbar: [
				"auto",
				"thin",
				"none"
			] }],
			"scroll-m": [{ "scroll-m": w() }],
			"scroll-mx": [{ "scroll-mx": w() }],
			"scroll-my": [{ "scroll-my": w() }],
			"scroll-ms": [{ "scroll-ms": w() }],
			"scroll-me": [{ "scroll-me": w() }],
			"scroll-mbs": [{ "scroll-mbs": w() }],
			"scroll-mbe": [{ "scroll-mbe": w() }],
			"scroll-mt": [{ "scroll-mt": w() }],
			"scroll-mr": [{ "scroll-mr": w() }],
			"scroll-mb": [{ "scroll-mb": w() }],
			"scroll-ml": [{ "scroll-ml": w() }],
			"scroll-p": [{ "scroll-p": w() }],
			"scroll-px": [{ "scroll-px": w() }],
			"scroll-py": [{ "scroll-py": w() }],
			"scroll-ps": [{ "scroll-ps": w() }],
			"scroll-pe": [{ "scroll-pe": w() }],
			"scroll-pbs": [{ "scroll-pbs": w() }],
			"scroll-pbe": [{ "scroll-pbe": w() }],
			"scroll-pt": [{ "scroll-pt": w() }],
			"scroll-pr": [{ "scroll-pr": w() }],
			"scroll-pb": [{ "scroll-pb": w() }],
			"scroll-pl": [{ "scroll-pl": w() }],
			"snap-align": [{ snap: [
				"start",
				"end",
				"center",
				"align-none"
			] }],
			"snap-stop": [{ snap: ["normal", "always"] }],
			"snap-type": [{ snap: [
				"none",
				"x",
				"y",
				"both"
			] }],
			"snap-strictness": [{ snap: ["mandatory", "proximity"] }],
			touch: [{ touch: [
				"auto",
				"none",
				"manipulation"
			] }],
			"touch-x": [{ "touch-pan": [
				"x",
				"left",
				"right"
			] }],
			"touch-y": [{ "touch-pan": [
				"y",
				"up",
				"down"
			] }],
			"touch-pz": ["touch-pinch-zoom"],
			select: [{ select: [
				"none",
				"text",
				"all",
				"auto"
			] }],
			"will-change": [{ "will-change": [
				"auto",
				"scroll",
				"contents",
				"transform",
				Y,
				J
			] }],
			fill: [{ fill: ["none", ...P()] }],
			"stroke-w": [{ stroke: [
				q,
				ku,
				Su,
				Cu
			] }],
			stroke: [{ stroke: ["none", ...P()] }],
			"forced-color-adjust": [{ "forced-color-adjust": ["auto", "none"] }]
		},
		conflictingClassGroups: {
			"container-named": ["container-type"],
			overflow: ["overflow-x", "overflow-y"],
			overscroll: ["overscroll-x", "overscroll-y"],
			inset: [
				"inset-x",
				"inset-y",
				"inset-bs",
				"inset-be",
				"start",
				"end",
				"top",
				"right",
				"bottom",
				"left"
			],
			"inset-x": ["right", "left"],
			"inset-y": ["top", "bottom"],
			flex: [
				"basis",
				"grow",
				"shrink"
			],
			gap: ["gap-x", "gap-y"],
			p: [
				"px",
				"py",
				"ps",
				"pe",
				"pbs",
				"pbe",
				"pt",
				"pr",
				"pb",
				"pl"
			],
			px: ["pr", "pl"],
			py: ["pt", "pb"],
			m: [
				"mx",
				"my",
				"ms",
				"me",
				"mbs",
				"mbe",
				"mt",
				"mr",
				"mb",
				"ml"
			],
			mx: ["mr", "ml"],
			my: ["mt", "mb"],
			size: ["w", "h"],
			"font-size": ["leading"],
			"fvn-normal": [
				"fvn-ordinal",
				"fvn-slashed-zero",
				"fvn-figure",
				"fvn-spacing",
				"fvn-fraction"
			],
			"fvn-ordinal": ["fvn-normal"],
			"fvn-slashed-zero": ["fvn-normal"],
			"fvn-figure": ["fvn-normal"],
			"fvn-spacing": ["fvn-normal"],
			"fvn-fraction": ["fvn-normal"],
			"line-clamp": ["display", "overflow"],
			rounded: [
				"rounded-s",
				"rounded-e",
				"rounded-t",
				"rounded-r",
				"rounded-b",
				"rounded-l",
				"rounded-ss",
				"rounded-se",
				"rounded-ee",
				"rounded-es",
				"rounded-tl",
				"rounded-tr",
				"rounded-br",
				"rounded-bl"
			],
			"rounded-s": ["rounded-ss", "rounded-es"],
			"rounded-e": ["rounded-se", "rounded-ee"],
			"rounded-t": ["rounded-tl", "rounded-tr"],
			"rounded-r": ["rounded-tr", "rounded-br"],
			"rounded-b": ["rounded-br", "rounded-bl"],
			"rounded-l": ["rounded-tl", "rounded-bl"],
			"border-spacing": ["border-spacing-x", "border-spacing-y"],
			"border-w": [
				"border-w-x",
				"border-w-y",
				"border-w-s",
				"border-w-e",
				"border-w-bs",
				"border-w-be",
				"border-w-t",
				"border-w-r",
				"border-w-b",
				"border-w-l"
			],
			"border-w-x": ["border-w-r", "border-w-l"],
			"border-w-y": ["border-w-t", "border-w-b"],
			"border-color": [
				"border-color-x",
				"border-color-y",
				"border-color-s",
				"border-color-e",
				"border-color-bs",
				"border-color-be",
				"border-color-t",
				"border-color-r",
				"border-color-b",
				"border-color-l"
			],
			"border-color-x": ["border-color-r", "border-color-l"],
			"border-color-y": ["border-color-t", "border-color-b"],
			translate: [
				"translate-x",
				"translate-y",
				"translate-none"
			],
			"translate-none": [
				"translate",
				"translate-x",
				"translate-y",
				"translate-z"
			],
			"scroll-m": [
				"scroll-mx",
				"scroll-my",
				"scroll-ms",
				"scroll-me",
				"scroll-mbs",
				"scroll-mbe",
				"scroll-mt",
				"scroll-mr",
				"scroll-mb",
				"scroll-ml"
			],
			"scroll-mx": ["scroll-mr", "scroll-ml"],
			"scroll-my": ["scroll-mt", "scroll-mb"],
			"scroll-p": [
				"scroll-px",
				"scroll-py",
				"scroll-ps",
				"scroll-pe",
				"scroll-pbs",
				"scroll-pbe",
				"scroll-pt",
				"scroll-pr",
				"scroll-pb",
				"scroll-pl"
			],
			"scroll-px": ["scroll-pr", "scroll-pl"],
			"scroll-py": ["scroll-pt", "scroll-pb"],
			touch: [
				"touch-x",
				"touch-y",
				"touch-pz"
			],
			"touch-x": ["touch"],
			"touch-y": ["touch"],
			"touch-pz": ["touch"]
		},
		conflictingClassGroupModifiers: { "font-size": ["leading"] },
		postfixLookupClassGroups: ["container-type"],
		orderSensitiveModifiers: [
			"*",
			"**",
			"after",
			"backdrop",
			"before",
			"details-content",
			"file",
			"first-letter",
			"first-line",
			"marker",
			"placeholder",
			"selection"
		]
	};
});
//#endregion
//#region src/lib/utils.ts
function X(...e) {
	return Ku(o(e));
}
//#endregion
//#region src/components/ui/button.tsx
var qu = l("inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[5px] text-xs font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
			outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-7 px-2.5 py-1 has-[>svg]:px-2",
			xs: "h-6 gap-1 rounded-[5px] px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
			sm: "h-7 gap-1 rounded-[5px] px-2.5 has-[>svg]:px-2",
			lg: "h-8 rounded-[5px] px-3.5 has-[>svg]:px-3",
			icon: "size-7",
			"icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
			"icon-sm": "size-8",
			"icon-lg": "size-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Ju({ className: e, variant: t = "default", size: n = "default", asChild: r = !1, ...i }) {
	return /* @__PURE__ */ (0, v.jsx)(r ? T : "button", {
		"data-slot": "button",
		"data-variant": t,
		"data-size": n,
		className: X(qu({
			variant: t,
			size: n,
			className: e
		})),
		...i
	});
}
//#endregion
//#region node_modules/.pnpm/lucide-react@1.26.0_react@19.2.8/node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.mjs
var Yu = (...e) => e.filter((e, t, n) => !!e && e.trim() !== "" && n.indexOf(e) === t).join(" ").trim(), Xu = (e) => e.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase(), Zu = (e) => e.replace(/^([A-Z])|[\s-_]+(\w)/g, (e, t, n) => n ? n.toUpperCase() : t.toLowerCase()), Qu = (e) => {
	let t = Zu(e);
	return t.charAt(0).toUpperCase() + t.slice(1);
}, $u = {
	xmlns: "http://www.w3.org/2000/svg",
	width: 24,
	height: 24,
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: 2,
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, ed = (e) => {
	for (let t in e) if (t.startsWith("aria-") || t === "role" || t === "title") return !0;
	return !1;
}, td = (0, i.createContext)({}), nd = () => (0, i.useContext)(td), rd = (0, i.forwardRef)(({ color: e, size: t, strokeWidth: n, absoluteStrokeWidth: r, className: a = "", children: o, iconNode: s, ...c }, l) => {
	let { size: u = 24, strokeWidth: d = 2, absoluteStrokeWidth: f = !1, color: p = "currentColor", className: m = "" } = nd() ?? {}, h = r ?? f ? Number(n ?? d) * 24 / Number(t ?? u) : n ?? d;
	return (0, i.createElement)("svg", {
		ref: l,
		...$u,
		width: t ?? u ?? $u.width,
		height: t ?? u ?? $u.height,
		stroke: e ?? p,
		strokeWidth: h,
		className: Yu("lucide", m, a),
		...!o && !ed(c) && { "aria-hidden": "true" },
		...c
	}, [...s.map(([e, t]) => (0, i.createElement)(e, t)), ...Array.isArray(o) ? o : [o]]);
}), id = (e, t) => {
	let n = (0, i.forwardRef)(({ className: n, ...r }, a) => (0, i.createElement)(rd, {
		ref: a,
		iconNode: t,
		className: Yu(`lucide-${Xu(Qu(e))}`, `lucide-${e}`, n),
		...r
	}));
	return n.displayName = Qu(e), n;
}, ad = id("arrow-left", [["path", {
	d: "m12 19-7-7 7-7",
	key: "1l729n"
}], ["path", {
	d: "M19 12H5",
	key: "x3x0zl"
}]]), od = id("check", [["path", {
	d: "M20 6 9 17l-5-5",
	key: "1gmf2c"
}]]), sd = id("circle-check", [["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}], ["path", {
	d: "m9 12 2 2 4-4",
	key: "dzmm74"
}]]), cd = id("circle", [["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}]]), ld = id("copy-plus", [
	["line", {
		x1: "15",
		x2: "15",
		y1: "12",
		y2: "18",
		key: "1p7wdc"
	}],
	["line", {
		x1: "12",
		x2: "18",
		y1: "15",
		y2: "15",
		key: "1nscbv"
	}],
	["rect", {
		width: "14",
		height: "14",
		x: "8",
		y: "8",
		rx: "2",
		ry: "2",
		key: "17jyea"
	}],
	["path", {
		d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
		key: "zix9uf"
	}]
]), ud = id("copy", [["rect", {
	width: "14",
	height: "14",
	x: "8",
	y: "8",
	rx: "2",
	ry: "2",
	key: "17jyea"
}], ["path", {
	d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
	key: "zix9uf"
}]]), dd = id("database", [
	["ellipse", {
		cx: "12",
		cy: "5",
		rx: "9",
		ry: "3",
		key: "msslwz"
	}],
	["path", {
		d: "M3 5V19A9 3 0 0 0 21 19V5",
		key: "1wlel7"
	}],
	["path", {
		d: "M3 12A9 3 0 0 0 21 12",
		key: "mv7ke4"
	}]
]), fd = id("ellipsis", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "1",
		key: "41hilf"
	}],
	["circle", {
		cx: "19",
		cy: "12",
		r: "1",
		key: "1wjl8i"
	}],
	["circle", {
		cx: "5",
		cy: "12",
		r: "1",
		key: "1pcz8c"
	}]
]), pd = id("folder", [["path", {
	d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z",
	key: "1kt360"
}]]), md = id("gauge", [["path", {
	d: "m12 14 4-4",
	key: "9kzdfg"
}], ["path", {
	d: "M3.34 19a10 10 0 1 1 17.32 0",
	key: "19p75a"
}]]), hd = id("grip-vertical", [
	["circle", {
		cx: "9",
		cy: "12",
		r: "1",
		key: "1vctgf"
	}],
	["circle", {
		cx: "9",
		cy: "5",
		r: "1",
		key: "hp0tcf"
	}],
	["circle", {
		cx: "9",
		cy: "19",
		r: "1",
		key: "fkjjf6"
	}],
	["circle", {
		cx: "15",
		cy: "12",
		r: "1",
		key: "1tmaij"
	}],
	["circle", {
		cx: "15",
		cy: "5",
		r: "1",
		key: "19l28e"
	}],
	["circle", {
		cx: "15",
		cy: "19",
		r: "1",
		key: "f4zoj3"
	}]
]), gd = id("info", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "M12 16v-4",
		key: "1dtifu"
	}],
	["path", {
		d: "M12 8h.01",
		key: "e9boi3"
	}]
]), _d = id("life-buoy", [
	["circle", {
		cx: "12",
		cy: "12",
		r: "10",
		key: "1mglay"
	}],
	["path", {
		d: "m4.93 4.93 4.24 4.24",
		key: "1ymg45"
	}],
	["path", {
		d: "m14.83 9.17 4.24-4.24",
		key: "1cb5xl"
	}],
	["path", {
		d: "m14.83 14.83 4.24 4.24",
		key: "q42g0n"
	}],
	["path", {
		d: "m9.17 14.83-4.24 4.24",
		key: "bqpfvv"
	}],
	["circle", {
		cx: "12",
		cy: "12",
		r: "4",
		key: "4exip2"
	}]
]), vd = id("loader-circle", [["path", {
	d: "M21 12a9 9 0 1 1-6.219-8.56",
	key: "13zald"
}]]), yd = id("map", [
	["path", {
		d: "M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z",
		key: "169xi5"
	}],
	["path", {
		d: "M15 5.764v15",
		key: "1pn4in"
	}],
	["path", {
		d: "M9 3.236v15",
		key: "1uimfh"
	}]
]), bd = id("message-circle", [["path", {
	d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
	key: "1sd12s"
}]]), xd = id("octagon-x", [
	["path", {
		d: "m15 9-6 6",
		key: "1uzhvr"
	}],
	["path", {
		d: "M2.586 16.726A2 2 0 0 1 2 15.312V8.688a2 2 0 0 1 .586-1.414l4.688-4.688A2 2 0 0 1 8.688 2h6.624a2 2 0 0 1 1.414.586l4.688 4.688A2 2 0 0 1 22 8.688v6.624a2 2 0 0 1-.586 1.414l-4.688 4.688a2 2 0 0 1-1.414.586H8.688a2 2 0 0 1-1.414-.586z",
		key: "2d38gg"
	}],
	["path", {
		d: "m9 9 6 6",
		key: "z0biqf"
	}]
]), Sd = id("panel-left", [["rect", {
	width: "18",
	height: "18",
	x: "3",
	y: "3",
	rx: "2",
	key: "afitv7"
}], ["path", {
	d: "M9 3v18",
	key: "fh3hqa"
}]]), Cd = id("pencil", [["path", {
	d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
	key: "1a8usu"
}], ["path", {
	d: "m15 5 4 4",
	key: "1mk7zo"
}]]), wd = id("search", [["path", {
	d: "m21 21-4.34-4.34",
	key: "14j7rj"
}], ["circle", {
	cx: "11",
	cy: "11",
	r: "8",
	key: "4ej97u"
}]]), Td = id("settings", [["path", {
	d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
	key: "1i5ecw"
}], ["circle", {
	cx: "12",
	cy: "12",
	r: "3",
	key: "1v7zrd"
}]]), Ed = id("square-pen", [["path", {
	d: "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7",
	key: "1m0v6g"
}], ["path", {
	d: "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z",
	key: "ohrbg2"
}]]), Dd = id("trash-2", [
	["path", {
		d: "M10 11v6",
		key: "nco0om"
	}],
	["path", {
		d: "M14 11v6",
		key: "outv1u"
	}],
	["path", {
		d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
		key: "miytrc"
	}],
	["path", {
		d: "M3 6h18",
		key: "d0wm0j"
	}],
	["path", {
		d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
		key: "e791ji"
	}]
]), Od = id("triangle-alert", [
	["path", {
		d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
		key: "wmoenq"
	}],
	["path", {
		d: "M12 9v4",
		key: "juzpu7"
	}],
	["path", {
		d: "M12 17h.01",
		key: "p32p05"
	}]
]), kd = id("x", [["path", {
	d: "M18 6 6 18",
	key: "1bl5f8"
}], ["path", {
	d: "m6 6 12 12",
	key: "d8bk6v"
}]]), Ad = /* @__PURE__ */ e({
	ShadowRootProvider: () => Nd,
	usePortalContainer: () => Fd,
	useShadowRoot: () => Pd
}), jd = (0, i.createContext)(null);
function Md() {
	if (typeof document > "u") return null;
	let e = document.getElementById("mapsvg-admin-react-root")?.shadowRoot, t = e?.querySelector("#mapsvg-admin-react-portal");
	return !e || !t ? null : {
		shadowRoot: e,
		portalContainer: t
	};
}
function Nd({ shadowRoot: e, portalContainer: t, children: n }) {
	return /* @__PURE__ */ (0, v.jsx)(jd.Provider, {
		value: {
			shadowRoot: e,
			portalContainer: t
		},
		children: n
	});
}
function Pd() {
	let e = (0, i.useContext)(jd) ?? Md();
	if (!e) throw Error("useShadowRoot must be used within ShadowRootProvider");
	return e;
}
function Fd() {
	return (0, i.useContext)(jd)?.portalContainer ?? Md()?.portalContainer;
}
//#endregion
//#region src/components/ui/dialog.tsx
function Id({ ...e }) {
	return /* @__PURE__ */ (0, v.jsx)(yr, {
		"data-slot": "dialog",
		...e
	});
}
function Ld({ ...e }) {
	return /* @__PURE__ */ (0, v.jsx)(xr, {
		"data-slot": "dialog-trigger",
		...e
	});
}
function Rd({ ...e }) {
	return /* @__PURE__ */ (0, v.jsx)(Tr, {
		"data-slot": "dialog-portal",
		...e
	});
}
function zd({ ...e }) {
	return /* @__PURE__ */ (0, v.jsx)(Rr, {
		"data-slot": "dialog-close",
		...e
	});
}
function Bd({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)(Dr, {
		"data-slot": "dialog-overlay",
		className: X("fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	});
}
function Vd({ className: e, children: t, showCloseButton: n = !0, ...r }) {
	return /* @__PURE__ */ (0, v.jsxs)(Rd, {
		"data-slot": "dialog-portal",
		container: Fd(),
		children: [/* @__PURE__ */ (0, v.jsx)(Bd, {}), /* @__PURE__ */ (0, v.jsxs)(jr, {
			"data-slot": "dialog-content",
			className: X("fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg", e),
			...r,
			children: [t, n && /* @__PURE__ */ (0, v.jsxs)(Rr, {
				"data-slot": "dialog-close",
				className: "absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				children: [/* @__PURE__ */ (0, v.jsx)(kd, {}), /* @__PURE__ */ (0, v.jsx)("span", {
					className: "sr-only",
					children: "Close"
				})]
			})]
		})]
	});
}
function Hd({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "dialog-header",
		className: X("flex flex-col gap-2 text-center sm:text-left", e),
		...t
	});
}
function Ud({ className: e, showCloseButton: t = !1, children: n, ...r }) {
	return /* @__PURE__ */ (0, v.jsxs)("div", {
		"data-slot": "dialog-footer",
		className: X("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", e),
		...r,
		children: [n, t && /* @__PURE__ */ (0, v.jsx)(Rr, {
			asChild: !0,
			children: /* @__PURE__ */ (0, v.jsx)(Ju, {
				variant: "outline",
				children: "Close"
			})
		})]
	});
}
function Wd({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)(Fr, {
		"data-slot": "dialog-title",
		className: X("text-lg leading-none font-semibold", e),
		...t
	});
}
function Gd({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)(Ir, {
		"data-slot": "dialog-description",
		className: X("text-sm text-muted-foreground", e),
		...t
	});
}
//#endregion
//#region src/lib/layout-migration.ts
var Kd = [
	"mapsvg-sidebar-left",
	"mapsvg-sidebar-right",
	"mapsvg-sidebar",
	"mapsvg-top-container",
	"mapsvg-header",
	"mapsvg-footer",
	"mapsvg-wrap"
];
function qd(e) {
	if (typeof e != "string") return [];
	let t = e.replace(/\/\*[\s\S]*?\*\//g, "");
	return Kd.filter((e) => RegExp(`(?:^|[^-\\w])${e}(?![-\\w])`).test(t));
}
//#endregion
//#region src/lib/layout-grid.ts
var Jd = /^[A-Z][A-Za-z0-9]*$/;
function Yd(e, t, n) {
	let r = (e.normalize("NFKD").replace(/\p{M}/gu, "").match(/[A-Za-z0-9]+/g) ?? []).map((e) => e[0].toUpperCase() + (/^[A-Z]+$/.test(e) ? e.slice(1).toLowerCase() : e.slice(1))).join("") || "Slot";
	/^[A-Z]/.test(r) || (r = `Slot${r}`), r = r.slice(0, 64);
	let i = new Set(t);
	n?.excludeId && i.delete(n.excludeId), i.add("Map");
	let a = r, o = 2;
	for (; i.has(a);) {
		let e = String(o++);
		a = r.slice(0, 64 - e.length) + e;
	}
	return a;
}
var Xd = [
	"desktop",
	"tablet",
	"mobile"
], Zd = [
	{
		id: "Header",
		x: 0,
		y: 0,
		w: 12,
		h: 1
	},
	{
		id: "LeftSidebar",
		x: 0,
		y: 1,
		w: 3,
		h: 6
	},
	{
		id: "Main",
		x: 3,
		y: 1,
		w: 6,
		h: 6
	},
	{
		id: "RightSidebar",
		x: 9,
		y: 1,
		w: 3,
		h: 6
	},
	{
		id: "Footer",
		x: 0,
		y: 7,
		w: 12,
		h: 1
	}
], Qd = [
	{
		id: "Header",
		x: 0,
		y: 0,
		w: 12,
		h: 1
	},
	{
		id: "LeftSidebar",
		x: 0,
		y: 1,
		w: 4,
		h: 5
	},
	{
		id: "Main",
		x: 4,
		y: 1,
		w: 8,
		h: 5
	},
	{
		id: "RightSidebar",
		x: 0,
		y: 6,
		w: 12,
		h: 2
	},
	{
		id: "Footer",
		x: 0,
		y: 8,
		w: 12,
		h: 1
	}
], $d = [
	{
		id: "Header",
		x: 0,
		y: 0,
		w: 12,
		h: 1
	},
	{
		id: "Main",
		x: 0,
		y: 1,
		w: 12,
		h: 4
	},
	{
		id: "LeftSidebar",
		x: 0,
		y: 5,
		w: 12,
		h: 2
	},
	{
		id: "RightSidebar",
		x: 0,
		y: 7,
		w: 12,
		h: 2
	},
	{
		id: "Footer",
		x: 0,
		y: 9,
		w: 12,
		h: 1
	}
];
function ef() {
	return {
		desktop: structuredClone(Zd),
		tablet: structuredClone(Qd),
		mobile: structuredClone($d)
	};
}
function tf() {
	return {
		column: 12,
		gap: 0,
		cellHeight: 64,
		grids: ef()
	};
}
function nf(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function rf(e) {
	if (!nf(e)) return null;
	let t = typeof e.id == "string" ? e.id : "";
	if (t === "Map" && (t = "Main"), !Jd.test(t)) return null;
	let n = Number(e.x), r = Number(e.y), i = Number(e.w), a = Number(e.h);
	return [
		n,
		r,
		i,
		a
	].every((e) => Number.isFinite(e)) ? {
		id: t,
		x: Math.max(0, Math.floor(n)),
		y: Math.max(0, Math.floor(r)),
		w: Math.max(1, Math.floor(i)),
		h: Math.max(1, Math.floor(a))
	} : null;
}
function af(e, t) {
	if (!Array.isArray(e)) return structuredClone(t);
	let n = [], r = /* @__PURE__ */ new Set();
	for (let t of e) {
		let e = rf(t);
		!e || r.has(e.id) || (r.add(e.id), n.push(e));
	}
	return n;
}
function of(e) {
	let t = tf();
	if (!nf(e)) return t;
	let n = nf(e.grids) ? e.grids : {}, r = ef();
	return {
		column: typeof e.column == "number" && e.column > 0 ? Math.floor(e.column) : t.column,
		gap: 0,
		cellHeight: (() => {
			let n = typeof e.cellHeight == "number" && e.cellHeight > 0 ? e.cellHeight : t.cellHeight;
			return Math.max(n, 64);
		})(),
		grids: {
			desktop: af(n.desktop, r.desktop),
			tablet: af(n.tablet, r.tablet),
			mobile: af(n.mobile, r.mobile)
		},
		...e.mountMode === "tree" ? { mountMode: "tree" } : {},
		...Array.isArray(e.deletedNodeTypes) ? { deletedNodeTypes: [...new Set(e.deletedNodeTypes.filter((e) => e === "map" || e === "mobileToolbar"))] } : {}
	};
}
//#endregion
//#region node_modules/.pnpm/zustand@5.0.14_@types+react@19.2.17_immer@11.1.18_react@19.2.8_use-sync-external-store@1.6.0_react@19.2.8_/node_modules/zustand/esm/vanilla.mjs
var sf = (e) => {
	let t, n = /* @__PURE__ */ new Set(), r = (e, r) => {
		let i = typeof e == "function" ? e(t) : e;
		if (!Object.is(i, t)) {
			let e = t;
			t = r ?? (typeof i != "object" || !i) ? i : Object.assign({}, t, i), n.forEach((n) => n(t, e));
		}
	}, i = () => t, a = {
		setState: r,
		getState: i,
		getInitialState: () => o,
		subscribe: (e) => (n.add(e), () => n.delete(e))
	}, o = t = e(r, i, a);
	return a;
}, cf = ((e) => e ? sf(e) : sf), lf = (e) => e;
function uf(e, t = lf) {
	let n = i.default.useSyncExternalStore(e.subscribe, i.default.useCallback(() => t(e.getState()), [e, t]), i.default.useCallback(() => t(e.getInitialState()), [e, t]));
	return i.default.useDebugValue(n), n;
}
var df = (e) => {
	let t = cf(e), n = (e) => uf(t, e);
	return Object.assign(n, t), n;
}, ff = ((e) => e ? df(e) : df);
//#endregion
//#region node_modules/.pnpm/zustand@5.0.14_@types+react@19.2.17_immer@11.1.18_react@19.2.8_use-sync-external-store@1.6.0_react@19.2.8_/node_modules/zustand/esm/middleware.mjs
function pf(e, t) {
	let n;
	try {
		n = e();
	} catch {
		return;
	}
	return {
		getItem: (e) => {
			let r = (e) => e === null ? null : JSON.parse(e, t?.reviver), i = n.getItem(e) ?? null;
			return i instanceof Promise ? i.then(r) : r(i);
		},
		setItem: (e, r) => n.setItem(e, JSON.stringify(r, t?.replacer)),
		removeItem: (e) => n.removeItem(e)
	};
}
var mf = (e) => (t) => {
	try {
		let n = e(t);
		return n instanceof Promise ? n : {
			then(e) {
				return mf(e)(n);
			},
			catch(e) {
				return this;
			}
		};
	} catch (e) {
		return {
			then(e) {
				return this;
			},
			catch(t) {
				return mf(t)(e);
			}
		};
	}
}, hf = (e, t) => (n, r, i) => {
	let a = {
		storage: pf(() => window.localStorage),
		partialize: (e) => e,
		version: 0,
		merge: (e, t) => ({
			...t,
			...e
		}),
		...t
	}, o = !1, s = 0, c = /* @__PURE__ */ new Set(), l = /* @__PURE__ */ new Set(), u = a.storage;
	if (!u) return e((...e) => {
		console.warn(`[zustand persist middleware] Unable to update item '${a.name}', the given storage is currently unavailable.`), n(...e);
	}, r, i);
	let d = () => {
		let e = a.partialize({ ...r() });
		return u.setItem(a.name, {
			state: e,
			version: a.version
		});
	}, f = i.setState;
	i.setState = (e, t) => (f(e, t), d());
	let p = e((...e) => (n(...e), d()), r, i);
	i.getInitialState = () => p;
	let m, h = () => {
		if (!u) return;
		let e = ++s;
		o = !1, c.forEach((e) => e(r() ?? p));
		let t = a.onRehydrateStorage?.call(a, r() ?? p) || void 0;
		return mf(u.getItem.bind(u))(a.name).then((e) => {
			if (e) if (typeof e.version == "number" && e.version !== a.version) {
				if (a.migrate) {
					let t = a.migrate(e.state, e.version);
					return t instanceof Promise ? t.then((e) => [!0, e]) : [!0, t];
				}
				console.error("State loaded from storage couldn't be migrated since no migrate function was provided");
			} else return [!1, e.state];
			return [!1, void 0];
		}).then((t) => {
			if (e !== s) return;
			let [i, o] = t;
			if (m = a.merge(o, r() ?? p), n(m, !0), i) return d();
		}).then(() => {
			e === s && (t?.(r(), void 0), m = r(), o = !0, l.forEach((e) => e(m)));
		}).catch((n) => {
			e === s && t?.(void 0, n);
		});
	};
	return i.persist = {
		setOptions: (e) => {
			a = {
				...a,
				...e
			}, e.storage && (u = e.storage);
		},
		clearStorage: () => {
			u?.removeItem(a.name);
		},
		getOptions: () => a,
		rehydrate: () => h(),
		hasHydrated: () => o,
		onHydrate: (e) => (c.add(e), () => {
			c.delete(e);
		}),
		onFinishHydration: (e) => (l.add(e), () => {
			l.delete(e);
		})
	}, a.skipHydration || h(), m || p;
};
//#endregion
//#region src/lib/workspace-store.ts
function gf(e) {
	return e?.kind === "map" || e?.kind === "chat" ? e.mapId : null;
}
function _f(e) {
	return e?.kind === "database" || e?.kind === "db-table" || e?.kind === "db-query";
}
function vf(e) {
	return e?.kind === "database" ? e.selection : _f(e) ? e : null;
}
function yf(e, t) {
	let n = gf(e);
	return n && n === gf(t) ? !0 : e.kind === "chat" && t.kind === "chat" && e.chatId != null && e.chatId === t.chatId || bf(e) === bf(t);
}
function bf(e) {
	return e.kind === "map" ? `map:${e.mapId}` : e.kind === "chat" ? `chat:${e.sessionId}` : e.kind === "database" ? `database:${e.sessionId}` : e.kind === "db-query" ? `db-query:${e.queryId}` : `db-table:${e.schemaId}`;
}
function xf() {
	if (typeof window > "u") return "mapsvg-react-workspace-v2:ssr";
	let e = window.mapsvgReactAdminParams?.user?.id, t = window.mapsvgReactAdminParams?.homeUrl ?? window.location.origin;
	return `mapsvg-react-workspace-v2:${encodeURIComponent(t)}:${e ?? "anonymous"}`;
}
function Sf() {
	return Date.now();
}
function Cf(e) {
	return {
		tabs: e.tabs,
		activeTabId: e.activeTabId,
		mapSessions: e.mapSessions,
		mapDrafts: e.mapDrafts,
		uiTheme: e.uiTheme,
		updatedAt: e.updatedAt
	};
}
function wf() {
	return Cf(Z.getState());
}
var Z = ff()(hf((e, t) => ({
	tabs: [],
	activeTabId: null,
	mapSessions: {},
	mapDrafts: {},
	mapBaselines: {},
	mapServerBaselines: {},
	mapTitleBaselines: {},
	uiTheme: "compact",
	updatedAt: 0,
	setUiTheme: (t) => {
		e({
			uiTheme: t,
			updatedAt: Sf()
		});
	},
	openResource: (n, r) => {
		let i = bf(n), a = t().tabs.find((e) => yf(e.resource, n));
		return a ? (e({
			activeTabId: a.id,
			updatedAt: Sf()
		}), a.id) : (e((e) => ({
			tabs: [...e.tabs, {
				id: i,
				resource: n,
				title: r
			}],
			activeTabId: i,
			updatedAt: Sf()
		})), i);
	},
	activateTab: (n) => {
		(n === null || t().tabs.some((e) => e.id === n)) && e({
			activeTabId: n,
			updatedAt: Sf()
		});
	},
	updateDatabaseTab: (t, n, r) => {
		e((e) => ({
			tabs: e.tabs.map((e) => e.id === t && _f(e.resource) ? {
				...e,
				title: r,
				resource: {
					kind: "database",
					sessionId: e.resource.kind === "database" ? e.resource.sessionId : crypto.randomUUID(),
					selection: n
				}
			} : e),
			updatedAt: Sf()
		}));
	},
	attachMapTab: (t, n, r) => e((e) => ({
		tabs: e.tabs.map((e) => e.id === t ? {
			...e,
			title: r,
			resource: {
				kind: "map",
				mapId: n
			}
		} : e),
		updatedAt: Sf()
	})),
	updateChatTab: (t, n) => {
		e((e) => {
			let r = e.tabs.find((e) => e.id === t && e.resource.kind === "chat") ?? e.tabs.find((e) => e.resource.kind === "chat" && e.resource.chatId === n.id);
			if (!r || r.resource.kind !== "chat") return e;
			let i = r.resource, a = e.tabs.filter((e) => e.id !== r.id && (n.mapId && gf(e.resource) === n.mapId || e.resource.kind === "chat" && e.resource.chatId === n.id)), o = e.tabs.filter((e) => !a.includes(e)).map((e) => e.id === r.id ? {
				...e,
				title: n.title,
				resource: {
					...i,
					kind: "chat",
					chatId: n.id,
					mapId: n.mapId
				}
			} : e);
			return JSON.stringify(o) === JSON.stringify(e.tabs) ? e : {
				tabs: o,
				activeTabId: a.some((t) => t.id === e.activeTabId) ? r.id : e.activeTabId,
				updatedAt: Sf()
			};
		});
	},
	closeTab: (t) => {
		e((e) => {
			let n = e.tabs.findIndex((e) => e.id === t);
			if (n < 0) return e;
			let r = e.tabs.filter((e) => e.id !== t);
			return e.activeTabId === t ? {
				tabs: r,
				activeTabId: (r[Math.min(n, r.length - 1)] ?? null)?.id ?? null,
				updatedAt: Sf()
			} : {
				tabs: r,
				updatedAt: Sf()
			};
		});
	},
	closeResource: (e) => {
		for (let n of t().tabs.filter((t) => yf(t.resource, e))) t().closeTab(n.id);
	},
	renameResource: (t, n) => {
		e((e) => ({
			tabs: e.tabs.map((e) => yf(e.resource, t) ? {
				...e,
				title: n
			} : e),
			updatedAt: Sf()
		}));
	},
	patchMapSession: (t, n) => {
		let r = String(t);
		e((e) => ({
			mapSessions: {
				...e.mapSessions,
				[r]: {
					...e.mapSessions[r],
					...n,
					updatedAt: Sf()
				}
			},
			updatedAt: Sf()
		}));
	},
	setMapScroll: (t, n, r) => {
		let i = String(t);
		e((e) => {
			let t = e.mapSessions[i] ?? {};
			return {
				mapSessions: {
					...e.mapSessions,
					[i]: {
						...t,
						scrollPositions: {
							...t.scrollPositions ?? {},
							[n]: r
						},
						updatedAt: Sf()
					}
				},
				updatedAt: Sf()
			};
		});
	},
	setMapBaseline: (t, n) => {
		e((e) => ({ mapBaselines: {
			...e.mapBaselines,
			[String(t)]: n
		} }));
	},
	setMapServerBaseline: (t, n) => {
		e((e) => ({ mapServerBaselines: {
			...e.mapServerBaselines,
			[String(t)]: n
		} }));
	},
	setMapTitleBaseline: (t, n) => {
		e((e) => ({ mapTitleBaselines: {
			...e.mapTitleBaselines,
			[String(t)]: n
		} }));
	},
	setMapDraft: (t, n) => {
		e((e) => ({
			mapDrafts: {
				...e.mapDrafts,
				[String(t)]: n
			},
			updatedAt: Sf()
		}));
	},
	clearMapDraft: (t) => {
		let n = String(t);
		e((e) => {
			if (!e.mapDrafts[n]) return e;
			let t = { ...e.mapDrafts };
			return delete t[n], {
				mapDrafts: t,
				updatedAt: Sf()
			};
		});
	},
	setMapDraftConflict: (t, n) => {
		let r = String(t);
		e((e) => {
			let t = e.mapDrafts[r];
			return !t || !!t.conflicted === n ? e : {
				mapDrafts: {
					...e.mapDrafts,
					[r]: {
						...t,
						conflicted: n
					}
				},
				updatedAt: Sf()
			};
		});
	},
	clearMapWorkspaceState: (t) => {
		let n = String(t);
		e((e) => {
			let t = { ...e.mapSessions }, r = { ...e.mapDrafts }, i = { ...e.mapBaselines }, a = { ...e.mapServerBaselines }, o = { ...e.mapTitleBaselines };
			return delete t[n], delete r[n], delete i[n], delete a[n], delete o[n], {
				mapSessions: t,
				mapDrafts: r,
				mapBaselines: i,
				mapServerBaselines: a,
				mapTitleBaselines: o,
				updatedAt: Sf()
			};
		});
	},
	hydrateLocalDrafts: (t) => {
		e((e) => {
			let n = { ...e.mapDrafts }, r = e.updatedAt;
			for (let [e, i] of Object.entries(t)) {
				let t = n[e];
				(!t || i.updatedAt > t.updatedAt) && (n[e] = i), r = Math.max(r, i.updatedAt);
			}
			return {
				mapDrafts: n,
				updatedAt: r
			};
		});
	},
	hydrateRemote: (n) => {
		if (!n) return;
		let r = t(), i = n.mapDrafts ?? {}, a = { ...r.mapDrafts }, o = !1;
		for (let [e, t] of Object.entries(i)) {
			let n = r.mapDrafts[e];
			(!n || t.updatedAt > n.updatedAt) && (a[e] = t, o = !0);
		}
		if (n.updatedAt > r.updatedAt) {
			e({
				tabs: Array.isArray(n.tabs) ? n.tabs : [],
				activeTabId: n.activeTabId ?? null,
				mapSessions: n.mapSessions ?? {},
				mapDrafts: a,
				uiTheme: n.uiTheme === "default" || n.uiTheme === "compact" ? n.uiTheme : r.uiTheme,
				updatedAt: n.updatedAt
			});
			return;
		}
		o && e({ mapDrafts: a });
	}
}), {
	name: xf(),
	storage: pf(() => localStorage),
	partialize: (e) => ({
		...Cf(e),
		mapDrafts: {}
	}),
	version: 3
}));
//#endregion
//#region src/lib/app-page-label.ts
function Tf(e) {
	let t = e?.id.match(/^scene-(\d+)$/)?.[1];
	return t && (!e?.title || e.title === `Scene ${t}`) ? `Page ${t}` : e?.title || e?.id || "Page";
}
//#endregion
//#region src/lib/app-page-context.ts
function Ef(e, t) {
	let n = Array.isArray(e.scenes) ? e.scenes : [], r = Array.isArray(e.nodes) ? e.nodes : [], i = n.find((e) => e.id === t);
	if (!i) return /* @__PURE__ */ new Set();
	if (n.length === 1) return new Set(r.map((e) => e.id));
	let a = new Map(r.map((e) => [e.id, e])), o = [i.rootNodeId, i.bodyNodeId].filter((e) => !!e), s = /* @__PURE__ */ new Set();
	for (; o.length;) {
		let e = o.pop();
		s.has(e) || !a.has(e) || (s.add(e), o.push(...a.get(e)?.children ?? []));
	}
	return s;
}
function Df(e, t, n) {
	return Ef(e, t).has(n) ? !(Array.isArray(e.scenes) ? e.scenes : []).some((r) => r.id !== t && Ef(e, r.id).has(n)) : !1;
}
//#endregion
//#region src/lib/single-page-map.ts
function Of(e) {
	let t = Array.from(e.nodes ?? []), n = Array.from(e.scenes ?? []), r = new Map(t.map((e) => [e.id, e]));
	return new Map((n.length ? n : [{ id: "default" }]).map((e) => {
		let i = n.length > 1 ? [e.rootNodeId, e.bodyNodeId] : t.filter((e) => e.type === "slot" || e.type === "body").map((e) => e.id), a = /* @__PURE__ */ new Set(), o = 0;
		for (; i.length;) {
			let e = i.pop();
			if (!e || a.has(e)) continue;
			a.add(e);
			let t = r.get(e);
			t && (t.type === "map" && o++, i.push(...t.children ?? []));
		}
		return [e.id, o];
	}));
}
function kf(e, t) {
	let n = Of(e);
	return [...Of(t)].some(([e, t]) => t > 1 && t > (n.get(e) ?? 0));
}
function Af(e, t, n) {
	let r = "new-map";
	for (; e.some((e) => e.id === r);) r += "-new";
	let i = e.map((e) => e.id === n ? {
		...e,
		children: [...e.children ?? [], r]
	} : e);
	return i.push({
		id: r,
		type: "map",
		children: []
	}), !kf({
		nodes: e,
		scenes: t
	}, {
		nodes: i,
		scenes: t
	});
}
//#endregion
//#region ../mapsvg/Map/surfaceColors.ts
var jf = /* @__PURE__ */ new Set([
	"background",
	"leftSidebar",
	"rightSidebar",
	"header",
	"footer",
	"detailsView",
	"directory",
	"directorySearch",
	"modalFilters",
	"popover",
	"tooltip"
]);
function Mf(e, t) {
	let n = e && typeof e == "object" ? e : {}, r = t && typeof t == "object" ? t : {}, i = [.../* @__PURE__ */ new Set([...Object.keys(n), ...Object.keys(r)])].filter((e) => JSON.stringify(n[e]) !== JSON.stringify(r[e]));
	return i.length > 0 && i.every((e) => jf.has(e));
}
//#endregion
//#region src/lib/app-state-graph.ts
var Nf = "root", Pf = (e) => `scene:${e}`, Ff = (e) => JSON.parse(JSON.stringify(e)), If = (e, t) => JSON.stringify(e) === JSON.stringify(t), Lf = (e) => typeof e == "object" && !!e && !Array.isArray(e), Rf = (e) => ![
	"__proto__",
	"prototype",
	"constructor"
].includes(e), zf = (e) => `@${e}`;
function Bf(e) {
	return (Array.isArray(e.scenes) ? e.scenes : []).filter((e) => Lf(e) && typeof e.id == "string" && typeof e.title == "string");
}
function Vf(e, t, n = []) {
	if (If(e, t)) return [];
	if (n[0] === "nodes" && n.length === 3 && n[2] === "settings" && (Array.isArray(e) && !e.length && Lf(t) && (e = {}), Array.isArray(t) && !t.length && Lf(e) && (t = {})), ["nodes", "scenes"].includes(n[0]) && n.length === 1 && Array.isArray(e) && Array.isArray(t)) {
		let r = [], i = new Map(e.filter(Lf).map((e) => [String(e.id), e])), a = new Map(t.filter(Lf).map((e) => [String(e.id), e]));
		for (let e of /* @__PURE__ */ new Set([...i.keys(), ...a.keys()])) r.push(...Vf(i.get(e), a.get(e), [...n, zf(e)]));
		return r;
	}
	return Lf(e) && Lf(t) ? [.../* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(t)])].filter(Rf).flatMap((r) => Vf(e[r], t[r], [...n, r])) : [{
		path: n,
		...t === void 0 ? { remove: !0 } : { value: Ff(t) }
	}];
}
function Hf(e) {
	let [t, , n] = e;
	return !e.length || e.some((e) => !Rf(e)) || [
		"stateGraph",
		"layout",
		"containers",
		"id",
		"title",
		"loadingText",
		"source",
		"svgData",
		"svgFileVersion",
		"useShadowRoot",
		"typography",
		"database",
		"db_map_id",
		"regionPrefix",
		"galleries"
	].includes(t) ? !1 : t === "nodes" ? e.length > 2 && [
		"settings",
		"styles",
		"template",
		"css",
		"js"
	].includes(n) && !(n === "settings" && e.length < 4) && !(n === "settings" && [
		"placement",
		"chromeGrid",
		"responsiveLayout"
	].includes(e[3])) : t !== "scenes" || e.length > 2 && ["theme", "dataBindings"].includes(n);
}
function Uf(e, t) {
	let n = Ff(e);
	for (let e of t) {
		if (!e.path.length || e.path.some((e) => !Rf(e))) throw Error("Invalid state property path.");
		let t = n;
		for (let n = 0; n < e.path.length; n++) {
			let r = e.path[n], i = n === e.path.length - 1;
			if (Array.isArray(t) && r.startsWith("@")) {
				let n = t.findIndex((e) => Lf(e) && String(e.id) === r.slice(1));
				if (i) e.remove ? n >= 0 && t.splice(n, 1) : n >= 0 ? t[n] = Ff(e.value) : t.push(Ff(e.value));
				else {
					if (n < 0) break;
					t = t[n];
				}
			} else if (Lf(t)) i ? e.remove ? delete t[r] : t[r] = Ff(e.value) : (Array.isArray(t[r]) && !t[r].length && !e.path[n + 1].startsWith("@") && (t[r] = {}), !Lf(t[r]) && !Array.isArray(t[r]) && (t[r] = {}), t = t[r]);
			else break;
		}
	}
	return n;
}
function Wf(e) {
	return {
		version: 1,
		branches: e.map((e) => ({
			id: Pf(e.id),
			name: e.title,
			sceneId: e.id
		})),
		states: [],
		defaultStateId: null
	};
}
function Gf(e, t) {
	if (!Lf(e) || e.version !== 1 && e.version !== 2 || !Array.isArray(e.branches) || !Array.isArray(e.states)) throw Error("Unsupported App Scenes document.");
	let n = Ff(e), r = new Set(t.map((e) => e.id)), i = /* @__PURE__ */ new Map(), a = /* @__PURE__ */ new Map();
	for (let e of n.branches) {
		if (!e || typeof e.id != "string" || !e.id || typeof e.name != "string" || !e.name.trim() || !r.has(e.sceneId) || i.has(e.id)) throw Error("Invalid App Scenes group.");
		i.set(e.id, e);
	}
	for (let e of n.states) {
		if (!e || typeof e.id != "string" || !e.id || e.id === "root" || e.id.startsWith("scene:") || a.has(e.id) || typeof e.title != "string" || !e.title.trim() || !Array.isArray(e.changes) || !r.has(e.sceneId) || i.get(e.branchId)?.sceneId !== e.sceneId) throw Error("Invalid App Scene.");
		for (let t of e.changes) {
			if (!t || !Array.isArray(t.path) || !t.path.every((e) => typeof e == "string") || !Hf(t.path) || t.remove !== !0 && !Object.prototype.hasOwnProperty.call(t, "value")) throw Error("Invalid App Scene override.");
			if (t.path[0] === "scenes" && t.path[1] !== zf(e.sceneId)) throw Error("A Scene cannot override another Page.");
		}
		a.set(e.id, e);
	}
	for (let e of n.states) {
		if (n.version === 2 && e.parentId !== null) throw Error("Scenes inherit Page base, not another Scene.");
		let t = /* @__PURE__ */ new Set(), r = e;
		for (; r;) {
			if (t.has(r.id)) throw Error("App Scenes cannot contain cycles.");
			if (t.add(r.id), r.parentId === null) break;
			let n = a.get(r.parentId);
			if (!n || n.sceneId !== e.sceneId) throw Error("Missing or incompatible Scene parent.");
			r = n;
		}
	}
	if (n.defaultStateId !== null && !a.has(n.defaultStateId) && !(n.version === 2 && t.some((e) => Pf(e.id) === n.defaultStateId))) throw Error("Unknown default Scene.");
	return n;
}
function Kf(e, t) {
	let n = [], r = /* @__PURE__ */ new Set(), i = new Map(e.states.map((e) => [e.id, e])), a = i.get(t);
	for (; a;) {
		if (r.has(a.id)) throw Error("App Scenes cannot contain cycles.");
		r.add(a.id), n.unshift(a), a = a.parentId ? i.get(a.parentId) : void 0;
	}
	return n;
}
function qf(e, t, n) {
	return Kf(t, n).reduce((e, t) => Uf(e, t.changes), Ff(e));
}
function Jf(e, t, n, r, i, a) {
	let o = Ff(e), s = n ? o.states.find((e) => e.id === n) : void 0;
	if (n && (!s || s.sceneId !== t)) throw Error("Invalid Scene parent.");
	if (e.version === 2 && n !== null) throw Error("Scenes inherit Page base, not another Scene.");
	if (r === "branch" && n !== null) throw Error("Create a new variant from the Page base.");
	let c = i.trim();
	if (!c) throw Error("Enter a Scene title.");
	let l = `state-${crypto.randomUUID()}`, u = s?.branchId ?? Pf(t);
	if (r === "branch") {
		let e = a?.trim();
		if (!e) throw Error("Enter a branch name.");
		if (o.branches.some((n) => n.sceneId === t && n.name.toLowerCase() === e.toLowerCase())) throw Error("That branch name is already used.");
		u = `branch-${crypto.randomUUID()}`, o.branches.push({
			id: u,
			name: e,
			sceneId: t
		});
	}
	if (r === "continue" && e.version === 1) {
		let e = o.states.find((e) => e.parentId === n && e.sceneId === t && e.branchId === u);
		e && (e.parentId = l);
	}
	return o.states.push({
		id: l,
		title: c,
		sceneId: t,
		branchId: u,
		parentId: n,
		changes: []
	}), {
		graph: o,
		id: l
	};
}
function Yf(e, t, n) {
	let r = Ff(e), i = r.states.find((e) => e.id === t);
	if (!i) throw Error("Unknown Scene.");
	for (let e of n) {
		if (!Hf(e.path)) throw Error("Structural settings belong to App.");
		let t = JSON.stringify(e.path);
		i.changes = i.changes.filter((e) => JSON.stringify(e.path) !== t), i.changes.push(Ff(e));
	}
	return r;
}
function Xf(e, t) {
	return e.version === 2 ? Ff(e) : {
		...Wf(t),
		version: 2,
		defaultStateId: e.defaultStateId,
		states: e.states.map((t) => ({
			...Ff(t),
			parentId: null,
			branchId: Pf(t.sceneId),
			changes: Ff(Kf(e, t.id).flatMap((e) => e.changes))
		}))
	};
}
//#endregion
//#region src/lib/app-state-editor.ts
var Zf = "mapsvg:app-state-changed", Qf = Symbol.for("mapsvg.admin.app-state-editor"), $f = class e {
	map;
	ownerStateVersion = 1;
	base;
	projected;
	persisted;
	applying = !1;
	pendingNotification = !1;
	rawData;
	rawUpdate;
	graph;
	activeId = Nf;
	projectionRevision = 0;
	listeners = /* @__PURE__ */ new Set();
	constructor(e) {
		this.map = e, this.rawData = e.getData?.bind(e) ?? (() => ({
			id: e.id,
			options: Ff(e.options)
		})), this.rawUpdate = e.update.bind(e), this.base = this.readRaw();
		let t = Bf(this.base);
		this.persisted = e.options.stateGraph !== void 0, this.graph = Xf(this.persisted ? Gf(e.options.stateGraph, t) : Wf(t), t), this.projected = Ff(this.base), e.getData = () => (this.capture(), {
			...this.rawData(),
			options: this.canonicalOptions()
		}), e.update = (t) => {
			if (this.applying) {
				this.rawUpdate(t);
				return;
			}
			if ((t.nodes || t.scenes) && kf(e.options, {
				...e.options,
				...t
			})) throw Error("Only one Map component can be added to a Page.");
			this.capture(), t.regions && Array.isArray(e.options.regions) && (e.options.regions = Object.fromEntries(Object.entries(e.options.regions))), this.rawUpdate(t), t.regions && e.reloadAllRegionStyles?.(), this.capture(), this.project();
		};
		let n = Z.getState().mapSessions[String(e.id)]?.activeStateId, r = n && this.isPoint(n) ? n : this.graph.defaultStateId ?? "root";
		this.isPoint(r) && (this.activeId = r), this.project(!0);
	}
	static adopt(t) {
		if (Object.getPrototypeOf(t) === e.prototype) return t;
		if (t.ownerStateVersion !== void 0 && t.ownerStateVersion !== 1) throw Error("Reload the Map editor after changing its Scene storage contract.");
		return t.capture(), Object.setPrototypeOf(t, e.prototype), t.ownerStateVersion === void 0 && Object.defineProperty(t, "ownerStateVersion", { value: 1 }), t.project(!0), t.notify(), t;
	}
	readRaw() {
		let e = Ff(this.rawData().options);
		return delete e.stateGraph, e;
	}
	canonicalOptions() {
		return {
			...Ff(this.base),
			...this.persisted ? { stateGraph: Ff(this.graph) } : {}
		};
	}
	scenes() {
		return Bf(this.base);
	}
	activePageId() {
		let e = this.graph.states.find((e) => e.id === this.activeId)?.sceneId ?? this.scenes().find((e) => Pf(e.id) === this.activeId)?.id ?? Z.getState().mapSessions[String(this.map.id)]?.activePageId;
		return this.scenes().find((t) => t.id === e)?.id ?? this.scenes()[0]?.id;
	}
	canEditNode(e) {
		let t = this.activePageId();
		return !t || Df(this.base, t, e);
	}
	isPoint(e) {
		return e === "root" || this.scenes().some((t) => Pf(t.id) === e) || this.graph.states.some((t) => t.id === e);
	}
	label() {
		let e = this.graph.states.find((e) => e.id === this.activeId);
		if (e) return `${Tf(this.scenes().find((t) => t.id === e.sceneId))}: ${e.title}`;
		let t = this.scenes().find((e) => Pf(e.id) === this.activeId) ?? this.scenes()[0];
		return this.activeId === "root" ? "App : Base" : `${Tf(t)}: Base`;
	}
	subscribe = (e) => (this.listeners.add(e), () => {
		this.listeners.delete(e);
	});
	notify() {
		this.pendingNotification || (this.pendingNotification = !0, queueMicrotask(() => {
			this.pendingNotification = !1;
			for (let e of this.listeners) e();
			typeof window < "u" && window.dispatchEvent(new Event(Zf));
		}));
	}
	capture() {
		if (this.applying) return;
		let e = this.readRaw(), t = Vf(this.projected, e);
		if (!t.length) return;
		let n = this.graph.states.find((e) => e.id === this.activeId), r = this.activePageId();
		if (this.activeId !== "root" && r && t.some((e) => Hf(e.path) && (e.path[0] === "scenes" && e.path[1] !== `@${r}` || e.path[0] === "nodes" && !Df(this.base, r, e.path[1].slice(1))))) throw this.project(!0), this.notify(), Error("Switch to the owning Page before editing its settings.");
		let i = t.filter((e) => n && Hf(e.path) && (e.path[0] !== "scenes" || e.path[1] === `@${n.sceneId}`)), a = t.filter((e) => !i.includes(e));
		this.base = Uf(this.base, a), n && i.length && (this.graph = Yf(this.graph, n.id, i), this.persisted = !0);
		let o = new Set(this.scenes().map((e) => e.id));
		this.graph.states = this.graph.states.filter((e) => o.has(e.sceneId)), this.graph.branches = this.graph.branches.filter((e) => o.has(e.sceneId));
		let s = new Set((Array.isArray(this.base.nodes) ? this.base.nodes : []).map((e) => `@${e.id}`));
		for (let e of this.graph.states) e.changes = e.changes.filter((e) => e.path[0] !== "nodes" || s.has(e.path[1]));
		this.graph.defaultStateId && !this.isPoint(this.graph.defaultStateId) && (this.graph.defaultStateId = null), this.isPoint(this.activeId) || (this.activeId = Nf), this.projected = e, this.notify();
	}
	readRuntime() {
		let e = Ff(this.map.getRuntimeOptions?.() ?? this.readRaw());
		return !this.map.getRuntimeOptions && this.map.getViewBox && (e.viewBox = this.map.getViewBox().toArray()), delete e.stateGraph, e;
	}
	project(e = !1) {
		let t = qf(this.base, this.graph, this.activeId), n = this.readRaw(), r = Vf(n, t);
		e && r.push(...Vf(this.readRuntime(), t));
		let i = [...new Set(r.map((e) => e.path[0]))], a = JSON.stringify(n.scenes);
		this.applying = !0;
		try {
			let e = {};
			for (let n of i) e[n] = t[n];
			if (i.includes("colors")) {
				let r = n.colors, i = t.colors;
				e.colors = {
					...i,
					...Object.fromEntries(Object.keys(r ?? {}).filter((e) => jf.has(e) && !(e in (i ?? {}))).map((e) => [e, ""]))
				};
			}
			i.includes("viewBox") && Array.isArray(t.viewBox) && this.map.setInitialViewBox?.(Ff(t.viewBox)), i.includes("events") && this.map.setEvents && (this.map.setEvents(t.events ?? {}, !0), delete e.events), i.includes("middlewares") && this.map.setMiddlewares && (this.map.setMiddlewares(t.middlewares ?? {}, !0), delete e.middlewares), this.map.setActivePage?.(this.activePageId()), Object.keys(e).length && this.rawUpdate(e);
			for (let e of i) t[e] === void 0 ? delete this.map.options[e] : this.map.options[e] = Ff(t[e]);
			(i.some((e) => [
				"regions",
				"regionStatuses",
				"regionDataRules"
			].includes(e)) || i.includes("colors") && !Mf(n.colors, t.colors)) && this.map.reloadAllRegionStyles?.(), i.includes("markerDataRules") && this.map.reloadMarkerImages?.(), (i.includes("nodes") || i.includes("scenes")) && this.map.refreshTreeLayout?.(i.length === 1 && i[0] === "nodes" ? n.nodes : void 0), this.persisted && (this.map.options.stateGraph = Ff(this.graph)), this.projected = this.readRaw(), this.map.refreshPageBindings?.();
		} finally {
			this.applying = !1;
		}
		if (!this.map.refreshPageBindings && a !== JSON.stringify(t.scenes)) {
			let e = this.map;
			e.objectsRepository?.reload?.(), e.regionsRepository?.reload?.();
		}
	}
	select(e) {
		if (!this.isPoint(e)) throw Error("Unknown App Scene.");
		this.capture();
		let t = this.activePageId();
		this.activeId = e, this.project(!0), this.projectionRevision++;
		let n = this.activePageId();
		Z.getState().patchMapSession(this.map.id, {
			activeStateId: e,
			activePageId: n,
			...t === n ? {} : {
				selectedNodeId: null,
				selectedSceneId: n,
				selectedComponentId: null
			}
		}), this.notify();
	}
	create(e, t) {
		if (this.capture(), !this.scenes().some((t) => t.id === e)) throw Error("Unknown Page.");
		let n = Jf(this.graph, e, null, "continue", t);
		return this.graph = Gf(n.graph, this.scenes()), this.persisted = !0, this.project(), this.notify(), n.id;
	}
	duplicate(e) {
		this.capture();
		let t = this.graph.states.find((t) => t.id === e);
		if (!t) throw Error("Unknown Scene.");
		let n = new Set(this.graph.states.filter((e) => e.sceneId === t.sceneId).map((e) => e.title)), r = `${t.title} copy`, i = 2;
		for (; n.has(r);) r = `${t.title} copy ${i++}`;
		let a = this.create(t.sceneId, r);
		return this.graph.states.find((e) => e.id === a).changes = Ff(t.changes), this.project(), this.notify(), a;
	}
	rename(e, t) {
		this.capture();
		let n = this.graph.states.find((t) => t.id === e);
		if (!n || !t.trim()) throw Error("Enter a Scene title.");
		n.title = t.trim(), this.persisted = !0, this.project(), this.notify();
	}
	reset(e) {
		this.capture();
		let t = this.graph.states.find((t) => t.id === e);
		t && (t.changes = [], this.project(!0), this.projectionRevision++, this.notify());
	}
	setDefault(e) {
		if (!this.isPoint(e)) throw Error("Choose a Scene, Page or root.");
		this.capture(), this.graph.defaultStateId = e === "root" ? null : e, this.persisted = !0, this.project(), this.notify();
	}
};
function ep(e) {
	let t = e[Qf];
	return t || (t = new $f(e), Object.defineProperty(e, Qf, { value: t })), $f.adopt(t);
}
function tp(e) {
	if (!e) return "pending";
	let t = e[Qf];
	return `${e.id}:${t?.activeId ?? "root"}:${t?.projectionRevision ?? 0}`;
}
function np(e) {
	if (e) return e[Qf]?.activePageId() ?? Bf(e.options)[0]?.id;
}
var rp = "#mapsvg-map-%id% .mapsvg-tooltip {\n\n}\n#mapsvg-map-%id% .mapsvg-popover {\n\n}\n#mapsvg-map-%id% .mapsvg-details-container {\n\n}\n#mapsvg-map-%id% .mapsvg-directory-item {\n\n}\n#mapsvg-map-%id% .mapsvg-region-label {\n  /* background-color: rgba(255,255,255,.6); */\n  font-size: 11px;\n  padding: 3px 5px;\n  border-radius: 4px;\n}\n#mapsvg-map-%id% .mapsvg-marker-label {\n  padding: 3px 5px;\n}\n#mapsvg-map-%id% .mapsvg-filters-wrap {\n\n}\n", ip = {
	tooltipRegion: {
		html: "{{id}} - {{title}}",
		css: "",
		js: ""
	},
	tooltipMarker: {
		html: "{{title}}",
		css: "",
		js: ""
	},
	ProductCard: {
		html: "<!--\n  ProductCard — WooCommerce product card (inline fields).\n\n  Recommended: Details View + style preset \"Card\".\n\n  Usage as partial (e.g. in Region Details):\n  [[>ProductCard product=objects.0.post]]\n\n  Replace [] symbols in the example with {}\n\n  Buttons:\n  - Add to cart — optional: replace the Book now block with [[[product.add_to_cart_html]]]\n    (Woo form HTML for simple purchasable products; use triple braces so HTML is not escaped).\n  - Book now — shown when product.book_now_url is set (checkout URL that adds the product).\n  - View product — fallback link to product.url when book_now_url is empty.\n  - Variable/grouped/external products: when product.use_product_embed is true, the full\n    Woo embed [[[product]]] is used instead of this card.\n-->\n{{#if product}}\n  {{#if product.use_product_embed}}\n    {{product}}\n  {{else}}\n    <article class=\"mapsvg-product-simple\">\n      <div class=\"mapsvg-product-gallery\">\n        {{#if product.gallery.0.full}}\n          <img src=\"{{product.gallery.0.full}}\" alt=\"{{product.post_title}}\" class=\"mapsvg-product-image\" loading=\"lazy\" />\n        {{/if}}\n      </div>\n\n      <div class=\"mapsvg-product-body\">\n        <h2 class=\"mapsvg-product-title\">{{product.post_title}}</h2>\n\n        {{#if product.sku}}\n          <div class=\"mapsvg-product-badges\">\n            <span class=\"mapsvg-product-badge\">{{product.sku}}</span>\n            {{#if product.is_on_sale}}\n              <span class=\"mapsvg-product-badge\">Sale</span>\n            {{/if}}\n          </div>\n        {{else}}\n          {{#if product.is_on_sale}}\n            <div class=\"mapsvg-product-badges\">\n              <span class=\"mapsvg-product-badge\">Sale</span>\n            </div>\n          {{/if}}\n        {{/if}}\n\n        {{#if product.short_description}}\n          <div class=\"mapsvg-product-excerpt\">{{{product.short_description}}}</div>\n        {{/if}}\n\n        <div class=\"mapsvg-product-footer\">\n          {{#if product.price_html}}\n            <div class=\"mapsvg-product-price-wrap\">\n              <span class=\"mapsvg-product-price-label\">Price</span>\n              <div class=\"mapsvg-product-price\">{{{product.price_html}}}</div>\n            </div>\n          {{/if}}\n\n          {{#if product.book_now_url}}\n            <div class=\"mapsvg-product-cart\">\n              <a class=\"mapsvg-product-cart-link\" href=\"{{product.book_now_url}}\">Book now</a>\n            </div>\n          {{else}}\n            <div class=\"mapsvg-product-cart\">\n              <a class=\"mapsvg-product-cart-link\" href=\"{{product.url}}\" target=\"_blank\" rel=\"noopener\">View product</a>\n            </div>\n          {{/if}}\n        </div>\n      </div>\n    </article>\n  {{/if}}\n{{/if}}",
		css: ".mapsvg-product-simple {\n  --ms-text: #111;\n  --ms-muted: #8a8a8e;\n  --ms-desc: #5c5c62;\n  --ms-line: #e4e4ea;\n  --ms-bg: #fff;\n  --ms-accent: #5c5890;\n  --ms-accent-hover: #4f4b7e;\n  --ms-grad-from: #c4c0ff;\n  --ms-grad-to: #6b6698;\n  --ms-btn-radius: 12px;\n\n  background: var(--ms-bg);\n  overflow: hidden;\n  color: var(--ms-text);\n  font-family: -apple-system, BlinkMacSystemFont, \"SF Pro Text\", \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;\n  -webkit-font-smoothing: antialiased;\n  width: 100%;\n}\n\n.mapsvg-product-gallery {\n  position: relative;\n  margin: 0;\n  padding: 0;\n  height: fit-content;\n  display: block;\n  overflow: hidden;\n}\n\n.mapsvg-product-image {\n  width: 100%;\n  height: 100%;\n  display: block;\n  object-fit: cover;\n  object-position: center;\n}\n\n.mapsvg-product-body {\n  padding: 10px 20px 20px 15px;\n}\n\n.mapsvg-product-title {\n  margin: 0 0 10px;\n  font-size: 1.35rem;\n  line-height: 1.25;\n  font-weight: 700;\n  letter-spacing: -0.02em;\n}\n\n.mapsvg-product-badges {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin: 0 0 12px;\n}\n\n.mapsvg-product-badge {\n  display: inline-block;\n  padding: 3px 8px;\n  border: 1px solid var(--ms-line);\n  border-radius: 6px;\n  color: var(--ms-muted);\n  font-size: 0.68rem;\n  font-weight: 600;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  line-height: 1.4;\n}\n\n.mapsvg-product-excerpt {\n  margin: 0 0 18px;\n  color: var(--ms-desc);\n  font-size: 0.92rem;\n  line-height: 1.55;\n}\n\n.mapsvg-product-excerpt p {\n  margin: 0;\n}\n\n.mapsvg-product-footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 14px;\n}\n\n.mapsvg-product-price-wrap {\n  flex: 0 0 auto;\n  min-width: 0;\n}\n\n.mapsvg-product-price-label {\n  display: block;\n  margin: 0 0 2px;\n  font-size: 0.65rem;\n  font-weight: 700;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: var(--ms-muted);\n}\n\n.mapsvg-product-price {\n  margin: 0;\n  font-size: 1.25rem;\n  line-height: 1.2;\n  font-weight: 700;\n  color: var(--ms-text);\n}\n\n.mapsvg-product-price del {\n  color: var(--ms-muted);\n  font-weight: 500;\n  font-size: 0.85em;\n  margin-right: 0.35em;\n}\n\n.mapsvg-product-price ins {\n  text-decoration: none;\n  color: var(--ms-text);\n  font-weight: 700;\n}\n\n.mapsvg-product-price .amount {\n  white-space: nowrap;\n}\n\n.mapsvg-product-cart {\n  flex: 1 1 auto;\n  margin: 0;\n  max-width: 62%;\n}\n\n.mapsvg-product-cart form.cart {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 0;\n  margin: 0;\n}\n\n.mapsvg-product-cart .quantity,\n.mapsvg-product-cart input.qty {\n  display: none !important;\n}\n\n.mapsvg-product-cart button,\n.mapsvg-product-cart .single_add_to_cart_button {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  gap: 0.45em;\n  width: 100%;\n  min-height: 46px;\n  border: 0;\n  border-radius: var(--ms-btn-radius);\n  padding: 0 18px;\n  background: var(--ms-accent);\n  color: #fff !important;\n  font-size: 0.95rem;\n  font-weight: 600;\n  letter-spacing: 0.01em;\n  cursor: pointer;\n  white-space: nowrap;\n  line-height: 1;\n}\n\n.mapsvg-product-cart button svg,\n.mapsvg-product-cart .single_add_to_cart_button svg {\n  display: block;\n  flex-shrink: 0;\n  width: 1.15em;\n  height: 1.15em;\n  stroke: currentColor;\n}\n\n.mapsvg-product-cart button:hover,\n.mapsvg-product-cart .single_add_to_cart_button:hover {\n  background: var(--ms-accent-hover);\n}\n\n.mapsvg-product-cart-link {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  min-height: 46px;\n  border-radius: var(--ms-btn-radius);\n  padding: 0 18px;\n  background: var(--ms-accent);\n  color: #fff !important;\n  font-size: 0.95rem;\n  font-weight: 600;\n  text-decoration: none !important;\n}\n\n.mapsvg-product-cart-link:hover {\n  background: var(--ms-accent-hover);\n  color: #fff !important;\n}\n",
		js: ""
	},
	popoverRegion: {
		html: "<div>\n  <p>This is the demo content of the <strong>Region Popover</strong>.</p>\n#mapsvg-template-linkpopoverRegionhttps://mapsvg.com/docs/map-editor/templates_blank</div>\n<hr />\n\n<!-- Region fields are available in this template -->\n<h5>{{#if title}} {{title}} {{else}} {{id}} {{/if}}</h5>\n<p>Status: {{status_text}}</p>\n\n<!-- Show all linked Database Objects: -->\n{{#each objects}}\n\n  <!-- DB Object are available inside of this block -->\n\n  <h5>{{title}}</h5>\n  <!-- When you need to render a field as HTML, use 3 curly braces instead of 2:-->\n  <p>{{{description}}}</p>\n  <p><em>{{location.address.formatted}}</em></p>\n\n  <!-- Show all images: -->\n  {{#each images}}\nthumbnailmediumfull    <!-- are available in this block                -->\n{{thumbnail}}  {{/each}}\n\n{{/each}}",
		css: "",
		js: ""
	},
	popoverMarker: {
		html: "<div>\n  <p>This is the demo content of the <strong>DB Object Popover</strong>.</p>\n#mapsvg-template-linkpopoverhttps://mapsvg.com/docs/map-editor/templates_blank</div>\n<hr />\n\n<!-- DB Object fields are available in this template. -->\n<h5>{{title}}</h5>\n<!-- When you need to render a fields as HTML, use 3 curly braces instead of 2:-->\n<p>{{{description}}}</p>\n<p><em>{{location.address.formatted}}</em></p>\n\n<!-- Show all images: -->\n{{#each images}}\nthumbnailmediumfull  <!-- are available in this block                -->\n{{thumbnail}}{{/each}}\n\n<!-- Show all linked Regions, comma-separated: -->\n<p> Regions: \n  {{#each regions}}\n    <!-- Region fields are available in this block -->\n    {{#if title}}\n      {{title}}\n    {{else}}\n      {{id}}\n    {{/if}}{{#unless @last}}, {{/unless}}\n  {{/each}}\n</p>",
		css: "",
		js: ""
	},
	detailsView: {
		html: "<div>\n  <p>This is the demo content of the <strong>DB Object Details View</strong>.</p>\n#mapsvg-template-linkdetailsViewhttps://mapsvg.com/docs/map-editor/templates_blank</div>\n<hr />\n\n<!-- DB Object fields are available in this template. -->\n<h5>{{title}}</h5>\n<!-- When you need to render a fields as HTML, use 3 curly braces instead of 2:-->\n<p>{{{description}}}</p>\n<p><em>{{location.address.formatted}}</em></p>\n\n<!-- Show all images: -->\n{{#each images}}\nthumbnailmediumfull  <!-- are available in this block                -->\n{{thumbnail}}{{/each}}\n\n<!-- Show all linked Regions, comma-separated: -->\n<p> Regions: \n  {{#each regions}}\n    <!-- Region fields are available in this block -->\n    {{#if title}}\n      {{title}}\n    {{else}}\n      {{id}}\n    {{/if}}{{#unless @last}}, {{/unless}}\n  {{/each}}\n</p>",
		css: "",
		js: ""
	}
}, ap = [
	"beforeRedraw",
	"afterRedraw",
	"beforeShow",
	"afterShow",
	"beforeClose",
	"afterClose"
], op = {
	...Object.fromEntries([
		"popover",
		"tooltip",
		"detailsView"
	].flatMap((e) => ap.map((t) => [`${t}.${e}`, "function(event) {\n  const { map, data: { controller } } = event\n\n}"]))),
	"click.region": "function(event) {\n  const { map, data: { region } } = event\n\n  // Triggered when a region on the map is clicked.\n  // You can access the clicked region's data using the 'region' property.\n}",
	"mouseover.region": "function(event) {\n  const { map, data: { region } } = event\n\n  // Triggered when the mouse pointer hovers over a region on the map.\n  // You can access the hovered region's data using the 'region' property.\n}",
	"mouseout.region": "function(event) {\n  const { map, data: { region } } = event\n\n  // Triggered when the mouse pointer moves out of a region on the map.\n  // You can access the region's data using the 'region' property.\n}",
	"click.marker": "function(event) {\n  const { map, data: { marker } } = event  \n  \n}",
	"mouseover.marker": "function(event) {\n  const { map, data: { marker } } = event  \n  \n}",
	"mouseout.marker": "function(event) {\n  const { map, data: { marker } } = event  \n  \n}",
	afterInit: "function(event) {\n  const { map } = event;\n\n  // This event handler triggers after the map has fully initialized and all data has loaded.\n  // It's a good place to execute any custom logic or manipulation that requires the map to be fully set up.\n\n  // \"map\" gives you access to the MapSVG instance, allowing you to:\n  // - Interact with the map's regions, markers, and other elements.\n  // - Access or modify the map's settings, such as zoom level, center position, etc.\n  // - Attach additional event listeners or perform post-initialization tasks.\n}\n",
	beforeInit: "function(event) {\n  const { map } = event;\n\n  // This event handler triggers just before the map begins its initialization process.\n  // It's a good place to set up any pre-initialization configurations or modifications.\n\n  // \"map\" provides access to the MapSVG instance, allowing you to:\n  // - Set or modify map settings before initialization starts (e.g., set default options).\n  // - Add or alter data that will be used during initialization, such as regions or markers.\n  // - Prepare any custom logic that needs to run early in the initialization phase.\n}\n",
	afterLoadRegions: "function(event) {\n  const { map } = event;\n\n  // This event triggers after all regions from the regionsRepository have been fully loaded onto the map.\n  // At this point:\n  // - Regions are connected to their respective data objects.\n  // - The directory (if present) is refreshed and populated with the updated data.\n\n  // This is a good place to:\n  // - Perform actions that depend on the regions being fully available on the map.\n  // - Update or manipulate the directory based on the newly loaded data.\n  // - Implement custom logic or effects that require all regions to be loaded.\n\n  // Example:\n  // console.log('Regions are fully loaded and connected to data:', map.regions);\n}\n",
	afterLoadObjects: "function(event) {\n  const { map } = event;\n\n  // This event triggers after all objects from the objectsRepository have been fully loaded onto the map.\n  // At this point:\n  // - Objects are connected to their respective markers and regions.\n  // - The directory (if present) is updated with the new data for these objects.\n\n  // This is a good place to:\n  // - Perform actions that depend on the objects being fully loaded and connected.\n  // - Update or manipulate the map’s markers or regions based on the newly loaded objects.\n  // - Implement custom logic or visual effects that require all objects to be loaded and displayed.\n\n  // Example:\n  // console.log('Objects are fully loaded and connected to markers and regions:', map.objects);\n}\n",
	zoom: "function(event) {\n  const { map } = event;\n\n  // This event handler triggers whenever the map is zoomed in or out.\n  // It's useful for executing actions based on the zoom level of the map.\n\n  // \"map.zoomLevel\" provides the current zoom level of the map.\n  // You can use this to perform tasks like:\n  // - Adjusting the visibility of certain elements based on zoom.\n  // - Logging or displaying the current zoom level for debugging or user information.\n  // - Dynamically loading additional data or layers depending on the zoom level.\n\n  // Example usage:\n  // console.log(map.zoomLevel);\n}\n",
	"beforeLoad.repository": "function(event) {\n  const { map, data: { repository } } = event  \n\n  // Perform actions or logging before the data is fetched from an API source into repository internal storage.\n\n}",
	"afterLoad.repository": "function(event) {\n  const { map, data: { repository } } = event  \n\n  // Perform actions or logging before the data is fetched from an API source into repository internal storage.\n\n}"
}, sp = {
	mapLoad: "function(data, ctx){\n  const { map } = ctx\n\n  // Example: Modify map options dynamically before applying them.\n  // You can conditionally change map settings based on factors like the current URL,\n  // user roles, or other runtime conditions.\n\n  // IMPORTANT: Consider checking if the map is being displayed in the WordPress admin area \n  // (by verifying map.inBackend). Typically, you don't want to run this middleware in the backend, \n  // because if you modify the map options here and then save the map, those modifications \n  // will be saved as default options in the database.\n\n  // For example, if the map is not in the backend and the user is viewing a specific post, \n  // you might disable the zoom controls:\n  // \n  // if (!map.inBackend && window.location.href.includes(\"/a-post-about-cats\")) {\n  //   data.controls.zoom = false;\n  // }\n\n  // Always return the modified or unmodified data from the middleware:\n  return data\n}",
	render: "function(data, ctx){\n  const { controller } = ctx;\n\n  // This middleware function allows you to modify the data before it is sent to a specific controller.\n  // Available controllers: details, popover, tooltip, directory, filters.\n  // You can customize the data for different controllers, such as formatting numbers, strings, etc.\n\n  // Example: If the controller is \"details\", format the \"totalAmount\" field from \"1000000\" to \"1,000,000\".\n  // Uncomment and customize the following block to apply such transformations:\n  //\n  // if(controller.is(\"details\")){\n  //    return { ...data, totalAmount: data.totalAmount.toLocaleString('en-US') };  \n  // }\n\n  // Always return the data object after processing to ensure it continues through the middleware chain.\n  return data;      \n}",
	request: "function(data, ctx){\n  const { request, repository, map } = ctx;\n  \n  // This middleware function allows you to modify the request data before it is sent to the server.\n  // Use this when you need to interact with a custom API that expects a different query format from MapSVG.\n  \n  // Example: If the request is for the \"users\" repository and the action is \"index\",\n  // you can modify the request data by appending \"_bar\" to the \"foo\" property.\n  //\n  // if(repository.schema.objectNamePlural === \"users\" && request.action === \"index\") {\n  //   data = {\n  //     ...data,\n  //     foo: data.foo + \"_bar\"\n  //   };\n  // }\n\n  // Always return the data object after processing to ensure it continues through the middleware chain.\n  return data;\n}",
	response: "function(data, ctx){\n  const { request, response, repository, map } = ctx;\n  \n  // This middleware function allows you to modify the response data received from the server.\n  // Use this when working with a custom API that returns data in a format different from what MapSVG expects.\n  \n  // Example: A response format that is compatible with MapSVG might look like this:\n  // {\n  //   users: {\n  //     items: [\n  //       {id: 1, name: \"John\"},\n  //       {id: 2, name: \"Anna\"},\n  //     ],\n  //     hasMore: true\n  //   }\n  // }\n  //\n  // Suppose your actual API response has this structure:\n  // {\n  //   items: [\n  //     {id: 1, name: \"John\"},\n  //     {id: 2, name: \"Anna\"},\n  //   ],\n  //   page: 3,\n  //   totalPages: 120\n  // }\n  //\n  // The following code modifies the response for the \"users\" repository \n  // when fetching a list of models (the \"index\" action).\n  // \n  // if(repository.schema.objectNamePlural === \"users\" && request.action === \"index\") {\n  //   const dataParsed = typeof response.data === \"string\" ? JSON.parse(response.data) : data;\n  //   const dataFormatted = {\n  //     users: {\n  //       items: dataParsed.items,\n  //       hasMore: dataParsed.page < dataParsed.totalPages\n  //     }\n  //   };\n  //   return dataFormatted;\n  // } \n  \n  // Always return the data object after processing to ensure it continues through the middleware chain.\n  return data;    \n}\n"
}, cp = /* @__PURE__ */ e({
	applyOptionsPatchToLiveMap: () => _p,
	getAdminMapInstance: () => pp,
	getAdminMapPreviewState: () => mp,
	registerAdminMapInstance: () => fp,
	subscribeAdminMapInstance: () => hp
}), lp = null, up = /* @__PURE__ */ new Set();
function dp() {
	for (let e of up) e(lp);
}
function fp(e) {
	lp = e, dp();
}
function pp() {
	return lp;
}
function mp(e) {
	if (!lp || lp.id !== e || !gp(lp.options)) return null;
	try {
		let e = JSON.parse(JSON.stringify(lp.options));
		return gp(e) ? {
			mapId: lp.id,
			options: e
		} : null;
	} catch {
		return null;
	}
}
function hp(e) {
	return up.add(e), e(lp), () => {
		up.delete(e);
	};
}
function gp(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function _p(e) {
	if (!lp || !gp(e) || Object.keys(e).length === 0 || typeof lp.update != "function") return !1;
	try {
		let t = Object.keys(e).length === 1 && e.nodes ? lp.options.nodes : void 0, { layout: n, ...r } = e, i = "layout" in e ? {
			...r,
			layout: n
		} : e;
		return lp.update(i), (e.nodes || e.scenes) && !e.layout && lp.refreshTreeLayout?.(t), !0;
	} catch (e) {
		return console.error("[mapsvg-admin-react] Failed to apply options patch to live map", e), !1;
	}
}
//#endregion
//#region src/lib/live-map-options.ts
var vp = /* @__PURE__ */ e({
	mergeOptionsSlice: () => xp,
	patchLiveColors: () => jp,
	patchLiveMapOptions: () => Ep,
	patchLiveMapScript: () => Dp,
	readLiveColors: () => Ip,
	readLiveCss: () => Cp,
	readLiveDatabase: () => Fp,
	readLiveEventScript: () => wp,
	readLiveMiddleware: () => Tp,
	readLiveTemplate: () => Sp,
	regionStylesFromColors: () => Np,
	regionStylesToColors: () => Pp,
	subscribeLiveMapOptions: () => kp,
	useAdminMap: () => bp
});
function yp(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function bp() {
	return (0, i.useSyncExternalStore)(hp, pp, () => null);
}
function xp(e, t) {
	let n = structuredClone(e);
	if (!yp(t)) return n;
	let r = (e, t) => {
		let n = { ...e };
		for (let i of Object.keys(e)) {
			if (!(i in t)) continue;
			let e = t[i];
			yp(e) && yp(n[i]) ? n[i] = r(n[i], e) : n[i] = e;
		}
		return n;
	};
	return r(n, t);
}
function Sp(e, t) {
	let n = ip[t], r = e?.options?.templates, i = r && yp(r) ? r[t] : void 0;
	return typeof i == "string" ? {
		html: i,
		css: n?.css ?? "",
		js: n?.js || "function({ el, map, controller }) {\n  \n}"
	} : yp(i) ? {
		html: typeof i.html == "string" ? i.html : n?.html ?? "",
		css: typeof i.css == "string" ? i.css : n?.css ?? "",
		js: typeof i.js == "string" ? i.js : n?.js || "function({ el, map, controller }) {\n  \n}"
	} : {
		html: n?.html ?? "",
		css: n?.css ?? "",
		js: n?.js || "function({ el, map, controller }) {\n  \n}"
	};
}
function Cp(e, t) {
	let n = e?.options?.css;
	return typeof n == "string" ? n : t;
}
function wp(e, t, n) {
	let r = e?.options?.events;
	return yp(r) && typeof r[t] == "string" ? r[t] : n;
}
function Tp(e, t, n) {
	let r = e?.options?.middlewares;
	return yp(r) && typeof r[t] == "string" ? r[t] : n;
}
function Ep(e) {
	let t = pp();
	if (!t || typeof t.update != "function") return;
	let n = Object.keys(e).length === 1 && e.nodes ? t.options.nodes : void 0;
	t.update(e), (e.nodes || e.scenes) && !e.layout && t.refreshTreeLayout?.(n), Ap();
}
function Dp(e, t) {
	let n = pp();
	if (n) {
		if (e.startsWith("middlewares.")) {
			let r = { [e.slice(12)]: t };
			n.setMiddlewares ? n.setMiddlewares(r, !0) : n.update({ middlewares: r });
		} else n.setEvents ? n.setEvents({ [e]: t }, !0) : n.update({ events: { [e]: t } });
		Ap();
	}
}
var Op = /* @__PURE__ */ new Set();
function kp(e) {
	return Op.add(e), window.addEventListener(Zf, e), () => {
		Op.delete(e), window.removeEventListener(Zf, e);
	};
}
function Ap() {
	for (let e of Op) e();
}
function jp(e) {
	Ep({ colors: e });
}
function Mp(e) {
	return typeof e == "number" || typeof e == "string" && /^-?\d+(\.\d+)?$/.test(e.trim());
}
function Np(e, t) {
	let n = xp(e, t);
	return {
		...n,
		hoverMode: Mp(n.hover) ? "brightness" : "color",
		selectedMode: Mp(n.selected) ? "brightness" : "color"
	};
}
function Pp(e) {
	let { hoverMode: t, selectedMode: n, ...r } = e;
	return r;
}
function Fp(e) {
	let t = e?.options?.database;
	return yp(t) ? t : {};
}
function Ip(e) {
	let t = e?.options?.colors;
	return yp(t) ? t : {};
}
//#endregion
//#region src/components/layout/LayoutMigrationDialog.tsx
var Lp = /* @__PURE__ */ e({
	LayoutMigrationProvider: () => zp,
	useLayoutMigration: () => Bp
}), Rp = (0, i.createContext)(null);
function zp({ mapId: e, children: t }) {
	let n = bp(), [r, a] = (0, i.useState)(null);
	(0, i.useEffect)(() => a(null), [e]);
	let o = (t) => {
		if (!(!n || e == null || n.id !== e)) {
			if (of(n.options?.layout).mountMode === "tree") {
				t();
				return;
			}
			a({
				mapId: e,
				action: t
			});
		}
	}, s = qd(n?.options?.css);
	return /* @__PURE__ */ (0, v.jsxs)(Rp.Provider, {
		value: { requestMigration: o },
		children: [t, /* @__PURE__ */ (0, v.jsx)(Id, {
			open: r != null,
			onOpenChange: (e) => {
				e || a(null);
			},
			children: /* @__PURE__ */ (0, v.jsxs)(Vd, {
				className: "sm:max-w-xl",
				children: [
					/* @__PURE__ */ (0, v.jsxs)(Hd, {
						className: "text-left",
						children: [/* @__PURE__ */ (0, v.jsx)(Wd, { children: "Migrate to the new layout?" }), /* @__PURE__ */ (0, v.jsx)(Gd, { children: "The new layout mounts components in slot containers instead of the old sidebar, header, and footer containers." })]
					}),
					/* @__PURE__ */ (0, v.jsxs)("div", {
						className: "space-y-3 text-sm",
						children: [
							/* @__PURE__ */ (0, v.jsx)("p", { children: "Custom CSS targeting old container classes will no longer style the new slot containers. Custom JavaScript that selects or controls the old containers will no longer control slot content." }),
							s.length > 0 ? /* @__PURE__ */ (0, v.jsxs)("p", {
								className: "rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900",
								children: [
									"Your map CSS contains references to old container classes:",
									" ",
									/* @__PURE__ */ (0, v.jsx)("strong", { children: s.map((e) => `.${e}`).join(", ") }),
									"."
								]
							}) : /* @__PURE__ */ (0, v.jsx)("p", {
								className: "rounded-md border border-border bg-muted/40 p-3",
								children: "We did not find old container classes in this map’s CSS. They may still be used in your WordPress theme or elsewhere, so please check any custom code you added."
							}),
							/* @__PURE__ */ (0, v.jsx)("p", { children: "Migration is saved automatically in your draft. You can inspect the result before publishing it to the front-end." })
						]
					}),
					/* @__PURE__ */ (0, v.jsxs)(Ud, { children: [/* @__PURE__ */ (0, v.jsx)(Ju, {
						type: "button",
						variant: "outline",
						onClick: () => a(null),
						children: "Cancel"
					}), /* @__PURE__ */ (0, v.jsx)(Ju, {
						type: "button",
						onClick: () => {
							let t = r;
							a(null), t && n?.id === t.mapId && e === t.mapId && t.action();
						},
						children: "Migrate"
					})] })
				]
			})
		})]
	});
}
function Bp() {
	return (0, i.useContext)(Rp) ?? { requestMigration: (e) => e() };
}
//#endregion
//#region src/lib/deferred-admin-component.tsx
function Vp() {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		role: "status",
		className: "flex min-h-0 flex-1 items-center justify-center p-6 text-sm text-muted-foreground",
		children: "Loading…"
	});
}
function Hp({ open: e, children: t }) {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		hidden: !e,
		style: { display: e ? "contents" : "none" },
		children: t
	});
}
var Up = class extends i.Component {
	state = { failed: !1 };
	static getDerivedStateFromError() {
		return { failed: !0 };
	}
	render() {
		return this.state.failed ? /* @__PURE__ */ (0, v.jsxs)("div", {
			role: "alert",
			className: "flex flex-col items-center justify-center gap-3 p-6 text-sm",
			children: [/* @__PURE__ */ (0, v.jsx)("p", { children: "This panel could not load." }), /* @__PURE__ */ (0, v.jsx)(Ju, {
				type: "button",
				size: "sm",
				variant: "outline",
				onClick: this.props.onRetry,
				children: "Try again"
			})]
		}) : this.props.children;
	}
};
function Wp(e) {
	let t = (0, i.lazy)(e);
	return function(n) {
		let [{ Panel: r, attempt: a }, o] = (0, i.useState)(() => ({
			Panel: t,
			attempt: 0
		}));
		return /* @__PURE__ */ (0, v.jsx)(Up, {
			onRetry: () => {
				t = (0, i.lazy)(e), o(({ attempt: e }) => ({
					Panel: t,
					attempt: e + 1
				}));
			},
			children: /* @__PURE__ */ (0, v.jsx)(i.Suspense, {
				fallback: /* @__PURE__ */ (0, v.jsx)(Vp, {}),
				children: (0, i.createElement)(r, n)
			})
		}, a);
	};
}
//#endregion
//#region src/components/component-interactions-context.tsx
var Gp = (0, i.createContext)(null);
function Kp({ children: e, interactions: t, toolbarEnd: n, settingsLead: r, settingsEnd: i }) {
	return /* @__PURE__ */ (0, v.jsx)(Gp.Provider, {
		value: {
			body: t,
			toolbarEnd: n,
			settingsLead: r,
			settingsEnd: i
		},
		children: e
	});
}
//#endregion
//#region src/lib/shared-controller-bridge.ts
var qp = /* @__PURE__ */ e({
	ComponentController: () => Jp,
	ComponentInteractionsProvider: () => Kp
}), Jp = Wp(() => import("./ComponentController-COPRPWpk.js").then((e) => e.n).then((e) => ({ default: e.ComponentController }))), Yp = /* @__PURE__ */ e({
	Tooltip: () => Zp,
	TooltipContent: () => $p,
	TooltipProvider: () => Xp,
	TooltipTrigger: () => Qp
});
function Xp({ delayDuration: e = 0, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)(Qc, {
		"data-slot": "tooltip-provider",
		delayDuration: e,
		...t
	});
}
function Zp({ ...e }) {
	return /* @__PURE__ */ (0, v.jsx)(nl, {
		"data-slot": "tooltip",
		...e
	});
}
function Qp({ ...e }) {
	return /* @__PURE__ */ (0, v.jsx)(il, {
		"data-slot": "tooltip-trigger",
		...e
	});
}
function $p({ className: e, sideOffset: t = 0, children: n, ...r }) {
	let i = Fd();
	return /* @__PURE__ */ (0, v.jsx)(cl, {
		container: i,
		children: /* @__PURE__ */ (0, v.jsxs)(ul, {
			"data-slot": "tooltip-content",
			sideOffset: t,
			className: X("z-50 w-fit origin-(--radix-tooltip-content-transform-origin) animate-in rounded-md bg-foreground px-3 py-1.5 text-xs text-balance text-background fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95", e),
			...r,
			children: [n, /* @__PURE__ */ (0, v.jsx)(ml, { className: "z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] bg-foreground fill-foreground" })]
		})
	});
}
//#endregion
//#region src/lib/app-draft-recovery.ts
var em = class {
	name;
	constructor(e = "mapsvg-app-draft-recovery-v1") {
		this.name = e;
	}
	open() {
		return typeof indexedDB > "u" ? Promise.reject(/* @__PURE__ */ Error("IndexedDB is unavailable")) : new Promise((e, t) => {
			let n = indexedDB.open(this.name, 1);
			n.onupgradeneeded = () => n.result.createObjectStore("copies", { keyPath: "key" }), n.onsuccess = () => e(n.result), n.onerror = () => t(n.error ?? /* @__PURE__ */ Error("Could not open local draft storage")), n.onblocked = () => t(/* @__PURE__ */ Error("Local draft storage is blocked by another tab"));
		});
	}
	async transaction(e, t) {
		let n = await this.open();
		try {
			return await new Promise((r, i) => {
				let a = n.transaction("copies", t ? "readwrite" : "readonly"), o = a.objectStore("copies"), s = o.getAll(IDBKeyRange.bound(`${e}:`, `${e}:\uffff`)), c = [], l;
				s.onsuccess = () => {
					try {
						let n = new Map(s.result.map((e) => [e.key, e.value])), r = new Map(n);
						if (t?.(r), t) {
							for (let e of n.keys()) r.has(e) || o.delete(e);
							for (let [t, i] of r) {
								if (!t.startsWith(`${e}:`)) throw Error("Draft cache write outside its scope");
								n.get(t) !== i && o.put({
									key: t,
									value: i
								});
							}
						}
						c = [...r].map(([e, t]) => ({
							key: e,
							value: t
						}));
					} catch (e) {
						l = e, a.abort();
					}
				}, a.oncomplete = () => r(c), a.onerror = a.onabort = () => i(l ?? a.error ?? /* @__PURE__ */ Error("Local draft transaction failed"));
			});
		} finally {
			n.close();
		}
	}
	read(e) {
		return this.transaction(e);
	}
	update(e, t) {
		return this.transaction(e, t);
	}
};
//#endregion
//#region src/lib/admin-params.ts
function tm() {
	let e = window.mapsvgReactAdminParams;
	return {
		apiUrl: e?.apiUrl ?? "",
		ajaxUrl: e?.ajaxUrl ?? window.ajaxurl ?? "",
		nonce: e?.nonce ?? "",
		pluginUrl: e?.pluginUrl ?? "",
		homeUrl: e?.homeUrl ?? "",
		dashboardUrl: e?.dashboardUrl,
		licenseProductSlug: e?.licenseProductSlug,
		cssUrl: e?.cssUrl ?? "",
		previewScripts: e?.previewScripts,
		version: e?.version ?? "",
		plan: e?.plan ?? "",
		adminFeatureModules: Array.isArray(e?.adminFeatureModules) ? e.adminFeatureModules.filter((e) => typeof e == "string") : [],
		dataLayerV2Enabled: !!e?.dataLayerV2Enabled,
		globalQueriesEnabled: !!e?.globalQueriesEnabled,
		databaseImportEnabled: e?.databaseImportEnabled === !0 || e?.databaseImportEnabled === "1",
		maps: Array.isArray(e?.maps) ? e.maps : [],
		svgFiles: Array.isArray(e?.svgFiles) ? e.svgFiles : [],
		deferredCatalogs: e?.deferredCatalogs === !0 || e?.deferredCatalogs === "1",
		svgRegistryEnabled: e?.svgRegistryEnabled === !0 || e?.svgRegistryEnabled === "1",
		imageFiles: Array.isArray(e?.imageFiles) ? e.imageFiles : [],
		markerImages: Array.isArray(e?.markerImages) ? e.markerImages : [],
		user: {
			id: Number(e?.user?.id ?? 0),
			name: e?.user?.name ?? "User",
			email: e?.user?.email ?? "",
			isAdmin: !!e?.user?.isAdmin,
			canEditJavaScript: e?.user?.canEditJavaScript
		},
		options: e?.options ?? {},
		license: e?.license ?? void 0,
		ai: e?.ai
	};
}
function nm(e) {
	return e === "mapsvg-lite";
}
//#endregion
//#region src/lib/admin-rest-fetch.ts
var rm = "Your WordPress session could not be renewed. Sign in again, then retry. Your local drafts are retained.", im = class extends Error {}, am = null;
function om(e) {
	window.mapsvgReactAdminParams && (window.mapsvgReactAdminParams.nonce = e);
}
function sm() {
	let e = new URL(tm().apiUrl, window.location.href);
	if (e.origin !== window.location.origin) throw new im(rm);
	return e.searchParams.has("rest_route") ? e.searchParams.set("rest_route", "/wp/v2/users/me") : e.pathname = e.pathname.replace(/\/mapsvg\/v1\/?$/, "/wp/v2/users/me"), e.searchParams.set("_fields", "id"), e.href;
}
async function cm() {
	if (am) return am;
	let e = tm(), t = e.user.id;
	am = (async () => {
		let n = new AbortController(), r = window.setTimeout(() => n.abort(), 1e4);
		try {
			let r = new URL(e.ajaxUrl || "admin-ajax.php", window.location.href);
			if (r.origin !== window.location.origin || !t) throw new im(rm);
			r.searchParams.set("action", "rest-nonce");
			let i = await fetch(r.href, {
				credentials: "same-origin",
				cache: "no-store",
				signal: n.signal
			}), a = (await i.text()).trim();
			if (!i.ok || !/^[a-z0-9]{10}$/i.test(a)) throw new im(rm);
			let o = await fetch(sm(), {
				credentials: "same-origin",
				cache: "no-store",
				signal: n.signal,
				headers: { "X-WP-Nonce": a }
			}), s = await o.json();
			if (!o.ok || s?.id !== t || tm().user.id !== t) throw new im(rm);
			return om(a), a;
		} catch {
			throw new im(rm);
		} finally {
			window.clearTimeout(r);
		}
	})();
	try {
		return await am;
	} finally {
		am = null;
	}
}
async function lm(e, t = {}) {
	let n = new Headers(t.headers).get("X-WP-Nonce"), r = await fetch(e, t);
	if (n && r.status === 403 && window.location && new URL(e, window.location.href).origin === window.location.origin && (typeof r.clone == "function" ? await r.clone().json().catch(() => null) : null)?.code === "rest_cookie_invalid_nonce") {
		t.signal?.throwIfAborted();
		let i = tm().nonce, a = i && i !== n ? i : await cm();
		t.signal?.throwIfAborted();
		let o = new Headers(t.headers);
		if (o.set("X-WP-Nonce", a), r = await fetch(e, {
			...t,
			headers: o
		}), n = a, r.status === 403 && (await r.clone().json().catch(() => null))?.code === "rest_cookie_invalid_nonce") throw new im(rm);
	}
	let i = r.ok ? r.headers?.get("X-WP-Nonce") : null;
	return i && tm().nonce === n && om(i), r;
}
//#endregion
//#region src/lib/app-code-permissions.ts
var um = [
	"events",
	"middlewares",
	"onClick",
	"mouseOver",
	"mouseOut",
	"menuOnClick",
	"beforeLoad",
	"afterLoad"
], dm = (e) => e && typeof e == "object" && !Array.isArray(e) ? e : {}, fm = (e) => typeof e == "object" && e ? Object.values(e).some(fm) : e != null && e !== "", pm = () => tm().user.canEditJavaScript !== !1;
function mm(e) {
	let t = {};
	for (let n of um) fm(e[n]) && (t[n] = e[n]);
	let n = {};
	for (let [t, r] of Object.entries(dm(e.templates))) {
		let e = dm(r).js;
		fm(e) && (n[t] = e);
	}
	Object.keys(n).length && (t.templates = n);
	let r = {};
	for (let [t, n] of Object.entries(e.nodes ?? {})) {
		let e = dm(n), i = {};
		fm(e.js) && (i.js = e.js), fm(dm(e.template).js) && (i.template = dm(e.template).js), Object.keys(i).length && (r[String(e.id ?? t)] = i);
	}
	return Object.keys(r).length && (t.nodes = r), t;
}
function hm(e) {
	let t = dm(e);
	if (!Array.isArray(t.path)) return !1;
	let n = t.path;
	if (um.includes(n[0]) || n[0] === "templates" && (n.length < 3 || n[2] === "js") || n[0] === "nodes" && (n.length < 3 || n[2] === "js" || n[2] === "template" && (n.length < 4 || n[3] === "js"))) return !0;
	let r = t.value;
	for (let e of [...t.path].reverse()) r = { [e]: r };
	return Object.keys(mm(dm(r))).length > 0;
}
function gm(e, t) {
	let n = structuredClone(e), r = (e, t, n) => {
		Object.prototype.hasOwnProperty.call(t, n) ? e[n] = structuredClone(t[n]) : delete e[n];
	};
	for (let e of um) r(n, t, e);
	for (let [e, i] of Object.entries(dm(n.templates))) i && typeof i == "object" && !Array.isArray(i) && r(i, dm(dm(t.templates)[e]), "js");
	let i = new Map((Array.isArray(t.nodes) ? t.nodes : []).map((e) => [dm(e).id, dm(e)]));
	for (let e of Array.isArray(n.nodes) ? n.nodes : []) {
		let t = dm(e), n = i.get(t.id) ?? {};
		r(t, n, "js"), t.template && typeof t.template == "object" && r(dm(t.template), dm(n.template), "js");
	}
	let a = new Map((dm(t.stateGraph).states ?? []).map((e) => [dm(e).id, dm(e)]));
	for (let e of dm(n.stateGraph).states ?? []) {
		let t = dm(e), n = a.get(t.id);
		t.changes = [...Array.isArray(t.changes) ? t.changes.filter((e) => !hm(e)) : [], ...Array.isArray(n?.changes) ? structuredClone(n.changes.filter(hm)) : []];
	}
	return n;
}
//#endregion
//#region src/lib/resource-api-url.ts
function _m(e, t = "") {
	if (!e || e.includes("#")) throw Error("Invalid resource API baseUrl");
	let n = e.indexOf("?"), r = n < 0 ? e : e.slice(0, n), i = n < 0 ? "" : e.slice(n + 1), a = new URLSearchParams(i);
	if (a.has("rest_route")) {
		let e = a.get("rest_route");
		if (a.getAll("rest_route").length !== 1 || !e.startsWith("/")) throw Error("Invalid resource API rest_route");
		return a.set("rest_route", e.replace(/\/+$/, "") + t), r + "?" + a.toString();
	}
	return r.replace(/\/+$/, "") + t + (i ? "?" + i : "");
}
//#endregion
//#region src/lib/app-drafts.ts
var vm = /* @__PURE__ */ e({
	AppDraftSession: () => Om,
	DraftHttpError: () => xm,
	authoringSnapshot: () => Dm,
	autosaveAppDraftSessions: () => Mm,
	clearAppDraftSessions: () => jm,
	draftRequest: () => Sm,
	forgetAppDraftSession: () => Fm,
	getAppDraftSession: () => Am,
	handleAppDraftStorageEvent: () => Pm,
	prepareAppDraftSessionsForReload: () => Nm
});
function ym(e) {
	let t = JSON.parse(e);
	return t.synced === !0 && !t.confirmed && (t.confirmed = t.snapshot), t;
}
function bm(e) {
	if (!Q(e.snapshot, e.confirmed)) return JSON.stringify(e);
	let { confirmed: t, ...n } = e;
	return JSON.stringify({
		...n,
		synced: !0
	});
}
var xm = class extends Error {
	status;
	constructor(e, t) {
		super(e), this.status = t;
	}
};
async function Sm(e, t = "GET", n, r) {
	let i = tm(), a = new AbortController(), o = () => a.abort();
	r?.aborted && a.abort(), r?.addEventListener("abort", o, { once: !0 });
	let s = setTimeout(o, 15e3);
	try {
		let r = await lm(_m(i.apiUrl, e), {
			method: t,
			signal: a.signal,
			credentials: "same-origin",
			cache: "no-store",
			headers: {
				Accept: "application/json",
				"X-WP-Nonce": i.nonce,
				...n === void 0 ? {} : { "Content-Type": "application/json" }
			},
			...n === void 0 ? {} : { body: JSON.stringify(n) }
		}), o = await r.json().catch(() => null);
		if (a.signal.throwIfAborted(), !r.ok || !o) throw new xm(o?.message ?? `Draft operation failed (${r.status}).`, r.status);
		return o;
	} finally {
		clearTimeout(s), r?.removeEventListener("abort", o);
	}
}
function Cm(e) {
	if (e instanceof im) return !1;
	let t = e && typeof e == "object" && "status" in e ? Number(e.status) : null;
	return t === null || t >= 500 || t === 408 || t === 429;
}
function wm(e) {
	let { snapshot: t, revision: n, ...r } = e;
	return r;
}
function Tm(e) {
	return JSON.parse(JSON.stringify(e));
}
function Em(e) {
	return Array.isArray(e) ? `[${e.map(Em).join(",")}]` : e && typeof e == "object" ? `{${Object.keys(e).sort().map((t) => `${JSON.stringify(t)}:${Em(e[t])}`).join(",")}}` : JSON.stringify(e) ?? "null";
}
function Dm(e) {
	let t = Tm(e);
	return delete t.options.useShadowRoot, t.title = t.options.title ?? t.title ?? "", t.svgFilePath = t.options.source ?? "", t;
}
function Q(e, t) {
	return Em(e.options) === Em(t.options);
}
var Om = class {
	mapId;
	recoveryStore;
	copies = /* @__PURE__ */ new Map();
	activeId = null;
	recoveries = [];
	versions = [];
	publishedVersionId = null;
	ready = !1;
	error = null;
	offline = !1;
	connectionError = null;
	busy = !1;
	transitioning = !1;
	setTransitioning(e) {
		this.transitioning = e, this.emit();
	}
	listeners = /* @__PURE__ */ new Set();
	pending = null;
	initializing = null;
	reconnecting = null;
	versionMetadataGeneration = 0;
	writer = crypto.randomUUID();
	scope;
	api;
	storage;
	recoveryCache = /* @__PURE__ */ new Map();
	localPending = Promise.resolve();
	localGeneration = /* @__PURE__ */ new Map();
	localSlots = /* @__PURE__ */ new Map();
	serverDraftIds = /* @__PURE__ */ new Set();
	channel;
	disposed = !1;
	constructor(e, t = Sm, n = () => window.localStorage, r, i = new em()) {
		this.mapId = e, this.recoveryStore = i;
		let a = tm();
		this.scope = r ?? `mapsvg-app-drafts-v3:${encodeURIComponent(a.homeUrl)}:${a.user.id}:${e}`, this.api = t, this.storage = n;
	}
	subscribe = (e) => (this.listeners.add(e), () => {
		this.listeners.delete(e);
	});
	emit() {
		for (let e of this.listeners) e();
	}
	get active() {
		return this.activeId == null ? void 0 : this.copies.get(this.activeId);
	}
	key(e) {
		return `${this.scope}:${e}`;
	}
	path(e, t = "") {
		return `/apps/${this.mapId}/drafts${e === void 0 ? "" : `/${e}`}${t}`;
	}
	async waitForLocalPersistence() {
		await this.localPending;
	}
	async prepareForReload() {
		if (this.ready && (await this.autosave(), this.cacheSelection(), await this.waitForLocalPersistence(), [...this.copies.values()].some((e) => !e.localSaved) || this.activeId != null && this.recoveryCache.get(`${this.scope}:active`) !== String(this.activeId))) throw Error("Your App draft could not be saved locally. Keep the editor open and retry before reloading.");
	}
	localEntries() {
		return new Map(this.recoveryCache);
	}
	queueLocal(e) {
		this.localPending = this.localPending.catch(() => {}).then(e).catch((e) => {
			this.error = `Local cache failed: ${String(e)}`, this.emit();
		});
	}
	async updateCache(e) {
		let t = await this.recoveryStore.update(this.scope, e);
		this.recoveryCache = new Map(t.map((e) => [e.key, e.value]));
	}
	async migrateLocalStorage() {
		let e = /* @__PURE__ */ new Map(), t;
		try {
			t = this.storage();
			for (let n = 0; n < t.length; n++) {
				let r = t.key(n);
				if (r?.startsWith(`${this.scope}:`)) {
					let n = t.getItem(r);
					n !== null && e.set(r, n);
				}
			}
		} catch {
			return;
		}
		if (e.size) {
			for (let [t, n] of e) this.recoveryCache.has(t) || this.recoveryCache.set(t, n);
			await this.updateCache((t) => {
				for (let [n, r] of e) {
					let e = t.get(n);
					if (e === void 0) t.set(n, r);
					else if (e !== r && n !== `${this.scope}:active`) {
						try {
							let i = ym(r), a = ym(e);
							if (i.writer && i.writer === a.writer && Number.isInteger(i.sequence) && Number.isInteger(a.sequence) && (i.sequence > a.sequence && t.set(n, r), i.sequence !== a.sequence)) continue;
						} catch {}
						[...t.values()].includes(r) || t.set(`${n}:legacy:${crypto.randomUUID()}`, r);
					}
				}
			});
			for (let [n, r] of e) try {
				t.getItem(n) === r && t.removeItem(n);
			} catch {}
		}
	}
	draftId(e) {
		return Number(e.slice(this.scope.length + 1).split(":")[0]);
	}
	collectGarbage(e, t) {
		let n = /* @__PURE__ */ new Set(), r = /* @__PURE__ */ new Map();
		for (let [t, n] of e) try {
			let e = ym(n);
			if (e.writer && Number.isInteger(e.sequence) && e.snapshot?.options && e.confirmed?.options) {
				let n = `${this.draftId(t)}:${e.writer}`;
				r.set(n, Math.max(r.get(n) ?? -1, e.sequence));
			}
		} catch {}
		let i = [...e].sort(([e], [t]) => Number(t === this.key(this.draftId(t))) - Number(e === this.key(this.draftId(e))));
		for (let [a, o] of i) try {
			let i = ym(o), s = this.draftId(a);
			if (!s || !i.snapshot?.options || !i.confirmed?.options) continue;
			if (Number.isInteger(i.sequence) && i.sequence < (r.get(`${s}:${i.writer}`) ?? -1)) {
				e.delete(a);
				continue;
			}
			let c = !i.conflicted && Q(i.snapshot, i.confirmed), l = t?.id === s && Q(i.snapshot, t.snapshot);
			if (c && a !== this.key(s) && this.serverDraftIds.has(s) || l && !(c && a === this.key(s))) {
				e.delete(a);
				continue;
			}
			let u = `${s}:${Em(i.snapshot.options)}:${Em(i.confirmed.options)}:${i.revision}:${!!i.conflicted}`;
			n.has(u) ? e.delete(a) : n.add(u);
		} catch {}
		let a = /* @__PURE__ */ new Set(), o = !1;
		for (let [t, n] of e) if (this.draftId(t)) try {
			let e = ym(n);
			if (!e.snapshot?.options || !e.confirmed?.options) {
				o = !0;
				continue;
			}
			for (let t of [e.snapshot, e.confirmed]) typeof t.options.source == "string" && a.add(t.options.source);
		} catch {
			o = !0;
		}
		if (!o) {
			for (let t of e.keys()) if (t.startsWith(`${this.scope}:svg:`)) try {
				a.has(decodeURIComponent(t.slice(`${this.scope}:svg:`.length))) || e.delete(t);
			} catch {}
		}
	}
	cacheSelection() {
		let e = String(this.activeId ?? "");
		this.queueLocal(() => this.updateCache((t) => {
			e ? t.set(`${this.scope}:active`, e) : t.delete(`${this.scope}:active`);
		}));
	}
	persist(e) {
		let t = e.draft.id, n = (this.localGeneration.get(t) ?? 0) + 1;
		this.localGeneration.set(t, n);
		let r = {
			draft: wm(e.draft),
			snapshot: Tm(e.snapshot),
			confirmed: Tm(e.confirmed),
			revision: e.revision,
			writer: this.writer,
			updatedAt: Date.now(),
			sequence: n,
			conflicted: e.conflicted
		}, i = bm(r), a = !e.dirty && !e.conflicted;
		e.localSaved = a, e.localError = void 0, this.queueLocal(async () => {
			try {
				let o, s = !1;
				if (await this.updateCache((e) => {
					let n = this.localSlots.get(t), c = this.key(t), l = n?.key ?? c, u = e.get(l);
					if (a) {
						n && u === n.raw && e.delete(l), this.collectGarbage(e, {
							id: t,
							snapshot: r.confirmed
						});
						let a = e.get(c);
						(a === void 0 || this.isClean(a)) && e.set(c, i), o = {
							key: c,
							raw: i
						};
					} else u !== void 0 && u !== n?.raw && (l = `${c}:recovery:${this.writer}`, e.has(l) && e.get(l) !== n?.raw && (l += `:${crypto.randomUUID()}`), s = !0, r.conflicted = !0, i = bm(r)), e.set(l, i), o = {
						key: l,
						raw: i
					}, this.collectGarbage(e);
				}), this.localSlots.set(t, o), this.localGeneration.get(t) !== n || this.copies.get(t) !== e) return;
				if (e.localSaved = !0, e.localError = void 0, s && (e.conflicted = !0, e.serverError = "Another tab changed this draft. Your copy is retained; recover it as a new draft."), !r.conflicted && !this.disposed) try {
					this.channel?.postMessage({
						key: this.key(t),
						newValue: i
					});
				} catch {}
				this.emit();
			} catch (r) {
				this.localGeneration.get(t) === n && this.copies.get(t) === e && !a && (e.localSaved = !1, e.localError = `Local save failed: ${String(r)}`, this.emit());
			}
		});
	}
	isClean(e) {
		try {
			let t = ym(e);
			return !!(!t.conflicted && t.snapshot?.options && t.confirmed?.options && Q(t.snapshot, t.confirmed));
		} catch {
			return !1;
		}
	}
	dispose() {
		this.disposed = !0, this.channel?.close(), this.channel = void 0;
	}
	adopt(e) {
		let t = Dm(e.snapshot), n = {
			draft: e,
			confirmed: t,
			snapshot: t,
			revision: e.revision,
			dirty: !1,
			localSaved: !0,
			conflicted: !1
		}, r = [];
		try {
			for (let [i, a] of this.localEntries()) if (this.draftId(i) === e.id) try {
				let e = ym(a);
				if (!e.snapshot?.options || !e.confirmed?.options || !Number.isInteger(e.revision)) throw Error("Invalid local draft copy");
				(e.conflicted || !Q(e.snapshot, e.confirmed)) && (this.offline || !Q(e.snapshot, t)) && r.push({
					key: i,
					local: e
				});
			} catch (e) {
				n.localError = `Local recovery failed: ${String(e)}`;
			}
			r.sort((t, n) => t.local.writer === n.local.writer && t.local.sequence !== n.local.sequence ? (n.local.sequence ?? 0) - (t.local.sequence ?? 0) : (n.local.updatedAt ?? 0) - (t.local.updatedAt ?? 0) || Number(n.key === this.key(e.id)) - Number(t.key === this.key(e.id)));
			let i = r.find((e) => !e.local.conflicted) ?? r[0];
			if (i && (this.localSlots.set(e.id, {
				key: i.key,
				raw: this.recoveryCache.get(i.key)
			}), n.snapshot = Dm(i.local.snapshot), n.dirty = !Q(n.snapshot, t), n.conflicted = !!i.local.conflicted || n.dirty && !Q(Dm(i.local.confirmed), t), n.conflicted && (n.serverError = "The server has a newer version of this draft. Your local copy is retained.")), !i) {
				let t = this.recoveryCache.get(this.key(e.id));
				t !== void 0 && this.localSlots.set(e.id, {
					key: this.key(e.id),
					raw: t
				});
			}
			for (let t of r) !Q(t.local.snapshot, n.snapshot) && !this.recoveries.some((e) => Q(e.snapshot, t.local.snapshot)) && this.recoveries.push({
				key: t.key,
				title: `${e.title} · recovered tab`,
				snapshot: t.local.snapshot
			});
		} catch (e) {
			n.localError = `Local recovery failed: ${String(e)}`;
		}
		return this.copies.set(e.id, n), this.serverDraftIds.add(e.id), n;
	}
	markUnavailable(e) {
		this.offline = !0, this.connectionError = e instanceof Error ? e.message : String(e), this.emit();
	}
	async readIndex() {
		let e = new AbortController(), t, n = new Promise((n, r) => {
			t = setTimeout(() => {
				e.abort(), r(new xm("Draft server did not respond in time.", 408));
			}, 8e3);
		});
		try {
			return await Promise.race([this.api(this.path(), "GET", void 0, e.signal), n]);
		} finally {
			clearTimeout(t);
		}
	}
	cachedDrafts() {
		let e = /* @__PURE__ */ new Map();
		for (let [t, n] of this.recoveryCache) {
			let r = this.draftId(t);
			if (!(!Number.isSafeInteger(r) || r <= 0)) try {
				let i = ym(n);
				if (i.snapshot?.id !== this.mapId || !i.snapshot.options || i.confirmed?.id !== this.mapId || !i.confirmed.options || !Number.isSafeInteger(i.revision) || i.revision < 1) continue;
				(!e.has(r) || t === this.key(r)) && e.set(r, {
					id: r,
					map_id: this.mapId,
					title: String(i.draft?.title ?? i.snapshot.options.title ?? `Draft ${r}`),
					source_version_id: i.draft?.source_version_id ?? null,
					author_id: i.draft?.author_id ?? tm().user.id,
					created_at: i.draft?.created_at ?? "",
					updated_at: i.draft?.updated_at ?? "",
					snapshot: i.confirmed,
					revision: i.revision
				});
			} catch {}
		}
		return [...e.values()];
	}
	async cacheIndex(e) {
		await this.updateCache((t) => {
			for (let n of e.drafts) {
				let e = Dm(n.snapshot);
				this.collectGarbage(t, {
					id: n.id,
					snapshot: e
				});
				let r = this.key(n.id), i = t.get(r);
				(i === void 0 || this.isClean(i) && (!ym(i).draft || ym(i).revision !== n.revision || !Q(ym(i).snapshot, e))) && t.set(r, bm({
					draft: wm(n),
					snapshot: e,
					confirmed: e,
					revision: n.revision,
					writer: this.writer,
					updatedAt: Date.now()
				}));
			}
			t.set(`${this.scope}:index`, JSON.stringify({
				versions: e.versions,
				published_version_id: e.published_version_id
			})), this.collectGarbage(t);
		});
	}
	cachedPreview(e) {
		if (!Cm(e) || !this.active) throw e;
		return this.markUnavailable(e), Tm(this.active.snapshot);
	}
	async previewSvg(e, t, n) {
		let r = `${this.scope}:svg:${encodeURIComponent(e)}`, i = () => {
			try {
				let e = JSON.parse(this.recoveryCache.get(r) ?? "null");
				return typeof e?.content == "string" ? e.content : void 0;
			} catch {
				return;
			}
		};
		if (this.offline && i()) return i();
		let a;
		try {
			a = await n();
		} catch (e) {
			let t = i();
			if (t && Cm(e)) return t;
			throw e;
		}
		return this.queueLocal(() => this.updateCache((e) => {
			e.set(r, JSON.stringify({
				revision: t,
				content: a
			}));
		})), a;
	}
	async reconnect() {
		if (this.reconnecting) return this.reconnecting;
		let e = this.serial(async () => {
			if (!this.offline) return;
			let e;
			try {
				e = await this.readIndex();
			} catch (e) {
				throw this.connectionError = e instanceof Error ? e.message : String(e), this.emit(), e;
			}
			this.serverDraftIds = new Set(e.drafts.map((e) => e.id)), this.versions = e.versions, this.publishedVersionId = e.published_version_id;
			for (let t of this.copies.values()) {
				let n = e.drafts.find((e) => e.id === t.draft.id);
				if (!n) t.conflicted = !0, t.serverError = "Draft is missing on the server. Your local copy is retained; recover it as a new draft.";
				else {
					let e = Dm(n.snapshot);
					Q(e, t.confirmed) || Q(e, t.snapshot) ? (t.draft = n, t.revision = n.revision, t.confirmed = e, t.dirty = !Q(t.snapshot, e), t.conflicted || (t.serverError = void 0)) : (t.conflicted = !0, t.serverError = "The server draft changed while disconnected. Both copies are retained; recover your local copy as a new draft.");
				}
				this.persist(t);
			}
			for (let t of e.drafts) this.copies.has(t.id) || this.adopt(t);
			this.queueLocal(() => this.cacheIndex(e)), this.offline = !1, this.connectionError = null, this.emit();
		});
		this.reconnecting = e;
		try {
			await e;
		} finally {
			this.reconnecting === e && (this.reconnecting = null);
		}
	}
	initialize(e) {
		return this.initializing ||= (async () => {
			try {
				let t;
				try {
					for (let e of await this.recoveryStore.read(this.scope)) this.recoveryCache.set(e.key, e.value);
					await this.migrateLocalStorage();
				} catch (e) {
					t = `Local recovery failed: ${String(e)}`;
				}
				let n;
				try {
					n = await this.readIndex(), this.serverDraftIds = new Set(n.drafts.map((e) => e.id));
					try {
						await this.cacheIndex(n);
					} catch (e) {
						t = `Local recovery failed: ${String(e)}`;
					}
				} catch (e) {
					if (!Cm(e)) throw e;
					let t = this.cachedDrafts();
					if (!t.length) throw e;
					let r = {
						versions: [],
						published_version_id: null
					};
					try {
						let e = JSON.parse(this.recoveryCache.get(`${this.scope}:index`) ?? "null");
						Array.isArray(e?.versions) && (r = {
							versions: e.versions,
							published_version_id: e.published_version_id ?? null
						});
					} catch {}
					n = {
						drafts: t,
						...r
					}, this.markUnavailable(e);
				}
				typeof window.BroadcastChannel == "function" && !this.disposed && (this.channel = new window.BroadcastChannel(this.scope), this.channel.onmessage = (e) => this.onStorage(e.data));
				for (let e of n.drafts) {
					let n = this.adopt(e);
					t && (n.localError = t);
				}
				this.versions = n.versions, this.publishedVersionId = n.published_version_id;
				let r = null;
				if (r = Number(this.recoveryCache.get(`${this.scope}:active`)) || null, this.activeId = r && this.copies.has(r) ? r : n.drafts[0]?.id ?? null, e && this.active && !this.offline) {
					let t = {
						...this.active.snapshot,
						options: Tm(e)
					}, n = await this.api(this.path(), "POST", {
						title: "Recovered local draft",
						snapshot: t,
						client_key: `indexeddb:${Em(e)}`
					});
					this.adopt(n.draft), this.activeId = n.draft.id;
				}
				try {
					for (let [e, t] of this.localEntries()) {
						let n = Number(e.slice(this.scope.length + 1).split(":")[0]);
						if (!(!n || this.copies.has(n))) try {
							let r = ym(t);
							r.snapshot?.options && r.confirmed?.options && !this.recoveries.some((e) => Q(e.snapshot, r.snapshot)) && this.recoveries.push({
								key: e,
								title: `Missing server draft #${n}`,
								snapshot: r.snapshot
							});
						} catch {}
					}
				} catch {}
				this.offline && this.serverDraftIds.clear(), this.ready = !0, this.error = null;
			} catch (e) {
				throw this.error = e instanceof Error ? e.message : String(e), this.initializing = null, e;
			} finally {
				this.emit();
			}
		})(), this.initializing;
	}
	capture(e) {
		let t = this.active;
		if (!t || Number(e.id) !== this.mapId) return;
		let n = Dm(e);
		pm() || (n.options = gm(n.options, t.confirmed.options)), !Q(n, t.snapshot) && (t.snapshot = n, t.dirty = !Q(n, t.confirmed), this.persist(t), this.emit());
	}
	onStorage(e) {
		for (let t of this.copies.values()) if (!(e.key !== this.key(t.draft.id) || !e.newValue || t.conflicted)) try {
			let n = JSON.parse(e.newValue);
			if (n.writer === this.writer || !n.snapshot?.options || Q(n.snapshot, t.snapshot)) return;
			t.conflicted = !0, t.serverError = "Another tab changed this draft. Your copy is retained; recover it as a new draft.", this.persist(t), this.emit();
		} catch {}
	}
	async serial(e) {
		for (; this.pending;) await this.pending.catch(() => {});
		let t = e();
		this.pending = t;
		try {
			return await t;
		} finally {
			this.pending === t && (this.pending = null), this.emit();
		}
	}
	async flush(e = this.activeId) {
		if (e != null) return this.serial(async () => {
			let t = this.copies.get(e);
			if (!t) return;
			if (t.conflicted) throw Error(t.serverError ?? "Draft revision conflict");
			if (this.offline) throw Error("Server unavailable. Your local edits are retained.");
			if (!t.dirty) return;
			let n = Tm(t.snapshot), r = t.revision;
			this.busy = !0, this.emit();
			try {
				let i = await this.api(this.path(e), "PUT", {
					snapshot: n,
					revision: r
				});
				if (i.revision !== r + 1) throw Error("The server did not confirm the expected draft revision.");
				t.revision = i.revision, t.confirmed = n, t.dirty = !Q(t.snapshot, n), t.serverError = void 0, this.persist(t);
			} catch (e) {
				throw t.serverError = e instanceof Error ? e.message : String(e), e instanceof xm && (e.status === 409 || e.status === 404) && (t.conflicted = !0), Cm(e) && this.markUnavailable(e), this.persist(t), e;
			} finally {
				this.busy = !1, this.emit();
			}
		});
	}
	async saveSvg(e, t, n, r = this.activeId) {
		if (r == null) throw Error("Choose a draft before saving SVG");
		return await this.flush(r), this.serial(async () => {
			let i = this.copies.get(r);
			if (!i || this.activeId !== r || i.snapshot.options.source !== e) throw Error("This SVG editor is no longer active.");
			if (i.conflicted) throw Error(i.serverError ?? "Draft revision conflict");
			if (this.offline) throw Error("Server unavailable. Your SVG edits are retained in the editor.");
			let a = i.revision;
			this.busy = !0, this.emit();
			try {
				let o = await this.api(this.path(r, "/svg"), "POST", {
					revision: a,
					source: e,
					svg: t,
					resetGeometry: n
				});
				if (o.draft.id !== r || o.draft.revision !== a + 1 || typeof o.draft.snapshot?.options?.source != "string" || !Number.isSafeInteger(o.draft.snapshot.svgFileLastChanged) || Number(o.draft.snapshot.svgFileLastChanged) <= 0 || typeof o.svg != "string" || !o.svg) throw Error("The server did not confirm the saved SVG revision.");
				let s = Dm(o.draft.snapshot);
				if (i.snapshot.options.source === e) {
					let e = {
						...i.snapshot.options,
						source: s.options.source
					};
					if (s.options.svgAsset ? e.svgAsset = Tm(s.options.svgAsset) : delete e.svgAsset, n) for (let t of [
						"width",
						"height",
						"viewBox"
					]) e[t] = s.options[t];
					i.snapshot = Dm({
						...i.snapshot,
						options: e,
						svgFileLastChanged: s.svgFileLastChanged
					});
				}
				i.draft = o.draft, i.revision = o.draft.revision, i.confirmed = s, i.dirty = !Q(i.snapshot, s), i.serverError = void 0, this.persist(i);
				let c = `${this.scope}:svg:${encodeURIComponent(String(s.options.source))}`;
				return this.queueLocal(() => this.updateCache((e) => {
					e.set(c, JSON.stringify({
						revision: s.svgFileLastChanged,
						content: o.svg
					}));
				})), Tm(s);
			} catch (e) {
				throw i.serverError = e instanceof Error ? e.message : String(e), e instanceof xm && (e.status === 409 || e.status === 404) && (i.conflicted = !0), Cm(e) && this.markUnavailable(e), this.persist(i), e;
			} finally {
				this.busy = !1, this.emit();
			}
		});
	}
	async autosave() {
		if (this.offline) try {
			await this.reconnect();
		} catch {
			return;
		}
		for (let e of this.copies.values()) e.localSaved || (this.persist(e), this.emit()), e.dirty && !e.conflicted && await this.flush(e.draft.id).catch(() => {});
	}
	async select(e) {
		if (!this.copies.has(e)) throw Error("Draft not found");
		await this.flush().catch(() => {}), await this.serial(async () => {
			if (this.offline) {
				this.activeId = e, this.cacheSelection(), this.emit();
				return;
			}
			let t = await this.api(this.path(e)), n = this.copies.get(e);
			n.dirty || n.conflicted ? n.revision !== t.draft.revision && (n.conflicted = !0, n.serverError = "Server revision changed; recover your copy as a new draft.") : this.adopt(t.draft), this.activeId = e, this.cacheSelection(), this.emit();
		});
	}
	async pull(e = this.activeId) {
		if (e == null) throw Error("Choose a draft before pulling changes");
		let t = this.copies.get(e);
		if (!t) throw Error("Draft not found");
		let n = Tm(t.snapshot), r = () => this.copies.get(e) === t && Q(t.snapshot, n), i = () => /* @__PURE__ */ Error("The local draft changed while pulling. Your newer edits are retained; try again.");
		await this.serial(async () => {
			if (!r()) throw i();
			this.busy = !0, this.emit();
			try {
				await this.waitForLocalPersistence();
				let n = this.localSlots.get(e), a = this.key(e), o = this.recoveryCache.get(a), s = (await this.api(this.path(e)).catch((e) => {
					throw Cm(e) && this.markUnavailable(e), e;
				})).draft;
				if (s?.id !== e || s.map_id !== this.mapId || s.snapshot?.id !== this.mapId || !s.snapshot.options || !Number.isSafeInteger(s.revision) || s.revision < 1) throw Error("The server did not return the requested draft.");
				if (await this.waitForLocalPersistence(), !r()) throw i();
				let c = Dm(s.snapshot), l = (this.localGeneration.get(e) ?? 0) + 1, u = bm({
					draft: wm(s),
					snapshot: c,
					confirmed: c,
					revision: s.revision,
					writer: this.writer,
					updatedAt: Date.now(),
					sequence: l
				}), d;
				if (await this.updateCache((e) => {
					if (!r()) throw i();
					if (e.get(a) !== o || n && e.get(n.key) !== n.raw) throw Error("Another tab changed the local cache while pulling. Both copies are retained; try again.");
					if (o !== void 0 && n?.key !== a && !this.isClean(o)) {
						let t = `${a}:recovery:${crypto.randomUUID()}`;
						e.set(t, o);
						try {
							d = {
								key: t,
								title: `${s.title} · recovered tab`,
								snapshot: ym(o).snapshot
							};
						} catch {}
					}
					n && n.key !== a && e.delete(n.key), e.set(a, u), this.collectGarbage(e);
				}), !r()) throw this.persist(t), i();
				this.localGeneration.set(e, l), this.localSlots.set(e, {
					key: a,
					raw: u
				}), this.copies.set(e, {
					draft: s,
					snapshot: c,
					confirmed: c,
					revision: s.revision,
					dirty: !1,
					localSaved: !0,
					conflicted: !1
				}), this.serverDraftIds.add(e), this.recoveries = this.recoveries.filter((e) => e.key !== n?.key), d && !this.recoveries.some((e) => Q(e.snapshot, d.snapshot)) && this.recoveries.push(d), this.offline = !1, this.connectionError = null;
				try {
					this.channel?.postMessage({
						key: a,
						newValue: u
					});
				} catch {}
			} finally {
				this.busy = !1, this.emit();
			}
		});
	}
	async refreshHistory() {
		let e = this.versionMetadataGeneration, t = await this.api(this.path());
		this.serverDraftIds = new Set(t.drafts.map((e) => e.id)), e === this.versionMetadataGeneration && (this.versions = t.versions, this.publishedVersionId = t.published_version_id);
		for (let e of t.drafts) this.copies.has(e.id) || this.adopt(e);
		this.emit();
	}
	async create(e, t, n) {
		let r = n ? Tm(n) : this.active ? Tm(this.active.snapshot) : void 0, i = await this.api(this.path(), "POST", {
			title: e,
			...t ? { version_id: t } : { snapshot: r },
			client_key: crypto.randomUUID()
		});
		this.persist(this.adopt(i.draft)), this.activeId = i.draft.id, this.cacheSelection(), this.emit();
	}
	async rename(e, t) {
		await this.serial(async () => {
			let n = this.copies.get(e);
			if (!n) throw Error("Draft not found");
			if (this.offline) throw Error("Reconnect before renaming a draft. Your local edits are retained.");
			if (n.conflicted) throw Error(n.serverError ?? "Draft revision conflict");
			this.busy = !0, this.emit();
			try {
				let r = await this.api(this.path(e, "/rename"), "POST", {
					title: t,
					revision: n.revision
				});
				if (r.revision !== n.revision + 1 || typeof r.title != "string") throw Error("The server did not confirm the draft name.");
				n.revision = r.revision, n.draft = {
					...n.draft,
					title: r.title,
					revision: r.revision
				}, n.serverError = void 0, this.persist(n);
			} catch (e) {
				throw n.serverError = e instanceof Error ? e.message : String(e), e instanceof xm && (e.status === 409 || e.status === 404) && (n.conflicted = !0), Cm(e) && this.markUnavailable(e), this.persist(n), e;
			} finally {
				this.busy = !1, this.emit();
			}
		});
	}
	async renameVersion(e, t, n) {
		await this.serial(async () => {
			if (this.offline) throw Error("Reconnect before renaming a version.");
			if (!this.versions.some((t) => t.id === e)) throw Error("Version not found");
			this.busy = !0, this.emit();
			try {
				let r = await this.api(`/apps/${this.mapId}/versions/${e}/rename`, "POST", {
					title: t,
					expected_title: n
				});
				if (r.version_id !== e || typeof r.title != "string") throw Error("The server did not confirm the version name.");
				this.versionMetadataGeneration++, this.versions = this.versions.map((t) => t.id === e ? {
					...t,
					title: r.title
				} : t), this.queueLocal(() => this.cacheIndex({
					drafts: [],
					versions: this.versions,
					published_version_id: this.publishedVersionId
				}));
			} catch (e) {
				throw Cm(e) && this.markUnavailable(e), e;
			} finally {
				this.busy = !1, this.emit();
			}
		});
	}
	async restore(e) {
		let t = this.activeId;
		if (t == null) return;
		let n = Tm(this.active.snapshot);
		await this.flush(t), await this.serial(async () => {
			let r = this.copies.get(t);
			if (!Q(n, r.snapshot) || r.dirty || r.conflicted) throw Error("The draft changed during restore. Retry to include the latest changes.");
			let i = await this.api(this.path(t, "/restore"), "POST", {
				revision: r.revision,
				version_id: e
			});
			if (!Q(n, r.snapshot)) throw r.revision = i.draft.revision, r.confirmed = Dm(i.draft.snapshot), r.draft = i.draft, r.dirty = !Q(r.snapshot, r.confirmed), this.persist(r), Error("Version restored on server; newer local edits retained. Save them or switch drafts to inspect the restored version.");
			this.copies.delete(t);
			let a = i.draft, o = Dm(a.snapshot), s = {
				draft: a,
				snapshot: o,
				confirmed: o,
				revision: a.revision,
				dirty: !1,
				localSaved: !1,
				conflicted: !1
			};
			this.copies.set(t, s), this.persist(s), this.emit();
		}), await this.refreshHistory();
	}
	async checkout(e) {
		let t = await this.serial(async () => {
			this.busy = !0, this.emit();
			try {
				let t = await this.api(`/apps/${this.mapId}/versions/${e}/checkout`, "POST");
				if (t.version_id !== e || t.snapshot?.id !== this.mapId || !t.snapshot.options) throw Error("The server did not confirm the live version.");
				return this.publishedVersionId = t.version_id, Dm(t.snapshot);
			} finally {
				this.busy = !1, this.emit();
			}
		});
		return await this.refreshHistory().catch(() => {}), t;
	}
	async publish(e, t = this.activeId) {
		if (t == null) throw Error("Choose a draft before Publish");
		let n = Dm(e);
		pm() || (n.options = gm(n.options, this.copies.get(t).confirmed.options)), t === this.activeId && this.capture(e), this.offline && await this.reconnect();
		let r = await this.serial(async () => {
			let e = this.copies.get(t);
			if (e.conflicted) throw Error(e.serverError ?? "Draft revision conflict");
			this.busy = !0, this.emit();
			try {
				let r = await this.api(this.path(t, "/publish"), "POST", {
					snapshot: n,
					revision: e.revision,
					request_id: crypto.randomUUID()
				});
				if (r.revision !== e.revision + 1 || !Number.isSafeInteger(r.version_id)) throw Error("The server did not confirm the publication revision.");
				return e.draft.migration = !1, e.revision = r.revision, e.confirmed = n, e.dirty = !Q(e.snapshot, n), e.serverError = void 0, this.publishedVersionId = r.version_id, this.persist(e), r.version_id;
			} catch (t) {
				throw e.serverError = t instanceof Error ? t.message : String(t), t instanceof xm && (t.status === 409 || t.status === 404) && (e.conflicted = !0), Cm(t) && this.markUnavailable(t), this.persist(e), t;
			} finally {
				this.busy = !1, this.emit();
			}
		});
		return await this.refreshHistory().catch(() => {}), r;
	}
	async versionSnapshot(e) {
		return Dm((await this.api(`/apps/${this.mapId}/versions/${e}`)).version.snapshot);
	}
	async unpublish(e) {
		await this.serial(async () => {
			let t = await this.api(`/apps/${this.mapId}/versions/${e}/unpublish`, "POST");
			if (t.unpublished_version_id !== e || t.published_version_id !== null) throw Error("The server did not confirm Unpublish.");
			this.publishedVersionId = null, this.emit();
		}), await this.refreshHistory().catch(() => {});
	}
	async deleteDraft(e) {
		let t = this.copies.get(e);
		if (!t) throw Error("Draft not found");
		let n = Tm(t.snapshot);
		await this.serial(async () => {
			let t = this.copies.get(e);
			if ((await this.api(this.path(e), "DELETE", { revision: t.revision })).deleted_draft_id !== e) throw Error("The server did not confirm deletion.");
			if (!Q(n, t.snapshot)) throw t.conflicted = !0, t.serverError = "Draft deleted on server; newer local edits retained. Recover them as a new draft.", this.persist(t), Error(t.serverError);
			this.copies.delete(e), this.serverDraftIds.delete(e), this.localGeneration.set(e, (this.localGeneration.get(e) ?? 0) + 1);
			let r = this.localSlots.get(e);
			this.queueLocal(() => this.updateCache((t) => {
				let n = this.localSlots.get(e);
				n && t.get(n.key) === n.raw && t.delete(n.key), this.localSlots.delete(e);
				for (let [n, r] of t) this.draftId(n) === e && this.isClean(r) && t.delete(n);
				this.collectGarbage(t);
			})), r && (this.recoveries = this.recoveries.filter((e) => e.key !== r.key)), this.activeId === e && (this.activeId = this.copies.keys().next().value ?? null, this.cacheSelection()), this.emit();
		});
	}
	async preview(e) {
		if (this.offline) throw Error("Reconnect before opening the site preview. Your local edits are retained.");
		let t = this.activeId;
		if (t == null) throw Error("Choose a draft");
		return await this.flush(t), this.serial(async () => {
			let n = this.copies.get(t);
			if (n.dirty || n.conflicted) throw Error("Draft changed while saving. Retry preview.");
			return (await this.api(this.path(t, "/preview"), "POST", {
				revision: n.revision,
				url: e
			})).url;
		});
	}
}, km = /* @__PURE__ */ new Map();
function Am(e) {
	let t = km.get(e);
	return t || (t = new Om(e), km.set(e, t)), t;
}
function jm() {
	for (let e of km.values()) e.dispose();
	km.clear();
}
async function Mm() {
	await Promise.all([...km.values()].filter((e) => e.ready).map((e) => e.autosave()));
}
async function Nm() {
	let e = [...km.values()].filter((e) => e.ready);
	await Promise.all(e.map((e) => e.prepareForReload()));
}
function Pm(e) {
	for (let t of km.values()) t.onStorage(e);
}
function Fm(e) {
	km.get(e)?.dispose(), km.delete(e);
}
//#endregion
//#region src/lib/upgrade-reload.ts
var Im = /* @__PURE__ */ e({
	assertUpgradeReloadSafe: () => Rm,
	useUpgradeReloadGuard: () => zm,
	useUpgradeReloadPreparation: () => Bm
}), Lm = /* @__PURE__ */ new Set();
function Rm() {
	for (let e of Lm) e();
}
function zm(e, t) {
	let n = (0, i.useRef)({
		blocked: e,
		message: t
	});
	n.current = {
		blocked: e,
		message: t
	}, (0, i.useEffect)(() => {
		let e = () => {
			if (n.current.blocked) throw Error(n.current.message);
		};
		return Lm.add(e), () => {
			Lm.delete(e);
		};
	}, []);
}
function Bm(e) {
	let t = (0, i.useRef)(e);
	t.current = e, (0, i.useEffect)(() => {
		let e = () => t.current();
		return Lm.add(e), () => {
			Lm.delete(e);
		};
	}, []);
}
//#endregion
//#region src/lib/workspace-context.ts
var Vm = /* @__PURE__ */ e({ getActiveWorkspaceTabId: () => Hm });
function Hm() {
	return Z.getState().activeTabId;
}
//#endregion
//#region ../mapsvg/Core/productFeatures.ts
function Um(e, t, n) {
	return !["lite", "mapsvg-lite"].includes(t) || n?.hasCapability(e) === !0;
}
function Wm(e, t) {
	return t ? e : e.filter((e) => e.type === "distance");
}
function Gm(e, t) {
	let n = [...t];
	return [...e.flatMap((e) => e.type === "distance" ? n.length ? [n.shift()] : [] : [e]), ...n];
}
function Km(e) {
	return !!e && (e.type === "post" || !!e.postType);
}
//#endregion
//#region src/lib/product-features.ts
function qm(e) {
	return Um(e, tm().plan, window.MapSVG?.extensions);
}
function Jm(e) {
	return ["directory", "mobileToolbar"].includes(e) ? "directory" : null;
}
function Ym(e) {
	let t = Jm(e);
	return !t || qm(t);
}
//#endregion
//#region ../mapsvg/Gallery/gallery-options.ts
var Xm = {
	title: "",
	type: "multi",
	background: "",
	thumb_width: 50,
	thumb_height: 50,
	thumb_margin: 3,
	max_height: 250,
	lightbox: !0,
	lb_button_show: !1,
	lb_button_text: "View all ({{counter}})"
};
function Zm(e) {
	return Array.isArray(e) ? Array.from(e).filter((e) => typeof e == "object" && !!e && !Array.isArray(e) && (typeof e.id == "string" || typeof e.id == "number")) : [];
}
function Qm(e) {
	return typeof e.title == "string" && e.title.trim() ? e.title.trim() : `Gallery ${e.id}`;
}
function $m(e) {
	let t = crypto.randomUUID(), n = 1, r = new Set(e.map(Qm));
	for (; r.has(`Gallery ${n}`);) n++;
	return {
		...Xm,
		id: t,
		title: `Gallery ${n}`
	};
}
function eh(e) {
	return e === !0 || e === 1 || e === "1" || e === "true";
}
function th(e) {
	return /^(?:[A-Za-z_$][\w$]*)(?:\.(?:[A-Za-z_$][\w$]*|\d+))*$/.test(e) && !e.split(".").some((e) => [
		"__proto__",
		"prototype",
		"constructor"
	].includes(e));
}
function nh(e, t, n) {
	if (!th(n)) throw Error("Choose an image field or enter a valid field path.");
	return `{{mapsvg_gallery ${JSON.stringify(`${e}.${t}`)} ${n}}}`;
}
//#endregion
//#region src/lib/app-galleries.ts
var rh = /* @__PURE__ */ e({
	GALLERY_DEFAULTS: () => Xm,
	createAppGallery: () => oh,
	deleteAppGallery: () => sh,
	galleryBoolean: () => eh,
	galleryImageFields: () => ch,
	galleryTemplateTag: () => nh,
	galleryTitle: () => Qm,
	readGalleries: () => Zm,
	selectAppGallery: () => ih,
	updateAppGallery: () => ah,
	validGalleryFieldPath: () => th
});
function ih(e, t, n = "components") {
	Z.getState().patchMapSession(e, {
		selectedComponentId: n,
		selectedGalleryId: t === null ? null : String(t),
		selectedNodeId: null,
		selectedSceneId: null
	});
}
function ah(e, t, n) {
	if (!qm("gallery") || pp() !== e) return;
	let r = Zm(e.options.galleries);
	if (!r.some((e) => String(e.id) === String(t))) return;
	let i = Object.fromEntries(Object.entries(n).filter(([e]) => e !== "id"));
	Object.keys(i).length && Ep({ galleries: r.map((e) => String(e.id) === String(t) ? {
		...e,
		...i
	} : e) });
}
function oh(e, t) {
	if (!qm("gallery") || pp() !== e) return;
	let n = Zm(e.options.galleries), r = $m(n);
	return t && (r.id = t, r.title = t), Ep({ galleries: [...n, r] }), ih(e.id, r.id), r;
}
function sh(e, t) {
	!qm("gallery") || pp() !== e || (Ep({ galleries: Zm(e.options.galleries).filter((e) => String(e.id) !== String(t)) }), ih(e.id, null));
}
function ch(e) {
	let t = [];
	for (let [n, r] of [["Objects", e?.objectsRepository], ["Regions", e?.regionsRepository]]) for (let e of r?.getSchema?.()?.getFields?.() ?? []) {
		if (e.protected && e.visible === !1) continue;
		let r = e.type === "post" ? `${e.name}.gallery` : ["image", "images"].includes(e.type) ? e.name : null;
		if (!r) continue;
		let i = `${n} · ${e.label || e.name} (${r})`;
		t.push({
			value: `${n}:${r}`,
			path: r,
			label: i
		}), n === "Objects" && t.push({
			value: `RegionObjects:${r}`,
			path: `objects.0.${r}`,
			label: `Region → first object · ${e.label || e.name} (objects.0.${r})`
		});
	}
	return t;
}
//#endregion
//#region src/lib/install-shared-admin.ts
function lh() {
	Object.assign(window, { MapSVGAdminShared: {
		"@/lib/upgrade-reload": Im,
		"@/lib/workspace-context": Vm,
		"@/components/layout/LayoutMigrationDialog": Lp,
		"@/components/ComponentController": qp,
		"@/components/ui/tooltip": Yp,
		"@/lib/live-map-options": vp,
		"@/lib/apply-options-patch": cp,
		"@/lib/shadow-root": Ad,
		"@/lib/app-galleries": rh,
		"@/lib/app-drafts": vm
	} });
}
//#endregion
//#region \0mapsvg-shared-react:react-dom/client
var uh = /* @__PURE__ */ n(((e, t) => {
	t.exports = globalThis.MapSVGReact.ReactDOMClient;
}));
//#endregion
//#region src/lib/extensions.ts
function dh() {
	let e = window.MapSVG?.extensions;
	if (!e) throw Error("[mapsvg-admin-react] Shared MapSVG extension host is not available");
	return e;
}
function fh(e) {
	return dh().hasCapability(e);
}
//#endregion
//#region src/lib/admin-extension-registry.ts
function ph(e) {
	let t = dh();
	return t.seal("admin.panel"), t.get("admin.panel", e);
}
function mh() {
	let e = dh();
	return e.seal("admin.navigation"), e.list("admin.navigation").map((e) => e.value);
}
function hh() {
	return dh().list("admin.style").map((e) => e.value).filter((e) => typeof e.url == "string" && e.url !== "");
}
function gh() {
	let e = dh();
	for (let t of [
		"admin.navigation",
		"admin.panel",
		"admin.style",
		"admin.component",
		"admin.node",
		"admin.schema"
	]) e.seal(t);
	e.sealCapabilities();
}
function _h(e) {
	let t = new Set(e.map((e) => e.id)), n = mh().filter((e) => e.surface === "settings-tab").map((e) => e.tab);
	for (let e of n) {
		if (t.has(e.id)) throw Error("[MapSVG admin extensions] Paid settings tab \"" + e.id + "\" collides with a Lite-owned tab. Register a panel for the Lite tab instead.");
		t.add(e.id);
	}
	return [...e, ...n].sort((e, t) => e.order - t.order || e.id.localeCompare(t.id));
}
//#endregion
//#region src/lib/project-chats.ts
var vh = "mapsvg:project-chat-changed";
//#endregion
//#region src/lib/use-app-draft-session.ts
function yh(e) {
	let [, t] = (0, i.useReducer)((e) => e + 1, 0), n = e == null ? null : Am(e);
	return (0, i.useEffect)(() => n?.subscribe(t), [n]), n;
}
//#endregion
//#region src/components/ui/empty.tsx
function bh({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "empty",
		className: X("flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12", e),
		...t
	});
}
function xh({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "empty-header",
		className: X("flex max-w-sm flex-col items-center gap-2 text-center", e),
		...t
	});
}
function Sh({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "empty-title",
		className: X("text-lg font-medium tracking-tight", e),
		...t
	});
}
function Ch({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "empty-description",
		className: X("text-sm/relaxed text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-primary", e),
		...t
	});
}
//#endregion
//#region src/components/StartScreenPanel.tsx
function wh({ onNewMap: e, chatId: t, onChatSaved: n }) {
	let r = (0, i.useMemo)(() => ph("ai-start-screen")?.Panel, []), a = /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "start-screen-actions",
		role: "group",
		"aria-label": "Map creation",
		className: "flex flex-wrap justify-center gap-2 py-2",
		children: /* @__PURE__ */ (0, v.jsx)(Ju, {
			type: "button",
			variant: "outline",
			onClick: e,
			children: "Create new map manually"
		})
	});
	return /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "map-preview-panel",
		className: "relative flex h-full min-h-0 flex-col overflow-hidden",
		children: /* @__PURE__ */ (0, v.jsx)("div", {
			className: "relative min-h-0 flex-1 overflow-hidden",
			children: r ? /* @__PURE__ */ (0, v.jsx)(r, {
				mapId: null,
				chatId: t,
				onChatSaved: n,
				startScreenActions: a
			}) : /* @__PURE__ */ (0, v.jsx)("div", {
				className: "flex h-full items-center justify-center p-6",
				children: /* @__PURE__ */ (0, v.jsxs)(bh, {
					className: "border-0 md:p-6",
					children: [/* @__PURE__ */ (0, v.jsxs)(xh, { children: [/* @__PURE__ */ (0, v.jsx)(Sh, {
						className: "text-xl",
						children: "Welcome to MapSVG"
					}), /* @__PURE__ */ (0, v.jsx)(Ch, { children: "Select a map from Maps, or create a new one to get started." })] }), a]
				})
			})
		})
	});
}
//#endregion
//#region src/components/ui/dropdown-menu.tsx
function Th({ ...e }) {
	return /* @__PURE__ */ (0, v.jsx)(Oc, {
		"data-slot": "dropdown-menu",
		...e
	});
}
function Eh({ ...e }) {
	return /* @__PURE__ */ (0, v.jsx)(Ac, {
		"data-slot": "dropdown-menu-trigger",
		...e
	});
}
function Dh({ className: e, sideOffset: t = 4, ...n }) {
	let r = Fd();
	return /* @__PURE__ */ (0, v.jsx)(jc, {
		container: r,
		children: /* @__PURE__ */ (0, v.jsx)(Nc, {
			"data-slot": "dropdown-menu-content",
			sideOffset: t,
			className: X("z-50 max-h-(--radix-dropdown-menu-content-available-height) min-w-[8rem] origin-(--radix-dropdown-menu-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", e),
			...n
		})
	});
}
function Oh({ ...e }) {
	return /* @__PURE__ */ (0, v.jsx)(Pc, {
		"data-slot": "dropdown-menu-group",
		...e
	});
}
function kh({ className: e, inset: t, variant: n = "default", ...r }) {
	return /* @__PURE__ */ (0, v.jsx)(Ic, {
		"data-slot": "dropdown-menu-item",
		"data-inset": t,
		"data-variant": n,
		className: X("relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[inset]:pl-8 data-[variant=destructive]:text-destructive data-[variant=destructive]:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive dark:data-[variant=destructive]:focus:bg-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground data-[variant=destructive]:*:[svg]:text-destructive!", e),
		...r
	});
}
function Ah({ className: e, children: t, checked: n, ...r }) {
	return /* @__PURE__ */ (0, v.jsxs)(Lc, {
		"data-slot": "dropdown-menu-checkbox-item",
		className: X("relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", e),
		checked: n,
		...r,
		children: [/* @__PURE__ */ (0, v.jsx)("span", {
			className: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ (0, v.jsx)(Bc, { children: /* @__PURE__ */ (0, v.jsx)(od, { className: "size-4" }) })
		}), t]
	});
}
function jh({ ...e }) {
	return /* @__PURE__ */ (0, v.jsx)(Rc, {
		"data-slot": "dropdown-menu-radio-group",
		...e
	});
}
function Mh({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ (0, v.jsxs)(zc, {
		"data-slot": "dropdown-menu-radio-item",
		className: X("relative flex cursor-default items-center gap-2 rounded-sm py-1.5 pr-2 pl-8 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", e),
		...n,
		children: [/* @__PURE__ */ (0, v.jsx)("span", {
			className: "pointer-events-none absolute left-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ (0, v.jsx)(Bc, { children: /* @__PURE__ */ (0, v.jsx)(cd, { className: "size-2 fill-current" }) })
		}), t]
	});
}
function Nh({ className: e, inset: t, ...n }) {
	return /* @__PURE__ */ (0, v.jsx)(Fc, {
		"data-slot": "dropdown-menu-label",
		"data-inset": t,
		className: X("px-2 py-1.5 text-sm font-medium data-[inset]:pl-8", e),
		...n
	});
}
function Ph({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)(Vc, {
		"data-slot": "dropdown-menu-separator",
		className: X("-mx-1 my-1 h-px bg-border", e),
		...t
	});
}
function Fh({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("span", {
		"data-slot": "dropdown-menu-shortcut",
		className: X("ml-auto text-xs tracking-widest text-muted-foreground", e),
		...t
	});
}
//#endregion
//#region src/hooks/use-mobile.ts
var Ih = 768;
function Lh() {
	let [e, t] = i.useState(void 0);
	return i.useEffect(() => {
		let e = window.matchMedia(`(max-width: ${Ih - 1}px)`), n = () => {
			t(window.innerWidth < Ih);
		};
		return e.addEventListener("change", n), t(window.innerWidth < Ih), () => e.removeEventListener("change", n);
	}, []), !!e;
}
//#endregion
//#region src/components/ui/input.tsx
function Rh({ className: e, type: t, ...n }) {
	return /* @__PURE__ */ (0, v.jsx)("input", {
		type: t,
		"data-slot": "input",
		className: X("h-7 w-full min-w-0 rounded-[5px] border border-input bg-background px-2 py-1 text-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/sheet.tsx
function zh({ ...e }) {
	return /* @__PURE__ */ (0, v.jsx)(yr, {
		"data-slot": "sheet",
		...e
	});
}
function Bh({ ...e }) {
	return /* @__PURE__ */ (0, v.jsx)(Tr, {
		"data-slot": "sheet-portal",
		...e
	});
}
function Vh({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)(Dr, {
		"data-slot": "sheet-overlay",
		className: X("fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	});
}
function Hh({ className: e, children: t, side: n = "right", showCloseButton: r = !0, ...i }) {
	return /* @__PURE__ */ (0, v.jsxs)(Bh, { children: [/* @__PURE__ */ (0, v.jsx)(Vh, {}), /* @__PURE__ */ (0, v.jsxs)(jr, {
		"data-slot": "sheet-content",
		className: X("fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500", n === "right" && "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm", n === "left" && "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm", n === "top" && "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top", n === "bottom" && "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom", e),
		...i,
		children: [t, r && /* @__PURE__ */ (0, v.jsxs)(Rr, {
			className: "absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary",
			children: [/* @__PURE__ */ (0, v.jsx)(kd, { className: "size-4" }), /* @__PURE__ */ (0, v.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function Uh({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "sheet-header",
		className: X("flex flex-col gap-1.5 p-4", e),
		...t
	});
}
function Wh({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)(Fr, {
		"data-slot": "sheet-title",
		className: X("font-semibold text-foreground", e),
		...t
	});
}
function Gh({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)(Ir, {
		"data-slot": "sheet-description",
		className: X("text-sm text-muted-foreground", e),
		...t
	});
}
//#endregion
//#region src/components/ui/skeleton.tsx
function Kh({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "skeleton",
		className: X("animate-pulse rounded-md bg-accent", e),
		...t
	});
}
//#endregion
//#region src/components/ui/sidebar.tsx
var qh = "sidebar_state", Jh = 3600 * 24 * 7, Yh = "16rem", Xh = "18rem", Zh = "3rem", Qh = "b", $h = i.createContext(null);
function eg() {
	let e = i.useContext($h);
	if (!e) throw Error("useSidebar must be used within a SidebarProvider.");
	return e;
}
function tg({ defaultOpen: e = !0, open: t, onOpenChange: n, className: r, style: a, children: o, ...s }) {
	let c = Lh(), [l, u] = i.useState(!1), [d, f] = i.useState(e), p = t ?? d, m = i.useCallback((e) => {
		let t = typeof e == "function" ? e(p) : e;
		n ? n(t) : f(t), document.cookie = `${qh}=${t}; path=/; max-age=${Jh}`;
	}, [n, p]), h = i.useCallback(() => c ? u((e) => !e) : m((e) => !e), [
		c,
		m,
		u
	]);
	i.useEffect(() => {
		let e = (e) => {
			e.key === Qh && (e.metaKey || e.ctrlKey) && (e.preventDefault(), h());
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, [h]);
	let g = p ? "expanded" : "collapsed", _ = i.useMemo(() => ({
		state: g,
		open: p,
		setOpen: m,
		isMobile: c,
		openMobile: l,
		setOpenMobile: u,
		toggleSidebar: h
	}), [
		g,
		p,
		m,
		c,
		l,
		u,
		h
	]);
	return /* @__PURE__ */ (0, v.jsx)($h.Provider, {
		value: _,
		children: /* @__PURE__ */ (0, v.jsx)(Xp, {
			delayDuration: 0,
			children: /* @__PURE__ */ (0, v.jsx)("div", {
				"data-slot": "sidebar-wrapper",
				style: {
					"--sidebar-width": Yh,
					"--sidebar-width-icon": Zh,
					...a
				},
				className: X("group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar", r),
				...s,
				children: o
			})
		})
	});
}
function ng({ side: e = "left", variant: t = "sidebar", collapsible: n = "offcanvas", responsive: r = !0, className: i, children: a, ...o }) {
	let { isMobile: s, state: c, openMobile: l, setOpenMobile: u } = eg();
	return n === "none" ? /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "sidebar",
		className: X("flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground", i),
		...o,
		children: a
	}) : r && s ? /* @__PURE__ */ (0, v.jsx)(zh, {
		open: l,
		onOpenChange: u,
		...o,
		children: /* @__PURE__ */ (0, v.jsxs)(Hh, {
			"data-sidebar": "sidebar",
			"data-slot": "sidebar",
			"data-mobile": "true",
			className: "w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden",
			style: { "--sidebar-width": Xh },
			side: e,
			children: [/* @__PURE__ */ (0, v.jsxs)(Uh, {
				className: "sr-only",
				children: [/* @__PURE__ */ (0, v.jsx)(Wh, { children: "Sidebar" }), /* @__PURE__ */ (0, v.jsx)(Gh, { children: "Displays the mobile sidebar." })]
			}), /* @__PURE__ */ (0, v.jsx)("div", {
				className: "flex h-full w-full flex-col",
				children: a
			})]
		})
	}) : /* @__PURE__ */ (0, v.jsxs)("div", {
		className: X("group peer text-sidebar-foreground", r ? "hidden md:block" : "block"),
		"data-state": c,
		"data-collapsible": c === "collapsed" ? n : "",
		"data-variant": t,
		"data-side": e,
		"data-slot": "sidebar",
		children: [/* @__PURE__ */ (0, v.jsx)("div", {
			"data-slot": "sidebar-gap",
			className: X("relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", t === "floating" || t === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)")
		}), /* @__PURE__ */ (0, v.jsx)("div", {
			"data-slot": "sidebar-container",
			className: X("fixed inset-y-0 z-10 h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear", r ? "hidden md:flex" : "flex", e === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]", t === "floating" || t === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l", i),
			...o,
			children: /* @__PURE__ */ (0, v.jsx)("div", {
				"data-sidebar": "sidebar",
				"data-slot": "sidebar-inner",
				className: "flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm",
				children: a
			})
		})]
	});
}
function rg({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("main", {
		"data-slot": "sidebar-inset",
		className: X("relative flex w-full flex-1 flex-col bg-background", "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2", e),
		...t
	});
}
function ig({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)(Rh, {
		"data-slot": "sidebar-input",
		"data-sidebar": "input",
		className: X("h-7 w-full bg-background shadow-none", e),
		...t
	});
}
function ag({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "sidebar-header",
		"data-sidebar": "header",
		className: X("flex flex-col gap-2 p-2", e),
		...t
	});
}
function og({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "sidebar-footer",
		"data-sidebar": "footer",
		className: X("flex flex-col gap-2 p-2", e),
		...t
	});
}
function sg({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "sidebar-content",
		"data-sidebar": "content",
		className: X("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", e),
		...t
	});
}
function cg({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "sidebar-group",
		"data-sidebar": "group",
		className: X("relative flex w-full min-w-0 flex-col p-2", e),
		...t
	});
}
function lg({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "sidebar-group-content",
		"data-sidebar": "group-content",
		className: X("w-full text-xs", e),
		...t
	});
}
function ug({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("ul", {
		"data-slot": "sidebar-menu",
		"data-sidebar": "menu",
		className: X("flex w-full min-w-0 flex-col gap-1", e),
		...t
	});
}
function dg({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("li", {
		"data-slot": "sidebar-menu-item",
		"data-sidebar": "menu-item",
		className: X("group/menu-item relative", e),
		...t
	});
}
var fg = l("peer/menu-button flex w-full items-center gap-1.5 overflow-hidden rounded-[5px] p-1.5 text-left text-xs ring-sidebar-ring outline-hidden transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pr-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", {
	variants: {
		variant: {
			default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
			outline: "bg-background shadow-[0_0_0_1px_var(--sidebar-border)] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_var(--sidebar-accent)]"
		},
		size: {
			default: "h-7 text-xs",
			sm: "h-6 text-xs",
			lg: "h-10 text-xs group-data-[collapsible=icon]:p-0!"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function pg({ asChild: e = !1, isActive: t = !1, variant: n = "default", size: r = "default", tooltip: i, className: a, ...o }) {
	let s = e ? T : "button", { isMobile: c, state: l } = eg(), u = /* @__PURE__ */ (0, v.jsx)(s, {
		"data-slot": "sidebar-menu-button",
		"data-sidebar": "menu-button",
		"data-size": r,
		"data-active": t,
		className: X(fg({
			variant: n,
			size: r
		}), a),
		...o
	});
	return i ? (typeof i == "string" && (i = { children: i }), /* @__PURE__ */ (0, v.jsxs)(Zp, { children: [/* @__PURE__ */ (0, v.jsx)(Qp, {
		asChild: !0,
		children: u
	}), /* @__PURE__ */ (0, v.jsx)($p, {
		side: "right",
		align: "center",
		hidden: l !== "collapsed" || c,
		...i
	})] })) : u;
}
function mg({ className: e, asChild: t = !1, showOnHover: n = !1, ...r }) {
	return /* @__PURE__ */ (0, v.jsx)(t ? T : "button", {
		"data-slot": "sidebar-menu-action",
		"data-sidebar": "menu-action",
		className: X("absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground ring-sidebar-ring outline-hidden transition-transform peer-hover/menu-button:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "after:absolute after:-inset-2 md:after:hidden", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", n && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground data-[state=open]:opacity-100 md:opacity-0", e),
		...r
	});
}
//#endregion
//#region src/components/AppSidebar.tsx
var hg = "h-8 p-2 cursor-pointer";
function gg() {
	return /* @__PURE__ */ (0, v.jsxs)("svg", {
		"aria-hidden": "true",
		focusable: "false",
		viewBox: "0 0 16 16",
		fill: "currentColor",
		children: [
			/* @__PURE__ */ (0, v.jsx)("path", { d: "M12.633 7.653c0-.848-.305-1.435-.566-1.892l-.08-.13c-.317-.51-.594-.958-.594-1.48 0-.63.478-1.218 1.152-1.218q.03 0 .058.003l.031.003A6.84 6.84 0 0 0 8 1.137 6.86 6.86 0 0 0 2.266 4.23c.16.005.313.009.442.009.717 0 1.828-.087 1.828-.087.37-.022.414.521.044.565 0 0-.371.044-.785.065l2.5 7.434 1.5-4.506-1.07-2.929c-.369-.022-.719-.065-.719-.065-.37-.022-.326-.588.043-.566 0 0 1.134.087 1.808.087.718 0 1.83-.087 1.83-.087.37-.022.413.522.043.566 0 0-.372.043-.785.065l2.48 7.377.684-2.287.054-.173c.27-.86.469-1.495.469-2.046zM1.137 8a6.86 6.86 0 0 0 3.868 6.176L1.73 5.206A6.8 6.8 0 0 0 1.137 8" }),
			/* @__PURE__ */ (0, v.jsx)("path", { d: "M6.061 14.583 8.121 8.6l2.109 5.78q.02.05.049.094a6.85 6.85 0 0 1-4.218.109m7.96-9.876q.046.328.047.706c0 .696-.13 1.479-.522 2.458l-2.096 6.06a6.86 6.86 0 0 0 2.572-9.224z" }),
			/* @__PURE__ */ (0, v.jsx)("path", {
				fillRule: "evenodd",
				d: "M0 8c0-4.411 3.589-8 8-8s8 3.589 8 8-3.59 8-8 8-8-3.589-8-8m.367 0c0 4.209 3.424 7.633 7.633 7.633S15.632 12.209 15.632 8C15.632 3.79 12.208.367 8 .367 3.79.367.367 3.79.367 8"
			})
		]
	});
}
async function _g(e) {
	try {
		await navigator.clipboard.writeText(e);
		return;
	} catch {
		let t = document.createElement("textarea");
		t.value = e, t.setAttribute("readonly", ""), t.style.position = "fixed", t.style.left = "-9999px", document.body.appendChild(t), t.select(), document.execCommand("copy"), t.remove();
	}
}
function vg({ version: e, pluginUrl: t, maps: n, chats: r = [], selectedChatId: a = null, onSelectChat: o, onRenameChat: s, selectedMapId: c, activeSection: l, settingsOpen: u = !1, usageOpen: d = !1, onNewChat: f, onSelectMap: p, onOpenDatabase: m, onOpenSettings: h, onOpenUsage: g, onRenameMap: _, onDuplicateMap: y, duplicatingMapId: b, duplicateError: x, onDeleteMap: S }) {
	let [C, w] = (0, i.useState)(""), [T, E] = (0, i.useState)(!1), [D, O] = (0, i.useState)(!1), k = (0, i.useRef)(null), { state: A, setOpen: j } = eg(), M = A === "collapsed", ee = (0, i.useRef)(null), [N, te] = (0, i.useState)(M);
	(0, i.useLayoutEffect)(() => {
		if (!M) {
			te(!1);
			return;
		}
		let e = ee.current?.getAnimations?.().filter((e) => "transitionProperty" in e && [
			"width",
			"left",
			"right"
		].includes(String(e.transitionProperty))) ?? [];
		if (!e.length) {
			te(!0);
			return;
		}
		te(!1);
		let t = !1;
		return Promise.allSettled(e.map((e) => e.finished)).then(() => {
			t || te(!0);
		}), () => {
			t = !0;
		};
	}, [M]);
	let P = M && N, ne = `${t.replace(/\/?$/, "/")}img/logo-icon.png`, re = (0, i.useMemo)(() => {
		let e = C.trim().toLowerCase();
		return e ? n.filter((t) => (t.title?.trim() || `Map #${t.id}`).toLowerCase().includes(e) || String(t.id).includes(e)) : n;
	}, [n, C]), F = r.filter((e) => e.mapId == null && (!C.trim() || e.title.toLowerCase().includes(C.trim().toLowerCase()) || String(e.id).includes(C.trim()))), I = () => {
		M && j(!0), E(!0), window.requestAnimationFrame(() => k.current?.focus());
	}, ie = async (e) => {
		let t = e.title?.trim() || `Map #${e.id}`, n = window.prompt("Rename map", t)?.trim();
		!n || n === t || await _(e.id, n);
	}, ae = async (e) => {
		let t = e.title?.trim() || `Map #${e.id}`;
		window.confirm(`Delete "${t}"?`) && await S(e.id);
	};
	return /* @__PURE__ */ (0, v.jsxs)(ng, {
		ref: ee,
		collapsible: "icon",
		responsive: !1,
		className: "mapsvg-primary-sidebar border-r border-sidebar-border text-[13px]! [&_*]:text-[13px]! group-data-[collapsible=icon]:cursor-e-resize",
		"aria-label": "MapSVG navigation",
		onClick: (e) => {
			M && (e.target.closest("button,a,input,textarea,select,[role='menuitem']") || j(!0));
		},
		children: [
			/* @__PURE__ */ (0, v.jsxs)(ag, {
				className: "shrink-0 gap-1.5 pb-0",
				children: [
					/* @__PURE__ */ (0, v.jsxs)("div", {
						className: "relative flex h-9 items-center gap-1",
						children: [
							/* @__PURE__ */ (0, v.jsxs)("div", {
								className: "group/sidebar-logo relative flex size-8 shrink-0 items-center justify-center",
								children: [/* @__PURE__ */ (0, v.jsx)("img", {
									src: ne,
									alt: "",
									className: `size-6 object-contain transition-opacity ${P ? "group-hover/sidebar-logo:opacity-0" : ""}`,
									width: 24,
									height: 24
								}), P ? /* @__PURE__ */ (0, v.jsxs)(Zp, { children: [/* @__PURE__ */ (0, v.jsx)(Qp, {
									asChild: !0,
									children: /* @__PURE__ */ (0, v.jsx)(Ju, {
										type: "button",
										variant: "ghost",
										size: "icon",
										"aria-label": "Toggle sidebar",
										className: "absolute inset-0 size-8 cursor-e-resize opacity-0 transition-opacity group-hover/sidebar-logo:opacity-100",
										onClick: () => j(!0),
										children: /* @__PURE__ */ (0, v.jsx)(Sd, { className: "size-4" })
									})
								}), /* @__PURE__ */ (0, v.jsx)($p, {
									side: "right",
									sideOffset: 8,
									children: "Toggle sidebar"
								})] }) : null]
							}),
							/* @__PURE__ */ (0, v.jsxs)("span", {
								className: "sr-only",
								children: ["MapSVG ", e || ""]
							}),
							M ? null : /* @__PURE__ */ (0, v.jsxs)("div", {
								className: "ml-auto flex items-center gap-0.5",
								children: [/* @__PURE__ */ (0, v.jsx)(Ju, {
									type: "button",
									variant: "ghost",
									size: "icon",
									className: "size-8 cursor-pointer",
									"aria-label": "Search projects",
									onClick: I,
									children: /* @__PURE__ */ (0, v.jsx)(wd, { className: "size-4" })
								}), /* @__PURE__ */ (0, v.jsx)(Ju, {
									type: "button",
									variant: "ghost",
									size: "icon",
									className: "size-8 cursor-pointer",
									"aria-label": "Collapse sidebar",
									onClick: () => j(!1),
									children: /* @__PURE__ */ (0, v.jsx)(Sd, { className: "size-4" })
								})]
							})
						]
					}),
					/* @__PURE__ */ (0, v.jsxs)(ug, { children: [
						/* @__PURE__ */ (0, v.jsx)(dg, { children: /* @__PURE__ */ (0, v.jsxs)(pg, {
							className: hg,
							tooltip: "New chat",
							onClick: f,
							children: [/* @__PURE__ */ (0, v.jsx)(Ed, {}), /* @__PURE__ */ (0, v.jsx)("span", { children: "New chat" })]
						}) }),
						/* @__PURE__ */ (0, v.jsx)(dg, { children: /* @__PURE__ */ (0, v.jsxs)(pg, {
							className: hg,
							tooltip: "Database",
							isActive: l === "database",
							onClick: m,
							children: [/* @__PURE__ */ (0, v.jsx)(dd, {}), /* @__PURE__ */ (0, v.jsx)("span", { children: "Database" })]
						}) }),
						/* @__PURE__ */ (0, v.jsx)(dg, { children: /* @__PURE__ */ (0, v.jsxs)(pg, {
							className: hg,
							tooltip: "Projects",
							onClick: () => j(!0),
							children: [/* @__PURE__ */ (0, v.jsx)(pd, {}), /* @__PURE__ */ (0, v.jsx)("span", { children: "Projects" })]
						}) })
					] }),
					T && !M ? /* @__PURE__ */ (0, v.jsx)("div", {
						className: "relative px-0",
						children: /* @__PURE__ */ (0, v.jsx)(ig, {
							ref: k,
							placeholder: "Search projects...",
							value: C,
							onChange: (e) => w(e.target.value),
							onKeyDown: (e) => {
								e.key === "Escape" && (E(!1), w(""));
							}
						})
					}) : null
				]
			}),
			/* @__PURE__ */ (0, v.jsx)(sg, {
				className: "min-h-0",
				children: /* @__PURE__ */ (0, v.jsx)(cg, {
					className: "pt-1",
					children: /* @__PURE__ */ (0, v.jsx)(lg, { children: /* @__PURE__ */ (0, v.jsxs)(ug, { children: [F.map((e) => /* @__PURE__ */ (0, v.jsxs)(dg, {
						className: "group-data-[collapsible=icon]:hidden",
						children: [/* @__PURE__ */ (0, v.jsxs)(pg, {
							tooltip: e.title,
							isActive: a === e.id,
							onClick: () => o?.(e),
							className: "cursor-pointer pr-8",
							children: [
								/* @__PURE__ */ (0, v.jsx)("span", {
									"aria-hidden": "true",
									className: "size-4 shrink-0"
								}),
								/* @__PURE__ */ (0, v.jsx)(bd, { className: "size-4 text-muted-foreground" }),
								/* @__PURE__ */ (0, v.jsx)("span", {
									className: "truncate",
									children: e.title
								})
							]
						}), s ? /* @__PURE__ */ (0, v.jsxs)(Th, { children: [/* @__PURE__ */ (0, v.jsx)(Eh, {
							asChild: !0,
							children: /* @__PURE__ */ (0, v.jsx)(mg, {
								showOnHover: !0,
								"aria-label": `Project actions: ${e.title}`,
								children: /* @__PURE__ */ (0, v.jsx)(fd, {})
							})
						}), /* @__PURE__ */ (0, v.jsx)(Dh, {
							side: "right",
							align: "start",
							children: /* @__PURE__ */ (0, v.jsxs)(kh, {
								onSelect: () => {
									let t = window.prompt("Rename project", e.title)?.trim();
									t && s(e, t);
								},
								children: [/* @__PURE__ */ (0, v.jsx)(Cd, {}), "Rename"]
							})
						})] }) : null]
					}, `chat:${e.id}`)), re.length === 0 && F.length === 0 ? /* @__PURE__ */ (0, v.jsx)("div", {
						className: "pl-7 pr-2 py-3 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden",
						children: n.length === 0 ? "No projects yet" : "No matches"
					}) : re.map((e) => {
						let t = e.title?.trim() || `Map #${e.id}`;
						return /* @__PURE__ */ (0, v.jsxs)(dg, {
							className: "group-data-[collapsible=icon]:hidden",
							children: [
								/* @__PURE__ */ (0, v.jsxs)(pg, {
									tooltip: t,
									isActive: l === "maps" && c === e.id,
									onClick: () => p(e.id),
									className: "cursor-pointer pr-8 group-data-[collapsible=icon]:pr-2!",
									children: [/* @__PURE__ */ (0, v.jsx)("span", {
										"aria-hidden": "true",
										className: "size-4 shrink-0"
									}), /* @__PURE__ */ (0, v.jsx)("span", {
										className: "truncate",
										children: t
									})]
								}),
								/* @__PURE__ */ (0, v.jsxs)(Th, { children: [/* @__PURE__ */ (0, v.jsx)(Eh, {
									asChild: !0,
									children: /* @__PURE__ */ (0, v.jsx)(mg, {
										showOnHover: !0,
										"aria-label": `Map actions: ${t}`,
										className: "cursor-pointer",
										onClick: (e) => e.stopPropagation(),
										children: /* @__PURE__ */ (0, v.jsx)(fd, {})
									})
								}), /* @__PURE__ */ (0, v.jsxs)(Dh, {
									side: "right",
									align: "start",
									className: "min-w-52 rounded-xl p-1.5",
									children: [
										/* @__PURE__ */ (0, v.jsxs)(kh, {
											className: "cursor-pointer",
											onSelect: () => void ie(e),
											children: [/* @__PURE__ */ (0, v.jsx)(Cd, {}), "Rename"]
										}),
										/* @__PURE__ */ (0, v.jsxs)(kh, {
											className: "cursor-pointer",
											disabled: b != null,
											onSelect: () => void y(e.id, t),
											children: [/* @__PURE__ */ (0, v.jsx)(ld, {}), b === e.id ? "Duplicating…" : "Duplicate"]
										}),
										/* @__PURE__ */ (0, v.jsxs)(kh, {
											className: "cursor-pointer",
											onSelect: () => void _g(`[mapsvg id="${e.id}"]`),
											children: [/* @__PURE__ */ (0, v.jsx)(ud, {}), "Copy shortcode"]
										}),
										/* @__PURE__ */ (0, v.jsxs)(kh, {
											className: "cursor-pointer",
											variant: "destructive",
											onSelect: () => void ae(e),
											children: [/* @__PURE__ */ (0, v.jsx)(Dd, {}), "Delete"]
										})
									]
								})] }),
								x?.mapId === e.id ? /* @__PURE__ */ (0, v.jsx)("p", {
									role: "alert",
									className: "px-4 py-1 text-xs text-destructive",
									children: x.message
								}) : null
							]
						}, e.id);
					})] }) })
				})
			}),
			/* @__PURE__ */ (0, v.jsx)(og, {
				className: "shrink-0 border-t border-sidebar-border/70 pt-2",
				children: /* @__PURE__ */ (0, v.jsxs)(ug, { children: [
					/* @__PURE__ */ (0, v.jsx)(dg, { children: /* @__PURE__ */ (0, v.jsxs)(pg, {
						className: hg,
						tooltip: "Usage",
						isActive: d,
						onClick: g,
						children: [/* @__PURE__ */ (0, v.jsx)(md, {}), /* @__PURE__ */ (0, v.jsx)("span", { children: "Usage" })]
					}) }),
					/* @__PURE__ */ (0, v.jsx)(dg, { children: /* @__PURE__ */ (0, v.jsxs)(Id, {
						open: D,
						onOpenChange: O,
						children: [/* @__PURE__ */ (0, v.jsx)(Ld, {
							asChild: !0,
							"data-slot": "sidebar-menu-button",
							children: /* @__PURE__ */ (0, v.jsxs)(pg, {
								className: hg,
								tooltip: "Support",
								isActive: D,
								children: [/* @__PURE__ */ (0, v.jsx)(_d, {}), /* @__PURE__ */ (0, v.jsx)("span", { children: "Support" })]
							})
						}), /* @__PURE__ */ (0, v.jsxs)(Vd, {
							className: "sm:max-w-md",
							children: [/* @__PURE__ */ (0, v.jsxs)(Hd, { children: [/* @__PURE__ */ (0, v.jsx)(Wd, { children: "Support" }), /* @__PURE__ */ (0, v.jsx)(Gd, { children: "Sign in to MapSVG Dashboard and use the built-in support chat. You’ll find the chat button in the bottom-right corner." })] }), /* @__PURE__ */ (0, v.jsx)(Ud, { children: /* @__PURE__ */ (0, v.jsx)(Ju, {
								asChild: !0,
								children: /* @__PURE__ */ (0, v.jsx)("a", {
									href: "https://mapsvg.com/dashboard",
									target: "_blank",
									rel: "noopener noreferrer",
									children: "Open MapSVG Dashboard"
								})
							}) })]
						})]
					}) }),
					/* @__PURE__ */ (0, v.jsx)(dg, { children: /* @__PURE__ */ (0, v.jsxs)(pg, {
						className: hg,
						tooltip: "Settings",
						isActive: u,
						onClick: h,
						children: [/* @__PURE__ */ (0, v.jsx)(Td, {}), /* @__PURE__ */ (0, v.jsx)("span", { children: "Settings" })]
					}) }),
					/* @__PURE__ */ (0, v.jsx)(dg, { children: /* @__PURE__ */ (0, v.jsx)(pg, {
						asChild: !0,
						className: hg,
						tooltip: "Go back to WordPress",
						children: /* @__PURE__ */ (0, v.jsxs)("a", {
							href: "index.php",
							"aria-label": "Go back to WordPress",
							children: [M ? /* @__PURE__ */ (0, v.jsx)(gg, {}) : /* @__PURE__ */ (0, v.jsx)(ad, { "aria-hidden": "true" }), /* @__PURE__ */ (0, v.jsx)("span", { children: "Go back to WordPress" })]
						})
					}) })
				] })
			})
		]
	});
}
//#endregion
//#region src/lib/create-map-api.ts
async function yg(e, t) {
	let { apiUrl: n, nonce: r } = tm(), i = await lm(_m(n, e), {
		method: "POST",
		credentials: "same-origin",
		headers: {
			Accept: "application/json",
			"X-WP-Nonce": r
		},
		body: t
	}), a = await i.json().catch(() => null);
	if (!i.ok) {
		let e = a?.error ?? a?.data?.error ?? a?.message;
		throw Error(typeof e == "string" ? e : `Request failed (${i.status}).`);
	}
	if (!a || typeof a != "object") throw Error("The server returned an invalid response.");
	return a;
}
function bg(e) {
	let t = e.file;
	if (!t || typeof t.relativeUrl != "string" || !t.relativeUrl || typeof t.name != "string" || typeof t.pathShort != "string") throw Error("The server did not return the uploaded SVG file.");
	return t;
}
async function xg(e, t = !1) {
	if (!/\.svg$/i.test(e.name)) throw Error("Choose an SVG file.");
	let n = new FormData();
	return n.append("file", new Blob([e], { type: "image/svg+xml" }), e.name), n.append("createNew", "true"), t && n.append("requireGoogleOverlay", "true"), bg(await yg("/svgfile", n));
}
async function Sg(e) {
	if (!/\.(?:png|jpe?g|gif|webp)$/i.test(e.name)) throw Error("Choose a PNG, JPEG, GIF or WebP image.");
	let t = new FormData();
	t.append("file", e, e.name);
	let n = (await yg("/imagefile", t)).file;
	if (!n || typeof n.name != "string" || typeof n.relativeUrl != "string" || !n.relativeUrl || typeof n.pathShort != "string" || n.origin !== "uploads" || !Number.isSafeInteger(n.width) || !Number.isSafeInteger(n.height) || (n.width ?? 0) <= 0 || (n.height ?? 0) <= 0 || ![
		"image/png",
		"image/jpeg",
		"image/gif",
		"image/webp"
	].includes(n.mimeType ?? "")) throw Error("The server did not return the uploaded image.");
	return n;
}
async function Cg(e) {
	if (!e.relativeUrl) throw Error("Choose an image.");
	return bg(await yg("/imagefile/svg", new URLSearchParams({ source: e.relativeUrl })));
}
async function wg(e, t) {
	if (!e.trim() || !t.source) throw Error("Enter a title and choose a map file.");
	let n = new URLSearchParams();
	n.set("map[options]", JSON.stringify({
		...t,
		title: e.trim()
	}));
	let r = (await yg("/maps", n)).map, i = Number(r?.id);
	if (!Number.isSafeInteger(i) || i <= 0) throw Error("The server did not return the created map.");
	return {
		id: i,
		title: typeof r?.title == "string" && r.title.trim() ? r.title : e.trim()
	};
}
async function Tg(e, t) {
	return wg(e, { source: t });
}
async function Eg(e, t) {
	let n = tm().options;
	if (typeof n?.google_api_key != "string" || !n.google_api_key.trim()) throw Error("Add a Google Maps API key in Settings → General.");
	return wg(e, {
		source: t,
		googleMaps: { on: !0 }
	});
}
async function Dg(e) {
	let t = tm(), n = t.options && typeof t.options == "object" ? t.options : {};
	if (typeof n.google_api_key != "string" || !n.google_api_key.trim()) throw Error("Add a Google Maps API key in Settings → General.");
	if (!t.pluginUrl) throw Error("The Google Map source is unavailable.");
	let r = new URL(`${t.pluginUrl.replace(/\/?$/, "/")}maps/geo-calibrated/empty.svg`, window.location.href).pathname;
	return wg(e, {
		source: r,
		viewBox: [
			-1766.3868973306835,
			146.6496453220534,
			23928.888888888887,
			13460
		],
		googleMaps: {
			on: !0,
			zoom: 1,
			center: {
				lat: 41.99585227532726,
				lng: 10.688006500000029
			}
		}
	});
}
async function Og(e, t) {
	if (!Number.isSafeInteger(e) || e <= 0 || !t.trim()) throw Error("Choose a map to duplicate.");
	let n = new URLSearchParams();
	n.set("options", JSON.stringify({ title: t.trim() }));
	let r = (await yg(`/maps/${e}/copy`, n)).map, i = Number(r?.id);
	if (!Number.isSafeInteger(i) || i <= 0 || i === e) throw Error("The server did not return the duplicated map.");
	return {
		id: i,
		title: typeof r?.title == "string" && r.title.trim() ? r.title : t.trim()
	};
}
//#endregion
//#region src/lib/database-navigation.ts
var kg = "mapsvg:open-database-query";
function Ag(e) {
	e.trim() && window.dispatchEvent(new CustomEvent(kg, { detail: { queryId: e } }));
}
//#endregion
//#region src/lib/license-upgrade-navigation.ts
var jg = "mapsvg:open-upgrade";
function Mg() {
	window.dispatchEvent(new Event(jg));
}
//#endregion
//#region src/components/WorkspaceTabs.tsx
var Ng = 110, Pg = 90;
function Fg({ tabs: e, activeTabId: t, onActivate: n, onClose: r }) {
	let a = Z((e) => e.mapDrafts), o = (0, i.useRef)(null), s = (0, i.useRef)(/* @__PURE__ */ new Map()), c = (0, i.useRef)(null), l = (0, i.useRef)(null), u = (0, i.useRef)(null), [d, f] = (0, i.useState)(null), [p, m] = (0, i.useState)(null), [h, g] = (0, i.useState)(!1), [_, y] = (0, i.useState)(8), [b, x] = (0, i.useState)(0), [S, C] = (0, i.useState)({
		width: 256,
		height: 68
	}), w = e.find((e) => e.id === t)?.title;
	(0, i.useEffect)(() => {
		let e = () => {
			t && s.current.get(t)?.scrollIntoView?.({
				block: "nearest",
				inline: "nearest"
			});
		};
		if (e(), typeof ResizeObserver > "u" || !o.current) return;
		let n = new ResizeObserver(e);
		return n.observe(o.current), () => n.disconnect();
	}, [
		t,
		e.length,
		w
	]);
	let T = e.find((e) => e.id === p) ?? null, E = () => {
		l.current != null && (window.clearTimeout(l.current), l.current = null);
	}, D = () => {
		u.current != null && (window.clearTimeout(u.current), u.current = null);
	}, O = (e) => {
		let t = o.current, n = s.current.get(e);
		if (!t || !n) return;
		let r = t.getBoundingClientRect(), i = n.getBoundingClientRect();
		y(i.left - r.left), x(r.width);
	}, k = (e) => {
		D(), E(), f(e), m(e), O(e), !h && (l.current = window.setTimeout(() => {
			l.current = null, g(!0), O(e);
		}, Ng));
	}, A = () => {
		f(null), E(), D(), u.current = window.setTimeout(() => {
			u.current = null, g(!1);
		}, Pg);
	};
	if ((0, i.useEffect)(() => () => {
		E(), D();
	}, []), (0, i.useLayoutEffect)(() => {
		if (!T || !c.current) return;
		let e = window.requestAnimationFrame(() => {
			let e = c.current?.getBoundingClientRect();
			e && (C({
				width: Math.ceil(e.width),
				height: Math.ceil(e.height)
			}), O(T.id));
		});
		return () => window.cancelAnimationFrame(e);
	}, [T]), e.length === 0) return null;
	let j = gf(T?.resource) ? a[String(gf(T?.resource))] : void 0, M = gf(T?.resource) ? yd : T?.resource.kind === "chat" ? bd : dd, ee = b > 0 ? Math.max(8, b - S.width - 8) : _, N = Math.min(Math.max(_, 8), ee);
	return /* @__PURE__ */ (0, v.jsxs)("div", {
		ref: o,
		"data-slot": "workspace-tabs",
		className: "relative flex h-11 shrink-0 items-end bg-[#f3f3f3]",
		children: [/* @__PURE__ */ (0, v.jsx)("div", {
			className: "relative z-10 flex min-w-0 flex-1 items-end gap-1 overflow-x-auto px-2 pt-1",
			role: "tablist",
			"aria-label": "Open workspaces",
			children: e.map((i, o) => {
				let c = i.id === t, l = e[o - 1]?.id === t, u = gf(i.resource) ? yd : i.resource.kind === "chat" ? bd : dd, f = gf(i.resource) ? a[String(gf(i.resource))] : void 0, p = e[o - 1], m = o > 0 && !c && !l && d !== i.id && d !== p?.id;
				return /* @__PURE__ */ (0, v.jsxs)("div", {
					ref: (e) => {
						e ? s.current.set(i.id, e) : s.current.delete(i.id);
					},
					className: X("group/tab relative flex h-[34px] w-[215px] min-w-0 shrink-0 items-center transition-colors duration-[120ms] ease-out", c ? "z-20 rounded-t-[10px] bg-background text-foreground" : "z-10 text-muted-foreground hover:text-foreground"),
					onMouseEnter: () => k(i.id),
					onMouseLeave: A,
					children: [
						c ? /* @__PURE__ */ (0, v.jsxs)(v.Fragment, { children: [/* @__PURE__ */ (0, v.jsx)("span", {
							"aria-hidden": "true",
							className: "pointer-events-none absolute -left-[10px] bottom-0 z-0 size-[10px] rounded-br-[8px] shadow-[5px_5px_0_5px_var(--background)]"
						}), /* @__PURE__ */ (0, v.jsx)("span", {
							"aria-hidden": "true",
							className: "pointer-events-none absolute -right-[10px] bottom-0 z-0 size-[10px] rounded-bl-[8px] shadow-[-5px_5px_0_5px_var(--background)]"
						})] }) : /* @__PURE__ */ (0, v.jsx)("span", {
							"aria-hidden": "true",
							className: "pointer-events-none absolute inset-x-0 top-px bottom-[5px] rounded-[8px] bg-transparent transition-colors duration-[120ms] ease-out group-hover/tab:bg-foreground/[0.06]"
						}),
						m ? /* @__PURE__ */ (0, v.jsx)("span", {
							"aria-hidden": "true",
							className: "pointer-events-none absolute -left-0.5 top-1/2 z-20 h-5 w-px -translate-y-1/2 bg-foreground/15 transition-opacity duration-100"
						}) : null,
						/* @__PURE__ */ (0, v.jsxs)("button", {
							type: "button",
							role: "tab",
							"aria-selected": c,
							className: "relative z-10 flex h-full min-w-0 flex-1 items-center gap-2 rounded-[inherit] px-3 text-sm outline-none",
							onClick: () => n(i.id),
							children: [
								/* @__PURE__ */ (0, v.jsx)(u, { className: "size-3.5 shrink-0" }),
								/* @__PURE__ */ (0, v.jsx)("span", {
									className: X("truncate", c && "font-medium"),
									children: i.title
								}),
								f?.conflicted ? /* @__PURE__ */ (0, v.jsx)("span", {
									className: "shrink-0 text-[10px] text-destructive",
									"aria-label": "Draft conflict",
									children: "●"
								}) : null
							]
						}),
						/* @__PURE__ */ (0, v.jsx)(Ju, {
							type: "button",
							variant: "ghost",
							size: "icon-xs",
							className: X("relative z-10 mr-1 size-5 shrink-0 rounded-full hover:bg-foreground/10 hover:opacity-100", c ? "opacity-60" : "opacity-0 group-hover/tab:opacity-70"),
							"aria-label": `Close ${i.title}`,
							onClick: (e) => {
								e.stopPropagation(), r(i.id);
							},
							children: /* @__PURE__ */ (0, v.jsx)(kd, { className: "size-3.5" })
						})
					]
				}, i.id);
			})
		}), T ? /* @__PURE__ */ (0, v.jsx)("div", {
			className: X("absolute left-0 top-full z-50 overflow-hidden rounded-xl bg-popover text-popover-foreground shadow-lg", "transition-[transform,width,height,opacity] duration-150 ease-out will-change-transform", h ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"),
			style: {
				width: S.width,
				height: S.height,
				transform: `translate3d(${N}px, 7px, 0)`
			},
			onMouseEnter: D,
			onMouseLeave: A,
			children: /* @__PURE__ */ (0, v.jsxs)("div", {
				ref: c,
				className: "absolute left-0 top-0 w-max min-w-56 max-w-80 p-3",
				children: [
					/* @__PURE__ */ (0, v.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, v.jsx)(M, { className: "size-4 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, v.jsx)("span", {
							className: "max-w-64 truncate text-sm font-medium",
							children: T.title
						})]
					}),
					/* @__PURE__ */ (0, v.jsx)("div", {
						className: "mt-1 text-xs text-muted-foreground",
						children: gf(T.resource) ? `Map · ID ${gf(T.resource)}` : vf(T.resource)?.kind === "db-table" ? `Collection · ${T.title}` : vf(T.resource)?.kind === "db-query" ? `Query · ${T.title}` : T.resource.kind === "database" ? "Database" : "Conversation"
					}),
					j?.conflicted ? /* @__PURE__ */ (0, v.jsx)("div", {
						className: "mt-2 text-xs text-destructive",
						children: "Draft conflict"
					}) : null
				]
			})
		}) : null]
	});
}
//#endregion
//#region src/components/WordPressAuthCheckBridge.tsx
function Ig() {
	let [e, t] = (0, i.useState)(null);
	return (0, i.useLayoutEffect)(() => {
		let e = null, n = () => {
			t(e && !e.hidden && !e.classList.contains("hidden") && getComputedStyle(e).display !== "none" ? e : null);
		}, r = new MutationObserver(n), i = () => {
			let t = document.getElementById("wp-auth-check-wrap");
			t !== e && (r.disconnect(), e = t, e && r.observe(e, {
				attributes: !0,
				attributeFilter: [
					"class",
					"style",
					"hidden"
				]
			})), n();
		}, a = new MutationObserver(i);
		return a.observe(document.body, { childList: !0 }), i(), () => {
			r.disconnect(), a.disconnect();
		};
	}, []), e;
}
function Lg({ element: e, ref: t }) {
	return (0, i.useImperativeHandle)(t, () => e, [e]), null;
}
function Rg({ wrap: e }) {
	return (0, i.useLayoutEffect)(() => {
		let t = e.style.getPropertyValue("pointer-events"), n = e.style.getPropertyPriority("pointer-events");
		e.style.setProperty("pointer-events", "auto");
		let r = () => {
			e.getAttribute("aria-hidden") === "true" && e.removeAttribute("aria-hidden");
		}, i = new MutationObserver(r);
		i.observe(e, {
			attributes: !0,
			attributeFilter: ["aria-hidden"]
		}), r();
		let a = (e) => e.stopPropagation();
		return e.addEventListener("wheel", a), e.addEventListener("touchmove", a), () => {
			i.disconnect(), e.style.setProperty("pointer-events", t, n), e.removeEventListener("wheel", a), e.removeEventListener("touchmove", a);
		};
	}, [e]), /* @__PURE__ */ (0, v.jsx)(Et, {
		asChild: !0,
		onMountAutoFocus: (t) => {
			t.preventDefault(), e.querySelector("#wp-auth-check-frame, .wp-auth-fallback-expired")?.focus();
		},
		onUnmountAutoFocus: (e) => e.preventDefault(),
		children: /* @__PURE__ */ (0, v.jsx)(pt, {
			asChild: !0,
			disableOutsidePointerEvents: !0,
			onEscapeKeyDown: (e) => e.preventDefault(),
			children: /* @__PURE__ */ (0, v.jsx)(mt, {
				asChild: !0,
				children: /* @__PURE__ */ (0, v.jsx)(Lg, { element: e })
			})
		})
	});
}
function zg() {
	let e = Ig();
	return e ? /* @__PURE__ */ (0, v.jsx)(Rg, { wrap: e }, e.id) : null;
}
//#endregion
//#region src/components/ui/alert-dialog.tsx
function Bg({ ...e }) {
	return /* @__PURE__ */ (0, v.jsx)(Kr, {
		"data-slot": "alert-dialog",
		...e
	});
}
function Vg({ ...e }) {
	return /* @__PURE__ */ (0, v.jsx)(qr, {
		"data-slot": "alert-dialog-portal",
		...e
	});
}
function Hg({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)(Jr, {
		"data-slot": "alert-dialog-overlay",
		className: X("fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", e),
		...t
	});
}
function Ug({ className: e, size: t = "default", ...n }) {
	return /* @__PURE__ */ (0, v.jsxs)(Vg, {
		container: Fd(),
		children: [/* @__PURE__ */ (0, v.jsx)(Hg, {}), /* @__PURE__ */ (0, v.jsx)(Zr, {
			"data-slot": "alert-dialog-content",
			"data-size": t,
			className: X("group/alert-dialog-content fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[size=sm]:max-w-xs data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[size=default]:sm:max-w-lg", e),
			...n
		})]
	});
}
function Wg({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "alert-dialog-header",
		className: X("grid grid-rows-[auto_1fr] place-items-center gap-1.5 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]", e),
		...t
	});
}
function Gg({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)("div", {
		"data-slot": "alert-dialog-footer",
		className: X("flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end", e),
		...t
	});
}
function Kg({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)(Qr, {
		"data-slot": "alert-dialog-title",
		className: X("text-lg font-semibold sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2", e),
		...t
	});
}
function qg({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)($r, {
		"data-slot": "alert-dialog-description",
		className: X("text-sm text-muted-foreground", e),
		...t
	});
}
function Jg({ className: e, variant: t = "default", size: n = "default", ...r }) {
	return /* @__PURE__ */ (0, v.jsx)(Ju, {
		variant: t,
		size: n,
		asChild: !0,
		children: /* @__PURE__ */ (0, v.jsx)(ei, {
			"data-slot": "alert-dialog-action",
			className: X(e),
			...r
		})
	});
}
function Yg({ className: e, variant: t = "outline", size: n = "default", ...r }) {
	return /* @__PURE__ */ (0, v.jsx)(Ju, {
		variant: t,
		size: n,
		asChild: !0,
		children: /* @__PURE__ */ (0, v.jsx)(ni, {
			"data-slot": "alert-dialog-cancel",
			className: X(e),
			...r
		})
	});
}
//#endregion
//#region node_modules/.pnpm/react-resizable-panels@4.12.2_react-dom@19.2.8_react@19.2.8__react@19.2.8/node_modules/react-resizable-panels/dist/react-resizable-panels.js
function Xg(e, t) {
	let n = getComputedStyle(e);
	return t * parseFloat(n.fontSize);
}
function Zg(e, t) {
	let n = getComputedStyle(e.ownerDocument.documentElement);
	return t * parseFloat(n.fontSize);
}
function Qg(e) {
	return e / 100 * window.innerHeight;
}
function $g(e) {
	return e / 100 * window.innerWidth;
}
function e_(e) {
	switch (typeof e) {
		case "number": return [e, "px"];
		case "string": {
			let t = parseFloat(e);
			return e.endsWith("%") ? [t, "%"] : e.endsWith("px") ? [t, "px"] : e.endsWith("rem") ? [t, "rem"] : e.endsWith("em") ? [t, "em"] : e.endsWith("vh") ? [t, "vh"] : e.endsWith("vw") ? [t, "vw"] : [t, "%"];
		}
	}
}
function t_({ groupSize: e, panelElement: t, styleProp: n }) {
	let r, [i, a] = e_(n);
	switch (a) {
		case "%":
			r = i / 100 * e;
			break;
		case "px":
			r = i;
			break;
		case "rem":
			r = Zg(t, i);
			break;
		case "em":
			r = Xg(t, i);
			break;
		case "vh":
			r = Qg(i);
			break;
		case "vw":
			r = $g(i);
			break;
	}
	return r;
}
function n_(e) {
	return parseFloat(e.toFixed(3));
}
function r_({ group: e }) {
	let { orientation: t, panels: n } = e;
	return n.reduce((e, n) => (e += t === "horizontal" ? n.element.offsetWidth : n.element.offsetHeight, e), 0);
}
function i_(e) {
	let { panels: t } = e, n = r_({ group: e });
	return n === 0 ? t.map((e) => ({
		groupResizeBehavior: e.panelConstraints.groupResizeBehavior,
		collapsedSize: 0,
		collapsible: e.panelConstraints.collapsible === !0,
		defaultSize: void 0,
		disabled: e.panelConstraints.disabled,
		minSize: 0,
		maxSize: 100,
		panelId: e.id
	})) : t.map((e) => {
		let { element: t, panelConstraints: r } = e, i = 0;
		r.collapsedSize !== void 0 && (i = n_(t_({
			groupSize: n,
			panelElement: t,
			styleProp: r.collapsedSize
		}) / n * 100));
		let a;
		r.defaultSize !== void 0 && (a = n_(t_({
			groupSize: n,
			panelElement: t,
			styleProp: r.defaultSize
		}) / n * 100));
		let o = 0;
		r.minSize !== void 0 && (o = n_(t_({
			groupSize: n,
			panelElement: t,
			styleProp: r.minSize
		}) / n * 100));
		let s = 100;
		return r.maxSize !== void 0 && (s = n_(t_({
			groupSize: n,
			panelElement: t,
			styleProp: r.maxSize
		}) / n * 100)), {
			groupResizeBehavior: r.groupResizeBehavior,
			collapsedSize: i,
			collapsible: r.collapsible === !0,
			defaultSize: a,
			disabled: r.disabled,
			minSize: o,
			maxSize: s,
			panelId: e.id
		};
	});
}
function $(e, t = "Assertion error") {
	if (!e) throw Error(t);
}
function a_(e, t) {
	return Array.from(t).sort(e === "horizontal" ? o_ : s_);
}
function o_(e, t) {
	let n = e.element.offsetLeft - t.element.offsetLeft;
	return n === 0 ? e.element.offsetWidth - t.element.offsetWidth : n;
}
function s_(e, t) {
	let n = e.element.offsetTop - t.element.offsetTop;
	return n === 0 ? e.element.offsetHeight - t.element.offsetHeight : n;
}
function c_(e) {
	return typeof e == "object" && !!e && "nodeType" in e && e.nodeType === Node.ELEMENT_NODE;
}
function l_(e, t) {
	return {
		x: e.x >= t.left && e.x <= t.right ? 0 : Math.min(Math.abs(e.x - t.left), Math.abs(e.x - t.right)),
		y: e.y >= t.top && e.y <= t.bottom ? 0 : Math.min(Math.abs(e.y - t.top), Math.abs(e.y - t.bottom))
	};
}
function u_({ orientation: e, rects: t, targetRect: n }) {
	let r = {
		x: n.x + n.width / 2,
		y: n.y + n.height / 2
	}, i, a = Number.MAX_VALUE;
	for (let n of t) {
		let { x: t, y: o } = l_(r, n), s = e === "horizontal" ? t : o;
		s < a && (a = s, i = n);
	}
	return $(i, "No rect found"), i;
}
var d_;
function f_() {
	return d_ === void 0 && (d_ = typeof matchMedia == "function" && !!matchMedia("(pointer:coarse)").matches), d_;
}
function p_(e) {
	let { element: t, orientation: n, panels: r, separators: i } = e, a = a_(n, Array.from(t.children).filter(c_).map((e) => ({ element: e }))).map(({ element: e }) => e), o = [], s = !1, c = !1, l = -1, u = -1, d = 0, f, p = [];
	{
		let e = -1;
		for (let t of a) t.hasAttribute("data-panel") && (e++, t.hasAttribute("data-disabled") || (d++, l === -1 && (l = e), u = e));
	}
	if (d > 1) {
		let t = -1;
		for (let d of a) if (d.hasAttribute("data-panel")) {
			t++;
			let i = r.find((e) => e.element === d);
			if (i) {
				if (f) {
					let r = f.element.getBoundingClientRect(), a = d.getBoundingClientRect(), m;
					if (c) {
						let e = n === "horizontal" ? new DOMRect(r.right, r.top, 0, r.height) : new DOMRect(r.left, r.bottom, r.width, 0), t = n === "horizontal" ? new DOMRect(a.left, a.top, 0, a.height) : new DOMRect(a.left, a.top, a.width, 0);
						switch (p.length) {
							case 0:
								m = [e, t];
								break;
							case 1: {
								let i = p[0];
								m = [i, u_({
									orientation: n,
									rects: [r, a],
									targetRect: i.element.getBoundingClientRect()
								}) === r ? t : e];
								break;
							}
							default:
								m = p;
								break;
						}
					} else m = p.length ? p : [n === "horizontal" ? new DOMRect(r.right, a.top, a.left - r.right, a.height) : new DOMRect(a.left, r.bottom, a.width, a.top - r.bottom)];
					for (let n of m) {
						let r = "width" in n ? n : n.element.getBoundingClientRect(), a = f_() ? e.resizeTargetMinimumSize.coarse : e.resizeTargetMinimumSize.fine;
						if (r.width < a) {
							let e = a - r.width;
							r = new DOMRect(r.x - e / 2, r.y, r.width + e, r.height);
						}
						if (r.height < a) {
							let e = a - r.height;
							r = new DOMRect(r.x, r.y - e / 2, r.width, r.height + e);
						}
						!s && !(t <= l || t > u) && o.push({
							group: e,
							groupSize: r_({ group: e }),
							panels: [f, i],
							separator: "width" in n ? void 0 : n,
							rect: r
						}), s = !1;
					}
				}
				c = !1, f = i, p = [];
			}
		} else if (d.hasAttribute("data-separator")) {
			d.ariaDisabled !== null && (s = !0);
			let e = i.find((e) => e.element === d);
			e ? p.push(e) : (f = void 0, p = []);
		} else c = !0;
	}
	return o;
}
var m_ = class {
	#e = {};
	addListener(e, t) {
		let n = this.#e[e];
		return n === void 0 ? this.#e[e] = [t] : n.includes(t) || n.push(t), () => {
			this.removeListener(e, t);
		};
	}
	emit(e, t) {
		let n = this.#e[e];
		if (n !== void 0) if (n.length === 1) n[0].call(null, t);
		else {
			let e = !1, r = null, i = Array.from(n);
			for (let n = 0; n < i.length; n++) {
				let a = i[n];
				try {
					a.call(null, t);
				} catch (t) {
					r === null && (e = !0, r = t);
				}
			}
			if (e) throw r;
		}
	}
	removeAllListeners() {
		this.#e = {};
	}
	removeListener(e, t) {
		let n = this.#e[e];
		if (n !== void 0) {
			let e = n.indexOf(t);
			e >= 0 && n.splice(e, 1);
		}
	}
}, h_ = {
	cursorFlags: 0,
	state: "inactive"
}, g_ = new m_();
function __() {
	return h_;
}
function v_(e) {
	return g_.addListener("change", e);
}
function y_(e) {
	let t = h_, n = { ...h_ };
	n.cursorFlags = e, h_ = n, g_.emit("change", {
		prev: t,
		next: n
	});
}
function b_(e) {
	let t = h_;
	h_ = e, g_.emit("change", {
		prev: t,
		next: e
	});
}
var x_ = (e) => e, S_ = () => {}, C_ = 1, w_ = 2, T_ = 4, E_ = 8, D_ = 3, O_ = 12, k_;
function A_() {
	return k_ === void 0 && (k_ = !1, typeof window < "u" && (window.navigator.userAgent.includes("Chrome") || window.navigator.userAgent.includes("Firefox")) && (k_ = !0)), k_;
}
function j_({ cursorFlags: e, groups: t, state: n }) {
	let r = 0, i = 0;
	switch (n) {
		case "active":
		case "hover": t.forEach((e) => {
			if (!e.mutableState.disableCursor) switch (e.orientation) {
				case "horizontal":
					r++;
					break;
				case "vertical":
					i++;
					break;
			}
		});
	}
	if (!(r === 0 && i === 0)) {
		switch (n) {
			case "active":
				if (e && A_()) {
					let t = (e & C_) !== 0, n = (e & w_) !== 0, r = (e & T_) !== 0, i = (e & E_) !== 0;
					if (t) return r ? "se-resize" : i ? "ne-resize" : "e-resize";
					if (n) return r ? "sw-resize" : i ? "nw-resize" : "w-resize";
					if (r) return "s-resize";
					if (i) return "n-resize";
				}
				break;
		}
		return A_() ? r > 0 && i > 0 ? "move" : r > 0 ? "ew-resize" : "ns-resize" : r > 0 && i > 0 ? "grab" : r > 0 ? "col-resize" : "row-resize";
	}
}
var M_ = /* @__PURE__ */ new WeakMap();
function N_(e) {
	if (e.defaultView === null || e.defaultView === void 0) return;
	let { prevStyle: t, styleSheet: n } = M_.get(e) ?? {};
	n === void 0 && (n = new e.defaultView.CSSStyleSheet(), e.adoptedStyleSheets && (Object.isExtensible(e.adoptedStyleSheets) ? e.adoptedStyleSheets.push(n) : e.adoptedStyleSheets = [...e.adoptedStyleSheets, n]));
	let r = __();
	switch (r.state) {
		case "active":
		case "hover": {
			let e = j_({
				cursorFlags: r.cursorFlags,
				groups: r.hitRegions.map((e) => e.group),
				state: r.state
			}), i = `*, *:hover {cursor: ${e} !important; }`;
			if (t === i) return;
			t = i, e ? n.cssRules.length === 0 ? n.insertRule(i) : n.replaceSync(i) : n.cssRules.length === 1 && n.deleteRule(0);
			break;
		}
		case "inactive":
			t = void 0, n.cssRules.length === 1 && n.deleteRule(0);
			break;
	}
	M_.set(e, {
		prevStyle: t,
		styleSheet: n
	});
}
var P_ = /* @__PURE__ */ new Map(), F_ = new m_();
function I_(e) {
	P_ = new Map(P_), P_.delete(e);
}
function L_(e, t) {
	for (let [t] of P_) if (t.id === e) return t;
}
function R_(e, t) {
	for (let [t, n] of P_) if (t.id === e) return n;
	if (t) throw Error(`Could not find data for Group with id ${e}`);
}
function z_() {
	return P_;
}
function B_(e, t) {
	return F_.addListener("groupChange", (n) => {
		n.group.id === e && t(n);
	});
}
function V_(e, t, n) {
	let r = P_.get(e);
	P_ = new Map(P_), P_.set(e, t), F_.emit("groupChange", {
		group: e,
		isUserInteraction: n?.isUserInteraction === !0,
		prev: r,
		next: t
	});
}
function H_(e) {
	let t = __(), n = !1;
	switch (t.state) {
		case "active": b_({
			cursorFlags: 0,
			state: "inactive"
		}), t.hitRegions.length > 0 && (N_(e), n = !0, t.hitRegions.forEach((e) => {
			let t = R_(e.group.id, !0);
			V_(e.group, t, { isUserInteraction: !0 });
		}));
	}
	return n;
}
function U_(e) {
	e.defaultPrevented || H_(e.currentTarget);
}
function W_(e, t, n) {
	let r, i = {
		x: Infinity,
		y: Infinity
	};
	for (let a of t) {
		let t = l_(n, a.rect);
		switch (e) {
			case "horizontal":
				t.x <= i.x && (r = a, i = t);
				break;
			case "vertical":
				t.y <= i.y && (r = a, i = t);
				break;
		}
	}
	return r ? {
		distance: i,
		hitRegion: r
	} : void 0;
}
function G_(e) {
	return typeof e == "object" && !!e && "nodeType" in e && e.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
}
function K_(e, t) {
	if (e === t) throw Error("Cannot compare node with itself");
	let n = {
		a: Q_(e),
		b: Q_(t)
	}, r;
	for (; n.a.at(-1) === n.b.at(-1);) r = n.a.pop(), n.b.pop();
	$(r, "Stacking order can only be calculated for elements with a common ancestor");
	let i = {
		a: Z_(X_(n.a)),
		b: Z_(X_(n.b))
	};
	if (i.a === i.b) {
		let e = r.childNodes, t = {
			a: n.a.at(-1),
			b: n.b.at(-1)
		}, i = e.length;
		for (; i--;) {
			let n = e[i];
			if (n === t.a) return 1;
			if (n === t.b) return -1;
		}
	}
	return Math.sign(i.a - i.b);
}
var q_ = /\b(?:position|zIndex|opacity|transform|webkitTransform|mixBlendMode|filter|webkitFilter|isolation)\b/;
function J_(e) {
	let t = getComputedStyle($_(e) ?? e).display;
	return t === "flex" || t === "inline-flex";
}
function Y_(e) {
	let t = getComputedStyle(e);
	return !!(t.position === "fixed" || t.zIndex !== "auto" && (t.position !== "static" || J_(e)) || +t.opacity < 1 || "transform" in t && t.transform !== "none" || "webkitTransform" in t && t.webkitTransform !== "none" || "mixBlendMode" in t && t.mixBlendMode !== "normal" || "filter" in t && t.filter !== "none" || "webkitFilter" in t && t.webkitFilter !== "none" || "isolation" in t && t.isolation === "isolate" || q_.test(t.willChange) || t.webkitOverflowScrolling === "touch");
}
function X_(e) {
	let t = e.length;
	for (; t--;) {
		let n = e[t];
		if ($(n, "Missing node"), Y_(n)) return n;
	}
	return null;
}
function Z_(e) {
	return e && Number(getComputedStyle(e).zIndex) || 0;
}
function Q_(e) {
	let t = [];
	for (; e;) t.push(e), e = $_(e);
	return t;
}
function $_(e) {
	let { parentNode: t } = e;
	return G_(t) ? t.host : t;
}
function ev(e, t) {
	return e.x < t.x + t.width && e.x + e.width > t.x && e.y < t.y + t.height && e.y + e.height > t.y;
}
function tv({ groupElement: e, hitRegion: t, pointerEventTarget: n }) {
	if (!c_(n) || n.contains(e) || e.contains(n)) return !0;
	if (K_(n, e) > 0) {
		let r = n;
		for (; r;) {
			if (r.contains(e)) return !0;
			if (ev(r.getBoundingClientRect(), t)) return !1;
			r = r.parentElement;
		}
	}
	return !0;
}
function nv(e, t) {
	let n = [];
	return t.forEach((t, r) => {
		if (r.disabled) return;
		let i = p_(r), a = W_(r.orientation, i, {
			x: e.clientX,
			y: e.clientY
		});
		a && a.distance.x <= 0 && a.distance.y <= 0 && tv({
			groupElement: r.element,
			hitRegion: a.hitRegion.rect,
			pointerEventTarget: e.target
		}) && n.push(a.hitRegion);
	}), n;
}
function rv(e, t) {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (e[n] != t[n]) return !1;
	return !0;
}
function iv(e, t, n = 0) {
	return Math.abs(n_(e) - n_(t)) <= n;
}
function av(e, t) {
	return iv(e, t) ? 0 : e > t ? 1 : -1;
}
function ov({ overrideDisabledPanels: e, panelConstraints: t, prevSize: n, size: r }) {
	let { collapsedSize: i = 0, collapsible: a, disabled: o, maxSize: s = 100, minSize: c = 0 } = t;
	if (o && !e) return n;
	if (av(r, c) < 0) if (a) {
		let e = (i + c) / 2;
		r = av(r, e) < 0 ? i : c;
	} else r = c;
	return r = Math.min(s, r), r = n_(r), r;
}
function sv({ delta: e, initialLayout: t, panelConstraints: n, pivotIndices: r, prevLayout: i, trigger: a }) {
	if (iv(e, 0)) return t;
	let o = a === "imperative-api", s = Object.values(t), c = Object.values(i), l = [...s], [u, d] = r;
	$(u != null, "Invalid first pivot index"), $(d != null, "Invalid second pivot index");
	let f = 0;
	switch (a) {
		case "keyboard":
			{
				let t = e < 0 ? d : u, r = n[t];
				$(r, `Panel constraints not found for index ${t}`);
				let { collapsedSize: i = 0, collapsible: a, minSize: o = 0 } = r;
				if (a) {
					let n = s[t];
					if ($(n != null, `Previous layout not found for panel index ${t}`), iv(n, i)) {
						let t = o - n;
						av(t, Math.abs(e)) > 0 && (e = e < 0 ? 0 - t : t);
					}
				}
			}
			{
				let t = e < 0 ? u : d, r = n[t];
				$(r, `No panel constraints found for index ${t}`);
				let { collapsedSize: i = 0, collapsible: a, minSize: o = 0 } = r;
				if (a) {
					let n = s[t];
					if ($(n != null, `Previous layout not found for panel index ${t}`), iv(n, o)) {
						let t = n - i;
						av(t, Math.abs(e)) > 0 && (e = e < 0 ? 0 - t : t);
					}
				}
			}
			break;
		default: {
			let t = e < 0 ? d : u, r = n[t];
			$(r, `Panel constraints not found for index ${t}`);
			let i = s[t], { collapsible: a, collapsedSize: o, minSize: c } = r;
			if (a && av(i, c) < 0) if (e > 0) {
				let t = c - o, n = t / 2;
				av(i + e, c) < 0 && (e = av(e, n) <= 0 ? 0 : t);
			} else {
				let t = c - o, n = 100 - t / 2;
				av(i - e, c) < 0 && (e = av(100 + e, n) > 0 ? 0 : -t);
			}
			break;
		}
	}
	{
		let t = e < 0 ? 1 : -1, r = e < 0 ? d : u, i = 0;
		for (;;) {
			let e = s[r];
			$(e != null, `Previous layout not found for panel index ${r}`);
			let a = ov({
				overrideDisabledPanels: o,
				panelConstraints: n[r],
				prevSize: e,
				size: 100
			}) - e;
			if (i += a, r += t, r < 0 || r >= n.length) break;
		}
		let a = Math.min(Math.abs(e), Math.abs(i));
		e = e < 0 ? 0 - a : a;
	}
	{
		let t = e < 0 ? u : d;
		for (; t >= 0 && t < n.length;) {
			let r = Math.abs(e) - Math.abs(f), i = s[t];
			$(i != null, `Previous layout not found for panel index ${t}`);
			let a = i - r, c = ov({
				overrideDisabledPanels: o,
				panelConstraints: n[t],
				prevSize: i,
				size: a
			});
			if (!iv(i, c) && (f += i - c, l[t] = c, f.toFixed(3).localeCompare(Math.abs(e).toFixed(3), void 0, { numeric: !0 }) >= 0)) break;
			e < 0 ? t-- : t++;
		}
	}
	if (rv(c, l)) return i;
	{
		let t = e < 0 ? d : u, r = s[t];
		$(r != null, `Previous layout not found for panel index ${t}`);
		let i = r + f, a = ov({
			overrideDisabledPanels: o,
			panelConstraints: n[t],
			prevSize: r,
			size: i
		});
		if (l[t] = a, !iv(a, i)) {
			let t = i - a, r = e < 0 ? d : u;
			for (; r >= 0 && r < n.length;) {
				let i = l[r];
				$(i != null, `Previous layout not found for panel index ${r}`);
				let a = i + t, s = ov({
					overrideDisabledPanels: o,
					panelConstraints: n[r],
					prevSize: i,
					size: a
				});
				if (iv(i, s) || (t -= s - i, l[r] = s), iv(t, 0)) break;
				e > 0 ? r-- : r++;
			}
		}
	}
	if (!iv(Object.values(l).reduce((e, t) => t + e, 0), 100, .1)) return i;
	let p = Object.keys(i);
	return l.reduce((e, t, n) => (e[p[n]] = t, e), {});
}
function cv(e, t) {
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let n in e) if (t[n] === void 0 || av(e[n], t[n]) !== 0) return !1;
	return !0;
}
function lv({ layout: e, panelConstraints: t }) {
	let n = Object.values(e), r = [...n], i = r.reduce((e, t) => e + t, 0);
	if (r.length !== t.length) throw Error(`Invalid ${t.length} panel layout: ${r.map((e) => `${e}%`).join(", ")}`);
	if (!iv(i, 100) && r.length > 0) for (let e = 0; e < t.length; e++) {
		let t = r[e];
		$(t != null, `No layout data found for index ${e}`), r[e] = 100 / i * t;
	}
	let a = 0;
	for (let e = 0; e < t.length; e++) {
		let i = n[e];
		$(i != null, `No layout data found for index ${e}`);
		let o = r[e];
		$(o != null, `No layout data found for index ${e}`);
		let s = ov({
			overrideDisabledPanels: !0,
			panelConstraints: t[e],
			prevSize: i,
			size: o
		});
		o != s && (a += o - s, r[e] = s);
	}
	if (!iv(a, 0)) for (let e = 0; e < t.length; e++) {
		let n = r[e];
		$(n != null, `No layout data found for index ${e}`);
		let i = n + a, o = ov({
			overrideDisabledPanels: !0,
			panelConstraints: t[e],
			prevSize: n,
			size: i
		});
		if (n !== o && (a -= o - n, r[e] = o, iv(a, 0))) break;
	}
	let o = Object.keys(e);
	return r.reduce((e, t, n) => (e[o[n]] = t, e), {});
}
function uv({ groupId: e, panelId: t }) {
	let n = () => {
		let t = z_();
		for (let [n, { defaultLayoutDeferred: r, derivedPanelConstraints: i, layout: a, groupSize: o, separatorToPanels: s }] of t) if (n.id === e) return {
			defaultLayoutDeferred: r,
			derivedPanelConstraints: i,
			group: n,
			groupSize: o,
			layout: a,
			separatorToPanels: s
		};
		throw Error(`Group ${e} not found`);
	}, r = () => {
		let e = n().derivedPanelConstraints.find((e) => e.panelId === t);
		if (e !== void 0) return e;
		throw Error(`Panel constraints not found for Panel ${t}`);
	}, i = () => {
		let e = n().group.panels.find((e) => e.id === t);
		if (e !== void 0) return e;
		throw Error(`Layout not found for Panel ${t}`);
	}, a = () => {
		let e = n().layout[t];
		if (e !== void 0) return e;
		throw Error(`Layout not found for Panel ${t}`);
	}, o = ({ nextSize: e, panels: n, prevLayout: r, derivedPanelConstraints: i }) => {
		let o = a(), s = n.findIndex((e) => e.id === t), c = s === 0, l = s === n.length - 1;
		if (l && e < o && (c || n.slice(0, s).every((e, t) => {
			let n = i[t];
			return n?.collapsible && iv(n.collapsedSize, r[n.panelId]);
		}))) {
			let e = n.slice(0, s).reduce((e, t) => e + r[t.id], 0);
			return {
				...r,
				[t]: n_(100 - e)
			};
		}
		return sv({
			delta: l ? o - e : e - o,
			initialLayout: r,
			panelConstraints: i,
			pivotIndices: l ? [s - 1, s] : [s, s + 1],
			prevLayout: r,
			trigger: "imperative-api"
		});
	}, s = (e) => {
		if (e === a()) return;
		let { defaultLayoutDeferred: t, derivedPanelConstraints: r, group: i, groupSize: s, layout: c, separatorToPanels: l } = n(), u = lv({
			layout: o({
				nextSize: e,
				panels: i.panels,
				prevLayout: c,
				derivedPanelConstraints: r
			}),
			panelConstraints: r
		});
		cv(c, u) || V_(i, {
			defaultLayoutDeferred: t,
			derivedPanelConstraints: r,
			groupSize: s,
			layout: u,
			separatorToPanels: l
		});
	};
	return {
		collapse: () => {
			let { collapsible: e, collapsedSize: t } = r(), { mutableValues: n } = i(), o = a();
			e && o !== t && (n.expandToSize = o, s(t));
		},
		expand: () => {
			let { collapsible: e, collapsedSize: t, minSize: n } = r(), { mutableValues: o } = i(), c = a();
			if (e && c === t) {
				let e = o.expandToSize ?? n;
				e === 0 && (e = 1), s(e);
			}
		},
		getSize: () => {
			let { group: e } = n(), t = a(), { element: r } = i();
			return {
				asPercentage: t,
				inPixels: e.orientation === "horizontal" ? r.offsetWidth : r.offsetHeight
			};
		},
		isCollapsed: () => {
			let { collapsible: e, collapsedSize: t } = r(), n = a();
			return e && iv(t, n);
		},
		resize: (e) => {
			let { group: t } = n(), { element: r } = i(), a = r_({ group: t }), o = n_(t_({
				groupSize: a,
				panelElement: r,
				styleProp: e
			}) / a * 100);
			s(o);
		}
	};
}
function dv(e) {
	e.defaultPrevented || nv(e, z_()).forEach((t) => {
		if (t.separator && !t.separator.disableDoubleClick) {
			let n = t.panels.find((e) => e.panelConstraints.defaultSize !== void 0);
			if (n) {
				let r = n.panelConstraints.defaultSize, i = uv({
					groupId: t.group.id,
					panelId: n.id
				});
				i && r !== void 0 && (i.resize(r), e.preventDefault());
			}
		}
	});
}
function fv(e) {
	let t = z_();
	for (let [n] of t) if (n.separators.some((t) => t.element === e)) return n;
	throw Error("Could not find parent Group for separator element");
}
function pv({ groupId: e }) {
	let t = () => {
		let t = z_();
		for (let [n, r] of t) if (n.id === e) return {
			group: n,
			...r
		};
		throw Error(`Could not find Group with id "${e}"`);
	};
	return {
		getLayout() {
			let { defaultLayoutDeferred: e, layout: n } = t();
			return e ? {} : n;
		},
		setLayout(e) {
			let { defaultLayoutDeferred: n, derivedPanelConstraints: r, group: i, groupSize: a, layout: o, separatorToPanels: s } = t(), c = lv({
				layout: e,
				panelConstraints: r
			});
			return n ? o : (cv(o, c) || V_(i, {
				defaultLayoutDeferred: n,
				derivedPanelConstraints: r,
				groupSize: a,
				layout: c,
				separatorToPanels: s
			}), c);
		}
	};
}
function mv(e, t) {
	let n = fv(e), r = R_(n.id, !0), i = n.separators.find((t) => t.element === e);
	$(i, "Matching separator not found");
	let a = r.separatorToPanels.get(i);
	$(a, "Matching panels not found");
	let o = a.map((e) => n.panels.indexOf(e)), s = pv({ groupId: n.id }).getLayout(), c = lv({
		layout: sv({
			delta: t,
			initialLayout: s,
			panelConstraints: r.derivedPanelConstraints,
			pivotIndices: o,
			prevLayout: s,
			trigger: "keyboard"
		}),
		panelConstraints: r.derivedPanelConstraints
	});
	cv(s, c) || V_(n, {
		defaultLayoutDeferred: r.defaultLayoutDeferred,
		derivedPanelConstraints: r.derivedPanelConstraints,
		groupSize: r.groupSize,
		layout: c,
		separatorToPanels: r.separatorToPanels
	}, { isUserInteraction: !0 });
}
function hv(e) {
	if (e.defaultPrevented) return;
	let t = e.currentTarget, n = fv(t);
	if (!n.disabled) switch (e.key) {
		case "ArrowDown":
			e.preventDefault(), n.orientation === "vertical" && mv(t, 5);
			break;
		case "ArrowLeft":
			e.preventDefault(), n.orientation === "horizontal" && mv(t, -5);
			break;
		case "ArrowRight":
			e.preventDefault(), n.orientation === "horizontal" && mv(t, 5);
			break;
		case "ArrowUp":
			e.preventDefault(), n.orientation === "vertical" && mv(t, -5);
			break;
		case "End":
			e.preventDefault(), mv(t, 100);
			break;
		case "Enter": {
			e.preventDefault();
			let n = fv(t), { derivedPanelConstraints: r, layout: i, separatorToPanels: a } = R_(n.id, !0), o = n.separators.find((e) => e.element === t);
			$(o, "Matching separator not found");
			let s = a.get(o);
			$(s, "Matching panels not found");
			let c = s[0], l = r.find((e) => e.panelId === c.id);
			if ($(l, "Panel metadata not found"), l.collapsible) {
				let e = i[c.id];
				mv(t, (l.collapsedSize === e ? n.mutableState.expandedPanelSizes[c.id] ?? l.minSize : l.collapsedSize) - e);
			}
			break;
		}
		case "F6": {
			e.preventDefault();
			let n = fv(t).separators.map((e) => e.element), r = Array.from(n).findIndex((t) => t === e.currentTarget);
			$(r !== null, "Index not found"), n[e.shiftKey ? r > 0 ? r - 1 : n.length - 1 : r + 1 < n.length ? r + 1 : 0].focus({ preventScroll: !0 });
			break;
		}
		case "Home":
			e.preventDefault(), mv(t, -100);
			break;
	}
}
function gv(e) {
	if (e.defaultPrevented || e.pointerType === "mouse" && e.button > 0) return;
	let t = z_(), n = nv(e, t), r = /* @__PURE__ */ new Map(), i = !1;
	n.forEach((e) => {
		e.separator && (i || (i = !0, e.separator.element.focus({
			focusVisible: !1,
			preventScroll: !0
		})));
		let n = t.get(e.group);
		n && r.set(e.group, n.layout);
	}), b_({
		cursorFlags: 0,
		hitRegions: n,
		initialLayoutMap: r,
		pointerDownAtPoint: {
			x: e.clientX,
			y: e.clientY
		},
		state: "active"
	}), n.length && e.preventDefault();
}
function _v({ document: e, event: t, hitRegions: n, initialLayoutMap: r, mountedGroups: i, pointerDownAtPoint: a, prevCursorFlags: o }) {
	let s = 0;
	n.forEach((e) => {
		let { group: n, groupSize: o } = e, { orientation: c, panels: l } = n, { disableCursor: u } = n.mutableState, d = 0;
		d = a ? c === "horizontal" ? (t.clientX - a.x) / o * 100 : (t.clientY - a.y) / o * 100 : c === "horizontal" ? t.clientX < 0 ? -100 : 100 : t.clientY < 0 ? -100 : 100;
		let f = r.get(n), p = i.get(n);
		if (!f || !p) return;
		let { defaultLayoutDeferred: m, derivedPanelConstraints: h, groupSize: g, layout: _, separatorToPanels: v } = p;
		if (h && _ && v) {
			let t = sv({
				delta: d,
				initialLayout: f,
				panelConstraints: h,
				pivotIndices: e.panels.map((e) => l.indexOf(e)),
				prevLayout: _,
				trigger: "mouse-or-touch"
			});
			if (cv(t, _)) {
				if (d !== 0 && !u) switch (c) {
					case "horizontal":
						s |= d < 0 ? C_ : w_;
						break;
					case "vertical":
						s |= d < 0 ? T_ : E_;
						break;
				}
			} else V_(e.group, {
				defaultLayoutDeferred: m,
				derivedPanelConstraints: h,
				groupSize: g,
				layout: t,
				separatorToPanels: v
			});
		}
	});
	let c = 0;
	t.movementX === 0 ? c |= o & D_ : c |= s & D_, t.movementY === 0 ? c |= o & O_ : c |= s & O_, y_(c), N_(e);
}
function vv(e) {
	let t = z_(), n = __();
	switch (n.state) {
		case "active": _v({
			document: e.currentTarget,
			event: e,
			hitRegions: n.hitRegions,
			initialLayoutMap: n.initialLayoutMap,
			mountedGroups: t,
			prevCursorFlags: n.cursorFlags
		});
	}
}
function yv(e) {
	if (e.defaultPrevented) return;
	let t = __(), n = z_();
	switch (t.state) {
		case "active":
			if (e.buttons === 0) {
				b_({
					cursorFlags: 0,
					state: "inactive"
				}), t.hitRegions.forEach((e) => {
					let t = R_(e.group.id, !0);
					V_(e.group, t, { isUserInteraction: !0 });
				});
				return;
			}
			for (let n of t.hitRegions) if (n.separator) {
				let { element: t } = n.separator;
				t.hasPointerCapture?.(e.pointerId) || t.setPointerCapture?.(e.pointerId);
			}
			_v({
				document: e.currentTarget,
				event: e,
				hitRegions: t.hitRegions,
				initialLayoutMap: t.initialLayoutMap,
				mountedGroups: n,
				pointerDownAtPoint: t.pointerDownAtPoint,
				prevCursorFlags: t.cursorFlags
			});
			break;
		default: {
			let r = nv(e, n);
			r.length === 0 ? t.state !== "inactive" && b_({
				cursorFlags: 0,
				state: "inactive"
			}) : b_({
				cursorFlags: 0,
				hitRegions: r,
				state: "hover"
			}), N_(e.currentTarget);
			break;
		}
	}
}
function bv(e) {
	if (e.relatedTarget instanceof HTMLIFrameElement) switch (__().state) {
		case "hover": b_({
			cursorFlags: 0,
			state: "inactive"
		});
	}
}
function xv(e) {
	e.defaultPrevented || e.pointerType === "mouse" && e.button > 0 || H_(e.currentTarget) && e.preventDefault();
}
function Sv(e) {
	let t = 0, n = 0, r = {};
	for (let i of e) if (i.defaultSize !== void 0) {
		t++;
		let e = n_(i.defaultSize);
		n += e, r[i.panelId] = e;
	} else r[i.panelId] = void 0;
	let i = e.length - t;
	if (i !== 0) {
		let t = n_((100 - n) / i);
		for (let n of e) n.defaultSize === void 0 && (r[n.panelId] = t);
	}
	return r;
}
function Cv(e, t, n) {
	if (!n[0]) return;
	let r = e.panels.find((e) => e.element === t);
	if (!r || !r.onResize) return;
	let i = r_({ group: e }), a = e.orientation === "horizontal" ? r.element.offsetWidth : r.element.offsetHeight, o = r.mutableValues.prevSize, s = {
		asPercentage: n_(a / i * 100),
		inPixels: a
	};
	r.mutableValues.prevSize = s, r.onResize(s, r.id, o);
}
function wv(e, t) {
	if (Object.keys(e).length !== Object.keys(t).length) return !1;
	for (let n in e) if (e[n] !== t[n]) return !1;
	return !0;
}
function Tv({ group: e, nextGroupSize: t, prevGroupSize: n, prevLayout: r }) {
	if (n <= 0 || t <= 0 || n === t) return r;
	let i = 0, a = 0, o = !1, s = /* @__PURE__ */ new Map(), c = [];
	for (let l of e.panels) {
		let e = r[l.id] ?? 0;
		switch (l.panelConstraints.groupResizeBehavior) {
			case "preserve-pixel-size": {
				o = !0;
				let r = n_(e / 100 * n / t * 100);
				s.set(l.id, r), i += r;
				break;
			}
			default:
				c.push(l.id), a += e;
				break;
		}
	}
	if (!o || c.length === 0) return r;
	let l = 100 - i, u = { ...r };
	if (s.forEach((e, t) => {
		u[t] = e;
	}), a > 0) for (let e of c) u[e] = n_((r[e] ?? 0) / a * l);
	else {
		let e = n_(l / c.length);
		for (let t of c) u[t] = e;
	}
	return u;
}
function Ev(e, t) {
	let n = e.map((e) => e.id), r = Object.keys(t);
	if (n.length !== r.length) return !1;
	for (let e of n) if (!r.includes(e)) return !1;
	return !0;
}
var Dv = /* @__PURE__ */ new Map();
function Ov(e) {
	let t = !0;
	$(e.element.ownerDocument.defaultView, "Cannot register an unmounted Group");
	let n = e.element.ownerDocument.defaultView.ResizeObserver, r = /* @__PURE__ */ new Set(), i = /* @__PURE__ */ new Set(), a = new n((n) => {
		for (let r of n) {
			let { borderBoxSize: n, target: i } = r;
			if (i === e.element) {
				if (t) {
					let t = r_({ group: e });
					if (t === 0) return;
					let n = R_(e.id);
					if (!n) return;
					let r = i_(e), i = n.defaultLayoutDeferred ? Sv(r) : n.layout, a = lv({
						layout: Tv({
							group: e,
							nextGroupSize: t,
							prevGroupSize: n.groupSize,
							prevLayout: i
						}),
						panelConstraints: r
					});
					if (!n.defaultLayoutDeferred && cv(n.layout, a) && wv(n.derivedPanelConstraints, r) && n.groupSize === t) return;
					V_(e, {
						defaultLayoutDeferred: !1,
						derivedPanelConstraints: r,
						groupSize: t,
						layout: a,
						separatorToPanels: n.separatorToPanels
					});
				}
			} else Cv(e, i, n);
		}
	});
	a.observe(e.element), e.panels.forEach((e) => {
		$(!r.has(e.id), `Panel ids must be unique; id "${e.id}" was used more than once`), r.add(e.id), e.onResize && a.observe(e.element);
	});
	let o = r_({ group: e }), s = i_(e), c = e.panels.map(({ id: e }) => e).join(","), l = e.mutableState.defaultLayout;
	l && (Ev(e.panels, l) || (l = void 0));
	let u = lv({
		layout: e.mutableState.layouts[c] ?? l ?? Sv(s),
		panelConstraints: s
	}), d = e.element.ownerDocument;
	Dv.set(d, (Dv.get(d) ?? 0) + 1);
	let f = /* @__PURE__ */ new Map();
	return p_(e).forEach((e) => {
		e.separator && f.set(e.separator, e.panels);
	}), V_(e, {
		defaultLayoutDeferred: o === 0,
		derivedPanelConstraints: s,
		groupSize: o,
		layout: u,
		separatorToPanels: f
	}), e.separators.forEach((e) => {
		$(!i.has(e.id), `Separator ids must be unique; id "${e.id}" was used more than once`), i.add(e.id), e.element.addEventListener("keydown", hv);
	}), Dv.get(d) === 1 && (d.addEventListener("contextmenu", U_, !0), d.addEventListener("dblclick", dv, !0), d.addEventListener("pointerdown", gv, !0), d.addEventListener("pointerleave", vv), d.addEventListener("pointermove", yv), d.addEventListener("pointerout", bv), d.addEventListener("pointerup", xv, !0)), function() {
		t = !1, Dv.set(d, Math.max(0, (Dv.get(d) ?? 0) - 1)), I_(e), e.separators.forEach((e) => {
			e.element.removeEventListener("keydown", hv);
		}), Dv.get(d) || (d.removeEventListener("contextmenu", U_, !0), d.removeEventListener("dblclick", dv, !0), d.removeEventListener("pointerdown", gv, !0), d.removeEventListener("pointerleave", vv), d.removeEventListener("pointermove", yv), d.removeEventListener("pointerout", bv), d.removeEventListener("pointerup", xv, !0)), a.disconnect();
	};
}
function kv() {
	let [e, t] = (0, i.useState)({});
	return [e, (0, i.useCallback)(() => t({}), [])];
}
function Av(e) {
	let t = (0, i.useId)();
	return `${e ?? t}`;
}
var jv = typeof window < "u" ? i.useLayoutEffect : i.useEffect;
function Mv(e) {
	let t = (0, i.useRef)(e);
	return jv(() => {
		t.current = e;
	}, [e]), (0, i.useCallback)((...e) => t.current?.(...e), [t]);
}
function Nv(...e) {
	return Mv((t) => {
		e.forEach((e) => {
			if (e) switch (typeof e) {
				case "function":
					e(t);
					break;
				case "object":
					e.current = t;
					break;
			}
		});
	});
}
function Pv(e) {
	let t = (0, i.useRef)({ ...e });
	return jv(() => {
		for (let n in e) t.current[n] = e[n];
	}, [e]), t.current;
}
var Fv = (0, i.createContext)(null);
function Iv(e, t) {
	let n = (0, i.useRef)({
		getLayout: () => ({}),
		setLayout: x_
	});
	(0, i.useImperativeHandle)(t, () => n.current, []), jv(() => {
		Object.assign(n.current, pv({ groupId: e }));
	});
}
function Lv({ children: e, className: t, defaultLayout: n, disableCursor: r, disabled: a, elementRef: o, groupRef: s, id: c, onLayoutChange: l, onLayoutChanged: u, orientation: d = "horizontal", resizeTargetMinimumSize: f = {
	coarse: 20,
	fine: 10
}, style: p, ...m }) {
	let h = (0, i.useRef)({
		onLayoutChange: {},
		onLayoutChanged: {}
	}), g = Mv((e) => {
		cv(h.current.onLayoutChange, e) || (h.current.onLayoutChange = e, l?.(e));
	}), _ = Mv((e, t) => {
		cv(h.current.onLayoutChanged, e) || (h.current.onLayoutChanged = e, u?.(e, { isUserInteraction: t }));
	}), y = Av(c), b = (0, i.useRef)(null), [x, S] = kv(), C = (0, i.useRef)({
		lastExpandedPanelSizes: {},
		layouts: {},
		panels: [],
		resizeTargetMinimumSize: f,
		separators: []
	}), w = Nv(b, o);
	Iv(y, s);
	let T = Mv((e, t) => {
		let r = __(), i = L_(e), a = R_(e);
		if (a) {
			let e = !1;
			switch (r.state) {
				case "active":
					e = r.hitRegions.some((e) => e.group === i);
					break;
			}
			return {
				flexGrow: a.layout[t] ?? 1,
				pointerEvents: e ? "none" : void 0
			};
		}
		if (n?.[t]) return { flexGrow: n?.[t] };
	}), E = Pv({
		defaultLayout: n,
		disableCursor: r
	}), D = (0, i.useMemo)(() => ({
		get disableCursor() {
			return !!E.disableCursor;
		},
		getPanelStyles: T,
		id: y,
		orientation: d,
		registerPanel: (e) => {
			let t = C.current;
			return t.panels = a_(d, [...t.panels, e]), S(), () => {
				t.panels = t.panels.filter((t) => t !== e), S();
			};
		},
		registerSeparator: (e) => {
			let t = C.current;
			return t.separators = a_(d, [...t.separators, e]), S(), () => {
				t.separators = t.separators.filter((t) => t !== e), S();
			};
		},
		updatePanelProps: (e, { disabled: t }) => {
			let n = C.current.panels.find((t) => t.id === e);
			n && (n.panelConstraints.disabled = t);
			let r = L_(y), i = R_(y);
			r && i && V_(r, {
				...i,
				derivedPanelConstraints: i_(r)
			});
		},
		updateSeparatorProps: (e, { disabled: t, disableDoubleClick: n }) => {
			let r = C.current.separators.find((t) => t.id === e);
			r && (r.disabled = t, r.disableDoubleClick = n);
		}
	}), [
		T,
		y,
		S,
		d,
		E
	]), O = (0, i.useRef)(null);
	return jv(() => {
		let e = b.current;
		if (e === null) return;
		let t = C.current, n;
		if (E.defaultLayout !== void 0 && Object.keys(E.defaultLayout).length === t.panels.length) {
			n = {};
			for (let e of t.panels) {
				let t = E.defaultLayout[e.id];
				t !== void 0 && (n[e.id] = t);
			}
		}
		let r = {
			disabled: !!a,
			element: e,
			id: y,
			mutableState: {
				defaultLayout: n,
				disableCursor: !!E.disableCursor,
				expandedPanelSizes: C.current.lastExpandedPanelSizes,
				layouts: C.current.layouts
			},
			orientation: d,
			panels: t.panels,
			resizeTargetMinimumSize: t.resizeTargetMinimumSize,
			separators: t.separators
		};
		O.current = r;
		let i = Ov(r), { defaultLayoutDeferred: o, derivedPanelConstraints: s, layout: c } = R_(r.id, !0);
		!o && s.length > 0 && (g(c), _(c, !1));
		let l = B_(y, (e) => {
			let { defaultLayoutDeferred: t, derivedPanelConstraints: n, layout: i } = e.next;
			if (t || n.length === 0) return;
			let a = r.panels.map(({ id: e }) => e).join(",");
			r.mutableState.layouts[a] = i, n.forEach((t) => {
				if (t.collapsible) {
					let { layout: n } = e.prev ?? {};
					if (n) {
						let e = iv(t.collapsedSize, i[t.panelId]), a = iv(t.collapsedSize, n[t.panelId]);
						e && !a && (r.mutableState.expandedPanelSizes[t.panelId] = n[t.panelId]);
					}
				}
			});
			let o = __().state !== "active";
			g(i), o && _(i, e.isUserInteraction);
		});
		return () => {
			O.current = null, i(), l();
		};
	}, [
		a,
		y,
		_,
		g,
		d,
		x,
		E
	]), (0, i.useEffect)(() => {
		let e = O.current;
		e && (e.mutableState.defaultLayout = n, e.mutableState.disableCursor = !!r);
	}), /* @__PURE__ */ (0, v.jsx)(Fv.Provider, {
		value: D,
		children: /* @__PURE__ */ (0, v.jsx)("div", {
			...m,
			className: t,
			"data-group": !0,
			"data-testid": y,
			id: y,
			ref: w,
			style: {
				height: "100%",
				width: "100%",
				overflow: "hidden",
				...p,
				display: "flex",
				flexDirection: d === "horizontal" ? "row" : "column",
				flexWrap: "nowrap",
				touchAction: d === "horizontal" ? "pan-y" : "pan-x"
			},
			children: e
		})
	});
}
Lv.displayName = "Group";
function Rv() {
	let e = (0, i.useContext)(Fv);
	return $(e, "Group Context not found; did you render a Panel or Separator outside of a Group?"), e;
}
function zv(e, t) {
	let { id: n } = Rv(), r = (0, i.useRef)({
		collapse: S_,
		expand: S_,
		getSize: () => ({
			asPercentage: 0,
			inPixels: 0
		}),
		isCollapsed: () => !1,
		resize: S_
	});
	(0, i.useImperativeHandle)(t, () => r.current, []), jv(() => {
		Object.assign(r.current, uv({
			groupId: n,
			panelId: e
		}));
	});
}
function Bv({ children: e, className: t, collapsedSize: n = "0%", collapsible: r = !1, defaultSize: a, disabled: o, elementRef: s, groupResizeBehavior: c = "preserve-relative-size", id: l, maxSize: u = "100%", minSize: d = "0%", onResize: f, panelRef: p, style: m, ...h }) {
	let g = !!l, _ = Av(l), y = Pv({ disabled: o }), b = (0, i.useRef)(null), x = Nv(b, s), { getPanelStyles: S, id: C, orientation: w, registerPanel: T, updatePanelProps: E } = Rv(), D = f !== null, O = Mv((e, t, n) => {
		f?.(e, l, n);
	});
	jv(() => {
		let e = b.current;
		if (e !== null) {
			let t = {
				element: e,
				id: _,
				idIsStable: g,
				mutableValues: {
					expandToSize: void 0,
					prevSize: void 0
				},
				onResize: D ? O : void 0,
				panelConstraints: {
					groupResizeBehavior: c,
					collapsedSize: n,
					collapsible: r,
					defaultSize: a,
					disabled: y.disabled,
					maxSize: u,
					minSize: d
				}
			};
			return T(t);
		}
	}, [
		c,
		n,
		r,
		a,
		D,
		_,
		g,
		u,
		d,
		O,
		T,
		y
	]), (0, i.useEffect)(() => {
		E(_, { disabled: o });
	}, [
		o,
		_,
		E
	]), zv(_, p);
	let k = () => {
		let e = S(C, _);
		if (e) return JSON.stringify(e);
	}, A = (0, i.useSyncExternalStore)((e) => B_(C, e), k, k), j;
	return j = A ? JSON.parse(A) : a === void 0 ? { flexGrow: 1 } : {
		flexGrow: void 0,
		flexShrink: void 0,
		flexBasis: a
	}, /* @__PURE__ */ (0, v.jsx)("div", {
		...h,
		"data-disabled": o || void 0,
		"data-panel": !0,
		"data-testid": _,
		id: _,
		ref: x,
		style: {
			...Vv,
			display: "flex",
			flexBasis: 0,
			flexShrink: 1,
			overflow: "visible",
			...j
		},
		children: /* @__PURE__ */ (0, v.jsx)("div", {
			className: t,
			style: {
				maxHeight: "100%",
				maxWidth: "100%",
				flexGrow: 1,
				overflow: "auto",
				...m,
				touchAction: w === "horizontal" ? "pan-y" : "pan-x"
			},
			children: e
		})
	});
}
Bv.displayName = "Panel";
var Vv = {
	minHeight: 0,
	maxHeight: "100%",
	height: "auto",
	minWidth: 0,
	maxWidth: "100%",
	width: "auto",
	border: "none",
	borderWidth: 0,
	padding: 0,
	margin: 0
};
function Hv() {
	return (0, i.useRef)(null);
}
function Uv({ layout: e, panelConstraints: t, panelId: n, panelIndex: r }) {
	let i, a, o = e[n], s = t.find((e) => e.panelId === n);
	if (s) {
		let c = s.maxSize, l = s.collapsible ? s.collapsedSize : s.minSize, u = [r, r + 1];
		a = lv({
			layout: sv({
				delta: l - o,
				initialLayout: e,
				panelConstraints: t,
				pivotIndices: u,
				prevLayout: e
			}),
			panelConstraints: t
		})[n], i = lv({
			layout: sv({
				delta: c - o,
				initialLayout: e,
				panelConstraints: t,
				pivotIndices: u,
				prevLayout: e
			}),
			panelConstraints: t
		})[n];
	}
	return {
		valueControls: n,
		valueMax: i,
		valueMin: a,
		valueNow: o
	};
}
function Wv({ children: e, className: t, disabled: n, disableDoubleClick: r, elementRef: a, id: o, style: s, ...c }) {
	let l = Av(o), u = Pv({
		disabled: n,
		disableDoubleClick: r
	}), [d, f] = (0, i.useState)({}), [p, m] = (0, i.useState)("inactive"), [h, g] = (0, i.useState)(!1), _ = (0, i.useRef)(null), y = Nv(_, a), { disableCursor: b, id: x, orientation: S, registerSeparator: C, updateSeparatorProps: w } = Rv(), T = S === "horizontal" ? "vertical" : "horizontal";
	jv(() => {
		let e = _.current;
		if (e !== null) {
			let t = {
				disabled: u.disabled,
				disableDoubleClick: u.disableDoubleClick,
				element: e,
				id: l
			}, n = C(t), r = v_((e) => {
				m(e.next.state !== "inactive" && e.next.hitRegions.some((e) => e.separator === t) ? e.next.state : "inactive");
			}), i = B_(x, (e) => {
				let { derivedPanelConstraints: n, layout: r, separatorToPanels: i } = e.next, a = i.get(t);
				if (a) {
					let e = a[0], t = a.indexOf(e);
					f(Uv({
						layout: r,
						panelConstraints: n,
						panelId: e.id,
						panelIndex: t
					}));
				}
			});
			return () => {
				r(), i(), n();
			};
		}
	}, [
		x,
		l,
		C,
		u
	]), (0, i.useEffect)(() => {
		w(l, {
			disabled: n,
			disableDoubleClick: r
		});
	}, [
		n,
		r,
		l,
		w
	]);
	let E;
	n && !b && (E = "not-allowed");
	let D;
	if (n) D = "disabled";
	else switch (p) {
		case "active":
			D = "active";
			break;
		default: D = h ? "focus" : p;
	}
	return /* @__PURE__ */ (0, v.jsx)("div", {
		...c,
		"aria-controls": d.valueControls,
		"aria-disabled": n || void 0,
		"aria-orientation": T,
		"aria-valuemax": d.valueMax,
		"aria-valuemin": d.valueMin,
		"aria-valuenow": d.valueNow,
		children: e,
		className: t,
		"data-separator": D,
		"data-testid": l,
		id: l,
		onBlur: () => g(!1),
		onFocus: () => g(!0),
		ref: y,
		role: "separator",
		style: {
			flexBasis: "auto",
			cursor: E,
			...s,
			flexGrow: 0,
			flexShrink: 0,
			touchAction: "none"
		},
		tabIndex: n ? void 0 : 0
	});
}
Wv.displayName = "Separator";
//#endregion
//#region src/components/ui/resizable.tsx
function Gv({ className: e, ...t }) {
	return /* @__PURE__ */ (0, v.jsx)(Lv, {
		"data-slot": "resizable-panel-group",
		className: X("flex h-full w-full aria-[orientation=vertical]:flex-col", e),
		...t
	});
}
function Kv({ ...e }) {
	return /* @__PURE__ */ (0, v.jsx)(Bv, {
		"data-slot": "resizable-panel",
		...e
	});
}
function qv({ withHandle: e, className: t, ...n }) {
	return /* @__PURE__ */ (0, v.jsx)(Wv, {
		"data-slot": "resizable-handle",
		className: X("relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-hidden aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:after:left-0 aria-[orientation=horizontal]:after:h-1 aria-[orientation=horizontal]:after:w-full aria-[orientation=horizontal]:after:translate-x-0 aria-[orientation=horizontal]:after:-translate-y-1/2 [&[aria-orientation=horizontal]>div]:rotate-90", t),
		...n,
		children: e && /* @__PURE__ */ (0, v.jsx)("div", {
			className: "z-10 flex h-4 w-3 items-center justify-center rounded-xs border bg-border",
			children: /* @__PURE__ */ (0, v.jsx)(hd, { className: "size-2.5" })
		})
	});
}
//#endregion
//#region src/lib/admin-panels-layout.ts
var Jv = "map-preview", Yv = "settings", Xv = "admin_panels_layout", Zv = "mapsvg-admin-panels-left-width", Qv = {
	[Jv]: 50,
	[Yv]: 50
};
function $v(e) {
	return Math.min(80, Math.max(20, e));
}
function ey(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return null;
	let t = e, n = Number(t[Jv]), r = Number(t[Yv]);
	if (!Number.isFinite(n) || !Number.isFinite(r)) return null;
	let i = $v(n);
	return {
		[Jv]: i,
		[Yv]: $v(100 - i)
	};
}
function ty(e) {
	if (typeof e == "string") {
		let t = e.trim();
		if (!t) return null;
		if (/^\d+(\.\d+)?$/.test(t)) {
			let e = $v(parseFloat(t));
			return {
				[Jv]: e,
				[Yv]: $v(100 - e)
			};
		}
		try {
			return ey(JSON.parse(t));
		} catch {
			return null;
		}
	}
	return ey(e);
}
function ny() {
	try {
		let e = localStorage.getItem(Zv);
		if (e === null) return null;
		let t = parseFloat(e);
		if (!Number.isFinite(t)) return null;
		let n = $v(t);
		return {
			[Jv]: n,
			[Yv]: $v(100 - n)
		};
	} catch {
		return null;
	}
}
function ry(e) {
	return ty((e && typeof e == "object" && !Array.isArray(e) ? e : tm().options)?.[Xv]) || ny() || { ...Qv };
}
function iy() {
	let e = tm();
	return {
		base: e.apiUrl.replace(/\/?$/, ""),
		nonce: e.nonce
	};
}
async function ay(e) {
	let t = ey(e) ?? Qv, n = JSON.stringify(t), { base: r, nonce: i } = iy(), a = window.mapsvgReactAdminParams;
	a && typeof a.options == "object" && a.options && (a.options[Xv] = n);
	try {
		localStorage.setItem(Zv, String(t[Jv]));
	} catch {}
	let o = await lm(`${r}/options/`, {
		method: "POST",
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"X-WP-Nonce": i
		},
		credentials: "same-origin",
		body: JSON.stringify({ options: { [Xv]: n } })
	});
	if (!o.ok) throw Error(`Failed to save panel layout (${o.status})`);
}
//#endregion
//#region src/lib/ai-draft-actions.ts
var oy = "mapsvg:ai-draft-action-request", sy = "mapsvg:apply-prepared-svg", cy = /* @__PURE__ */ new Map(), ly = /* @__PURE__ */ new Set();
function uy(e) {
	cy.delete(e.mapId);
	try {
		e.map.destroy();
	} catch {}
}
function dy(e) {
	cy.has(e) && ly.add(e);
}
function fy(e) {
	ly.delete(e);
	let t = cy.get(e);
	t && uy(t);
}
//#endregion
//#region src/lib/map-draft.ts
var py = /* @__PURE__ */ new Set();
function my(e) {
	py.add(e);
}
function hy(e) {
	py.delete(e);
}
function gy(e) {
	return py.has(e);
}
function _y(e) {
	let t = e && typeof e == "object" && typeof e.getData == "function" ? e.getData().options : e?.options;
	return !t || typeof t != "object" ? {} : JSON.parse(JSON.stringify(t));
}
function vy(e) {
	if (typeof e != "object" || !e) return JSON.stringify(e) ?? "null";
	if (Array.isArray(e)) return `[${e.map((e) => vy(e)).join(",")}]`;
	let t = e;
	return `{${Object.keys(t).sort().map((e) => `${JSON.stringify(e)}:${vy(t[e])}`).join(",")}}`;
}
function yy(e) {
	let t = vy(e), n = 2166136261;
	for (let e = 0; e < t.length; e += 1) n ^= t.charCodeAt(e), n = Math.imul(n, 16777619);
	return `${(n >>> 0).toString(16)}:${t.length}`;
}
function by(e) {
	let t = { ...e };
	return delete t.title, delete t.useShadowRoot, yy(t);
}
function xy(e) {
	return typeof e.title == "string" ? e.title : "";
}
function Sy(e, t, n) {
	return by(e) === t && (n === void 0 || xy(e) === n);
}
function Cy(e, t, n = e.baselineFingerprint) {
	let r = {
		...e.options,
		title: t
	};
	return Sy(r, e.baselineOptionsFingerprint, t) ? null : {
		...e,
		options: r,
		baselineTitle: t,
		baselineFingerprint: n,
		draftFingerprint: by(r),
		conflicted: !1,
		updatedAt: Date.now()
	};
}
//#endregion
//#region src/lib/map-svg-operations.ts
function wy(e) {
	return {
		map: e,
		source: typeof e.options.source == "string" ? e.options.source : "",
		draftId: Am(e.id).activeId
	};
}
function Ty(e) {
	return pp() === e.map && e.map.options.source === e.source && (e.draftId === void 0 || e.draftId === Am(e.map.id).activeId);
}
function Ey(e, t) {
	if (t.signal?.aborted || !Ty(e)) throw Error("This SVG editor is no longer active.");
	if (!Number.isSafeInteger(e.map.id) || e.map.id <= 0 || !e.source) throw Error("Choose a saved map with an SVG file.");
	if (Z.getState().mapDrafts[String(e.map.id)]?.conflicted) throw Error("Resolve the map draft conflict before editing its SVG file.");
}
async function Dy(e, t) {
	let { apiUrl: n, nonce: r } = tm(), i = await lm(_m(n, e), {
		method: "POST",
		credentials: "same-origin",
		headers: {
			Accept: "application/json",
			"X-WP-Nonce": r
		},
		body: t
	}), a = await i.json().catch(() => null);
	if (!i.ok || !a || typeof a != "object" || a.error) {
		let e = a?.error ?? a?.message;
		throw Error(typeof e == "string" ? e : `SVG operation failed (${i.status}).`);
	}
	return a;
}
function Oy(e) {
	if (typeof e != "number" && (typeof e != "string" || !/^\d+$/.test(e))) return 0;
	let t = Number(e);
	return Number.isSafeInteger(t) && t > 0 ? t : 0;
}
function ky(e) {
	return Math.max(Oy(e.map.svgFileLastChanged), Oy(e.map.getData?.().svgFileLastChanged));
}
function Ay(e) {
	let t = Oy(e);
	if (!t) throw Error("The server did not return the saved SVG revision.");
	return t;
}
function jy(e, t) {
	Ty(e) && (t !== void 0 && (e.map.svgFileLastChanged = t), window.dispatchEvent(new CustomEvent("mapsvg:options-replace", { detail: {
		mapId: e.map.id,
		options: _y(e.map)
	} })));
}
function My(e, t, n) {
	let r = Z.getState(), i = e.map.id, a = String(i), o = pp();
	if (Number(t?.id) !== i || !t.options || typeof t.options.source != "string") throw Error("The server did not return the saved SVG source.");
	let s = t.svgFileLastChanged === void 0 ? void 0 : Ay(t.svgFileLastChanged);
	if (o?.id === i && !Ty(e) || o?.id !== i && !r.mapSessions[a] && !r.mapDrafts[a] && !r.mapServerBaselines[a]) return;
	let c = o?.id === i ? _y(o) : r.mapDrafts[a]?.options ?? _y(e.map), l = { ...c };
	if (c.source === e.source || c.source === t.options.source) for (let e of n ? [
		"source",
		"width",
		"height",
		"viewBox"
	] : ["source"]) Object.prototype.hasOwnProperty.call(t.options, e) ? l[e] = structuredClone(t.options[e]) : delete l[e];
	let u = by(t.options), d = xy(t.options);
	r.setMapServerBaseline(i, u), r.setMapBaseline(i, u), r.setMapTitleBaseline(i, d), Sy(l, u, d) ? r.clearMapDraft(i) : r.setMapDraft(i, {
		options: l,
		baselineFingerprint: u,
		baselineOptionsFingerprint: u,
		baselineTitle: d,
		draftFingerprint: by(l),
		updatedAt: Date.now()
	}), o?.id === i ? (l.source === t.options.source && s !== void 0 && (o.svgFileLastChanged = s), window.dispatchEvent(new CustomEvent("mapsvg:options-replace", { detail: {
		mapId: i,
		options: l
	} }))) : fy(i);
}
async function Ny(e, t, n, r = ky(e)) {
	let i = Am(e.map.id);
	if (i.ready && i.activeId != null) {
		let r = await Sm(`/apps/${e.map.id}/drafts/${i.activeId}/svg-source`, "POST", { source: t });
		Ey(e, {});
		let a = {
			..._y(e.map),
			...n ? r.geometry : {},
			source: r.source
		};
		r.svgAsset ? a.svgAsset = r.svgAsset : delete a.svgAsset, i.capture({
			...i.active.snapshot,
			options: a
		}), window.dispatchEvent(new CustomEvent("mapsvg:options-replace", { detail: {
			mapId: e.map.id,
			options: a
		} }));
		return;
	}
	My(e, (await Dy("/svgfile/map-source", new URLSearchParams({
		mapId: String(e.map.id),
		source: t,
		expectedSource: e.source,
		resetGeometry: String(n),
		svgFileLastChanged: String(r)
	}))).map, n);
}
async function Py(e, t, n = {}) {
	Ey(e, n), !(!t || t === e.source) && (n.onSubmitted?.(), await Ny(e, t, !0));
}
async function Fy(e, t, n = {}) {
	if (Ey(e, n), n.onSubmitted?.(), Am(e.map.id).ready) {
		if (t) throw Error("Region titles are shared Database records. Edit them in Database; draft reload preserves shared titles.");
		jy(e);
		return;
	}
	let r = await Dy("/svgfile/reload", new URLSearchParams({
		"file[relativeUrl]": e.source,
		updateTitles: String(t)
	}));
	n.signal?.aborted || jy(e, Ay(r.regionSync?.svgFileLastChanged));
}
function Iy(e) {
	let t = window, n = t.mapsvgFrontendParams?.routes?.uploads ?? t.mapsvg?.routes?.uploads;
	if (!n) return !1;
	let r = new URL(e, window.location.href), i = new URL(n, window.location.href);
	return r.origin === i.origin && r.pathname.startsWith(i.pathname.replace(/\/$/, "") + "/");
}
async function Ly(e, t, n = {}) {
	if (Ey(e, n), !t.trim()) throw Error("The drawing editor returned an empty SVG.");
	n.onSubmitted?.();
	let r = Am(e.map.id);
	if (r.ready) {
		r.capture({
			...r.active.snapshot,
			options: _y(e.map)
		});
		let i = await r.saveSvg(e.source, t, n.resetGeometry === !0, e.draftId);
		Ey(e, n);
		let a = {
			..._y(e.map),
			source: i.options.source
		};
		if (i.options.svgAsset ? a.svgAsset = structuredClone(i.options.svgAsset) : delete a.svgAsset, n.resetGeometry) for (let e of [
			"width",
			"height",
			"viewBox"
		]) a[e] = i.options[e];
		e.map.svgFileLastChanged = Number(i.svgFileLastChanged), window.dispatchEvent(new CustomEvent("mapsvg:options-replace", { detail: {
			mapId: e.map.id,
			options: a,
			preserveWorkspace: n.preserveWorkspace === !0
		} }));
		return;
	}
	let i = e.source;
	if (!Iy(i)) {
		if (!e.pendingSource) {
			let t = await Dy("/svgfile/copy", new URLSearchParams({ "file[path]": i }));
			if (typeof t.file?.relativeUrl != "string" || !t.file.relativeUrl) throw Error("The server did not return a writable SVG copy.");
			e.pendingSource = t.file.relativeUrl;
		}
		i = e.pendingSource;
	}
	Ey(e, n);
	let a = new URL(i, window.location.href).pathname.split("/").pop(), o = a ? decodeURIComponent(a) : "";
	if (!o || !/\.svg$/i.test(o)) throw Error("The SVG file has an invalid filename.");
	let s = new FormData();
	s.append("file", new Blob([t], { type: "image/svg+xml" }), o), s.append("path", i);
	let c = Math.max(ky(e), i === e.pendingSource ? e.pendingSvgFileLastChanged ?? 0 : 0);
	s.append("svgFileLastChanged", String(c));
	let l = Ay((await Dy("/svgfile/update", s)).svgFileLastChanged);
	if (l <= c) throw Error("The server did not advance the saved SVG revision.");
	i === e.source ? n.signal?.aborted || (n.resetGeometry ? await Ny(e, i, !0, l) : jy(e, l)) : (e.pendingSvgFileLastChanged = l, Ey(e, n), await Ny(e, i, n.resetGeometry === !0, l));
}
//#endregion
//#region ../mapsvg/Map/pageBindings.ts
function Ry(e, t) {
	return typeof e.perPage == "number" ? e.perPage : e.perPage === null ? t ?? 50 : e.pagination.on ? e.pagination.perpage : t ?? 5e3;
}
function zy(e, t, n = By(e)) {
	let r = t === "map" ? e?.showPagination : e?.menu?.showPagination;
	if (typeof r == "boolean") return r;
	let i = Vy(e, Hy(e, "directory"), n).pagination;
	return !!i.on && i.perpage !== 0 && [t, "both"].includes(i.showIn);
}
function By(e) {
	let t = e?.scenes ?? [], n = e?.stateGraph?.defaultStateId;
	return e?.stateGraph?.states?.find((e) => e.id === n)?.sceneId ?? t.find((e) => `scene:${e.id}` === n)?.id ?? t[0]?.id ?? "scene-1";
}
function Vy(e, t, n = By(e)) {
	let r = (e?.scenes?.find((e) => e.id === n))?.dataBindings?.[t] ?? {}, i = t === "objects" ? "getObjects" : "getRegions", a = r.queryId || i, o = (e?.menu?.source === "regions" ? "regions" : "objects") === t, s = t === "objects" ? e?.database?.pagination : { on: !1 }, c = o && a === i && e?.menu?.sortBy ? [{ [e.menu.sortBy]: e.menu.sortDirection === "asc" ? "asc" : "desc" }] : void 0, l = o && e?.menu?.filterout?.field ? { [e.menu.filterout.field]: e.menu.filterout.val } : void 0;
	return {
		...r,
		queryId: a,
		orderBy: r.orderBy ?? c,
		filterout: r.filterout ?? l,
		disableOn: {
			initialLoad: t === "objects" && e?.database?.loadOnStart === !1,
			emptyFilters: t === "objects" && e?.database?.noFiltersNoLoad === !0,
			...r.disableOn
		},
		pagination: {
			on: !1,
			perpage: 30,
			showIn: "both",
			next: "Next",
			prev: "Prev.",
			...s,
			...r.pagination
		},
		refetch: {
			on: !1,
			value: 5,
			unit: "s",
			...t === "objects" ? e?.database?.autoRefetch : e?.database?.regionsAutoRefetch,
			...r.refetch
		}
	};
}
function Hy(e, t) {
	let n = e?.[t === "directory" ? "menu" : "filters"];
	return n?.binding === "regions" || !n?.binding && n?.source === "regions" ? "regions" : "objects";
}
//#endregion
//#region src/lib/region-svg-sync.ts
function Uy(e) {
	let t = ep(e), n = t.activePageId();
	if (!n) throw Error("Select a Page with a Regions Query first.");
	return {
		...wy(e),
		pageId: n,
		stateId: t.activeId,
		prefix: String(e.options.regionPrefix ?? ""),
		binding: JSON.stringify(Vy(e.options, "regions", n))
	};
}
function Wy(e) {
	if (!Ty(e) || String(e.map.options.regionPrefix ?? "") !== e.prefix) return !1;
	let t = ep(e.map);
	return t.activePageId() === e.pageId && t.activeId === e.stateId && JSON.stringify(Vy(e.map.options, "regions", e.pageId)) === e.binding;
}
function Gy(e) {
	if (!Wy(e)) throw Error("The draft, SVG or Regions binding changed. Open synchronization again.");
	let t = Am(e.map.id);
	if (!t.ready || e.draftId == null || t.activeId !== e.draftId || !t.active) throw Error("Open a saved draft before synchronizing Regions.");
	if (t.active.conflicted) throw Error("Resolve the draft conflict before synchronizing Regions.");
	if (t.offline) throw Error("Connect to the server before synchronizing Regions.");
	return {
		session: t,
		copy: t.active
	};
}
async function Ky(e, t) {
	let { session: n } = Gy(e), r = e.map.getData?.();
	r && n.capture(r), await n.flush(e.draftId);
	let { copy: i } = Gy(e);
	if (i.dirty) throw Error("The draft changed while saving. Review the changes again.");
	let a = await Sm(`/apps/${e.map.id}/drafts/${e.draftId}/regions-${t}/preview`, "POST", {
		revision: i.revision,
		pageId: e.pageId,
		stateId: e.stateId
	});
	return Gy(e), a;
}
var qy = (e) => Ky(e, "sync"), Jy = (e) => Ky(e, "cleanup");
async function Yy(e, t) {
	return Zy(e, t, "sync");
}
async function Xy(e, t) {
	return Zy(e, t, "cleanup");
}
async function Zy(e, t, n) {
	let { copy: r } = Gy(e);
	if (r.dirty || r.revision !== t.revision) throw Error("The draft changed after this preview. Review the changes again.");
	let i = await Sm(`/apps/${e.map.id}/drafts/${e.draftId}/regions-${n}`, "POST", {
		revision: t.revision,
		pageId: e.pageId,
		stateId: e.stateId,
		token: t.token
	});
	return Wy(e) && e.map.regionsRepository?.reload?.({ automatic: !0 }), (n === "sync" ? i.inserted : i.deleted) ?? 0;
}
//#endregion
//#region src/lib/prepared-svg-operation.ts
async function Qy(e) {
	let t = pp(), n = Am(e.mapId);
	if (!t || t.id !== e.mapId || n.activeId !== e.draftId || !n.ready || !n.active || n.active.conflicted || n.offline || n.busy || n.transitioning) throw Error("Keep the same ready online draft open to apply detected zones");
	let r = wy(t), i = Uy(t), a = await e.prepare();
	if (a.draftId !== e.draftId || a.source !== r.source || typeof a.svg != "string") throw Error("The proposal source changed");
	a.alreadyApplied || await Ly(r, a.svg, { preserveWorkspace: !0 });
	let o = pp();
	for (let e = 0; e < 200 && (!o || !a.alreadyApplied && o === t); e++) await new Promise((e) => setTimeout(e, 50)), o = pp();
	if (!o || o.id !== e.mapId || n.activeId !== e.draftId) throw Error("The active App/draft changed after SVG save");
	let s = Uy(o);
	if (s.pageId !== i.pageId || s.stateId !== i.stateId || s.binding !== i.binding || s.prefix !== i.prefix) throw Error("The Page, Scene or Regions binding changed after detection");
	if (a.syncRegions !== !1) {
		let e = await qy(s);
		e.additions.length && await Yy(s, e);
	}
	return await e.complete(s.pageId, s.stateId), { count: a.regionIds.length };
}
//#endregion
//#region src/lib/ai-publish.ts
var $y = "mapsvg:ai-publish-request";
//#endregion
//#region src/lib/bound-runtime-collections.ts
function eb(e) {
	let t = e, n = e.options.database?.schemas;
	return [...new Set(["objects", "regions"].flatMap((e) => {
		let r = (e === "objects" ? t.objectsRepository : t.regionsRepository)?.getSchema?.()?.name || n?.[e]?.name;
		return typeof r == "string" && r ? [r] : [];
	}))];
}
//#endregion
//#region src/lib/mapsvg-api.ts
async function tb(e, t) {
	return (await lb(`/schemas/${encodeURIComponent(String(e))}/editor-defaults`, void 0, t)).defaults;
}
async function nb(e, t) {
	await ub("PATCH", `/schemas/${encodeURIComponent(String(e))}/editor-defaults`, t);
}
async function rb(e) {
	return (await lb("/location-picker/maps", void 0, e)).items;
}
async function ib(e, t) {
	return (await lb(`/location-picker/maps/${e}`, void 0, t)).map;
}
var ab = class extends Error {
	status;
	code;
	issues;
	constructor(e, t, n) {
		super(e), this.name = "MapSvgApiError", this.status = t, this.code = n?.code, this.issues = n?.issues;
	}
};
function ob(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return {};
	let t = e, n = t.error && typeof t.error == "object" && !Array.isArray(t.error) ? t.error : null, r = t.data && typeof t.data == "object" && !Array.isArray(t.data) ? t.data : null;
	return {
		message: typeof t.error == "string" ? t.error : typeof n?.message == "string" ? n.message : typeof r?.error == "string" ? r.error : void 0,
		code: typeof t.code == "string" ? t.code : typeof n?.code == "string" ? n.code : void 0,
		issues: Array.isArray(t.issues) ? t.issues : Array.isArray(n?.issues) ? n.issues : void 0
	};
}
function sb() {
	let e = tm();
	return {
		base: e.apiUrl,
		nonce: e.nonce
	};
}
function cb(e, t, n) {
	let r = _m(e, t.startsWith("/") ? t : `/${t}`);
	if (!n) return r;
	let i = r.indexOf("?"), a = i < 0 ? r : r.slice(0, i), o = new URLSearchParams(i < 0 ? "" : r.slice(i + 1));
	for (let [e, t] of Object.entries(n)) o.set(e, String(t));
	return a + (o.size ? "?" + o.toString() : "");
}
async function lb(e, t, n) {
	let { base: r, nonce: i } = sb(), a = await lm(cb(r, e, t), {
		headers: {
			Accept: "application/json",
			"X-WP-Nonce": i
		},
		credentials: "same-origin",
		...n ? { signal: n } : {}
	});
	if (!a.ok) throw Error(`API ${a.status}: ${e}`);
	return await a.json();
}
async function ub(e, t, n, r) {
	let { base: i, nonce: a } = sb(), o = await lm(cb(i, t), {
		method: e,
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			"X-WP-Nonce": a
		},
		credentials: "same-origin",
		body: n === void 0 ? void 0 : JSON.stringify(n),
		...r ? { signal: r } : {}
	});
	if (!o.ok) {
		let e = ob(await o.json().catch(() => null));
		throw new ab(e.message || `API ${o.status}: ${t}`, o.status, {
			code: e.code,
			issues: e.issues
		});
	}
	return await o.json().catch(() => ({}));
}
async function db(e, t, n) {
	return ub("POST", e, t, n);
}
async function fb(e, t) {
	return ub("PUT", e, t);
}
function pb(e) {
	return e.bindings?.svg || e.type === "region" ? !0 : !!(e.name && String(e.name).startsWith("regions_"));
}
function mb(e) {
	return e.title?.trim() || e.name || `Schema #${e.id}`;
}
async function hb() {
	let e = await lb("/schemas", { perpage: 9999 });
	return Array.isArray(e) ? e : Array.isArray(e.items) ? e.items : [];
}
async function gb(e) {
	let t = await lb("/post-types", void 0, e);
	if (!Array.isArray(t) || t.some((e) => typeof e != "string" || !e)) throw Error("MapSVG returned an invalid post type catalog.");
	return [...new Set(t)].sort((e, t) => e.localeCompare(t));
}
async function _b(e) {
	let t = await db("/schemas", { schema: {
		type: e.type,
		title: e.title.trim(),
		objectNameSingular: e.objectNameSingular.trim(),
		objectNamePlural: e.objectNamePlural.trim(),
		...e.type === "post" ? {
			postType: e.postType,
			markerSupport: +!!e.markerSupport,
			regionSupport: +!!e.regionSupport
		} : {}
	} });
	if (!t.schema?.id || !t.schema.name || t.schema.type !== e.type) throw Error("MapSVG returned an invalid created Collection.");
	return t.schema;
}
async function vb(e, t) {
	await fb(`/schemas/${encodeURIComponent(String(e.id))}`, { schema: {
		title: t.title.trim(),
		objectNameSingular: t.objectNameSingular.trim(),
		objectNamePlural: t.objectNamePlural.trim(),
		...e.type === "post" ? {
			type: "post",
			markerSupport: +!!t.markerSupport,
			regionSupport: +!!t.regionSupport
		} : {}
	} });
}
async function yb(e) {
	await ub("DELETE", `/collection/${encodeURIComponent(e.name)}`);
}
async function bb(e) {
	await ub("DELETE", `/schemas/${encodeURIComponent(String(e.id))}`);
}
async function xb(e) {
	let t = await lb(`/maps/${e}`), n = t.map && typeof t.map == "object" ? t.map : t, r = (n.options ?? n).database ?? {}, i = r.schemas ?? {}, a = i.objects, o = i.regions, s = [];
	return a?.id != null && s.push(String(a.id)), o?.id != null && s.push(String(o.id)), {
		objectsSchemaId: a?.id == null ? null : String(a.id),
		regionsSchemaId: o?.id == null ? null : String(o.id),
		objectsTableName: typeof r.objectsTableName == "string" ? r.objectsTableName : a?.name ?? null,
		regionsTableName: typeof r.regionsTableName == "string" ? r.regionsTableName : o?.name ?? null,
		connectedSchemaIds: s
	};
}
function Sb(e) {
	return e.objectNameSingular ? e.objectNameSingular : pb(e) ? "region" : e.type === "post" ? "post" : "object";
}
function Cb(e) {
	return e === !0 || e === 1 || typeof e == "string" && [
		"1",
		"true",
		"on",
		"yes"
	].includes(e.trim().toLowerCase());
}
function wb(e, t, n) {
	let r = { ...t };
	for (let t of e.fields ?? []) {
		if (n === "update" && t.name === "id") continue;
		let e = t.type?.toLowerCase() === "id" && (t.auto_increment == null || Cb(t.auto_increment));
		(Cb(t.readonly) || n === "create" && e) && delete r[t.name];
	}
	return r;
}
async function Tb(e, t) {
	let n = Sb(e), r = (await db(`/collection/${encodeURIComponent(e.name)}`, { [n]: wb(e, t, "create") }))[n];
	if (!r || typeof r != "object" || Array.isArray(r)) throw Error("MapSVG returned an invalid created row.");
	return r;
}
async function Eb(e, t, n) {
	if (typeof t != "string" && typeof t != "number" || t === "" || typeof t == "number" && !Number.isFinite(t)) throw Error("Cannot load a row without an id.");
	let r = (await lb(`/collection/${encodeURIComponent(e.name)}/${encodeURIComponent(String(t))}`, void 0, n))?.[Sb(e)];
	if (!r || typeof r != "object" || Array.isArray(r) || !["string", "number"].includes(typeof r.id) || String(r.id) !== String(t)) throw Error("MapSVG returned an invalid source row.");
	return r;
}
async function Db(e, t) {
	let n = t.id;
	if (n == null || n === "") throw Error("Cannot update a row without an id.");
	let r = Sb(e);
	await fb(`/collection/${encodeURIComponent(e.name)}/${encodeURIComponent(String(n))}`, { [r]: wb(e, t, "update") });
}
async function Ob(e, t) {
	if (typeof t != "string" && typeof t != "number" || t === "" || typeof t == "number" && !Number.isFinite(t)) throw Error("Cannot delete a row without an id.");
	await ub("DELETE", `/collection/${encodeURIComponent(e.name)}/${encodeURIComponent(String(t))}`);
}
async function kb(e, t, n) {
	let r = await lb(`/collection/${encodeURIComponent(e.name)}`, {
		includeCollectionInfo: "true",
		page: t.page,
		perpage: t.perpage,
		search: t.search
	}, n), i = r?.capabilities;
	if (!Array.isArray(r?.items) || r.count !== null && (!Number.isSafeInteger(r.count) || r.count < 0) || !Number.isInteger(r.page) || r.page < 1 || !Number.isInteger(r.perpage) || r.perpage < 1 || typeof r.hasMore != "boolean" || !i || typeof i.canCreate != "boolean" || typeof i.canEdit != "boolean" || typeof i.canDelete != "boolean" || i.reason !== null && typeof i.reason != "string") throw Error("MapSVG returned an invalid Collection page.");
	return r;
}
async function Ab(e, t, n = e.zodSettings) {
	let { bindings: r, ...i } = e;
	await fb(`/schemas/${encodeURIComponent(String(e.id))}`, { schema: {
		...i,
		fields: t,
		...n === void 0 ? {} : { zodSettings: n }
	} });
}
async function jb(e, t) {
	let n = pb(e) ? "regions" : "objects", r = { perpage: t?.perpage ?? 50 };
	t?.search && (r.search = t.search);
	let i = await lb(`/${n}/${e.name}`, r);
	return Array.isArray(i) ? i : Array.isArray(i.items) ? i.items : [];
}
async function Mb(e, t, n) {
	let r = await db(`/maps/${e}/data-query`, {
		sourceRole: t,
		query: n
	});
	if (!Array.isArray(r.rows) || !Number.isSafeInteger(r.count) || r.count < 0) throw Error("MapSVG returned an invalid data-query response.");
	return r;
}
async function Nb() {
	let e = await lb("/query-folders");
	return Array.isArray(e.items) ? e.items : [];
}
async function Pb(e) {
	return db("/query-folders", { title: e });
}
async function Fb(e, t) {
	return ub("PUT", `/query-folders/${e}`, { title: t });
}
async function Ib(e) {
	await ub("DELETE", `/query-folders/${e}`);
}
async function Lb() {
	let e = await lb("/queries");
	return Array.isArray(e.items) ? e.items : [];
}
async function Rb(e) {
	return e.id ? ub("PUT", `/queries/${encodeURIComponent(e.id)}`, e) : db("/queries", e);
}
async function zb(e) {
	await ub("DELETE", `/queries/${encodeURIComponent(e)}`);
}
async function Bb(e, t, n) {
	let r = await db("/rpc", {
		queryId: e,
		...t
	}, n);
	if (!Array.isArray(r.rows) || !Number.isSafeInteger(r.count) || r.count < 0) throw Error("MapSVG returned an invalid RPC response.");
	return r;
}
function Vb(e) {
	return (e.fields ?? []).filter((e) => e.visible !== !1);
}
function Hb(e, t) {
	let n = e[t.name];
	if (n == null || n === "") return "";
	if (t.type === "select" || t.type === "radio") return (Array.isArray(n) ? n : [n]).map((e) => {
		let n = e && typeof e == "object" ? e : null, r = n ? n.value : e, i = n?.label ?? t.options?.find((e) => String(e.value) === String(r))?.label ?? r;
		return i == null ? "" : typeof i == "object" ? JSON.stringify(i) : String(i);
	}).join(", ");
	if (typeof n == "boolean") return n ? "true" : "false";
	if (typeof n == "number" || typeof n == "string") return String(n);
	if (t.type === "post" && typeof n == "object") {
		let e = n;
		return e.post_title || e.title || JSON.stringify(n);
	}
	if (t.type === "location" && typeof n == "object") {
		let e = n;
		return e.address?.formatted || e.img || "📍";
	}
	if ((t.type === "region" || t.type === "relation") && Array.isArray(n)) return n.map((e) => typeof e == "object" && e && "id" in e ? String(e.id) : String(e)).join(", ");
	if (Array.isArray(n)) return n.map(String).join(", ");
	try {
		return JSON.stringify(n);
	} catch {
		return String(n);
	}
}
//#endregion
//#region src/lib/admin-read-flight.ts
var Ub = /* @__PURE__ */ new Map();
function Wb() {
	let e = tm();
	return JSON.stringify([
		e.apiUrl,
		e.homeUrl,
		e.user?.id,
		e.nonce
	]);
}
function Gb(e, t, n) {
	let r = JSON.stringify([
		Wb(),
		e,
		t
	]), i = Ub.get(r);
	if (i) return i.promise;
	let a = Promise.resolve().then(n), o = {
		family: e,
		promise: a
	};
	Ub.set(r, o);
	let s = () => {
		Ub.get(r) === o && Ub.delete(r);
	};
	return a.then(s, s), a;
}
function Kb(e) {
	for (let [t, n] of Ub) n.family === e && Ub.delete(t);
}
//#endregion
//#region src/lib/workspace-persistence.ts
function qb(e = "") {
	let t = tm();
	return {
		url: _m(t.apiUrl, `/admin-workspace${e}`),
		nonce: t.nonce
	};
}
function Jb(e, t = !1) {
	return {
		Accept: "application/json",
		...t ? { "Content-Type": "application/json" } : {},
		"X-WP-Nonce": e
	};
}
var Yb = "admin-workspace", Xb = null;
async function Zb(e, t) {
	let n = new AbortController(), r = setTimeout(() => n.abort(), 8e3);
	try {
		let r = await lm(e, {
			method: "GET",
			signal: n.signal,
			headers: Jb(t),
			credentials: "same-origin"
		});
		if (!r.ok) throw Error(`Failed to load admin workspace (${r.status})`);
		return (await r.json()).workspace ?? null;
	} finally {
		clearTimeout(r);
	}
}
function Qb(e = {}) {
	let t = Wb();
	if (Xb && Xb.context !== t && (Xb = null), e.metadataOnly && Xb) return Xb.promise;
	let { url: n, nonce: r } = qb(), i = n;
	if (e.metadataOnly) {
		let e = new URL(n, tm().homeUrl || void 0);
		e.searchParams.set("projection", "startup"), i = e.href;
	}
	return Gb(Yb, i, () => Zb(i, r));
}
function $b() {
	let e = Wb();
	if (Xb?.context === e) return;
	Xb = null;
	let t = Qb({ metadataOnly: !0 });
	Xb = {
		context: e,
		promise: t
	}, t.catch(() => {});
}
function ex() {
	Xb = null;
}
function tx() {
	Xb = null, Kb(Yb);
}
async function nx(e, t = {}) {
	tx();
	try {
		let { mapDrafts: n, ...r } = e, { url: i, nonce: a } = qb(), o = await lm(i, {
			method: "POST",
			headers: Jb(a, !0),
			credentials: "same-origin",
			keepalive: t.keepalive,
			body: JSON.stringify({ workspace: r })
		});
		if (!o.ok) throw Error(`Failed to save admin workspace (${o.status})`);
	} finally {
		tx();
	}
}
//#endregion
//#region src/lib/workspace-route.ts
var rx = "mapsvg_workspace";
function ix(e) {
	if (!e || e === "start") return {
		type: "surface",
		surface: "start"
	};
	if (e === "settings") return {
		type: "surface",
		surface: "settings"
	};
	if (e === "database") return {
		type: "surface",
		surface: "database-index"
	};
	if (e.startsWith("database-tab:")) {
		let t = /^database-tab:([a-zA-Z0-9-]{1,80})(?::(collection|query):(.+))?$/.exec(e);
		if (!t || t[2] && !t[3].trim()) return {
			type: "surface",
			surface: "start"
		};
		let n = t[2] === "collection" ? {
			kind: "db-table",
			schemaId: t[3],
			tableName: ""
		} : t[2] === "query" ? {
			kind: "db-query",
			queryId: t[3]
		} : null;
		return {
			type: "resource",
			resource: {
				kind: "database",
				sessionId: t[1],
				selection: n
			}
		};
	}
	for (let [t, n] of [
		["database:collection:", "db-table"],
		["database:query:", "db-query"],
		["db-query:", "db-query"]
	]) if (e.startsWith(t)) {
		let r = e.slice(t.length).trim();
		if (!r) return {
			type: "surface",
			surface: "start"
		};
		let i = n === "db-query" ? {
			kind: n,
			queryId: r
		} : {
			kind: n,
			schemaId: r,
			tableName: ""
		};
		return t === "db-query:" ? {
			type: "resource",
			resource: i
		} : {
			type: "database-browse",
			resource: i
		};
	}
	if (e.startsWith("map:")) {
		let t = Number(e.slice(4));
		if (Number.isInteger(t) && t > 0) return {
			type: "resource",
			resource: {
				kind: "map",
				mapId: t
			}
		};
	}
	if (e.startsWith("chat:")) {
		let t = e.slice(5), n = t.startsWith("new:"), r = n ? t.slice(4) : t, i = n ? null : Number(t);
		if (/^[a-zA-Z0-9-]{1,80}$/.test(r) && (n || Number.isSafeInteger(i) && i > 0)) return {
			type: "resource",
			resource: {
				kind: "chat",
				sessionId: r,
				chatId: i,
				mapId: null
			}
		};
	}
	if (e.startsWith("db-table:")) {
		let t = e.slice(9).trim();
		if (t) return {
			type: "resource",
			resource: {
				kind: "db-table",
				schemaId: t,
				tableName: ""
			}
		};
	}
	return {
		type: "surface",
		surface: "start"
	};
}
function ax(e) {
	if (e.type === "database-browse") return e.resource.kind === "db-query" ? `database:query:${e.resource.queryId}` : `database:collection:${e.resource.schemaId}`;
	if (e.type === "surface") return e.surface === "start" ? "start" : e.surface === "settings" ? "settings" : "database";
	if (e.resource.kind === "map") return `map:${e.resource.mapId}`;
	if (e.resource.kind === "chat") return `chat:${e.resource.chatId ?? "new:" + e.resource.sessionId}`;
	if (e.resource.kind === "database") {
		let t = e.resource.selection;
		return `database-tab:${e.resource.sessionId}${t?.kind === "db-table" ? `:collection:${t.schemaId}` : t?.kind === "db-query" ? `:query:${t.queryId}` : ""}`;
	}
	return e.resource.kind === "db-query" ? `db-query:${e.resource.queryId}` : `db-table:${e.resource.schemaId}`;
}
function ox() {
	let e = new URL(window.location.href).searchParams.get(rx);
	return e === null ? null : ix(e);
}
function sx(e, t = "push") {
	let n = new URL(window.location.href), r = ax(e);
	n.searchParams.set(rx, r);
	let i = n.toString();
	i !== window.location.href && (t === "replace" ? window.history.replaceState(window.history.state, "", i) : window.history.pushState(window.history.state, "", i));
}
//#endregion
//#region src/lib/local-map-drafts.ts
var cx = "drafts", lx = 1;
function ux() {
	let e = tm();
	return `mapsvg-admin-drafts-v1:${e.homeUrl}:${e.user.id}`;
}
function dx() {
	return typeof indexedDB > "u" ? Promise.resolve(null) : new Promise((e, t) => {
		let n = indexedDB.open(ux(), lx);
		n.onupgradeneeded = () => {
			let e = n.result;
			e.objectStoreNames.contains(cx) || e.createObjectStore(cx, { keyPath: "mapId" });
		}, n.onsuccess = () => e(n.result), n.onerror = () => t(n.error ?? /* @__PURE__ */ Error("Failed to open draft database"));
	});
}
async function fx() {
	let e = await dx();
	if (!e) return {};
	try {
		return await new Promise((t, n) => {
			let r = e.transaction(cx, "readonly").objectStore(cx).getAll();
			r.onsuccess = () => {
				let e = {};
				for (let t of r.result) t?.mapId && t.draft && (e[t.mapId] = t.draft);
				t(e);
			}, r.onerror = () => n(r.error ?? /* @__PURE__ */ Error("Failed to load map drafts"));
		});
	} finally {
		e.close();
	}
}
//#endregion
//#region src/App.tsx
var px = Wp(() => import("./AppWorkspaceActions-CHoR03wR.js").then((e) => ({ default: e.AppWorkspaceActions }))), mx = Wp(() => import("./AppVersions-BNLwd5y3.js").then((e) => e.n).then((e) => ({ default: e.AppDraftConflictActions }))), hx = Wp(() => import("./CreateMapDialog-DiFl5ZOY.js").then((e) => ({ default: e.CreateMapDialog }))), gx = Wp(() => import("./GoogleMapDrawDialog-DnkWurwc.js").then((e) => ({ default: e.GoogleMapDrawDialog }))), _x = Wp(() => import("./GlobalSettingsDialog-BNeypwg7.js").then((e) => ({ default: e.GlobalSettingsDialog }))), vx = Wp(() => import("./UsageDialog-xPfmpJVn.js").then((e) => ({ default: e.UsageDialog }))), yx = Wp(() => import("./UpgradeDialog-BuOx0bot.js").then((e) => ({ default: e.UpgradeDialog }))), bx = Wp(() => import("./MapPreviewPanel-D8Lt8bfM.js").then((e) => ({ default: e.MapPreviewPanel }))), xx = Wp(() => import("./SettingsPanel-BIMuoU-k.js").then((e) => ({ default: e.SettingsPanel }))), Sx = Wp(() => import("./DeferredDatabaseWorkspace-DXQHfnRm.js").then((e) => ({ default: e.DeferredDatabaseWorkspace })));
function Cx(e) {
	return e && typeof e.done == "function" && typeof e.fail == "function" ? new Promise((t, n) => {
		e.done((e) => t(e)), e.fail((e) => n(e));
	}) : Promise.resolve(e);
}
function wx() {
	let e = window.mapsvg;
	if (!e?.useRepository) throw Error("Maps repository is unavailable");
	return e.useRepository("maps");
}
function Tx(e) {
	let [t, n] = (0, i.useState)(e);
	return (0, i.useEffect)(() => {
		e && n(!0);
	}, [e]), e || t;
}
function Ex() {
	let e = (0, i.useMemo)(() => tm(), []), [t, n] = (0, i.useState)(() => e.maps), [r, a] = (0, i.useState)(() => e.svgFiles), [o, s] = (0, i.useState)(() => e.imageFiles ?? []), [c, l] = (0, i.useState)(!1), [u, d] = (0, i.useState)(!1), [f, p] = (0, i.useState)(!1), [m, h] = (0, i.useState)(!1), [g, _] = (0, i.useState)(!1), y = Tx(c), b = Tx(u), x = Tx(f), S = Tx(m), C = Tx(g), [w, T] = (0, i.useState)("usage"), E = (0, i.useRef)(crypto.randomUUID()), [D, O] = (0, i.useState)([]), k = (0, i.useMemo)(() => ph("ai-start-screen")?.projectChats, []), [A, j] = (0, i.useState)(!1), M = (0, i.useRef)(!1), ee = (0, i.useRef)(0), N = (0, i.useRef)(!0), te = (0, i.useRef)(!1), [P, ne] = (0, i.useState)(null), [re, F] = (0, i.useState)(null);
	(0, i.useEffect)(() => (N.current = !0, () => {
		N.current = !1;
	}), []);
	let I = (0, i.useCallback)((e) => {
		ee.current += 1, M.current = e, l(e), d(!1), p(!1), h(!1);
	}, []), ie = (0, i.useRef)(t);
	ie.current = t;
	let ae = (0, i.useRef)(/* @__PURE__ */ new Set()), [oe, se] = (0, i.useState)(!0), [L, ce] = (0, i.useState)(!1), le = (0, i.useRef)(!1), [ue, de] = (0, i.useState)(null), [R, z] = (0, i.useState)(null), [fe, pe] = (0, i.useState)(!1), [me, he] = (0, i.useState)(null), [ge, _e] = (0, i.useState)(null), ve = (0, i.useRef)(!1), [ye, be] = (0, i.useState)(null), [xe, Se] = (0, i.useState)(!1), [Ce, we] = (0, i.useState)(!1), [Te, B] = (0, i.useState)(!1), [Ee, De] = (0, i.useState)(0), [Oe, ke] = (0, i.useState)(0), V = Z((e) => e.tabs), Ae = Z((e) => e.uiTheme), je = Z((e) => e.activeTabId), Me = Z((e) => e.openResource), Ne = Z((e) => e.activateTab), Pe = Z((e) => e.closeTab), Fe = Z((e) => e.closeResource), Ie = Z((e) => e.renameResource), Le = Z((e) => e.hydrateRemote), Re = Z((e) => e.hydrateLocalDrafts), ze = Z((e) => e.mapDrafts), Be = Z((e) => e.setMapBaseline), Ve = Z((e) => e.setMapServerBaseline), He = Z((e) => e.setMapTitleBaseline), Ue = Z((e) => e.setMapDraft), We = Z((e) => e.clearMapDraft), Ge = Z((e) => e.clearMapWorkspaceState), [H, Ke] = (0, i.useState)(() => je ? "workspace" : "start"), U = bp(), qe = (0, i.useMemo)(() => ry(e.options), [e.options]), Je = (0, i.useMemo)(() => {
		if (typeof navigator > "u") return "ctrl";
		let e = navigator.platform || "", t = navigator.userAgent || "";
		return /Mac|iPhone|iPad|iPod/i.test(e + " " + t) ? "cmd" : "ctrl";
	}, []);
	(0, i.useEffect)(() => {
		let e = document.getElementById("mapsvg-admin-react-root")?.shadowRoot;
		e?.querySelector("#mapsvg-admin-react-app")?.setAttribute("data-ui-theme", Ae), e?.querySelector("#mapsvg-admin-react-portal")?.setAttribute("data-ui-theme", Ae);
	}, [Ae]);
	let Ye = V.find((e) => e.id === je) ?? null, W = H === "workspace" ? gf(Ye?.resource) : null, Xe = H === "workspace" ? vf(Ye?.resource) : null, Ze = Xe?.kind === "db-table" ? Xe.schemaId : null, Qe = Xe?.kind === "db-query" ? Xe.queryId : null, $e = H === "database-index" || H === "workspace" && _f(Ye?.resource) ? "database" : "maps", G = yh(W), et = (W == null ? void 0 : ze[String(W)]) != null, tt = (0, i.useCallback)((e, t, n = "push") => {
		I(!1), j(!1);
		let r = {
			kind: "database",
			sessionId: crypto.randomUUID(),
			selection: e
		};
		Me(r, t), sx({
			type: "resource",
			resource: r
		}, n), Ke("workspace"), se(!1);
	}, [I, Me]), nt = (0, i.useCallback)((e) => {
		if (I(!1), j(!1), e.type === "database-browse") {
			let t = e.resource;
			tt(t, t.kind === "db-table" ? `Collection #${t.schemaId}` : `Query #${t.queryId}`, "replace");
			return;
		}
		if (e.type === "surface") {
			if (e.surface === "database-index") {
				tt(null, "Database", "replace");
				return;
			}
			if (e.surface === "settings") {
				let e = Z.getState(), t = e.tabs.find((t) => t.id === e.activeTabId), n = t ? {
					type: "resource",
					resource: t.resource
				} : {
					type: "surface",
					surface: "start"
				};
				Ke(t ? "workspace" : "start"), se(!t), sx(n, "replace"), p(!0);
				return;
			}
			Ke(e.surface), se(e.surface === "start");
			return;
		}
		if (e.resource.kind === "map") {
			let t = e.resource, n = ie.current.find((e) => e.id === t.mapId);
			Me(t, n?.title?.trim() || `Map #${t.mapId}`);
		} else if (e.resource.kind === "chat") Me(e.resource, "New project");
		else if (e.resource.kind === "database") {
			let t = e.resource, n = Z.getState(), r = n.tabs.find((e) => e.resource.kind === "database" && e.resource.sessionId === t.sessionId), i = vf(r?.resource), a = i && t.selection ? bf(i) === bf(t.selection) : i === t.selection, o = t.selection ? a && r ? r.title : t.selection.kind === "db-table" ? `Collection #${t.selection.schemaId}` : `Query #${t.selection.queryId}` : "Database";
			r ? (n.updateDatabaseTab(r.id, t.selection, o), n.activateTab(r.id)) : Me(t, o);
		} else if (e.resource.kind === "db-query") {
			let t = e.resource, n = Z.getState().tabs.find((e) => e.resource.kind === "db-query" && e.resource.queryId === t.queryId);
			Me(t, n?.title || `Query #${t.queryId}`);
		} else {
			let t = e.resource, n = Z.getState().tabs.find((e) => e.resource.kind === "db-table" && e.resource.schemaId === t.schemaId), r = n?.resource.kind === "db-table" ? n.resource : t;
			Me(r, n?.title || `Table #${t.schemaId}`);
		}
		Ke("workspace"), se(!1);
	}, [
		I,
		tt,
		Me
	]);
	(0, i.useEffect)(() => {
		let e = new Map(t.map((e) => [e.id, e]));
		for (let t of V) {
			let n = gf(t.resource);
			if (!n) continue;
			let r = e.get(n);
			if (!r) continue;
			let i = r.title?.trim() || `Map #${r.id}`;
			t.title !== i && Ie(t.resource, i);
		}
	}, [
		t,
		Ie,
		V
	]), (0, i.useEffect)(() => {
		if (!Ce) return;
		let e = new Set(t.map((e) => e.id)), n = wx(), r = !1;
		for (let t of V) {
			let i = gf(t.resource);
			i && (e.has(i) || ae.current.has(i) || (ae.current.add(i), Cx(n.findById(i, !0)).then((e) => {
				if (r) return;
				if (!e) {
					gf(V.find((e) => e.id === je)?.resource) === i ? dy(i) : fy(i), Fe({
						kind: "map",
						mapId: i
					});
					return;
				}
				let t = typeof e.title == "string" && e.title.trim() || typeof e.options?.title == "string" && e.options.title.trim() || `Map #${i}`;
				Ie({
					kind: "map",
					mapId: i
				}, t);
			}).catch((e) => {
				r || ((e && typeof e == "object" && "status" in e ? Number(e.status) : null) === 404 ? (gf(V.find((e) => e.id === je)?.resource) === i ? dy(i) : fy(i), Fe({
					kind: "map",
					mapId: i
				})) : ae.current.delete(i));
			})));
		}
		return () => {
			r = !0;
		};
	}, [
		je,
		Fe,
		t,
		Ie,
		V,
		Ce
	]);
	let rt = (0, i.useCallback)(() => {
		I(!1);
		let e = {
			kind: "chat",
			sessionId: crypto.randomUUID(),
			chatId: null,
			mapId: null
		};
		Me(e, "New chat"), sx({
			type: "resource",
			resource: e
		}, "push"), Ke("workspace");
	}, [I, Me]), it = (0, i.useCallback)((e) => {
		I(!1);
		let n = t.find((t) => t.id === e), r = D.find((t) => t.mapId === e), i = r ? {
			kind: "chat",
			sessionId: String(r.id),
			chatId: r.id,
			mapId: e
		} : {
			kind: "map",
			mapId: e
		};
		sx({
			type: "resource",
			resource: i
		}, "push"), Me(i, n?.title?.trim() || `Map #${e}`), Ke("workspace"), se(!1);
	}, [
		I,
		t,
		Me,
		D
	]), at = (0, i.useCallback)((e) => {
		let t = {
			kind: "chat",
			sessionId: String(e.id),
			chatId: e.id,
			mapId: e.mapId
		};
		Me(t, e.title), Ke("workspace"), I(!1), sx({
			type: "resource",
			resource: t
		}, "push");
	}, [Me, I]), ot = (0, i.useCallback)((e) => {
		let t = Z.getState(), n = Ye?.resource.kind === "chat" ? Ye.id : null;
		if (!n) {
			let r = {
				kind: "chat",
				sessionId: E.current,
				chatId: e.id,
				mapId: e.mapId
			};
			n = t.openResource(r, e.title), Ke("workspace");
		}
		t.updateChatTab(n, e);
		let r = Z.getState().tabs.find((e) => e.id === n);
		r && Z.getState().activeTabId === n && sx({
			type: "resource",
			resource: r.resource
		}, "replace");
	}, [Ye]);
	(0, i.useEffect)(() => {
		let e = !1, t = /* @__PURE__ */ new Set(), n = (e) => {
			O((t) => [e, ...t.filter((t) => t.id !== e.id)]), Z.getState().updateChatTab("", e);
		}, r = (e) => {
			let r = e.detail;
			r && Number.isSafeInteger(r.id) && r.id > 0 && typeof r.title == "string" && (t.add(r.id), n(r));
		};
		return window.addEventListener(vh, r), k?.list().then((n) => {
			if (!e) {
				O((e) => [...e, ...n.filter((t) => !e.some((e) => e.id === t.id))]);
				for (let e of n) t.has(e.id) || Z.getState().updateChatTab("", e);
			}
		}).catch((e) => console.error("Could not load projects", e)), () => {
			e = !0, window.removeEventListener(vh, r);
		};
	}, [k]);
	let st = (0, i.useCallback)(() => {
		tt(null, "Database");
	}, [tt]);
	(0, i.useEffect)(() => {
		let e = (e) => {
			let t = e.detail?.queryId;
			typeof t != "string" || !t.trim() || (tt({
				kind: "db-query",
				queryId: t
			}, `Query #${t}`), j(!0));
		};
		return window.addEventListener(kg, e), () => window.removeEventListener(kg, e);
	}, [tt]);
	let ct = (0, i.useCallback)(() => {
		I(!1), p(!0);
	}, [I]), lt = (0, i.useCallback)((e) => {
		I(!1), T(e instanceof CustomEvent && e.detail?.screen === "packs" ? "packs" : "usage"), h(!0);
	}, [I]);
	(0, i.useEffect)(() => (window.addEventListener("mapsvg:open-usage", lt), () => window.removeEventListener("mapsvg:open-usage", lt)), [lt]), (0, i.useEffect)(() => {
		let e = () => {
			I(!1), h(!1), p(!1), _(!0);
		};
		return window.addEventListener(jg, e), () => window.removeEventListener(jg, e);
	}, [I]);
	let ut = (0, i.useCallback)(async () => {
		Rm();
		let e = Z.getState(), t = gf(e.tabs.find((t) => t.id === e.activeTabId)?.resource), n = pp();
		if (n?.id === t && t && n.getData) {
			let e = Am(t);
			e.ready && e.active && e.capture(n.getData());
		}
		await Nm(), Rm(), await nx(wf()), window.location.reload();
	}, []), dt = (0, i.useCallback)((e) => {
		I(!1), j(!1);
		let t = V.find((t) => t.id === e);
		t && sx({
			type: "resource",
			resource: t.resource
		}, "push"), Ne(e), Ke("workspace"), se(!1);
	}, [
		Ne,
		I,
		V
	]), ft = (0, i.useCallback)((e) => {
		I(!1);
		let t = H === "workspace" && je === e, n = V.find((t) => t.id === e), r = V.filter((t) => t.id !== e), i = gf(n?.resource);
		i && (t && W === i ? dy(i) : fy(i)), Pe(e), t && r.length === 0 && (Ke("start"), se(!0));
	}, [
		je,
		I,
		Pe,
		W,
		H,
		V
	]), pt = (0, i.useCallback)((e, t) => {
		I(!1), j(!1);
		let n = Z.getState(), r = n.tabs.find((e) => e.id === n.activeTabId);
		if (!r || !_f(r.resource)) {
			tt(e, t);
			return;
		}
		n.updateDatabaseTab(r.id, e, t), sx({
			type: "resource",
			resource: Z.getState().tabs.find((e) => e.id === r.id).resource
		}, "push"), Ke("workspace"), se(!1);
	}, [I, tt]), mt = (0, i.useCallback)((e, t) => {
		tt(e, t);
	}, [tt]), ht = (0, i.useCallback)((e) => {
		pt({
			kind: "db-table",
			schemaId: String(e.id),
			tableName: e.name
		}, mb(e));
	}, [pt]), gt = (0, i.useCallback)((e) => {
		pt({
			kind: "db-query",
			queryId: e.id
		}, e.name);
	}, [pt]), _t = (0, i.useCallback)((e) => {
		mt({
			kind: "db-table",
			schemaId: String(e.id),
			tableName: e.name
		}, mb(e));
	}, [mt]), vt = (0, i.useCallback)((e) => {
		mt({
			kind: "db-query",
			queryId: e.id
		}, e.name);
	}, [mt]), yt = (0, i.useCallback)((e) => {
		let t = new Map(e.map((e) => [String(e.id), e]));
		for (let e of V) {
			let n = vf(e.resource);
			if (n?.kind !== "db-table") continue;
			let r = t.get(n.schemaId);
			if (!r) {
				e.resource.kind === "database" ? Z.getState().updateDatabaseTab(e.id, null, "Database") : Pe(e.id);
				continue;
			}
			let i = mb(r);
			e.title !== i && Ie(e.resource, i);
		}
	}, [
		Pe,
		Ie,
		V
	]), bt = (0, i.useCallback)((e) => {
		let t = new Map(e.map((e) => [e.id, e]));
		for (let e of V) {
			let n = vf(e.resource);
			if (n?.kind !== "db-query") continue;
			let r = t.get(n.queryId);
			r ? e.title !== r.name && Ie(e.resource, r.name) : e.resource.kind === "database" ? Z.getState().updateDatabaseTab(e.id, null, "Database") : Pe(e.id);
		}
	}, [
		V,
		Pe,
		Ie
	]), xt = (0, i.useCallback)(async (e, t) => {
		let r = Am(e);
		if (await r.initialize(), !r.active) throw Error("Choose an App draft");
		U?.id === e ? (U.update({ title: t }), r.capture(U.getData())) : (r.capture({
			...r.active.snapshot,
			options: {
				...r.active.snapshot.options,
				title: t
			}
		}), fy(e)), n((n) => n.map((n) => n.id === e ? {
			...n,
			title: t
		} : n)), Ie({
			kind: "map",
			mapId: e
		}, t), await r.flush();
	}, [U, Ie]), St = (0, i.useCallback)(async (e) => {
		await Cx(wx().delete(e)), n((t) => t.filter((t) => t.id !== e)), W === e ? (my(e), dy(e)) : fy(e), Fe({
			kind: "map",
			mapId: e
		}), Ge(e), Fm(e), W === e && V.length <= 1 && (Ke("start"), se(!0));
	}, [
		Ge,
		Fe,
		W,
		V.length
	]), Ct = (0, i.useCallback)(async (e, t) => {
		if (te.current) return;
		te.current = !0, ne(e), F(null);
		let r = ee.current;
		try {
			let i = await Og(e, `${t} - copy`);
			if (!N.current || (n((e) => [i, ...e.filter((e) => e.id !== i.id)]), ee.current !== r || !ie.current.some((t) => t.id === e))) return;
			let a = {
				kind: "map",
				mapId: i.id
			};
			sx({
				type: "resource",
				resource: a
			}, "push"), Me(a, i.title), Ke("workspace"), se(!1);
		} catch (t) {
			N.current && ee.current === r && F({
				mapId: e,
				message: t instanceof Error ? t.message : "Could not duplicate map. Please retry."
			});
		} finally {
			te.current = !1, N.current && ne(null);
		}
	}, [Me]);
	(0, i.useEffect)(() => {
		let e = (e) => {
			let t = e.detail, r = Number(t?.map?.mapId);
			if (!Number.isFinite(r) || r <= 0) return;
			let i = t?.map?.title?.trim() || `Map #${r}`;
			if (t.action === "created" || t.action === "duplicated") {
				n((e) => {
					let t = {
						id: r,
						title: i
					};
					return e.findIndex((e) => e.id === r) === -1 ? [t, ...e] : e.map((e) => e.id === r ? t : e);
				});
				return;
			}
			if (t.action === "renamed") {
				n((e) => e.map((e) => e.id === r ? {
					...e,
					title: i
				} : e)), Ie({
					kind: "map",
					mapId: r
				}, i), U && Number(U.id) === r ? (U.title = i, U.options && typeof U.options == "object" && (U.options.title = i)) : fy(r), He(r, i);
				let e = Z.getState().mapDrafts[String(r)];
				if (e) {
					let t = Cy(e, i);
					t ? Ue(r, t) : We(r);
				}
				return;
			}
			if (t.action === "published") {
				if (W === r && U && Number(U.id) === r) {
					let e = Z.getState().mapDrafts[String(r)]?.options ?? _y(U), t = by(e);
					Be(r, t), Ve(r, t), He(r, xy(e)), We(r);
				}
				return;
			}
			t.action === "deleted" && (n((e) => e.filter((e) => e.id !== r)), W === r ? (my(r), dy(r)) : fy(r), Fe({
				kind: "map",
				mapId: r
			}), Ge(r), W === r && V.length <= 1 && (Ke("start"), se(!0)));
		};
		return window.addEventListener("mapsvg:map-mutation", e), () => window.removeEventListener("mapsvg:map-mutation", e);
	}, [
		We,
		Ge,
		Fe,
		U,
		Ie,
		W,
		Be,
		Ve,
		He,
		Ue,
		V.length
	]), (0, i.useEffect)(() => {
		let e = (e) => {
			let t = e.detail, n = Number(t?.mapId);
			if (!Number.isFinite(n) || n <= 0) return;
			I(!1);
			let r = t?.title?.trim() || `Map #${n}`, i = Z.getState(), a = t?.chatId ? i.tabs.find((e) => e.resource.kind === "chat" && e.resource.chatId === t.chatId) : null;
			if (a && t.chatId) {
				if (i.updateChatTab(a.id, {
					id: t.chatId,
					mapId: n,
					title: r
				}), i.activeTabId !== a.id) return;
				sx({
					type: "resource",
					resource: Z.getState().tabs.find((e) => e.id === a.id).resource
				}, "replace");
			} else {
				let e = {
					kind: "map",
					mapId: n
				};
				sx({
					type: "resource",
					resource: e
				}, "push"), Me(e, r);
			}
			Ke("workspace"), se(!1);
		};
		return window.addEventListener("mapsvg:open-map", e), () => window.removeEventListener("mapsvg:open-map", e);
	}, [I, Me]), (0, i.useEffect)(() => {
		let e = (e) => {
			let t = e.detail, n = Number(t?.mapId), r = t?.options;
			if (!Number.isFinite(n) || n <= 0 || n !== W || !r || typeof r != "object" || Array.isArray(r)) return;
			let i = Am(n);
			i.ready && i.active && i.capture({
				...i.active.snapshot,
				id: n,
				options: r
			});
			let a = Z.getState(), o = a.mapDrafts[String(n)], s = U && Number(U.id) === n ? by(_y(U)) : by(r), c = a.mapBaselines[String(n)] ?? o?.baselineOptionsFingerprint ?? s, l = a.mapServerBaselines[String(n)] ?? o?.baselineFingerprint ?? c, u = by(r), d = a.mapTitleBaselines[String(n)] ?? o?.baselineTitle ?? xy(U?.id === n ? _y(U) : r);
			my(n), dy(n), Sy(r, c, d) ? We(n) : Ue(n, {
				options: r,
				baselineFingerprint: l,
				baselineOptionsFingerprint: c,
				baselineTitle: d,
				draftFingerprint: u,
				conflicted: !1,
				updatedAt: Date.now()
			}), t.preserveWorkspace === !0 ? ke((e) => e + 1) : De((e) => e + 1);
		};
		return window.addEventListener("mapsvg:options-replace", e), () => window.removeEventListener("mapsvg:options-replace", e);
	}, [
		We,
		U,
		W,
		Ue
	]), (0, i.useEffect)(() => {
		if (!U || W == null) return;
		let e = () => {
			let e = Z.getState(), t = _y(U), n = by(t), r = e.mapBaselines[String(W)] ?? n, i = e.mapDrafts[String(W)], a = e.mapServerBaselines[String(W)] ?? i?.baselineFingerprint ?? r, o = e.mapTitleBaselines[String(W)] ?? i?.baselineTitle ?? xy(t);
			Sy(t, r, o) || e.setMapDraft(W, {
				options: t,
				baselineFingerprint: a,
				baselineOptionsFingerprint: r,
				baselineTitle: o,
				draftFingerprint: n,
				conflicted: !1,
				updatedAt: Date.now()
			}), dy(W), De((e) => e + 1);
		}, t = (t) => {
			eb(U).includes(t) && e();
		}, n = (t) => {
			(Array.isArray(U.options?.scenes) ? U.options.scenes : []).some((e) => ["objects", "regions"].some((n) => e?.dataBindings?.[n]?.queryId === t)) && e();
		}, r = (e) => {
			let n = e.detail;
			n?.schema && t(n.schema);
		}, i = (e) => {
			let n = e.detail;
			n?.schema?.name && t(n.schema.name);
		}, a = (e) => {
			let t = e.detail, r = typeof t?.query?.id == "string" ? t.query.id : "";
			r && n(r);
		};
		return window.addEventListener("mapsvg:repository-mutation", r), window.addEventListener("mapsvg:schema-mutation", i), window.addEventListener("mapsvg:query-mutation", a), () => {
			window.removeEventListener("mapsvg:repository-mutation", r), window.removeEventListener("mapsvg:schema-mutation", i), window.removeEventListener("mapsvg:query-mutation", a);
		};
	}, [U, W]);
	let wt = (0, i.useCallback)((e, t) => {
		t.isUserInteraction && ay({
			[Jv]: e["map-preview"] ?? qe["map-preview"],
			[Yv]: e.settings ?? qe.settings
		});
	}, [qe]), Tt = (0, i.useCallback)(async () => {
		if (!U || le.current || W == null || U.id !== W || !Am(W).ready || !Am(W).active || Am(W).transitioning || Am(W).active?.conflicted) return { status: "rejected" };
		let e = W, t = () => {
			let t = Z.getState(), n = t.mapDrafts[String(e)], r = pp(), i = r?.id === e ? _y(r) : n?.options ?? _y(U), a = Am(e);
			a.ready && a.active && a.capture({
				...a.active.snapshot,
				options: i
			});
			let o = by(i), s = t.mapBaselines[String(e)] ?? o, c = t.mapTitleBaselines[String(e)] ?? n?.baselineTitle ?? xy(i);
			Sy(i, s, c) && !n?.conflicted ? t.clearMapDraft(e) : t.setMapDraft(e, {
				options: i,
				baselineFingerprint: t.mapServerBaselines[String(e)] ?? n?.baselineFingerprint ?? s,
				baselineOptionsFingerprint: s,
				baselineTitle: c,
				draftFingerprint: o,
				updatedAt: Date.now(),
				...n?.conflicted ? { conflicted: !0 } : {}
			});
		};
		le.current = !0, ce(!0), de(null);
		try {
			let n = JSON.parse(JSON.stringify(U.getData())), r = by(n.options);
			t();
			let i = {
				status: "completed",
				versionId: await Am(e).publish(n)
			};
			return ie.current.some((t) => t.id === e) ? (Be(e, r), Ve(e, r), He(e, xy(n.options)), t(), i) : i;
		} catch (n) {
			if (!ie.current.some((t) => t.id === e)) return { status: "failed" };
			t();
			let r = n, i = r?.responseJSON?.error, a = n instanceof Error ? n.message : typeof i == "string" ? i : i?.message ?? r?.responseJSON?.message ?? r?.message ?? "The server could not confirm the save.";
			return de({
				mapId: e,
				message: `Publish failed: ${a} Your edits are retained.`
			}), {
				status: "failed",
				message: a
			};
		} finally {
			le.current = !1, ce(!1);
		}
	}, [
		We,
		U,
		L,
		W,
		Be,
		Ve,
		He
	]), Et = (0, i.useCallback)(() => {
		if (!U || W == null || U.id !== W || le.current) return !1;
		let e = Am(W);
		return !e.ready || !e.active || e.offline || e.transitioning || e.active.conflicted ? !1 : (be({
			mapId: W,
			draftId: e.active.draft.id
		}), !0);
	}, [U, W]);
	(0, i.useEffect)(() => {
		let e = (e) => {
			let t = e.detail;
			if (H !== "workspace" || !t || typeof t.respond != "function" || t.mapId !== W || U?.id !== t.mapId || pp() !== U || le.current || fe || ye || R) return;
			let n = Am(t.mapId);
			!n.ready || !n.active || n.activeId !== t.draftId || n.offline || n.transitioning || n.active.conflicted || (e.preventDefault(), Tt().then(t.respond, () => t.respond({ status: "failed" })));
		};
		return window.addEventListener($y, e), () => window.removeEventListener($y, e);
	}, [
		Tt,
		W,
		H,
		U,
		fe,
		ye,
		R
	]), (0, i.useEffect)(() => {
		ye && (H !== "workspace" || ye.mapId !== W || ye.draftId !== G?.activeId) && be(null);
	}, [
		ye,
		W,
		G?.activeId,
		H
	]);
	let Dt = (0, i.useCallback)(() => {
		G?.publishedVersionId && G.restore(G.publishedVersionId).then(() => {
			let e = G.active?.snapshot.options;
			e && window.dispatchEvent(new CustomEvent("mapsvg:options-replace", { detail: {
				mapId: G.mapId,
				options: e
			} }));
		}).catch((e) => de({
			mapId: G.mapId,
			message: String(e)
		}));
	}, [G]);
	(0, i.useEffect)(() => {
		let e = !1, t = !1, n = null, r = null, i = () => {
			r = Z.subscribe((e, t) => {
				e.updatedAt !== t.updatedAt && (n != null && window.clearTimeout(n), n = window.setTimeout(() => {
					n = null, nx(wf()).catch((e) => {
						console.warn("[mapsvg-admin-react] Failed to persist remote workspace", e);
					});
				}, 1200));
			});
		};
		(async () => {
			let [n, r] = await Promise.allSettled([fx(), Qb({ metadataOnly: !0 })]);
			if (!e) {
				if (n.status === "fulfilled" ? Re(n.value) : console.warn("[mapsvg-admin-react] Failed to load local map drafts", n.reason), r.status === "fulfilled" && r.value) {
					let e = r.value, t = Z.getState().updatedAt, n = e.updatedAt > t;
					Le({
						...e,
						mapDrafts: {}
					}), n && e.activeTabId && (Ke("workspace"), se(!1));
				} else r.status === "rejected" && console.warn("[mapsvg-admin-react] Failed to load remote workspace", r.reason);
				e || (ex(), t = !0, we(!0), i());
			}
		})();
		let a = () => {
			t && (nx(wf(), { keepalive: !0 }).catch(() => {}), Mm());
		};
		return window.addEventListener("pagehide", a), () => {
			e = !0, r?.(), window.removeEventListener("pagehide", a), n != null && window.clearTimeout(n);
		};
	}, [Re, Le]), (0, i.useEffect)(() => {
		let e = window.setInterval(() => {
			Mm();
		}, 5e3), t = () => {
			Mm();
		};
		return window.addEventListener("storage", Pm), window.addEventListener("online", t), () => {
			window.clearInterval(e), window.removeEventListener("storage", Pm), window.removeEventListener("online", t);
		};
	}, []);
	let Ot = (0, i.useCallback)(() => {
		if (W == null || !G) return;
		if (!G.active) {
			Z.getState().clearMapDraft(W);
			return;
		}
		let e = G.active.snapshot.options;
		window.dispatchEvent(new CustomEvent("mapsvg:options-replace", { detail: {
			mapId: W,
			options: e
		} }));
	}, [W, G]);
	(0, i.useEffect)(() => {
		if (!Ce) return;
		let e = () => {
			let e = ox();
			if (e) nt(e);
			else {
				I(!1);
				let e = !!Z.getState().activeTabId;
				Ke(e ? "workspace" : "start"), se(!e);
			}
			B(!0);
		};
		return e(), window.addEventListener("popstate", e), () => window.removeEventListener("popstate", e);
	}, [
		nt,
		I,
		Ce
	]), (0, i.useEffect)(() => {
		if (Te) {
			if (H === "workspace" && Ye) {
				sx({
					type: "resource",
					resource: Ye.resource
				}, "replace");
				return;
			}
			sx({
				type: "surface",
				surface: H === "workspace" ? "start" : H
			}, "replace");
		}
	}, [
		Ye,
		Te,
		H
	]), (0, i.useEffect)(() => {
		let e = (e) => {
			if (f || m || g || !(e.metaKey || e.ctrlKey) || W == null) return;
			let t = e.key.toLowerCase();
			if (t === "s") {
				e.preventDefault(), Et();
				return;
			}
			t === "z" && et && G?.publishedVersionId && !G?.active?.conflicted && !L && (e.preventDefault(), Se(!0));
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, [
		G?.active?.conflicted,
		f,
		m,
		g,
		et,
		Et,
		L,
		W
	]);
	let kt = (0, i.useCallback)((e) => {
		let t = e.id, n = Z.getState(), r = by(e.options), i = xy(e.options);
		n.setMapBaseline(t, r), n.setMapServerBaseline(t, r), n.setMapTitleBaseline(t, i);
		let a = pp(), o = a?.id === t ? _y(a) : Am(t).active?.snapshot.options;
		o && (Sy(o, r, i) && !n.mapDrafts[String(t)]?.conflicted ? n.clearMapDraft(t) : n.setMapDraft(t, {
			options: o,
			baselineFingerprint: r,
			baselineOptionsFingerprint: r,
			baselineTitle: i,
			draftFingerprint: by(o),
			updatedAt: Date.now(),
			...n.mapDrafts[String(t)]?.conflicted ? { conflicted: !0 } : {}
		}));
	}, []), At = (0, i.useCallback)(async () => {
		let e = G;
		if (!e?.active || e.offline || e.busy || e.transitioning) return null;
		let t = pp();
		t?.id === e.mapId && e.capture(t.getData()), he(null), e.setTransitioning(!0);
		try {
			await e.create();
			let t = Z.getState(), n = t.tabs.find((e) => e.id === t.activeTabId)?.resource;
			return gf(n) === e.mapId && Ot(), e.activeId;
		} catch (t) {
			return he({
				mapId: e.mapId,
				message: t instanceof Error ? t.message : String(t)
			}), null;
		} finally {
			e.setTransitioning(!1);
		}
	}, [G, Ot]), jt = (0, i.useCallback)(() => !G?.active || G.offline || G.busy || G.transitioning ? !1 : (_e(null), z({
		mapId: G.mapId,
		draftId: G.active.draft.id,
		title: G.active.draft.title
	}), !0), [G]);
	(0, i.useEffect)(() => {
		R && (H !== "workspace" || R.mapId !== W || R.draftId !== G?.activeId) && z(null);
	}, [
		R,
		W,
		G?.activeId,
		H
	]);
	let Mt = async () => {
		let e = R, t = G;
		if (!(ve.current || !e || !t || e.mapId !== t.mapId || e.draftId !== t.activeId)) {
			ve.current = !0, pe(!0), _e(null), t.setTransitioning(!0);
			try {
				await t.pull(e.draftId);
				let n = Z.getState(), r = n.tabs.find((e) => e.id === n.activeTabId)?.resource;
				gf(r) === e.mapId && t.activeId === e.draftId && Ot(), z(null);
			} catch (e) {
				_e(e instanceof Error ? e.message : String(e));
			} finally {
				ve.current = !1, pe(!1), t.setTransitioning(!1);
			}
		}
	};
	(0, i.useEffect)(() => {
		let e = (e) => {
			let t = e.detail, n = G;
			H !== "workspace" || !t || typeof t.respond != "function" || !n?.ready || !n.active || U?.id !== t.mapId || W !== t.mapId || n.mapId !== t.mapId || n.activeId !== t.draftId || n.offline || n.busy || n.transitioning || le.current || fe || ye || R || (t.action === "pull_changes" ? jt() && (e.preventDefault(), t.respond({ status: "confirmation_required" })) : t.action === "branch" && (e.preventDefault(), At().then((e) => t.respond(e ? {
				status: "completed",
				draftId: e
			} : { status: "failed" }), () => t.respond({ status: "failed" }))));
		};
		return window.addEventListener(oy, e), () => window.removeEventListener(oy, e);
	}, [
		H,
		W,
		U,
		G,
		fe,
		ye,
		R,
		jt,
		At
	]), (0, i.useEffect)(() => {
		let e = (e) => {
			let t = e.detail, n = G;
			H !== "workspace" || !t || typeof t.respond != "function" || typeof t.prepare != "function" || typeof t.complete != "function" || U?.id !== t.mapId || W !== t.mapId || n?.activeId !== t.draftId || !n.ready || !n.active || n.offline || n.busy || n.transitioning || n.active.conflicted || le.current || fe || ye || R || (e.preventDefault(), Qy(t).then((e) => t.respond({
				ok: !0,
				...e
			}), (e) => t.respond({
				ok: !1,
				message: e instanceof Error ? e.message : String(e)
			})));
		};
		return window.addEventListener(sy, e), () => window.removeEventListener(sy, e);
	}, [
		H,
		W,
		U,
		G,
		fe,
		ye,
		R
	]);
	let Nt = H === "workspace" && W != null ? /* @__PURE__ */ (0, v.jsx)(px, {
		session: G,
		disabled: L || U?.id !== W,
		onReplace: Ot,
		onCheckout: kt,
		onPull: jt,
		onRevert: et && !G?.active?.conflicted ? () => Se(!0) : void 0,
		publishing: L,
		osShortcut: Je,
		onPublish: Et,
		publishDisabled: L || !G?.ready || G.offline || !G.active || G.transitioning || !!G?.active?.conflicted || U?.id !== W
	}) : null, Pt = /* @__PURE__ */ (0, v.jsx)(Fg, {
		tabs: V,
		activeTabId: H === "workspace" ? je : null,
		onActivate: dt,
		onClose: ft
	}), Ft = Ce && Te && $e !== "database" && H === "workspace" && W != null;
	return /* @__PURE__ */ (0, v.jsxs)(tg, {
		"data-ui-theme": Ae,
		open: oe,
		onOpenChange: se,
		className: "h-full min-h-0 !min-h-0",
		style: { "--sidebar-width": "260px" },
		children: [
			/* @__PURE__ */ (0, v.jsx)(vg, {
				version: e.version,
				pluginUrl: e.pluginUrl,
				maps: t,
				chats: D,
				selectedChatId: H === "workspace" && Ye?.resource.kind === "chat" ? Ye.resource.chatId : null,
				onSelectChat: at,
				onRenameChat: (e, t) => {
					k?.rename(e.id, t);
				},
				selectedMapId: W,
				activeSection: $e,
				settingsOpen: f,
				usageOpen: m,
				onNewChat: rt,
				onSelectMap: it,
				onOpenDatabase: st,
				onOpenSettings: ct,
				onOpenUsage: lt,
				onRenameMap: xt,
				onDuplicateMap: Ct,
				duplicatingMapId: P,
				duplicateError: re,
				onDeleteMap: St
			}),
			y ? /* @__PURE__ */ (0, v.jsx)(Hp, {
				open: c,
				children: /* @__PURE__ */ (0, v.jsx)(hx, {
					open: c,
					onOpenChange: I,
					svgFiles: r,
					imageFiles: o,
					onUploaded: (e) => a((t) => t.some((t) => t.relativeUrl === e.relativeUrl) ? t : [...t, e]),
					onImageUploaded: (e) => s((t) => t.some((t) => t.relativeUrl === e.relativeUrl) ? t : [...t, e]),
					onDownloadGoogleOverlay: () => d(!0),
					onCreated: async (e, t) => {
						if (n((t) => [e, ...t.filter((t) => t.id !== e.id)]), !t || !M.current) return;
						let r = Z.getState(), i = r.tabs.find((e) => e.id === r.activeTabId);
						if (i?.resource.kind === "chat") {
							if (k) try {
								let t = await k.attachMap(i.resource.chatId, e.id);
								Z.getState().updateChatTab(i.id, t);
							} catch (t) {
								console.error("Map saved; could not attach its chat", t), Z.getState().attachMapTab(i.id, e.id, e.title);
							}
							else r.attachMapTab(i.id, e.id, e.title);
							let t = Z.getState(), n = t.tabs.find((e) => e.id === i.id);
							if (!n || t.activeTabId !== i.id) return;
							sx({
								type: "resource",
								resource: n.resource
							}, "replace");
						} else {
							let t = {
								kind: "map",
								mapId: e.id
							};
							sx({
								type: "resource",
								resource: t
							}, "push"), Me(t, e.title);
						}
						Ke("workspace"), se(!1);
					}
				})
			}) : null,
			b ? /* @__PURE__ */ (0, v.jsx)(Hp, {
				open: u,
				children: /* @__PURE__ */ (0, v.jsx)(gx, {
					open: u,
					onOpenChange: d
				})
			}) : null,
			x ? /* @__PURE__ */ (0, v.jsx)(Hp, {
				open: f,
				children: /* @__PURE__ */ (0, v.jsx)(_x, {
					open: f,
					onOpenChange: p
				})
			}) : null,
			S ? /* @__PURE__ */ (0, v.jsx)(Hp, {
				open: m,
				children: /* @__PURE__ */ (0, v.jsx)(vx, {
					open: m,
					onOpenChange: h,
					initialScreen: w
				})
			}) : null,
			C ? /* @__PURE__ */ (0, v.jsx)(Hp, {
				open: g,
				children: /* @__PURE__ */ (0, v.jsx)(yx, {
					open: g,
					onOpenChange: _,
					onReloadEditor: ut
				})
			}) : null,
			/* @__PURE__ */ (0, v.jsxs)(rg, {
				className: "min-h-0 min-w-0 overflow-hidden",
				children: [
					Ft ? null : Pt,
					/* @__PURE__ */ (0, v.jsx)(zp, {
						mapId: W,
						children: !Ce || !Te ? /* @__PURE__ */ (0, v.jsx)("div", {
							className: "flex min-h-0 flex-1 items-center justify-center p-6",
							children: /* @__PURE__ */ (0, v.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "Restoring workspace…"
							})
						}) : $e === "database" ? /* @__PURE__ */ (0, v.jsx)(Sx, {
							initialQueryId: Qe,
							initialQuerySettings: A,
							selectedSchemaId: Ze,
							onSelectSchema: ht,
							onSelectQuery: gt,
							onOpenSchemaTab: _t,
							onOpenQueryTab: vt,
							onOpenQueries: () => j(!1),
							onCatalogReady: yt,
							onQueryCatalogReady: bt
						}, Ye?.id) : H === "start" || W == null ? /* @__PURE__ */ (0, v.jsx)("div", {
							className: "min-h-0 flex-1 overflow-hidden",
							children: /* @__PURE__ */ (0, v.jsx)(wh, {
								chatId: Ye?.resource.kind === "chat" ? Ye.resource.chatId : null,
								onChatSaved: ot,
								onNewMap: () => I(!0)
							}, Ye?.resource.kind === "chat" ? Ye.resource.sessionId : E.current)
						}) : ((e) => {
							if (!e || W == null) return null;
							let t = !!(G?.ready && !G.active);
							return /* @__PURE__ */ (0, v.jsxs)(Gv, {
								id: "admin-main-panels",
								orientation: "horizontal",
								className: "min-h-0 flex-1",
								defaultLayout: qe,
								onLayoutChanged: wt,
								children: [
									/* @__PURE__ */ (0, v.jsxs)(Kv, {
										id: Jv,
										minSize: "20%",
										className: "flex min-h-0 min-w-0 flex-col overflow-hidden",
										children: [
											Pt,
											ue?.mapId === W ? /* @__PURE__ */ (0, v.jsxs)("div", {
												role: "alert",
												className: "flex shrink-0 items-center gap-3 border-b border-destructive/30 bg-destructive/10 px-3 py-2 text-sm",
												children: [/* @__PURE__ */ (0, v.jsx)("span", {
													className: "min-w-0 flex-1",
													children: ue.message
												}), /* @__PURE__ */ (0, v.jsx)(Ju, {
													type: "button",
													size: "xs",
													variant: "outline",
													disabled: L || U?.id !== W,
													onClick: () => void Tt(),
													children: "Retry Publish"
												})]
											}) : null,
											G?.active?.conflicted ? /* @__PURE__ */ (0, v.jsxs)("div", {
												role: "alert",
												className: "flex shrink-0 flex-wrap items-center gap-3 border-b border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs",
												children: [/* @__PURE__ */ (0, v.jsxs)("div", {
													className: "min-w-0 flex-1 basis-56",
													children: [/* @__PURE__ */ (0, v.jsx)("p", { children: "The server has a newer version of this draft. Your local copy is retained. Pull changes replaces local edits with the server copy. Branch into a new draft keeps your local changes in a separate draft." }), me?.mapId === W ? /* @__PURE__ */ (0, v.jsx)("p", {
														className: "mt-1 text-destructive",
														children: me.message
													}) : null]
												}), /* @__PURE__ */ (0, v.jsx)(mx, {
													disabled: L || G.busy || G.offline || G.transitioning || U?.id !== W,
													onPull: jt,
													onBranch: () => void At()
												})]
											}) : null,
											G?.ready && !G.active ? /* @__PURE__ */ (0, v.jsx)("div", {
												role: "status",
												className: "border-b px-3 py-2 text-sm text-muted-foreground",
												children: "Create a draft in Versions to start editing."
											}) : null,
											/* @__PURE__ */ (0, v.jsxs)("div", {
												className: "relative flex min-h-0 min-w-0 flex-1 flex-col",
												inert: t,
												children: [t ? /* @__PURE__ */ (0, v.jsx)("div", {
													className: "absolute inset-0 z-20 bg-background/40",
													"aria-label": "No draft selected"
												}) : null, /* @__PURE__ */ (0, v.jsx)(bx, { mapId: W }, Oe)]
											})
										]
									}),
									/* @__PURE__ */ (0, v.jsx)(qv, { withHandle: !0 }),
									/* @__PURE__ */ (0, v.jsx)(Kv, {
										id: Yv,
										minSize: "20%",
										className: "min-h-0 min-w-0 overflow-hidden",
										children: /* @__PURE__ */ (0, v.jsx)(xx, {
											mapId: W,
											headerActions: Nt,
											contentInert: t
										})
									})
								]
							}, `map-workspace-${W}-${Ee}`);
						})(Ye)
					}),
					/* @__PURE__ */ (0, v.jsx)(Bg, {
						open: R !== null,
						onOpenChange: (e) => {
							!e && !fe && z(null);
						},
						children: /* @__PURE__ */ (0, v.jsxs)(Ug, { children: [
							/* @__PURE__ */ (0, v.jsxs)(Wg, { children: [/* @__PURE__ */ (0, v.jsx)(Kg, { children: "Pull changes?" }), /* @__PURE__ */ (0, v.jsxs)(qg, { children: [
								"This will replace the local copy of “",
								R?.title,
								"” with the latest server draft. Local changes will be discarded. To keep them, cancel and choose “Branch into a new draft”. The published map will not change."
							] })] }),
							ge ? /* @__PURE__ */ (0, v.jsx)("p", {
								role: "alert",
								className: "text-xs text-destructive",
								children: ge
							}) : null,
							/* @__PURE__ */ (0, v.jsxs)(Gg, { children: [/* @__PURE__ */ (0, v.jsx)(Yg, {
								size: "sm",
								disabled: fe,
								children: "Cancel"
							}), /* @__PURE__ */ (0, v.jsx)(Jg, {
								size: "sm",
								variant: "destructive",
								disabled: fe || G?.offline,
								onClick: (e) => {
									e.preventDefault(), Mt();
								},
								children: fe ? "Pulling…" : "Pull changes"
							})] })
						] })
					}),
					/* @__PURE__ */ (0, v.jsx)(Bg, {
						open: ye !== null,
						onOpenChange: (e) => {
							e || be(null);
						},
						children: /* @__PURE__ */ (0, v.jsxs)(Ug, {
							"data-publish-draft-dialog": "",
							children: [/* @__PURE__ */ (0, v.jsxs)(Wg, { children: [/* @__PURE__ */ (0, v.jsx)(Kg, { children: "Publish draft?" }), /* @__PURE__ */ (0, v.jsx)(qg, {
								asChild: !0,
								children: /* @__PURE__ */ (0, v.jsxs)("div", {
									className: "space-y-3",
									children: [/* @__PURE__ */ (0, v.jsxs)("p", { children: [
										"You’re editing a draft. ",
										/* @__PURE__ */ (0, v.jsx)("strong", {
											className: "font-medium text-foreground",
											children: "No action is needed to save your draft."
										}),
										" Changes are saved automatically on this device, even when you’re offline, and synced with the server when a connection is available."
									] }), /* @__PURE__ */ (0, v.jsx)("p", { children: "Publish makes the current draft live and updates the map on the front-end page." })]
								})
							})] }), /* @__PURE__ */ (0, v.jsxs)(Gg, { children: [/* @__PURE__ */ (0, v.jsx)(Yg, {
								size: "sm",
								children: "Cancel"
							}), /* @__PURE__ */ (0, v.jsx)(Jg, {
								size: "sm",
								disabled: L || G?.offline || !G?.active || G.transitioning || !!G?.active?.conflicted || U?.id !== W,
								onClick: () => {
									ye?.mapId !== W || ye?.draftId !== G?.activeId || (be(null), Tt());
								},
								children: "Publish"
							})] })]
						})
					}),
					/* @__PURE__ */ (0, v.jsx)(Bg, {
						open: xe,
						onOpenChange: Se,
						children: /* @__PURE__ */ (0, v.jsxs)(Ug, { children: [/* @__PURE__ */ (0, v.jsxs)(Wg, { children: [/* @__PURE__ */ (0, v.jsx)(Kg, { children: "Revert unpublished changes?" }), /* @__PURE__ */ (0, v.jsx)(qg, { children: "This will discard all unpublished changes to this map and restore the last published version. This action cannot be undone." })] }), /* @__PURE__ */ (0, v.jsxs)(Gg, { children: [/* @__PURE__ */ (0, v.jsx)(Yg, { children: "Cancel" }), /* @__PURE__ */ (0, v.jsx)(Jg, {
							variant: "destructive",
							onClick: () => {
								Dt(), Se(!1);
							},
							children: "Revert changes"
						})] })] })
					})
				]
			}),
			/* @__PURE__ */ (0, v.jsx)(zg, {})
		]
	});
}
//#endregion
//#region node_modules/.pnpm/next-themes@0.4.6_react-dom@19.2.8_react@19.2.8__react@19.2.8/node_modules/next-themes/dist/index.mjs
var Dx = (e, t, n, r, i, a, o, s) => {
	let c = document.documentElement, l = ["light", "dark"];
	function u(t) {
		(Array.isArray(e) ? e : [e]).forEach((e) => {
			let n = e === "class", r = n && a ? i.map((e) => a[e] || e) : i;
			n ? (c.classList.remove(...r), c.classList.add(a && a[t] ? a[t] : t)) : c.setAttribute(e, t);
		}), d(t);
	}
	function d(e) {
		s && l.includes(e) && (c.style.colorScheme = e);
	}
	function f() {
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	}
	if (r) u(r);
	else try {
		let e = localStorage.getItem(t) || n;
		u(o && e === "system" ? f() : e);
	} catch {}
}, Ox = i.createContext(void 0), kx = {
	setTheme: (e) => {},
	themes: []
}, Ax = () => i.useContext(Ox) ?? kx;
i.memo(({ forcedTheme: e, storageKey: t, attribute: n, enableSystem: r, enableColorScheme: a, defaultTheme: o, value: s, themes: c, nonce: l, scriptProps: u }) => {
	let d = JSON.stringify([
		n,
		t,
		o,
		e,
		c,
		s,
		r,
		a
	]).slice(1, -1);
	return i.createElement("script", {
		...u,
		suppressHydrationWarning: !0,
		nonce: typeof window > "u" ? l : "",
		dangerouslySetInnerHTML: { __html: `(${Dx.toString()})(${d})` }
	});
});
//#endregion
//#region node_modules/.pnpm/sonner@2.0.7_react-dom@19.2.8_react@19.2.8__react@19.2.8/node_modules/sonner/dist/index.mjs
function jx(e) {
	if (!e || typeof document > "u") return;
	let t = document.head || document.getElementsByTagName("head")[0], n = document.createElement("style");
	n.type = "text/css", t.appendChild(n), n.styleSheet ? n.styleSheet.cssText = e : n.appendChild(document.createTextNode(e));
}
var Mx = (e) => {
	switch (e) {
		case "success": return Fx;
		case "info": return Lx;
		case "warning": return Ix;
		case "error": return Rx;
		default: return null;
	}
}, Nx = Array(12).fill(0), Px = ({ visible: e, className: t }) => /*#__PURE__*/ i.default.createElement("div", {
	className: ["sonner-loading-wrapper", t].filter(Boolean).join(" "),
	"data-visible": e
}, /*#__PURE__*/ i.default.createElement("div", { className: "sonner-spinner" }, Nx.map((e, t) => /*#__PURE__*/ i.default.createElement("div", {
	className: "sonner-loading-bar",
	key: `spinner-bar-${t}`
})))), Fx = /*#__PURE__*/ i.default.createElement("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 20 20",
	fill: "currentColor",
	height: "20",
	width: "20"
}, /*#__PURE__*/ i.default.createElement("path", {
	fillRule: "evenodd",
	d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z",
	clipRule: "evenodd"
})), Ix = /*#__PURE__*/ i.default.createElement("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 24 24",
	fill: "currentColor",
	height: "20",
	width: "20"
}, /*#__PURE__*/ i.default.createElement("path", {
	fillRule: "evenodd",
	d: "M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z",
	clipRule: "evenodd"
})), Lx = /*#__PURE__*/ i.default.createElement("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 20 20",
	fill: "currentColor",
	height: "20",
	width: "20"
}, /*#__PURE__*/ i.default.createElement("path", {
	fillRule: "evenodd",
	d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z",
	clipRule: "evenodd"
})), Rx = /*#__PURE__*/ i.default.createElement("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	viewBox: "0 0 20 20",
	fill: "currentColor",
	height: "20",
	width: "20"
}, /*#__PURE__*/ i.default.createElement("path", {
	fillRule: "evenodd",
	d: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z",
	clipRule: "evenodd"
})), zx = /*#__PURE__*/ i.default.createElement("svg", {
	xmlns: "http://www.w3.org/2000/svg",
	width: "12",
	height: "12",
	viewBox: "0 0 24 24",
	fill: "none",
	stroke: "currentColor",
	strokeWidth: "1.5",
	strokeLinecap: "round",
	strokeLinejoin: "round"
}, /*#__PURE__*/ i.default.createElement("line", {
	x1: "18",
	y1: "6",
	x2: "6",
	y2: "18"
}), /*#__PURE__*/ i.default.createElement("line", {
	x1: "6",
	y1: "6",
	x2: "18",
	y2: "18"
})), Bx = () => {
	let [e, t] = i.default.useState(document.hidden);
	return i.default.useEffect(() => {
		let e = () => {
			t(document.hidden);
		};
		return document.addEventListener("visibilitychange", e), () => window.removeEventListener("visibilitychange", e);
	}, []), e;
}, Vx = 1, Hx = new class {
	constructor() {
		this.subscribe = (e) => (this.subscribers.push(e), () => {
			let t = this.subscribers.indexOf(e);
			this.subscribers.splice(t, 1);
		}), this.publish = (e) => {
			this.subscribers.forEach((t) => t(e));
		}, this.addToast = (e) => {
			this.publish(e), this.toasts = [...this.toasts, e];
		}, this.create = (e) => {
			let { message: t, ...n } = e, r = typeof e?.id == "number" || e.id?.length > 0 ? e.id : Vx++, i = this.toasts.find((e) => e.id === r), a = e.dismissible === void 0 || e.dismissible;
			return this.dismissedToasts.has(r) && this.dismissedToasts.delete(r), i ? this.toasts = this.toasts.map((n) => n.id === r ? (this.publish({
				...n,
				...e,
				id: r,
				title: t
			}), {
				...n,
				...e,
				id: r,
				dismissible: a,
				title: t
			}) : n) : this.addToast({
				title: t,
				...n,
				dismissible: a,
				id: r
			}), r;
		}, this.dismiss = (e) => (e ? (this.dismissedToasts.add(e), requestAnimationFrame(() => this.subscribers.forEach((t) => t({
			id: e,
			dismiss: !0
		})))) : this.toasts.forEach((e) => {
			this.subscribers.forEach((t) => t({
				id: e.id,
				dismiss: !0
			}));
		}), e), this.message = (e, t) => this.create({
			...t,
			message: e
		}), this.error = (e, t) => this.create({
			...t,
			message: e,
			type: "error"
		}), this.success = (e, t) => this.create({
			...t,
			type: "success",
			message: e
		}), this.info = (e, t) => this.create({
			...t,
			type: "info",
			message: e
		}), this.warning = (e, t) => this.create({
			...t,
			type: "warning",
			message: e
		}), this.loading = (e, t) => this.create({
			...t,
			type: "loading",
			message: e
		}), this.promise = (e, t) => {
			if (!t) return;
			let n;
			t.loading !== void 0 && (n = this.create({
				...t,
				promise: e,
				type: "loading",
				message: t.loading,
				description: typeof t.description == "function" ? void 0 : t.description
			}));
			let r = Promise.resolve(e instanceof Function ? e() : e), a = n !== void 0, o, s = r.then(async (e) => {
				if (o = ["resolve", e], i.default.isValidElement(e)) a = !1, this.create({
					id: n,
					type: "default",
					message: e
				});
				else if (Wx(e) && !e.ok) {
					a = !1;
					let r = typeof t.error == "function" ? await t.error(`HTTP error! status: ${e.status}`) : t.error, o = typeof t.description == "function" ? await t.description(`HTTP error! status: ${e.status}`) : t.description, s = typeof r == "object" && !i.default.isValidElement(r) ? r : { message: r };
					this.create({
						id: n,
						type: "error",
						description: o,
						...s
					});
				} else if (e instanceof Error) {
					a = !1;
					let r = typeof t.error == "function" ? await t.error(e) : t.error, o = typeof t.description == "function" ? await t.description(e) : t.description, s = typeof r == "object" && !i.default.isValidElement(r) ? r : { message: r };
					this.create({
						id: n,
						type: "error",
						description: o,
						...s
					});
				} else if (t.success !== void 0) {
					a = !1;
					let r = typeof t.success == "function" ? await t.success(e) : t.success, o = typeof t.description == "function" ? await t.description(e) : t.description, s = typeof r == "object" && !i.default.isValidElement(r) ? r : { message: r };
					this.create({
						id: n,
						type: "success",
						description: o,
						...s
					});
				}
			}).catch(async (e) => {
				if (o = ["reject", e], t.error !== void 0) {
					a = !1;
					let r = typeof t.error == "function" ? await t.error(e) : t.error, o = typeof t.description == "function" ? await t.description(e) : t.description, s = typeof r == "object" && !i.default.isValidElement(r) ? r : { message: r };
					this.create({
						id: n,
						type: "error",
						description: o,
						...s
					});
				}
			}).finally(() => {
				a && (this.dismiss(n), n = void 0), t.finally == null || t.finally.call(t);
			}), c = () => new Promise((e, t) => s.then(() => o[0] === "reject" ? t(o[1]) : e(o[1])).catch(t));
			return typeof n != "string" && typeof n != "number" ? { unwrap: c } : Object.assign(n, { unwrap: c });
		}, this.custom = (e, t) => {
			let n = t?.id || Vx++;
			return this.create({
				jsx: e(n),
				id: n,
				...t
			}), n;
		}, this.getActiveToasts = () => this.toasts.filter((e) => !this.dismissedToasts.has(e.id)), this.subscribers = [], this.toasts = [], this.dismissedToasts = /* @__PURE__ */ new Set();
	}
}(), Ux = (e, t) => {
	let n = t?.id || Vx++;
	return Hx.addToast({
		title: e,
		...t,
		id: n
	}), n;
}, Wx = (e) => e && typeof e == "object" && "ok" in e && typeof e.ok == "boolean" && "status" in e && typeof e.status == "number", Gx = Object.assign(Ux, {
	success: Hx.success,
	info: Hx.info,
	warning: Hx.warning,
	error: Hx.error,
	custom: Hx.custom,
	message: Hx.message,
	promise: Hx.promise,
	dismiss: Hx.dismiss,
	loading: Hx.loading
}, {
	getHistory: () => Hx.toasts,
	getToasts: () => Hx.getActiveToasts()
});
jx("[data-sonner-toaster][dir=ltr],html[dir=ltr]{--toast-icon-margin-start:-3px;--toast-icon-margin-end:4px;--toast-svg-margin-start:-1px;--toast-svg-margin-end:0px;--toast-button-margin-start:auto;--toast-button-margin-end:0;--toast-close-button-start:0;--toast-close-button-end:unset;--toast-close-button-transform:translate(-35%, -35%)}[data-sonner-toaster][dir=rtl],html[dir=rtl]{--toast-icon-margin-start:4px;--toast-icon-margin-end:-3px;--toast-svg-margin-start:0px;--toast-svg-margin-end:-1px;--toast-button-margin-start:0;--toast-button-margin-end:auto;--toast-close-button-start:unset;--toast-close-button-end:0;--toast-close-button-transform:translate(35%, -35%)}[data-sonner-toaster]{position:fixed;width:var(--width);font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;--gray1:hsl(0, 0%, 99%);--gray2:hsl(0, 0%, 97.3%);--gray3:hsl(0, 0%, 95.1%);--gray4:hsl(0, 0%, 93%);--gray5:hsl(0, 0%, 90.9%);--gray6:hsl(0, 0%, 88.7%);--gray7:hsl(0, 0%, 85.8%);--gray8:hsl(0, 0%, 78%);--gray9:hsl(0, 0%, 56.1%);--gray10:hsl(0, 0%, 52.3%);--gray11:hsl(0, 0%, 43.5%);--gray12:hsl(0, 0%, 9%);--border-radius:8px;box-sizing:border-box;padding:0;margin:0;list-style:none;outline:0;z-index:999999999;transition:transform .4s ease}@media (hover:none) and (pointer:coarse){[data-sonner-toaster][data-lifted=true]{transform:none}}[data-sonner-toaster][data-x-position=right]{right:var(--offset-right)}[data-sonner-toaster][data-x-position=left]{left:var(--offset-left)}[data-sonner-toaster][data-x-position=center]{left:50%;transform:translateX(-50%)}[data-sonner-toaster][data-y-position=top]{top:var(--offset-top)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--offset-bottom)}[data-sonner-toast]{--y:translateY(100%);--lift-amount:calc(var(--lift) * var(--gap));z-index:var(--z-index);position:absolute;opacity:0;transform:var(--y);touch-action:none;transition:transform .4s,opacity .4s,height .4s,box-shadow .2s;box-sizing:border-box;outline:0;overflow-wrap:anywhere}[data-sonner-toast][data-styled=true]{padding:16px;background:var(--normal-bg);border:1px solid var(--normal-border);color:var(--normal-text);border-radius:var(--border-radius);box-shadow:0 4px 12px rgba(0,0,0,.1);width:var(--width);font-size:13px;display:flex;align-items:center;gap:6px}[data-sonner-toast]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-y-position=top]{top:0;--y:translateY(-100%);--lift:1;--lift-amount:calc(1 * var(--gap))}[data-sonner-toast][data-y-position=bottom]{bottom:0;--y:translateY(100%);--lift:-1;--lift-amount:calc(var(--lift) * var(--gap))}[data-sonner-toast][data-styled=true] [data-description]{font-weight:400;line-height:1.4;color:#3f3f3f}[data-rich-colors=true][data-sonner-toast][data-styled=true] [data-description]{color:inherit}[data-sonner-toaster][data-sonner-theme=dark] [data-description]{color:#e8e8e8}[data-sonner-toast][data-styled=true] [data-title]{font-weight:500;line-height:1.5;color:inherit}[data-sonner-toast][data-styled=true] [data-icon]{display:flex;height:16px;width:16px;position:relative;justify-content:flex-start;align-items:center;flex-shrink:0;margin-left:var(--toast-icon-margin-start);margin-right:var(--toast-icon-margin-end)}[data-sonner-toast][data-promise=true] [data-icon]>svg{opacity:0;transform:scale(.8);transform-origin:center;animation:sonner-fade-in .3s ease forwards}[data-sonner-toast][data-styled=true] [data-icon]>*{flex-shrink:0}[data-sonner-toast][data-styled=true] [data-icon] svg{margin-left:var(--toast-svg-margin-start);margin-right:var(--toast-svg-margin-end)}[data-sonner-toast][data-styled=true] [data-content]{display:flex;flex-direction:column;gap:2px}[data-sonner-toast][data-styled=true] [data-button]{border-radius:4px;padding-left:8px;padding-right:8px;height:24px;font-size:12px;color:var(--normal-bg);background:var(--normal-text);margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end);border:none;font-weight:500;cursor:pointer;outline:0;display:flex;align-items:center;flex-shrink:0;transition:opacity .4s,box-shadow .2s}[data-sonner-toast][data-styled=true] [data-button]:focus-visible{box-shadow:0 0 0 2px rgba(0,0,0,.4)}[data-sonner-toast][data-styled=true] [data-button]:first-of-type{margin-left:var(--toast-button-margin-start);margin-right:var(--toast-button-margin-end)}[data-sonner-toast][data-styled=true] [data-cancel]{color:var(--normal-text);background:rgba(0,0,0,.08)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-styled=true] [data-cancel]{background:rgba(255,255,255,.3)}[data-sonner-toast][data-styled=true] [data-close-button]{position:absolute;left:var(--toast-close-button-start);right:var(--toast-close-button-end);top:0;height:20px;width:20px;display:flex;justify-content:center;align-items:center;padding:0;color:var(--gray12);background:var(--normal-bg);border:1px solid var(--gray4);transform:var(--toast-close-button-transform);border-radius:50%;cursor:pointer;z-index:1;transition:opacity .1s,background .2s,border-color .2s}[data-sonner-toast][data-styled=true] [data-close-button]:focus-visible{box-shadow:0 4px 12px rgba(0,0,0,.1),0 0 0 2px rgba(0,0,0,.2)}[data-sonner-toast][data-styled=true] [data-disabled=true]{cursor:not-allowed}[data-sonner-toast][data-styled=true]:hover [data-close-button]:hover{background:var(--gray2);border-color:var(--gray5)}[data-sonner-toast][data-swiping=true]::before{content:'';position:absolute;left:-100%;right:-100%;height:100%;z-index:-1}[data-sonner-toast][data-y-position=top][data-swiping=true]::before{bottom:50%;transform:scaleY(3) translateY(50%)}[data-sonner-toast][data-y-position=bottom][data-swiping=true]::before{top:50%;transform:scaleY(3) translateY(-50%)}[data-sonner-toast][data-swiping=false][data-removed=true]::before{content:'';position:absolute;inset:0;transform:scaleY(2)}[data-sonner-toast][data-expanded=true]::after{content:'';position:absolute;left:0;height:calc(var(--gap) + 1px);bottom:100%;width:100%}[data-sonner-toast][data-mounted=true]{--y:translateY(0);opacity:1}[data-sonner-toast][data-expanded=false][data-front=false]{--scale:var(--toasts-before) * 0.05 + 1;--y:translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--scale)));height:var(--front-toast-height)}[data-sonner-toast]>*{transition:opacity .4s}[data-sonner-toast][data-x-position=right]{right:0}[data-sonner-toast][data-x-position=left]{left:0}[data-sonner-toast][data-expanded=false][data-front=false][data-styled=true]>*{opacity:0}[data-sonner-toast][data-visible=false]{opacity:0;pointer-events:none}[data-sonner-toast][data-mounted=true][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset)));height:var(--initial-height)}[data-sonner-toast][data-removed=true][data-front=true][data-swipe-out=false]{--y:translateY(calc(var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=true]{--y:translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));opacity:0}[data-sonner-toast][data-removed=true][data-front=false][data-swipe-out=false][data-expanded=false]{--y:translateY(40%);opacity:0;transition:transform .5s,opacity .2s}[data-sonner-toast][data-removed=true][data-front=false]::before{height:calc(var(--initial-height) + 20%)}[data-sonner-toast][data-swiping=true]{transform:var(--y) translateY(var(--swipe-amount-y,0)) translateX(var(--swipe-amount-x,0));transition:none}[data-sonner-toast][data-swiped=true]{user-select:none}[data-sonner-toast][data-swipe-out=true][data-y-position=bottom],[data-sonner-toast][data-swipe-out=true][data-y-position=top]{animation-duration:.2s;animation-timing-function:ease-out;animation-fill-mode:forwards}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=left]{animation-name:swipe-out-left}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=right]{animation-name:swipe-out-right}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=up]{animation-name:swipe-out-up}[data-sonner-toast][data-swipe-out=true][data-swipe-direction=down]{animation-name:swipe-out-down}@keyframes swipe-out-left{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) - 100%));opacity:0}}@keyframes swipe-out-right{from{transform:var(--y) translateX(var(--swipe-amount-x));opacity:1}to{transform:var(--y) translateX(calc(var(--swipe-amount-x) + 100%));opacity:0}}@keyframes swipe-out-up{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) - 100%));opacity:0}}@keyframes swipe-out-down{from{transform:var(--y) translateY(var(--swipe-amount-y));opacity:1}to{transform:var(--y) translateY(calc(var(--swipe-amount-y) + 100%));opacity:0}}@media (max-width:600px){[data-sonner-toaster]{position:fixed;right:var(--mobile-offset-right);left:var(--mobile-offset-left);width:100%}[data-sonner-toaster][dir=rtl]{left:calc(var(--mobile-offset-left) * -1)}[data-sonner-toaster] [data-sonner-toast]{left:0;right:0;width:calc(100% - var(--mobile-offset-left) * 2)}[data-sonner-toaster][data-x-position=left]{left:var(--mobile-offset-left)}[data-sonner-toaster][data-y-position=bottom]{bottom:var(--mobile-offset-bottom)}[data-sonner-toaster][data-y-position=top]{top:var(--mobile-offset-top)}[data-sonner-toaster][data-x-position=center]{left:var(--mobile-offset-left);right:var(--mobile-offset-right);transform:none}}[data-sonner-toaster][data-sonner-theme=light]{--normal-bg:#fff;--normal-border:var(--gray4);--normal-text:var(--gray12);--success-bg:hsl(143, 85%, 96%);--success-border:hsl(145, 92%, 87%);--success-text:hsl(140, 100%, 27%);--info-bg:hsl(208, 100%, 97%);--info-border:hsl(221, 91%, 93%);--info-text:hsl(210, 92%, 45%);--warning-bg:hsl(49, 100%, 97%);--warning-border:hsl(49, 91%, 84%);--warning-text:hsl(31, 92%, 45%);--error-bg:hsl(359, 100%, 97%);--error-border:hsl(359, 100%, 94%);--error-text:hsl(360, 100%, 45%)}[data-sonner-toaster][data-sonner-theme=light] [data-sonner-toast][data-invert=true]{--normal-bg:#000;--normal-border:hsl(0, 0%, 20%);--normal-text:var(--gray1)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast][data-invert=true]{--normal-bg:#fff;--normal-border:var(--gray3);--normal-text:var(--gray12)}[data-sonner-toaster][data-sonner-theme=dark]{--normal-bg:#000;--normal-bg-hover:hsl(0, 0%, 12%);--normal-border:hsl(0, 0%, 20%);--normal-border-hover:hsl(0, 0%, 25%);--normal-text:var(--gray1);--success-bg:hsl(150, 100%, 6%);--success-border:hsl(147, 100%, 12%);--success-text:hsl(150, 86%, 65%);--info-bg:hsl(215, 100%, 6%);--info-border:hsl(223, 43%, 17%);--info-text:hsl(216, 87%, 65%);--warning-bg:hsl(64, 100%, 6%);--warning-border:hsl(60, 100%, 9%);--warning-text:hsl(46, 87%, 65%);--error-bg:hsl(358, 76%, 10%);--error-border:hsl(357, 89%, 16%);--error-text:hsl(358, 100%, 81%)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]{background:var(--normal-bg);border-color:var(--normal-border);color:var(--normal-text)}[data-sonner-toaster][data-sonner-theme=dark] [data-sonner-toast] [data-close-button]:hover{background:var(--normal-bg-hover);border-color:var(--normal-border-hover)}[data-rich-colors=true][data-sonner-toast][data-type=success]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=success] [data-close-button]{background:var(--success-bg);border-color:var(--success-border);color:var(--success-text)}[data-rich-colors=true][data-sonner-toast][data-type=info]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=info] [data-close-button]{background:var(--info-bg);border-color:var(--info-border);color:var(--info-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=warning] [data-close-button]{background:var(--warning-bg);border-color:var(--warning-border);color:var(--warning-text)}[data-rich-colors=true][data-sonner-toast][data-type=error]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}[data-rich-colors=true][data-sonner-toast][data-type=error] [data-close-button]{background:var(--error-bg);border-color:var(--error-border);color:var(--error-text)}.sonner-loading-wrapper{--size:16px;height:var(--size);width:var(--size);position:absolute;inset:0;z-index:10}.sonner-loading-wrapper[data-visible=false]{transform-origin:center;animation:sonner-fade-out .2s ease forwards}.sonner-spinner{position:relative;top:50%;left:50%;height:var(--size);width:var(--size)}.sonner-loading-bar{animation:sonner-spin 1.2s linear infinite;background:var(--gray11);border-radius:6px;height:8%;left:-10%;position:absolute;top:-3.9%;width:24%}.sonner-loading-bar:first-child{animation-delay:-1.2s;transform:rotate(.0001deg) translate(146%)}.sonner-loading-bar:nth-child(2){animation-delay:-1.1s;transform:rotate(30deg) translate(146%)}.sonner-loading-bar:nth-child(3){animation-delay:-1s;transform:rotate(60deg) translate(146%)}.sonner-loading-bar:nth-child(4){animation-delay:-.9s;transform:rotate(90deg) translate(146%)}.sonner-loading-bar:nth-child(5){animation-delay:-.8s;transform:rotate(120deg) translate(146%)}.sonner-loading-bar:nth-child(6){animation-delay:-.7s;transform:rotate(150deg) translate(146%)}.sonner-loading-bar:nth-child(7){animation-delay:-.6s;transform:rotate(180deg) translate(146%)}.sonner-loading-bar:nth-child(8){animation-delay:-.5s;transform:rotate(210deg) translate(146%)}.sonner-loading-bar:nth-child(9){animation-delay:-.4s;transform:rotate(240deg) translate(146%)}.sonner-loading-bar:nth-child(10){animation-delay:-.3s;transform:rotate(270deg) translate(146%)}.sonner-loading-bar:nth-child(11){animation-delay:-.2s;transform:rotate(300deg) translate(146%)}.sonner-loading-bar:nth-child(12){animation-delay:-.1s;transform:rotate(330deg) translate(146%)}@keyframes sonner-fade-in{0%{opacity:0;transform:scale(.8)}100%{opacity:1;transform:scale(1)}}@keyframes sonner-fade-out{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(.8)}}@keyframes sonner-spin{0%{opacity:1}100%{opacity:.15}}@media (prefers-reduced-motion){.sonner-loading-bar,[data-sonner-toast],[data-sonner-toast]>*{transition:none!important;animation:none!important}}.sonner-loader{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);transform-origin:center;transition:opacity .2s,transform .2s}.sonner-loader[data-visible=false]{opacity:0;transform:scale(.8) translate(-50%,-50%)}");
function Kx(e) {
	return e.label !== void 0;
}
var qx = 3, Jx = "24px", Yx = "16px", Xx = 4e3, Zx = 356, Qx = 14, $x = 45, eS = 200;
function tS(...e) {
	return e.filter(Boolean).join(" ");
}
function nS(e) {
	let [t, n] = e.split("-"), r = [];
	return t && r.push(t), n && r.push(n), r;
}
var rS = (e) => {
	let { invert: t, toast: n, unstyled: r, interacting: a, setHeights: o, visibleToasts: s, heights: c, index: l, toasts: u, expanded: d, removeToast: f, defaultRichColors: p, closeButton: m, style: h, cancelButtonStyle: g, actionButtonStyle: _, className: v = "", descriptionClassName: y = "", duration: b, position: x, gap: S, expandByDefault: C, classNames: w, icons: T, closeButtonAriaLabel: E = "Close toast" } = e, [D, O] = i.default.useState(null), [k, A] = i.default.useState(null), [j, M] = i.default.useState(!1), [ee, N] = i.default.useState(!1), [te, P] = i.default.useState(!1), [ne, re] = i.default.useState(!1), [F, I] = i.default.useState(!1), [ie, ae] = i.default.useState(0), [oe, se] = i.default.useState(0), L = i.default.useRef(n.duration || b || Xx), ce = i.default.useRef(null), le = i.default.useRef(null), ue = l === 0, de = l + 1 <= s, R = n.type, z = n.dismissible !== !1, fe = n.className || "", pe = n.descriptionClassName || "", me = i.default.useMemo(() => c.findIndex((e) => e.toastId === n.id) || 0, [c, n.id]), he = i.default.useMemo(() => n.closeButton ?? m, [n.closeButton, m]), ge = i.default.useMemo(() => n.duration || b || Xx, [n.duration, b]), _e = i.default.useRef(0), ve = i.default.useRef(0), ye = i.default.useRef(0), be = i.default.useRef(null), [xe, Se] = x.split("-"), Ce = i.default.useMemo(() => c.reduce((e, t, n) => n >= me ? e : e + t.height, 0), [c, me]), we = Bx(), Te = n.invert || t, B = R === "loading";
	ve.current = i.default.useMemo(() => me * S + Ce, [me, Ce]), i.default.useEffect(() => {
		L.current = ge;
	}, [ge]), i.default.useEffect(() => {
		M(!0);
	}, []), i.default.useEffect(() => {
		let e = le.current;
		if (e) {
			let t = e.getBoundingClientRect().height;
			return se(t), o((e) => [{
				toastId: n.id,
				height: t,
				position: n.position
			}, ...e]), () => o((e) => e.filter((e) => e.toastId !== n.id));
		}
	}, [o, n.id]), i.default.useLayoutEffect(() => {
		if (!j) return;
		let e = le.current, t = e.style.height;
		e.style.height = "auto";
		let r = e.getBoundingClientRect().height;
		e.style.height = t, se(r), o((e) => e.find((e) => e.toastId === n.id) ? e.map((e) => e.toastId === n.id ? {
			...e,
			height: r
		} : e) : [{
			toastId: n.id,
			height: r,
			position: n.position
		}, ...e]);
	}, [
		j,
		n.title,
		n.description,
		o,
		n.id,
		n.jsx,
		n.action,
		n.cancel
	]);
	let Ee = i.default.useCallback(() => {
		N(!0), ae(ve.current), o((e) => e.filter((e) => e.toastId !== n.id)), setTimeout(() => {
			f(n);
		}, eS);
	}, [
		n,
		f,
		o,
		ve
	]);
	i.default.useEffect(() => {
		if (n.promise && R === "loading" || n.duration === Infinity || n.type === "loading") return;
		let e;
		return d || a || we ? (() => {
			if (ye.current < _e.current) {
				let e = (/* @__PURE__ */ new Date()).getTime() - _e.current;
				L.current -= e;
			}
			ye.current = (/* @__PURE__ */ new Date()).getTime();
		})() : L.current !== Infinity && (_e.current = (/* @__PURE__ */ new Date()).getTime(), e = setTimeout(() => {
			n.onAutoClose == null || n.onAutoClose.call(n, n), Ee();
		}, L.current)), () => clearTimeout(e);
	}, [
		d,
		a,
		n,
		R,
		we,
		Ee
	]), i.default.useEffect(() => {
		n.delete && (Ee(), n.onDismiss == null || n.onDismiss.call(n, n));
	}, [Ee, n.delete]);
	function De() {
		return T?.loading ? /*#__PURE__*/ i.default.createElement("div", {
			className: tS(w?.loader, n?.classNames?.loader, "sonner-loader"),
			"data-visible": R === "loading"
		}, T.loading) : /*#__PURE__*/ i.default.createElement(Px, {
			className: tS(w?.loader, n?.classNames?.loader),
			visible: R === "loading"
		});
	}
	let Oe = n.icon || T?.[R] || Mx(R);
	return /*#__PURE__*/ i.default.createElement("li", {
		tabIndex: 0,
		ref: le,
		className: tS(v, fe, w?.toast, n?.classNames?.toast, w?.default, w?.[R], n?.classNames?.[R]),
		"data-sonner-toast": "",
		"data-rich-colors": n.richColors ?? p,
		"data-styled": !(n.jsx || n.unstyled || r),
		"data-mounted": j,
		"data-promise": !!n.promise,
		"data-swiped": F,
		"data-removed": ee,
		"data-visible": de,
		"data-y-position": xe,
		"data-x-position": Se,
		"data-index": l,
		"data-front": ue,
		"data-swiping": te,
		"data-dismissible": z,
		"data-type": R,
		"data-invert": Te,
		"data-swipe-out": ne,
		"data-swipe-direction": k,
		"data-expanded": !!(d || C && j),
		"data-testid": n.testId,
		style: {
			"--index": l,
			"--toasts-before": l,
			"--z-index": u.length - l,
			"--offset": `${ee ? ie : ve.current}px`,
			"--initial-height": C ? "auto" : `${oe}px`,
			...h,
			...n.style
		},
		onDragEnd: () => {
			P(!1), O(null), be.current = null;
		},
		onPointerDown: (e) => {
			e.button !== 2 && (B || !z || (ce.current = /* @__PURE__ */ new Date(), ae(ve.current), e.target.setPointerCapture(e.pointerId), e.target.tagName !== "BUTTON" && (P(!0), be.current = {
				x: e.clientX,
				y: e.clientY
			})));
		},
		onPointerUp: () => {
			if (ne || !z) return;
			be.current = null;
			let e = Number(le.current?.style.getPropertyValue("--swipe-amount-x").replace("px", "") || 0), t = Number(le.current?.style.getPropertyValue("--swipe-amount-y").replace("px", "") || 0), r = (/* @__PURE__ */ new Date()).getTime() - ce.current?.getTime(), i = D === "x" ? e : t, a = Math.abs(i) / r;
			if (Math.abs(i) >= $x || a > .11) {
				ae(ve.current), n.onDismiss == null || n.onDismiss.call(n, n), A(D === "x" ? e > 0 ? "right" : "left" : t > 0 ? "down" : "up"), Ee(), re(!0);
				return;
			} else {
				var o, s;
				(o = le.current) == null || o.style.setProperty("--swipe-amount-x", "0px"), (s = le.current) == null || s.style.setProperty("--swipe-amount-y", "0px");
			}
			I(!1), P(!1), O(null);
		},
		onPointerMove: (t) => {
			var n, r;
			if (!be.current || !z || window.getSelection()?.toString().length > 0) return;
			let i = t.clientY - be.current.y, a = t.clientX - be.current.x, o = e.swipeDirections ?? nS(x);
			!D && (Math.abs(a) > 1 || Math.abs(i) > 1) && O(Math.abs(a) > Math.abs(i) ? "x" : "y");
			let s = {
				x: 0,
				y: 0
			}, c = (e) => 1 / (1.5 + Math.abs(e) / 20);
			if (D === "y") {
				if (o.includes("top") || o.includes("bottom")) if (o.includes("top") && i < 0 || o.includes("bottom") && i > 0) s.y = i;
				else {
					let e = i * c(i);
					s.y = Math.abs(e) < Math.abs(i) ? e : i;
				}
			} else if (D === "x" && (o.includes("left") || o.includes("right"))) if (o.includes("left") && a < 0 || o.includes("right") && a > 0) s.x = a;
			else {
				let e = a * c(a);
				s.x = Math.abs(e) < Math.abs(a) ? e : a;
			}
			(Math.abs(s.x) > 0 || Math.abs(s.y) > 0) && I(!0), (n = le.current) == null || n.style.setProperty("--swipe-amount-x", `${s.x}px`), (r = le.current) == null || r.style.setProperty("--swipe-amount-y", `${s.y}px`);
		}
	}, he && !n.jsx && R !== "loading" ? /*#__PURE__*/ i.default.createElement("button", {
		"aria-label": E,
		"data-disabled": B,
		"data-close-button": !0,
		onClick: B || !z ? () => {} : () => {
			Ee(), n.onDismiss == null || n.onDismiss.call(n, n);
		},
		className: tS(w?.closeButton, n?.classNames?.closeButton)
	}, T?.close ?? zx) : null, (R || n.icon || n.promise) && n.icon !== null && (T?.[R] !== null || n.icon) ? /*#__PURE__*/ i.default.createElement("div", {
		"data-icon": "",
		className: tS(w?.icon, n?.classNames?.icon)
	}, n.promise || n.type === "loading" && !n.icon ? n.icon || De() : null, n.type === "loading" ? null : Oe) : null, /*#__PURE__*/ i.default.createElement("div", {
		"data-content": "",
		className: tS(w?.content, n?.classNames?.content)
	}, /*#__PURE__*/ i.default.createElement("div", {
		"data-title": "",
		className: tS(w?.title, n?.classNames?.title)
	}, n.jsx ? n.jsx : typeof n.title == "function" ? n.title() : n.title), n.description ? /*#__PURE__*/ i.default.createElement("div", {
		"data-description": "",
		className: tS(y, pe, w?.description, n?.classNames?.description)
	}, typeof n.description == "function" ? n.description() : n.description) : null), /*#__PURE__*/ i.default.isValidElement(n.cancel) ? n.cancel : n.cancel && Kx(n.cancel) ? /*#__PURE__*/ i.default.createElement("button", {
		"data-button": !0,
		"data-cancel": !0,
		style: n.cancelButtonStyle || g,
		onClick: (e) => {
			Kx(n.cancel) && z && (n.cancel.onClick == null || n.cancel.onClick.call(n.cancel, e), Ee());
		},
		className: tS(w?.cancelButton, n?.classNames?.cancelButton)
	}, n.cancel.label) : null, /*#__PURE__*/ i.default.isValidElement(n.action) ? n.action : n.action && Kx(n.action) ? /*#__PURE__*/ i.default.createElement("button", {
		"data-button": !0,
		"data-action": !0,
		style: n.actionButtonStyle || _,
		onClick: (e) => {
			Kx(n.action) && (n.action.onClick == null || n.action.onClick.call(n.action, e), !e.defaultPrevented && Ee());
		},
		className: tS(w?.actionButton, n?.classNames?.actionButton)
	}, n.action.label) : null);
};
function iS() {
	if (typeof window > "u" || typeof document > "u") return "ltr";
	let e = document.documentElement.getAttribute("dir");
	return e === "auto" || !e ? window.getComputedStyle(document.documentElement).direction : e;
}
function aS(e, t) {
	let n = {};
	return [e, t].forEach((e, t) => {
		let r = t === 1, i = r ? "--mobile-offset" : "--offset", a = r ? Yx : Jx;
		function o(e) {
			[
				"top",
				"right",
				"bottom",
				"left"
			].forEach((t) => {
				n[`${i}-${t}`] = typeof e == "number" ? `${e}px` : e;
			});
		}
		typeof e == "number" || typeof e == "string" ? o(e) : typeof e == "object" ? [
			"top",
			"right",
			"bottom",
			"left"
		].forEach((t) => {
			e[t] === void 0 ? n[`${i}-${t}`] = a : n[`${i}-${t}`] = typeof e[t] == "number" ? `${e[t]}px` : e[t];
		}) : o(a);
	}), n;
}
var oS = /*#__PURE__*/ i.default.forwardRef(function(e, t) {
	let { id: n, invert: r, position: a = "bottom-right", hotkey: o = ["altKey", "KeyT"], expand: s, closeButton: c, className: l, offset: u, mobileOffset: d, theme: f = "light", richColors: p, duration: m, style: h, visibleToasts: g = qx, toastOptions: v, dir: y = iS(), gap: b = Qx, icons: x, containerAriaLabel: S = "Notifications" } = e, [C, w] = i.default.useState([]), T = i.default.useMemo(() => n ? C.filter((e) => e.toasterId === n) : C.filter((e) => !e.toasterId), [C, n]), E = i.default.useMemo(() => Array.from(new Set([a].concat(T.filter((e) => e.position).map((e) => e.position)))), [T, a]), [D, O] = i.default.useState([]), [k, A] = i.default.useState(!1), [j, M] = i.default.useState(!1), [ee, N] = i.default.useState(f === "system" ? typeof window < "u" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : f), te = i.default.useRef(null), P = o.join("+").replace(/Key/g, "").replace(/Digit/g, ""), ne = i.default.useRef(null), re = i.default.useRef(!1), F = i.default.useCallback((e) => {
		w((t) => (t.find((t) => t.id === e.id)?.delete || Hx.dismiss(e.id), t.filter(({ id: t }) => t !== e.id)));
	}, []);
	return i.default.useEffect(() => Hx.subscribe((e) => {
		if (e.dismiss) {
			requestAnimationFrame(() => {
				w((t) => t.map((t) => t.id === e.id ? {
					...t,
					delete: !0
				} : t));
			});
			return;
		}
		setTimeout(() => {
			_.default.flushSync(() => {
				w((t) => {
					let n = t.findIndex((t) => t.id === e.id);
					return n === -1 ? [e, ...t] : [
						...t.slice(0, n),
						{
							...t[n],
							...e
						},
						...t.slice(n + 1)
					];
				});
			});
		});
	}), [C]), i.default.useEffect(() => {
		if (f !== "system") {
			N(f);
			return;
		}
		if (f === "system" && (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? N("dark") : N("light")), typeof window > "u") return;
		let e = window.matchMedia("(prefers-color-scheme: dark)");
		try {
			e.addEventListener("change", ({ matches: e }) => {
				N(e ? "dark" : "light");
			});
		} catch {
			e.addListener(({ matches: e }) => {
				try {
					N(e ? "dark" : "light");
				} catch (e) {
					console.error(e);
				}
			});
		}
	}, [f]), i.default.useEffect(() => {
		C.length <= 1 && A(!1);
	}, [C]), i.default.useEffect(() => {
		let e = (e) => {
			if (o.every((t) => e[t] || e.code === t)) {
				var t;
				A(!0), (t = te.current) == null || t.focus();
			}
			e.code === "Escape" && (document.activeElement === te.current || te.current?.contains(document.activeElement)) && A(!1);
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}, [o]), i.default.useEffect(() => {
		if (te.current) return () => {
			ne.current && (ne.current.focus({ preventScroll: !0 }), ne.current = null, re.current = !1);
		};
	}, [te.current]), /*#__PURE__*/ i.default.createElement("section", {
		ref: t,
		"aria-label": `${S} ${P}`,
		tabIndex: -1,
		"aria-live": "polite",
		"aria-relevant": "additions text",
		"aria-atomic": "false",
		suppressHydrationWarning: !0
	}, E.map((t, n) => {
		let [a, o] = t.split("-");
		return T.length ? /*#__PURE__*/ i.default.createElement("ol", {
			key: t,
			dir: y === "auto" ? iS() : y,
			tabIndex: -1,
			ref: te,
			className: l,
			"data-sonner-toaster": !0,
			"data-sonner-theme": ee,
			"data-y-position": a,
			"data-x-position": o,
			style: {
				"--front-toast-height": `${D[0]?.height || 0}px`,
				"--width": `${Zx}px`,
				"--gap": `${b}px`,
				...h,
				...aS(u, d)
			},
			onBlur: (e) => {
				re.current && !e.currentTarget.contains(e.relatedTarget) && (re.current = !1, ne.current &&= (ne.current.focus({ preventScroll: !0 }), null));
			},
			onFocus: (e) => {
				e.target instanceof HTMLElement && e.target.dataset.dismissible === "false" || re.current || (re.current = !0, ne.current = e.relatedTarget);
			},
			onMouseEnter: () => A(!0),
			onMouseMove: () => A(!0),
			onMouseLeave: () => {
				j || A(!1);
			},
			onDragEnd: () => A(!1),
			onPointerDown: (e) => {
				e.target instanceof HTMLElement && e.target.dataset.dismissible === "false" || M(!0);
			},
			onPointerUp: () => M(!1)
		}, T.filter((e) => !e.position && n === 0 || e.position === t).map((n, a) => /*#__PURE__*/ i.default.createElement(rS, {
			key: n.id,
			icons: x,
			index: a,
			toast: n,
			defaultRichColors: p,
			duration: v?.duration ?? m,
			className: v?.className,
			descriptionClassName: v?.descriptionClassName,
			invert: r,
			visibleToasts: g,
			closeButton: v?.closeButton ?? c,
			interacting: j,
			position: t,
			style: v?.style,
			unstyled: v?.unstyled,
			classNames: v?.classNames,
			cancelButtonStyle: v?.cancelButtonStyle,
			actionButtonStyle: v?.actionButtonStyle,
			closeButtonAriaLabel: v?.closeButtonAriaLabel,
			removeToast: F,
			toasts: T.filter((e) => e.position == n.position),
			heights: D.filter((e) => e.position == n.position),
			setHeights: O,
			expandByDefault: s,
			gap: b,
			expanded: k,
			swipeDirections: e.swipeDirections
		}))) : null;
	}));
}), sS = ({ ...e }) => {
	let { theme: t = "system" } = Ax();
	return /* @__PURE__ */ (0, v.jsx)(oS, {
		theme: t,
		className: "toaster group",
		icons: {
			success: /* @__PURE__ */ (0, v.jsx)(sd, { className: "size-4" }),
			info: /* @__PURE__ */ (0, v.jsx)(gd, { className: "size-4" }),
			warning: /* @__PURE__ */ (0, v.jsx)(Od, { className: "size-4" }),
			error: /* @__PURE__ */ (0, v.jsx)(xd, { className: "size-4" }),
			loading: /* @__PURE__ */ (0, v.jsx)(vd, { className: "size-4 animate-spin" })
		},
		style: {
			"--normal-bg": "var(--popover)",
			"--normal-text": "var(--popover-foreground)",
			"--normal-border": "var(--border)",
			"--border-radius": "var(--radius)"
		},
		...e
	});
}, cS = "mapsvg-admin-react-css-properties", lS = /@property\s+[^{]+\{[^}]*\}/g;
function uS(e, t, n = "app") {
	let r = [], i = t.replace(lS, (e) => (r.push(e), ""));
	if (i = i.replace(/:root\b/g, ":host"), i = dS(i), r.length > 0 && !document.getElementById(cS)) {
		let e = document.createElement("style");
		e.id = cS, e.textContent = r.join("\n"), document.head.appendChild(e);
	}
	let a = document.createElement("style");
	return a.setAttribute("data-mapsvg-admin-react", n), a.textContent = i, e.appendChild(a), a;
}
function dS(e) {
	let t = "@layer properties{", n = e.indexOf(t);
	if (n < 0) return e;
	let r = n + 18;
	if (!e.startsWith("@supports", r)) return e;
	let i = r + 9;
	for (; i < e.length && e[i] !== "{";) i++;
	if (e[i] !== "{") return e;
	let a = 0, o = -1;
	for (let t = i; t < e.length; t++) {
		let n = e[t];
		if (n === "{") a++;
		else if (n === "}" && (a--, a === 0)) {
			o = t;
			break;
		}
	}
	if (o < 0) return e;
	let s = e.slice(i + 1, o), c = o + 1;
	for (; c < e.length && /\s/.test(e[c]);) c++;
	return e[c] === "}" ? e.slice(0, n) + t + s + "}" + e.slice(c + 1) : e;
}
async function fS(e) {
	let t = await fetch(e, { credentials: "same-origin" });
	if (!t.ok) throw Error(`Failed to load CSS (${t.status}): ${e}`);
	return t.text();
}
//#endregion
export { _y as $, Df as $n, zt as $r, lh as $t, Vb as A, wp as An, ld as Ar, Th as At, Uy as B, ap as Bn, rs as Br, Eh as Bt, rb as C, xp as Cn, yd as Cr, Sg as Ct, gb as D, Ip as Dn, fd as Dr, dg as Dt, hb as E, Dp as En, pd as Er, ug as Et, Db as F, kp as Fn, Ju as Fr, Nh as Ft, Hy as G, np as Gn, ai as Gr, yh as Gt, Jy as H, rp as Hn, ko as Hr, Ch as Ht, vb as I, bp as In, qu as Ir, jh as It, wy as J, Nf as Jn, Dr as Jr, _h as Jt, Vy as K, tp as Kn, yr as Kr, ph as Kt, Ab as L, pp as Ln, X as Lr, Mh as Lt, nb as M, Sp as Mn, od as Mr, Dh as Mt, Rb as N, Np as Nn, ad as Nr, Oh as Nt, Hb as O, Cp as On, dd as Or, Kh as Ot, mb as P, Pp as Pn, id as Pr, kh as Pt, Ly as Q, Ef as Qn, Gt as Qr, uh as Qt, Xy as R, fp as Rn, os as Rr, Ph as Rt, ib as S, Bp as Sn, bd as Sr, Tg as St, Nb as T, Ep as Tn, hd as Tr, cg as Tt, qy as U, sp as Un, No as Ur, xh as Ut, Wy as V, op as Vn, Do as Vr, bh as Vt, Ry as W, Zf as Wn, wo as Wr, Sh as Wt, Ty as X, Af as Xn, dr as Xr, dh as Xt, Py as Y, Pf as Yn, Tr as Yr, gh as Yt, Fy as Z, kf as Zn, nr as Zr, fh as Zt, tb as _, h as _i, Xp as _n, Dd as _r, Mg as _t, Ex as a, H as ai, Ym as an, Yd as ar, qv as at, jb as b, r as bi, Kp as bn, Cd as br, Eg as bt, _b as c, B as ci, Gm as cn, Vd as cr, Hv as ct, bb as d, oe as di, _m as dn, Hd as dr, Yg as dt, Et as ei, oh as en, Tf as er, by as et, Ob as f, F as fi, lm as fn, Wd as fr, Ug as ft, Mb as g, m as gi, $p as gn, kd as gr, Kg as gt, Bb as h, g as hi, Zp as hn, Fd as hr, Wg as ht, Gx as i, $e as ii, qm as in, of as ir, hy as it, Fb as j, Tp as jn, cd as jr, Ah as jt, pb as k, Fp as kn, ud as kr, Rh as kt, Tb as l, fe as li, Km as ln, Gd as lr, Bg as lt, Ib as m, w as mi, nm as mn, Nd as mr, Gg as mt, fS as n, at as ni, Qm as nn, Xd as nr, Sy as nt, $b as o, Re as oi, Jm as on, Id as or, Kv as ot, zb as p, T as pi, tm as pn, Ld as pr, qg as pt, zy as q, ep as qn, jr as qr, hh as qt, sS as r, nt as ri, Zm as rn, ef as rr, xy as rt, yb as s, V as si, Wm as sn, zd as sr, Gv as st, uS as t, pt as ti, ih as tn, Z as tr, gy as tt, Pb as u, ue as ui, Am as un, Ud as ur, Jg as ut, kb as v, u as vi, Qp as vn, Td as vr, Ag as vt, xb as w, jp as wn, vd as wr, xg as wt, Lb as x, Wp as xn, Sd as xr, Cg as xt, Eb as y, l as yi, Gp as yn, wd as yr, Dg as yt, Yy as z, hp as zn, ls as zr, Fh as zt };

//# sourceMappingURL=admin-startup-D4zZmPq_.js.map