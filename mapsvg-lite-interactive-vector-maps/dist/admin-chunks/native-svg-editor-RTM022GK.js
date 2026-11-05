import { S as e, a as t, c as n, i as r, l as i, m as a, o, p as s, r as c, s as l } from "./svgRegion-DESta_IR.js";
//#region ../svg-editor/src/document/history.ts
var u = class {
	constructor() {
		this.entries = [], this.cursor = 0;
	}
	get canUndo() {
		return this.cursor > 0;
	}
	get canRedo() {
		return this.cursor < this.entries.length;
	}
	push(e, t, n) {
		if (t.xml === n.xml) return;
		this.entries.splice(this.cursor), this.entries.push({
			label: e,
			before: t,
			after: n
		});
		let r = this.entries.reduce((e, t) => e + (t.before.xml.length + t.after.xml.length) * 2, 0);
		for (; this.entries.length > 1 && (this.entries.length > 80 || r > 24 * 1024 * 1024);) {
			let e = this.entries.shift();
			r -= (e.before.xml.length + e.after.xml.length) * 2;
		}
		this.cursor = this.entries.length;
	}
	undo() {
		return this.canUndo ? this.entries[--this.cursor].before : null;
	}
	redo() {
		return this.canRedo ? this.entries[this.cursor++].after : null;
	}
	clear() {
		this.entries = [], this.cursor = 0;
	}
}, d = class {
	constructor(e, t = () => !1, n = "") {
		this.isRegion = t, this.idPrefix = n, this.identities = /* @__PURE__ */ new WeakMap(), this.byKey = /* @__PURE__ */ new Map(), this.nextKey = 0, this.listeners = /* @__PURE__ */ new Set(), this.history = new u(), this.before = null, this.state = {
			revision: 0,
			selected: null,
			canUndo: !1,
			canRedo: !1,
			dirty: !1
		}, this.disposed = !1, this.getState = () => this.state, this.subscribe = (e) => (this.listeners.add(e), () => {
			this.listeners.delete(e);
		}), this.key = (e) => {
			let t = this.identities.get(e);
			return t || (t = `n${++this.nextKey}`, this.identities.set(e, t), this.byKey.set(t, e)), t;
		}, this.document = o(e), this.index(), this.original = this.exportSvg(), this.originalGeometry = this.geometry();
	}
	get root() {
		return this.document.documentElement;
	}
	get geometryChanged() {
		return this.geometry() !== this.originalGeometry;
	}
	geometry() {
		return [
			"width",
			"height",
			"viewBox"
		].map((e) => this.root.getAttribute(e) ?? "").join("\n");
	}
	node(e = this.state.selected) {
		return e ? this.byKey.get(e) ?? null : null;
	}
	element(e = this.state.selected) {
		let t = this.node(e);
		return r(t) ? t : null;
	}
	index(e) {
		this.identities = /* @__PURE__ */ new WeakMap(), this.byKey.clear(), t(this.root).forEach((t, n) => {
			e?.[n] ? (this.identities.set(t, e[n]), this.byKey.set(e[n], t)) : this.key(t);
		});
	}
	emit(e = !1) {
		this.disposed || (this.state = {
			...this.state,
			revision: this.state.revision + +!!e,
			canUndo: this.history.canUndo,
			canRedo: this.history.canRedo,
			dirty: this.exportSvg() !== this.original
		}, this.listeners.forEach((e) => e()));
	}
	select(e) {
		e && !this.byKey.has(e) || e !== this.state.selected && (this.state = {
			...this.state,
			selected: e
		}, this.emit());
	}
	exportSvg() {
		return n(this.document);
	}
	clonePreview() {
		return l(this.root, this.key);
	}
	snapshot() {
		return {
			xml: this.exportSvg(),
			keys: t(this.root).map(this.key),
			selected: this.state.selected
		};
	}
	restore(e) {
		this.document = o(e.xml), this.index(e.keys), this.state = {
			...this.state,
			selected: e.selected && this.byKey.has(e.selected) ? e.selected : null
		};
	}
	begin() {
		if (this.before) throw Error("An SVG edit is already in progress.");
		this.before = this.snapshot();
	}
	commit(e) {
		if (!this.before) return;
		let t = this.before;
		this.before = null, this.history.push(e, t, this.snapshot()), this.emit(!0);
	}
	cancel() {
		if (!this.before) return;
		let e = this.before;
		if (this.before = null, this.exportSvg() === e.xml) {
			this.state.selected !== e.selected && this.select(e.selected);
			return;
		}
		this.restore(e), this.emit(!0);
	}
	change(e, t) {
		this.begin();
		try {
			t(), this.commit(e);
		} catch (e) {
			throw this.cancel(), e;
		}
	}
	undo() {
		this.cancel();
		let e = this.history.undo();
		e && (this.restore(e), this.emit(!0));
	}
	redo() {
		this.cancel();
		let e = this.history.redo();
		e && (this.restore(e), this.emit(!0));
	}
	setAttribute(e, t, n) {
		let r = this.element(e);
		if (!r) throw Error("Select an XML element.");
		if (t === "id" && n) {
			if (/\s/.test(n)) throw Error("An SVG ID cannot contain spaces.");
			if ([this.root, ...Array.from(this.root.querySelectorAll("[id]"))].some((e) => e !== r && e.id === n)) throw Error("This SVG ID is already in use.");
		}
		if (t === "d" && n && s(n), t === "points" && n && a(n), t === "viewBox" && n) {
			let e = n.trim().split(/[\s,]+/).map(Number);
			if (e.length !== 4 || e.some((e) => !Number.isFinite(e)) || e[2] <= 0 || e[3] <= 0) throw Error("Use x y width height, with positive width and height.");
		}
		if (t === "xmlns" && n !== "http://www.w3.org/2000/svg") throw Error("The SVG namespace must be preserved.");
		i(r, t, n);
	}
	updateAttribute(e, t, n) {
		this.change(`Set ${t}`, () => this.setAttribute(e, t, n));
	}
	updateText(e, n) {
		this.change("Edit text", () => {
			let i = this.node(e);
			if (i) if (r(i)) {
				if (Array.from(i.childNodes).some(r)) throw Error("Select a child text node to preserve nested elements.");
				i.textContent = n, t(i).forEach(this.key);
			} else {
				if (i.nodeType === 8 && (/--/.test(n) || n.endsWith("-"))) throw Error("XML comments cannot contain -- or end with -.");
				if (i.nodeType === 4 && n.includes("]]>")) throw Error("CDATA cannot contain ]]>. ");
				i.nodeValue = n;
			}
		});
	}
	deleteNode(e = this.state.selected) {
		let n = this.node(e);
		!n || n === this.root || this.change("Delete node", () => {
			for (let e of t(n)) this.byKey.delete(this.key(e));
			n.parentNode?.removeChild(n), this.state = {
				...this.state,
				selected: null
			};
		});
	}
	addPath(t) {
		s(t);
		let n = 1, r = new Set([this.root, ...Array.from(this.root.querySelectorAll("[id]"))].map((e) => e.id));
		for (; r.has(`${this.idPrefix}region_${n}`);) n++;
		this.change("Draw region", () => {
			let r = this.document.createElementNS(e, "path");
			r.setAttribute("id", `${this.idPrefix}region_${n}`), r.setAttribute("d", t), r.setAttribute("fill", "#cbd5e1"), r.setAttribute("stroke", "#64748b"), r.setAttribute("stroke-width", "1"), this.root.appendChild(r), this.state = {
				...this.state,
				selected: this.key(r)
			};
		});
	}
	tree() {
		let e = (t, n) => {
			if (!r(t) && !t.nodeValue?.trim()) return null;
			let i = this.key(t);
			return {
				key: i,
				name: r(t) ? t.tagName : t.nodeType === 8 ? "#comment" : t.nodeType === 4 ? "#cdata" : "#text",
				id: r(t) ? t.getAttribute("id") ?? "" : "",
				text: r(t) ? "" : t.nodeValue ?? "",
				region: r(t) && this.isRegion(t),
				parent: n,
				children: Array.from(t.childNodes).map((t) => e(t, i)).filter((e) => e !== null)
			};
		}, t = e(this.root, null);
		return t ? [t] : [];
	}
	dispose() {
		this.disposed = !0, this.before = null, this.history.clear(), this.listeners.clear(), this.byKey.clear();
	}
};
//#endregion
//#region src/lib/native-svg-editor.ts
async function f(e, t) {
	if (typeof e.source != "string" || !e.source) throw Error("Choose an SVG file first.");
	let n = new URL(e.source, document.baseURI);
	if (n.origin !== window.location.origin || !/^https?:$/.test(n.protocol)) throw Error("The SVG editor requires a same-origin SVG file.");
	t.svgFileLastChanged && n.searchParams.set("version", String(t.svgFileLastChanged));
	let r = new AbortController(), i = () => r.abort(t.signal.reason);
	t.signal.addEventListener("abort", i, { once: !0 }), t.signal.aborted && i();
	let a = setTimeout(() => r.abort(/* @__PURE__ */ Error("The SVG file took too long to load.")), 3e4);
	try {
		let i = async () => {
			let e = await fetch(n, {
				credentials: "same-origin",
				cache: "no-store",
				signal: r.signal
			});
			if (!e.ok) throw Object.assign(/* @__PURE__ */ Error(`The SVG file could not load (${e.status}).`), { status: e.status });
			return e.text();
		}, a = await (t.load ? t.load(i) : i());
		if (r.signal.aborted) throw r.signal.reason;
		let o = typeof e.regionPrefix == "string" ? e.regionPrefix : "";
		return new d(a, (e) => c(e, o), o);
	} finally {
		clearTimeout(a), t.signal.removeEventListener("abort", i);
	}
}
//#endregion
export { f as createNativeSvgEditor };

//# sourceMappingURL=native-svg-editor-RTM022GK.js.map