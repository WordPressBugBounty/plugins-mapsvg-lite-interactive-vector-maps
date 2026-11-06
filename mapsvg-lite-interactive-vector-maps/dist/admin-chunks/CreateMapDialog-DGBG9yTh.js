import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Cr as t, Ct as n, Fr as r, Lr as i, Pr as a, St as o, bi as s, bt as ee, cr as c, dr as te, fr as ne, hi as l, kt as re, or as ie, pn as u, ur as ae, wt as d, xt as oe, yr as f, yt as se } from "./admin-startup-CJQ1Yfhw.js";
import { i as p, n as m, r as h, t as g } from "./tabs-DM1yy0Iq.js";
import { r as ce, t as le } from "./use-admin-catalog-BUkvZw5b.js";
import { t as ue } from "./upload-CDud-YK9.js";
import { i as de, n as fe, t as pe } from "./input-group-CrbV0HG1.js";
import { t as me } from "./svg-assets-KRTVsE_G.js";
var he = a("map-pinned", [
	["path", {
		d: "M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 0 1-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0 1 12 0",
		key: "11u0oz"
	}],
	["circle", {
		cx: "12",
		cy: "8",
		r: "2",
		key: "1822b1"
	}],
	["path", {
		d: "M8.714 14h-3.71a1 1 0 0 0-.948.683l-2.004 6A1 1 0 0 0 3 22h18a1 1 0 0 0 .948-1.316l-2-6a1 1 0 0 0-.949-.684h-3.712",
		key: "q8zwxj"
	}]
]), _ = /* @__PURE__ */ e(s(), 1), v = l();
function ge({ files: e, label: t, query: n, onQueryChange: r, onSelect: a, selectedUrl: o, disabled: s, actions: ee }) {
	let c = (0, _.useMemo)(() => {
		let t = n.trim().toLowerCase();
		return e.filter((e) => !t || [
			e.name,
			e.pathShort,
			e.relativeUrl
		].join(" ").toLowerCase().includes(t));
	}, [e, n]), te = u().homeUrl || window.location.origin;
	return /* @__PURE__ */ (0, v.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col gap-3",
		children: [/* @__PURE__ */ (0, v.jsxs)("div", {
			className: "flex shrink-0 flex-wrap items-center gap-2",
			children: [/* @__PURE__ */ (0, v.jsxs)(pe, {
				className: "min-w-0 flex-1",
				"data-disabled": s || void 0,
				children: [/* @__PURE__ */ (0, v.jsx)(fe, { children: /* @__PURE__ */ (0, v.jsx)(f, { "aria-hidden": "true" }) }), /* @__PURE__ */ (0, v.jsx)(de, {
					"aria-label": `Search ${t}`,
					placeholder: `Search ${t}...`,
					value: n,
					disabled: s,
					onChange: (e) => r(e.target.value)
				})]
			}), ee]
		}), /* @__PURE__ */ (0, v.jsx)("div", {
			"data-slot": "map-file-gallery",
			className: "min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1",
			children: c.length === 0 ? /* @__PURE__ */ (0, v.jsxs)("p", {
				className: "py-12 text-center text-sm text-muted-foreground",
				children: [
					"No ",
					t,
					" found."
				]
			}) : /* @__PURE__ */ (0, v.jsx)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
				children: c.map((e) => /* @__PURE__ */ (0, v.jsxs)("button", {
					type: "button",
					"aria-label": `Select ${e.name}`,
					"aria-pressed": o == null ? void 0 : o === e.relativeUrl,
					"data-map-file": e.relativeUrl,
					disabled: s,
					className: i("flex min-w-0 cursor-pointer flex-col overflow-hidden rounded-xl border bg-background text-left hover:bg-accent disabled:pointer-events-none disabled:opacity-50", o === e.relativeUrl && "border-primary ring-2 ring-primary/30"),
					onClick: () => a(e),
					children: [/* @__PURE__ */ (0, v.jsx)("div", {
						className: "flex h-32 w-full items-center justify-center bg-muted/20 p-3",
						children: /* @__PURE__ */ (0, v.jsx)("img", {
							src: new URL(e.relativeUrl, te).href,
							alt: "",
							loading: "lazy",
							className: "max-h-full max-w-full object-contain"
						})
					}), /* @__PURE__ */ (0, v.jsxs)("div", {
						className: "min-w-0 border-t px-3 py-2",
						children: [/* @__PURE__ */ (0, v.jsx)("div", {
							className: "truncate text-sm font-medium",
							children: e.name
						}), /* @__PURE__ */ (0, v.jsx)("div", {
							className: "truncate text-xs text-muted-foreground",
							children: e.pathShort
						})]
					})]
				}, e.assetId ? `asset:${e.assetId}` : e.relativeUrl))
			})
		})]
	});
}
//#endregion
//#region src/components/CreateMapDialog.tsx
function y(e) {
	return e.replace(/\.[^.]+$/, "").trim() || "New map";
}
function _e(e) {
	return e.origin ?? (e.pathShort.includes("uploads/") || e.relativeUrl.includes("/uploads/") ? "uploads" : "library");
}
var b = "Upload an SVG containing geoViewBox calibration and a Google map screenshot/template background.";
function x(e) {
	let t = e;
	return t?.geoCalibrated === !0 && t.googleOverlay === !0;
}
function S(e) {
	try {
		let t = new URL(e, u().homeUrl || window.location.origin);
		if (t.protocol === "http:" || t.protocol === "https:") return t.href;
	} catch {}
}
function C({ open: e, svgFiles: i, imageFiles: a, onOpenChange: s, onUploaded: l, onImageUploaded: f, onDownloadGoogleOverlay: de, onCreated: fe }) {
	let pe = (0, _.useId)(), C = (0, _.useRef)(null), w = (0, _.useRef)(null), [T, ve] = (0, _.useState)("svg"), [E, D] = (0, _.useState)("empty"), [ye, O] = (0, _.useState)(!1), [k, A] = (0, _.useState)("library"), [be, j] = (0, _.useState)(""), [M, N] = (0, _.useState)(null), [P, F] = (0, _.useState)(null), [xe, I] = (0, _.useState)(null), [L, R] = (0, _.useState)(!1), [z, B] = (0, _.useState)(null), [Se, V] = (0, _.useState)(i), [Ce, H] = (0, _.useState)(!1), U = u().deferredCatalogs === !0, W = le("svg", U && e && T === "svg", i), we = le("image", U && e && T === "image", a), Te = U ? W.files : Se, G = T === "image" ? we : W, Ee = U ? G.loading : Ce, K = (0, _.useRef)(0), q = (0, _.useRef)(!1), J = (0, _.useRef)(!0), Y = (0, _.useRef)(e);
	Y.current = e, (0, _.useEffect)(() => {
		if (V(i), U || !e || !u().svgRegistryEnabled) return;
		let t = new AbortController();
		return H(!0), me(i, t.signal).then((e) => {
			t.signal.aborted || (V(e), N((t) => {
				let n = t;
				return n?.assetId ? e.find((e) => e.assetId === n.assetId) ?? t : t;
			}));
		}).catch((e) => {
			t.signal.aborted || B(e instanceof Error ? e.message : "The SVG library could not be loaded.");
		}).finally(() => {
			t.signal.aborted || H(!1);
		}), () => {
			t.abort(), H(!1);
		};
	}, [
		e,
		i,
		U
	]), (0, _.useEffect)(() => {
		!U || W.loading || W.error || N((e) => {
			let t = e;
			return t?.assetId ? W.files.find((e) => e.assetId === t.assetId) ?? e : e;
		});
	}, [
		U,
		W.loading,
		W.error,
		W.files
	]), (0, _.useEffect)(() => (J.current = !0, () => {
		J.current = !1, K.current += 1;
	}), []), (0, _.useEffect)(() => {
		K.current += 1, q.current = !1, R(!1), O(!1), B(null), e && (ve("svg"), D("empty"), A("library"), j(""), N(null), F(null), I(null));
	}, [e]);
	let X = (e) => {
		e || (K.current += 1, Y.current = !1), s(e);
	}, Z = () => {
		N(null), F(null), I(null), B(null), j(""), C.current && (C.current.value = "");
	}, De = (e) => {
		N(e), F(null), I(null), B(null);
	}, Oe = async (e) => {
		if (q.current) return;
		q.current = !0, R(!0), O(!0), N(null), F(null), B(null);
		let t = K.current, n = () => J.current && Y.current && K.current === t;
		try {
			let t = await d(e, !0);
			if (!n()) return;
			if (!x(t)) throw Error(b);
			if (!S(t.relativeUrl)) throw Error("The uploaded overlay does not have a valid preview URL.");
			l(t), N(t);
		} catch (e) {
			n() && B(e instanceof Error ? e.message : "Overlay upload failed.");
		} finally {
			n() && (q.current = !1, R(!1), O(!1));
		}
	}, ke = async (e, t) => {
		if (q.current) return;
		if (T === "google" && E === "overlay" && (!x(t) || !S(t.relativeUrl))) {
			B(b);
			return;
		}
		if (T !== "google" && !t && !e) {
			B(`Choose ${T === "image" ? "an image" : "an SVG file"} from the gallery or upload one.`);
			return;
		}
		q.current = !0, R(!0), B(null);
		let r = K.current, i = () => J.current && Y.current && K.current === r;
		try {
			let r = T === "google" && E === "empty" || e ? null : t, a = e ? null : xe;
			if (e && T !== "google") {
				if (r = T === "image" ? await n(e) : await d(e), !i()) return;
				T === "image" ? f(r) : l(r), N(r), F(null), A("uploads"), C.current && (C.current.value = "");
			}
			if (!i()) return;
			if (T === "google" && r && !x(r)) throw Error(b);
			if (T === "image" && r && !a) {
				if (a = await oe(r), !i()) return;
				I(a);
			}
			if (!i()) return;
			if (T === "google" || r?.googleOverlay) {
				let e = u().options;
				if (typeof e?.google_api_key != "string" || !e.google_api_key.trim()) throw Error("Configure your Google Maps API key in Settings before creating a Google map.");
			}
			let s = T === "google" && !r ? await se("Google map") : T === "google" ? await ee(y(r.name), r.relativeUrl) : await o(y(r.name), a?.relativeUrl ?? r.relativeUrl);
			if (!J.current) return;
			fe(s, i()), i() && X(!1);
		} catch (e) {
			i() && B(e instanceof Error ? e.message : "Map creation failed.");
		} finally {
			i() && (q.current = !1, R(!1));
		}
	}, Ae = T === "image" ? "Upload image file" : T === "google" ? "Upload Google Maps overlay SVG" : "Upload SVG file", Q = /* @__PURE__ */ (0, v.jsx)(re, {
		ref: C,
		id: `${pe}-file`,
		"aria-label": Ae,
		type: "file",
		accept: T === "image" ? ".png,.jpg,.jpeg,.gif,.webp,image/png,image/jpeg,image/gif,image/webp" : ".svg,image/svg+xml",
		disabled: L,
		className: "hidden",
		onChange: (e) => {
			let t = e.target.files?.[0] ?? null;
			e.currentTarget.value = "", F(t), N(null), I(null), B(null), T === "google" && E === "overlay" && t && Oe(t);
		}
	}), je = T === "image" ? (U ? we.files : a).filter((e) => _e(e) === "uploads" && /^uploads\/[^/]+$/.test(e.pathShort)) : Te.filter((e) => _e(e) === k), $ = T === "google" && E === "overlay" && x(M) ? S(M.relativeUrl) : void 0, Me = L || T === "google" && E === "overlay" && !$;
	return /* @__PURE__ */ (0, v.jsx)(ie, {
		open: e,
		onOpenChange: X,
		children: /* @__PURE__ */ (0, v.jsxs)(c, {
			className: "flex h-[85vh] max-h-[900px] flex-col overflow-hidden sm:max-w-5xl",
			"aria-describedby": void 0,
			onOpenAutoFocus: (e) => {
				e.preventDefault(), w.current?.focus();
			},
			children: [/* @__PURE__ */ (0, v.jsx)(te, {
				className: "shrink-0",
				children: /* @__PURE__ */ (0, v.jsx)(ne, { children: "Create map" })
			}), /* @__PURE__ */ (0, v.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault(), ke(P, M);
				},
				className: "flex min-h-0 flex-1 flex-col gap-4",
				children: [
					/* @__PURE__ */ (0, v.jsxs)(g, {
						value: T,
						onValueChange: (e) => {
							L || (ve(e), D("empty"), A(e === "image" ? "uploads" : "library"), Z());
						},
						className: "min-h-0 flex-1 gap-8",
						children: [/* @__PURE__ */ (0, v.jsxs)(h, {
							"aria-label": "Map type",
							className: "!h-11 w-full shrink-0",
							children: [
								/* @__PURE__ */ (0, v.jsxs)(p, {
									ref: w,
									value: "svg",
									disabled: L,
									className: "text-sm",
									children: [/* @__PURE__ */ (0, v.jsx)(t, {}), "SVG map"]
								}),
								/* @__PURE__ */ (0, v.jsxs)(p, {
									value: "image",
									disabled: L,
									className: "text-sm",
									children: [/* @__PURE__ */ (0, v.jsx)(ce, {}), "Image map"]
								}),
								/* @__PURE__ */ (0, v.jsxs)(p, {
									value: "google",
									disabled: L,
									className: "text-sm",
									children: [/* @__PURE__ */ (0, v.jsx)(he, {}), "Google map"]
								})
							]
						}), /* @__PURE__ */ (0, v.jsx)(m, {
							value: T,
							className: "flex min-h-0 flex-1 flex-col gap-4",
							onWheel: (e) => e.stopPropagation(),
							onTouchMove: (e) => e.stopPropagation(),
							children: T === "google" ? /* @__PURE__ */ (0, v.jsxs)(g, {
								value: E,
								onValueChange: (e) => {
									L || (D(e), Z());
								},
								className: "min-h-0 flex-1 gap-4",
								children: [/* @__PURE__ */ (0, v.jsx)("div", {
									"data-slot": "google-map-type-scroll",
									className: "min-w-0 max-w-full shrink-0 overflow-x-auto overscroll-x-contain",
									children: /* @__PURE__ */ (0, v.jsxs)(h, {
										"aria-label": "Google map type",
										className: "!h-9 w-max",
										children: [/* @__PURE__ */ (0, v.jsx)(p, {
											value: "empty",
											disabled: L,
											className: "flex-none whitespace-nowrap px-4 text-sm",
											children: "Google Map"
										}), /* @__PURE__ */ (0, v.jsx)(p, {
											value: "overlay",
											disabled: L,
											className: "flex-none whitespace-nowrap px-4 text-sm",
											children: "Google Map with custom overlay"
										})]
									})
								}), /* @__PURE__ */ (0, v.jsx)(m, {
									value: E,
									"data-slot": "google-map-creation",
									className: "min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain",
									children: E === "empty" ? /* @__PURE__ */ (0, v.jsx)(v.Fragment, { children: /* @__PURE__ */ (0, v.jsx)("p", {
										className: "text-sm text-muted-foreground",
										children: "Click “Create map” below to create an empty Google map, then add locations."
									}) }) : /* @__PURE__ */ (0, v.jsxs)(v.Fragment, { children: [
										/* @__PURE__ */ (0, v.jsx)("p", {
											className: "text-sm text-muted-foreground",
											children: "Download a geo-calibrated SVG template, draw your overlay in a vector editor, and upload the SVG here. MapSVG places it on Google Maps automatically. The template screenshot is removed from the live overlay; your original upload is kept."
										}),
										/* @__PURE__ */ (0, v.jsxs)("div", {
											"data-slot": "google-overlay-actions",
											className: "flex flex-wrap gap-3",
											children: [
												/* @__PURE__ */ (0, v.jsx)(r, {
													type: "button",
													variant: "outline",
													disabled: L,
													onClick: de,
													children: "Download template"
												}),
												Q,
												/* @__PURE__ */ (0, v.jsxs)(r, {
													type: "button",
													variant: "outline",
													disabled: L,
													onClick: () => C.current?.click(),
													children: [/* @__PURE__ */ (0, v.jsx)(ue, {}), "Upload SVG overlay"]
												})
											]
										}),
										M && $ ? /* @__PURE__ */ (0, v.jsxs)("div", {
											"data-slot": "google-overlay-preview",
											className: "space-y-2",
											children: [/* @__PURE__ */ (0, v.jsx)("p", {
												className: "text-sm",
												children: M.name
											}), /* @__PURE__ */ (0, v.jsx)("img", {
												src: $,
												alt: `Google overlay preview: ${M.name}`,
												className: "max-h-96 max-w-full rounded-lg border object-contain"
											})]
										}) : null
									] })
								})]
							}) : /* @__PURE__ */ (0, v.jsxs)(v.Fragment, { children: [
								T === "svg" ? /* @__PURE__ */ (0, v.jsx)(g, {
									value: k,
									onValueChange: (e) => {
										L || (A(e), Z());
									},
									className: "shrink-0",
									children: /* @__PURE__ */ (0, v.jsxs)(h, {
										"aria-label": "File catalog",
										className: "!h-9",
										children: [/* @__PURE__ */ (0, v.jsx)(p, {
											value: "library",
											disabled: L,
											className: "px-4 text-sm",
											children: "Library"
										}), /* @__PURE__ */ (0, v.jsx)(p, {
											value: "uploads",
											disabled: L,
											className: "px-4 text-sm",
											children: "Uploads"
										})]
									})
								}) : null,
								Q,
								P ? /* @__PURE__ */ (0, v.jsxs)("p", {
									"data-slot": "pending-map-file",
									className: "shrink-0 text-sm",
									children: ["Selected upload: ", P.name]
								}) : null,
								U && G.loading ? /* @__PURE__ */ (0, v.jsx)("p", {
									role: "status",
									className: "text-sm text-muted-foreground",
									children: "Loading files…"
								}) : null,
								U && G.error ? /* @__PURE__ */ (0, v.jsxs)("div", {
									role: "alert",
									className: "text-sm text-destructive",
									children: [
										G.error,
										" ",
										/* @__PURE__ */ (0, v.jsx)(r, {
											type: "button",
											variant: "link",
											onClick: G.retry,
											children: "Retry"
										})
									]
								}) : null,
								/* @__PURE__ */ (0, v.jsx)(ge, {
									files: je,
									label: T === "image" ? "image files" : "SVG files",
									query: be,
									onQueryChange: j,
									selectedUrl: M?.relativeUrl ?? "",
									onSelect: De,
									disabled: L || Ee || !!(U && G.error),
									actions: T === "image" || k === "uploads" ? /* @__PURE__ */ (0, v.jsxs)(r, {
										type: "button",
										variant: "outline",
										disabled: L,
										onClick: () => C.current?.click(),
										children: [/* @__PURE__ */ (0, v.jsx)(ue, {}), T === "image" ? "Upload image" : "Upload SVG"]
									}) : void 0
								})
							] })
						})]
					}),
					z ? /* @__PURE__ */ (0, v.jsx)("p", {
						role: "alert",
						className: "shrink-0 text-sm text-destructive",
						children: z
					}) : null,
					/* @__PURE__ */ (0, v.jsxs)(ae, {
						className: "shrink-0",
						children: [/* @__PURE__ */ (0, v.jsx)(r, {
							type: "button",
							variant: "outline",
							onClick: () => X(!1),
							children: "Cancel"
						}), /* @__PURE__ */ (0, v.jsx)(r, {
							type: "submit",
							disabled: Me || Ee,
							children: L ? ye ? "Uploading…" : "Creating…" : "Create map"
						})]
					})
				]
			})]
		})
	});
}
//#endregion
export { C as CreateMapDialog };

//# sourceMappingURL=CreateMapDialog-DGBG9yTh.js.map