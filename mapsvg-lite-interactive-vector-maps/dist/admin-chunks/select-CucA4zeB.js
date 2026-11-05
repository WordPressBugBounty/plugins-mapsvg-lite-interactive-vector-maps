import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { $r as t, At as n, Bt as r, Fr as i, Hr as a, Lr as o, Mr as s, Mt as c, Pr as l, Qr as u, Ur as d, Vr as f, Wr as p, Xr as m, Zr as h, _i as g, _t as _, ai as v, bi as y, ci as b, cr as x, di as S, dr as C, ei as ee, fi as w, fr as T, hi as E, hr as D, ii as O, li as k, lr as A, mi as te, ni as j, oi as M, or as N, pr as ne, ri as P, si as F, sr as I, ti as re, ui as L, ur as R, vi as ie } from "./admin-startup-DaxvU-L8.js";
import { a as ae } from "./popover-CB-evFrr.js";
import { t as oe } from "./chevron-down-BvBr-Lir.js";
import { n as se, o as ce, t as le } from "./input-group-DF-lNg7c.js";
//#region node_modules/.pnpm/@radix-ui+react-use-previous@1.1.3_@types+react@19.2.17_react@19.2.8/node_modules/@radix-ui/react-use-previous/dist/index.mjs
var ue = /* @__PURE__ */ e(ie(), 1), z = /* @__PURE__ */ e(y(), 1), de = Object.defineProperty, fe = (e, t) => de(e, "name", {
	value: t,
	configurable: !0
});
function pe(e) {
	let t = z.useRef({
		value: e,
		previous: e
	});
	return z.useMemo(() => (t.current.value !== e && (t.current.previous = t.current.value, t.current.value = e), t.current.previous), [e]);
}
fe(pe, "usePrevious");
//#endregion
//#region node_modules/.pnpm/@radix-ui+number@1.1.3/node_modules/@radix-ui/number/dist/index.mjs
var me = Object.defineProperty, he = (e, t) => me(e, "name", {
	value: t,
	configurable: !0
});
function B(e, [t, n]) {
	return Math.min(n, Math.max(t, e));
}
he(B, "clamp");
//#endregion
//#region node_modules/.pnpm/@radix-ui+react-select@2.3.5_@types+react-dom@19.2.3_@types+react@19.2.17__@types+react_f2fde808296672bcd424df003eb70e3e/node_modules/@radix-ui/react-select/dist/index.mjs
var V = E(), ge = Object.defineProperty, H = (e, t) => ge(e, "name", {
	value: t,
	configurable: !0
}), _e = [
	" ",
	"Enter",
	"ArrowUp",
	"ArrowDown"
], ve = [" ", "Enter"], U = "Select", [W, G, ye] = k(U), [K, be] = L(U, [ye, p]), xe = p(), [Se, q] = K(U), [Ce, we] = K(U);
function Te(e) {
	let { __scopeSelect: t, children: n, open: r, defaultOpen: i, onOpenChange: a, value: o, defaultValue: s, onValueChange: c, dir: l, name: u, autoComplete: d, disabled: p, required: m, form: h, internal_do_not_use_render: g } = e, _ = xe(t), [v, y] = z.useState(null), [b, x] = z.useState(null), [S, C] = z.useState(!1), ee = P(l), [w, T] = M({
		prop: r,
		defaultProp: i ?? !1,
		onChange: a,
		caller: U
	}), [E, D] = M({
		prop: o,
		defaultProp: s,
		onChange: c,
		caller: U
	}), k = z.useRef(null), A = z.useRef(E);
	z.useEffect(() => {
		let e = h ? v?.ownerDocument.getElementById(h) : v?.form;
		if (e instanceof HTMLFormElement) {
			let t = /* @__PURE__ */ H(() => D(A.current), "reset");
			return e.addEventListener("reset", t), () => e.removeEventListener("reset", t);
		}
	}, [
		h,
		v,
		D
	]);
	let te = !v || !!h || !!v.closest("form"), [j, N] = z.useState(/* @__PURE__ */ new Set()), ne = O(), F = Array.from(j).map((e) => e.props.value).join(";"), I = z.useCallback((e) => {
		N((t) => new Set(t).add(e));
	}, []), re = z.useCallback((e) => {
		N((t) => {
			let n = new Set(t);
			return n.delete(e), n;
		});
	}, []), L = {
		required: m,
		trigger: v,
		onTriggerChange: y,
		valueNode: b,
		onValueNodeChange: x,
		valueNodeHasChildren: S,
		onValueNodeHasChildrenChange: C,
		contentId: ne,
		value: E,
		onValueChange: D,
		open: w,
		onOpenChange: T,
		dir: ee,
		triggerPointerDownPosRef: k,
		disabled: p,
		name: u,
		autoComplete: d,
		form: h,
		nativeOptions: j,
		nativeSelectKey: F,
		isFormControl: te
	};
	return /* @__PURE__ */ (0, V.jsx)(f, {
		..._,
		children: /* @__PURE__ */ (0, V.jsx)(Se, {
			scope: t,
			...L,
			children: /* @__PURE__ */ (0, V.jsx)(W.Provider, {
				scope: t,
				children: /* @__PURE__ */ (0, V.jsx)(Ce, {
					scope: t,
					onNativeOptionAdd: I,
					onNativeOptionRemove: re,
					children: dt(g) ? g(L) : n
				})
			})
		})
	});
}
H(Te, "SelectProvider");
var Ee = /* @__PURE__ */ H((e) => {
	let { __scopeSelect: t, children: n, ...r } = e;
	return /* @__PURE__ */ (0, V.jsx)(Te, {
		__scopeSelect: t,
		...r,
		internal_do_not_use_render: ({ isFormControl: e }) => /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [n, e ? /* @__PURE__ */ (0, V.jsx)(ut, { __scopeSelect: t }) : null] })
	});
}, "Select"), De = "SelectTrigger", Oe = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let { __scopeSelect: n, disabled: r = !1, ...i } = e, o = xe(n), s = q(De, n), c = s.disabled || r, l = g(t, s.onTriggerChange), u = G(n), d = z.useRef("touch"), [f, p, m] = ft((e) => {
		let t = u().filter((e) => !e.disabled), n = pt(t, e, t.find((e) => e.value === s.value));
		n !== void 0 && s.onValueChange(n.value);
	}), h = /* @__PURE__ */ H((e) => {
		c || (s.onOpenChange(!0), m()), e && (s.triggerPointerDownPosRef.current = {
			x: Math.round(e.pageX),
			y: Math.round(e.pageY)
		});
	}, "handleOpen");
	return /* @__PURE__ */ (0, V.jsx)(a, {
		asChild: !0,
		...o,
		children: /* @__PURE__ */ (0, V.jsx)(w.button, {
			type: "button",
			role: "combobox",
			"aria-controls": s.open ? s.contentId : void 0,
			"aria-expanded": s.open,
			"aria-required": s.required,
			"aria-autocomplete": "none",
			dir: s.dir,
			"data-state": s.open ? "open" : "closed",
			disabled: c,
			"data-disabled": c ? "" : void 0,
			"data-placeholder": Q(s.value) ? "" : void 0,
			...i,
			ref: l,
			onClick: b(i.onClick, (e) => {
				e.currentTarget.focus(), d.current !== "mouse" && h(e);
			}),
			onPointerDown: b(i.onPointerDown, (e) => {
				d.current = e.pointerType;
				let t = e.target;
				t.hasPointerCapture(e.pointerId) && t.releasePointerCapture(e.pointerId), e.button === 0 && e.ctrlKey === !1 && e.pointerType === "mouse" && (h(e), e.preventDefault());
			}),
			onKeyDown: b(i.onKeyDown, (e) => {
				let t = f.current !== "";
				!(e.ctrlKey || e.altKey || e.metaKey) && e.key.length === 1 && p(e.key), !(t && e.key === " ") && _e.includes(e.key) && (h(), e.preventDefault());
			})
		})
	});
}, "SelectTrigger")), ke = "SelectValue", Ae = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let { __scopeSelect: n, className: r, style: i, children: a, placeholder: o = "", ...s } = e, c = q(ke, n), { onValueNodeHasChildrenChange: l } = c, u = a !== void 0, d = g(t, c.onValueNodeChange);
	F(() => {
		l(u);
	}, [l, u]);
	let f = Q(c.value);
	return /* @__PURE__ */ (0, V.jsx)(w.span, {
		...s,
		asChild: !f && s.asChild,
		ref: d,
		style: { pointerEvents: "none" },
		children: /* @__PURE__ */ (0, V.jsx)(z.Fragment, { children: f ? o : a }, f ? "placeholder" : "value")
	});
}, "SelectValue")), je = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let { __scopeSelect: n, children: r, ...i } = e;
	return /* @__PURE__ */ (0, V.jsx)(w.span, {
		"aria-hidden": !0,
		...i,
		ref: t,
		children: r || "▼"
	});
}, "SelectIcon")), [Me, Ne] = K("SelectPortal", { forceMount: void 0 }), Pe = /* @__PURE__ */ H((e) => {
	let { __scopeSelect: n, forceMount: r, ...i } = e;
	return /* @__PURE__ */ (0, V.jsx)(Me, {
		scope: e.__scopeSelect,
		forceMount: r,
		children: /* @__PURE__ */ (0, V.jsx)(t, {
			asChild: !0,
			...i
		})
	});
}, "SelectPortal"), J = "SelectContent", Fe = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let n = Ne(J, e.__scopeSelect), { forceMount: r = n.forceMount, ...i } = e, a = q(J, e.__scopeSelect), [o, s] = z.useState();
	return F(() => {
		s(new DocumentFragment());
	}, []), /* @__PURE__ */ (0, V.jsx)(v, {
		present: r || a.open,
		children: ({ present: e }) => e ? /* @__PURE__ */ (0, V.jsx)(ze, {
			...i,
			ref: t
		}) : /* @__PURE__ */ (0, V.jsx)(Ie, {
			...i,
			fragment: o
		})
	});
}, "SelectContent")), Ie = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let { __scopeSelect: n, children: r, fragment: i } = e;
	return i ? ue.createPortal(/* @__PURE__ */ (0, V.jsx)(Le, {
		scope: n,
		children: /* @__PURE__ */ (0, V.jsx)(W.Slot, {
			scope: n,
			children: /* @__PURE__ */ (0, V.jsx)("div", {
				ref: t,
				children: r
			})
		})
	}), i) : null;
}, "SelectContentFragment")), Y = 10, [Le, X] = K(J), Re = te("SelectContent.RemoveScroll"), ze = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let { __scopeSelect: n } = e, { position: r = "item-aligned", onCloseAutoFocus: i, onEscapeKeyDown: a, onPointerDownOutside: o, side: s, sideOffset: c, align: l, alignOffset: d, arrowPadding: f, collisionBoundary: p, collisionPadding: _, sticky: v, hideWhenDetached: y, avoidCollisions: x, ...S } = e, C = q(J, n), [w, T] = z.useState(null), [E, D] = z.useState(null), O = g(t, T), [k, A] = z.useState(null), [te, j] = z.useState(null), M = G(n), [N, ne] = z.useState(!1), P = z.useRef(!1);
	z.useEffect(() => {
		if (w) return m(w);
	}, [w]), u();
	let F = z.useCallback((e) => {
		let [t, ...n] = M().map((e) => e.ref.current), [r] = n.slice(-1), i = document.activeElement;
		for (let n of e) if (n === i || (n?.scrollIntoView({ block: "nearest" }), n === t && E && (E.scrollTop = 0), n === r && E && (E.scrollTop = E.scrollHeight), n?.focus(), document.activeElement !== i)) return;
	}, [M, E]), I = z.useCallback(() => F([k, w]), [
		F,
		k,
		w
	]);
	z.useEffect(() => {
		N && I();
	}, [N, I]);
	let { onOpenChange: L, triggerPointerDownPosRef: R } = C;
	z.useEffect(() => {
		if (w) {
			let e = {
				x: 0,
				y: 0
			}, t = /* @__PURE__ */ H((t) => {
				e = {
					x: Math.abs(Math.round(t.pageX) - (R.current?.x ?? 0)),
					y: Math.abs(Math.round(t.pageY) - (R.current?.y ?? 0))
				};
			}, "handlePointerMove"), n = /* @__PURE__ */ H((n) => {
				e.x <= 10 && e.y <= 10 ? n.preventDefault() : n.composedPath().includes(w) || L(!1), document.removeEventListener("pointermove", t), R.current = null;
			}, "handlePointerUp");
			return R.current !== null && (document.addEventListener("pointermove", t), document.addEventListener("pointerup", n, {
				capture: !0,
				once: !0
			})), () => {
				document.removeEventListener("pointermove", t), document.removeEventListener("pointerup", n, { capture: !0 });
			};
		}
	}, [
		w,
		L,
		R
	]), z.useEffect(() => {
		let e = /* @__PURE__ */ H(() => L(!1), "close");
		return window.addEventListener("blur", e), window.addEventListener("resize", e), () => {
			window.removeEventListener("blur", e), window.removeEventListener("resize", e);
		};
	}, [L]);
	let [ie, ae] = ft((e) => {
		let t = M().filter((e) => !e.disabled), n = pt(t, e, t.find((e) => e.ref.current === document.activeElement));
		n && setTimeout(() => n.ref.current?.focus());
	}), oe = z.useCallback((e, t, n) => {
		let r = !P.current && !n;
		(C.value !== void 0 && C.value === t || r) && (A(e), r && (P.current = !0));
	}, [C.value]), se = z.useCallback(() => w?.focus(), [w]), ce = z.useCallback((e, t, n) => {
		let r = !P.current && !n;
		(C.value !== void 0 && C.value === t || r) && j(e);
	}, [C.value]), le = r === "popper" ? Ve : Be, ue = le === Ve ? {
		side: s,
		sideOffset: c,
		align: l,
		alignOffset: d,
		arrowPadding: f,
		collisionBoundary: p,
		collisionPadding: _,
		sticky: v,
		hideWhenDetached: y,
		avoidCollisions: x
	} : {};
	return /* @__PURE__ */ (0, V.jsx)(Le, {
		scope: n,
		content: w,
		viewport: E,
		onViewportChange: D,
		itemRefCallback: oe,
		selectedItem: k,
		onItemLeave: se,
		itemTextRefCallback: ce,
		focusSelectedItem: I,
		selectedItemText: te,
		position: r,
		isPositioned: N,
		searchRef: ie,
		children: /* @__PURE__ */ (0, V.jsx)(h, {
			as: Re,
			allowPinchZoom: !0,
			children: /* @__PURE__ */ (0, V.jsx)(ee, {
				asChild: !0,
				trapped: C.open,
				onMountAutoFocus: (e) => {
					e.preventDefault();
				},
				onUnmountAutoFocus: b(i, (e) => {
					C.trigger?.focus({ preventScroll: !0 }), e.preventDefault();
				}),
				children: /* @__PURE__ */ (0, V.jsx)(re, {
					asChild: !0,
					disableOutsidePointerEvents: !0,
					onEscapeKeyDown: a,
					onPointerDownOutside: o,
					onFocusOutside: (e) => e.preventDefault(),
					onDismiss: () => C.onOpenChange(!1),
					children: /* @__PURE__ */ (0, V.jsx)(le, {
						role: "listbox",
						id: C.contentId,
						"data-state": C.open ? "open" : "closed",
						dir: C.dir,
						onContextMenu: (e) => e.preventDefault(),
						...S,
						...ue,
						onPlaced: () => ne(!0),
						ref: O,
						style: {
							display: "flex",
							flexDirection: "column",
							outline: "none",
							...S.style
						},
						onKeyDown: b(S.onKeyDown, (e) => {
							let t = e.ctrlKey || e.altKey || e.metaKey;
							if (e.key === "Tab" && e.preventDefault(), !t && e.key.length === 1 && ae(e.key), [
								"ArrowUp",
								"ArrowDown",
								"Home",
								"End"
							].includes(e.key)) {
								let t = M().filter((e) => !e.disabled).map((e) => e.ref.current);
								if (["ArrowUp", "End"].includes(e.key) && (t = t.slice().reverse()), ["ArrowUp", "ArrowDown"].includes(e.key)) {
									let n = e.target, r = t.indexOf(n);
									t = t.slice(r + 1);
								}
								setTimeout(() => F(t)), e.preventDefault();
							}
						})
					})
				})
			})
		})
	});
}, "SelectContentImpl")), Be = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let { __scopeSelect: n, onPlaced: r, ...i } = e, a = q(J, n), o = X(J, n), [s, c] = z.useState(null), [l, u] = z.useState(null), d = g(t, u), f = G(n), p = z.useRef(!1), m = z.useRef(!0), { viewport: h, selectedItem: _, selectedItemText: v, focusSelectedItem: y } = o, b = z.useCallback(() => {
		if (a.trigger && a.valueNode && s && l && h && _ && v) {
			let e = a.trigger.getBoundingClientRect(), t = l.getBoundingClientRect(), n = a.valueNode.getBoundingClientRect(), i = v.getBoundingClientRect();
			if (a.dir !== "rtl") {
				let r = i.left - t.left, a = n.left - r, o = e.left - a, c = e.width + o, l = Math.max(c, t.width), u = window.innerWidth - Y, d = B(a, [Y, Math.max(Y, u - l)]);
				s.style.minWidth = c + "px", s.style.left = d + "px";
			} else {
				let r = t.right - i.right, a = window.innerWidth - n.right - r, o = window.innerWidth - e.right - a, c = e.width + o, l = Math.max(c, t.width), u = window.innerWidth - Y, d = B(a, [Y, Math.max(Y, u - l)]);
				s.style.minWidth = c + "px", s.style.right = d + "px";
			}
			let o = f(), c = window.innerHeight - Y * 2, u = h.scrollHeight, d = window.getComputedStyle(l), m = parseInt(d.borderTopWidth, 10), g = parseInt(d.paddingTop, 10), y = parseInt(d.borderBottomWidth, 10), b = parseInt(d.paddingBottom, 10), x = m + g + u + b + y, S = Math.min(_.offsetHeight * 5, x), C = window.getComputedStyle(h), ee = parseInt(C.paddingTop, 10), w = parseInt(C.paddingBottom, 10), T = e.top + e.height / 2 - Y, E = c - T, D = _.offsetHeight / 2, O = _.offsetTop + D, k = m + g + O, A = x - k;
			if (k <= T) {
				let e = o.length > 0 && _ === o[o.length - 1].ref.current;
				s.style.bottom = "0px";
				let t = l.clientHeight - h.offsetTop - h.offsetHeight, n = k + Math.max(E, D + (e ? w : 0) + t + y);
				s.style.height = n + "px";
			} else {
				let e = o.length > 0 && _ === o[0].ref.current;
				s.style.top = "0px";
				let t = Math.max(T, m + h.offsetTop + (e ? ee : 0) + D) + A;
				s.style.height = t + "px", h.scrollTop = k - T + h.offsetTop;
			}
			s.style.margin = `${Y}px 0`, s.style.minHeight = S + "px", s.style.maxHeight = c + "px", r?.(), requestAnimationFrame(() => p.current = !0);
		}
	}, [
		f,
		a.trigger,
		a.valueNode,
		s,
		l,
		h,
		_,
		v,
		a.dir,
		r
	]);
	F(() => b(), [b]);
	let [x, S] = z.useState();
	return F(() => {
		l && S(window.getComputedStyle(l).zIndex);
	}, [l]), /* @__PURE__ */ (0, V.jsx)(He, {
		scope: n,
		contentWrapper: s,
		shouldExpandOnScrollRef: p,
		onScrollButtonChange: z.useCallback((e) => {
			e && m.current === !0 && (b(), y?.(), m.current = !1);
		}, [b, y]),
		children: /* @__PURE__ */ (0, V.jsx)("div", {
			ref: c,
			style: {
				display: "flex",
				flexDirection: "column",
				position: "fixed",
				zIndex: x
			},
			children: /* @__PURE__ */ (0, V.jsx)(w.div, {
				...i,
				ref: d,
				style: {
					boxSizing: "border-box",
					maxHeight: "100%",
					...i.style
				}
			})
		})
	});
}, "SelectItemAlignedPosition")), Ve = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let { __scopeSelect: n, align: r = "start", collisionPadding: i = Y, ...a } = e, o = xe(n);
	return /* @__PURE__ */ (0, V.jsx)(d, {
		...o,
		...a,
		ref: t,
		align: r,
		collisionPadding: i,
		style: {
			boxSizing: "border-box",
			...a.style,
			"--radix-select-content-transform-origin": "var(--radix-popper-transform-origin)",
			"--radix-select-content-available-width": "var(--radix-popper-available-width)",
			"--radix-select-content-available-height": "var(--radix-popper-available-height)",
			"--radix-select-trigger-width": "var(--radix-popper-anchor-width)",
			"--radix-select-trigger-height": "var(--radix-popper-anchor-height)"
		}
	});
}, "SelectPopperPosition")), [He, Ue] = K(J, {}), We = "SelectViewport", Ge = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let { __scopeSelect: n, nonce: r, ...i } = e, a = X(We, n), o = Ue(We, n), s = g(t, a.onViewportChange), c = z.useRef(0);
	return /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [/* @__PURE__ */ (0, V.jsx)("style", {
		dangerouslySetInnerHTML: { __html: "[data-radix-select-viewport]{scrollbar-width:none;-ms-overflow-style:none;-webkit-overflow-scrolling:touch;}[data-radix-select-viewport]::-webkit-scrollbar{display:none}" },
		nonce: r
	}), /* @__PURE__ */ (0, V.jsx)(W.Slot, {
		scope: n,
		children: /* @__PURE__ */ (0, V.jsx)(w.div, {
			"data-radix-select-viewport": "",
			role: "presentation",
			...i,
			ref: s,
			style: {
				position: "relative",
				flex: 1,
				overflow: "hidden auto",
				...i.style
			},
			onScroll: b(i.onScroll, (e) => {
				let t = e.currentTarget, { contentWrapper: n, shouldExpandOnScrollRef: r } = o;
				if (r?.current && n) {
					let e = Math.abs(c.current - t.scrollTop);
					if (e > 0) {
						let r = window.innerHeight - Y * 2, i = parseFloat(n.style.minHeight), a = parseFloat(n.style.height), o = Math.max(i, a);
						if (o < r) {
							let i = o + e, a = Math.min(r, i), s = i - a;
							n.style.height = a + "px", n.style.bottom === "0px" && (t.scrollTop = s > 0 ? s : 0, n.style.justifyContent = "flex-end");
						}
					}
				}
				c.current = t.scrollTop;
			})
		})
	})] });
}, "SelectViewport")), [Ke, qe] = K("SelectGroup"), Je = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let { __scopeSelect: n, ...r } = e, i = O();
	return /* @__PURE__ */ (0, V.jsx)(Ke, {
		scope: n,
		id: i,
		children: /* @__PURE__ */ (0, V.jsx)(w.div, {
			role: "group",
			"aria-labelledby": i,
			...r,
			ref: t
		})
	});
}, "SelectGroup")), Ye = "SelectLabel", Xe = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let { __scopeSelect: n, ...r } = e, i = qe(Ye, n);
	return /* @__PURE__ */ (0, V.jsx)(w.div, {
		id: i.id,
		...r,
		ref: t
	});
}, "SelectLabel")), Ze = "SelectItem", [Qe, $e] = K(Ze), et = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let { __scopeSelect: n, value: r, disabled: i = !1, textValue: a, ...o } = e, s = q(Ze, n), c = X(Ze, n), l = s.value === r, [u, d] = z.useState(a ?? ""), [f, p] = z.useState(!1), m = g(t, j((e) => c.itemRefCallback?.(e, r, i))), h = O(), _ = z.useRef("touch"), v = /* @__PURE__ */ H(() => {
		i || (s.onValueChange(r), s.onOpenChange(!1));
	}, "handleSelect");
	return /* @__PURE__ */ (0, V.jsx)(Qe, {
		scope: n,
		value: r,
		disabled: i,
		textId: h,
		isSelected: l,
		onItemTextChange: z.useCallback((e) => {
			d((t) => t || (e?.textContent ?? "").trim());
		}, []),
		children: /* @__PURE__ */ (0, V.jsx)(W.ItemSlot, {
			scope: n,
			value: r,
			disabled: i,
			textValue: u,
			children: /* @__PURE__ */ (0, V.jsx)(w.div, {
				role: "option",
				"aria-labelledby": h,
				"data-highlighted": f ? "" : void 0,
				"aria-selected": l && f,
				"data-state": l ? "checked" : "unchecked",
				"aria-disabled": i || void 0,
				"data-disabled": i ? "" : void 0,
				tabIndex: i ? void 0 : -1,
				...o,
				ref: m,
				onFocus: b(o.onFocus, () => p(!0)),
				onBlur: b(o.onBlur, () => p(!1)),
				onClick: b(o.onClick, () => {
					_.current !== "mouse" && v();
				}),
				onPointerUp: b(o.onPointerUp, () => {
					_.current === "mouse" && v();
				}),
				onPointerDown: b(o.onPointerDown, (e) => {
					_.current = e.pointerType;
				}),
				onPointerMove: b(o.onPointerMove, (e) => {
					_.current = e.pointerType, i ? c.onItemLeave?.() : _.current === "mouse" && e.currentTarget.focus({ preventScroll: !0 });
				}),
				onPointerLeave: b(o.onPointerLeave, (e) => {
					e.currentTarget === document.activeElement && c.onItemLeave?.();
				}),
				onKeyDown: b(o.onKeyDown, (e) => {
					i || e.target !== e.currentTarget || c.searchRef?.current !== "" && e.key === " " || (ve.includes(e.key) && v(), e.key === " " && e.preventDefault());
				})
			})
		})
	});
}, "SelectItem")), Z = "SelectItemText", tt = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let { __scopeSelect: n, className: r, style: i, ...a } = e, o = q(Z, n), s = X(Z, n), c = $e(Z, n), l = we(Z, n), [u, d] = z.useState(null), f = j((e) => s.itemTextRefCallback?.(e, c.value, c.disabled)), p = g(t, d, c.onItemTextChange, f), m = u?.textContent, h = z.useMemo(() => /* @__PURE__ */ (0, V.jsx)("option", {
		value: c.value,
		disabled: c.disabled,
		children: m
	}, c.value), [
		c.disabled,
		c.value,
		m
	]), { onNativeOptionAdd: _, onNativeOptionRemove: v } = l;
	return F(() => (_(h), () => v(h)), [
		_,
		v,
		h
	]), /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [/* @__PURE__ */ (0, V.jsx)(w.span, {
		id: c.textId,
		...a,
		ref: p
	}), c.isSelected && o.valueNode && !o.valueNodeHasChildren && !Q(o.value) ? ue.createPortal(a.children, o.valueNode) : null] });
}, "SelectItemText")), nt = "SelectItemIndicator", rt = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let { __scopeSelect: n, ...r } = e;
	return $e(nt, n).isSelected ? /* @__PURE__ */ (0, V.jsx)(w.span, {
		"aria-hidden": !0,
		...r,
		ref: t
	}) : null;
}, "SelectItemIndicator")), it = "SelectScrollUpButton", at = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let n = X(it, e.__scopeSelect), r = Ue(it, e.__scopeSelect), [i, a] = z.useState(!1), o = g(t, r.onScrollButtonChange);
	return F(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollTop > 0;
				a(e);
			};
			H(e, "handleScroll");
			let t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), i ? /* @__PURE__ */ (0, V.jsx)(ct, {
		...e,
		ref: o,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop -= t.offsetHeight);
		}
	}) : null;
}, "SelectScrollUpButton")), ot = "SelectScrollDownButton", st = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let n = X(ot, e.__scopeSelect), r = Ue(ot, e.__scopeSelect), [i, a] = z.useState(!1), o = g(t, r.onScrollButtonChange);
	return F(() => {
		if (n.viewport && n.isPositioned) {
			let e = function() {
				let e = t.scrollHeight - t.clientHeight, n = Math.ceil(t.scrollTop) < e;
				a(n);
			};
			H(e, "handleScroll");
			let t = n.viewport;
			return e(), t.addEventListener("scroll", e), () => t.removeEventListener("scroll", e);
		}
	}, [n.viewport, n.isPositioned]), i ? /* @__PURE__ */ (0, V.jsx)(ct, {
		...e,
		ref: o,
		onAutoScroll: () => {
			let { viewport: e, selectedItem: t } = n;
			e && t && (e.scrollTop += t.offsetHeight);
		}
	}) : null;
}, "SelectScrollDownButton")), ct = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function(e, t) {
	let { __scopeSelect: n, onAutoScroll: r, ...i } = e, a = X("SelectScrollButton", n), o = z.useRef(null), s = G(n), c = z.useCallback(() => {
		o.current !== null && (window.clearInterval(o.current), o.current = null);
	}, []);
	return z.useEffect(() => () => c(), [c]), F(() => {
		s().find((e) => e.ref.current === document.activeElement)?.ref.current?.scrollIntoView({ block: "nearest" });
	}, [s]), /* @__PURE__ */ (0, V.jsx)(w.div, {
		"aria-hidden": !0,
		...i,
		ref: t,
		style: {
			flexShrink: 0,
			...i.style
		},
		onPointerDown: b(i.onPointerDown, () => {
			o.current === null && (o.current = window.setInterval(r, 50));
		}),
		onPointerMove: b(i.onPointerMove, () => {
			a.onItemLeave?.(), o.current === null && (o.current = window.setInterval(r, 50));
		}),
		onPointerLeave: b(i.onPointerLeave, () => {
			c();
		})
	});
}, "SelectScrollButtonImpl")), lt = "SelectBubbleInput", ut = /* @__PURE__ */ z.forwardRef(/* @__PURE__ */ H(function({ __scopeSelect: e, ...t }, n) {
	let r = q(lt, e), { value: i, onValueChange: a, required: o, disabled: s, name: c, autoComplete: l, form: u } = r, { nativeOptions: d, nativeSelectKey: f } = r, p = z.useRef(null), m = g(n, p), h = i ?? "", _ = pe(h), v = Array.from(d).some((e) => (e.props.value ?? "") === "");
	return z.useEffect(() => {
		let e = p.current;
		if (!e) return;
		let t = window.HTMLSelectElement.prototype, n = Object.getOwnPropertyDescriptor(t, "value").set;
		if (_ !== h && n) {
			let t = new Event("change", { bubbles: !0 });
			n.call(e, h), e.dispatchEvent(t);
		}
	}, [_, h]), /* @__PURE__ */ (0, V.jsxs)(w.select, {
		"aria-hidden": !0,
		required: o,
		tabIndex: -1,
		name: c,
		autoComplete: l,
		disabled: s,
		form: u,
		onChange: (e) => a(e.target.value),
		...t,
		style: {
			...S,
			...t.style
		},
		ref: m,
		defaultValue: h,
		children: [Q(i) && !v ? /* @__PURE__ */ (0, V.jsx)("option", { value: "" }) : null, Array.from(d)]
	}, f);
}, "SelectBubbleInput"));
function dt(e) {
	return typeof e == "function";
}
H(dt, "isFunction");
function Q(e) {
	return e === "" || e === void 0;
}
H(Q, "shouldShowPlaceholder");
function ft(e) {
	let t = j(e), n = z.useRef(""), r = z.useRef(0), i = z.useCallback((e) => {
		let i = n.current + e;
		t(i), (/* @__PURE__ */ H((function e(t) {
			n.current = t, window.clearTimeout(r.current), t !== "" && (r.current = window.setTimeout(() => e(""), 1e3));
		}), "updateSearch"))(i);
	}, [t]), a = z.useCallback(() => {
		n.current = "", window.clearTimeout(r.current);
	}, []);
	return z.useEffect(() => () => window.clearTimeout(r.current), []), [
		n,
		i,
		a
	];
}
H(ft, "useTypeaheadSearch");
function pt(e, t, n) {
	let r = t.length > 1 && Array.from(t).every((e) => e === t[0]) ? t[0] : t, i = n ? e.indexOf(n) : -1, a = mt(e, Math.max(i, 0));
	r.length === 1 && (a = a.filter((e) => e !== n));
	let o = a.find((e) => e.textValue.toLowerCase().startsWith(r.toLowerCase()));
	return o === n ? void 0 : o;
}
H(pt, "findNextItem");
function mt(e, t) {
	return e.map((n, r) => e[(t + r) % e.length]);
}
H(mt, "wrapArray");
var ht = l("arrow-right", [["path", {
	d: "M5 12h14",
	key: "1ays0h"
}], ["path", {
	d: "m12 5 7 7-7 7",
	key: "xquz4c"
}]]), gt = l("arrow-up", [["path", {
	d: "m5 12 7-7 7 7",
	key: "hav0vg"
}], ["path", {
	d: "M12 19V5",
	key: "x0mq9r"
}]]), _t = l("chevron-up", [["path", {
	d: "m18 15-6-6-6 6",
	key: "153udz"
}]]), vt = "Ask MapSVG", yt = 160;
function bt(e) {
	e.style.height = "auto", e.style.height = `${Math.min(e.scrollHeight, yt)}px`, e.style.overflowY = e.scrollHeight > yt ? "auto" : "hidden";
}
function xt({ value: e = "", placeholder: t = vt, disabled: a = !1, error: o, attachments: s, hasAttachments: l = !1, attachmentMenu: u, onChange: d, onSubmit: f }) {
	let p = (0, z.useRef)(null), m = (0, z.useRef)(null);
	(0, z.useLayoutEffect)(() => {
		m.current && bt(m.current);
	}, [e]), (0, z.useLayoutEffect)(() => {
		let e = p.current, t = e?.closest("[data-ai-chat-overlay]");
		if (!e || !(t instanceof HTMLElement)) return;
		let n = () => t.style.setProperty("--ai-chat-composer-height", `${e.offsetHeight}px`), r = new ResizeObserver(n);
		return r.observe(e), n(), () => {
			r.disconnect(), t.style.removeProperty("--ai-chat-composer-height");
		};
	}, []);
	let h = !a && (!!e.trim() || l), g = (e) => {
		e?.preventDefault(), h && f?.();
	}, _ = (e) => {
		e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && !a && (e.preventDefault(), g());
	}, v = /* @__PURE__ */ (0, V.jsx)(i, {
		type: "button",
		variant: "ghost",
		size: "icon",
		className: "size-9 rounded-full p-0",
		disabled: a || !u,
		"aria-label": "Add attachment",
		children: /* @__PURE__ */ (0, V.jsx)(ae, { className: "size-5" })
	});
	return /* @__PURE__ */ (0, V.jsxs)("form", {
		ref: p,
		"data-slot": "chat-composer",
		className: "pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[816px] px-6 pt-2 pb-3",
		onSubmit: g,
		children: [
			o ? /* @__PURE__ */ (0, V.jsx)("div", {
				className: "pointer-events-auto mb-2 rounded-xl border border-destructive/30 bg-background px-3 py-2 text-sm text-destructive shadow-sm",
				children: o
			}) : null,
			s ? /* @__PURE__ */ (0, V.jsx)("div", {
				className: "pointer-events-auto mb-2 px-1",
				children: s
			}) : null,
			/* @__PURE__ */ (0, V.jsxs)(le, {
				className: "pointer-events-auto items-end rounded-3xl border-[0.5px] border-black/10 bg-background p-[5.5px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] has-[[data-slot=input-group-control]:focus-visible]:border-black/15 has-[[data-slot=input-group-control]:focus-visible]:ring-0 dark:border-white/15 dark:bg-background dark:has-[[data-slot=input-group-control]:focus-visible]:border-white/25",
				children: [
					/* @__PURE__ */ (0, V.jsx)(se, {
						align: "inline-start",
						className: "py-0 pl-0 has-[>button]:ml-0",
						children: u ? /* @__PURE__ */ (0, V.jsxs)(n, { children: [/* @__PURE__ */ (0, V.jsx)(r, {
							asChild: !0,
							children: v
						}), /* @__PURE__ */ (0, V.jsx)(c, {
							side: "top",
							align: "start",
							className: "min-w-56 rounded-xl p-1.5",
							children: u
						})] }) : v
					}),
					/* @__PURE__ */ (0, V.jsx)(ce, {
						ref: m,
						rows: 1,
						placeholder: t,
						value: e,
						disabled: a,
						className: "min-h-9 max-h-40 min-w-0 border-none px-2 py-2 text-sm leading-5 shadow-none ring-0 focus-visible:ring-0",
						onChange: (e) => d?.(e.target.value),
						onInput: (e) => bt(e.currentTarget),
						onKeyDown: _
					}),
					/* @__PURE__ */ (0, V.jsx)(se, {
						align: "inline-end",
						className: "mr-0 py-0 pr-0 has-[>button]:mr-0",
						children: /* @__PURE__ */ (0, V.jsxs)(i, {
							type: "submit",
							variant: "default",
							size: "icon",
							className: "size-9 rounded-full p-0",
							disabled: !h,
							children: [/* @__PURE__ */ (0, V.jsx)(gt, { className: "size-5" }), /* @__PURE__ */ (0, V.jsx)("span", {
								className: "sr-only",
								children: "Send"
							})]
						})
					})
				]
			})
		]
	});
}
//#endregion
//#region src/lib/premium-features.ts
var $ = {
	gallery: {
		title: "Gallery",
		summary: "Show image galleries in your map details and popovers.",
		description: "Present record images as thumbnails, sliders, or a full-size lightbox.",
		benefits: [
			"Choose gallery layouts and styles.",
			"Use image fields in Details and Popover templates.",
			"Open full-size images in a lightbox."
		]
	},
	data_source_posts: {
		title: "WordPress data sources",
		summary: "Connect WordPress posts and custom post types to your maps.",
		description: "Use posts, pages, WooCommerce products, and other post types as a map data source.",
		benefits: [
			"Connect existing WordPress content.",
			"Use post metadata and taxonomy fields.",
			"Keep map records linked to WordPress posts."
		]
	},
	ai_assistant: {
		title: "AI Assistant",
		summary: "Create and edit maps by describing what you need.",
		description: "Turn your ideas into a map through a conversation. Ask MapSVG to create a map, change the current draft, or explain how a feature works.",
		benefits: [
			"Describe changes to your map's appearance, layout, and content in your own words.",
			"Get help with settings while you work on your map.",
			"Review changes in the preview and publish when you are ready."
		]
	},
	directory: {
		title: "Directory",
		summary: "Give visitors a list to browse alongside your map.",
		description: "Help visitors discover places and regions in a directory connected to your map. Show useful information in each list item so they can find the right result.",
		benefits: [
			"Display map regions or your location records as a list.",
			"Connect list items to map highlights, popovers, and details.",
			"Organize results into categories for easier browsing."
		]
	},
	mobile_toolbar: {
		title: "Mobile Toolbar",
		summary: "Let mobile visitors switch between the map and list.",
		description: "Give your map and directory room on small screens. Visitors can switch views without losing their place in the map.",
		benefits: [
			"Add Map and List buttons to your mobile layout.",
			"Choose which containers appear in each view and which view opens first.",
			"Return to the map when a visitor selects a directory item."
		]
	},
	filters: {
		title: "Additional filters",
		summary: "Help visitors narrow results by category, status, or keywords.",
		description: "Make larger maps easier to explore with filters tailored to your data. Combine address search with choices and keyword search to help visitors find relevant results.",
		benefits: [
			"Add dropdowns, radio buttons, and checkbox groups.",
			"Search records by text as well as by address.",
			"Choose which data field each filter searches."
		]
	},
	javascript: {
		title: "JavaScript editor",
		summary: "Add custom behavior to map events and interactions.",
		description: "Extend your map with JavaScript when built-in settings do not cover your workflow. Write handlers for clicks, zoom changes, and other map events.",
		benefits: [
			"Run your own code when visitors interact with regions or markers.",
			"Connect map events to other parts of your website.",
			"Customize what happens after a template renders."
		]
	},
	css: {
		title: "CSS editor",
		summary: "Fine-tune the appearance of your map and its components.",
		description: "Match your map to your website with custom CSS. Adjust details beyond the visual settings, from spacing and typography to the appearance of individual components.",
		benefits: [
			"Add styles for the whole map or an individual template.",
			"Refine colors, spacing, typography, and responsive styling.",
			"Preview your styling changes while you edit."
		]
	},
	templates: {
		title: "Custom template editor",
		summary: "Choose exactly what visitors see in popovers and details.",
		description: "Design your own content with HTML and Handlebars templates. Use fields from your records to present each place or region in the format your website needs.",
		benefits: [
			"Build custom popovers, tooltips, details, and directory items.",
			"Show images, descriptions, links, and other record fields.",
			"Use conditions and lists to adapt the content to each record."
		]
	},
	csv: {
		title: "CSV and Google Sheets import",
		summary: "Bring many records onto your map without entering them one by one.",
		description: "Populate your collections from a CSV file or Google Sheet. Match source columns to your fields, then import new records or update existing ones.",
		benefits: [
			"Upload a CSV file or connect a published Google Sheet or remote CSV URL.",
			"Map columns to collection fields and match existing records by ID.",
			"Schedule recurring imports to keep remote data up to date."
		]
	},
	show_another_map: {
		title: "Show another map",
		summary: "Let visitors explore another map by clicking a region or marker.",
		description: "Build a path from an overview to more detailed maps. For example, let visitors click a country to explore its regions, then open a local map.",
		benefits: [
			"Choose the destination map from a record field.",
			"Display the next map in a selected container in your layout.",
			"Let visitors return to the previous map."
		]
	},
	clustering: {
		title: "Clustering",
		summary: "Keep maps readable when many markers overlap.",
		description: "Group nearby markers into clusters so visitors can understand a busy map at a glance. Individual locations become visible as they zoom in.",
		benefits: [
			"Replace overlapping markers with a cluster showing their count.",
			"Explore dense areas by zooming in to see individual locations.",
			"Customize cluster appearance to match your map."
		]
	}
};
function St(e) {
	return e === "mobileToolbar" ? "mobile_toolbar" : e === "directory" ? "directory" : null;
}
//#endregion
//#region src/components/PremiumFeaturePlaceholder.tsx
function Ct({ className: e }) {
	return /* @__PURE__ */ (0, V.jsx)("span", {
		className: o("shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground", e),
		children: "Premium"
	});
}
function wt({ info: e, footerStart: t, onUpgrade: n }) {
	return /* @__PURE__ */ (0, V.jsxs)(V.Fragment, { children: [
		/* @__PURE__ */ (0, V.jsxs)(C, { children: [
			/* @__PURE__ */ (0, V.jsx)("div", { children: /* @__PURE__ */ (0, V.jsx)(Ct, {}) }),
			/* @__PURE__ */ (0, V.jsx)(T, { children: e.title }),
			/* @__PURE__ */ (0, V.jsx)(A, { children: e.description })
		] }),
		e.benefits.length ? /* @__PURE__ */ (0, V.jsx)("ul", {
			className: "space-y-2 text-sm",
			children: e.benefits.map((e) => /* @__PURE__ */ (0, V.jsxs)("li", {
				className: "flex items-start gap-2",
				children: [/* @__PURE__ */ (0, V.jsx)(s, {
					className: "mt-0.5 size-4 shrink-0 text-muted-foreground",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, V.jsx)("span", { children: e })]
			}, e))
		}) : null,
		/* @__PURE__ */ (0, V.jsxs)(R, { children: [t, /* @__PURE__ */ (0, V.jsx)(I, {
			asChild: !0,
			children: /* @__PURE__ */ (0, V.jsxs)(i, {
				size: "sm",
				onClick: () => {
					n?.(), _();
				},
				children: ["Upgrade ", /* @__PURE__ */ (0, V.jsx)(ht, {})]
			})
		})] })
	] });
}
function Tt({ info: e }) {
	let t = (0, z.useRef)(!1);
	return /* @__PURE__ */ (0, V.jsx)(x, {
		className: "max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md",
		onCloseAutoFocus: (e) => {
			t.current && e.preventDefault();
		},
		children: /* @__PURE__ */ (0, V.jsx)(wt, {
			info: e,
			onUpgrade: () => {
				t.current = !0;
			}
		})
	});
}
function Et({ feature: e, onBack: t, onUpgrade: n }) {
	return /* @__PURE__ */ (0, V.jsx)(wt, {
		info: $[e],
		onUpgrade: n,
		footerStart: t ? /* @__PURE__ */ (0, V.jsx)(i, {
			size: "sm",
			variant: "outline",
			onClick: t,
			children: "Back"
		}) : void 0
	});
}
function Dt({ feature: e, open: t, onOpenChange: n }) {
	return /* @__PURE__ */ (0, V.jsx)(N, {
		open: t,
		onOpenChange: n,
		children: /* @__PURE__ */ (0, V.jsx)(Tt, { info: $[e] })
	});
}
function Ot({ feature: e, title: t, description: n, disabledInputPlaceholder: r, compact: a = !1, className: s }) {
	let c = e ? $[e] : {
		title: t ?? "Premium feature",
		summary: n ?? "Explore more ways to customize your map.",
		description: n ?? "Explore more ways to customize your map.",
		benefits: []
	};
	return /* @__PURE__ */ (0, V.jsxs)("div", {
		className: o("relative flex min-h-0 flex-col", !a && "h-full", s),
		"data-premium-feature": !0,
		"data-ai-chat-overlay": r ? "" : void 0,
		children: [/* @__PURE__ */ (0, V.jsx)("div", {
			className: o("flex min-h-0 items-center justify-center p-3", !a && "flex-1 overflow-auto"),
			children: /* @__PURE__ */ (0, V.jsxs)("div", {
				className: "max-w-xs space-y-3 text-center",
				children: [
					/* @__PURE__ */ (0, V.jsxs)("div", {
						className: "flex flex-wrap items-center justify-center gap-2 text-xs font-medium",
						children: [/* @__PURE__ */ (0, V.jsx)("span", { children: c.title }), /* @__PURE__ */ (0, V.jsx)(Ct, {})]
					}),
					/* @__PURE__ */ (0, V.jsx)("p", {
						className: "text-xs leading-relaxed text-muted-foreground",
						children: c.summary
					}),
					/* @__PURE__ */ (0, V.jsxs)(N, { children: [/* @__PURE__ */ (0, V.jsx)(ne, {
						asChild: !0,
						children: /* @__PURE__ */ (0, V.jsx)(i, {
							size: "xs",
							variant: "outline",
							children: "Learn more"
						})
					}), /* @__PURE__ */ (0, V.jsx)(Tt, { info: c })] })
				]
			})
		}), r ? /* @__PURE__ */ (0, V.jsx)(xt, {
			placeholder: r,
			disabled: !0
		}) : null]
	});
}
function kt({ feature: e, compact: t = !1 }) {
	return /* @__PURE__ */ (0, V.jsx)(Ot, {
		feature: e,
		compact: t
	});
}
function At({ feature: e }) {
	return /* @__PURE__ */ (0, V.jsxs)(N, { children: [/* @__PURE__ */ (0, V.jsx)(ne, {
		asChild: !0,
		children: /* @__PURE__ */ (0, V.jsxs)("button", {
			type: "button",
			className: "flex w-full items-center justify-between gap-2 py-1 text-left text-xs text-muted-foreground hover:text-foreground",
			children: [/* @__PURE__ */ (0, V.jsx)("span", { children: $[e].title }), /* @__PURE__ */ (0, V.jsx)(Ct, {})]
		})
	}), /* @__PURE__ */ (0, V.jsx)(Tt, { info: $[e] })] });
}
//#endregion
//#region src/components/ui/select.tsx
function jt({ ...e }) {
	return /* @__PURE__ */ (0, V.jsx)(Ee, {
		"data-slot": "select",
		...e
	});
}
function Mt({ ...e }) {
	return /* @__PURE__ */ (0, V.jsx)(Je, {
		"data-slot": "select-group",
		...e
	});
}
function Nt({ ...e }) {
	return /* @__PURE__ */ (0, V.jsx)(Ae, {
		"data-slot": "select-value",
		...e
	});
}
function Pt({ className: e, size: t = "default", children: n, ...r }) {
	return /* @__PURE__ */ (0, V.jsxs)(Oe, {
		"data-slot": "select-trigger",
		"data-size": t,
		className: o("flex w-fit items-center justify-between gap-1.5 rounded-[5px] border border-input bg-background px-2 py-1 text-xs whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-7 data-[size=sm]:h-6 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground", e),
		...r,
		children: [n, /* @__PURE__ */ (0, V.jsx)(je, {
			asChild: !0,
			children: /* @__PURE__ */ (0, V.jsx)(oe, { className: "size-3.5 opacity-50" })
		})]
	});
}
function Ft({ className: e, children: t, position: n = "item-aligned", align: r = "center", ...i }) {
	let a = D();
	return /* @__PURE__ */ (0, V.jsx)(Pe, {
		container: a,
		children: /* @__PURE__ */ (0, V.jsxs)(Fe, {
			"data-slot": "select-content",
			className: o("relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", n === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", e),
			position: n,
			align: r,
			...i,
			children: [
				/* @__PURE__ */ (0, V.jsx)(Rt, {}),
				/* @__PURE__ */ (0, V.jsx)(Ge, {
					className: o("p-1", n === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
					children: t
				}),
				/* @__PURE__ */ (0, V.jsx)(zt, {})
			]
		})
	});
}
function It({ className: e, ...t }) {
	return /* @__PURE__ */ (0, V.jsx)(Xe, {
		"data-slot": "select-label",
		className: o("px-2 py-1.5 text-xs text-muted-foreground", e),
		...t
	});
}
function Lt({ className: e, children: t, ...n }) {
	return /* @__PURE__ */ (0, V.jsxs)(et, {
		"data-slot": "select-item",
		className: o("relative flex w-full cursor-default items-center gap-1.5 rounded-[4px] py-1 pr-7 pl-2 text-xs outline-hidden select-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", e),
		...n,
		children: [/* @__PURE__ */ (0, V.jsx)("span", {
			"data-slot": "select-item-indicator",
			className: "absolute right-2 flex size-3.5 items-center justify-center",
			children: /* @__PURE__ */ (0, V.jsx)(rt, { children: /* @__PURE__ */ (0, V.jsx)(s, { className: "size-4" }) })
		}), /* @__PURE__ */ (0, V.jsx)(tt, { children: t })]
	});
}
function Rt({ className: e, ...t }) {
	return /* @__PURE__ */ (0, V.jsx)(at, {
		"data-slot": "select-scroll-up-button",
		className: o("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ (0, V.jsx)(_t, { className: "size-4" })
	});
}
function zt({ className: e, ...t }) {
	return /* @__PURE__ */ (0, V.jsx)(st, {
		"data-slot": "select-scroll-down-button",
		className: o("flex cursor-default items-center justify-center py-1", e),
		...t,
		children: /* @__PURE__ */ (0, V.jsx)(oe, { className: "size-4" })
	});
}
//#endregion
export { _t as _, It as a, Ct as c, Et as d, Dt as f, vt as g, St as h, Lt as i, At as l, $ as m, Ft as n, Pt as o, kt as p, Mt as r, Nt as s, jt as t, Ot as u, B as v, pe as y };

//# sourceMappingURL=select-CucA4zeB.js.map