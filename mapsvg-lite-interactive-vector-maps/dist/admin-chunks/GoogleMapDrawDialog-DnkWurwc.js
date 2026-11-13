import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Fr as t, bi as n, cr as r, fr as i, hi as a, kt as o, or as s, pn as c } from "./admin-startup-D4zZmPq_.js";
import { a as l, i as u, n as d, t as f } from "./card-AP_nfw5Y.js";
import { n as p, t as m } from "./admin-frame-DxRvvShf.js";
//#region src/lib/google-map-viewport.ts
var h = /* @__PURE__ */ e(n(), 1);
async function g(e, t) {
	let n = new AbortController(), r = !1, i = null, a = null, o, s, l = !1, u, d = () => n.abort(t.signal.reason), f = () => {
		r || (r = !0, u && clearTimeout(u), t.signal.removeEventListener("abort", d), n.abort(new DOMException("Google Map closed.", "AbortError")), i && a && i.google?.maps?.event?.clearInstanceListeners(a), i && i.gm_authFailure === s && (i.gm_authFailure = o), e.removeAttribute("srcdoc"), e.src = "about:blank", a = null, i = null);
	};
	n.signal.addEventListener("abort", f, { once: !0 }), t.signal.addEventListener("abort", d, { once: !0 }), t.signal.aborted && d();
	let h = () => {
		if (r || n.signal.aborted) throw n.signal.reason ?? new DOMException("Google Map closed.", "AbortError");
	}, g = async (e) => {
		h();
		let t = () => {};
		try {
			return await Promise.race([e, new Promise((e, r) => {
				t = () => r(n.signal.reason), n.signal.addEventListener("abort", t, { once: !0 });
			})]);
		} finally {
			n.signal.removeEventListener("abort", t);
		}
	};
	try {
		h(), u = setTimeout(() => n.abort(/* @__PURE__ */ Error("The Google Map viewport took too long to load. Please try again.")), 35e3), m(e), h(), i = e.contentWindow;
		let d = e.contentDocument;
		if (!i || !d) throw Error("The Google Map frame is unavailable.");
		d.body.style.overflow = "hidden";
		let _ = d.createElement("div");
		_.id = "mapsvg-google-map-fullscreen", _.style.cssText = "width:100%;height:100%;overflow:hidden", d.body.replaceChildren(_), d.addEventListener("keydown", (e) => {
			e.key === "Escape" && (e.preventDefault(), t.onCloseRequest?.());
		}), o = i.gm_authFailure, s = () => {
			l = !0, r || (t.onReady(!1), t.onError("Google Maps API key is incorrect or is not authorized for this site.")), o?.(), n.abort(/* @__PURE__ */ Error("Google Maps API key is incorrect or is not authorized for this site."));
		}, i.gm_authFailure = s, await g(p(i, n.signal)), h();
		let v = i.google.maps;
		if (!v.Map) throw Error("Google Maps API loaded without its map constructor.");
		let y = d.getElementById("mapsvg-google-map-fullscreen");
		a = new v.Map(y, {
			zoom: 2,
			center: new v.LatLng(-34.397, 150.644),
			mapTypeId: "roadmap",
			fullscreenControl: !1,
			mapTypeControl: !0,
			scaleControl: !0,
			scrollwheel: !0,
			streetViewControl: !1,
			zoomControl: !0
		});
		let b = !1, x = !1, S, C = new Promise((e) => {
			S = e;
		}), w = () => {
			if (r) return;
			let e = !l && b && x && !!a.getBounds();
			t.onReady(e), e && S();
		};
		v.event.addListener(a, "idle", () => {
			x = !0, w();
		}), v.event.addListener(a, "tilesloaded", () => {
			b = !0, w();
		}), v.event.addListener(a, "bounds_changed", () => {
			x = !1, b = !1, t.onReady(!1);
		}), v.event.addListener(a, "maptypeid_changed", () => {
			b = !1, t.onReady(!1);
		});
		let T = new v.Geocoder(), E = c(), D = new URL(E.pluginUrl.replace(/\/?$/, "/"), document.baseURI);
		if (!E.pluginUrl || D.origin !== window.location.origin) throw Error("The Google Map screenshot assets are unavailable.");
		let O = (e) => {
			let t = new URL(e, D);
			return E.version && t.searchParams.set("v", E.version), t.href;
		}, k = (e) => g(new Promise((t, n) => {
			let r = d.createElement("script");
			r.src = e, r.onload = () => {
				r.onload = null, r.onerror = null, t();
			}, r.onerror = () => {
				r.onload = null, r.onerror = null, n(/* @__PURE__ */ Error("The Google Map screenshot assets could not load."));
			}, d.head.appendChild(r);
		}));
		if (await Promise.all([k(O("js/vendor/html2canvas/html2canvas.min.js")), k(O("js/mapsvg-admin/shared/google-map-svg.js"))]), h(), !i.html2canvas || !i.MapSVGGoogleMapSvg) throw Error("The Google Map screenshot assets are unavailable.");
		return await g(C), h(), u && clearTimeout(u), {
			async search(e) {
				return h(), g(new Promise((t, n) => {
					T.geocode({ address: e }, (e, r) => {
						r === "OK" ? t(e ?? []) : r === "ZERO_RESULTS" ? t([]) : n(/* @__PURE__ */ Error(`Address search failed (${r}).`));
					});
				}));
			},
			select(e) {
				h();
				let t = e.geometry.bounds ?? e.geometry.viewport;
				t ? a.fitBounds(t) : e.geometry.location && (a.setCenter(e.geometry.location), a.setZoom(14));
			},
			async capture() {
				if (h(), l || !b || !x) throw Error("The Google Map viewport is not ready to download.");
				let e = await g(i.MapSVGGoogleMapSvg.capture(y, a, i.html2canvas));
				return h(), e;
			},
			dispose: f
		};
	} catch (e) {
		throw f(), e;
	}
}
function _(e) {
	let t = URL.createObjectURL(new Blob([e], { type: "image/svg+xml;charset=utf-8" })), n = document.createElement("a");
	n.href = t, n.download = "mapsvg.svg", document.body.appendChild(n);
	try {
		n.click();
	} finally {
		n.remove(), setTimeout(() => URL.revokeObjectURL(t), 1e3);
	}
}
//#endregion
//#region src/components/GoogleMapDrawDialog.tsx
var v = a();
function y(e, t) {
	return e && typeof e == "object" && "message" in e && typeof e.message == "string" ? e.message : t;
}
function b({ open: e, onOpenChange: n }) {
	let [a, c] = (0, h.useState)(null), [p, m] = (0, h.useState)(!1), [b, x] = (0, h.useState)(!1), [S, C] = (0, h.useState)(!1), [w, T] = (0, h.useState)(null), [E, D] = (0, h.useState)(""), [O, k] = (0, h.useState)([]), [A, j] = (0, h.useState)(!1), [M, N] = (0, h.useState)(null), [P, F] = (0, h.useState)(-1), I = (0, h.useRef)(null), L = (0, h.useRef)(0), R = (0, h.useRef)(""), z = (0, h.useCallback)((e) => I.current === e && !e.abort.signal.aborted, []), B = (0, h.useCallback)(() => {
		let e = I.current;
		I.current = null, L.current++, e?.abort.abort(), e?.viewport?.dispose();
	}, []), V = (0, h.useCallback)(() => {
		B(), n(!1);
	}, [B, n]), H = (0, h.useRef)(V);
	(0, h.useLayoutEffect)(() => {
		H.current = V;
	}, [V]), (0, h.useLayoutEffect)(() => (e || B(), () => B()), [e, B]), (0, h.useEffect)(() => {
		if (!e || !a) return;
		let t = {
			abort: new AbortController(),
			busy: !1
		};
		return I.current = t, m(!1), x(!1), C(!1), T(null), D(""), k([]), N(null), j(!1), F(-1), R.current = "", g(a, {
			signal: t.abort.signal,
			onReady: (e) => {
				z(t) && x(e);
			},
			onError: (e) => {
				z(t) && (x(!1), T(e));
			},
			onCloseRequest: () => {
				z(t) && H.current();
			}
		}).then((e) => {
			if (!z(t)) {
				e.dispose();
				return;
			}
			t.viewport = e, m(!0);
		}).catch((e) => {
			z(t) && (x(!1), T(y(e, "The Google Map could not load.")));
		}), () => {
			I.current === t ? B() : (t.abort.abort(), t.viewport?.dispose());
		};
	}, [
		e,
		a,
		z,
		B
	]), (0, h.useEffect)(() => {
		let t = I.current, n = ++L.current;
		k([]), N(null), j(!1), F(-1);
		let r = E.trim();
		if (!e || !p || !t?.viewport || r.length < 2 || r === R.current) return;
		let i = setTimeout(() => {
			j(!0), t.viewport.search(r).then((e) => {
				!z(t) || L.current !== n || (k(e), j(!1), e.length || N("No matching addresses found."));
			}).catch((e) => {
				!z(t) || L.current !== n || (j(!1), N(y(e, "Address search failed.")));
			});
		}, 500);
		return () => clearTimeout(i);
	}, [
		E,
		p,
		e,
		z
	]);
	let U = (e) => {
		let t = I.current;
		!t?.viewport || !z(t) || t.busy || (R.current = e.formatted_address, L.current++, D(e.formatted_address), k([]), F(-1), j(!1), N(null), t.viewport.select(e));
	}, W = async () => {
		let e = I.current;
		if (!(!p || !b || !e?.viewport || e.busy || !z(e))) {
			e.busy = !0, C(!0), T(null);
			try {
				let t = await e.viewport.capture();
				z(e) && _(t);
			} catch (t) {
				z(e) && T(y(t, "The SVG could not be downloaded."));
			} finally {
				z(e) && (e.busy = !1, C(!1));
			}
		}
	};
	return /* @__PURE__ */ (0, v.jsx)(s, {
		open: e,
		onOpenChange: (e) => {
			e || V();
		},
		children: /* @__PURE__ */ (0, v.jsxs)(r, {
			"data-slot": "google-map-draw-dialog",
			showCloseButton: !1,
			"aria-describedby": void 0,
			onPointerDownOutside: (e) => e.preventDefault(),
			className: "top-0 left-0 block h-dvh w-screen max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-none border-0 p-0 shadow-none duration-0 data-[state=open]:animate-none data-[state=closed]:animate-none sm:max-w-none",
			children: [e ? /* @__PURE__ */ (0, v.jsx)("iframe", {
				ref: c,
				title: "Google Map viewport",
				inert: S,
				className: "absolute inset-0 h-full w-full border-0"
			}) : null, /* @__PURE__ */ (0, v.jsxs)(f, {
				"data-slot": "google-map-draw-controls",
				className: "absolute top-4 right-4 z-10 max-h-[calc(100dvh-2rem)] w-[360px] max-w-[calc(100%-2rem)] gap-3 overflow-y-auto overscroll-contain py-4",
				onWheel: (e) => e.stopPropagation(),
				onTouchMove: (e) => e.stopPropagation(),
				children: [
					/* @__PURE__ */ (0, v.jsxs)(l, {
						className: "px-4",
						children: [/* @__PURE__ */ (0, v.jsx)(i, { children: "Download overlay template" }), /* @__PURE__ */ (0, v.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Enter an address, then zoom and pan the map to frame the area you need. Click Download, then open the SVG in a vector editor such as Inkscape or Adobe Illustrator."
						})]
					}),
					/* @__PURE__ */ (0, v.jsxs)(d, {
						className: "space-y-2 px-4",
						children: [
							/* @__PURE__ */ (0, v.jsx)(o, {
								"aria-label": "Address",
								role: "combobox",
								"aria-autocomplete": "list",
								"aria-expanded": O.length > 0,
								"aria-controls": "mapsvg-google-address-results",
								"aria-activedescendant": P >= 0 ? `mapsvg-google-address-${P}` : void 0,
								placeholder: "Enter address…",
								value: E,
								disabled: !p || S,
								onChange: (e) => {
									R.current = "", D(e.target.value);
								},
								onKeyDown: (e) => {
									e.key === "ArrowDown" && O.length ? (e.preventDefault(), F((e) => (e + 1) % O.length)) : e.key === "ArrowUp" && O.length ? (e.preventDefault(), F((e) => (e + O.length - 1) % O.length)) : e.key === "Enter" && O.length ? (e.preventDefault(), U(O[Math.max(0, P)])) : e.key === "Escape" && O.length && (e.preventDefault(), e.stopPropagation(), k([]));
								}
							}),
							O.length ? /* @__PURE__ */ (0, v.jsx)("ul", {
								id: "mapsvg-google-address-results",
								role: "listbox",
								"aria-label": "Matching addresses",
								className: "max-h-64 overflow-y-auto overscroll-contain rounded-md border bg-popover p-1 shadow-md",
								children: O.map((e, t) => /* @__PURE__ */ (0, v.jsx)("li", { children: /* @__PURE__ */ (0, v.jsx)("button", {
									type: "button",
									role: "option",
									disabled: S,
									id: `mapsvg-google-address-${t}`,
									"aria-selected": P === t,
									className: "w-full rounded-sm p-2 text-left text-sm hover:bg-accent focus:bg-accent",
									onClick: () => U(e),
									children: e.formatted_address
								}) }, `${e.formatted_address}-${t}`))
							}) : null,
							A ? /* @__PURE__ */ (0, v.jsx)("p", {
								role: "status",
								className: "mt-2 text-xs text-muted-foreground",
								children: "Searching addresses…"
							}) : null,
							M ? /* @__PURE__ */ (0, v.jsx)("p", {
								role: "alert",
								className: "mt-2 text-xs text-destructive",
								children: M
							}) : null,
							w ? /* @__PURE__ */ (0, v.jsx)("p", {
								role: "alert",
								className: "text-sm text-destructive",
								children: w
							}) : p ? null : /* @__PURE__ */ (0, v.jsx)("p", {
								role: "status",
								className: "text-sm text-muted-foreground",
								children: "Loading Google Map…"
							})
						]
					}),
					/* @__PURE__ */ (0, v.jsxs)(u, {
						"data-slot": "google-map-draw-footer",
						className: "justify-end gap-2 px-4",
						children: [/* @__PURE__ */ (0, v.jsx)(t, {
							type: "button",
							variant: "outline",
							onClick: V,
							children: "Close"
						}), /* @__PURE__ */ (0, v.jsx)(t, {
							type: "button",
							disabled: !p || !b || S,
							onClick: () => void W(),
							children: S ? "Downloading…" : "Download"
						})]
					})
				]
			})]
		})
	});
}
//#endregion
export { b as GoogleMapDrawDialog };

//# sourceMappingURL=GoogleMapDrawDialog-DnkWurwc.js.map