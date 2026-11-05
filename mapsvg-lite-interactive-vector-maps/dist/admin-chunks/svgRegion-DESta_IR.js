//#region ../svg-editor/src/types.ts
var e = "http://www.w3.org/2000/svg";
//#endregion
//#region ../svg-editor/src/geometry/arc.ts
function t(e, t) {
	let [n, r, i, a, o, s, c] = t;
	if (n = Math.abs(n), r = Math.abs(r), !n || !r || e.x === s && e.y === c) return null;
	let l = i * Math.PI / 180, u = Math.cos(l), d = Math.sin(l), f = (e.x - s) / 2, p = (e.y - c) / 2, m = u * f + d * p, h = -d * f + u * p, g = m ** 2 / n ** 2 + h ** 2 / r ** 2;
	g > 1 && (n *= Math.sqrt(g), r *= Math.sqrt(g));
	let _ = (a === o ? -1 : 1) * Math.sqrt(Math.max(0, (n ** 2 * r ** 2 - n ** 2 * h ** 2 - r ** 2 * m ** 2) / (n ** 2 * h ** 2 + r ** 2 * m ** 2))), v = _ * n * h / r, y = -_ * r * m / n, b = u * v - d * y + (e.x + s) / 2, x = d * v + u * y + (e.y + c) / 2, S = (m - v) / n, C = (h - y) / r, w = (-m - v) / n, T = (-h - y) / r, E = Math.atan2(C, S), D = Math.atan2(S * T - C * w, S * w + C * T);
	return !o && D > 0 && (D -= 2 * Math.PI), o && D < 0 && (D += 2 * Math.PI), {
		rx: n,
		ry: r,
		rotation: i,
		sweep: o,
		theta: E,
		delta: D,
		at: (e) => {
			let t = E + D * e;
			return {
				x: b + u * n * Math.cos(t) - d * r * Math.sin(t),
				y: x + d * n * Math.cos(t) + u * r * Math.sin(t)
			};
		}
	};
}
//#endregion
//#region ../svg-editor/src/geometry/math.ts
var n = (e, t, n) => ({
	x: e.x + (t.x - e.x) * n,
	y: e.y + (t.y - e.y) * n
}), r = (e, t) => (e.x - t.x) ** 2 + (e.y - t.y) ** 2, i = (e, t = e.length - 2) => ({
	x: e[t],
	y: e[t + 1]
}), a = (e) => {
	if (!Number.isFinite(e)) throw Error("Coordinates must be finite numbers.");
	return String(Math.round(e * 1e8) / 1e8);
};
function o(e, t, r, i, a) {
	return n(n(n(e, t, a), n(t, r, a), a), n(n(t, r, a), n(r, i, a), a), a);
}
function s(e, t, r, i) {
	return n(n(e, t, i), n(t, r, i), i);
}
function c(e, t, n) {
	let i = r(e, t);
	return i ? Math.max(0, Math.min(1, ((n.x - e.x) * (t.x - e.x) + (n.y - e.y) * (t.y - e.y)) / i)) : 0;
}
var l = class {
	constructor(e, t) {
		this.radius = e, this.buckets = /* @__PURE__ */ new Map();
		for (let e of t) {
			let t = this.key(e);
			this.buckets.set(t, [...this.buckets.get(t) || [], e]);
		}
	}
	key(e) {
		return `${Math.floor(e.x / this.radius)},${Math.floor(e.y / this.radius)}`;
	}
	nearest(e) {
		let t = e, n = this.radius ** 2, i = Math.floor(e.x / this.radius), a = Math.floor(e.y / this.radius);
		for (let o = -1; o <= 1; o++) for (let s = -1; s <= 1; s++) for (let c of this.buckets.get(`${i + o},${a + s}`) || []) {
			let i = r(c, e);
			i < n && (t = c, n = i);
		}
		return { ...t };
	}
}, u = {
	M: 2,
	L: 2,
	H: 1,
	V: 1,
	C: 6,
	S: 4,
	Q: 4,
	T: 2,
	A: 7
};
function d(e) {
	let t = 0, n = "", r = {
		x: 0,
		y: 0
	}, a = r, o = "", s = r, c = [], l = () => {
		for (; /[\s,]/.test(e[t] ?? "") && t < e.length;) t++;
	}, d = (n = !1) => {
		l();
		let r = n ? /^[01]/.exec(e.slice(t)) : /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(e.slice(t));
		if (!r) throw Error(`Invalid path data at character ${t + 1}.`);
		t += r[0].length;
		let i = Number(r[0]);
		if (!Number.isFinite(i)) throw Error("Path coordinates must be finite.");
		return i;
	};
	for (; l(), !(t >= e.length);) {
		if (/[a-z]/i.test(e[t])) n = e[t++];
		else if (!n || n.toUpperCase() === "Z") throw Error(`Expected a path command at character ${t + 1}.`);
		let l = n.toUpperCase(), f = n !== l;
		if (!c.length && l !== "M") throw Error("A path must start with M.");
		if (l === "Z") {
			c.push({
				type: "Z",
				values: []
			}), r = { ...a }, o = "Z", n = "";
			continue;
		}
		if (!u[l]) throw Error(`Unknown path command ${n}.`);
		let p = Array.from({ length: u[l] }, (e, t) => d(l === "A" && (t === 3 || t === 4))), m = (e) => {
			f && (p[e] += r.x, p[e + 1] += r.y);
		}, h;
		if (l === "H") h = {
			type: "L",
			values: [p[0] + (f ? r.x : 0), r.y]
		};
		else if (l === "V") h = {
			type: "L",
			values: [r.x, p[0] + (f ? r.y : 0)]
		};
		else if (l === "A") m(5), h = {
			type: l,
			values: [
				Math.abs(p[0]),
				Math.abs(p[1]),
				...p.slice(2)
			]
		};
		else {
			for (let e = 0; e < p.length; e += 2) m(e);
			let e = o === (l === "S" ? "C" : "Q") ? {
				x: 2 * r.x - s.x,
				y: 2 * r.y - s.y
			} : r;
			h = l === "S" ? {
				type: "C",
				values: [
					e.x,
					e.y,
					...p
				]
			} : l === "T" ? {
				type: "Q",
				values: [
					e.x,
					e.y,
					...p
				]
			} : {
				type: l,
				values: p
			};
		}
		c.push(h), r = i(h.values), h.type === "M" && (a = { ...r }), s = h.type === "C" ? i(h.values, 2) : h.type === "Q" ? i(h.values, 0) : r, o = h.type, l === "M" && (n = f ? "l" : "L");
	}
	return c;
}
var f = (e) => e.map(({ type: e, values: t }) => `${e}${t.map(a).join(" ")}`).join(" ");
function p(e) {
	let t = {
		x: 0,
		y: 0
	}, n = t;
	return e.map((e) => {
		let r = { ...t };
		return e.type === "M" && (n = i(e.values)), t = e.type === "Z" ? { ...n } : i(e.values), {
			from: r,
			to: { ...t }
		};
	});
}
function m(e) {
	let t = p(e), n = [];
	return e.forEach((e, r) => {
		if (e.type === "Z") return;
		let a = e.values.length - 2;
		n.push({
			segment: r,
			offset: a,
			point: i(e.values),
			kind: "anchor"
		}), e.type === "C" ? (n.push({
			segment: r,
			offset: 0,
			point: i(e.values, 0),
			kind: "control",
			anchor: t[r].from
		}), n.push({
			segment: r,
			offset: 2,
			point: i(e.values, 2),
			kind: "control",
			anchor: t[r].to
		})) : e.type === "Q" && n.push({
			segment: r,
			offset: 0,
			point: i(e.values, 0),
			kind: "control",
			anchor: t[r].from
		});
	}), n;
}
function h(e, t, n) {
	let a = e.map((e) => ({
		...e,
		values: [...e.values]
	})), o = a[t.segment], s = n.x - o.values[t.offset], c = n.y - o.values[t.offset + 1], l = (e, t) => {
		e.values[t] += s, e.values[t + 1] += c;
	};
	if (l(o, t.offset), t.kind === "anchor") {
		o.type === "C" && l(o, 2), o.type === "Q" && l(o, 0);
		let n = a[t.segment + 1];
		if (n?.type === "C" && l(n, 0), o.type === "M") {
			let n = t.segment + 1;
			for (; n < a.length && a[n].type !== "M";) n++;
			if (a[n - 1]?.type === "Z") {
				let o = a[n - 2], s = e[n - 2];
				o && o.type !== "Z" && s && r(i(s.values), t.point) < 1e-16 && (l(o, o.values.length - 2), o.type === "C" && l(o, 2));
			}
		}
	}
	return a;
}
function g(e, r, a, c) {
	return e.type === "C" ? o(r, i(e.values, 0), i(e.values, 2), a, c) : e.type === "Q" ? s(r, i(e.values, 0), a, c) : e.type === "A" ? t(r, e.values)?.at(c) ?? n(r, a, c) : n(r, a, c);
}
function _(e, t) {
	let n = {
		segment: -1,
		t: 0,
		distance: Infinity,
		point: t
	}, i = p(e);
	return e.forEach((e, a) => {
		if (e.type === "M") return;
		let { from: o, to: s } = i[a], l;
		if (e.type === "L" || e.type === "Z") l = c(o, s, t);
		else {
			let n = 0, i = Infinity;
			for (let a = 0; a <= 24; a++) {
				let c = r(g(e, o, s, a / 24), t);
				c < i && (i = c, n = a / 24);
			}
			let a = Math.max(0, n - 1 / 24), c = Math.min(1, n + 1 / 24);
			for (let n = 0; n < 18; n++) {
				let n = a + (c - a) / 3, i = c - (c - a) / 3;
				r(g(e, o, s, n), t) < r(g(e, o, s, i), t) ? c = i : a = n;
			}
			l = (a + c) / 2;
		}
		let u = g(e, o, s, l), d = r(u, t);
		d < n.distance && (n = {
			segment: a,
			t: l,
			distance: d,
			point: u
		});
	}), n;
}
function v(e, r, a) {
	if (!(a > 0 && a < 1) || !e[r] || e[r].type === "M") return e;
	let o = e.map((e) => ({
		...e,
		values: [...e.values]
	})), s = o[r], { from: c, to: l } = p(o)[r], u, d = (e) => [e.x, e.y];
	if (s.type === "C") {
		let e = n(c, i(s.values, 0), a), t = n(i(s.values, 0), i(s.values, 2), a), r = n(i(s.values, 2), l, a), o = n(e, t, a), f = n(t, r, a), p = n(o, f, a);
		u = [{
			type: "C",
			values: [
				...d(e),
				...d(o),
				...d(p)
			]
		}, {
			type: "C",
			values: [
				...d(f),
				...d(r),
				...d(l)
			]
		}];
	} else if (s.type === "Q") {
		let e = n(c, i(s.values, 0), a), t = n(i(s.values, 0), l, a), r = n(e, t, a);
		u = [{
			type: "Q",
			values: [...d(e), ...d(r)]
		}, {
			type: "Q",
			values: [...d(t), ...d(l)]
		}];
	} else if (s.type === "A" && t(c, s.values)) {
		let e = t(c, s.values), n = e.at(a), r = (t, n) => [
			e.rx,
			e.ry,
			e.rotation,
			+(Math.abs(e.delta * t) > Math.PI),
			e.sweep,
			...d(n)
		];
		u = [{
			type: "A",
			values: r(a, n)
		}, {
			type: "A",
			values: r(1 - a, l)
		}];
	} else u = [{
		type: "L",
		values: d(n(c, l, a))
	}, s.type === "Z" ? {
		type: "Z",
		values: []
	} : {
		type: "L",
		values: d(l)
	}];
	return o.splice(r, 1, ...u), o;
}
function y(e, t) {
	if (!e[t] || e[t].type === "Z") return e;
	let n = e.map((e) => ({
		...e,
		values: [...e.values]
	}));
	if (n[t].type === "M") {
		let e = n[t + 1];
		e && e.type !== "M" && e.type !== "Z" ? n[t + 1] = {
			type: "M",
			values: [...e.values.slice(-2)]
		} : e?.type === "Z" && n.splice(t + 1, 1);
	}
	return n.splice(t, 1), n;
}
function b(e) {
	if (!e.trim()) return [];
	let t = e.trim().split(/[\s,]+/).map(Number);
	if (t.length % 2 || t.some((e) => !Number.isFinite(e))) throw Error("Use pairs of finite x,y coordinates.");
	return Array.from({ length: t.length / 2 }, (e, n) => ({
		x: t[n * 2],
		y: t[n * 2 + 1]
	}));
}
var x = (e) => e.map((e) => `${a(e.x)},${a(e.y)}`).join(" ");
//#endregion
//#region ../svg-editor/src/document/xml.ts
function S(e) {
	if (/<!\s*ENTITY\b/i.test(e) || /<!DOCTYPE[^>]*\[/i.test(e)) throw Error("SVG entity declarations are not supported.");
	let t = new DOMParser().parseFromString(e, "image/svg+xml");
	if (t.querySelector("parsererror") || t.documentElement.localName !== "svg" || t.documentElement.namespaceURI !== "http://www.w3.org/2000/svg") throw Error("The file is not a valid SVG document.");
	return t;
}
var C = (e) => new XMLSerializer().serializeToString(e);
function w(e) {
	let t = [], n = [e];
	for (; n.length;) {
		let e = n.pop();
		t.push(e);
		for (let t = e.childNodes.length - 1; t >= 0; t--) n.push(e.childNodes[t]);
	}
	return t;
}
var T = (e) => e?.nodeType === 1;
function E(e, t, n) {
	if (!/^[A-Za-z_][\w.:-]*$/.test(t)) throw Error("Invalid XML attribute name.");
	let r = null;
	if (t === "xmlns" || t.startsWith("xmlns:")) r = "http://www.w3.org/2000/xmlns/";
	else if (t.startsWith("xml:")) r = "http://www.w3.org/XML/1998/namespace";
	else if (t.startsWith("xlink:")) r = "http://www.w3.org/1999/xlink";
	else if (t.includes(":") && (r = e.lookupNamespaceURI(t.split(":")[0]), !r)) throw Error("Declare the XML namespace before using this attribute.");
	let i = t.includes(":") ? t.split(":")[1] : t;
	n === null ? r ? e.removeAttributeNS(r, i) : e.removeAttribute(t) : r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n);
}
function D(e, t) {
	let n = e.cloneNode(!0), r = w(e), i = w(n);
	return r.forEach((e, n) => {
		let r = i[n];
		if (T(r)) {
			if (r.setAttribute("data-svg-editor-key", t(e)), [
				"script",
				"foreignObject",
				"iframe",
				"object",
				"embed",
				"animate",
				"animateTransform",
				"animateMotion",
				"set"
			].includes(r.localName)) {
				r.remove();
				return;
			}
			for (let e of Array.from(r.attributes)) (/^on/i.test(e.name) || (e.localName === "href" || e.name === "src") && /^\s*(?:javascript|vbscript):/i.test(e.value)) && r.removeAttributeNode(e);
		}
	}), n;
}
//#endregion
//#region ../mapsvg/Region/svgRegion.ts
var O = "data-mapsvg-region-exclude";
function k(e) {
	return [
		"path",
		"polygon",
		"circle",
		"ellipse",
		"rect"
	].includes(e.localName) && !e.closest("defs");
}
function A(e) {
	return /^(true|1)$/i.test((e.getAttribute("data-mapsvg-region-exclude") ?? "").trim());
}
function j(e, t = "") {
	return k(e) && !A(e) && !!e.getAttribute("id") && (!t || e.getAttribute("id").startsWith(t));
}
//#endregion
export { e as S, x as _, w as a, r as b, C as c, h as d, _ as f, f as g, m as h, T as i, E as l, b as m, k as n, S as o, d as p, j as r, D as s, O as t, y as u, v, a as x, l as y };

//# sourceMappingURL=svgRegion-DESta_IR.js.map