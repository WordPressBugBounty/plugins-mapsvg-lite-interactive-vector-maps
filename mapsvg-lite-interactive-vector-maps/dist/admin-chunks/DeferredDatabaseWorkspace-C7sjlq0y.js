import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Ar as t, D as n, E as r, Er as i, F as a, Fr as o, I as s, L as c, Lr as l, N as u, P as d, Pr as f, T as p, _r as m, b as h, bi as g, br as _, c as v, cr as y, d as b, dr as x, dt as S, f as C, fr as w, ft as T, gn as E, gt as D, h as O, hi as k, hn as A, ht as j, i as M, in as N, j as P, k as F, kt as I, l as L, ln as R, lr as z, lt as ee, m as te, mt as B, or as ne, p as re, pn as ie, pt as V, s as H, u as ae, ur as U, ut as oe, v as se, vn as ce, x as W, y as le, yr as ue } from "./admin-startup-DaxvU-L8.js";
import { i as G, t as K } from "./SettingsControlField-BtpHWA60.js";
import { t as q } from "./label-C9XVn_0K.js";
import { f as J, p as de } from "./select-CucA4zeB.js";
import { a as fe } from "./popover-CB-evFrr.js";
import { D as pe, F as Y, I as me, L as he, O as ge, R as X, S as _e, T as ve, a as ye, b as be, c as Z, d as xe, f as Se, g as Ce, i as we, l as Te, n as Ee, o as De, r as Oe, s as ke, t as Ae, u as je, w as Me, x as Ne } from "./collection-editor-defaults-B2RL16o3.js";
import { t as Pe } from "./chevron-right-6Y_3kTu1.js";
import { l as Fe } from "./value-DNa51RsO.js";
var Ie = f("database-arrow-down", [
	["path", {
		d: "m16 19 3 3 3-3",
		key: "1ibux0"
	}],
	["path", {
		d: "M19 16v6",
		key: "tddt3s"
	}],
	["path", {
		d: "M21 12.536V5",
		key: "zeza6i"
	}],
	["path", {
		d: "M3 12A9 3 0 0 0 15.182 14.806",
		key: "11e5wb"
	}],
	["path", {
		d: "M3 5V19A9 3 0 0 0 13.318 21.968",
		key: "1lyu4j"
	}],
	["ellipse", {
		cx: "12",
		cy: "5",
		rx: "9",
		ry: "3",
		key: "msslwz"
	}]
]), Le = f("square-arrow-out-up-right", [
	["path", {
		d: "M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6",
		key: "y09zxi"
	}],
	["path", {
		d: "m21 3-9 9",
		key: "mpx6sq"
	}],
	["path", {
		d: "M15 3h6v6",
		key: "1q9fwt"
	}]
]), Q = /* @__PURE__ */ e(g(), 1), Re = (0, Q.createContext)(null);
function ze() {
	let e = (0, Q.useContext)(Re);
	if (!e) throw Error("useDatabaseNavigation must be used inside DatabaseNavigationProvider");
	return e;
}
//#endregion
//#region src/components/database/DatabaseNavigation.tsx
var $ = k();
function Be(e) {
	return [...e].sort((e, t) => d(e).localeCompare(d(t)));
}
function Ve({ children: e, initialQueryId: t = null }) {
	let [n, i] = (0, Q.useState)(t ? "queries" : "collections"), [a, o] = (0, Q.useState)([]), [s, c] = (0, Q.useState)(!1), [l, u] = (0, Q.useState)(!0), [d, f] = (0, Q.useState)(null), m = ie().globalQueriesEnabled, [h, g] = (0, Q.useState)([]), [_, v] = (0, Q.useState)([]), [y, b] = (0, Q.useState)(!1), [x, S] = (0, Q.useState)(!1), [C, w] = (0, Q.useState)(null), [T, E] = (0, Q.useState)(t), [D, O] = (0, Q.useState)(!1), [k, A] = (0, Q.useState)(null);
	(0, Q.useLayoutEffect)(() => {
		E(t), i(t ? "queries" : "collections"), O(!1), A(null);
	}, [t]);
	let j = (0, Q.useRef)(!1), M = (0, Q.useRef)(0), N = (0, Q.useRef)(0);
	(0, Q.useLayoutEffect)(() => (j.current = !0, () => {
		j.current = !1, M.current++, N.current++;
	}), []);
	let P = (0, Q.useCallback)(async (e) => {
		let t = ++M.current, n = () => j.current && M.current === t;
		u(!0), f(null);
		try {
			let t = Be(await r());
			return n() && (!e || e()) && (o(t), c(!0)), t;
		} catch (t) {
			throw n() && (!e || e()) && f(t instanceof Error ? t.message : String(t)), t;
		} finally {
			n() && u(!1);
		}
	}, []), F = (0, Q.useCallback)(async (e, n) => {
		if (!m) return [];
		let r = ++N.current, i = () => j.current && N.current === r;
		b(!0), w(null);
		try {
			let [r, a] = await Promise.all([p(), W()]);
			return !i() || e && !e() ? a : (g(r), v(a), E((e) => e && (e === t || a.some((t) => t.id === e)) ? e : a[0]?.id ?? null), n?.(a), a);
		} catch (t) {
			throw i() && (!e || e()) && w(t instanceof Error ? t.message : String(t)), t;
		} finally {
			i() && (S(!0), b(!1));
		}
	}, [m, t]);
	(0, Q.useEffect)(() => {
		P().catch(() => {});
	}, [P]), (0, Q.useEffect)(() => {
		n === "queries" && !x && !y && F().catch(() => {});
	}, [
		n,
		x,
		y,
		F
	]), (0, Q.useEffect)(() => {
		let e = () => {
			P().catch(() => {});
		}, t = () => {
			F().catch(() => {});
		}, n = (e) => {
			let t = e.detail;
			(t?.action === "created" || t?.action === "duplicated") && P().catch(() => {}), t?.action === "created" && F().catch(() => {});
		};
		return window.addEventListener("mapsvg:schema-mutation", e), window.addEventListener("mapsvg:query-mutation", t), window.addEventListener("mapsvg:map-mutation", n), () => {
			window.removeEventListener("mapsvg:schema-mutation", e), window.removeEventListener("mapsvg:query-mutation", t), window.removeEventListener("mapsvg:map-mutation", n);
		};
	}, [F, P]);
	let I = (0, Q.useCallback)((e) => {
		O(!1), A(null), E(e);
	}, []), L = (0, Q.useCallback)((e = null) => {
		i("queries"), O(!0), A(e);
	}, []), R = (0, Q.useCallback)(() => {
		O(!1), A(null);
	}, []), z = (0, Q.useMemo)(() => ({
		section: n,
		setSection: i,
		schemas: a,
		schemasLoaded: s,
		loading: l,
		error: d,
		refreshSchemas: P,
		queriesEnabled: m,
		folders: h,
		queries: _,
		loadingQueries: y,
		queriesLoaded: x,
		queryError: C,
		refreshQueries: F,
		selectedQueryId: T,
		setSelectedQueryId: I,
		creatingQuery: D,
		newQueryFolderId: k,
		startQuery: L,
		cancelQueryCreation: R
	}), [
		n,
		a,
		s,
		l,
		d,
		P,
		m,
		h,
		_,
		y,
		x,
		C,
		F,
		T,
		I,
		D,
		k,
		L,
		R
	]);
	return /* @__PURE__ */ (0, $.jsx)(Re.Provider, {
		value: z,
		children: e
	});
}
//#endregion
//#region src/components/database/GlobalQuerySettings.tsx
function He(e) {
	return Oe(e);
}
function Ue({ schemas: e, folders: t, query: n, initialFolderId: r, onSave: i, onDelete: a, onCancel: s }) {
	let c = (0, Q.useMemo)(() => e.filter((e) => e.type !== "api" && !e.remote), [e]), [l, u] = (0, Q.useState)(n?.name ?? "newQuery"), [f, p] = (0, Q.useState)(String(n?.schemaId ?? c[0]?.id ?? "")), [h, g] = (0, Q.useState)(String(n?.folderId ?? r ?? "")), [_, v] = (0, Q.useState)(() => He(n?.builder ?? xe)), [b, S] = (0, Q.useState)(void 0), [C, T] = (0, Q.useState)(void 0), [E, D] = (0, Q.useState)(null), [O, k] = (0, Q.useState)(!1), [A, j] = (0, Q.useState)(!1), [M, N] = (0, Q.useState)(!1), P = (0, Q.useRef)(null), L = (0, Q.useRef)(null), R = (0, Q.useRef)(n ? Oe(n) : null), ee = De(n), te = n ? null : r, B = c.find((e) => String(e.id) === f) ?? null, re = !!B && F(B) && !n?.rpc, ie = C === void 0 ? !re || n?.input.take !== void 0 : C !== null, V = (0, Q.useMemo)(() => B ? Ce(B) : [], [B]);
	(0, Q.useLayoutEffect)(() => {
		let e = {};
		return P.current = e, L.current = null, R.current = n ? Oe(n) : null, k(!1), N(!1), j(!1), u(n?.name ?? "newQuery"), p(String(n?.schemaId ?? c[0]?.id ?? "")), g(String(n?.folderId ?? r ?? "")), v(He(n?.builder ?? xe)), S(void 0), T(void 0), D(null), () => {
			P.current === e && (P.current = null);
		};
	}, [ee, te]), (0, Q.useEffect)(() => {
		!f && c[0] && p(String(c[0].id));
	}, [f, c]);
	let H = () => {
		if (!B) throw Error("Choose an available collection.");
		return we({
			query: R.current,
			originalSchema: c.find((e) => String(e.id) === String(R.current?.schemaId)),
			name: l,
			schema: B,
			folderId: h ? Number(h) : null,
			builder: _,
			orderBy: b,
			take: C === void 0 ? n ? void 0 : re ? null : 50 : C
		});
	}, ae = (() => {
		try {
			return JSON.stringify(H().input, null, 2);
		} catch (e) {
			return e instanceof Error ? e.message : String(e);
		}
	})(), oe = async () => {
		let e = P.current;
		if (!(!e || L.current)) try {
			let t = H();
			L.current = e, k(!0), D(null), await i(t);
		} catch (t) {
			P.current === e && D(t instanceof Error ? t.message : String(t));
		} finally {
			P.current === e && L.current === e && (L.current = null, k(!1));
		}
	}, se = async () => {
		let e = P.current, t = R.current?.id;
		if (!(!e || !t || L.current)) {
			L.current = e;
			try {
				N(!0), D(null), await a(t), P.current === e && j(!1);
			} catch (t) {
				P.current === e && D(t instanceof Error ? t.message : String(t));
			} finally {
				P.current === e && L.current === e && (L.current = null, N(!1));
			}
		}
	};
	return /* @__PURE__ */ (0, $.jsxs)("fieldset", {
		disabled: O || M,
		className: "mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-5 overflow-auto p-4",
		children: [
			/* @__PURE__ */ (0, $.jsxs)("div", {
				className: "grid gap-2",
				children: [
					/* @__PURE__ */ (0, $.jsx)(q, {
						htmlFor: "global-query-name",
						children: "System name"
					}),
					/* @__PURE__ */ (0, $.jsx)(I, {
						id: "global-query-name",
						value: l,
						maxLength: 120,
						readOnly: !!n,
						onChange: (e) => u(e.target.value)
					}),
					/* @__PURE__ */ (0, $.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: n ? "System names are immutable after creation." : "Unique camelCase name for this installation."
					})
				]
			}),
			/* @__PURE__ */ (0, $.jsxs)("div", {
				className: "grid gap-4 sm:grid-cols-2",
				children: [/* @__PURE__ */ (0, $.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, $.jsx)(q, {
						htmlFor: "global-query-schema",
						children: "Collection"
					}), /* @__PURE__ */ (0, $.jsx)(Y, {
						id: "global-query-schema",
						value: f,
						onValueChange: p,
						disabled: O || M,
						options: [...!B && f ? [{
							value: f,
							label: `Unavailable collection #${f}`
						}] : [], ...c.map((e) => ({
							value: String(e.id),
							label: d(e)
						}))]
					})]
				}), /* @__PURE__ */ (0, $.jsxs)("div", {
					className: "grid gap-2",
					children: [/* @__PURE__ */ (0, $.jsx)(q, {
						htmlFor: "global-query-folder",
						children: "Folder"
					}), /* @__PURE__ */ (0, $.jsx)(Y, {
						id: "global-query-folder",
						value: h,
						onValueChange: g,
						disabled: O || M,
						emptyLabel: "Unfiled",
						options: t.map((e) => ({
							value: String(e.id),
							label: e.title
						}))
					})]
				})]
			}),
			B && V.length > 0 ? /* @__PURE__ */ (0, $.jsx)(be, {
				controlElements: je,
				disabled: O || M,
				fields: V,
				operators: Se.map((e) => ({ ...e })),
				query: _,
				onQueryChange: v,
				enableMountQueryChange: !1,
				parseNumbers: "strict",
				listsAsArrays: !0,
				resetOnFieldChange: !0,
				controlClassnames: { queryBuilder: "mapsvg-saved-query-builder" }
			}) : /* @__PURE__ */ (0, $.jsx)("p", {
				className: "rounded-md border border-dashed p-4 text-sm text-muted-foreground",
				children: B ? "This collection has no supported scalar fields. The query will return all rows." : "The linked collection is unavailable. Choose another collection to edit this query."
			}),
			re && /* @__PURE__ */ (0, $.jsx)(K, {
				id: "query-pagination",
				label: "Pagination",
				checked: ie,
				onCheckedChange: (e) => T(e ? Number(n?.input.take ?? 50) : null)
			}),
			ie && /* @__PURE__ */ (0, $.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, $.jsx)(q, {
					htmlFor: "query-items-per-page",
					children: "Items per page"
				}), /* @__PURE__ */ (0, $.jsx)(I, {
					id: "query-items-per-page",
					type: "number",
					min: 1,
					max: 250,
					value: C ?? n?.input.take ?? 50,
					onChange: (e) => T(Number(e.target.value))
				})]
			}),
			/* @__PURE__ */ (0, $.jsxs)("div", {
				className: "grid gap-2",
				children: [/* @__PURE__ */ (0, $.jsx)(q, { children: "Default sort order" }), /* @__PURE__ */ (0, $.jsx)(_e, {
					value: b ?? (n?.input.orderBy ? Array.isArray(n.input.orderBy) ? n.input.orderBy : [n.input.orderBy] : []),
					fields: V.map((e) => ({
						value: e.name,
						label: String(e.label ?? e.name)
					})),
					onChange: S
				})]
			}),
			/* @__PURE__ */ (0, $.jsxs)("details", {
				className: "rounded-md border bg-muted/20",
				children: [/* @__PURE__ */ (0, $.jsxs)("summary", {
					className: "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm font-medium",
					children: [/* @__PURE__ */ (0, $.jsx)(X, { className: "size-4" }), "Prisma input"]
				}), /* @__PURE__ */ (0, $.jsx)("pre", {
					className: "max-h-72 overflow-auto border-t p-3 text-xs leading-relaxed",
					children: ae
				})]
			}),
			E ? /* @__PURE__ */ (0, $.jsx)("p", {
				role: "alert",
				className: "text-sm text-destructive",
				children: E
			}) : null,
			/* @__PURE__ */ (0, $.jsxs)("div", {
				className: "flex items-center justify-between border-t pt-4",
				children: [/* @__PURE__ */ (0, $.jsx)("div", { children: n ? /* @__PURE__ */ (0, $.jsxs)(o, {
					type: "button",
					variant: "destructive",
					size: "sm",
					onClick: () => j(!0),
					children: [/* @__PURE__ */ (0, $.jsx)(m, {}), "Delete"]
				}) : null }), /* @__PURE__ */ (0, $.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, $.jsx)(o, {
						type: "button",
						variant: "outline",
						size: "sm",
						onClick: s,
						children: "Cancel"
					}), /* @__PURE__ */ (0, $.jsxs)(o, {
						type: "button",
						size: "sm",
						disabled: O || M || !B,
						onClick: () => void oe(),
						children: [/* @__PURE__ */ (0, $.jsx)(he, {}), "Save query"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, $.jsx)(ne, {
				open: A,
				onOpenChange: (e) => {
					M || j(e);
				},
				children: /* @__PURE__ */ (0, $.jsxs)(y, {
					className: "sm:max-w-md",
					children: [
						/* @__PURE__ */ (0, $.jsxs)(x, { children: [/* @__PURE__ */ (0, $.jsx)(w, { children: "Delete query" }), /* @__PURE__ */ (0, $.jsxs)(z, { children: [
							"Delete “",
							n?.name,
							"”? Queries used by maps must be rebound first."
						] })] }),
						E ? /* @__PURE__ */ (0, $.jsx)("p", {
							role: "alert",
							className: "text-sm text-destructive",
							children: E
						}) : null,
						/* @__PURE__ */ (0, $.jsxs)(U, { children: [/* @__PURE__ */ (0, $.jsx)(o, {
							type: "button",
							variant: "outline",
							disabled: O || M,
							onClick: () => j(!1),
							children: "Cancel"
						}), /* @__PURE__ */ (0, $.jsx)(o, {
							type: "button",
							variant: "destructive",
							disabled: O || M,
							onClick: () => void se(),
							children: "Delete"
						})] })
					]
				})
			})
		]
	});
}
//#endregion
//#region src/components/form-builder/complex-fields/collectionRegionAdapter.ts
function We(e) {
	return ye(e.filter(F));
}
function Ge(e, t = { tableName: "" }) {
	let n = e.filter(F);
	if (!n.length) return;
	let r = new Map(n.map((e) => [e.name, e]));
	return {
		...t,
		sources: n.map((e) => ({
			tableName: e.name,
			title: d(e)
		})),
		async listRegions(e) {
			let t = e ? r.get(e) : void 0;
			if (!t) throw Error("Choose an available region collection.");
			return (await h(t, { perpage: 0 })).map((e) => {
				if (e.id == null) throw Error("The region collection returned a record without an id.");
				return {
					id: String(e.id),
					title: e.title == null ? String(e.id) : String(e.title)
				};
			});
		}
	};
}
//#endregion
//#region src/components/database/DatabaseQueriesWorkspace.tsx
function Ke({ initialMode: e = "data" }) {
	let { schemas: t, folders: n, queries: r, queriesEnabled: i, selectedQueryId: s, setSelectedQueryId: c, refreshQueries: d, creatingQuery: f, newQueryFolderId: p, cancelQueryCreation: m } = ze(), [h, g] = (0, Q.useState)(e);
	(0, Q.useEffect)(() => g(e), [e]);
	let _ = r.find((e) => e.id === s) ?? null, v = _?.input.take && Number.isInteger(_.input.take) ? Math.max(1, Math.min(250, _.input.take)) : 50, y = _ ? t.find((e) => Number(e.id) === _.schemaId) ?? null : null, b = Ee(y), x = JSON.stringify([
		i,
		f,
		p,
		s,
		De(_),
		Ae(y)
	]), [S, C] = (0, Q.useState)({
		key: x,
		page: 0
	}), w = S.key === x ? S.page : 0;
	(0, Q.useLayoutEffect)(() => {
		C((e) => e.key === x ? e : {
			key: x,
			page: 0
		});
	}, [x]);
	let [T, E] = (0, Q.useState)({
		key: x,
		rows: [],
		count: 0,
		selected: null,
		loading: !1,
		error: null
	}), { rows: D, count: k, selected: A, loading: j, error: M } = T.key === x ? T : {
		key: x,
		rows: [],
		count: 0,
		selected: null,
		loading: !1,
		error: null
	}, N = (0, Q.useMemo)(() => ({}), [
		x,
		h,
		w
	]), P = (0, Q.useRef)(null), F = (0, Q.useRef)(null), I = (0, Q.useRef)(0), L = (0, Q.useRef)(0);
	(0, Q.useLayoutEffect)(() => {
		P.current && P.current.selected !== A && L.current++, P.current = {
			owner: N,
			page: w,
			selected: A
		};
	}), (0, Q.useLayoutEffect)(() => () => {
		P.current = null, F.current?.abort(), I.current++, L.current++;
	}, [N]);
	let R = (e) => {
		E((t) => ({
			...t.key === x ? t : {
				key: x,
				rows: [],
				count: 0,
				selected: null,
				loading: !1,
				error: null
			},
			...e
		}));
	}, z = (e) => {
		C((t) => ({
			key: x,
			page: typeof e == "function" ? e(t.key === x ? t.page : 0) : e
		}));
	}, ee = (e) => R({ selected: e }), te = (0, Q.useMemo)(() => y?.fields ?? [], [y]), B = We(t), ne = (0, Q.useCallback)((e) => b.remember({ regionsTableName: e }), [b.remember]), V = (0, Q.useCallback)((e) => b.remember({ mapId: e }), [b.remember]), H = (0, Q.useCallback)((e) => b.remember({ defaultMarkerImage: e }), [b.remember]), ae = (0, Q.useMemo)(() => Ge(t, {
		tableName: b.defaults.regionsTableName ?? "",
		rememberSource: ne,
		preferenceKey: String(y?.id),
		preferenceError: b.error
	}), [
		B,
		b.defaults.regionsTableName,
		ne,
		y?.id,
		b.error
	]), U = (0, Q.useMemo)(() => Fe({
		markerImages: ie().markerImages,
		markerDefaults: {
			image: b.defaults.defaultMarkerImage,
			rememberImage: H
		},
		picker: {
			mapId: b.defaults.mapId ?? 0,
			rememberMap: V,
			error: b.error
		}
	}), [
		b.defaults.mapId,
		b.defaults.defaultMarkerImage,
		H,
		V,
		b.error
	]), oe = (0, Q.useMemo)(() => ({ [ve]: {
		media: pe(),
		posts: ge()
	} }), []), ce = (0, Q.useMemo)(() => ({
		...oe,
		[Te]: U,
		[ve]: {
			...oe[ve],
			regions: ae
		}
	}), [
		oe,
		ae,
		U
	]);
	(0, Q.useEffect)(() => {
		f && g("settings");
	}, [f]), (0, Q.useEffect)(() => {
		let e = ++I.current;
		F.current?.abort();
		let t = new AbortController();
		F.current = t;
		let n = () => P.current?.owner === N && P.current.page === w && I.current === e;
		if (!i || !_ || !y || f || h !== "data") {
			R({
				loading: !1,
				error: null
			});
			return;
		}
		return R({
			loading: !0,
			error: null,
			rows: [],
			count: 0,
			selected: null
		}), O(_.id, {
			skip: w * v,
			take: v
		}, t.signal).then((e) => {
			n() && R({
				rows: e.rows,
				count: e.count,
				selected: e.rows[0] ?? null
			});
		}).catch((e) => {
			n() && R({
				rows: [],
				count: 0,
				selected: null,
				error: e instanceof Error ? e.message : String(e)
			});
		}).finally(() => {
			n() && R({ loading: !1 });
		}), () => {
			t.abort(), I.current === e && I.current++;
		};
	}, [
		f,
		h,
		w,
		N,
		i
	]);
	let [W, ue] = (0, Q.useState)(0), [G, K] = (0, Q.useState)(null), q = G?.owner === N ? G : null;
	(0, Q.useEffect)(() => {
		if (!y || h !== "data" || f || !i) return;
		let e = new AbortController(), t = !0, n = (e, n) => {
			t && P.current?.owner === N && K({
				owner: N,
				capabilities: e,
				error: n
			});
		};
		return n(null, null), se(y, {
			page: 1,
			perpage: 1,
			search: ""
		}, e.signal).then((e) => n(e.capabilities, null)).catch((e) => n(null, e instanceof Error ? e.message : String(e))), () => {
			t = !1, e.abort();
		};
	}, [N, W]);
	let [J, de] = (0, Q.useState)(null), fe = J?.owner === N && J.selection === A ? J : null;
	return (0, Q.useEffect)(() => {
		if (!A || !y || h !== "data" || f || !i) return;
		let e = A, t = new AbortController(), n = !0, r = () => n && P.current?.owner === N && P.current.selected === e, a = (t, n, i) => {
			r() && de({
				owner: N,
				selection: e,
				row: t,
				loading: n,
				error: i
			});
		}, o = e.id;
		return typeof o != "string" && typeof o != "number" || o === "" || typeof o == "number" && !Number.isFinite(o) ? a(null, !1, "This result has no record id. Include id in the Query projection to edit it.") : (a(null, !0, null), le(y, o, t.signal).then((e) => a(e, !1, null)).catch((e) => a(null, !1, e instanceof Error ? e.message : String(e)))), () => {
			n = !1, t.abort();
		};
	}, [
		N,
		A,
		W
	]), i ? /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background",
		children: [
			/* @__PURE__ */ (0, $.jsxs)("header", {
				"data-slot": "database-toolbar",
				className: "grid h-10 shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 border-b border-border px-2",
				children: [/* @__PURE__ */ (0, $.jsx)("div", {
					className: "min-w-0 justify-self-start",
					children: _ && !f ? /* @__PURE__ */ (0, $.jsx)("div", {
						className: "flex rounded-md border p-0.5",
						role: "tablist",
						"aria-label": "Query view",
						children: ["data", "settings"].map((e) => /* @__PURE__ */ (0, $.jsx)("button", {
							type: "button",
							role: "tab",
							"aria-selected": h === e,
							onClick: () => g(e),
							className: l("rounded px-2 py-0.5 text-xs capitalize", h === e ? "bg-accent font-medium" : "text-muted-foreground"),
							children: e === "data" ? "Data" : "Settings"
						}, e))
					}) : null
				}), /* @__PURE__ */ (0, $.jsxs)("div", {
					"data-slot": "database-title",
					className: "flex min-w-0 items-center justify-center gap-1.5 overflow-hidden text-xs",
					children: [!f && _ ? /* @__PURE__ */ (0, $.jsx)("span", {
						className: "shrink-0 text-muted-foreground",
						children: "Query"
					}) : null, /* @__PURE__ */ (0, $.jsx)("span", {
						className: "truncate font-medium",
						children: f ? "New query" : _?.name ?? "Queries"
					})]
				})]
			}),
			M ? /* @__PURE__ */ (0, $.jsx)("div", {
				role: "alert",
				className: "shrink-0 border-b border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive",
				children: M
			}) : null,
			f || _ && h === "settings" ? /* @__PURE__ */ (0, $.jsx)("div", {
				className: "min-h-0 flex-1 overflow-auto",
				children: /* @__PURE__ */ (0, $.jsx)(Ue, {
					schemas: t,
					folders: n,
					query: f ? null : _,
					initialFolderId: p,
					onSave: async (e) => {
						let t = ++L.current, n = () => P.current?.owner === N && L.current === t;
						try {
							let t = await u(e);
							if (!n()) return;
							await d(n, () => {
								n() && (c(t.id), z(0), m(), g("data"));
							});
						} catch (e) {
							if (n()) throw e;
						}
					},
					onDelete: async (e) => {
						let t = ++L.current, n = () => P.current?.owner === N && L.current === t;
						try {
							if (await re(e), !n()) return;
							await d(n, (e) => {
								n() && (c(e[0]?.id ?? null), z(0), g("data"));
							});
						} catch (e) {
							if (n()) throw e;
						}
					},
					onCancel: () => {
						m(), g("data");
					}
				}, f ? `new-${p}` : _?.id)
			}) : _ ? y ? /* @__PURE__ */ (0, $.jsxs)("div", {
				className: "grid min-h-0 min-w-0 flex-1 grid-cols-2 overflow-hidden",
				children: [/* @__PURE__ */ (0, $.jsx)("section", {
					className: "min-h-0 min-w-0 overflow-hidden border-r border-border",
					children: /* @__PURE__ */ (0, $.jsx)(Ne, {
						variant: "pane",
						paginationState: {
							pageIndex: w,
							pageSize: v,
							count: k,
							onPageChange: z,
							loading: j
						},
						schema: y,
						rows: D,
						loading: j,
						readOnly: !0,
						selectedRow: A,
						onRowClick: ee
					})
				}), /* @__PURE__ */ (0, $.jsxs)("section", {
					className: "flex min-h-0 min-w-0 flex-col overflow-hidden bg-muted",
					children: [/* @__PURE__ */ (0, $.jsx)("header", {
						className: "flex h-10 shrink-0 items-center border-b border-border bg-background px-3",
						children: /* @__PURE__ */ (0, $.jsx)("span", {
							className: "text-sm font-medium",
							children: A?.id == null ? "Row editor" : `Edit row #${A.id}`
						})
					}), /* @__PURE__ */ (0, $.jsx)("div", {
						className: "flex min-h-0 flex-1 flex-col overflow-hidden",
						children: A && q?.error ? /* @__PURE__ */ (0, $.jsxs)("div", {
							role: "alert",
							className: "overflow-auto p-3 space-y-2 text-sm",
							children: [/* @__PURE__ */ (0, $.jsx)("p", { children: q.error }), /* @__PURE__ */ (0, $.jsx)(o, {
								variant: "outline",
								onClick: () => ue((e) => e + 1),
								children: "Retry source permissions"
							})]
						}) : A && fe?.row && q?.capabilities ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [q.capabilities.canEdit ? null : /* @__PURE__ */ (0, $.jsx)("p", {
							role: "status",
							className: "shrink-0 p-3 text-sm text-muted-foreground",
							children: q.capabilities.reason ?? "This Collection is read-only."
						}), /* @__PURE__ */ (0, $.jsx)(ke, {
							variant: "pane",
							schema: {
								fields: te,
								zodSettings: y.zodSettings ?? null
							},
							value: fe.row,
							mode: "edit",
							controlContext: ce,
							submitLabel: "Save row",
							disabled: !q.capabilities.canEdit,
							onSubmit: q.capabilities.canEdit ? async (e) => {
								if (!y || !_ || !fe?.row) return;
								if (!q?.capabilities?.canEdit) throw Error(q?.capabilities?.reason ?? "Collection editing is unavailable.");
								if (String(e.id) !== String(fe.row.id)) throw Error("The edited record id does not match the selected source row.");
								let t = ++L.current, n = A, r = () => P.current?.owner === N && P.current.page === w && P.current.selected === n && L.current === t;
								R({ error: null });
								try {
									if (await a(y, e), !r()) return;
									let t = ++I.current;
									F.current?.abort();
									let n = new AbortController();
									F.current = n;
									let i = await O(_.id, {
										skip: w * v,
										take: v
									}, n.signal);
									if (!r() || I.current !== t) return;
									let o = e.id;
									R({
										rows: i.rows,
										count: i.count,
										selected: o == null ? i.rows[0] ?? null : i.rows.find((e) => String(e.id) === String(o)) ?? i.rows[0] ?? null
									});
								} catch (e) {
									if (!r()) return;
									throw Z(e) || R({ error: e instanceof Error ? e.message : String(e) }), e;
								}
							} : void 0
						}, `${x}:${String(A.id ?? "")}`)] }) : A ? fe?.error ? /* @__PURE__ */ (0, $.jsxs)("div", {
							role: "alert",
							className: "overflow-auto p-3 space-y-2 text-sm",
							children: [/* @__PURE__ */ (0, $.jsx)("p", { children: fe.error }), /* @__PURE__ */ (0, $.jsx)(o, {
								variant: "outline",
								onClick: () => ue((e) => e + 1),
								children: "Retry source row"
							})]
						}) : /* @__PURE__ */ (0, $.jsx)("p", {
							role: "status",
							className: "p-3 text-sm text-muted-foreground",
							children: "Loading source row…"
						}) : /* @__PURE__ */ (0, $.jsx)("p", {
							className: "p-3 text-sm text-muted-foreground",
							children: "Select a row to edit its fields."
						})
					})]
				})]
			}) : /* @__PURE__ */ (0, $.jsx)("p", {
				className: "p-4 text-sm text-destructive",
				children: "The linked collection is unavailable. Open Settings to select another collection."
			}) : /* @__PURE__ */ (0, $.jsx)("p", {
				className: "p-4 text-sm text-muted-foreground",
				children: "Select a query or create one."
			})
		]
	}) : /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background",
		children: [/* @__PURE__ */ (0, $.jsx)("header", {
			"data-slot": "database-toolbar",
			className: "flex h-10 shrink-0 items-center justify-center gap-1.5 border-b border-border px-2 text-xs",
			children: /* @__PURE__ */ (0, $.jsx)("span", {
				className: "font-medium",
				children: "Queries"
			})
		}), /* @__PURE__ */ (0, $.jsx)("p", {
			className: "p-4 text-sm text-muted-foreground",
			children: "Queries require Data Layer v2 and Global Queries to be enabled."
		})]
	});
}
//#endregion
//#region src/components/database/CreateCollectionDialog.tsx
function qe({ schemas: e, onClose: t, onCreated: r }) {
	let [i, a] = (0, Q.useState)(!1), s = N("data_source_posts"), [c, l] = (0, Q.useState)({
		type: "object",
		title: "",
		objectNameSingular: "item",
		objectNamePlural: "",
		postType: "",
		markerSupport: !0,
		regionSupport: !1
	}), [u, d] = (0, Q.useState)([]), [f, p] = (0, Q.useState)(!1), [m, h] = (0, Q.useState)(null), [g, _] = (0, Q.useState)(0), [b, S] = (0, Q.useState)(!1), [C, T] = (0, Q.useState)(null), [E, D] = (0, Q.useState)(null), O = (0, Q.useRef)(null), k = (0, Q.useRef)(!1);
	(0, Q.useLayoutEffect)(() => {
		let e = {};
		return O.current = e, () => {
			O.current === e && (O.current = null);
		};
	}, []), (0, Q.useEffect)(() => {
		if (c.type !== "post" || !s) return;
		let e = new AbortController(), t = !0;
		return p(!0), h(null), n(e.signal).then((e) => {
			t && d(e);
		}).catch((e) => {
			t && h(e instanceof Error ? e.message : String(e));
		}).finally(() => {
			t && p(!1);
		}), () => {
			t = !1, e.abort();
		};
	}, [c.type, g]);
	let A = new Set(e.filter((e) => e.type === "post").map((e) => e.postType)), j = c.type === "post" && (f || !!m || !u.includes(c.postType ?? "") || A.has(c.postType)), M = b || !!E, P = (e) => {
		M || (l((t) => ({
			...t,
			...e
		})), T(null));
	}, F = async () => {
		if (c.type === "post" && !s) {
			a(!0);
			return;
		}
		let e = O.current;
		if (!e || k.current) return;
		if (!E) {
			if (!c.title.trim() || !c.objectNameSingular.trim() || !c.objectNamePlural.trim()) {
				T("Enter a title, singular name and plural name.");
				return;
			}
			if (j) {
				T("Choose an available WordPress post type.");
				return;
			}
			if (c.type === "post" && !c.markerSupport && !c.regionSupport) {
				T("Enable Marker support and/or Region support.");
				return;
			}
		}
		k.current = !0;
		let n = () => O.current === e;
		S(!0), T(null);
		try {
			let e = E ?? await v({ ...c });
			if (!n()) return;
			D(e), await r(e, n), n() && t();
		} catch (e) {
			n() && T(e instanceof Error ? e.message : String(e));
		} finally {
			k.current = !1, n() && S(!1);
		}
	};
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsx)(J, {
		feature: "data_source_posts",
		open: i,
		onOpenChange: a
	}), /* @__PURE__ */ (0, $.jsx)(ne, {
		open: !0,
		onOpenChange: (e) => {
			!e && !b && t();
		},
		children: /* @__PURE__ */ (0, $.jsxs)(y, {
			className: "max-h-[85vh] overflow-y-auto text-xs",
			showCloseButton: !b,
			children: [/* @__PURE__ */ (0, $.jsxs)(x, { children: [/* @__PURE__ */ (0, $.jsx)(w, { children: "New Collection" }), /* @__PURE__ */ (0, $.jsx)(z, { children: "Create a Collection or connect an existing WordPress post type." })] }), /* @__PURE__ */ (0, $.jsxs)("form", {
				className: "grid gap-4",
				onSubmit: (e) => {
					e.preventDefault(), F();
				},
				children: [
					/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, $.jsx)(q, {
							htmlFor: "new-collection-type",
							children: "Type"
						}), /* @__PURE__ */ (0, $.jsx)(Y, {
							id: "new-collection-type",
							value: c.type,
							disabled: M,
							onValueChange: (e) => {
								e === "post" && !s ? a(!0) : P({ type: e });
							},
							options: [{
								value: "object",
								label: "Collection"
							}, {
								value: "post",
								label: s ? "WordPress Post Type" : "WordPress Post Type · Premium"
							}]
						})]
					}),
					/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, $.jsx)(q, {
							htmlFor: "new-collection-title",
							children: "Title"
						}), /* @__PURE__ */ (0, $.jsx)(I, {
							id: "new-collection-title",
							value: c.title,
							disabled: M,
							onChange: (e) => P({ title: e.target.value }),
							placeholder: "Sales representatives"
						})]
					}),
					/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, $.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, $.jsx)(q, {
								htmlFor: "new-collection-singular",
								children: "Singular name"
							}), /* @__PURE__ */ (0, $.jsx)(I, {
								id: "new-collection-singular",
								value: c.objectNameSingular,
								disabled: M,
								onChange: (e) => P({ objectNameSingular: e.target.value }),
								placeholder: "sales_rep"
							})]
						}), /* @__PURE__ */ (0, $.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, $.jsx)(q, {
								htmlFor: "new-collection-plural",
								children: "Plural name"
							}), /* @__PURE__ */ (0, $.jsx)(I, {
								id: "new-collection-plural",
								value: c.objectNamePlural,
								disabled: M,
								onChange: (e) => P({ objectNamePlural: e.target.value }),
								placeholder: "sales_reps"
							})]
						})]
					}),
					/* @__PURE__ */ (0, $.jsx)("p", {
						className: "-mt-2 text-muted-foreground",
						children: "The Collection name is generated from the plural name and cannot be changed later."
					}),
					c.type === "post" ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "grid gap-1.5",
						children: [
							/* @__PURE__ */ (0, $.jsx)(q, {
								htmlFor: "new-collection-post-type",
								children: "Post type"
							}),
							/* @__PURE__ */ (0, $.jsx)(Y, {
								id: "new-collection-post-type",
								value: c.postType ?? "",
								onValueChange: (e) => P({ postType: e }),
								disabled: M || f || !!m,
								placeholder: f ? "Loading post types…" : "Choose post type",
								options: u.map((e) => ({
									value: e,
									label: A.has(e) ? `${e} (already connected)` : e,
									disabled: A.has(e)
								}))
							}),
							m ? /* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("p", {
								role: "alert",
								className: "text-destructive",
								children: m
							}), /* @__PURE__ */ (0, $.jsx)(o, {
								type: "button",
								size: "xs",
								variant: "outline",
								disabled: M,
								onClick: () => _((e) => e + 1),
								children: "Retry post types"
							})] }) : null
						]
					}), /* @__PURE__ */ (0, $.jsxs)("div", {
						className: "grid gap-3",
						children: [/* @__PURE__ */ (0, $.jsxs)("div", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, $.jsx)(G, {
								id: "new-collection-marker",
								checked: !!c.markerSupport,
								disabled: M,
								onCheckedChange: (e) => P({ markerSupport: e === !0 })
							}), /* @__PURE__ */ (0, $.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, $.jsx)(q, {
									htmlFor: "new-collection-marker",
									children: "Marker support"
								}), /* @__PURE__ */ (0, $.jsx)("p", {
									className: "text-muted-foreground",
									children: "Set a map location on the WordPress edit screen."
								})]
							})]
						}), /* @__PURE__ */ (0, $.jsxs)("div", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, $.jsx)(G, {
								id: "new-collection-regions",
								checked: !!c.regionSupport,
								disabled: M,
								onCheckedChange: (e) => P({ regionSupport: e === !0 })
							}), /* @__PURE__ */ (0, $.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, $.jsx)(q, {
									htmlFor: "new-collection-regions",
									children: "Region support"
								}), /* @__PURE__ */ (0, $.jsx)("p", {
									className: "text-muted-foreground",
									children: "Link posts to map regions from the WordPress edit screen."
								})]
							})]
						})]
					})] }) : null,
					C ? /* @__PURE__ */ (0, $.jsx)("p", {
						role: "alert",
						className: "text-destructive",
						children: C
					}) : null,
					/* @__PURE__ */ (0, $.jsxs)(U, { children: [/* @__PURE__ */ (0, $.jsx)(o, {
						type: "button",
						size: "sm",
						variant: "outline",
						disabled: b,
						onClick: t,
						children: "Cancel"
					}), /* @__PURE__ */ (0, $.jsx)(o, {
						type: "submit",
						size: "sm",
						disabled: b || !E && j,
						children: b ? "Saving…" : E ? "Reload catalog" : "Create"
					})] })
				]
			})]
		})
	})] });
}
//#endregion
//#region src/components/database/DatabaseSecondarySidebar.tsx
function Je({ selectedSchemaId: e, onSelectSchema: t, onSelectQuery: n, onOpenSchemaTab: r, onOpenQueryTab: a, onSectionChange: s, onCatalogReady: c, onQueryCatalogReady: u }) {
	let { section: f, setSection: p, schemas: h, schemasLoaded: g, loading: v, error: b, refreshSchemas: S, folders: C, queries: T, loadingQueries: D, queriesLoaded: O, queryError: k, refreshQueries: j, selectedQueryId: M, setSelectedQueryId: N, startQuery: F, queriesEnabled: L } = ze(), [R, ee] = (0, Q.useState)(""), [B, re] = (0, Q.useState)(!1), [V, H] = (0, Q.useState)(""), [oe, se] = (0, Q.useState)(/* @__PURE__ */ new Set()), [W, le] = (0, Q.useState)(null), [G, K] = (0, Q.useState)(""), [J, de] = (0, Q.useState)(null), [pe, Y] = (0, Q.useState)(!1), [he, ge] = (0, Q.useState)(!1), X = (0, Q.useRef)(null), _e = (0, Q.useRef)(null), ve = (0, Q.useRef)([]);
	(0, Q.useLayoutEffect)(() => {
		let e = {};
		return X.current = e, () => {
			X.current === e && (X.current = null);
		};
	}, []), (0, Q.useEffect)(() => {
		g && !v && !b && c?.(h, T);
	}, [
		g,
		v,
		b,
		c,
		T,
		h
	]), (0, Q.useEffect)(() => {
		O && !D && !k && u?.(T);
	}, [
		O,
		D,
		k,
		T,
		u
	]);
	let ye = T.find((e) => e.id === M)?.folderId;
	(0, Q.useEffect)(() => {
		ye != null && se((e) => new Set(e).add(ye));
	}, [ye, M]);
	let be = f === "collections" ? R : V, Z = be.trim().toLowerCase(), xe = (0, Q.useMemo)(() => Z ? h.filter((e) => d(e).toLowerCase().includes(Z) || e.name.toLowerCase().includes(Z)) : h, [h, Z]), Se = (0, Q.useMemo)(() => T.filter((e) => !Z || e.name.toLowerCase().includes(Z)), [T, Z]), Ce = C.map((e) => ({
		folder: e,
		items: (Z && e.title.toLowerCase().includes(Z) ? T : Se).filter((t) => t.folderId === e.id)
	})).filter(({ folder: e, items: t }) => !Z || e.title.toLowerCase().includes(Z) || t.length > 0), we = (Z && "unfiled".includes(Z) ? T : Se).filter((e) => e.folderId === null || !C.some((t) => t.id === e.folderId)), Te = (e) => {
		re(!1), p(e), s?.(e);
	}, Ee = (e) => {
		N(e.id), re(!1), p("queries"), n ? n(e) : s?.("queries");
	}, De = (e) => {
		F(e), s?.("queries");
	}, Oe = (e) => se((t) => {
		let n = new Set(t);
		return n.has(e) ? n.delete(e) : n.add(e), n;
	}), ke = (e) => {
		_e.current || (le(e), K(e.type === "create" ? "" : e.folder.title), de(null), ge(!1));
	}, Ae = async () => {
		let e = X.current;
		if (!e || !W || _e.current) return;
		let t = W, n = G.trim(), r = {}, i = () => X.current === e && _e.current === r;
		_e.current = r;
		try {
			if (!he && t.type !== "delete" && !n) throw Error("Enter a folder title.");
			if (Y(!0), de(null), !he) {
				if (t.type === "create" ? await ae(n) : t.type === "rename" ? await P(t.folder.id, n) : await te(t.folder.id), !i()) return;
				ge(!0);
			}
			if (await j(i), !i()) return;
			le(null), ge(!1), de(null);
		} catch (e) {
			i() && de(e instanceof Error ? e.message : String(e));
		} finally {
			i() && (_e.current = null, Y(!1));
		}
	}, je = (e) => /* @__PURE__ */ (0, $.jsxs)("div", {
		className: l("group/database-resource relative rounded-md hover:bg-accent", M === e.id && "bg-accent font-medium"),
		children: [/* @__PURE__ */ (0, $.jsxs)("button", {
			type: "button",
			onClick: () => Ee(e),
			className: l("flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-1.5 pr-8 text-left text-sm", M === e.id && "bg-accent font-medium"),
			title: e.name,
			"data-query-id": e.id,
			"aria-current": M === e.id ? "true" : void 0,
			children: [/* @__PURE__ */ (0, $.jsx)(Ie, { className: "size-3.5 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, $.jsx)("span", {
				className: "truncate font-mono text-xs",
				children: e.name
			})]
		}), a ? /* @__PURE__ */ (0, $.jsxs)(A, { children: [/* @__PURE__ */ (0, $.jsx)(ce, {
			asChild: !0,
			children: /* @__PURE__ */ (0, $.jsx)(o, {
				type: "button",
				variant: "ghost",
				size: "icon-xs",
				className: "absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 hover:text-foreground group-hover/database-resource:opacity-100 group-focus-within/database-resource:opacity-100",
				"aria-label": `Open query ${e.name} in new tab`,
				onClick: (t) => {
					t.stopPropagation(), a(e);
				},
				children: /* @__PURE__ */ (0, $.jsx)(Le, { className: "size-3.5" })
			})
		}), /* @__PURE__ */ (0, $.jsx)(E, { children: "Open in new MapSVG tab" })] }) : null]
	}, e.id);
	return /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
		/* @__PURE__ */ (0, $.jsxs)("aside", {
			className: "flex h-full w-56 shrink-0 flex-col border-r border-border bg-background",
			children: [
				/* @__PURE__ */ (0, $.jsx)("header", {
					className: "flex h-10 shrink-0 gap-1 border-b border-border p-1.5",
					role: "tablist",
					"aria-label": "Database sections",
					children: ["collections", "queries"].map((e, t) => /* @__PURE__ */ (0, $.jsx)("button", {
						type: "button",
						role: "tab",
						ref: (e) => {
							ve.current[t] = e;
						},
						tabIndex: f === e ? 0 : -1,
						onKeyDown: (e) => {
							let n = e.key === "Home" ? 0 : e.key === "End" ? 1 : e.key === "ArrowRight" || e.key === "ArrowLeft" ? 1 - t : null;
							n !== null && (e.preventDefault(), Te(n === 0 ? "collections" : "queries"), ve.current[n]?.focus());
						},
						"aria-selected": f === e,
						onClick: () => Te(e),
						className: l("flex-1 rounded-md px-2 py-1.5 text-xs font-medium hover:bg-accent", f === e ? "bg-accent text-foreground" : "text-muted-foreground"),
						children: e === "collections" ? "Collections" : "Queries"
					}, e))
				}),
				/* @__PURE__ */ (0, $.jsx)("div", {
					"data-slot": "database-search-toolbar",
					className: "flex h-10 shrink-0 items-center border-b border-border px-2",
					children: /* @__PURE__ */ (0, $.jsxs)("div", {
						className: "relative w-full min-w-0",
						children: [/* @__PURE__ */ (0, $.jsx)(ue, { className: "pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, $.jsx)(I, {
							value: be,
							onChange: (e) => f === "collections" ? ee(e.target.value) : H(e.target.value),
							"aria-label": f === "collections" ? "Search collections" : "Search queries",
							placeholder: f === "collections" ? void 0 : "Search queries…",
							className: "h-7! pl-8! text-xs!"
						})]
					})
				}),
				f === "collections" && ie().user?.isAdmin ? /* @__PURE__ */ (0, $.jsx)("div", {
					className: "border-b border-border p-2",
					children: /* @__PURE__ */ (0, $.jsxs)(o, {
						type: "button",
						variant: "outline",
						size: "xs",
						className: "w-full",
						onClick: () => re(!0),
						children: [/* @__PURE__ */ (0, $.jsx)(fe, {}), " New"]
					})
				}) : null,
				f === "queries" && L ? /* @__PURE__ */ (0, $.jsxs)("div", {
					className: "flex gap-1 border-b border-border p-2",
					children: [/* @__PURE__ */ (0, $.jsxs)(o, {
						type: "button",
						variant: "outline",
						size: "xs",
						className: "flex-1",
						onClick: () => ke({ type: "create" }),
						children: [/* @__PURE__ */ (0, $.jsx)(fe, {}), "Folder"]
					}), /* @__PURE__ */ (0, $.jsxs)(o, {
						type: "button",
						variant: "outline",
						size: "xs",
						className: "flex-1",
						onClick: () => De(null),
						children: [/* @__PURE__ */ (0, $.jsx)(fe, {}), "Query"]
					})]
				}) : null,
				/* @__PURE__ */ (0, $.jsx)("nav", {
					className: l("min-h-0 flex-1 overflow-y-auto", f === "collections" ? "p-1.5" : "p-2"),
					"aria-label": f === "collections" ? "Database tables" : "Database queries",
					children: f === "collections" ? v ? /* @__PURE__ */ (0, $.jsx)("p", {
						className: "px-2 py-2 text-xs text-muted-foreground",
						children: "Loading…"
					}) : b ? /* @__PURE__ */ (0, $.jsxs)("div", {
						className: "px-2 py-2 text-xs",
						children: [/* @__PURE__ */ (0, $.jsx)("p", {
							role: "alert",
							className: "text-destructive",
							children: b
						}), /* @__PURE__ */ (0, $.jsx)(o, {
							size: "xs",
							variant: "outline",
							onClick: () => void S().catch(() => {}),
							children: "Retry collections"
						})]
					}) : xe.length === 0 ? /* @__PURE__ */ (0, $.jsx)("p", {
						className: "px-2 py-2 text-xs text-muted-foreground",
						children: "No tables."
					}) : /* @__PURE__ */ (0, $.jsx)("div", {
						className: "flex flex-col gap-0.5",
						children: xe.map((n) => {
							let i = String(n.id), a = d(n);
							return /* @__PURE__ */ (0, $.jsxs)("div", {
								className: l("group/database-resource relative rounded-md hover:bg-accent", e === i && "bg-accent font-medium"),
								children: [/* @__PURE__ */ (0, $.jsxs)("button", {
									type: "button",
									onClick: () => {
										p("collections"), t(n);
									},
									className: l("flex w-full min-w-0 items-center gap-1.5 rounded-md px-1.5 py-1 pr-8 text-left text-xs", e === i && "bg-accent font-medium"),
									title: n.name,
									"data-schema-id": i,
									"aria-current": e === i ? "true" : void 0,
									children: [/* @__PURE__ */ (0, $.jsx)(me, { className: "size-3.5 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, $.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, $.jsx)("span", {
											className: "block truncate",
											children: a
										}), a === n.name ? null : /* @__PURE__ */ (0, $.jsx)("span", {
											className: "block truncate font-mono text-[10px] text-muted-foreground",
											children: n.name
										})]
									})]
								}), r ? /* @__PURE__ */ (0, $.jsxs)(A, { children: [/* @__PURE__ */ (0, $.jsx)(ce, {
									asChild: !0,
									children: /* @__PURE__ */ (0, $.jsx)(o, {
										type: "button",
										variant: "ghost",
										size: "icon-xs",
										className: "absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 hover:text-foreground group-hover/database-resource:opacity-100 group-focus-within/database-resource:opacity-100",
										"aria-label": `Open collection ${a} in new tab`,
										onClick: (e) => {
											e.stopPropagation(), r(n);
										},
										children: /* @__PURE__ */ (0, $.jsx)(Le, { className: "size-3.5" })
									})
								}), /* @__PURE__ */ (0, $.jsx)(E, { children: "Open in new MapSVG tab" })] }) : null]
							}, i);
						})
					}) : L ? D ? /* @__PURE__ */ (0, $.jsx)("p", {
						className: "px-2 py-2 text-xs text-muted-foreground",
						children: "Loading…"
					}) : k ? /* @__PURE__ */ (0, $.jsxs)("div", {
						className: "px-2 py-2 text-xs",
						children: [/* @__PURE__ */ (0, $.jsx)("p", {
							role: "alert",
							className: "text-destructive",
							children: k
						}), /* @__PURE__ */ (0, $.jsx)(o, {
							size: "xs",
							variant: "outline",
							onClick: () => void j().catch(() => {}),
							children: "Retry queries"
						})]
					}) : /* @__PURE__ */ (0, $.jsxs)("div", {
						className: "flex flex-col gap-1",
						children: [
							Ce.map(({ folder: e, items: t }) => {
								let n = Z ? !0 : oe.has(e.id);
								return /* @__PURE__ */ (0, $.jsxs)("div", {
									"data-query-folder-id": e.id,
									children: [/* @__PURE__ */ (0, $.jsxs)("div", {
										className: "group flex items-center rounded-md hover:bg-accent",
										children: [
											/* @__PURE__ */ (0, $.jsxs)("button", {
												type: "button",
												className: "flex min-w-0 flex-1 items-center gap-1.5 px-1 py-1.5 text-left text-sm",
												"aria-expanded": n,
												onClick: () => Oe(e.id),
												children: [
													/* @__PURE__ */ (0, $.jsx)(Pe, { className: l("size-3.5 shrink-0 text-muted-foreground", n && "rotate-90") }),
													/* @__PURE__ */ (0, $.jsx)(i, { className: "size-3.5 shrink-0 text-muted-foreground" }),
													/* @__PURE__ */ (0, $.jsx)("span", {
														className: "truncate",
														title: e.title,
														children: e.title
													})
												]
											}),
											/* @__PURE__ */ (0, $.jsx)("button", {
												type: "button",
												className: "hidden p-1 text-muted-foreground hover:text-foreground group-hover:block group-focus-within:block focus:block",
												"aria-label": `New query in ${e.title}`,
												onClick: () => De(e.id),
												children: /* @__PURE__ */ (0, $.jsx)(fe, { className: "size-3.5" })
											}),
											/* @__PURE__ */ (0, $.jsx)("button", {
												type: "button",
												className: "hidden p-1 text-muted-foreground hover:text-foreground group-hover:block group-focus-within:block focus:block",
												"aria-label": `Rename ${e.title}`,
												onClick: () => ke({
													type: "rename",
													folder: e
												}),
												children: /* @__PURE__ */ (0, $.jsx)(_, { className: "size-3.5" })
											}),
											/* @__PURE__ */ (0, $.jsx)("button", {
												type: "button",
												className: "hidden p-1 text-muted-foreground hover:text-destructive group-hover:block group-focus-within:block focus:block",
												"aria-label": `Delete ${e.title}`,
												onClick: () => ke({
													type: "delete",
													folder: e
												}),
												children: /* @__PURE__ */ (0, $.jsx)(m, { className: "size-3.5" })
											})
										]
									}), n ? /* @__PURE__ */ (0, $.jsx)("div", {
										className: "ml-3 border-l pl-2",
										children: t.length ? t.map(je) : /* @__PURE__ */ (0, $.jsx)("p", {
											className: "px-2 py-1 text-xs text-muted-foreground",
											children: "Empty folder"
										})
									}) : null]
								}, e.id);
							}),
							we.length > 0 ? /* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("div", {
								className: "px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground",
								children: "Unfiled"
							}), we.map(je)] }) : null,
							Z && Ce.length === 0 && we.length === 0 ? /* @__PURE__ */ (0, $.jsx)("p", {
								className: "px-2 py-2 text-xs text-muted-foreground",
								children: "No matching queries or folders."
							}) : null,
							!Z && T.length === 0 && C.length === 0 ? /* @__PURE__ */ (0, $.jsx)("p", {
								className: "px-2 py-2 text-xs text-muted-foreground",
								children: "No queries yet."
							}) : null
						]
					}) : /* @__PURE__ */ (0, $.jsx)("p", {
						className: "px-2 py-2 text-xs text-muted-foreground",
						children: "Queries require Global Queries to be enabled."
					})
				})
			]
		}),
		B && f === "collections" ? /* @__PURE__ */ (0, $.jsx)(qe, {
			schemas: h,
			onClose: () => re(!1),
			onCreated: async (e, n) => {
				let r = await S(n);
				if (!n()) return;
				let i = r.find((t) => String(t.id) === String(e.id));
				if (!i) throw Error("The created Collection is not in the catalog. Reload the catalog to continue.");
				ee(""), t(i);
			}
		}) : null,
		/* @__PURE__ */ (0, $.jsx)(ne, {
			open: W !== null,
			onOpenChange: (e) => {
				!e && !_e.current && le(null);
			},
			children: /* @__PURE__ */ (0, $.jsxs)(y, {
				className: "sm:max-w-md",
				children: [
					/* @__PURE__ */ (0, $.jsxs)(x, { children: [/* @__PURE__ */ (0, $.jsx)(w, { children: W?.type === "create" ? "New folder" : W?.type === "rename" ? "Rename folder" : "Delete folder" }), W?.type === "delete" ? /* @__PURE__ */ (0, $.jsxs)(z, { children: [
						"Queries in “",
						W.folder.title,
						"” will move to Unfiled."
					] }) : null] }),
					W && W.type !== "delete" ? /* @__PURE__ */ (0, $.jsxs)("div", {
						className: "grid gap-2",
						children: [/* @__PURE__ */ (0, $.jsx)(q, {
							htmlFor: "global-query-folder-title",
							children: "Folder title"
						}), /* @__PURE__ */ (0, $.jsx)(I, {
							id: "global-query-folder-title",
							autoFocus: !0,
							disabled: pe || he,
							value: G,
							onChange: (e) => {
								K(e.target.value), de(null);
							},
							onKeyDown: (e) => {
								e.key === "Enter" && (e.preventDefault(), Ae());
							}
						})]
					}) : null,
					J ? /* @__PURE__ */ (0, $.jsx)("p", {
						role: "alert",
						className: "text-sm text-destructive",
						children: J
					}) : null,
					/* @__PURE__ */ (0, $.jsxs)(U, { children: [/* @__PURE__ */ (0, $.jsx)(o, {
						type: "button",
						variant: "outline",
						disabled: pe,
						onClick: () => le(null),
						children: "Cancel"
					}), /* @__PURE__ */ (0, $.jsx)(o, {
						type: "button",
						variant: W?.type === "delete" ? "destructive" : "default",
						disabled: pe,
						onClick: () => void Ae(),
						children: he ? "Reload catalog" : W?.type === "create" ? "Create" : W?.type === "rename" ? "Save" : "Delete"
					})] })
				]
			})
		})
	] });
}
//#endregion
//#region src/components/database/import/DatabaseCsvImport.tsx
function Ye(e) {
	let t = window.MapSVG?.extensions?.get("admin.panel", "database-import");
	return t ? /* @__PURE__ */ (0, $.jsx)(t.Panel, { ...e }) : null;
}
//#endregion
//#region src/components/database/CollectionSettings.tsx
var Xe = (e, t) => e == null ? t : e === !0 || e === 1 || [
	"true",
	"1",
	"yes",
	"on"
].includes(String(e).toLowerCase());
function Ze({ schema: e, refreshCatalog: t }) {
	let [n, r] = (0, Q.useState)(() => ({
		title: e.title ?? "",
		objectNameSingular: e.objectNameSingular ?? "",
		objectNamePlural: e.objectNamePlural ?? "",
		markerSupport: Xe(e.markerSupport, !0),
		regionSupport: Xe(e.regionSupport, !1)
	})), [i, a] = (0, Q.useState)(null), [c, l] = (0, Q.useState)(!1), [u, f] = (0, Q.useState)(null), [p, m] = (0, Q.useState)(null), h = (0, Q.useRef)(null), g = (0, Q.useRef)(!1);
	(0, Q.useLayoutEffect)(() => {
		let e = {};
		return h.current = e, () => {
			h.current === e && (h.current = null);
		};
	}, []);
	let _ = ie().user?.isAdmin === !0, v = e.type !== "api", y = e.type !== "region" && !e.bindings?.svg, x = !_ || c || !!u, C = (e) => {
		x || (r((t) => ({
			...t,
			...e
		})), m(null));
	}, w = async (r) => {
		let i = h.current;
		if (!i || g.current || !_) return;
		let o = u ?? r;
		if (!u) {
			if (o === "clear" && !v || o === "delete" && !y) return;
			if (o === "save") {
				if (!n.title.trim() || !n.objectNameSingular.trim() || !n.objectNamePlural.trim()) {
					m("Enter a title, singular name and plural name.");
					return;
				}
				if (e.type === "post" && !n.markerSupport && !n.regionSupport) {
					m("Enable Marker support and/or Region support.");
					return;
				}
			}
		}
		g.current = !0;
		let c = () => h.current === i;
		l(!0), m(null);
		try {
			if (!u) {
				if (o === "save" ? await s(e, { ...n }) : o === "clear" ? await H(e) : await b(e), !c()) return;
				if (window.dispatchEvent(new CustomEvent("mapsvg:repository-mutation", { detail: {
					schema: e.name,
					action: o === "clear" ? "cleared" : o === "delete" ? "deleted" : "updated"
				} })), M.success(o === "save" ? "Collection settings saved." : o === "clear" ? "Table cleared." : "Collection deleted."), o === "clear") {
					a(null);
					return;
				}
				f(o);
			}
			if (await t(c), !c()) return;
			f(null), a(null);
		} catch (e) {
			c() && m(e instanceof Error ? e.message : String(e));
		} finally {
			g.current = !1, c() && l(!1);
		}
	};
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "min-h-0 flex-1 overflow-y-auto p-4",
		children: [/* @__PURE__ */ (0, $.jsxs)("div", {
			className: "mx-auto grid w-full max-w-xl gap-6 text-xs",
			children: [/* @__PURE__ */ (0, $.jsxs)("form", {
				className: "grid gap-4",
				onSubmit: (e) => {
					e.preventDefault(), w("save");
				},
				children: [
					/* @__PURE__ */ (0, $.jsxs)("div", { children: [/* @__PURE__ */ (0, $.jsx)("h2", {
						className: "text-sm font-medium",
						children: "Collection settings"
					}), /* @__PURE__ */ (0, $.jsxs)("p", {
						className: "mt-1 text-muted-foreground",
						children: ["Collection name: ", /* @__PURE__ */ (0, $.jsx)("span", {
							className: "font-mono",
							children: e.name
						})]
					})] }),
					_ ? null : /* @__PURE__ */ (0, $.jsx)("p", {
						className: "text-muted-foreground",
						children: "Only administrators can change Collection settings."
					}),
					/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "grid gap-1.5",
						children: [/* @__PURE__ */ (0, $.jsx)(q, {
							htmlFor: "collection-settings-title",
							children: "Title"
						}), /* @__PURE__ */ (0, $.jsx)(I, {
							id: "collection-settings-title",
							value: n.title,
							disabled: x,
							onChange: (e) => C({ title: e.target.value })
						})]
					}),
					/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, $.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, $.jsx)(q, {
								htmlFor: "collection-settings-singular",
								children: "Singular name"
							}), /* @__PURE__ */ (0, $.jsx)(I, {
								id: "collection-settings-singular",
								value: n.objectNameSingular,
								disabled: x,
								onChange: (e) => C({ objectNameSingular: e.target.value })
							})]
						}), /* @__PURE__ */ (0, $.jsxs)("div", {
							className: "grid gap-1.5",
							children: [/* @__PURE__ */ (0, $.jsx)(q, {
								htmlFor: "collection-settings-plural",
								children: "Plural name"
							}), /* @__PURE__ */ (0, $.jsx)(I, {
								id: "collection-settings-plural",
								value: n.objectNamePlural,
								disabled: x,
								onChange: (e) => C({ objectNamePlural: e.target.value })
							})]
						})]
					}),
					/* @__PURE__ */ (0, $.jsx)("p", {
						className: "-mt-2 text-muted-foreground",
						children: "Changing these labels does not rename the Collection or its table."
					}),
					e.type === "post" ? /* @__PURE__ */ (0, $.jsxs)($.Fragment, { children: [
						/* @__PURE__ */ (0, $.jsxs)("p", {
							className: "text-muted-foreground",
							children: ["WordPress post type: ", /* @__PURE__ */ (0, $.jsx)("span", {
								className: "font-mono",
								children: e.postType
							})]
						}),
						/* @__PURE__ */ (0, $.jsxs)("div", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, $.jsx)(G, {
								id: "collection-settings-marker",
								checked: !!n.markerSupport,
								disabled: x,
								onCheckedChange: (e) => C({ markerSupport: e === !0 })
							}), /* @__PURE__ */ (0, $.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, $.jsx)(q, {
									htmlFor: "collection-settings-marker",
									children: "Marker support"
								}), /* @__PURE__ */ (0, $.jsx)("p", {
									className: "text-muted-foreground",
									children: "Set a map location on the WordPress edit screen."
								})]
							})]
						}),
						/* @__PURE__ */ (0, $.jsxs)("div", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, $.jsx)(G, {
								id: "collection-settings-region",
								checked: !!n.regionSupport,
								disabled: x,
								onCheckedChange: (e) => C({ regionSupport: e === !0 })
							}), /* @__PURE__ */ (0, $.jsxs)("div", {
								className: "grid gap-1",
								children: [/* @__PURE__ */ (0, $.jsx)(q, {
									htmlFor: "collection-settings-region",
									children: "Region support"
								}), /* @__PURE__ */ (0, $.jsx)("p", {
									className: "text-muted-foreground",
									children: "Link posts to map regions from the WordPress edit screen."
								})]
							})]
						})
					] }) : null,
					p && !i ? /* @__PURE__ */ (0, $.jsx)("p", {
						role: "alert",
						className: "text-destructive",
						children: p
					}) : null,
					/* @__PURE__ */ (0, $.jsx)("div", { children: /* @__PURE__ */ (0, $.jsx)(o, {
						type: "submit",
						size: "sm",
						disabled: !_ || c,
						children: c ? "Saving…" : u ? "Reload catalog" : "Save changes"
					}) })
				]
			}), /* @__PURE__ */ (0, $.jsxs)("section", {
				className: "rounded-md border border-destructive/30 p-4",
				children: [
					/* @__PURE__ */ (0, $.jsx)("h2", {
						className: "mb-4 text-sm font-medium text-destructive",
						children: "Danger zone"
					}),
					/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "flex items-center justify-between gap-4",
						children: [/* @__PURE__ */ (0, $.jsxs)("div", { children: [
							/* @__PURE__ */ (0, $.jsx)("p", {
								className: "font-medium",
								children: "Clear table"
							}),
							/* @__PURE__ */ (0, $.jsx)("p", {
								className: "mt-1 text-muted-foreground",
								children: "Delete all records and keep the Collection and its fields."
							}),
							v ? null : /* @__PURE__ */ (0, $.jsx)("p", {
								className: "mt-1 text-muted-foreground",
								children: "API sources do not have a local table to clear."
							})
						] }), /* @__PURE__ */ (0, $.jsx)(o, {
							type: "button",
							size: "sm",
							variant: "outline",
							className: "shrink-0 text-destructive hover:text-destructive",
							disabled: x || !v,
							onClick: () => {
								m(null), a("clear");
							},
							children: "Clear table"
						})]
					}),
					/* @__PURE__ */ (0, $.jsxs)("div", {
						className: "mt-4 flex items-center justify-between gap-4 border-t border-destructive/20 pt-4",
						children: [/* @__PURE__ */ (0, $.jsxs)("div", { children: [
							/* @__PURE__ */ (0, $.jsx)("p", {
								className: "font-medium",
								children: "Delete table"
							}),
							/* @__PURE__ */ (0, $.jsx)("p", {
								className: "mt-1 text-muted-foreground",
								children: "Delete this Collection, its fields and all records."
							}),
							y ? null : /* @__PURE__ */ (0, $.jsx)("p", {
								className: "mt-1 text-muted-foreground",
								children: "SVG-bound region Collections cannot be deleted."
							})
						] }), /* @__PURE__ */ (0, $.jsx)(o, {
							type: "button",
							size: "sm",
							variant: "destructive",
							className: "shrink-0",
							disabled: x || !y,
							onClick: () => {
								m(null), a("delete");
							},
							children: "Delete table"
						})]
					})
				]
			})]
		}), /* @__PURE__ */ (0, $.jsx)(ee, {
			open: i !== null,
			onOpenChange: (e) => {
				!e && !c && a(null);
			},
			children: /* @__PURE__ */ (0, $.jsxs)(T, { children: [
				/* @__PURE__ */ (0, $.jsxs)(j, { children: [/* @__PURE__ */ (0, $.jsx)(D, { children: i === "clear" ? "Clear table?" : "Delete table?" }), /* @__PURE__ */ (0, $.jsxs)(V, { children: [
					i === "clear" ? `Delete every record in “${d(e)}”? Its fields and settings will remain.` : `Delete “${d(e)}”, its fields and all records? Queries using this Collection must be rebound first.`,
					e.type === "post" ? " WordPress posts and their metadata will remain." : null,
					e.type === "post" && i === "clear" ? " Saving a post again may recreate its MapSVG record." : null,
					e.type === "api" ? " External API data will remain." : null,
					" This action cannot be undone."
				] })] }),
				p ? /* @__PURE__ */ (0, $.jsx)("p", {
					role: "alert",
					className: "text-xs text-destructive",
					children: p
				}) : null,
				/* @__PURE__ */ (0, $.jsxs)(B, { children: [/* @__PURE__ */ (0, $.jsx)(S, {
					size: "sm",
					disabled: c,
					children: "Cancel"
				}), /* @__PURE__ */ (0, $.jsx)(oe, {
					size: "sm",
					variant: "destructive",
					disabled: c,
					onClick: (e) => {
						e.preventDefault(), i && w(i);
					},
					children: c ? "Working…" : u ? "Reload catalog" : i === "clear" ? "Clear table" : "Delete table"
				})] })
			] })
		})]
	});
}
//#endregion
//#region src/lib/duplicate-collection-record.ts
var Qe = (e) => e === !0 || e === 1 || typeof e == "string" && [
	"1",
	"true",
	"on",
	"yes"
].includes(e.trim().toLowerCase());
function $e(e, t) {
	return structuredClone(Object.fromEntries((e.fields ?? []).filter((e) => e.name !== "id" && e.type?.toLowerCase() !== "id" && !Qe(e.readonly) && Object.prototype.hasOwnProperty.call(t, e.name)).map((e) => [e.name, t[e.name]])));
}
//#endregion
//#region src/components/database/DatabaseTableWorkspace.tsx
var et = {}, tt = "database-table-schema-form";
function nt({ schemaId: e }) {
	let n = ie().databaseImportEnabled, { schemas: r, loading: i, error: s, refreshSchemas: u } = ze(), [f, p] = (0, Q.useState)("rows"), h = f, [g, _] = (0, Q.useState)([]), [v, y] = (0, Q.useState)(null), [b, x] = (0, Q.useState)(null), [S, w] = (0, Q.useState)(!1), [T, D] = (0, Q.useState)(null), [O, k] = (0, Q.useState)({
		key: "",
		pageIndex: 0,
		search: ""
	}), [j, M] = (0, Q.useState)(0), [P, F] = (0, Q.useState)(null), [I, z] = (0, Q.useState)(null), [ee, te] = (0, Q.useState)({
		dirty: !1,
		valid: !0
	}), B = r.find((t) => String(t.id) === e) ?? null, ne = R(B) && !N("data_source_posts"), re = Ae(B), V = Ee(B), H = (0, Q.useMemo)(() => B, [re]), ae = (0, Q.useMemo)(() => ({}), [e, re]), U = b?.collection === ae, oe = `${e}:${re}`, W = O.key === oe ? O.pageIndex : 0, le = O.key === oe ? O.search : "", ue = (0, Q.useMemo)(() => ({}), [
		ae,
		W,
		le
	]), G = T?.owner === ue ? T.result : null, K = (e) => D(e ? {
		owner: ue,
		result: e
	} : null), q = {
		page: W + 1,
		perpage: 50,
		search: le
	}, J = (0, Q.useMemo)(() => ({}), [
		ue,
		h,
		U,
		h === "rows" ? v?.id : null
	]), Y = (0, Q.useRef)(null), me = (0, Q.useRef)(h);
	(0, Q.useEffect)(() => {
		me.current === "import" && h === "rows" && M((e) => e + 1), me.current = h;
	}, [h]);
	let X = (0, Q.useRef)(0), _e = (0, Q.useRef)(0);
	(0, Q.useLayoutEffect)(() => (Y.current = {
		collection: ae,
		query: ue,
		view: J,
		creating: U
	}, () => {
		Y.current = null, _e.current++;
	}), [
		ae,
		ue,
		J
	]);
	let ye = (0, Q.useMemo)(() => H?.fields ?? [], [H]), be = We(r), xe = (0, Q.useCallback)((e) => V.remember({ regionsTableName: e }), [V.remember]), Se = (0, Q.useCallback)((e) => V.remember({ mapId: e }), [V.remember]), Ce = (0, Q.useCallback)((e) => V.remember({ defaultMarkerImage: e }), [V.remember]), we = (0, Q.useMemo)(() => Ge(r, {
		tableName: V.defaults.regionsTableName ?? "",
		rememberSource: xe,
		preferenceKey: String(e),
		preferenceError: V.error
	}), [
		be,
		V.defaults.regionsTableName,
		xe,
		e,
		V.error
	]), De = (0, Q.useMemo)(() => Fe({
		markerImages: ie().markerImages,
		markerDefaults: {
			image: V.defaults.defaultMarkerImage,
			rememberImage: Ce
		},
		picker: {
			mapId: V.defaults.mapId ?? 0,
			rememberMap: Se,
			error: V.error
		}
	}), [
		V.defaults.mapId,
		V.defaults.defaultMarkerImage,
		Ce,
		Se,
		V.error
	]), Oe = (0, Q.useMemo)(() => ({ [ve]: {
		media: pe(),
		posts: ge()
	} }), []), je = (0, Q.useMemo)(() => ({
		...Oe,
		[Te]: De,
		[ve]: {
			...Oe[ve],
			regions: we
		}
	}), [
		Oe,
		we,
		De
	]);
	(0, Q.useEffect)(() => {
		p("rows"), x(null), te({
			dirty: !1,
			valid: !0
		});
	}, [e]);
	let Pe = (0, Q.useCallback)((e) => {
		te((t) => t.dirty === e.dirty && t.valid === e.valid ? t : e);
	}, []);
	(0, Q.useEffect)(() => {
		let e = ++X.current;
		if (!H || ne) {
			_([]), y(null), w(!1), z(null);
			return;
		}
		let t = !1, n = () => !t && Y.current?.query === ue && X.current === e;
		w(!0), z(null), y(null), x(null), K(null);
		let r = new AbortController();
		return se(H, q, r.signal).then((e) => {
			let t = e.items;
			n() && K(e), n() && (_(t), y(t[0] ?? null));
		}).catch((e) => {
			n() && (_([]), z(e instanceof Error ? e.message : String(e)));
		}).finally(() => {
			n() && w(!1);
		}), () => {
			t = !0, r.abort();
		};
	}, [
		ue,
		H,
		j,
		ne
	]), (0, Q.useEffect)(() => {
		if (!H) return;
		let e = (e) => {
			let t = e.detail;
			if (t?.schema !== H.name) return;
			if (t.action === "cleared" || t.action === "deleted") {
				X.current++, _([]), y(null), x(null), K(null), w(!1), z(null), t.action === "cleared" && (k({
					key: oe,
					pageIndex: 0,
					search: ""
				}), M((e) => e + 1));
				return;
			}
			let n = ++X.current, r = () => Y.current?.query === ue && X.current === n, i = () => r() && Y.current?.view === J;
			se(H, q).then((e) => {
				if (!r()) return;
				let t = e.items;
				if (K(e), _(t), !i()) {
					Y.current?.creating || y((e) => e ?? t[0] ?? null);
					return;
				}
				y((e) => {
					let n = e?.id;
					return n == null ? t[0] ?? null : t.find((e) => String(e.id) === String(n)) ?? t[0] ?? null;
				}), z(null);
			}).catch((e) => {
				r() && (K(null), z(e instanceof Error ? e.message : String(e)));
			}).finally(() => {
				r() && w(!1);
			});
		};
		return window.addEventListener("mapsvg:repository-mutation", e), () => window.removeEventListener("mapsvg:repository-mutation", e);
	}, [
		J,
		H,
		ue
	]);
	let Ie = () => {
		let e = ++_e.current, t = null;
		return {
			ownsMutation: () => Y.current?.view === J && _e.current === e && (t === null || X.current === t),
			beginRead: () => {
				t = ++X.current;
			}
		};
	}, Le = async (e) => {
		if (!H || !G?.capabilities.canCreate || P === J) return;
		let { ownsMutation: t, beginRead: n } = Ie();
		F(J), z(null);
		try {
			let r = await L(H, e);
			if (!t()) return;
			n();
			let i = await se(H, q);
			if (!t()) return;
			let a = i.items;
			K(i);
			let o = r.id;
			_(a), y(o == null ? a[0] ?? r : a.find((e) => String(e.id) === String(o)) ?? r), x(null);
		} catch (e) {
			if (!t()) return;
			throw Z(e) || (K(null), z(e instanceof Error ? e.message : String(e))), e;
		} finally {
			F((e) => e === J ? null : e);
		}
	}, Re = async (e) => {
		if (!H || !G?.capabilities.canEdit || P === J) return;
		let { ownsMutation: t, beginRead: n } = Ie();
		F(J), z(null);
		try {
			if (await a(H, e), !t()) return;
			n();
			let r = await se(H, q);
			if (!t()) return;
			let i = r.items;
			K(r), _(i);
			let o = e.id;
			y(o == null ? i[0] ?? null : i.find((e) => String(e.id) === String(o)) ?? i[0] ?? null);
		} catch (e) {
			if (!t()) return;
			throw Z(e) || (K(null), z(e instanceof Error ? e.message : String(e))), e;
		} finally {
			F((e) => e === J ? null : e);
		}
	}, Be = async () => {
		if (!H || !G?.capabilities.canDelete || P === J || v?.id == null || !window.confirm("Delete this record?")) return;
		let { ownsMutation: e, beginRead: t } = Ie(), n = v.id;
		F(J), z(null);
		try {
			if (await C(H, n), !e()) return;
			t();
			let r = await se(H, q);
			if (!e()) return;
			K(r), _(r.items), y(r.items[0] ?? null), W > 0 && r.items.length === 0 && k({
				key: oe,
				search: le,
				pageIndex: Math.max(0, r.count === null ? W - 1 : Math.ceil(r.count / 50) - 1)
			});
		} catch (t) {
			e() && (K(null), z(t instanceof Error ? t.message : String(t)));
		} finally {
			F((e) => e === J ? null : e);
		}
	};
	return ne ? /* @__PURE__ */ (0, $.jsx)(de, { feature: "data_source_posts" }) : e ? i && !H ? /* @__PURE__ */ (0, $.jsx)("div", {
		className: "flex min-h-0 min-w-0 flex-1 items-center justify-center p-6",
		children: /* @__PURE__ */ (0, $.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Loading table…"
		})
	}) : H ? /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background",
		children: [
			/* @__PURE__ */ (0, $.jsxs)("header", {
				"data-slot": "database-toolbar",
				className: "grid h-10 shrink-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2 border-b border-border px-2",
				children: [
					/* @__PURE__ */ (0, $.jsx)("div", {
						className: "min-w-0 justify-self-start",
						children: /* @__PURE__ */ (0, $.jsx)("div", {
							className: "flex rounded-md border p-0.5",
							role: "tablist",
							"aria-label": "Collection view",
							children: [
								"rows",
								"fields",
								"import",
								"settings"
							].map((e) => /* @__PURE__ */ (0, $.jsx)("button", {
								type: "button",
								role: "tab",
								"aria-selected": h === e,
								onClick: () => {
									x(null), p(e);
								},
								className: l("rounded px-2 py-0.5 text-xs capitalize", h === e ? "bg-accent font-medium" : "text-muted-foreground"),
								children: e === "rows" ? "Data" : e === "fields" ? "Fields" : e === "import" ? "Import" : "Settings"
							}, e))
						})
					}),
					/* @__PURE__ */ (0, $.jsxs)("div", {
						"data-slot": "database-title",
						className: "flex min-w-0 items-center justify-center gap-1.5 overflow-hidden text-xs",
						children: [/* @__PURE__ */ (0, $.jsx)("span", {
							className: "shrink-0 text-muted-foreground",
							children: "Collection"
						}), /* @__PURE__ */ (0, $.jsx)("span", {
							className: "truncate font-medium",
							children: d(H)
						})]
					}),
					/* @__PURE__ */ (0, $.jsx)("div", {
						className: "flex min-w-0 items-center justify-end",
						children: h === "rows" ? /* @__PURE__ */ (0, $.jsxs)(o, {
							type: "button",
							size: "xs",
							variant: "outline",
							disabled: S || U || !G?.capabilities.canCreate || P === J,
							onClick: () => {
								z(null), x({
									collection: ae,
									value: {}
								});
							},
							children: [/* @__PURE__ */ (0, $.jsx)(fe, {}), "Add record"]
						}) : h === "fields" ? /* @__PURE__ */ (0, $.jsxs)(o, {
							type: "submit",
							form: tt,
							size: "xs",
							disabled: !ee.dirty || !ee.valid,
							children: [/* @__PURE__ */ (0, $.jsx)(he, {}), "Publish schema"]
						}) : null
					})
				]
			}),
			I ? /* @__PURE__ */ (0, $.jsxs)("div", {
				role: "alert",
				className: "shrink-0 border-b border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive",
				children: [I, h === "rows" ? /* @__PURE__ */ (0, $.jsx)(o, {
					variant: "outline",
					size: "xs",
					onClick: () => M((e) => e + 1),
					children: "Retry records"
				}) : null]
			}) : null,
			h === "rows" && G?.capabilities.reason ? /* @__PURE__ */ (0, $.jsx)("p", {
				className: "border-b px-3 py-2 text-sm text-muted-foreground",
				children: G.capabilities.reason
			}) : null,
			h === "settings" ? /* @__PURE__ */ (0, $.jsx)(Ze, {
				schema: H,
				refreshCatalog: u
			}, `${H.id}:${re}`) : h === "import" ? n ? /* @__PURE__ */ (0, $.jsx)(Ye, {
				schema: H,
				onSchemaSaved: u
			}, String(H.id)) : /* @__PURE__ */ (0, $.jsx)(de, { feature: "csv" }) : h === "fields" ? /* @__PURE__ */ (0, $.jsx)("div", {
				className: "min-h-0 flex-1 p-3",
				children: /* @__PURE__ */ (0, $.jsx)(Me, {
					className: "h-full",
					fields: ye,
					hiddenFieldNames: H.type === "region" ? ["orphaned"] : void 0,
					zodSettings: H.zodSettings ?? null,
					settingsContext: je,
					onSave: async (e, t) => {
						if (!H) return;
						let { ownsMutation: n } = Ie();
						z(null);
						try {
							if (await c(H, e, t), !n()) return;
							await u(n);
						} catch (e) {
							if (!n()) return;
							throw z(e instanceof Error ? e.message : String(e)), e;
						}
					},
					formId: tt,
					showSaveButton: !1,
					onSaveStateChange: Pe
				})
			}) : /* @__PURE__ */ (0, $.jsxs)("div", {
				className: "grid min-h-0 min-w-0 flex-1 grid-cols-2 overflow-hidden",
				children: [/* @__PURE__ */ (0, $.jsx)("section", {
					className: "min-h-0 min-w-0 overflow-hidden border-r border-border",
					children: /* @__PURE__ */ (0, $.jsx)(Ne, {
						variant: "pane",
						schema: H,
						rows: g,
						loading: S,
						serverState: {
							pageIndex: W,
							pageSize: 50,
							count: G ? G.count : 0,
							hasMore: G?.hasMore,
							search: le,
							loading: S,
							onSearchChange: (e) => k({
								key: oe,
								pageIndex: 0,
								search: e
							}),
							onPageChange: (e) => k({
								key: oe,
								pageIndex: e,
								search: le
							})
						},
						readOnly: !0,
						selectedRow: v,
						onRowClick: (e) => {
							S || !G || (x(null), y(e));
						}
					})
				}), /* @__PURE__ */ (0, $.jsxs)("section", {
					className: "flex min-h-0 min-w-0 flex-col overflow-hidden bg-muted",
					children: [/* @__PURE__ */ (0, $.jsxs)("header", {
						className: "flex h-10 shrink-0 items-center border-b border-border bg-background px-3",
						children: [
							/* @__PURE__ */ (0, $.jsx)("span", {
								className: "min-w-0 truncate text-sm font-medium",
								children: U ? "New row" : v?.id == null ? "Row editor" : `Edit row #${v.id}`
							}),
							!U && v ? /* @__PURE__ */ (0, $.jsxs)("div", {
								className: "ml-auto flex items-center gap-1",
								children: [/* @__PURE__ */ (0, $.jsxs)(A, { children: [/* @__PURE__ */ (0, $.jsx)(ce, {
									asChild: !0,
									children: /* @__PURE__ */ (0, $.jsx)("span", {
										className: "inline-flex",
										children: /* @__PURE__ */ (0, $.jsx)(o, {
											type: "button",
											size: "icon-xs",
											variant: "ghost",
											"aria-label": "Duplicate record",
											disabled: S || !G?.capabilities.canCreate || P === J,
											onClick: () => {
												!H || !v || S || !G?.capabilities.canCreate || P === J || (z(null), x({
													collection: ae,
													value: $e(H, v)
												}));
											},
											children: /* @__PURE__ */ (0, $.jsx)(t, {})
										})
									})
								}), /* @__PURE__ */ (0, $.jsx)(E, { children: "Duplicate record" })] }), /* @__PURE__ */ (0, $.jsxs)(A, { children: [/* @__PURE__ */ (0, $.jsx)(ce, {
									asChild: !0,
									children: /* @__PURE__ */ (0, $.jsx)("span", {
										className: "inline-flex",
										children: /* @__PURE__ */ (0, $.jsx)(o, {
											type: "button",
											size: "icon-xs",
											variant: "ghost",
											"aria-label": "Delete record",
											disabled: S || !G?.capabilities.canDelete || P === J,
											onClick: () => void Be(),
											children: /* @__PURE__ */ (0, $.jsx)(m, {})
										})
									})
								}), /* @__PURE__ */ (0, $.jsx)(E, { children: "Delete record" })] })]
							}) : null,
							U ? /* @__PURE__ */ (0, $.jsx)(o, {
								type: "button",
								size: "xs",
								variant: "ghost",
								className: "ml-auto",
								onClick: () => x(null),
								children: "Cancel"
							}) : null
						]
					}), /* @__PURE__ */ (0, $.jsx)("div", {
						className: "flex min-h-0 flex-1 flex-col overflow-hidden",
						children: U || v ? /* @__PURE__ */ (0, $.jsx)(ke, {
							variant: "pane",
							schema: {
								fields: ye,
								zodSettings: H.zodSettings ?? null
							},
							value: U ? b.value : v ?? et,
							mode: U ? "create" : "edit",
							controlContext: je,
							submitLabel: U ? "Create row" : "Save row",
							disabled: S || P === J || !(U ? G?.capabilities.canCreate : G?.capabilities.canEdit),
							onSubmit: (U ? G?.capabilities.canCreate : G?.capabilities.canEdit) ? U ? Le : Re : void 0
						}, U ? `new:${H.id}` : `${H.id}:${String(v?.id ?? "")}`) : /* @__PURE__ */ (0, $.jsx)("p", {
							className: "p-3 text-sm text-muted-foreground",
							children: "Select a row to edit its fields."
						})
					})]
				})]
			})
		]
	}) : /* @__PURE__ */ (0, $.jsx)("div", {
		className: "flex min-h-0 min-w-0 flex-1 items-center justify-center p-6",
		children: /* @__PURE__ */ (0, $.jsx)("p", {
			className: "text-sm text-destructive",
			children: s ?? "This table is unavailable."
		})
	}) : /* @__PURE__ */ (0, $.jsx)("div", {
		className: "flex min-h-0 min-w-0 flex-1 items-center justify-center p-6",
		children: /* @__PURE__ */ (0, $.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Select a table from Database."
		})
	});
}
//#endregion
//#region src/components/database/DatabaseWorkspace.tsx
function rt({ initialQuerySettings: e = !1, selectedSchemaId: t, onSelectSchema: n, onSelectQuery: r, onOpenSchemaTab: i, onOpenQueryTab: a, onOpenQueries: o, onCatalogReady: s, onQueryCatalogReady: c }) {
	let { section: l, setSection: u, schemas: d, schemasLoaded: f, loading: p, error: m } = ze(), [h, g] = (0, Q.useState)(t), _ = d.find((e) => String(e.id) === h), v = t ?? (_ ? h : null);
	return (0, Q.useLayoutEffect)(() => {
		t != null && (g(t), u("collections"));
	}, [t, u]), (0, Q.useLayoutEffect)(() => {
		f && !p && !m && h && !_ && g(null);
	}, [
		f,
		p,
		m,
		h,
		_
	]), /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex min-h-0 min-w-0 flex-1 overflow-hidden",
		children: [/* @__PURE__ */ (0, $.jsx)(Je, {
			selectedSchemaId: v,
			onSelectSchema: n,
			onSelectQuery: r,
			onOpenSchemaTab: i,
			onOpenQueryTab: a,
			onSectionChange: (e) => {
				e === "queries" ? o() : t === null && f && !p && !m && _ && n(_);
			},
			onCatalogReady: s,
			onQueryCatalogReady: c
		}), l === "queries" ? /* @__PURE__ */ (0, $.jsx)(Ke, { initialMode: e ? "settings" : "data" }) : /* @__PURE__ */ (0, $.jsx)(nt, { schemaId: v })]
	});
}
//#endregion
//#region src/components/database/DeferredDatabaseWorkspace.tsx
function it({ initialQueryId: e, ...t }) {
	return /* @__PURE__ */ (0, $.jsx)(Ve, {
		initialQueryId: e,
		children: /* @__PURE__ */ (0, $.jsx)(rt, { ...t })
	});
}
//#endregion
export { it as DeferredDatabaseWorkspace };

//# sourceMappingURL=DeferredDatabaseWorkspace-C7sjlq0y.js.map