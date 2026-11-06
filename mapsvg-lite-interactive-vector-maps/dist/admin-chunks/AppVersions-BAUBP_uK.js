import { n as e, r as t } from "./rolldown-runtime-Dqa2HsxW.js";
import { Fr as n, Ln as r, Lr as i, Mr as a, Pr as o, _r as s, bi as c, br as l, cr as u, dr as ee, dt as te, fr as ne, ft as re, gn as d, gt as ie, hi as ae, hn as f, ht as oe, i as p, kr as se, kt as ce, lr as le, lt as ue, mt as de, or as fe, pt as pe, ur as me, ut as he, vn as m, wr as ge } from "./admin-startup-CJQ1Yfhw.js";
import { a as _e, i as ve, n as ye, r as be, t as xe } from "./popover-sNDyp8_1.js";
import { t as Se } from "./circle-alert-lva21-3w.js";
import { t as h } from "./external-link-Cet6QFcd.js";
import { t as Ce } from "./git-branch-D-sROAxI.js";
import { t as we } from "./badge-DeTgd5ec.js";
import { a as Te, i as g, n as Ee, o as _, r as v, t as De } from "./table-De7IgFWb.js";
var Oe = o("arrow-down-to-line", [
	["path", {
		d: "M12 17V3",
		key: "1cwfxf"
	}],
	["path", {
		d: "m6 11 6 6 6-6",
		key: "12ii2o"
	}],
	["path", {
		d: "M19 21H5",
		key: "150jfl"
	}]
]), y = o("arrow-up-from-line", [
	["path", {
		d: "m18 9-6-6-6 6",
		key: "kcunyi"
	}],
	["path", {
		d: "M12 3v14",
		key: "7cf3v8"
	}],
	["path", {
		d: "M5 21h14",
		key: "11awu3"
	}]
]), b = o("clock", [["circle", {
	cx: "12",
	cy: "12",
	r: "10",
	key: "1mglay"
}], ["path", {
	d: "M12 6v6l4 2",
	key: "mmk7yg"
}]]), ke = o("cloud-off", [
	["path", {
		d: "M10.94 5.274A7 7 0 0 1 15.71 10h1.79a4.5 4.5 0 0 1 4.222 6.057",
		key: "1uxyv8"
	}],
	["path", {
		d: "M18.796 18.81A4.5 4.5 0 0 1 17.5 19H9A7 7 0 0 1 5.79 5.78",
		key: "99tcn7"
	}],
	["path", {
		d: "m2 2 20 20",
		key: "1ooewy"
	}]
]), Ae = o("diff", [
	["path", {
		d: "M12 3v14",
		key: "7cf3v8"
	}],
	["path", {
		d: "M5 10h14",
		key: "elsbfy"
	}],
	["path", {
		d: "M5 21h14",
		key: "11awu3"
	}]
]), x = o("git-pull-request-arrow", [
	["circle", {
		cx: "5",
		cy: "6",
		r: "3",
		key: "1qnov2"
	}],
	["path", {
		d: "M5 9v12",
		key: "ih889a"
	}],
	["circle", {
		cx: "19",
		cy: "18",
		r: "3",
		key: "1qljk2"
	}],
	["path", {
		d: "m15 9-3-3 3-3",
		key: "1lwv8l"
	}],
	["path", {
		d: "M12 6h5a2 2 0 0 1 2 2v7",
		key: "1yj91y"
	}]
]), S = /* @__PURE__ */ t(c(), 1), C = "mapsvg:preview-pointerdown";
function je(e, t) {
	if (t.aborted) return;
	let n = () => window.dispatchEvent(new CustomEvent(C));
	e.addEventListener("pointerdown", n, !0), t.addEventListener("abort", () => e.removeEventListener("pointerdown", n, !0), { once: !0 });
}
//#endregion
//#region src/lib/app-options-delta.ts
function Me(e, t) {
	let n = [];
	function r(e, t, i) {
		if (e === t) return;
		let a = (e) => typeof e == "object" && !!e && !Array.isArray(e);
		if (a(e) && a(t)) for (let n of [.../* @__PURE__ */ new Set([...Object.keys(e), ...Object.keys(t)])].sort()) !i && n === "useShadowRoot" || r(e[n], t[n], `${i}/${n.replace(/~/g, "~0").replace(/\//g, "~1")}`);
		else if (Array.isArray(e) && Array.isArray(t)) for (let n = 0; n < Math.max(e.length, t.length); n++) r(e[n], t[n], `${i}/${n}`);
		else n.push({
			path: i,
			before: e,
			after: t
		});
	}
	return r(e, t, ""), n;
}
//#endregion
//#region src/components/AppVersions.tsx
var Ne = /* @__PURE__ */ e({
	AppDraftConflictActions: () => Fe,
	AppVersions: () => A
}), w = ae();
function Pe(e) {
	let t = r();
	t?.id === e.mapId && e.capture(t.getData());
}
var T = "bg-transparent text-muted-foreground shadow-none transition-colors hover:bg-transparent hover:text-foreground focus-visible:bg-transparent focus-visible:text-foreground data-[state=open]:text-foreground dark:hover:bg-transparent", E = /* @__PURE__ */ new WeakSet(), D = "Saved on this device. Waiting to sync with the server.";
function O({ label: e, tooltip: t = e, children: r, className: a, ...o }) {
	return /* @__PURE__ */ (0, w.jsxs)(f, { children: [/* @__PURE__ */ (0, w.jsx)(m, {
		asChild: !0,
		children: /* @__PURE__ */ (0, w.jsx)(n, {
			type: "button",
			size: "icon-xs",
			variant: "ghost",
			"aria-label": e,
			className: i(T, a),
			...o,
			children: r
		})
	}), /* @__PURE__ */ (0, w.jsx)(d, { children: t })] });
}
function Fe({ disabled: e, onPull: t, onBranch: r }) {
	return /* @__PURE__ */ (0, w.jsxs)("div", {
		className: "flex shrink-0 flex-wrap gap-2",
		children: [/* @__PURE__ */ (0, w.jsxs)(n, {
			type: "button",
			size: "xs",
			variant: "outline",
			disabled: e,
			onClick: t,
			children: [/* @__PURE__ */ (0, w.jsx)(x, { "aria-hidden": "true" }), "Pull changes"]
		}), /* @__PURE__ */ (0, w.jsxs)(n, {
			type: "button",
			size: "xs",
			variant: "outline",
			disabled: e,
			onClick: r,
			children: [/* @__PURE__ */ (0, w.jsx)(Ce, { "aria-hidden": "true" }), "Branch into a new draft"]
		})]
	});
}
function Ie({ href: e, size: t = "xs", className: r }) {
	return /* @__PURE__ */ (0, w.jsx)(n, {
		asChild: !0,
		size: t,
		variant: "secondary",
		className: i("bg-blue-50 font-semibold text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-200 dark:hover:bg-blue-900", r),
		children: /* @__PURE__ */ (0, w.jsxs)("a", {
			href: e,
			children: [/* @__PURE__ */ (0, w.jsx)(h, { "aria-hidden": "true" }), "Open in old editor"]
		})
	});
}
var Le = "pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100", Re = "pr-2 group-hover:pr-28 group-focus-within:pr-28 [@media(hover:none)]:pr-28";
function k({ title: e, label: t, disabled: n, onSave: r, onCancel: i }) {
	let [a, o] = (0, S.useState)(e), s = (0, S.useRef)(!1), c = (0, S.useRef)(!1);
	async function l() {
		if (s.current || c.current) return;
		let t = a.trim();
		if (!t || t === e) {
			c.current = !0, i();
			return;
		}
		s.current = !0;
		try {
			await r(t) && (c.current = !0);
		} finally {
			s.current = !1;
		}
	}
	return /* @__PURE__ */ (0, w.jsx)(ce, {
		"aria-label": t,
		autoFocus: !0,
		disabled: n,
		value: a,
		onFocus: (e) => e.currentTarget.select(),
		onChange: (e) => o(e.target.value),
		onBlur: () => void l(),
		onKeyDown: (e) => {
			e.nativeEvent.isComposing || (e.key === "Enter" && (e.preventDefault(), e.stopPropagation(), l()), e.key === "Escape" && (e.preventDefault(), e.stopPropagation(), s.current || (c.current = !0, i())));
		}
	});
}
function A({ session: e, disabled: t, onReplace: r, onCheckout: o, onPull: c, open: ae, onOpenChange: ce, overflowAnchor: x }) {
	let [je, Ne] = (0, S.useState)(!1), T = ae ?? je, A = ce ?? Ne, j = (0, S.useRef)(!1), M = (0, S.useRef)(!1), [N, ze] = (0, S.useState)(!1), [P, F] = (0, S.useState)(null), [I, L] = (0, S.useState)(null), [R, z] = (0, S.useState)(null), [B, Be] = (0, S.useState)(null), V = e.active, H = V?.draft.migration ? V.draft.id : null, U = (0, S.useRef)(null), [Ve, W] = (0, S.useState)(null);
	(0, S.useEffect)(() => {
		if (!e.ready) return;
		let n = H === null ? null : `${e.mapId}:${H}`;
		if (n === null) {
			U.current = null, W(null);
			return;
		}
		t || n === U.current || (U.current = n, A(!1), W(H));
	}, [
		e,
		e.ready,
		H,
		t,
		A
	]);
	let G = "The server has a newer version of this draft. Your local copy is retained.", K = V?.conflicted ? G : V?.dirty && !V.localSaved ? V.localError : void 0, He = V && (V.localSaved || !V.dirty), Ue = e.offline && V?.localSaved, q = e.busy ? "Saving draft…" : K ?? (He ? Ue ? D : "Draft saved" : "Saving draft…"), We = e.offline;
	(0, S.useEffect)(() => {
		We ? q === D && !E.has(e) && (E.add(e), p.info(D)) : E.delete(e) && p.success("Connection to the server restored.");
	}, [
		e,
		We,
		q
	]);
	let J = N || t || e.busy || e.transitioning, Y = J || e.offline;
	async function X(t, n = !1) {
		Pe(e), ze(!0), F(null), n && e.setTransitioning(!0);
		try {
			return await t(), n && r(), !0;
		} catch (e) {
			return F(e instanceof Error ? e.message : String(e)), !1;
		} finally {
			ze(!1), n && e.setTransitioning(!1);
		}
	}
	let Ge = (t) => t === e.publishedVersionId ? `[mapsvg id="${e.mapId}"]` : `[mapsvg id="${e.mapId}" version="${t}"]`;
	async function Ke(e) {
		F(null);
		try {
			await navigator.clipboard.writeText(Ge(e)), p.success("Shortcode copied");
		} catch {
			F("Could not copy shortcode. Check your browser clipboard permissions.");
		}
	}
	async function qe(t) {
		await X(async () => {
			let n = e.copies.get(t), r = structuredClone(n.snapshot), i = e.publishedVersionId, a = i === null ? {} : (await e.versionSnapshot(i)).options;
			Be({
				title: n.draft.title,
				changes: Me(a, r.options)
			}), A(!1);
		});
	}
	function Z(t, n) {
		X(() => e.create(void 0, t, n), !0);
	}
	(0, S.useEffect)(() => {
		T && e.ready && !e.offline && e.refreshHistory().catch((e) => F(String(e)));
	}, [T, e]), (0, S.useEffect)(() => {
		if (!T) return;
		let e = () => {
			M.current = !0, A(!1), L(null);
		};
		return window.addEventListener(C, e), () => window.removeEventListener(C, e);
	}, [T, A]);
	let Je = e.versions.filter((t) => t.published_at || t.kind === "publication" || t.id === e.publishedVersionId), Q = Je.find((t) => t.id === e.publishedVersionId), Ye = Je.filter((t) => t.id !== e.publishedVersionId);
	function $(t, n) {
		let r = I?.kind === "version" && I.id === t.id;
		return /* @__PURE__ */ (0, w.jsxs)("div", {
			"data-version-id": t.id,
			"data-version-status": n ? "published" : "history",
			className: i("group relative flex min-h-8 min-w-0 items-center gap-2 rounded-md pl-2 text-xs hover:bg-muted/50", r ? "pr-2" : "pr-2 hover:pr-28 focus-within:pr-28 [@media(hover:none)]:pr-28"),
			children: [
				r ? /* @__PURE__ */ (0, w.jsx)(k, {
					label: "Version name",
					title: I.title,
					disabled: N,
					onCancel: () => L(null),
					onSave: async (n) => {
						let r = await X(() => e.renameVersion(t.id, n, I.title));
						return r && L(null), r;
					}
				}) : /* @__PURE__ */ (0, w.jsx)("span", {
					className: "min-w-0 flex-1 truncate font-normal",
					title: t.title,
					children: t.title
				}),
				/* @__PURE__ */ (0, w.jsxs)(we, {
					variant: "secondary",
					className: i("shrink-0 text-[10px]", n && "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300", !r && "group-hover:hidden group-focus-within:hidden [@media(hover:none)]:hidden"),
					children: [
						t.engine === 8 ? "v8 · " : "",
						"version ",
						t.id
					]
				}),
				r ? null : /* @__PURE__ */ (0, w.jsxs)("div", {
					className: Le,
					children: [
						n ? /* @__PURE__ */ (0, w.jsx)(O, {
							label: "Unpublish",
							disabled: Y,
							onClick: () => void X(() => e.unpublish(t.id)),
							children: /* @__PURE__ */ (0, w.jsx)(Oe, {})
						}) : /* @__PURE__ */ (0, w.jsx)(O, {
							label: "Publish version",
							tooltip: "Publish",
							disabled: Y,
							onClick: () => void X(async () => {
								o(await e.checkout(t.id));
							}),
							children: /* @__PURE__ */ (0, w.jsx)(y, {})
						}),
						/* @__PURE__ */ (0, w.jsx)(O, {
							label: "Rename version",
							tooltip: "Rename",
							disabled: Y,
							onClick: () => {
								L({
									kind: "version",
									id: t.id,
									title: t.title
								}), F(null);
							},
							children: /* @__PURE__ */ (0, w.jsx)(l, {})
						}),
						/* @__PURE__ */ (0, w.jsx)(O, {
							label: "Branch in new draft",
							disabled: Y,
							onClick: () => Z(t.id),
							children: /* @__PURE__ */ (0, w.jsx)(Ce, {})
						}),
						/* @__PURE__ */ (0, w.jsx)(O, {
							label: "Copy shortcode",
							tooltip: Ge(t.id),
							onClick: () => void Ke(t.id),
							children: /* @__PURE__ */ (0, w.jsx)(se, {})
						})
					]
				})
			]
		}, t.id);
	}
	return /* @__PURE__ */ (0, w.jsxs)(w.Fragment, { children: [
		/* @__PURE__ */ (0, w.jsxs)(xe, {
			open: T,
			onOpenChange: (e) => {
				A(e), e || L(null);
			},
			children: [
				x ? /* @__PURE__ */ (0, w.jsx)(ye, { virtualRef: x }) : null,
				/* @__PURE__ */ (0, w.jsx)(ve, {
					asChild: !0,
					children: /* @__PURE__ */ (0, w.jsxs)(n, {
						type: "button",
						size: "xs",
						variant: "outline",
						"aria-label": "Versions",
						className: "gap-2",
						disabled: t || !e.ready,
						children: [/* @__PURE__ */ (0, w.jsxs)(f, { children: [/* @__PURE__ */ (0, w.jsx)(m, {
							asChild: !0,
							children: /* @__PURE__ */ (0, w.jsx)("span", {
								className: "inline-flex",
								children: /* @__PURE__ */ (0, w.jsx)(b, {})
							})
						}), /* @__PURE__ */ (0, w.jsx)(d, {
							side: "bottom",
							children: "Drafts and version history"
						})] }), V ? /* @__PURE__ */ (0, w.jsxs)(f, { children: [/* @__PURE__ */ (0, w.jsx)(m, {
							asChild: !0,
							children: /* @__PURE__ */ (0, w.jsx)("span", {
								role: "status",
								"aria-label": q,
								"data-slot": "draft-save-status",
								className: i("inline-flex text-muted-foreground", !e.busy && K && "text-amber-600"),
								children: e.busy || !K && !He ? /* @__PURE__ */ (0, w.jsx)(ge, {
									className: "animate-spin",
									"aria-hidden": "true"
								}) : K ? /* @__PURE__ */ (0, w.jsx)(Se, { "aria-hidden": "true" }) : Ue ? /* @__PURE__ */ (0, w.jsx)(ke, { "aria-hidden": "true" }) : /* @__PURE__ */ (0, w.jsx)(a, { "aria-hidden": "true" })
							})
						}), /* @__PURE__ */ (0, w.jsx)(d, {
							side: "bottom",
							children: q
						})] }) : null]
					})
				}),
				/* @__PURE__ */ (0, w.jsxs)(be, {
					align: "end",
					onEscapeKeyDown: (e) => {
						I !== null && e.preventDefault();
					},
					onCloseAutoFocus: (e) => {
						B || R || j.current || M.current ? e.preventDefault() : x && (e.preventDefault(), x.current?.focus()), j.current = !1, M.current = !1;
					},
					className: "w-[500px] max-w-[calc(100vw-2rem)] p-0",
					children: [
						e.offline ? /* @__PURE__ */ (0, w.jsx)("p", {
							role: "status",
							className: "px-3 pt-2 text-xs text-amber-700",
							children: "Server unavailable. Editing local drafts; synchronization will retry automatically."
						}) : null,
						P ? /* @__PURE__ */ (0, w.jsx)("p", {
							role: "alert",
							className: "px-3 pt-2 text-xs text-destructive",
							children: P
						}) : null,
						/* @__PURE__ */ (0, w.jsxs)("div", {
							className: "grid grid-cols-2 divide-x",
							children: [/* @__PURE__ */ (0, w.jsxs)("section", {
								className: "min-w-0 p-2",
								"aria-label": "Drafts",
								children: [
									/* @__PURE__ */ (0, w.jsxs)("div", {
										className: "mb-1 flex h-6 items-center justify-between px-1",
										children: [/* @__PURE__ */ (0, w.jsx)("strong", {
											className: "text-xs leading-4 font-semibold",
											children: "Drafts"
										}), /* @__PURE__ */ (0, w.jsxs)(f, { children: [/* @__PURE__ */ (0, w.jsx)(m, {
											asChild: !0,
											children: /* @__PURE__ */ (0, w.jsx)("span", {
												className: "inline-flex",
												children: /* @__PURE__ */ (0, w.jsxs)(n, {
													variant: "secondary",
													size: "xs",
													disabled: Y,
													onClick: () => Z(),
													children: [/* @__PURE__ */ (0, w.jsx)(_e, { "aria-hidden": "true" }), "New"]
												})
											})
										}), /* @__PURE__ */ (0, w.jsx)(d, { children: "Create new draft" })] })]
									}),
									/* @__PURE__ */ (0, w.jsxs)("div", {
										className: "max-h-[360px] space-y-0.5 overflow-y-auto",
										children: [[...e.copies.values()].sort((e, t) => t.draft.id - e.draft.id).map((t) => /* @__PURE__ */ (0, w.jsx)("div", {
											"data-draft-id": t.draft.id,
											"data-active": t.draft.id === e.activeId,
											className: `group relative rounded-md text-xs ${t.draft.id === e.activeId ? "bg-muted" : "hover:bg-muted/50"}`,
											children: I?.kind === "draft" && I.id === t.draft.id ? /* @__PURE__ */ (0, w.jsxs)("div", {
												className: "flex min-h-8 items-center gap-2 px-2",
												children: [/* @__PURE__ */ (0, w.jsx)(k, {
													label: "Draft name",
													title: I.title,
													disabled: N,
													onCancel: () => L(null),
													onSave: async (n) => {
														let r = await X(() => e.rename(t.draft.id, n));
														return r && L(null), r;
													}
												}), t.draft.id === e.activeId ? /* @__PURE__ */ (0, w.jsx)(a, {
													className: "size-3.5 shrink-0",
													"aria-label": "Editing"
												}) : null]
											}) : /* @__PURE__ */ (0, w.jsxs)(w.Fragment, { children: [/* @__PURE__ */ (0, w.jsxs)("button", {
												type: "button",
												"aria-label": `Edit draft ${t.draft.title}`,
												"aria-pressed": t.draft.id === e.activeId,
												disabled: J,
												className: i("flex min-h-8 w-full min-w-0 cursor-pointer items-center gap-2 rounded-md pl-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default", Re),
												onClick: () => {
													t.draft.id === e.activeId ? t.draft.migration && (A(!1), W(t.draft.id)) : X(() => e.select(t.draft.id), !0);
												},
												children: [
													/* @__PURE__ */ (0, w.jsx)("span", {
														className: "min-w-0 truncate font-normal",
														title: t.draft.title,
														children: t.draft.title
													}),
													t.draft.migration ? /* @__PURE__ */ (0, w.jsx)(we, {
														variant: "secondary",
														className: "shrink-0 text-[10px] group-hover:hidden group-focus-within:hidden",
														children: "Migration"
													}) : null,
													t.draft.id === e.activeId ? /* @__PURE__ */ (0, w.jsx)(a, {
														className: "size-3.5 shrink-0",
														"aria-label": "Editing"
													}) : null,
													t.conflicted ? /* @__PURE__ */ (0, w.jsx)(Se, {
														className: "size-3.5 shrink-0 text-destructive",
														role: "img",
														"aria-label": G,
														children: /* @__PURE__ */ (0, w.jsx)("title", { children: G })
													}) : null
												]
											}), /* @__PURE__ */ (0, w.jsxs)("div", {
												className: Le,
												children: [
													/* @__PURE__ */ (0, w.jsx)(O, {
														label: "Publish draft",
														disabled: Y || t.conflicted,
														onClick: () => void X(async () => {
															let n = structuredClone(t.snapshot);
															await e.publish(n, t.draft.id), o(n);
														}),
														children: /* @__PURE__ */ (0, w.jsx)(y, {})
													}),
													/* @__PURE__ */ (0, w.jsx)(O, {
														label: "Rename draft",
														disabled: Y || t.conflicted,
														onClick: () => {
															L({
																kind: "draft",
																id: t.draft.id,
																title: t.draft.title
															}), F(null);
														},
														children: /* @__PURE__ */ (0, w.jsx)(l, {})
													}),
													/* @__PURE__ */ (0, w.jsx)(O, {
														label: "Compare with Published",
														disabled: Y,
														onClick: () => void qe(t.draft.id),
														children: /* @__PURE__ */ (0, w.jsx)(Ae, {})
													}),
													/* @__PURE__ */ (0, w.jsx)(O, {
														label: "Delete draft",
														disabled: Y,
														onClick: () => {
															Pe(e), F(null), z({
																id: t.draft.id,
																title: t.draft.title
															}), A(!1);
														},
														children: /* @__PURE__ */ (0, w.jsx)(s, {})
													})
												]
											})] })
										}, t.draft.id)), e.copies.size === 0 ? /* @__PURE__ */ (0, w.jsx)("p", {
											className: "px-1 py-2 text-xs text-muted-foreground",
											children: "No drafts"
										}) : null]
									}),
									V?.conflicted ? /* @__PURE__ */ (0, w.jsxs)("div", {
										className: "mt-2 space-y-2",
										children: [/* @__PURE__ */ (0, w.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "Pull changes replaces local edits with the server copy."
										}), /* @__PURE__ */ (0, w.jsx)(Fe, {
											disabled: Y,
											onPull: () => {
												j.current = !0, A(!1), c();
											},
											onBranch: () => Z()
										})]
									}) : null,
									e.recoveries.map((e) => /* @__PURE__ */ (0, w.jsxs)(n, {
										className: "mt-2 max-w-full",
										size: "xs",
										variant: "outline",
										disabled: Y,
										onClick: () => Z(void 0, e.snapshot),
										children: ["Recover: ", e.title]
									}, e.key)),
									V?.serverError || V?.localError ? /* @__PURE__ */ (0, w.jsxs)("div", {
										className: "mt-2 text-xs text-destructive",
										role: "alert",
										children: [V.conflicted ? G : V.serverError ?? V.localError, V.dirty && !V.conflicted ? /* @__PURE__ */ (0, w.jsx)(n, {
											variant: "ghost",
											size: "xs",
											disabled: J,
											onClick: () => void X(() => e.flush()),
											children: "Retry save"
										}) : null]
									}) : null
								]
							}), /* @__PURE__ */ (0, w.jsxs)("div", {
								className: "min-w-0 p-2",
								children: [/* @__PURE__ */ (0, w.jsxs)("section", {
									"aria-label": "Published",
									children: [
										/* @__PURE__ */ (0, w.jsx)("div", {
											className: "mb-1 flex h-6 items-center px-1",
											children: /* @__PURE__ */ (0, w.jsx)("strong", {
												className: "text-xs leading-4 font-semibold",
												children: "Published"
											})
										}),
										Q ? $(Q, !0) : /* @__PURE__ */ (0, w.jsx)("p", {
											className: "px-1 py-2 text-xs text-muted-foreground",
											children: "No published version"
										}),
										Q?.engine === 8 && Q.old_editor_url ? /* @__PURE__ */ (0, w.jsx)(Ie, {
											href: Q.old_editor_url,
											className: "mt-1 ml-2"
										}) : null
									]
								}), /* @__PURE__ */ (0, w.jsxs)("section", {
									"aria-label": "History",
									className: "mt-2 border-t pt-2",
									children: [/* @__PURE__ */ (0, w.jsx)("div", {
										className: "mb-1 flex h-6 items-center px-1",
										children: /* @__PURE__ */ (0, w.jsx)("strong", {
											className: "text-xs leading-4 font-semibold",
											children: "History"
										})
									}), /* @__PURE__ */ (0, w.jsxs)("div", {
										className: "max-h-[280px] space-y-0.5 overflow-y-auto",
										children: [Ye.map((e) => $(e, !1)), Ye.length === 0 ? /* @__PURE__ */ (0, w.jsx)("p", {
											className: "px-1 py-2 text-xs text-muted-foreground",
											children: "No previous publications"
										}) : null]
									})]
								})]
							})]
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, w.jsx)(fe, {
			open: Ve !== null && Ve === H,
			onOpenChange: (e) => {
				e || W(null);
			},
			children: /* @__PURE__ */ (0, w.jsxs)(u, {
				className: "sm:max-w-lg",
				children: [
					/* @__PURE__ */ (0, w.jsxs)(ee, { children: [/* @__PURE__ */ (0, w.jsx)(ne, { children: "Review your migrated draft before publishing" }), /* @__PURE__ */ (0, w.jsx)(le, { children: "This draft is a separate v9 copy of your v8 map." })] }),
					/* @__PURE__ */ (0, w.jsxs)("div", {
						className: "space-y-3 text-sm",
						children: [
							/* @__PURE__ */ (0, w.jsx)("p", { children: Q?.engine === 8 ? /* @__PURE__ */ (0, w.jsxs)(w.Fragment, { children: [
								"Your website is still showing the published v8 map. Editing this draft does not change it. To edit v8, use ",
								/* @__PURE__ */ (0, w.jsxs)("span", {
									className: "inline-flex items-center gap-1 font-semibold",
									children: [/* @__PURE__ */ (0, w.jsx)(h, {
										className: "size-3.5",
										"aria-hidden": "true"
									}), "Open in old editor"]
								}),
								" in Versions → Published."
							] }) : "Editing this draft does not change the published map." }),
							/* @__PURE__ */ (0, w.jsx)("p", { children: "Migration may change how your map works. Some issues may not be obvious in the editor, especially with custom code, templates, filters and interactions." }),
							/* @__PURE__ */ (0, w.jsx)("p", { children: "Ask the built-in AI assistant to help adapt your v8 JavaScript event handlers, templates and CSS to v9 while preserving your map's existing behavior. It has access to the MapSVG JavaScript API documentation. Test the result in Preview and describe any problems to the assistant so it can make further corrections. Repeat until everything works as expected before publishing." }),
							/* @__PURE__ */ (0, w.jsxs)("p", { children: [
								"Before you Publish, click ",
								/* @__PURE__ */ (0, w.jsxs)("span", {
									className: "inline-flex items-center gap-1 font-semibold",
									children: [/* @__PURE__ */ (0, w.jsx)(h, {
										className: "size-3.5",
										"aria-hidden": "true"
									}), "Preview"]
								}),
								" and carefully test every feature on the front-end preview, including desktop and mobile layouts, links, filters and click actions."
							] }),
							/* @__PURE__ */ (0, w.jsxs)("p", { children: [
								"Changes saved in the old editor are ",
								/* @__PURE__ */ (0, w.jsx)("strong", { children: "not copied into this draft" }),
								". Publishing this draft replaces the current published settings, including any later changes made in the old editor."
							] }),
							/* @__PURE__ */ (0, w.jsxs)("p", { children: [
								"If you publish v9 by mistake, open ",
								/* @__PURE__ */ (0, w.jsxs)("span", {
									className: "inline-flex items-center gap-1 font-semibold",
									children: [/* @__PURE__ */ (0, w.jsx)(b, {
										className: "size-3.5",
										"aria-hidden": "true"
									}), "Versions"]
								}),
								" → History and click ",
								/* @__PURE__ */ (0, w.jsxs)("span", {
									className: "inline-flex items-center gap-1 font-semibold",
									children: [/* @__PURE__ */ (0, w.jsx)(y, {
										className: "size-3.5",
										"aria-hidden": "true"
									}), "Publish"]
								}),
								" on the previous v8 version to restore it. Your v9 draft is kept; shared Database records keep their current data."
							] })
						]
					}),
					/* @__PURE__ */ (0, w.jsxs)(me, {
						className: "gap-2",
						children: [Q?.engine === 8 && Q.old_editor_url ? /* @__PURE__ */ (0, w.jsx)(Ie, {
							href: Q.old_editor_url,
							size: "sm"
						}) : null, /* @__PURE__ */ (0, w.jsx)(n, {
							size: "sm",
							onClick: () => W(null),
							children: "Continue editing draft"
						})]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, w.jsx)(fe, {
			open: B !== null,
			onOpenChange: (e) => {
				e || (Be(null), A(!0));
			},
			children: /* @__PURE__ */ (0, w.jsxs)(u, {
				"aria-describedby": void 0,
				className: "flex max-h-[calc(100dvh-2rem)] flex-col gap-3 overflow-hidden p-4 sm:max-w-3xl",
				children: [/* @__PURE__ */ (0, w.jsx)(ee, {
					className: "shrink-0 pr-6",
					children: /* @__PURE__ */ (0, w.jsxs)(ne, {
						className: "text-base",
						children: [B?.title, " — changes"]
					})
				}), /* @__PURE__ */ (0, w.jsx)("div", {
					role: "region",
					"aria-label": "Parameter comparison",
					tabIndex: 0,
					className: "max-h-[65dvh] min-h-0 overflow-auto overscroll-contain rounded-md border outline-none focus-visible:ring-2 focus-visible:ring-ring [&>[data-slot=table-container]]:overflow-visible",
					onWheel: (e) => e.stopPropagation(),
					onTouchMove: (e) => e.stopPropagation(),
					children: /* @__PURE__ */ (0, w.jsxs)(De, {
						className: "table-fixed text-xs",
						"aria-label": "Changes from Published",
						children: [/* @__PURE__ */ (0, w.jsx)(Te, {
							className: "sticky top-0 z-10 bg-muted",
							children: /* @__PURE__ */ (0, w.jsxs)(_, { children: [
								/* @__PURE__ */ (0, w.jsx)(g, {
									scope: "col",
									className: "h-8 w-1/3",
									children: "Parameter"
								}),
								/* @__PURE__ */ (0, w.jsx)(g, {
									scope: "col",
									className: "h-8 w-1/3 border-l",
									children: "Published"
								}),
								/* @__PURE__ */ (0, w.jsx)(g, {
									scope: "col",
									className: "h-8 w-1/3 border-l",
									children: "Draft"
								})
							] })
						}), /* @__PURE__ */ (0, w.jsx)(Ee, { children: B?.changes.length === 0 ? /* @__PURE__ */ (0, w.jsx)(_, { children: /* @__PURE__ */ (0, w.jsx)(v, {
							colSpan: 3,
							className: "py-6 text-center text-muted-foreground",
							children: "No changes"
						}) }) : B?.changes.map((e) => /* @__PURE__ */ (0, w.jsxs)(_, { children: [
							/* @__PURE__ */ (0, w.jsx)(v, {
								className: "px-2 py-1.5 align-top font-mono whitespace-normal [overflow-wrap:anywhere]",
								children: e.path
							}),
							/* @__PURE__ */ (0, w.jsx)(v, {
								className: "border-l bg-red-500/5 px-2 py-1.5 align-top whitespace-normal",
								children: /* @__PURE__ */ (0, w.jsx)("pre", {
									className: "whitespace-pre-wrap [overflow-wrap:anywhere]",
									children: e.before === void 0 ? "(not set)" : JSON.stringify(e.before, null, 2)
								})
							}),
							/* @__PURE__ */ (0, w.jsx)(v, {
								className: "border-l bg-green-500/5 px-2 py-1.5 align-top whitespace-normal",
								children: /* @__PURE__ */ (0, w.jsx)("pre", {
									className: "whitespace-pre-wrap [overflow-wrap:anywhere]",
									children: e.after === void 0 ? "(not set)" : JSON.stringify(e.after, null, 2)
								})
							})
						] }, e.path)) })]
					})
				})]
			})
		}),
		/* @__PURE__ */ (0, w.jsx)(ue, {
			open: R !== null,
			onOpenChange: (e) => {
				!e && !N && (z(null), A(!0));
			},
			children: /* @__PURE__ */ (0, w.jsxs)(re, { children: [
				/* @__PURE__ */ (0, w.jsxs)(oe, { children: [/* @__PURE__ */ (0, w.jsx)(ie, { children: "Delete draft?" }), /* @__PURE__ */ (0, w.jsxs)(pe, { children: [
					"“",
					R?.title,
					"” will be deleted, including its unpublished changes. Published versions are kept."
				] })] }),
				P ? /* @__PURE__ */ (0, w.jsx)("p", {
					role: "alert",
					className: "text-xs text-destructive",
					children: P
				}) : null,
				/* @__PURE__ */ (0, w.jsxs)(de, { children: [/* @__PURE__ */ (0, w.jsx)(te, {
					size: "sm",
					disabled: N,
					children: "Cancel"
				}), /* @__PURE__ */ (0, w.jsx)(he, {
					size: "sm",
					variant: "destructive",
					disabled: N,
					onClick: (t) => {
						t.preventDefault(), R && X(async () => {
							await e.deleteDraft(R.id), z(null), A(!0);
						}, R.id === e.activeId);
					},
					children: "Delete"
				})] })
			] })
		})
	] });
}
//#endregion
export { y as a, b as i, Ne as n, je as r, A as t };

//# sourceMappingURL=AppVersions-BAUBP_uK.js.map