import { n as e, r as t } from "./rolldown-runtime-Dqa2HsxW.js";
import { At as n, Bt as r, Fr as i, Ft as a, Gr as o, In as s, It as c, Lr as l, Lt as u, Mt as d, Nt as f, Pr as p, _i as m, bi as h, ci as g, fi as _, gn as v, hi as y, hn as b, in as x, kt as S, li as C, oi as ee, ri as w, tr as te, ui as T, vn as E, yn as ne } from "./admin-startup-D4zZmPq_.js";
import { a as D, i as O, l as k, n as A, o as j, s as M, t as N, u as P } from "./SettingsControlField-CeMY7V71.js";
import { t as re } from "./label-CKo0nS2p.js";
import { c as ie, i as ae, n as oe, o as se, p as ce, s as le, t as ue, v as F, y as de } from "./select-BxQgLI5k.js";
import { n as fe, o as pe, r as me, t as he } from "./toggle-group-BKYEXHAq.js";
import { t as ge } from "./chevron-down-Cg4A-Re9.js";
import { n as _e, r as ve, t as ye } from "./MonacoCodeEditor-BUG37g1c.js";
import { t as be } from "./code-xml-C0XUqCmk.js";
import { a as I, i as xe, n as L, t as R } from "./input-group-BmqoXar3.js";
import { n as Se, r as z, t as Ce } from "./alert-D3fPzy3E.js";
import { t as we } from "./ColorInput-B9cA2Xoh.js";
import { t as B } from "./SettingsSection-CzMJI7uB.js";
//#region node_modules/.pnpm/@radix-ui+react-slider@1.4.5_@types+react-dom@19.2.3_@types+react@19.2.17__@types+react_6ea08df645c860796433f816a8ebb36d/node_modules/@radix-ui/react-slider/dist/index.mjs
var V = /* @__PURE__ */ t(h(), 1), H = y(), Te = Object.defineProperty, U = (e, t) => Te(e, "name", {
	value: t,
	configurable: !0
}), W = ["PageUp", "PageDown"], Ee = [
	"ArrowUp",
	"ArrowDown",
	"ArrowLeft",
	"ArrowRight"
], G = {
	"from-left": [
		"Home",
		"PageDown",
		"ArrowDown",
		"ArrowLeft"
	],
	"from-right": [
		"Home",
		"PageDown",
		"ArrowDown",
		"ArrowRight"
	],
	"from-bottom": [
		"Home",
		"PageDown",
		"ArrowDown",
		"ArrowLeft"
	],
	"from-top": [
		"Home",
		"PageDown",
		"ArrowUp",
		"ArrowLeft"
	]
}, K = "Slider", [De, Oe, ke] = C(K), [q, J] = T(K, [ke]), [Y, X] = q(K), Ae = /* @__PURE__ */ V.forwardRef(/* @__PURE__ */ U(function(e, t) {
	let { name: n, min: r = 0, max: i = 100, step: a = 1, orientation: o = "horizontal", disabled: s = !1, minStepsBetweenThumbs: c = 0, preserveThumbOrder: l = !1, defaultValue: u = [r], value: d, onValueChange: f = /* @__PURE__ */ U(() => {}, "onValueChange"), onValueCommit: p = /* @__PURE__ */ U(() => {}, "onValueCommit"), inverted: h = !1, form: _, ...v } = e, y = V.useRef(/* @__PURE__ */ new Set()), b = V.useRef(0), x = V.useRef(!1), S = o === "horizontal" ? Me : Ne, [C, w] = V.useState(null), te = m(t, w), [T = [], E] = ee({
		prop: d,
		defaultProp: u,
		onChange: /* @__PURE__ */ U((e) => {
			[...y.current][b.current]?.focus({
				preventScroll: !0,
				focusVisible: x.current
			}), x.current = !1, f(e);
		}, "onChange")
	}), ne = V.useRef(T), D = V.useRef(T);
	V.useEffect(() => {
		let e = _ ? C?.ownerDocument.getElementById(_) : C?.closest("form");
		if (e instanceof HTMLFormElement) {
			let t = /* @__PURE__ */ U(() => E(D.current), "reset");
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [
		C,
		_,
		E
	]);
	function O(e) {
		j(e, Ze(T, e));
	}
	U(O, "handleSlideStart");
	function k(e) {
		j(e, b.current);
	}
	U(k, "handleSlideMove");
	function A() {
		String(T) !== String(ne.current) && p(T);
	}
	U(A, "handleSlideEnd");
	function j(e, t, { commit: n } = { commit: !1 }) {
		let o = nt(a), s = F(Q(Math.round((e - r) / a) * a + r, o), [r, i]);
		E((e = []) => {
			let o = c * a, u = l ? F(s, [e[t - 1] === void 0 ? r : e[t - 1] + o, e[t + 1] === void 0 ? i : e[t + 1] - o]) : s, d = Je(e, u, t);
			if (et(d, o)) {
				b.current = l ? t : d.indexOf(u);
				let r = String(d) !== String(e);
				return r && n && p(d), r ? d : e;
			} else return e;
		});
	}
	return U(j, "updateValues"), /* @__PURE__ */ (0, H.jsx)(Y, {
		scope: e.__scopeSlider,
		name: n,
		disabled: s,
		min: r,
		max: i,
		valueIndexToChangeRef: b,
		thumbs: y.current,
		values: T,
		orientation: o,
		form: _,
		children: /* @__PURE__ */ (0, H.jsx)(De.Provider, {
			scope: e.__scopeSlider,
			children: /* @__PURE__ */ (0, H.jsx)(De.Slot, {
				scope: e.__scopeSlider,
				children: /* @__PURE__ */ (0, H.jsx)(S, {
					"aria-disabled": s,
					"data-disabled": s ? "" : void 0,
					...v,
					ref: te,
					onPointerDown: g(v.onPointerDown, () => {
						s || (ne.current = T, x.current = !1);
					}),
					min: r,
					max: i,
					inverted: h,
					onSlideStart: s ? void 0 : O,
					onSlideMove: s ? void 0 : k,
					onSlideEnd: s ? void 0 : A,
					onHomeKeyDown: () => {
						s || (x.current = !0, j(r, 0, { commit: !0 }));
					},
					onEndKeyDown: () => {
						s || (x.current = !0, j(i, T.length - 1, { commit: !0 }));
					},
					onStepKeyDown: ({ event: e, direction: t }) => {
						if (!s) {
							x.current = !0;
							let n = W.includes(e.key) || e.shiftKey && Ee.includes(e.key) ? 10 : 1, i = b.current, o = T[i];
							j(rt(o, {
								min: r,
								step: a,
								direction: t,
								multiplier: n
							}), i, { commit: !0 });
						}
					}
				})
			})
		})
	});
}, "Slider")), [je, Z] = q(K, {
	startEdge: "left",
	endEdge: "right",
	size: "width",
	direction: 1
}), Me = /* @__PURE__ */ V.forwardRef(/* @__PURE__ */ U(function(e, t) {
	let { min: n, max: r, dir: i, inverted: a, onSlideStart: o, onSlideMove: s, onSlideEnd: c, onStepKeyDown: l, ...u } = e, [d, f] = V.useState(null), p = m(t, f), h = V.useRef(void 0), g = w(i), _ = g === "ltr", v = _ && !a || !_ && a;
	function y(e) {
		let t = h.current || d.getBoundingClientRect(), i = tt([0, t.width], v ? [n, r] : [r, n]);
		return h.current = t, i(e - t.left);
	}
	return U(y, "getValueFromPointer"), /* @__PURE__ */ (0, H.jsx)(je, {
		scope: e.__scopeSlider,
		startEdge: v ? "left" : "right",
		endEdge: v ? "right" : "left",
		direction: v ? 1 : -1,
		size: "width",
		children: /* @__PURE__ */ (0, H.jsx)(Pe, {
			dir: g,
			"data-orientation": "horizontal",
			...u,
			ref: p,
			style: {
				...u.style,
				"--radix-slider-thumb-transform": "translateX(-50%)"
			},
			onSlideStart: (e) => {
				let t = y(e.clientX);
				o?.(t);
			},
			onSlideMove: (e) => {
				let t = y(e.clientX);
				s?.(t);
			},
			onSlideEnd: () => {
				h.current = void 0, c?.();
			},
			onStepKeyDown: (e) => {
				let t = G[v ? "from-left" : "from-right"].includes(e.key);
				l?.({
					event: e,
					direction: t ? -1 : 1
				});
			}
		})
	});
}, "SliderHorizontal")), Ne = /* @__PURE__ */ V.forwardRef(/* @__PURE__ */ U(function(e, t) {
	let { min: n, max: r, inverted: i, onSlideStart: a, onSlideMove: o, onSlideEnd: s, onStepKeyDown: c, ...l } = e, u = V.useRef(null), d = m(t, u), f = V.useRef(void 0), p = !i;
	function h(e) {
		let t = f.current || u.current.getBoundingClientRect(), i = tt([0, t.height], p ? [r, n] : [n, r]);
		return f.current = t, i(e - t.top);
	}
	return U(h, "getValueFromPointer"), /* @__PURE__ */ (0, H.jsx)(je, {
		scope: e.__scopeSlider,
		startEdge: p ? "bottom" : "top",
		endEdge: p ? "top" : "bottom",
		size: "height",
		direction: p ? 1 : -1,
		children: /* @__PURE__ */ (0, H.jsx)(Pe, {
			"data-orientation": "vertical",
			...l,
			ref: d,
			style: {
				...l.style,
				"--radix-slider-thumb-transform": "translateY(50%)"
			},
			onSlideStart: (e) => {
				let t = h(e.clientY);
				a?.(t);
			},
			onSlideMove: (e) => {
				let t = h(e.clientY);
				o?.(t);
			},
			onSlideEnd: () => {
				f.current = void 0, s?.();
			},
			onStepKeyDown: (e) => {
				let t = G[p ? "from-bottom" : "from-top"].includes(e.key);
				c?.({
					event: e,
					direction: t ? -1 : 1
				});
			}
		})
	});
}, "SliderVertical")), Pe = /* @__PURE__ */ V.forwardRef(/* @__PURE__ */ U(function(e, t) {
	let { __scopeSlider: n, onSlideStart: r, onSlideMove: i, onSlideEnd: a, onHomeKeyDown: o, onEndKeyDown: s, onStepKeyDown: c, ...l } = e, u = X(K, n);
	return /* @__PURE__ */ (0, H.jsx)(_.span, {
		...l,
		ref: t,
		onKeyDown: g(e.onKeyDown, (e) => {
			e.key === "Home" ? (o(e), e.preventDefault()) : e.key === "End" ? (s(e), e.preventDefault()) : W.concat(Ee).includes(e.key) && (c(e), e.preventDefault());
		}),
		onPointerDown: g(e.onPointerDown, (e) => {
			let t = e.target;
			t.setPointerCapture(e.pointerId), e.preventDefault(), u.thumbs.has(t) ? t.focus({
				preventScroll: !0,
				focusVisible: !1
			}) : r(e);
		}),
		onPointerMove: g(e.onPointerMove, (e) => {
			e.target.hasPointerCapture(e.pointerId) && i(e);
		}),
		onPointerUp: g(e.onPointerUp, (e) => {
			let t = e.target;
			t.hasPointerCapture(e.pointerId) && (t.releasePointerCapture(e.pointerId), a(e));
		})
	});
}, "SliderImpl")), Fe = "SliderTrack", Ie = /* @__PURE__ */ V.forwardRef(/* @__PURE__ */ U(function(e, t) {
	let { __scopeSlider: n, ...r } = e, i = X(Fe, n);
	return /* @__PURE__ */ (0, H.jsx)(_.span, {
		"data-disabled": i.disabled ? "" : void 0,
		"data-orientation": i.orientation,
		...r,
		ref: t
	});
}, "SliderTrack")), Le = "SliderRange", Re = /* @__PURE__ */ V.forwardRef(/* @__PURE__ */ U(function(e, t) {
	let { __scopeSlider: n, ...r } = e, i = X(Le, n), a = Z(Le, n), o = m(t, V.useRef(null)), s = i.values.length, c = i.values.map((e) => Ye(e, i.min, i.max)), l = s > 1 ? Math.min(...c) : 0, u = 100 - Math.max(...c);
	return /* @__PURE__ */ (0, H.jsx)(_.span, {
		"data-orientation": i.orientation,
		"data-disabled": i.disabled ? "" : void 0,
		...r,
		ref: o,
		style: {
			...e.style,
			[a.startEdge]: l + "%",
			[a.endEdge]: u + "%"
		}
	});
}, "SliderRange")), [ze, Be] = q("SliderThumb"), Ve = "SliderThumbProvider";
function He(e) {
	let { __scopeSlider: t, name: n, children: r, internal_do_not_use_render: i } = e, a = X(Ve, t), s = Oe(t), [c, l] = V.useState(null), u = V.useMemo(() => c ? s().findIndex((e) => e.ref.current === c) : -1, [s, c]), d = o(c), f = !c || !!a.form || !!c.closest("form"), p = a.values[u], m = n ?? (a.name ? a.name + (a.values.length > 1 ? "[]" : "") : void 0), h = p === void 0 ? 0 : Ye(p, a.min, a.max);
	V.useEffect(() => {
		if (c) return a.thumbs.add(c), () => {
			a.thumbs.delete(c);
		};
	}, [c, a.thumbs]);
	let g = {
		value: p,
		name: m,
		form: a.form,
		isFormControl: f,
		index: u,
		thumb: c,
		onThumbChange: l,
		percent: h,
		size: d
	};
	return /* @__PURE__ */ (0, H.jsx)(ze, {
		scope: t,
		...g,
		children: it(i) ? i(g) : r
	});
}
U(He, "SliderThumbProvider");
var Ue = "SliderThumbTrigger", We = /* @__PURE__ */ V.forwardRef(/* @__PURE__ */ U(function(e, t) {
	let { __scopeSlider: n, ...r } = e, i = X(Ue, n), a = Z(Ue, n), { index: o, value: s, percent: c, size: l, onThumbChange: u } = Be(Ue, n), d = m(t, u), f = Xe(o, i.values.length), p = l?.[a.size], h = p ? Qe(p, c, a.direction) : 0;
	return /* @__PURE__ */ (0, H.jsx)("span", {
		style: {
			transform: "var(--radix-slider-thumb-transform)",
			position: "absolute",
			[a.startEdge]: `calc(${c}% + ${h}px)`
		},
		children: /* @__PURE__ */ (0, H.jsx)(De.ItemSlot, {
			scope: n,
			children: /* @__PURE__ */ (0, H.jsx)(_.span, {
				role: "slider",
				"aria-label": e["aria-label"] || f,
				"aria-valuemin": i.min,
				"aria-valuenow": s,
				"aria-valuemax": i.max,
				"aria-orientation": i.orientation,
				"data-orientation": i.orientation,
				"data-disabled": i.disabled ? "" : void 0,
				tabIndex: i.disabled ? void 0 : 0,
				...r,
				ref: d,
				style: s === void 0 ? { display: "none" } : e.style,
				onFocus: g(e.onFocus, () => {
					i.valueIndexToChangeRef.current = o;
				})
			})
		})
	});
}, "SliderThumbTrigger")), Ge = /* @__PURE__ */ V.forwardRef(/* @__PURE__ */ U(function(e, t) {
	let { __scopeSlider: n, name: r, ...i } = e;
	return /* @__PURE__ */ (0, H.jsx)(He, {
		__scopeSlider: n,
		name: r,
		internal_do_not_use_render: ({ index: e, isFormControl: r }) => /* @__PURE__ */ (0, H.jsxs)(H.Fragment, { children: [/* @__PURE__ */ (0, H.jsx)(We, {
			...i,
			ref: t,
			__scopeSlider: n
		}), r ? /* @__PURE__ */ (0, H.jsx)(qe, { __scopeSlider: n }, e) : null] })
	});
}, "SliderThumb")), Ke = "SliderBubbleInput", qe = /* @__PURE__ */ V.forwardRef(/* @__PURE__ */ U(function({ __scopeSlider: e, ...t }, n) {
	let { value: r, name: i, form: a } = Be(Ke, e), o = V.useRef(null), s = m(o, n), c = de(r);
	return V.useEffect(() => {
		let e = o.current;
		if (!e) return;
		let t = window.HTMLInputElement.prototype, n = Object.getOwnPropertyDescriptor(t, "value").set;
		if (c !== r && n) {
			let t = new Event("input", { bubbles: !0 });
			n.call(e, r), e.dispatchEvent(t);
		}
	}, [c, r]), /* @__PURE__ */ (0, H.jsx)(_.input, {
		style: { display: "none" },
		name: i,
		form: a,
		...t,
		ref: s,
		defaultValue: r
	});
}, "SliderBubbleInput"));
function Je(e = [], t, n) {
	let r = [...e];
	return r[n] = t, r.sort((e, t) => e - t);
}
U(Je, "getNextSortedValues");
function Ye(e, t, n) {
	return F(100 / (n - t) * (e - t), [0, 100]);
}
U(Ye, "convertValueToPercentage");
function Xe(e, t) {
	if (t > 2) return `Value ${e + 1} of ${t}`;
	if (t === 2) return ["Minimum", "Maximum"][e];
}
U(Xe, "getLabel");
function Ze(e, t) {
	if (e.length === 1) return 0;
	let n = e.map((e) => Math.abs(e - t)), r = Math.min(...n);
	return n.indexOf(r);
}
U(Ze, "getClosestValueIndex");
function Qe(e, t, n) {
	let r = e / 2;
	return (r - tt([0, 50], [0, r])(t) * n) * n;
}
U(Qe, "getThumbInBoundsOffset");
function $e(e) {
	return e.slice(0, -1).map((t, n) => e[n + 1] - t);
}
U($e, "getStepsBetweenValues");
function et(e, t) {
	if (t > 0) {
		let n = $e(e);
		return Math.min(...n) >= t;
	}
	return !0;
}
U(et, "hasMinStepsBetweenValues");
function tt(e, t) {
	return (n) => {
		if (e[0] === e[1] || t[0] === t[1]) return t[0];
		let r = (t[1] - t[0]) / (e[1] - e[0]);
		return t[0] + r * (n - e[0]);
	};
}
U(tt, "linearScale");
function nt(e) {
	if (!Number.isFinite(e)) return 0;
	let t = e.toString();
	if (t.includes("e")) {
		let [e, n] = t.split("e"), r = e.split(".")[1] || "", i = Number(n);
		return Math.max(0, r.length - i);
	}
	let n = t.split(".")[1];
	return n ? n.length : 0;
}
U(nt, "getDecimalCount");
function Q(e, t) {
	let n = 10 ** t;
	return Math.round(e * n) / n;
}
U(Q, "roundValue");
function rt(e, { min: t, step: n, direction: r, multiplier: i }) {
	let a = nt(n), o = (e - t) / n, s = Math.round(o), c = Q(s * n + t, a) === Q(e, a), l;
	return l = c ? s + i * r : r > 0 ? Math.ceil(o) : Math.floor(o), Q(l * n + t, a);
}
U(rt, "getNextStepValue");
function it(e) {
	return typeof e == "function";
}
U(it, "isFunction");
var at = p("list", [
	["path", {
		d: "M3 5h.01",
		key: "18ugdj"
	}],
	["path", {
		d: "M3 12h.01",
		key: "nlz23k"
	}],
	["path", {
		d: "M3 19h.01",
		key: "noohij"
	}],
	["path", {
		d: "M8 5h13",
		key: "1pao27"
	}],
	["path", {
		d: "M8 12h13",
		key: "1za7za"
	}],
	["path", {
		d: "M8 19h13",
		key: "m83p4d"
	}]
]), ot = p("paintbrush", [
	["path", {
		d: "m14.622 17.897-10.68-2.913",
		key: "vj2p1u"
	}],
	["path", {
		d: "M18.376 2.622a1 1 0 1 1 3.002 3.002L17.36 9.643a.5.5 0 0 0 0 .707l.944.944a2.41 2.41 0 0 1 0 3.408l-.944.944a.5.5 0 0 1-.707 0L8.354 7.348a.5.5 0 0 1 0-.707l.944-.944a2.41 2.41 0 0 1 3.408 0l.944.944a.5.5 0 0 0 .707 0z",
		key: "18tc5c"
	}],
	["path", {
		d: "M9 8c-1.804 2.71-3.97 3.46-6.583 3.948a.507.507 0 0 0-.302.819l7.32 8.883a1 1 0 0 0 1.185.204C12.735 20.405 16 16.792 16 15",
		key: "ytzfxy"
	}]
]), st = p("settings-2", [
	["path", {
		d: "M14 17H5",
		key: "gfn3mx"
	}],
	["path", {
		d: "M19 7h-9",
		key: "6i9tg"
	}],
	["circle", {
		cx: "17",
		cy: "17",
		r: "3",
		key: "18b49y"
	}],
	["circle", {
		cx: "7",
		cy: "7",
		r: "3",
		key: "dfmy0x"
	}]
]), ct = {
	list: "<div class=\"mapsvg-details-list\">\n            {{#each objects}}\n          <div class=\"mapsvg-details-list-item\">\n                  <div class=\"mapsvg-details-list-item-image\">\n                    <img src=\"{{images.0.thumbnail}}\" />\n                  </div>\n                <div class=\"mapsvg-details-list-item-info\">    m	      \n                    <h6>{{title}}</h6>\n                    <p class=\"mapsvg-details-address\">{{location.address.formatted}}</p>   \n              <p class=\"mapsvg-details-category\">{{category_text}}</p>                                   \n                    <p>{{description}}</p>  \n                <div class=\"mapsvg-details-link\"><a href=\"{{link}}\">{{link}}</a></div>              \n                  </div>	            \n              </div>\n            {{/each}}\n          </div>",
	default: "<div class=\"mapsvg-details-flex\">\n        \n        <div class=\"mapsvg-details-hero\">\n          <img src=\"{{images.0.full}}\" class=\"mapsvg-details-hero-image\"/>\n        </div>\n        <div class=\"mapsvg-details-info\">\n          <h4 class=\"mapsvg-details-header\">{{#if title}} {{title}} {{else}} {{id}} {{/if}}</h4>\n          {{description}}\n        </div>\n      </div>    \n    ",
	post: "{{post}}",
	title: "{{title}}",
	description: "{{{description}}}",
	imageTitle: "<div class=\"mapsvg-imageTitle-content\">\n  <div class=\"mapsvg-imageTitle-image\">\n    <img src=\"{{images.0.thumbnail}}\" />\n  </div>\n  <div class=\"mapsvg-imageTitle-title\">    	      \n    {{title}}                                  \n  </div>	            \n</div>",
	address: "{{#if location.address.formatted}}\n        {{location.address.formatted}}\n      {{else}}\n        {{#if location.geoPoint.lat}}\n          {{location.geoPoint.lat}}, {{location.geoPoint.lng}}\n        {{/if}}\n      {{/if}}"
}, lt = [
	{
		value: "default",
		label: "Default"
	},
	{
		value: "title",
		label: "Title"
	},
	{
		value: "description",
		label: "Description (HTML)"
	},
	{
		value: "imageTitle",
		label: "Image and title"
	},
	{
		value: "address",
		label: "Address"
	},
	{
		value: "post",
		label: "WordPress post"
	},
	{
		value: "list",
		label: "List"
	}
];
//#endregion
//#region src/components/ControllerView.tsx
function ut({ toolbarStart: e, toolbarEnd: t, hideToolbarWhenEmpty: n = !0, bodyClassName: r, children: i, className: a, scrollTop: o, onScrollTopChange: s }) {
	let c = e != null || t != null || !n, u = (0, V.useRef)(null), d = (0, V.useRef)(null), f = (0, V.useRef)(s);
	return f.current = s, (0, V.useEffect)(() => {
		if (!u.current || o == null) return;
		let e = window.requestAnimationFrame(() => {
			u.current && (u.current.scrollTop = o);
		});
		return () => window.cancelAnimationFrame(e);
	}, [o]), (0, V.useEffect)(() => {
		let e = u.current;
		return () => {
			d.current != null && window.clearTimeout(d.current), e && f.current && f.current(e.scrollTop);
		};
	}, []), /* @__PURE__ */ (0, H.jsxs)("div", {
		className: l("flex h-full min-h-0 min-w-0 max-w-full flex-col", a),
		children: [c ? /* @__PURE__ */ (0, H.jsxs)("header", {
			"data-slot": "controller-toolbar",
			className: "flex min-h-8 shrink-0 flex-wrap items-center justify-between gap-1.5 border-b border-border px-2 py-1",
			children: [/* @__PURE__ */ (0, H.jsx)("div", {
				className: "flex min-w-0 max-w-full flex-wrap items-center gap-1 [&_[data-slot=button]]:h-6! [&_[data-slot=button]]:px-2! [&_[data-slot=select-trigger]]:h-6! [&_[data-slot=toggle-group-item]]:h-6!",
				children: e
			}), /* @__PURE__ */ (0, H.jsx)("div", {
				className: "flex min-w-0 max-w-full flex-wrap items-center gap-1 [&_[data-slot=button]]:h-6! [&_[data-slot=button]]:px-2! [&_[data-slot=select-trigger]]:h-6! [&_[data-slot=toggle-group-item]]:h-6!",
				children: t
			})]
		}) : null, /* @__PURE__ */ (0, H.jsx)("div", {
			"data-slot": "controller-body",
			ref: u,
			onScroll: (e) => {
				if (!f.current) return;
				d.current != null && window.clearTimeout(d.current);
				let t = e.currentTarget.scrollTop;
				d.current = window.setTimeout(() => {
					f.current?.(t);
				}, 150);
			},
			className: l("min-h-0 min-w-0 flex-1 overflow-y-auto", r),
			children: i
		})]
	});
}
//#endregion
//#region src/components/settings-form/SettingsPositionGrid.tsx
var dt = {
	"top-left": "left-0 top-0",
	top: "left-1/2 top-0 -translate-x-1/2",
	"top-right": "right-0 top-0",
	left: "left-0 top-1/2 -translate-y-1/2",
	center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
	right: "right-0 top-1/2 -translate-y-1/2",
	"bottom-left": "bottom-0 left-0",
	bottom: "bottom-0 left-1/2 -translate-x-1/2",
	"bottom-right": "bottom-0 right-0"
};
function ft({ value: e, options: t, disabled: n, onValueChange: r, "aria-label": i }) {
	let a = new Map(t.map((e) => [e.value, e]));
	return /* @__PURE__ */ (0, H.jsx)("div", {
		"data-slot": "settings-position-grid",
		role: "group",
		"aria-label": i,
		className: "grid w-fit grid-cols-3 gap-0.5",
		children: me.map((t) => {
			let i = a.get(t);
			return i ? /* @__PURE__ */ (0, H.jsxs)(b, { children: [/* @__PURE__ */ (0, H.jsx)(E, {
				asChild: !0,
				children: /* @__PURE__ */ (0, H.jsx)("button", {
					type: "button",
					"aria-label": typeof i.label == "string" ? i.label : t,
					"aria-pressed": e === t,
					disabled: n,
					className: l("grid size-7 place-items-center rounded-[3px] border border-border bg-background text-muted-foreground transition-colors duration-100 hover:bg-muted hover:text-foreground", e === t && "border-foreground/25 bg-muted text-foreground"),
					onClick: () => r(t),
					children: /* @__PURE__ */ (0, H.jsx)("span", {
						className: "relative block size-3.5 rounded-[2px] border border-current/30",
						children: /* @__PURE__ */ (0, H.jsx)("span", { className: l("absolute size-1.5 rounded-[1px] bg-current", dt[t]) })
					})
				})
			}), /* @__PURE__ */ (0, H.jsx)(v, {
				side: "top",
				children: i.label
			})] }, t) : /* @__PURE__ */ (0, H.jsx)("button", {
				type: "button",
				disabled: !0,
				"aria-label": t === "center" ? "Center unavailable" : t,
				className: "size-7 cursor-default rounded-[3px] border border-border bg-muted/35"
			}, t);
		})
	});
}
//#endregion
//#region src/components/ui/slider.tsx
function pt({ className: e, defaultValue: t, value: n, min: r = 0, max: i = 100, thumbLabels: a, ...o }) {
	let s = V.useMemo(() => Array.isArray(n) ? n : Array.isArray(t) ? t : [r, i], [
		n,
		t,
		r,
		i
	]);
	return /* @__PURE__ */ (0, H.jsxs)(Ae, {
		"data-slot": "slider",
		defaultValue: t,
		value: n,
		min: r,
		max: i,
		className: l("relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col", e),
		...o,
		children: [/* @__PURE__ */ (0, H.jsx)(Ie, {
			"data-slot": "slider-track",
			className: l("relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"),
			children: /* @__PURE__ */ (0, H.jsx)(Re, {
				"data-slot": "slider-range",
				className: l("absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full")
			})
		}), Array.from({ length: s.length }, (e, t) => /* @__PURE__ */ (0, H.jsx)(Ge, {
			"data-slot": "slider-thumb",
			"aria-label": a?.[t],
			className: "block size-4 shrink-0 rounded-full border border-primary bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
		}, t))]
	});
}
//#endregion
//#region src/components/settings-form/SettingsSliderControl.tsx
function mt(e, t, n, r) {
	return Math.min(n, Math.max(t, Number((t + Math.round((e - t) / r) * r).toFixed(8))));
}
function ht(e, t) {
	return e !== "" && e != null && Number.isFinite(Number(e)) ? Number(e) : t;
}
function gt({ id: e, label: t, value: n, min: r, max: i, step: a, disabled: o, prefix: s, onChange: c }) {
	let [l, u] = (0, V.useState)(String(n));
	(0, V.useEffect)(() => u(String(n)), [n]);
	let d = {
		id: e,
		"aria-label": t,
		inputMode: "decimal",
		disabled: o,
		value: l,
		onChange: (e) => {
			let t = e.target.value;
			if (u(t), t.trim() === "" || !Number.isFinite(Number(t))) return;
			let o = mt(Number(t), r, i, a);
			u(String(o)), o !== n && c(o);
		},
		onBlur: () => u(String(n)),
		onKeyDown: (e) => {
			e.key === "Escape" && (u(String(n)), e.stopPropagation()), e.key === "Enter" && e.currentTarget.blur();
		}
	};
	return s ? /* @__PURE__ */ (0, H.jsxs)(R, { children: [/* @__PURE__ */ (0, H.jsx)(L, { children: /* @__PURE__ */ (0, H.jsx)(I, { children: s }) }), /* @__PURE__ */ (0, H.jsx)(xe, { ...d })] }) : /* @__PURE__ */ (0, H.jsx)(S, { ...d });
}
function _t({ field: e, value: t, disabled: n, onChange: r }) {
	let i = e.min ?? 0, a = e.max ?? 100, o = e.step ?? 1, s = mt(ht(t, i), i, a, o), c = e.id ?? e.path, l = e.label ?? e.path;
	return /* @__PURE__ */ (0, H.jsx)("div", {
		"data-slot": "settings-number-slider",
		className: "@container/settings-slider min-w-0",
		children: /* @__PURE__ */ (0, H.jsxs)("div", {
			className: "grid min-w-0 grid-cols-1 items-center gap-2 @min-[128px]/settings-slider:grid-cols-[minmax(0,1fr)_3.5rem]",
			children: [/* @__PURE__ */ (0, H.jsx)("div", {
				className: "min-w-0 px-2 py-2",
				children: /* @__PURE__ */ (0, H.jsx)(pt, {
					min: i,
					max: a,
					step: o,
					value: [s],
					disabled: n,
					thumbLabels: [`${l} slider`],
					onValueChange: (e) => {
						e[0] !== s && r(e[0]);
					}
				})
			}), /* @__PURE__ */ (0, H.jsx)(gt, {
				id: c,
				label: l,
				value: s,
				min: i,
				max: a,
				step: o,
				disabled: n,
				onChange: r
			})]
		})
	});
}
function vt({ field: e, value: t, disabled: n, onChange: r }) {
	let { min: i, max: a } = e, o = e.step ?? 1, s = Array.isArray(t) ? t : [], c = mt(ht(s[0], i), i, a - o, o), l = mt(ht(s[1], a), c + o, a, o), u = e.id ?? e.path, d = e.lowerLabel ?? `${e.label ?? e.path} minimum`, f = e.upperLabel ?? `${e.label ?? e.path} maximum`;
	return /* @__PURE__ */ (0, H.jsxs)("div", {
		"data-slot": "settings-range-slider",
		className: "grid min-w-0 gap-2",
		children: [/* @__PURE__ */ (0, H.jsx)("div", {
			className: "min-w-0 px-2 py-2",
			children: /* @__PURE__ */ (0, H.jsx)(pt, {
				id: u,
				min: i,
				max: a,
				step: o,
				minStepsBetweenThumbs: 1,
				value: [c, l],
				disabled: n,
				thumbLabels: [`${d} slider`, `${f} slider`],
				onValueChange: r
			})
		}), /* @__PURE__ */ (0, H.jsxs)("div", {
			className: "grid min-w-0 grid-cols-2 gap-2",
			children: [/* @__PURE__ */ (0, H.jsx)(gt, {
				id: `${u}.minimum`,
				label: d,
				prefix: "Min",
				value: c,
				min: i,
				max: l - o,
				step: o,
				disabled: n,
				onChange: (e) => r([e, l])
			}), /* @__PURE__ */ (0, H.jsx)(gt, {
				id: `${u}.maximum`,
				label: f,
				prefix: "Max",
				value: l,
				min: c + o,
				max: a,
				step: o,
				disabled: n,
				onChange: (e) => r([c, e])
			})]
		})]
	});
}
//#endregion
//#region src/lib/settings-form/path.ts
function $(e, t) {
	if (!t) return e;
	let n = t.split("."), r = e;
	for (let e of n) {
		if (typeof r != "object" || !r) return;
		r = r[e];
	}
	return r;
}
function yt(e, t, n) {
	let r = t.split(".");
	if (r.length === 0) return e;
	let i = { ...e }, a = i;
	for (let e = 0; e < r.length - 1; e++) {
		let t = r[e], n = a[t], i = typeof n == "object" && n && !Array.isArray(n) ? { ...n } : {};
		a[t] = i, a = i;
	}
	return a[r[r.length - 1]] = n, i;
}
//#endregion
//#region src/components/settings-form/SettingsSectionHeader.tsx
function bt({ children: e, help: t, className: n, hideDivider: r = !1 }) {
	return /* @__PURE__ */ (0, H.jsx)(B, {
		title: e,
		help: t,
		className: n,
		hideDivider: r
	});
}
//#endregion
//#region src/components/settings-form/SettingsFieldRow.tsx
function xt(e) {
	return e.type === "custom" || e.type === "section" || e.type === "group" || e.type === "alert" ? e.id : e.id ?? e.path;
}
function St(e, t) {
	return typeof e.disabled == "function" ? e.disabled(t) : !!e.disabled;
}
function Ct(e, t) {
	if (e === "" && t.allowEmpty) return "";
	if (e === "") return t.allowEmpty ? "" : 0;
	let n = t.integer ? parseInt(e, 10) : parseFloat(e);
	if (Number.isNaN(n)) return e;
	let r = n;
	return t.min != null && (r = Math.max(t.min, r)), t.max != null && (r = Math.min(t.max, r)), r;
}
function wt({ field: e, ctx: t, disabled: n }) {
	let r = $(t.values, e.path), i = r == null ? "" : String(r), a = /* @__PURE__ */ (0, H.jsx)(xe, {
		id: xt(e),
		disabled: n,
		placeholder: e.placeholder,
		value: i,
		onChange: (n) => {
			e.type === "number" ? t.setValue(e.path, Ct(n.target.value, e)) : t.setValue(e.path, n.target.value);
		}
	});
	return e.suffix ? /* @__PURE__ */ (0, H.jsxs)(R, { children: [a, /* @__PURE__ */ (0, H.jsx)(L, {
		align: "inline-end",
		children: /* @__PURE__ */ (0, H.jsx)(I, { children: e.suffix })
	})] }) : /* @__PURE__ */ (0, H.jsx)(S, {
		id: xt(e),
		disabled: n,
		placeholder: e.placeholder,
		value: i,
		onChange: (n) => {
			e.type === "number" ? t.setValue(e.path, Ct(n.target.value, e)) : t.setValue(e.path, n.target.value);
		}
	});
}
function Tt({ field: e, ctx: t }) {
	let n = St(e, t.values), r = $(t.values, e.path), i = r == null ? "" : String(r);
	return /* @__PURE__ */ (0, H.jsxs)(R, { children: [
		/* @__PURE__ */ (0, H.jsx)(L, {
			align: "inline-start",
			children: /* @__PURE__ */ (0, H.jsx)(I, {
				className: "min-w-4 justify-center font-medium text-foreground/60",
				children: e.shortLabel
			})
		}),
		/* @__PURE__ */ (0, H.jsx)(xe, {
			id: xt(e),
			"aria-label": e.label ?? e.shortLabel,
			disabled: n,
			placeholder: e.placeholder,
			value: i,
			onChange: (n) => {
				e.type === "number" ? t.setValue(e.path, Ct(n.target.value, e)) : t.setValue(e.path, n.target.value);
			}
		}),
		e.suffix ? /* @__PURE__ */ (0, H.jsx)(L, {
			align: "inline-end",
			children: /* @__PURE__ */ (0, H.jsx)(I, { children: e.suffix })
		}) : null
	] });
}
function Et({ field: e, ctx: t }) {
	let n = St(e, t.values), r = String($(t.values, e.path) ?? "");
	return /* @__PURE__ */ (0, H.jsxs)(D, {
		orientation: "vertical",
		"data-disabled": n || void 0,
		children: [e.label ? /* @__PURE__ */ (0, H.jsx)(P, {
			"data-role": "settings-input-label",
			className: "text-[11px] leading-4 font-normal text-foreground/55",
			children: e.label
		}) : null, /* @__PURE__ */ (0, H.jsxs)(j, { children: [/* @__PURE__ */ (0, H.jsx)(ft, {
			value: r,
			options: e.options,
			disabled: n,
			onValueChange: (n) => t.setValue(e.path, n)
		}), e.help ? /* @__PURE__ */ (0, H.jsx)(M, { children: e.help }) : null] })]
	});
}
function Dt({ field: e, ctx: t }) {
	let n = e.fields.filter((e) => !e.visible || e.visible(t.values));
	if (n.length === 0) return null;
	let r = Math.max(1, e.columns ?? n.length);
	return /* @__PURE__ */ (0, H.jsxs)(D, {
		orientation: "vertical",
		children: [e.label ? /* @__PURE__ */ (0, H.jsx)(P, {
			"data-role": "settings-input-label",
			className: "text-[11px] leading-4 font-normal text-foreground/55",
			children: e.label
		}) : null, /* @__PURE__ */ (0, H.jsxs)(j, { children: [/* @__PURE__ */ (0, H.jsx)("div", {
			"data-slot": "settings-inline-group",
			className: "grid gap-2",
			style: { gridTemplateColumns: `repeat(${r}, minmax(0, 1fr))` },
			children: n.map((n) => e.inputLabels === "above" ? /* @__PURE__ */ (0, H.jsx)(jt, {
				field: n,
				ctx: t
			}, n.id ?? n.path) : /* @__PURE__ */ (0, H.jsx)(Tt, {
				field: n,
				ctx: t
			}, n.id ?? n.path))
		}), e.help ? /* @__PURE__ */ (0, H.jsx)(M, { children: e.help }) : null] })]
	});
}
function Ot({ help: e }) {
	return e ? /* @__PURE__ */ (0, H.jsx)(M, { children: e }) : null;
}
function kt({ options: e, name: t, values: n, disabled: r, onChange: i }) {
	return /* @__PURE__ */ (0, H.jsx)("div", {
		className: "grid gap-3",
		children: e.map((e) => {
			let a = `${t}-${e.value}`;
			return /* @__PURE__ */ (0, H.jsxs)("div", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, H.jsx)(O, {
					id: a,
					checked: n.includes(e.value),
					disabled: r,
					onCheckedChange: (t) => {
						i(t === !0 ? [...n, e.value] : n.filter((t) => t !== e.value));
					}
				}), /* @__PURE__ */ (0, H.jsxs)("div", {
					className: "grid min-w-0 flex-1 gap-1.5 leading-none",
					children: [/* @__PURE__ */ (0, H.jsx)(re, {
						htmlFor: a,
						className: "font-normal",
						children: e.label
					}), /* @__PURE__ */ (0, H.jsx)(Ot, { help: e.help })]
				})]
			}, e.value);
		})
	});
}
function At({ field: e, values: t }) {
	return e.visible && !e.visible(t) ? null : /* @__PURE__ */ (0, H.jsxs)(Ce, {
		variant: e.variant ?? "info",
		children: [e.title ? /* @__PURE__ */ (0, H.jsx)(z, { children: e.title }) : null, /* @__PURE__ */ (0, H.jsx)(Se, { dangerouslySetInnerHTML: { __html: e.html } })]
	});
}
function jt({ field: e, ctx: t }) {
	if (e.visible && !e.visible(t.values)) return null;
	if (e.type === "alert") return /* @__PURE__ */ (0, H.jsx)(At, {
		field: e,
		values: t.values
	});
	if (e.type === "section") return /* @__PURE__ */ (0, H.jsx)(bt, {
		help: e.help,
		children: e.label
	});
	if (e.type === "group") return /* @__PURE__ */ (0, H.jsx)(Dt, {
		field: e,
		ctx: t
	});
	if (e.type === "position-grid") return /* @__PURE__ */ (0, H.jsx)(Et, {
		field: e,
		ctx: t
	});
	if (e.type === "custom") return /* @__PURE__ */ (0, H.jsx)(H.Fragment, { children: e.render(t) });
	let n = St(e, t.values), r = xt(e), i = e.indent ? "pl-6" : void 0;
	if (e.type === "switch") {
		let a = !!$(t.values, e.path);
		return /* @__PURE__ */ (0, H.jsx)(N, {
			id: r,
			label: e.label,
			help: e.help,
			disabled: n,
			className: i,
			checked: a,
			onCheckedChange: (n) => t.setValue(e.path, n)
		});
	}
	if (e.type === "checkbox") {
		let a = !!$(t.values, e.path);
		return /* @__PURE__ */ (0, H.jsxs)(D, {
			orientation: "horizontal",
			"data-disabled": n || void 0,
			className: l("items-start", i),
			children: [/* @__PURE__ */ (0, H.jsx)(O, {
				id: r,
				checked: a,
				disabled: n,
				className: "mt-0.5",
				onCheckedChange: (n) => t.setValue(e.path, n === !0)
			}), /* @__PURE__ */ (0, H.jsxs)(j, {
				className: "translate-y-px",
				children: [e.label ? /* @__PURE__ */ (0, H.jsx)(P, {
					htmlFor: r,
					className: "font-normal",
					children: e.label
				}) : null, e.help ? /* @__PURE__ */ (0, H.jsx)(M, { children: e.help }) : null]
			})]
		});
	}
	let a = null;
	if ((e.type === "select" || e.type === "radio") && e.options.length > 0 && e.options.length <= 3) a = /* @__PURE__ */ (0, H.jsx)(ve, {
		id: r,
		"aria-label": e.label,
		options: e.options.map((e) => ({
			...e,
			help: /* @__PURE__ */ (0, H.jsx)(Ot, { help: e.help })
		})),
		value: String($(t.values, e.path) ?? ""),
		disabled: n,
		onValueChange: (n) => t.setValue(e.path, n)
	});
	else if (e.type === "select" || e.type === "radio") a = /* @__PURE__ */ (0, H.jsxs)(ue, {
		value: String($(t.values, e.path) ?? "") || void 0,
		disabled: n,
		onValueChange: (n) => t.setValue(e.path, n),
		children: [/* @__PURE__ */ (0, H.jsx)(se, {
			id: r,
			className: "w-full",
			children: /* @__PURE__ */ (0, H.jsx)(le, { placeholder: ("placeholder" in e ? e.placeholder : void 0) ?? "Select…" })
		}), /* @__PURE__ */ (0, H.jsx)(oe, { children: e.options.map((e) => /* @__PURE__ */ (0, H.jsx)(ae, {
			value: e.value,
			children: e.label
		}, e.value)) })]
	});
	else if (e.type === "checkboxes") {
		let i = $(t.values, e.path), o = Array.isArray(i) ? i : [];
		a = /* @__PURE__ */ (0, H.jsx)(kt, {
			name: r,
			options: e.options,
			values: o,
			disabled: n,
			onChange: (n) => t.setValue(e.path, n)
		});
	} else e.type === "color" ? a = /* @__PURE__ */ (0, H.jsx)(we, {
		id: r,
		label: e.label ?? "Color",
		value: String($(t.values, e.path) ?? ""),
		placeholder: e.placeholder,
		disabled: n,
		onChange: (n) => t.setValue(e.path, n)
	}) : e.type === "range" ? a = /* @__PURE__ */ (0, H.jsx)(vt, {
		field: e,
		value: $(t.values, e.path),
		disabled: n,
		onChange: (n) => t.setValue(e.path, n)
	}) : e.type === "number" && e.slider ? a = /* @__PURE__ */ (0, H.jsx)(_t, {
		field: e,
		value: $(t.values, e.path),
		disabled: n,
		onChange: (n) => t.setValue(e.path, n)
	}) : (e.type === "text" || e.type === "number") && (a = /* @__PURE__ */ (0, H.jsx)(wt, {
		field: e,
		ctx: t,
		disabled: n
	}));
	return /* @__PURE__ */ (0, H.jsx)(A, {
		id: r,
		label: e.label,
		help: e.help,
		disabled: n,
		className: i,
		children: a
	});
}
//#endregion
//#region src/components/settings-form/SettingsForm.tsx
function Mt(e) {
	let t = [], n = {
		kind: "fields",
		fields: []
	};
	t.push(n);
	for (let r of e) r.type === "section" ? (n = {
		kind: "section",
		section: r,
		fields: []
	}, t.push(n)) : n.fields.push(r);
	return t;
}
function Nt(e) {
	return "path" in e ? e.id ?? e.path : e.id;
}
function Pt({ fields: e, ctx: t }) {
	let n = [];
	for (let t of e) {
		let e = "indent" in t && t.indent === !0, r = n[n.length - 1];
		e && r?.indented ? r.fields.push(t) : n.push({
			indented: e,
			fields: [t]
		});
	}
	return n.map((e) => {
		if (!e.indented) {
			let n = e.fields[0];
			return /* @__PURE__ */ (0, H.jsx)(jt, {
				field: n,
				ctx: t
			}, Nt(n));
		}
		return e.fields.some((e) => !e.visible || e.visible(t.values)) ? /* @__PURE__ */ (0, H.jsx)("div", {
			"data-slot": "settings-dependent-fields",
			className: "ml-2 flex min-w-0 flex-col gap-4 border-l-2 border-border pl-4 empty:hidden",
			children: e.fields.map((e) => /* @__PURE__ */ (0, H.jsx)(jt, {
				field: "indent" in e ? {
					...e,
					indent: !1
				} : e,
				ctx: t
			}, Nt(e)))
		}, `dependent:${Nt(e.fields[0])}`) : null;
	});
}
function Ft({ schema: e, values: t, onChange: n, className: r, leading: i, trailing: a }) {
	let o = (0, V.useCallback)((e, r) => {
		n(yt(t, e, r));
	}, [n, t]), s = (0, V.useCallback)((e) => {
		n(e);
	}, [n]), c = (0, V.useMemo)(() => ({
		values: t,
		getValue: (e) => $(t, e),
		setValue: o,
		setValues: s
	}), [
		t,
		o,
		s
	]);
	return /* @__PURE__ */ (0, H.jsx)("form", {
		"data-slot": "settings-form",
		className: l("min-w-0 w-full max-w-full p-3 [overflow-wrap:anywhere] [&_[data-slot=select-trigger]]:min-w-0 [&_[data-slot=select-trigger]]:max-w-full [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate", r),
		onSubmit: (e) => e.preventDefault(),
		children: /* @__PURE__ */ (0, H.jsxs)(k, {
			className: "gap-4",
			children: [
				i,
				Mt(e.fields).map((e) => e.kind === "fields" ? /* @__PURE__ */ (0, H.jsx)(Pt, {
					fields: e.fields,
					ctx: c
				}, "before-sections") : /* @__PURE__ */ (0, H.jsx)(B, {
					title: e.section.label,
					help: e.section.help,
					headerVisible: !e.section.visible || e.section.visible(t),
					children: /* @__PURE__ */ (0, H.jsx)(Pt, {
						fields: e.fields,
						ctx: c
					})
				}, e.section.id)),
				a
			]
		})
	});
}
//#endregion
//#region src/components/ComponentController.tsx
var It = /* @__PURE__ */ e({ ComponentController: () => Bt }), Lt = [
	{
		id: "settings",
		label: "Settings",
		icon: st
	},
	{
		id: "fields",
		label: "Fields",
		icon: at
	},
	{
		id: "interactions",
		label: "Interactions",
		icon: pe
	},
	{
		id: "styles",
		label: "Styles",
		icon: ot
	},
	{
		id: "code",
		label: "Code",
		icon: be
	}
];
function Rt(e) {
	let [t, n] = (0, V.useState)(() => e?.defaultValues ?? {}), r = e?.values !== void 0;
	return {
		values: r ? e.values : t,
		setValues: (t) => {
			r || n(t), e?.onChange?.(t);
		}
	};
}
function zt(e) {
	let [t, n] = (0, V.useState)(() => e?.defaultValue ?? ""), r = e?.value !== void 0;
	return {
		value: r ? e.value : t,
		setValue: (t) => {
			r || n(t), e?.onChange?.(t);
		}
	};
}
function Bt({ settings: e, fields: t, styles: o, template: p, css: m, js: h, templateEntries: g, additionalTemplateEntries: _, onTemplateEntryChange: y, scriptEntries: S, onScriptEntryChange: C, disabled: ee, defaultMode: w = "settings", className: T, toolbarActions: D, settingsEnd: O }) {
	let k = (0, V.useContext)(ne), j = s(), M = j?.id ? Number(j.id) : null, N = te((e) => M ? e.mapSessions[String(M)] : void 0), P = te((e) => e.patchMapSession), re = te((e) => e.setMapScroll), ae = Rt(e), oe = Rt(o), se = zt(p), le = zt(m), ue = zt(h), F = (g?.length ?? 0) > 0, de = [...g ?? [], ..._ ?? []], pe = (S?.length ?? 0) > 0, me = N?.componentTemplateKey && g?.some((e) => e.id === N.componentTemplateKey) ? N.componentTemplateKey : g?.[0]?.id ?? "", ve = N?.componentScriptKey && S?.some((e) => e.id === N.componentScriptKey) ? N.componentScriptKey : S?.[0]?.id ?? "", [be, I] = (0, V.useState)(() => {
		let e = {};
		for (let t of de) e[t.id] = {
			html: t.html ?? "",
			css: t.css ?? "",
			js: t.js ?? ""
		};
		return e;
	}), [xe, L] = (0, V.useState)(() => {
		let e = {};
		for (let t of S ?? []) e[t.id] = t.defaultValue ?? "";
		return e;
	}), R = (e, t) => {
		let n = de.find((t) => t.id === e), r = {
			...be[e] ?? {
				html: n?.html ?? "",
				css: n?.css ?? "",
				js: n?.js ?? ""
			},
			...t
		};
		I((t) => ({
			...t,
			[e]: r
		})), y?.(e, r);
	}, Se = (e, t) => {
		L((n) => ({
			...n,
			[e]: t
		})), C?.(e, t);
	}, z = [];
	for (let [e, t, n] of [
		[
			"html",
			"Templates",
			"handlebars"
		],
		[
			"js",
			"JS",
			"javascript"
		],
		[
			"css",
			"CSS",
			"css"
		]
	]) if (!ee?.[e === "html" ? "template" : e]) {
		if (F) for (let r of g) {
			if (r.parts && !r.parts.includes(e)) continue;
			let i = g.length === 1 ? e === "html" ? "main" : e === "js" ? "afterRender" : "styles" : e === "html" ? r.label : `${r.label} ${e === "js" ? "afterRender" : "styles"}`;
			z.push({
				id: `template:${r.id}:${e}`,
				category: t,
				label: i,
				language: n,
				value: be[r.id]?.[e] ?? r[e] ?? "",
				onChange: (t) => R(r.id, { [e]: t })
			});
		}
		else {
			let r = e === "html" ? p : e === "js" ? h : m, i = e === "html" ? se : e === "js" ? ue : le;
			r && z.push({
				id: `flat:${e}`,
				category: t,
				label: e === "html" ? "main" : e === "js" ? "afterRender" : "styles",
				language: r.language ?? n,
				value: i.value,
				onChange: i.setValue
			});
		}
		for (let r of _ ?? []) r.parts && !r.parts.includes(e) || z.push({
			id: `template:${r.id}:${e}`,
			category: t,
			label: e === "html" ? r.label : `${r.label} ${e === "js" ? "afterRender" : "styles"}`,
			language: n,
			value: be[r.id]?.[e] ?? r[e] ?? "",
			onChange: (t) => R(r.id, { [e]: t })
		});
		if (e === "js") for (let e of S ?? []) z.push({
			id: `script:${e.id}`,
			category: t,
			label: e.label.replace(/ @(event|middleware)$/, ""),
			language: n,
			value: xe[e.id] ?? e.defaultValue ?? "",
			onChange: (t) => Se(e.id, t)
		});
	}
	let [Ce, we] = (0, V.useState)(""), B = N?.componentMode ?? w, Te = B === "template" || B === "css" || B === "js" ? F ? `template:${me}:${B === "template" ? "html" : B}` : B === "js" && pe ? `script:${ve}` : `flat:${B === "template" ? "html" : B}` : "", U = N?.componentCodeDocument ?? (Ce || Te), W = z.find((e) => e.id === U) ?? z[0], Ee = {
		settings: e != null,
		fields: t != null,
		interactions: k?.body != null,
		styles: o != null,
		code: z.length > 0
	}, G = Lt.filter(({ id: e }) => Ee[e] && !ee?.[e]), K = G.find((e) => e.id === ([
		"template",
		"css",
		"js"
	].includes(w) ? "code" : w))?.id ?? G[0]?.id ?? "settings", [De, Oe] = (0, V.useState)(K), ke = M ? N?.componentMode : De, q = ke && [
		"template",
		"css",
		"js"
	].includes(ke) ? "code" : ke, J = q && G.some((e) => e.id === q) ? q : K, Y = J === "code", X = (e) => e.category === "Templates" ? "templates" : e.category === "JS" ? "javascript" : "css", Ae = W && !x(X(W)) ? X(W) : null, je = Y && Ae === "templates", Z = null;
	if (J === "settings" && e ? Z = /* @__PURE__ */ (0, H.jsx)(Ft, {
		schema: k?.settingsLead && !e.retainEnable ? {
			...e.schema,
			fields: e.schema.fields.filter((e) => !("path" in e && e.path === "on"))
		} : e.schema,
		values: ae.values,
		onChange: ae.setValues,
		leading: k?.settingsLead,
		trailing: O ?? k?.settingsEnd
	}) : J === "fields" ? Z = t : J === "interactions" && k ? Z = k.body : J === "styles" && o ? Z = /* @__PURE__ */ (0, H.jsx)(Ft, {
		schema: o.schema,
		values: oe.values,
		onChange: oe.setValues
	}) : Y && W && (Z = je ? /* @__PURE__ */ (0, H.jsxs)("div", {
		className: "h-full overflow-auto",
		children: [/* @__PURE__ */ (0, H.jsx)("div", {
			className: "p-3",
			children: /* @__PURE__ */ (0, H.jsx)(A, {
				label: "Template",
				children: /* @__PURE__ */ (0, H.jsx)(_e, {
					"aria-label": "Template preset",
					value: Object.entries(ct).find(([, e]) => e === W.value)?.[0] ?? "",
					placeholder: "Current template",
					options: lt,
					onValueChange: (e) => {
						let t = ct[e];
						t !== void 0 && W.onChange(t);
					}
				})
			})
		}), /* @__PURE__ */ (0, H.jsx)(ce, {
			feature: "templates",
			compact: !0
		})]
	}) : Ae ? /* @__PURE__ */ (0, H.jsx)(ce, { feature: Ae }) : /* @__PURE__ */ (0, H.jsx)(ye, {
		documentId: W.id,
		language: W.language,
		value: W.value,
		onChange: W.onChange
	})), G.length === 0) return /* @__PURE__ */ (0, H.jsx)("p", {
		className: "p-3 text-sm text-muted-foreground",
		children: "No sections configured for this component."
	});
	let Me = Y && W ? /* @__PURE__ */ (0, H.jsxs)(n, {
		modal: !1,
		children: [/* @__PURE__ */ (0, H.jsx)(r, {
			asChild: !0,
			children: /* @__PURE__ */ (0, H.jsxs)(i, {
				variant: "outline",
				size: "xs",
				"aria-label": "Code source",
				className: "max-w-full min-w-0 gap-1.5 font-normal",
				children: [
					/* @__PURE__ */ (0, H.jsx)("span", {
						className: "text-muted-foreground",
						children: W.category
					}),
					/* @__PURE__ */ (0, H.jsx)("span", {
						className: "text-muted-foreground",
						children: "·"
					}),
					/* @__PURE__ */ (0, H.jsx)("span", {
						className: "truncate",
						children: W.label
					}),
					/* @__PURE__ */ (0, H.jsx)(ge, { className: "size-3.5 shrink-0 text-muted-foreground" })
				]
			})
		}), /* @__PURE__ */ (0, H.jsx)(d, {
			align: "end",
			className: "max-h-[min(70vh,28rem)] overflow-y-auto",
			children: [
				"Templates",
				"JS",
				"CSS"
			].map((e) => {
				let t = z.filter((t) => t.category === e);
				return t.length ? /* @__PURE__ */ (0, H.jsxs)(f, {
					"aria-label": e,
					children: [/* @__PURE__ */ (0, H.jsx)(a, {
						className: "py-1 text-xs text-muted-foreground",
						children: e
					}), /* @__PURE__ */ (0, H.jsx)(c, {
						value: W.id,
						onValueChange: (e) => {
							we(e), M && P(M, { componentCodeDocument: e });
						},
						children: t.map((e) => /* @__PURE__ */ (0, H.jsxs)(u, {
							value: e.id,
							className: "py-1 text-xs",
							children: [e.label, x(X(e)) ? null : /* @__PURE__ */ (0, H.jsx)(ie, { className: "ml-3" })]
						}, e.id))
					})]
				}, e) : null;
			})
		})]
	}) : null, Ne = J === "interactions" ? k?.toolbarEnd ?? null : Me, Pe = G.length === 1 && G[0].id === "settings";
	return /* @__PURE__ */ (0, H.jsx)(ut, {
		className: l(T),
		bodyClassName: Y ? "overflow-hidden p-0" : void 0,
		toolbarStart: Pe ? null : /* @__PURE__ */ (0, H.jsx)(he, {
			type: "single",
			variant: "outline",
			size: "sm",
			spacing: 1,
			value: J,
			onValueChange: (e) => {
				if (!e) return;
				let t = e;
				Oe(t), M && P(M, { componentMode: t });
			},
			className: "min-w-0 max-w-full flex-wrap justify-start",
			children: G.map(({ id: e, label: t, icon: n }) => /* @__PURE__ */ (0, H.jsxs)(b, { children: [/* @__PURE__ */ (0, H.jsx)(E, {
				asChild: !0,
				children: /* @__PURE__ */ (0, H.jsx)("span", {
					className: "inline-flex",
					children: /* @__PURE__ */ (0, H.jsx)(fe, {
						value: e,
						"aria-label": t,
						className: "size-6 p-0",
						children: /* @__PURE__ */ (0, H.jsx)(n, {})
					})
				})
			}), /* @__PURE__ */ (0, H.jsx)(v, {
				side: "bottom",
				children: t
			})] }, e))
		}),
		toolbarEnd: D ? /* @__PURE__ */ (0, H.jsxs)(H.Fragment, { children: [Ne, D] }) : Ne,
		scrollTop: N?.scrollPositions?.components ?? 0,
		onScrollTopChange: M ? (e) => re(M, "components", e) : void 0,
		children: Z
	});
}
//#endregion
export { ft as a, at as c, $ as i, It as n, ut as o, Ft as r, lt as s, Bt as t };

//# sourceMappingURL=ComponentController-COPRPWpk.js.map