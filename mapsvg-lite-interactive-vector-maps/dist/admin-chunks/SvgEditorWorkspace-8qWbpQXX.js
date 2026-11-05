import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Fr as t, Pr as n, _n as r, _r as i, at as a, bi as o, ct as s, gn as c, hi as l, hn as u, kt as d, ot as f, st as p, vn as m, xr as h, yr as g } from "./admin-startup-DaxvU-L8.js";
import { n as _, r as v, t as y } from "./collapsible-taNtsly_.js";
import { t as b } from "./label-C9XVn_0K.js";
import { i as x, n as S, o as C, t as w } from "./select-CucA4zeB.js";
import { a as T } from "./popover-CB-evFrr.js";
import { o as ee } from "./toggle-group-DsddKQYq.js";
import { t as E } from "./chevron-down-BvBr-Lir.js";
import { t as D } from "./chevron-right-6Y_3kTu1.js";
import { t as O } from "./code-xml-DU_Nk6Im.js";
import { n as te, r as ne, t as re } from "./undo-2-BJEJpYA9.js";
import { t as k } from "./upload-CvuY2M11.js";
import { t as ie } from "./badge-CEcLXWQT.js";
import { i as A, n as ae, s as j, t as oe } from "./input-group-DF-lNg7c.js";
import { t as M } from "./ColorInput-XHYZDJP_.js";
import { S as N, _ as P, b as F, d as se, f as I, g as L, h as R, i as z, m as B, n as V, p as H, r as ce, t as U, u as le, v as ue, x as W, y as de } from "./svgRegion-DESta_IR.js";
var fe = n("magnet", [
	["path", {
		d: "m12 15 4 4",
		key: "lnac28"
	}],
	["path", {
		d: "M2.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.029-6.029a1 1 0 1 1 3 3l-6.029 6.029a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.365-6.367A1 1 0 0 0 8.716 4.282z",
		key: "nlhkjb"
	}],
	["path", {
		d: "m5 8 4 4",
		key: "j6kj7e"
	}]
]), pe = n("panel-right", [["rect", {
	width: "18",
	height: "18",
	x: "3",
	y: "3",
	rx: "2",
	key: "afitv7"
}], ["path", {
	d: "M15 3v18",
	key: "14nvp0"
}]]), me = n("pen-tool", [
	["path", {
		d: "M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z",
		key: "nt11vn"
	}],
	["path", {
		d: "m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18",
		key: "15qc1e"
	}],
	["path", {
		d: "m2.3 2.3 7.286 7.286",
		key: "1wuzzi"
	}],
	["circle", {
		cx: "11",
		cy: "11",
		r: "2",
		key: "xmgehs"
	}]
]), he = n("scan", [
	["path", {
		d: "M3 7V5a2 2 0 0 1 2-2h2",
		key: "aa7l1z"
	}],
	["path", {
		d: "M17 3h2a2 2 0 0 1 2 2v2",
		key: "4qcy5o"
	}],
	["path", {
		d: "M21 17v2a2 2 0 0 1-2 2h-2",
		key: "6vwrx8"
	}],
	["path", {
		d: "M7 21H5a2 2 0 0 1-2-2v-2",
		key: "ioqczr"
	}]
]), ge = n("shapes", [
	["path", {
		d: "M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z",
		key: "1bo67w"
	}],
	["rect", {
		x: "3",
		y: "14",
		width: "7",
		height: "7",
		rx: "1",
		key: "1bkyp8"
	}],
	["circle", {
		cx: "17.5",
		cy: "17.5",
		r: "3.5",
		key: "w3z12y"
	}]
]);
//#endregion
//#region ../svg-editor/src/viewport/coordinates.ts
function G(e, t) {
	return {
		x: t.a * e.x + t.c * e.y + t.e,
		y: t.b * e.x + t.d * e.y + t.f
	};
}
function K(e, t) {
	let n = e.getScreenCTM();
	if (!n) throw Error("SVG coordinates are unavailable.");
	return G(t, n.inverse());
}
function q(e, t, n) {
	let r = t.getScreenCTM(), i = n.getScreenCTM();
	return !r || !i ? e : G(G(e, r), i.inverse());
}
var _e = (e) => e.map((e) => `${W(e.x)},${W(e.y)}`).join(" ");
//#endregion
//#region ../svg-editor/src/viewport/overlay.ts
function ve({ overlay: e, svg: t, selected: n, handles: r, active: i, unit: a, tool: o, drawing: s, hover: c }) {
	e.replaceChildren();
	let l = (t, n) => {
		let r = e.ownerDocument.createElementNS(N, t);
		for (let [e, t] of Object.entries(n)) r.setAttribute(e, t);
		r.style.cssText = `fill:${n.fill ?? "none"}!important;stroke:${n.stroke ?? "#2563eb"}!important;stroke-width:${a * Number(n["stroke-width"] ?? 1)}!important;opacity:1!important;display:inline!important;visibility:visible!important;${n["data-handle"] == null ? "pointer-events:none!important" : "pointer-events:all!important;cursor:crosshair"}`, e.appendChild(r);
	};
	if (n && n !== t && n.getBBox) try {
		let e = n.getBBox();
		l("polygon", {
			points: _e([
				{
					x: e.x,
					y: e.y
				},
				{
					x: e.x + e.width,
					y: e.y
				},
				{
					x: e.x + e.width,
					y: e.y + e.height
				},
				{
					x: e.x,
					y: e.y + e.height
				}
			].map((e) => q(e, n, t))),
			"stroke-dasharray": `${3 * a} ${3 * a}`
		}), o === "select" && r.forEach((e, r) => {
			let o = q(e.point, n, t);
			if (e.anchor) {
				let r = q(e.anchor, n, t);
				l("line", {
					x1: String(o.x),
					y1: String(o.y),
					x2: String(r.x),
					y2: String(r.y),
					stroke: "#94a3b8"
				});
			}
			l("circle", {
				cx: String(o.x),
				cy: String(o.y),
				r: String(a * (e.kind === "anchor" ? 3.5 : 3)),
				fill: i?.segment === e.segment && i?.offset === e.offset ? "#2563eb" : e.kind === "control" ? "#bfdbfe" : "#fff",
				"data-handle": String(r)
			});
		});
	} catch {}
	s.length && (l("polyline", {
		points: _e([...s, ...c ? [c] : []]),
		fill: "#2563eb18",
		"stroke-width": "1.5"
	}), s.forEach((e) => l("circle", {
		cx: String(e.x),
		cy: String(e.y),
		r: String(a * 3.5),
		fill: "#fff"
	})));
}
//#endregion
//#region ../svg-editor/src/viewport/SvgViewport.ts
var ye = "<!doctype html><html><head><meta charset=\"utf-8\"><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; img-src http: https: data: blob:; style-src 'unsafe-inline'; font-src http: https: data:;\"><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}body{background:#fafafa;background-image:radial-gradient(#d4d4d4 .7px,transparent .7px);background-size:16px 16px;user-select:none}svg{touch-action:none}</style></head><body></body></html>", be = class {
	constructor(e, t, n = {}) {
		this.editor = e, this.frame = t, this.options = n, this.svg = null, this.overlay = null, this.cleanups = [], this.camera = null, this.initial = null, this.revision = -1, this.selected = null, this.gesture = null, this.drawing = [], this.hover = null, this.activeHandle = null, this.space = !1, this.disposed = !1, this.resolveLoad = null, this.tool = "select", this.snap = !0, this.unsubscribe = e.subscribe(() => this.render());
	}
	async mount() {
		if (this.frame.setAttribute("sandbox", "allow-same-origin"), await new Promise((e) => {
			let t = () => {
				this.frame.removeEventListener("load", t), this.resolveLoad = null, e();
			};
			this.resolveLoad = t, this.frame.addEventListener("load", t), this.frame.srcdoc = ye;
		}), this.disposed) return;
		let e = this.frame.contentDocument;
		e.body.tabIndex = -1;
		let t = e.createElement("base");
		t.href = document.baseURI, e.head.prepend(t);
		let n = (t, n, r) => {
			e.addEventListener(t, n, r), this.cleanups.push(() => e.removeEventListener(t, n, r));
		};
		n("pointerdown", (e) => this.safely(() => this.down(e))), n("pointermove", (e) => this.safely(() => this.move(e))), n("pointerup", (e) => this.safely(() => this.up(e))), n("pointercancel", () => this.cancelInteraction()), n("dblclick", (e) => this.safely(() => this.doubleClick(e))), n("wheel", (e) => {
			e.preventDefault(), this.svg && this.zoomBy(Math.exp(-Math.max(-100, Math.min(100, e.deltaY)) * .008), {
				x: e.clientX,
				y: e.clientY
			});
		}, { passive: !1 }), n("keydown", (e) => this.keyDown(e)), n("keyup", (e) => {
			e.code === "Space" && (this.space = !1, this.cursor());
		});
		let r = () => {
			this.space = !1, this.cancelGesture(), this.cursor();
		};
		e.defaultView?.addEventListener("blur", r), this.cleanups.push(() => e.defaultView?.removeEventListener("blur", r));
		let i = new ResizeObserver(() => {
			this.drawOverlay(), this.reportZoom();
		});
		i.observe(this.frame), this.cleanups.push(() => i.disconnect()), this.render(), this.fit();
	}
	safely(e) {
		try {
			e();
		} catch (e) {
			this.cancelGesture(), this.options.onError?.(e instanceof Error ? e : Error(String(e)));
		}
	}
	render() {
		if (this.disposed || !this.frame.contentDocument) return;
		let e = this.editor.getState();
		if (this.revision !== e.revision || !this.svg) {
			let t = this.editor.clonePreview();
			if (t.style.width = "100%", t.style.height = "100%", t.style.display = "block", t.style.maxWidth = "none", t.style.maxHeight = "none", t.removeAttribute("x"), t.removeAttribute("y"), this.frame.contentDocument.body.replaceChildren(t), this.svg = t, this.overlay = this.frame.contentDocument.createElementNS(N, "g"), this.overlay.setAttribute("data-svg-editor-overlay", ""), this.overlay.style.cssText = "display:inline!important;opacity:1!important;visibility:visible!important;pointer-events:none", t.appendChild(this.overlay), this.revision = e.revision, !this.initial) {
				let e = (this.editor.root.getAttribute("viewBox") ?? "").trim().split(/[\s,]+/).map(Number), n = parseFloat(this.editor.root.getAttribute("width") ?? ""), r = parseFloat(this.editor.root.getAttribute("height") ?? ""), i = {
					x: 0,
					y: 0,
					width: n || 1e3,
					height: r || 700
				};
				if (e.length === 4 && e.every(Number.isFinite) && e[2] > 0 && e[3] > 0) i = {
					x: e[0],
					y: e[1],
					width: e[2],
					height: e[3]
				};
				else if (!n || !r) try {
					let e = t.getBBox();
					e.width && e.height && (i = {
						x: e.x,
						y: e.y,
						width: e.width,
						height: e.height
					});
				} catch {}
				this.initial = i, this.camera = { ...i };
			}
			this.applyCamera();
		}
		this.selected !== e.selected && (this.activeHandle = null, this.selected = e.selected), this.drawOverlay(), this.cursor();
	}
	display(e = this.editor.getState().selected) {
		return e && this.svg ? this.svg.querySelector(`[data-svg-editor-key="${e}"]`) ?? (this.svg.getAttribute("data-svg-editor-key") === e ? this.svg : null) : null;
	}
	applyCamera() {
		this.svg && this.camera && this.svg.setAttribute("viewBox", `${this.camera.x} ${this.camera.y} ${this.camera.width} ${this.camera.height}`), this.drawOverlay(), this.reportZoom();
	}
	reportZoom() {
		let e = this.svg?.getScreenCTM();
		e && this.options.onZoom?.(Math.hypot(e.a, e.b));
	}
	unit() {
		let e = this.svg?.getScreenCTM();
		return e ? 1 / Math.max(1e-4, Math.hypot(e.a, e.b)) : 1;
	}
	fit() {
		this.initial && (this.camera = {
			x: this.initial.x - this.initial.width * .05,
			y: this.initial.y - this.initial.height * .05,
			width: this.initial.width * 1.1,
			height: this.initial.height * 1.1
		}, this.applyCamera());
	}
	setZoom(e) {
		let t = this.svg?.getScreenCTM();
		t && this.zoomBy(e / Math.hypot(t.a, t.b));
	}
	zoomBy(e, t) {
		if (!this.svg || !this.camera) return;
		let n = this.svg.getScreenCTM(), r = n ? Math.hypot(n.a, n.b) : 1;
		e = Math.max(.01 / r, Math.min(64 / r, e));
		let i = t ? K(this.svg, t) : {
			x: this.camera.x + this.camera.width / 2,
			y: this.camera.y + this.camera.height / 2
		};
		this.camera = {
			x: i.x - (i.x - this.camera.x) / e,
			y: i.y - (i.y - this.camera.y) / e,
			width: this.camera.width / e,
			height: this.camera.height / e
		}, this.applyCamera();
	}
	setTool(e) {
		this.cancelInteraction(), this.tool = e, this.options.onTool?.(e), this.cursor();
	}
	cursor() {
		this.frame.contentDocument && (this.frame.contentDocument.body.style.cursor = this.space || this.tool === "hand" ? this.gesture ? "grabbing" : "grab" : this.tool === "draw" ? "crosshair" : "default");
	}
	rootPoint(e) {
		return K(this.svg, {
			x: e.clientX,
			y: e.clientY
		});
	}
	target(e) {
		let t = e.target;
		return z(t) ? t.closest("[data-svg-editor-key]") : null;
	}
	snapshotSnapping(e) {
		if (!this.snap || !this.svg) return;
		let t = [];
		for (let n of Array.from(this.svg.querySelectorAll("path,polygon,polyline,circle,ellipse,rect,line,image"))) if (!(n.closest("defs,[data-svg-editor-overlay]") || n.getAttribute("data-svg-editor-key") === e || this.display(e)?.contains(n))) try {
			let e;
			if (n.localName === "path") e = R(H(n.getAttribute("d") ?? "")).filter((e) => e.kind === "anchor").map((e) => e.point);
			else if (["polygon", "polyline"].includes(n.localName)) e = B(n.getAttribute("points") ?? "");
			else {
				let t = n.getBBox();
				e = [
					{
						x: t.x,
						y: t.y
					},
					{
						x: t.x + t.width,
						y: t.y + t.height
					},
					{
						x: t.x + t.width / 2,
						y: t.y + t.height / 2
					}
				];
			}
			t.push(...e.map((e) => q(e, n, this.svg)));
		} catch {}
		return new de(8 * this.unit(), t);
	}
	down(e) {
		if (!this.svg || e.button > 1 || this.gesture) return;
		e.preventDefault(), this.frame.contentDocument?.body.focus({ preventScroll: !0 });
		let t = this.rootPoint(e), n = this.target(e), r = e.target;
		if (this.tool === "hand" || this.space || e.button === 1) this.gesture = {
			id: e.pointerId,
			kind: "pan",
			start: {
				x: e.clientX,
				y: e.clientY
			},
			camera: { ...this.camera },
			moved: !1
		};
		else if (this.tool === "draw") {
			this.drawing.length || (this.drawingSnap = this.snapshotSnapping(null));
			let e = this.snap ? this.drawingSnap?.nearest(t) ?? t : t;
			this.drawing.length >= 3 && F(t, this.drawing[0]) < (10 * this.unit()) ** 2 ? this.finishDrawing() : (!this.drawing.length || F(e, this.drawing[this.drawing.length - 1]) > (2 * this.unit()) ** 2) && this.drawing.push(e), this.drawOverlay();
			return;
		} else {
			let i = r.getAttribute?.("data-handle"), a = this.display(), o = this.editor.getState().selected;
			if (i != null && a && o) {
				let n = this.handles(a), r = n[Number(i)];
				if (!r) return;
				this.activeHandle = r;
				for (let e of Array.from(this.overlay?.querySelectorAll("[data-handle]") ?? [])) {
					let t = e.getAttribute("data-handle") === i, r = n[Number(e.getAttribute("data-handle"))];
					e.style.setProperty("fill", t ? "#2563eb" : r?.kind === "control" ? "#bfdbfe" : "#fff", "important");
				}
				this.editor.begin(), this.gesture = {
					id: e.pointerId,
					kind: "point",
					start: t,
					key: o,
					handle: r,
					segments: a.localName === "path" ? H(a.getAttribute("d") ?? "") : void 0,
					points: a.localName === "path" ? void 0 : B(a.getAttribute("points") ?? ""),
					snap: this.snapshotSnapping(o),
					moved: !1
				};
			} else {
				let t = a && a !== this.svg && n && a.contains(n) ? a : n, r = t?.getAttribute("data-svg-editor-key") ?? null;
				if (this.editor.select(r), this.options.onSelection?.(), this.activeHandle = null, !t || t === this.svg || !r || !t.getScreenCTM) {
					this.drawOverlay();
					return;
				}
				this.editor.begin(), this.gesture = {
					id: e.pointerId,
					kind: "move",
					start: K(t.parentElement, {
						x: e.clientX,
						y: e.clientY
					}),
					key: r,
					original: this.editor.element(r)?.getAttribute("transform") ?? "",
					moved: !1
				};
			}
		}
		this.gesture && (this.gesture.screenStart = {
			x: e.clientX,
			y: e.clientY
		}, this.gesture.kind === "pan" && this.svg.setPointerCapture(e.pointerId)), this.cursor();
	}
	move(e) {
		if (!this.svg) return;
		if (!this.gesture) {
			if (this.tool === "draw" && this.drawing.length) {
				let t = this.rootPoint(e);
				this.hover = this.snap ? this.drawingSnap?.nearest(t) ?? t : t, this.drawOverlay();
			}
			return;
		}
		let t = this.gesture;
		if (e.pointerId !== t.id) return;
		if (t.kind === "pan") {
			let n = this.svg.getScreenCTM();
			if (!n || !t.camera) return;
			let r = Math.hypot(n.a, n.b);
			this.camera = {
				...t.camera,
				x: t.camera.x - (e.clientX - t.start.x) / r,
				y: t.camera.y - (e.clientY - t.start.y) / r
			}, this.applyCamera();
			return;
		}
		if (!t.moved) {
			if (t.screenStart && F(t.screenStart, {
				x: e.clientX,
				y: e.clientY
			}) < 4) return;
			this.svg.setPointerCapture(e.pointerId), t.moved = !0;
		}
		let n = this.display(t.key), r = this.editor.element(t.key);
		if (!(!n || !r)) {
			if (t.kind === "move") {
				let i = K(n.parentElement, {
					x: e.clientX,
					y: e.clientY
				}), a = i.x - t.start.x, o = i.y - t.start.y;
				e.shiftKey && (Math.abs(a) > Math.abs(o) ? o = 0 : a = 0), Math.abs(a) + Math.abs(o) > 1e-8 && (t.moved = !0);
				let s = `translate(${W(a)} ${W(o)})${t.original ? ` ${t.original}` : ""}`;
				r.setAttribute("transform", s), n.setAttribute("transform", s);
			} else if (t.handle) {
				let i = this.rootPoint(e);
				!e.altKey && t.snap && (i = t.snap.nearest(i)), i = q(i, this.svg, n);
				let a = t.segments ? L(se(t.segments, t.handle, i)) : P(t.points.map((e, n) => n === t.handle.segment ? i : e)), o = t.segments ? "d" : "points";
				r.setAttribute(o, a), n.setAttribute(o, a), t.moved = !0;
			}
			this.drawOverlay();
		}
	}
	up(e) {
		let t = this.gesture;
		!t || t.id !== e.pointerId || (this.gesture = null, t.kind !== "pan" && (t.moved ? this.editor.commit(t.kind === "point" ? "Move path point" : "Move shape") : this.editor.cancel()), this.cursor());
	}
	doubleClick(e) {
		if (this.tool === "draw") {
			this.finishDrawing();
			return;
		}
		if (this.tool !== "select" || !this.svg) return;
		let t = this.display(), n = this.editor.getState().selected;
		if (!t || !n || ![
			"path",
			"polygon",
			"polyline"
		].includes(t.localName)) return;
		if (e.target.getAttribute?.("data-handle") != null) {
			this.deletePoint();
			return;
		}
		let r = K(t, {
			x: e.clientX,
			y: e.clientY
		});
		if (t.localName === "path") {
			let i = H(t.getAttribute("d") ?? ""), a = I(i, r);
			if (a.segment < 0 || a.t < .001 || a.t > .999 || F(q(a.point, t, this.svg), this.rootPoint(e)) > (12 * this.unit()) ** 2) return;
			this.editor.updateAttribute(n, "d", L(ue(i, a.segment, a.t)));
		} else {
			let e = B(t.getAttribute("points") ?? ""), i = e.map((e, t) => ({
				type: t ? "L" : "M",
				values: [e.x, e.y]
			}));
			t.localName === "polygon" && i.push({
				type: "Z",
				values: []
			});
			let a = I(i, r);
			if (a.segment < 0) return;
			e.splice(a.segment, 0, a.point), this.editor.updateAttribute(n, "points", P(e));
		}
		this.activeHandle = null;
	}
	handles(e) {
		try {
			if (e.localName === "path") return R(H(e.getAttribute("d") ?? ""));
			if (["polygon", "polyline"].includes(e.localName)) return B(e.getAttribute("points") ?? "").map((e, t) => ({
				segment: t,
				offset: 0,
				point: e,
				kind: "anchor"
			}));
		} catch {}
		return [];
	}
	deletePoint() {
		let e = this.display(), t = this.activeHandle, n = this.editor.getState().selected;
		if (!e || !n || !t || t.kind !== "anchor") return !1;
		if (e.localName === "path") {
			let r = le(H(e.getAttribute("d") ?? ""), t.segment);
			r.some((e) => e.type !== "M" && e.type !== "Z") ? this.editor.updateAttribute(n, "d", L(r)) : this.editor.deleteNode(n);
		} else {
			let r = B(e.getAttribute("points") ?? "");
			r.splice(t.segment, 1), r.length < 2 ? this.editor.deleteNode(n) : this.editor.updateAttribute(n, "points", P(r));
		}
		return this.activeHandle = null, this.drawOverlay(), !0;
	}
	finishDrawing() {
		if (this.drawing.length < 3) return;
		let e = this.drawing.map((e, t) => `${t ? "L" : "M"}${W(e.x)} ${W(e.y)}`).join(" ") + " Z";
		this.drawing = [], this.drawingSnap = void 0, this.hover = null, this.editor.addPath(e), this.options.onSelection?.(), this.drawOverlay();
	}
	keyDown(e) {
		if (e.target?.closest?.("input,textarea,select,[contenteditable=true]") || e.defaultPrevented) return;
		let t = e.ctrlKey || e.metaKey;
		if (e.key === "Escape") {
			e.preventDefault(), this.cancelInteraction() || this.options.onCloseRequest?.();
			return;
		}
		if (e.code === "Space") {
			e.preventDefault(), this.space = !0, this.cursor();
			return;
		}
		if (t && e.key.toLowerCase() === "z") {
			e.preventDefault(), this.cancelGesture(), e.shiftKey ? this.editor.redo() : this.editor.undo();
			return;
		}
		if (t && e.key.toLowerCase() === "y") {
			e.preventDefault(), this.editor.redo();
			return;
		}
		if (e.key === "Enter" && this.tool === "draw") {
			e.preventDefault(), this.safely(() => this.finishDrawing());
			return;
		}
		if (e.key === "Delete" || e.key === "Backspace") {
			e.preventDefault(), this.safely(() => {
				this.deletePoint() || this.editor.deleteNode();
			});
			return;
		}
		!t && e.key.toLowerCase() === "v" && this.setTool("select"), !t && e.key.toLowerCase() === "h" && this.setTool("hand"), !t && e.key.toLowerCase() === "p" && this.setTool("draw");
	}
	cancelGesture() {
		if (!this.gesture) return !1;
		let e = this.gesture.kind !== "pan";
		return this.gesture = null, e && this.editor.cancel(), this.cursor(), !0;
	}
	cancelInteraction() {
		return this.cancelGesture() ? !0 : this.drawing.length ? (this.drawing = [], this.drawingSnap = void 0, this.hover = null, this.drawOverlay(), !0) : this.activeHandle ? (this.activeHandle = null, this.drawOverlay(), !0) : this.editor.getState().selected ? (this.editor.select(null), !0) : !1;
	}
	prepareSave() {
		if (this.gesture) throw Error("Finish the current gesture before saving.");
		if (this.drawing.length >= 3) this.finishDrawing();
		else if (this.drawing.length) throw Error("Add at least three points to the region, or press Escape to cancel it.");
	}
	drawOverlay() {
		if (!this.overlay || !this.svg) return;
		let e = this.display();
		ve({
			overlay: this.overlay,
			svg: this.svg,
			selected: e,
			handles: e ? this.handles(e) : [],
			active: this.activeHandle,
			unit: this.unit(),
			tool: this.tool,
			drawing: this.drawing,
			hover: this.hover
		});
	}
	dispose() {
		this.disposed || (this.disposed = !0, this.cancelGesture(), this.unsubscribe(), this.cleanups.forEach((e) => e()), this.resolveLoad?.(), this.resolveLoad = null, this.frame.srcdoc = "", this.svg = null, this.overlay = null);
	}
}, J = /* @__PURE__ */ e(o(), 1);
function xe(e, t, n) {
	let r = e.element(t);
	if (!r || !V(r)) throw Error("This SVG node cannot be a region.");
	e.change(n ? "Turn into region" : "Exclude region", () => {
		if (!n) {
			e.setAttribute(t, U, "true");
			return;
		}
		e.setAttribute(t, U, null);
		let i = new Set([e.root, ...Array.from(e.root.querySelectorAll("[id]"))].filter((e) => e !== r).map((e) => e.getAttribute("id"))), a = r.getAttribute("id") ?? "", o = a.startsWith(e.idPrefix) ? a : `${e.idPrefix}${a}`;
		if (!a || /\s/.test(o) || i.has(o)) {
			let n = 1;
			for (; i.has(`${e.idPrefix}${r.localName}-${n}`);) n++;
			e.setAttribute(t, "id", `${e.idPrefix}${r.localName}-${n}`);
		} else o !== a && e.setAttribute(t, "id", o);
		if (!r.getAttribute("fill") && !r.style?.getPropertyValue("fill") && e.setAttribute(t, "fill", "#cbd5e1"), !ce(r, e.idPrefix)) throw Error("This SVG node cannot be a region.");
	});
}
//#endregion
//#region src/components/svg-editor/InspectorField.tsx
var Y = l();
function Se({ label: e, value: t, placeholder: n, multiline: r, color: i, onCommit: a }) {
	let o = (0, J.useId)(), [s, c] = (0, J.useState)(t), [l, u] = (0, J.useState)(""), f = (0, J.useRef)(!1);
	(0, J.useEffect)(() => {
		c(t), u("");
	}, [t]);
	let p = (e = s) => {
		if (e !== t) try {
			a(e), u("");
		} catch (e) {
			u(e instanceof Error ? e.message : String(e));
		}
	};
	return /* @__PURE__ */ (0, Y.jsxs)("div", {
		className: "min-w-0 space-y-1",
		onBlur: (e) => {
			if (f.current) {
				f.current = !1;
				return;
			}
			e.currentTarget.contains(e.relatedTarget) || p();
		},
		children: [
			/* @__PURE__ */ (0, Y.jsx)(b, {
				htmlFor: o,
				className: "text-[11px] font-normal text-muted-foreground",
				children: e
			}),
			/* @__PURE__ */ (0, Y.jsx)("div", {
				onKeyDown: (e) => {
					e.key === "Escape" && (e.stopPropagation(), f.current = !0, c(t), u(""), e.target.blur()), e.key === "Enter" && !r && (e.preventDefault(), p());
				},
				children: i ? /* @__PURE__ */ (0, Y.jsx)(M, {
					id: o,
					label: e,
					value: s,
					placeholder: n,
					compact: !0,
					onChange: (e) => {
						c(e), p(e);
					}
				}) : r ? /* @__PURE__ */ (0, Y.jsx)(j, {
					id: o,
					value: s,
					placeholder: n,
					rows: 3,
					className: "min-h-16 max-h-32 overflow-auto [field-sizing:fixed] resize-y font-mono text-[11px]",
					spellCheck: !1,
					onChange: (e) => c(e.target.value)
				}) : /* @__PURE__ */ (0, Y.jsx)(d, {
					id: o,
					value: s,
					placeholder: n,
					className: "h-7 text-xs",
					spellCheck: !1,
					onChange: (e) => c(e.target.value)
				})
			}),
			l ? /* @__PURE__ */ (0, Y.jsx)("p", {
				role: "alert",
				className: "text-[11px] text-destructive",
				children: l
			}) : null
		]
	});
}
//#endregion
//#region src/components/svg-editor/NodeInspector.tsx
var X = {
	svg: [
		"viewBox",
		"width",
		"height",
		"preserveAspectRatio"
	],
	path: ["d", "pathLength"],
	polygon: ["points", "pathLength"],
	polyline: ["points", "pathLength"],
	rect: [
		"x",
		"y",
		"width",
		"height",
		"rx",
		"ry"
	],
	circle: [
		"cx",
		"cy",
		"r"
	],
	ellipse: [
		"cx",
		"cy",
		"rx",
		"ry"
	],
	line: [
		"x1",
		"y1",
		"x2",
		"y2"
	],
	image: [
		"x",
		"y",
		"width",
		"height",
		"preserveAspectRatio"
	],
	text: [
		"x",
		"y",
		"dx",
		"dy",
		"rotate",
		"textLength",
		"lengthAdjust"
	],
	tspan: [
		"x",
		"y",
		"dx",
		"dy",
		"rotate"
	],
	use: [
		"x",
		"y",
		"width",
		"height"
	]
}, Ce = [
	"fill",
	"stroke",
	"stroke-width",
	"opacity",
	"fill-opacity",
	"stroke-opacity",
	"stroke-dasharray",
	"stroke-linecap",
	"stroke-linejoin",
	"fill-rule",
	"vector-effect",
	"display",
	"visibility"
];
function Z({ title: e, children: t }) {
	return /* @__PURE__ */ (0, Y.jsxs)("section", {
		className: "space-y-3 border-b p-3",
		children: [/* @__PURE__ */ (0, Y.jsx)("h3", {
			className: "text-xs font-medium",
			children: e
		}), t]
	});
}
function Q({ title: e, children: t }) {
	return /* @__PURE__ */ (0, Y.jsxs)(y, {
		className: "border-b",
		children: [/* @__PURE__ */ (0, Y.jsxs)(v, {
			className: "group flex w-full items-center justify-between p-3 text-left text-xs font-medium hover:bg-muted/50",
			children: [e, /* @__PURE__ */ (0, Y.jsx)(D, { className: "size-3 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" })]
		}), /* @__PURE__ */ (0, Y.jsx)(_, {
			className: "space-y-3 px-3 pb-3",
			children: t
		})]
	});
}
function we({ editor: e }) {
	let n = (0, J.useSyncExternalStore)(e.subscribe, e.getState), r = e.node(), a = e.element(), [o, s] = (0, J.useState)(""), [l, f] = (0, J.useState)(""), [p, h] = (0, J.useState)(""), g = (0, J.useRef)(null), _ = (0, J.useRef)(!0);
	if ((0, J.useEffect)(() => (_.current = !0, () => {
		_.current = !1;
	}), []), !r || !n.selected) return /* @__PURE__ */ (0, Y.jsxs)("aside", {
		className: "flex h-full min-w-0 flex-col items-center justify-center gap-2 p-6 text-center text-xs text-muted-foreground",
		children: [/* @__PURE__ */ (0, Y.jsx)("p", { children: "Select a shape or XML node" }), /* @__PURE__ */ (0, Y.jsx)("p", {
			className: "text-[11px]",
			children: "Edit geometry, appearance and attributes here."
		})]
	});
	let v = n.selected, y = (t, n = !1) => {
		let r = n ? a?.style?.getPropertyValue(t) : "";
		return /* @__PURE__ */ (0, Y.jsx)(Se, {
			label: t,
			value: r || a?.getAttribute(t) || "",
			multiline: [
				"d",
				"points",
				"style"
			].includes(t),
			color: t === "fill" || t === "stroke",
			placeholder: n ? "Inherited" : void 0,
			onCommit: (n) => {
				r && a ? e.change(`Set ${t}`, () => {
					let e = a.style;
					n ? e.setProperty(t, n) : e.removeProperty(t), a.getAttribute("style") || a.removeAttribute("style");
				}) : e.updateAttribute(v, t, n || null);
			}
		}, `${v}:${t}`);
	}, b = /* @__PURE__ */ new Set([
		"id",
		"class",
		"title",
		U,
		"transform",
		...X[a?.localName ?? ""] ?? [],
		...Ce,
		...a?.localName === "image" ? ["href", "xlink:href"] : [],
		...["text", "tspan"].includes(a?.localName ?? "") ? [
			"font-family",
			"font-size",
			"font-weight",
			"text-anchor",
			"dominant-baseline",
			"letter-spacing"
		] : []
	]), x = (e) => {
		try {
			e(), s("");
		} catch (e) {
			s(e instanceof Error ? e.message : String(e));
		}
	}, S = async (t) => {
		try {
			if (!t.type.startsWith("image/")) throw Error("Choose an image file.");
			let n = await new Promise((e, n) => {
				let r = new FileReader();
				r.onload = () => e(String(r.result)), r.onerror = () => n(/* @__PURE__ */ Error("The image could not be read.")), r.readAsDataURL(t);
			}), r = await new Promise((e, t) => {
				let r = new Image();
				r.onload = () => e({
					width: r.naturalWidth,
					height: r.naturalHeight
				}), r.onerror = () => t(/* @__PURE__ */ Error("The image could not load.")), r.src = n;
			});
			if (!_.current || e.getState().selected !== v || !e.element(v)) return;
			e.change("Replace image", () => {
				let t = e.element(v);
				e.setAttribute(v, t.hasAttribute("xlink:href") ? "xlink:href" : "href", n), t.hasAttribute("href") && t.hasAttribute("xlink:href") && e.setAttribute(v, "href", n), e.setAttribute(v, "width", String(r.width)), e.setAttribute(v, "height", String(r.height));
			}), s("");
		} catch (e) {
			s(e instanceof Error ? e.message : String(e));
		}
	}, C = !z(r) || !Array.from(r.childNodes).some(z);
	return /* @__PURE__ */ (0, Y.jsxs)("aside", {
		className: "h-full min-h-0 min-w-0 overflow-y-auto overscroll-contain text-xs",
		"aria-label": "SVG node inspector",
		children: [
			/* @__PURE__ */ (0, Y.jsxs)("div", {
				className: "sticky top-0 z-10 flex h-10 items-center justify-between gap-2 border-b bg-background px-3",
				children: [/* @__PURE__ */ (0, Y.jsx)("span", {
					className: "truncate font-mono text-xs",
					children: a ? `<${a.tagName}>` : r.nodeName
				}), /* @__PURE__ */ (0, Y.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [
						a && e.isRegion(a) ? /* @__PURE__ */ (0, Y.jsx)(ie, {
							variant: "secondary",
							className: "text-[10px]",
							children: "Region"
						}) : null,
						a && V(a) ? /* @__PURE__ */ (0, Y.jsxs)(u, { children: [/* @__PURE__ */ (0, Y.jsx)(m, {
							asChild: !0,
							children: /* @__PURE__ */ (0, Y.jsx)(t, {
								size: "xs",
								variant: "ghost",
								onClick: () => x(() => xe(e, v, !e.isRegion(a))),
								children: e.isRegion(a) ? "Exclude" : "Turn into region"
							})
						}), e.isRegion(a) ? /* @__PURE__ */ (0, Y.jsx)(c, { children: "Exclude from MapSVG Regions" }) : null] }) : null,
						r === e.root ? null : /* @__PURE__ */ (0, Y.jsx)(t, {
							size: "icon-xs",
							variant: "ghost",
							"aria-label": "Delete selected node",
							title: "Delete selected node",
							onClick: () => e.deleteNode(),
							children: /* @__PURE__ */ (0, Y.jsx)(i, {})
						})
					]
				})]
			}),
			o ? /* @__PURE__ */ (0, Y.jsx)("p", {
				role: "alert",
				className: "p-3 text-destructive",
				children: o
			}) : null,
			a ? /* @__PURE__ */ (0, Y.jsxs)(Y.Fragment, { children: [
				/* @__PURE__ */ (0, Y.jsxs)(Z, {
					title: "Node",
					children: [y("title"), /* @__PURE__ */ (0, Y.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [y("id"), y("class")]
					})]
				}),
				a.localName === "image" ? /* @__PURE__ */ (0, Y.jsxs)(Z, {
					title: "Image",
					children: [
						y(a.hasAttribute("xlink:href") ? "xlink:href" : "href"),
						/* @__PURE__ */ (0, Y.jsx)("input", {
							ref: g,
							type: "file",
							accept: "image/*",
							className: "hidden",
							"aria-label": "Replace SVG image",
							onChange: (e) => {
								let t = e.target.files?.[0];
								t && S(t), e.target.value = "";
							}
						}),
						/* @__PURE__ */ (0, Y.jsxs)(t, {
							variant: "outline",
							size: "xs",
							onClick: () => g.current?.click(),
							children: [/* @__PURE__ */ (0, Y.jsx)(k, {}), "Replace image"]
						})
					]
				}) : null,
				/* @__PURE__ */ (0, Y.jsx)(Z, {
					title: "Appearance",
					children: /* @__PURE__ */ (0, Y.jsx)("div", {
						className: "grid grid-cols-2 gap-2",
						children: Ce.map((e) => /* @__PURE__ */ (0, Y.jsx)("div", {
							className: e === "fill" || e === "stroke" ? "col-span-2" : "",
							children: y(e, !0)
						}, e))
					})
				}),
				["text", "tspan"].includes(a.localName) ? /* @__PURE__ */ (0, Y.jsx)(Z, {
					title: "Typography",
					children: /* @__PURE__ */ (0, Y.jsx)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [
							"font-family",
							"font-size",
							"font-weight",
							"text-anchor",
							"dominant-baseline",
							"letter-spacing"
						].map((e) => /* @__PURE__ */ (0, Y.jsx)("div", { children: y(e, !0) }, e))
					})
				}) : null
			] }) : null,
			C && (!a || [
				"text",
				"tspan",
				"title",
				"desc",
				"style"
			].includes(a.localName)) ? /* @__PURE__ */ (0, Y.jsx)(Z, {
				title: "Content",
				children: /* @__PURE__ */ (0, Y.jsx)(Se, {
					label: a?.localName === "style" ? "CSS" : "Text",
					multiline: !0,
					value: r.textContent ?? "",
					onCommit: (t) => e.updateText(v, t)
				}, `${v}:text`)
			}) : null,
			a ? /* @__PURE__ */ (0, Y.jsxs)(Q, {
				title: "XML attributes",
				children: [
					/* @__PURE__ */ (0, Y.jsx)("p", {
						className: "text-[11px] text-muted-foreground",
						children: "Additional attributes are preserved as written."
					}),
					Array.from(a.attributes).filter((e) => !b.has(e.name)).map((n) => /* @__PURE__ */ (0, Y.jsxs)("div", {
						className: "flex items-end gap-1",
						children: [/* @__PURE__ */ (0, Y.jsx)("div", {
							className: "min-w-0 flex-1",
							children: y(n.name)
						}), /* @__PURE__ */ (0, Y.jsx)(t, {
							variant: "ghost",
							size: "icon-xs",
							className: "mb-0.5",
							title: `Remove ${n.name}`,
							"aria-label": `Remove ${n.name}`,
							onClick: () => x(() => e.updateAttribute(v, n.name, null)),
							children: /* @__PURE__ */ (0, Y.jsx)(i, {})
						})]
					}, n.name)),
					/* @__PURE__ */ (0, Y.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, Y.jsx)(d, {
								className: "h-7 min-w-0 flex-1 text-xs",
								placeholder: "Attribute",
								"aria-label": "New attribute name",
								value: l,
								onChange: (e) => f(e.target.value)
							}),
							/* @__PURE__ */ (0, Y.jsx)(d, {
								className: "h-7 min-w-0 flex-1 text-xs",
								placeholder: "Value",
								"aria-label": "New attribute value",
								value: p,
								onChange: (e) => h(e.target.value)
							}),
							/* @__PURE__ */ (0, Y.jsx)(t, {
								size: "icon-xs",
								variant: "outline",
								"aria-label": "Add XML attribute",
								disabled: !l.trim(),
								onClick: () => x(() => {
									e.updateAttribute(v, l.trim(), p), f(""), h("");
								}),
								children: /* @__PURE__ */ (0, Y.jsx)(T, {})
							})
						]
					})
				]
			}) : null,
			a ? /* @__PURE__ */ (0, Y.jsxs)(Y.Fragment, { children: [(X[a.localName]?.length ?? 0) > 0 ? /* @__PURE__ */ (0, Y.jsx)(Q, {
				title: "Geometry",
				children: /* @__PURE__ */ (0, Y.jsx)("div", {
					className: "grid grid-cols-2 gap-2",
					children: X[a.localName].map((e) => /* @__PURE__ */ (0, Y.jsx)("div", {
						className: [
							"d",
							"points",
							"viewBox",
							"preserveAspectRatio"
						].includes(e) ? "col-span-2" : "",
						children: y(e)
					}, e))
				})
			}) : null, /* @__PURE__ */ (0, Y.jsx)(Q, {
				title: "Transform",
				children: y("transform")
			})] }) : null
		]
	}, v);
}
//#endregion
//#region src/components/svg-editor/XmlTree.tsx
function Te({ editor: e }) {
	let n = (0, J.useSyncExternalStore)(e.subscribe, e.getState), r = (0, J.useMemo)(() => e.tree(), [e, n.revision]), [i, a] = (0, J.useState)(!0), [o, s] = (0, J.useState)(""), c = o.trim().toLowerCase(), [l, u] = (0, J.useState)(() => /* @__PURE__ */ new Set([r[0]?.key])), [d, f] = (0, J.useState)(0), [p, m] = (0, J.useState)(600), h = (0, J.useRef)(null), { all: _, searchIndex: v, nodeTitles: y } = (0, J.useMemo)(() => {
		let t = /* @__PURE__ */ new Map(), n = /* @__PURE__ */ new Map(), i = /* @__PURE__ */ new Map(), a = (r) => r.forEach((r) => {
			t.set(r.key, r);
			let o = e.element(r.key), s = o ? Array.from(o.children).filter((e) => e.localName === "title").map((e) => e.textContent ?? "") : [];
			i.set(r.key, o?.getAttribute("title")?.trim() || s.find((e) => e.trim())?.trim() || ""), n.set(r.key, [
				r.id,
				o?.getAttribute("title") ?? "",
				...s
			].map((e) => e.toLowerCase())), a(r.children);
		});
		return a(r), {
			all: t,
			searchIndex: n,
			nodeTitles: i
		};
	}, [e, r]), b = (0, J.useMemo)(() => {
		let e = [], t = (n, r) => n.forEach((n) => {
			(!i || n.region) && (!c || v.get(n.key)?.some((e) => e.includes(c))) && e.push({
				entry: n,
				depth: i || c ? 0 : r
			}), (c || i || l.has(n.key)) && t(n.children, r + 1);
		});
		return t(r, 0), e;
	}, [
		r,
		l,
		i,
		c,
		v
	]);
	(0, J.useEffect)(() => {
		!n.selected || i || u((e) => {
			let t = new Set(e), r = _.get(n.selected)?.parent;
			for (; r;) t.add(r), r = _.get(r)?.parent;
			return t.size === e.size ? e : t;
		});
	}, [
		_,
		n.selected,
		i
	]), (0, J.useEffect)(() => {
		let e = h.current;
		if (!e) return;
		let t = new ResizeObserver(() => m(e.clientHeight));
		return t.observe(e), () => t.disconnect();
	}, []), (0, J.useEffect)(() => {
		let e = b.findIndex((e) => e.entry.key === n.selected), t = h.current;
		e < 0 || !t || t.clientHeight === 0 || (e * 28 < t.scrollTop ? t.scrollTop = e * 28 : (e + 1) * 28 > t.scrollTop + t.clientHeight && (t.scrollTop = (e + 1) * 28 - t.clientHeight));
	}, [
		b,
		n.selected,
		p
	]);
	let x = (e) => u((t) => {
		let n = new Set(t);
		return n.has(e) ? n.delete(e) : n.add(e), n;
	}), S = () => {
		h.current && (h.current.scrollTop = 0), f(0);
	}, C = Math.max(0, Math.floor(d / 28) - 12), w = Math.min(b.length, C + Math.ceil(p / 28) + 24);
	return /* @__PURE__ */ (0, Y.jsxs)("div", {
		className: "flex min-h-0 flex-1 flex-col",
		children: [
			/* @__PURE__ */ (0, Y.jsx)("div", {
				className: "flex h-10 shrink-0 items-center border-b px-3",
				children: /* @__PURE__ */ (0, Y.jsxs)(oe, {
					className: "h-6",
					children: [/* @__PURE__ */ (0, Y.jsx)(ae, {
						className: "pl-2",
						children: /* @__PURE__ */ (0, Y.jsx)(g, {
							"aria-hidden": "true",
							className: "size-3"
						})
					}), /* @__PURE__ */ (0, Y.jsx)(A, {
						type: "search",
						"aria-label": "Search SVG nodes by ID or title",
						autoComplete: "off",
						className: "h-6",
						value: o,
						onChange: (e) => {
							s(e.target.value), S();
						}
					})]
				})
			}),
			/* @__PURE__ */ (0, Y.jsxs)("div", {
				className: "flex shrink-0 items-center gap-2 border-b px-3 py-2",
				children: [/* @__PURE__ */ (0, Y.jsxs)("div", {
					className: "flex rounded-md bg-muted p-0.5",
					"aria-label": "XML node filter",
					children: [/* @__PURE__ */ (0, Y.jsx)(t, {
						size: "xs",
						variant: i ? "ghost" : "outline",
						onClick: () => {
							a(!1), S();
						},
						"aria-pressed": !i,
						children: "All"
					}), /* @__PURE__ */ (0, Y.jsx)(t, {
						size: "xs",
						variant: i ? "outline" : "ghost",
						onClick: () => {
							a(!0), S();
						},
						"aria-pressed": i,
						children: "Regions"
					})]
				}), /* @__PURE__ */ (0, Y.jsxs)("span", {
					className: "text-[11px] text-muted-foreground",
					children: [
						b.length,
						" ",
						i ? b.length === 1 ? "region" : "regions" : b.length === 1 ? "node" : "nodes"
					]
				})]
			}),
			/* @__PURE__ */ (0, Y.jsxs)("div", {
				ref: h,
				role: "tree",
				"aria-label": "SVG XML tree",
				tabIndex: 0,
				"aria-activedescendant": b.slice(C, w).some((e) => e.entry.key === n.selected) ? `svg-tree-${n.selected}` : void 0,
				className: "min-h-0 flex-1 overflow-x-hidden overflow-y-auto outline-none",
				onScroll: (e) => f(e.currentTarget.scrollTop),
				onKeyDown: (t) => {
					let r = b.findIndex((e) => e.entry.key === n.selected), i = b[r];
					(t.key === "ArrowDown" || t.key === "ArrowUp") && (t.preventDefault(), e.select(b[Math.max(0, Math.min(b.length - 1, r + (t.key === "ArrowDown" ? 1 : -1)))]?.entry.key ?? null)), !c && t.key === "ArrowRight" && i?.entry.children.length && (t.preventDefault(), l.has(i.entry.key) ? e.select(i.entry.children[0].key) : x(i.entry.key)), !c && t.key === "ArrowLeft" && i && (t.preventDefault(), l.has(i.entry.key) ? x(i.entry.key) : e.select(i.entry.parent));
				},
				children: [/* @__PURE__ */ (0, Y.jsx)("div", {
					style: {
						height: b.length * 28,
						position: "relative",
						minWidth: "100%",
						width: "100%"
					},
					children: b.slice(C, w).map(({ entry: t, depth: r }, a) => {
						let o = y.get(t.key) ?? "", s = t.id ? `#${t.id}${o ? ` ${o}` : ""}` : o || t.text.slice(0, 90);
						return /* @__PURE__ */ (0, Y.jsxs)("div", {
							id: `svg-tree-${t.key}`,
							role: "treeitem",
							"aria-level": r + 1,
							"aria-selected": n.selected === t.key,
							"aria-expanded": t.children.length && !i && !c ? l.has(t.key) : void 0,
							className: `absolute left-0 flex h-7 w-full cursor-pointer items-center gap-1 pr-3 text-xs ${n.selected === t.key ? "bg-accent text-accent-foreground" : "hover:bg-muted/60"}`,
							style: {
								top: (C + a) * 28,
								paddingLeft: 8 + r * 16
							},
							onClick: () => e.select(t.key),
							children: [t.children.length && !i && !c ? /* @__PURE__ */ (0, Y.jsx)("button", {
								type: "button",
								tabIndex: -1,
								className: "flex size-4 shrink-0 cursor-pointer items-center justify-center text-muted-foreground",
								"aria-label": `${l.has(t.key) ? "Collapse" : "Expand"} ${t.name}${t.id ? ` ${t.id}` : ""}`,
								onClick: (e) => {
									e.stopPropagation(), x(t.key);
								},
								children: l.has(t.key) ? /* @__PURE__ */ (0, Y.jsx)(E, { className: "size-3" }) : /* @__PURE__ */ (0, Y.jsx)(D, { className: "size-3" })
							}) : /* @__PURE__ */ (0, Y.jsx)("span", { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, Y.jsxs)("button", {
								type: "button",
								tabIndex: -1,
								"aria-label": `${t.name.startsWith("#") ? t.name : `<${t.name}>`}${t.id ? ` #${t.id}` : t.text ? ` ${t.text.slice(0, 90)}` : ""}`,
								className: "flex h-full min-w-0 flex-1 cursor-pointer items-center gap-1.5 overflow-hidden text-left whitespace-nowrap",
								title: o ? s : t.text || `<${t.name}${t.id ? ` id="${t.id}"` : ""}>`,
								children: [
									t.region ? /* @__PURE__ */ (0, Y.jsx)(ge, { className: "size-3 shrink-0 text-emerald-600" }) : /* @__PURE__ */ (0, Y.jsx)(O, { className: "size-3 shrink-0 text-muted-foreground" }),
									/* @__PURE__ */ (0, Y.jsx)("span", {
										className: "shrink-0 font-mono",
										children: t.name.startsWith("#") ? t.name : `<${t.name}>`
									}),
									/* @__PURE__ */ (0, Y.jsx)("span", {
										className: "min-w-0 flex-1 truncate text-muted-foreground",
										children: s
									})
								]
							})]
						}, t.key);
					})
				}), b.length ? null : /* @__PURE__ */ (0, Y.jsx)("p", {
					className: "p-4 text-xs text-muted-foreground",
					children: c ? "No matching nodes." : "No regions. Regions are shapes with an ID matching the map’s region prefix."
				})]
			})
		]
	});
}
//#endregion
//#region src/components/svg-editor/SvgEditorWorkspace.tsx
var Ee = [
	.25,
	.5,
	.75,
	1,
	1.5,
	2,
	4,
	8
];
function $(e) {
	e?.isCollapsed() ? e.expand() : e?.collapse();
}
function De({ editor: e, busy: n, onReady: i, onClose: o }) {
	let l = (0, J.useSyncExternalStore)(e.subscribe, e.getState), [d, g] = (0, J.useState)("select"), [_, v] = (0, J.useState)(!0), [y, b] = (0, J.useState)(1), [T, E] = (0, J.useState)(""), D = s(), O = s(), [k, ie] = (0, J.useState)(!1), [A, ae] = (0, J.useState)(!1), [j, oe] = (0, J.useState)(null), M = (0, J.useRef)(null), N = (0, J.useRef)(i), P = (0, J.useRef)(o);
	N.current = i, P.current = o, (0, J.useEffect)(() => {
		if (!j) return;
		let t = new be(e, j, {
			onZoom: b,
			onTool: g,
			onError: (e) => E(e.message),
			onCloseRequest: () => P.current()
		});
		return M.current = t, t.mount().then(() => {
			M.current === t && N.current(t);
		}).catch((e) => E(e instanceof Error ? e.message : String(e))), () => {
			M.current = null, t.dispose();
		};
	}, [e, j]);
	let F = (e, n, r, i, a = !1, o) => /* @__PURE__ */ (0, Y.jsxs)(u, { children: [/* @__PURE__ */ (0, Y.jsx)(m, {
		asChild: !0,
		children: /* @__PURE__ */ (0, Y.jsx)(t, {
			size: "icon-xs",
			variant: !o && i ? "secondary" : "ghost",
			"aria-label": e,
			"aria-pressed": o ? void 0 : i,
			"aria-expanded": o ? i : void 0,
			"aria-controls": o,
			disabled: a,
			onClick: r,
			children: n
		})
	}), /* @__PURE__ */ (0, Y.jsx)(c, { children: e })] });
	return /* @__PURE__ */ (0, Y.jsx)(r, {
		delayDuration: 250,
		children: /* @__PURE__ */ (0, Y.jsxs)("div", {
			className: "flex min-h-0 min-w-0 flex-1 flex-col text-xs",
			inert: n,
			onKeyDown: (e) => {
				e.key !== "Escape" && e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "ArrowLeft" && e.key !== "ArrowRight" && M.current?.keyDown(e.nativeEvent);
			},
			children: [T ? /* @__PURE__ */ (0, Y.jsxs)("div", {
				role: "alert",
				className: "flex items-center justify-between gap-2 border-b px-3 py-2 text-destructive",
				children: [T, /* @__PURE__ */ (0, Y.jsx)(t, {
					size: "xs",
					variant: "ghost",
					onClick: () => E(""),
					children: "Dismiss"
				})]
			}) : null, /* @__PURE__ */ (0, Y.jsxs)(p, {
				orientation: "horizontal",
				children: [
					/* @__PURE__ */ (0, Y.jsx)(f, {
						id: "svg-xml",
						panelRef: D,
						defaultSize: "22%",
						minSize: "200px",
						collapsible: !0,
						collapsedSize: "0%",
						onResize: (e) => ie(e.asPercentage === 0),
						children: /* @__PURE__ */ (0, Y.jsx)("aside", {
							id: "svg-editor-xml",
							"aria-label": "SVG XML sidebar",
							"aria-hidden": k || void 0,
							inert: k,
							className: "flex h-full min-h-0 min-w-0 flex-col",
							children: /* @__PURE__ */ (0, Y.jsx)(Te, { editor: e })
						})
					}),
					/* @__PURE__ */ (0, Y.jsx)(a, { withHandle: !0 }),
					/* @__PURE__ */ (0, Y.jsx)(f, {
						id: "svg-preview",
						defaultSize: "50%",
						minSize: "30%",
						children: /* @__PURE__ */ (0, Y.jsxs)("div", {
							className: "flex h-full min-h-0 min-w-0 flex-col",
							children: [
								/* @__PURE__ */ (0, Y.jsxs)("div", {
									role: "toolbar",
									"aria-label": "SVG preview toolbar",
									className: "flex h-10 shrink-0 items-center justify-between gap-2 border-b px-3",
									children: [F(k ? "Expand left sidebar" : "Collapse left sidebar", /* @__PURE__ */ (0, Y.jsx)(h, {}), () => $(D.current), !k, !1, "svg-editor-xml"), F(A ? "Expand right sidebar" : "Collapse right sidebar", /* @__PURE__ */ (0, Y.jsx)(pe, {}), () => $(O.current), !A, !1, "svg-editor-inspector")]
								}),
								/* @__PURE__ */ (0, Y.jsx)("div", {
									className: "flex min-h-0 flex-1",
									children: /* @__PURE__ */ (0, Y.jsx)("iframe", {
										ref: oe,
										title: "SVG region editor",
										className: "min-h-0 w-full flex-1 border-0"
									})
								}),
								/* @__PURE__ */ (0, Y.jsxs)("div", {
									role: "toolbar",
									"aria-label": "SVG editor tools",
									className: "flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-2 border-t bg-background px-3 py-1.5",
									children: [
										/* @__PURE__ */ (0, Y.jsxs)("div", {
											className: "flex items-center gap-1",
											children: [
												F("Undo (⌘/Ctrl Z)", /* @__PURE__ */ (0, Y.jsx)(re, {}), () => e.undo(), void 0, !l.canUndo),
												F("Redo (⌘/Ctrl Shift Z)", /* @__PURE__ */ (0, Y.jsx)(te, {}), () => e.redo(), void 0, !l.canRedo),
												/* @__PURE__ */ (0, Y.jsx)("span", { className: "mx-1 h-4 border-l" }),
												[
													[
														"select",
														ee,
														"Select (V)"
													],
													[
														"hand",
														ne,
														"Hand (H / Space)"
													],
													[
														"draw",
														me,
														"Draw region (P)"
													]
												].map(([e, t, n]) => /* @__PURE__ */ (0, Y.jsx)("span", { children: F(n, /* @__PURE__ */ (0, Y.jsx)(t, {}), () => {
													M.current?.setTool(e), g(e);
												}, d === e) }, e)),
												/* @__PURE__ */ (0, Y.jsx)("span", { className: "mx-1 h-4 border-l" }),
												F("Snap to points (hold Alt to bypass)", /* @__PURE__ */ (0, Y.jsx)(fe, {}), () => {
													M.current && (M.current.snap = !_), v(!_);
												}, _)
											]
										}),
										/* @__PURE__ */ (0, Y.jsx)("span", {
											className: "hidden min-w-0 flex-1 truncate text-[10px] text-muted-foreground 2xl:inline",
											children: d === "draw" ? "Click points · Click first point or Enter to close" : "Double-click path to add a point · Delete removes selection"
										}),
										/* @__PURE__ */ (0, Y.jsxs)("div", {
											className: "flex items-center gap-1",
											children: [F("Fit SVG", /* @__PURE__ */ (0, Y.jsx)(he, {}), () => M.current?.fit()), /* @__PURE__ */ (0, Y.jsxs)(w, {
												disabled: n,
												value: String(y),
												onValueChange: (e) => {
													e === "fit" ? M.current?.fit() : M.current?.setZoom(Number(e));
												},
												children: [/* @__PURE__ */ (0, Y.jsxs)(C, {
													"aria-label": "SVG editor zoom",
													size: "sm",
													className: "w-[90px]",
													onKeyDown: (e) => e.stopPropagation(),
													children: [Math.round(y * 100), "%"]
												}), /* @__PURE__ */ (0, Y.jsxs)(S, {
													position: "popper",
													align: "end",
													side: "top",
													onKeyDown: (e) => e.stopPropagation(),
													children: [
														/* @__PURE__ */ (0, Y.jsx)(x, {
															value: "fit",
															children: "Fit SVG"
														}),
														Ee.map((e) => /* @__PURE__ */ (0, Y.jsxs)(x, {
															value: String(e),
															children: [e * 100, "%"]
														}, e)),
														Ee.includes(y) ? null : /* @__PURE__ */ (0, Y.jsxs)(x, {
															value: String(y),
															children: [Math.round(y * 100), "%"]
														})
													]
												})]
											})]
										})
									]
								})
							]
						})
					}),
					/* @__PURE__ */ (0, Y.jsx)(a, { withHandle: !0 }),
					/* @__PURE__ */ (0, Y.jsx)(f, {
						id: "svg-inspector",
						panelRef: O,
						defaultSize: "28%",
						minSize: "250px",
						collapsible: !0,
						collapsedSize: "0%",
						onResize: (e) => ae(e.asPercentage === 0),
						children: /* @__PURE__ */ (0, Y.jsx)("aside", {
							id: "svg-editor-inspector",
							"aria-label": "SVG inspector sidebar",
							"aria-hidden": A || void 0,
							inert: A,
							className: "flex h-full min-h-0 min-w-0 flex-col",
							children: /* @__PURE__ */ (0, Y.jsx)(we, { editor: e }, l.selected ?? "none")
						})
					})
				]
			})]
		})
	});
}
//#endregion
export { De as SvgEditorWorkspace };

//# sourceMappingURL=SvgEditorWorkspace-8qWbpQXX.js.map