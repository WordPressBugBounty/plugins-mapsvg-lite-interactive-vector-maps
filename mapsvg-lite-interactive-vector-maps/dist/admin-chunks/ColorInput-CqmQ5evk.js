import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Fr as t, bi as n, hi as r, kt as i } from "./admin-startup-CJQ1Yfhw.js";
import { t as a } from "./label-mmXv6K5N.js";
import { i as o, r as s, t as c } from "./popover-sNDyp8_1.js";
//#region node_modules/.pnpm/@ctrl+tinycolor@4.2.0/node_modules/@ctrl/tinycolor/dist/module/util.js
function l(e, t) {
	d(e) && (e = "100%");
	let n = f(e);
	return e = t === 360 ? e : Math.min(t, Math.max(0, parseFloat(e))), n && (e = parseInt(String(e * t), 10) / 100), Math.abs(e - t) < 1e-6 ? 1 : (e = t === 360 ? (e < 0 ? e % t + t : e % t) / parseFloat(String(t)) : e % t / parseFloat(String(t)), e);
}
function u(e) {
	return Math.min(1, Math.max(0, e));
}
function d(e) {
	return typeof e == "string" && e.indexOf(".") !== -1 && parseFloat(e) === 1;
}
function f(e) {
	return typeof e == "string" && e.indexOf("%") !== -1;
}
function p(e) {
	return e = parseFloat(e), (isNaN(e) || e < 0 || e > 1) && (e = 1), e;
}
function m(e) {
	return Number(e) <= 1 ? `${Number(e) * 100}%` : e;
}
function h(e) {
	return e.length === 1 ? "0" + e : String(e);
}
//#endregion
//#region node_modules/.pnpm/@ctrl+tinycolor@4.2.0/node_modules/@ctrl/tinycolor/dist/module/conversion.js
function g(e, t, n) {
	return {
		r: l(e, 255) * 255,
		g: l(t, 255) * 255,
		b: l(n, 255) * 255
	};
}
function _(e, t, n) {
	e = l(e, 255), t = l(t, 255), n = l(n, 255);
	let r = Math.max(e, t, n), i = Math.min(e, t, n), a = 0, o = 0, s = (r + i) / 2;
	if (r === i) o = 0, a = 0;
	else {
		let c = r - i;
		switch (o = s > .5 ? c / (2 - r - i) : c / (r + i), r) {
			case e:
				a = (t - n) / c + (t < n ? 6 : 0);
				break;
			case t:
				a = (n - e) / c + 2;
				break;
			case n:
				a = (e - t) / c + 4;
				break;
			default: break;
		}
		a /= 6;
	}
	return {
		h: a,
		s: o,
		l: s
	};
}
function v(e, t, n) {
	return n < 0 && (n += 1), n > 1 && --n, n < 1 / 6 ? e + (t - e) * (6 * n) : n < 1 / 2 ? t : n < 2 / 3 ? e + (t - e) * (2 / 3 - n) * 6 : e;
}
function y(e, t, n) {
	let r, i, a;
	if (e = l(e, 360), t = l(t, 100), n = l(n, 100), t === 0) i = n, a = n, r = n;
	else {
		let o = n < .5 ? n * (1 + t) : n + t - n * t, s = 2 * n - o;
		r = v(s, o, e + 1 / 3), i = v(s, o, e), a = v(s, o, e - 1 / 3);
	}
	return {
		r: r * 255,
		g: i * 255,
		b: a * 255
	};
}
function b(e, t, n) {
	e = l(e, 255), t = l(t, 255), n = l(n, 255);
	let r = Math.max(e, t, n), i = Math.min(e, t, n), a = 0, o = r, s = r - i, c = r === 0 ? 0 : s / r;
	if (r === i) a = 0;
	else {
		switch (r) {
			case e:
				a = (t - n) / s + (t < n ? 6 : 0);
				break;
			case t:
				a = (n - e) / s + 2;
				break;
			case n:
				a = (e - t) / s + 4;
				break;
			default: break;
		}
		a /= 6;
	}
	return {
		h: a,
		s: c,
		v: o
	};
}
function ee(e, t, n) {
	e = l(e, 360) * 6, t = l(t, 100), n = l(n, 100);
	let r = Math.floor(e), i = e - r, a = n * (1 - t), o = n * (1 - i * t), s = n * (1 - (1 - i) * t), c = r % 6, u = [
		n,
		o,
		a,
		a,
		s,
		n
	][c], d = [
		s,
		n,
		n,
		o,
		a,
		a
	][c], f = [
		a,
		a,
		s,
		n,
		n,
		o
	][c];
	return {
		r: u * 255,
		g: d * 255,
		b: f * 255
	};
}
function x(e, t, n, r) {
	let i = [
		h(Math.round(e).toString(16)),
		h(Math.round(t).toString(16)),
		h(Math.round(n).toString(16))
	];
	return r && i[0].startsWith(i[0].charAt(1)) && i[1].startsWith(i[1].charAt(1)) && i[2].startsWith(i[2].charAt(1)) ? i[0].charAt(0) + i[1].charAt(0) + i[2].charAt(0) : i.join("");
}
function S(e, t, n, r, i) {
	let a = [
		h(Math.round(e).toString(16)),
		h(Math.round(t).toString(16)),
		h(Math.round(n).toString(16)),
		h(te(r))
	];
	return i && a[0].startsWith(a[0].charAt(1)) && a[1].startsWith(a[1].charAt(1)) && a[2].startsWith(a[2].charAt(1)) && a[3].startsWith(a[3].charAt(1)) ? a[0].charAt(0) + a[1].charAt(0) + a[2].charAt(0) + a[3].charAt(0) : a.join("");
}
function C(e, t, n, r) {
	let i = e / 100, a = t / 100, o = n / 100, s = r / 100;
	return {
		r: 255 * (1 - i) * (1 - s),
		g: 255 * (1 - a) * (1 - s),
		b: 255 * (1 - o) * (1 - s)
	};
}
function w(e, t, n) {
	let r = 1 - e / 255, i = 1 - t / 255, a = 1 - n / 255, o = Math.min(r, i, a);
	return o === 1 ? (r = 0, i = 0, a = 0) : (r = (r - o) / (1 - o) * 100, i = (i - o) / (1 - o) * 100, a = (a - o) / (1 - o) * 100), o *= 100, {
		c: Math.round(r),
		m: Math.round(i),
		y: Math.round(a),
		k: Math.round(o)
	};
}
function te(e) {
	return Math.round(parseFloat(e) * 255).toString(16);
}
function T(e) {
	return E(e) / 255;
}
function E(e) {
	return parseInt(e, 16);
}
function D(e) {
	return {
		r: e >> 16,
		g: (e & 65280) >> 8,
		b: e & 255
	};
}
//#endregion
//#region node_modules/.pnpm/@ctrl+tinycolor@4.2.0/node_modules/@ctrl/tinycolor/dist/module/css-color-names.js
var O = {
	aliceblue: "#f0f8ff",
	antiquewhite: "#faebd7",
	aqua: "#00ffff",
	aquamarine: "#7fffd4",
	azure: "#f0ffff",
	beige: "#f5f5dc",
	bisque: "#ffe4c4",
	black: "#000000",
	blanchedalmond: "#ffebcd",
	blue: "#0000ff",
	blueviolet: "#8a2be2",
	brown: "#a52a2a",
	burlywood: "#deb887",
	cadetblue: "#5f9ea0",
	chartreuse: "#7fff00",
	chocolate: "#d2691e",
	coral: "#ff7f50",
	cornflowerblue: "#6495ed",
	cornsilk: "#fff8dc",
	crimson: "#dc143c",
	cyan: "#00ffff",
	darkblue: "#00008b",
	darkcyan: "#008b8b",
	darkgoldenrod: "#b8860b",
	darkgray: "#a9a9a9",
	darkgreen: "#006400",
	darkgrey: "#a9a9a9",
	darkkhaki: "#bdb76b",
	darkmagenta: "#8b008b",
	darkolivegreen: "#556b2f",
	darkorange: "#ff8c00",
	darkorchid: "#9932cc",
	darkred: "#8b0000",
	darksalmon: "#e9967a",
	darkseagreen: "#8fbc8f",
	darkslateblue: "#483d8b",
	darkslategray: "#2f4f4f",
	darkslategrey: "#2f4f4f",
	darkturquoise: "#00ced1",
	darkviolet: "#9400d3",
	deeppink: "#ff1493",
	deepskyblue: "#00bfff",
	dimgray: "#696969",
	dimgrey: "#696969",
	dodgerblue: "#1e90ff",
	firebrick: "#b22222",
	floralwhite: "#fffaf0",
	forestgreen: "#228b22",
	fuchsia: "#ff00ff",
	gainsboro: "#dcdcdc",
	ghostwhite: "#f8f8ff",
	goldenrod: "#daa520",
	gold: "#ffd700",
	gray: "#808080",
	green: "#008000",
	greenyellow: "#adff2f",
	grey: "#808080",
	honeydew: "#f0fff0",
	hotpink: "#ff69b4",
	indianred: "#cd5c5c",
	indigo: "#4b0082",
	ivory: "#fffff0",
	khaki: "#f0e68c",
	lavenderblush: "#fff0f5",
	lavender: "#e6e6fa",
	lawngreen: "#7cfc00",
	lemonchiffon: "#fffacd",
	lightblue: "#add8e6",
	lightcoral: "#f08080",
	lightcyan: "#e0ffff",
	lightgoldenrodyellow: "#fafad2",
	lightgray: "#d3d3d3",
	lightgreen: "#90ee90",
	lightgrey: "#d3d3d3",
	lightpink: "#ffb6c1",
	lightsalmon: "#ffa07a",
	lightseagreen: "#20b2aa",
	lightskyblue: "#87cefa",
	lightslategray: "#778899",
	lightslategrey: "#778899",
	lightsteelblue: "#b0c4de",
	lightyellow: "#ffffe0",
	lime: "#00ff00",
	limegreen: "#32cd32",
	linen: "#faf0e6",
	magenta: "#ff00ff",
	maroon: "#800000",
	mediumaquamarine: "#66cdaa",
	mediumblue: "#0000cd",
	mediumorchid: "#ba55d3",
	mediumpurple: "#9370db",
	mediumseagreen: "#3cb371",
	mediumslateblue: "#7b68ee",
	mediumspringgreen: "#00fa9a",
	mediumturquoise: "#48d1cc",
	mediumvioletred: "#c71585",
	midnightblue: "#191970",
	mintcream: "#f5fffa",
	mistyrose: "#ffe4e1",
	moccasin: "#ffe4b5",
	navajowhite: "#ffdead",
	navy: "#000080",
	oldlace: "#fdf5e6",
	olive: "#808000",
	olivedrab: "#6b8e23",
	orange: "#ffa500",
	orangered: "#ff4500",
	orchid: "#da70d6",
	palegoldenrod: "#eee8aa",
	palegreen: "#98fb98",
	paleturquoise: "#afeeee",
	palevioletred: "#db7093",
	papayawhip: "#ffefd5",
	peachpuff: "#ffdab9",
	peru: "#cd853f",
	pink: "#ffc0cb",
	plum: "#dda0dd",
	powderblue: "#b0e0e6",
	purple: "#800080",
	rebeccapurple: "#663399",
	red: "#ff0000",
	rosybrown: "#bc8f8f",
	royalblue: "#4169e1",
	saddlebrown: "#8b4513",
	salmon: "#fa8072",
	sandybrown: "#f4a460",
	seagreen: "#2e8b57",
	seashell: "#fff5ee",
	sienna: "#a0522d",
	silver: "#c0c0c0",
	skyblue: "#87ceeb",
	slateblue: "#6a5acd",
	slategray: "#708090",
	slategrey: "#708090",
	snow: "#fffafa",
	springgreen: "#00ff7f",
	steelblue: "#4682b4",
	tan: "#d2b48c",
	teal: "#008080",
	thistle: "#d8bfd8",
	tomato: "#ff6347",
	turquoise: "#40e0d0",
	violet: "#ee82ee",
	wheat: "#f5deb3",
	white: "#ffffff",
	whitesmoke: "#f5f5f5",
	yellow: "#ffff00",
	yellowgreen: "#9acd32"
};
//#endregion
//#region node_modules/.pnpm/@ctrl+tinycolor@4.2.0/node_modules/@ctrl/tinycolor/dist/module/format-input.js
function k(e) {
	let t = {
		r: 0,
		g: 0,
		b: 0
	}, n = 1, r = null, i = null, a = null, o = !1, s = !1;
	return typeof e == "string" && (e = ne(e)), typeof e == "object" && (j(e.r) && j(e.g) && j(e.b) ? (t = g(e.r, e.g, e.b), o = !0, s = String(e.r).substr(-1) === "%" ? "prgb" : "rgb") : j(e.h) && j(e.s) && j(e.v) ? (r = m(e.s), i = m(e.v), t = ee(e.h, r, i), o = !0, s = "hsv") : j(e.h) && j(e.s) && j(e.l) ? (r = m(e.s), a = m(e.l), t = y(e.h, r, a), o = !0, s = "hsl") : j(e.c) && j(e.m) && j(e.y) && j(e.k) && (t = C(e.c, e.m, e.y, e.k), o = !0, s = "cmyk"), Object.prototype.hasOwnProperty.call(e, "a") && (n = e.a)), n = p(n), {
		ok: o,
		format: e.format || s,
		r: Math.min(255, Math.max(t.r, 0)),
		g: Math.min(255, Math.max(t.g, 0)),
		b: Math.min(255, Math.max(t.b, 0)),
		a: n
	};
}
var A = {
	CSS_UNIT: /* @__PURE__ */ RegExp("(?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?)"),
	rgb: /* @__PURE__ */ RegExp("rgb[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),
	rgba: /* @__PURE__ */ RegExp("rgba[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),
	hsl: /* @__PURE__ */ RegExp("hsl[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),
	hsla: /* @__PURE__ */ RegExp("hsla[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),
	hsv: /* @__PURE__ */ RegExp("hsv[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),
	hsva: /* @__PURE__ */ RegExp("hsva[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),
	cmyk: /* @__PURE__ */ RegExp("cmyk[\\s|\\(]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))[,|\\s]+((?:[-\\+]?\\d*\\.\\d+%?)|(?:[-\\+]?\\d+%?))\\s*\\)?"),
	hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
	hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
	hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
	hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
};
function ne(e) {
	if (e = e.trim().toLowerCase(), e.length === 0) return !1;
	let t = !1;
	if (O[e]) e = O[e], t = !0;
	else if (e === "transparent") return {
		r: 0,
		g: 0,
		b: 0,
		a: 0,
		format: "name"
	};
	let n = A.rgb.exec(e);
	return n ? {
		r: n[1],
		g: n[2],
		b: n[3]
	} : (n = A.rgba.exec(e), n ? {
		r: n[1],
		g: n[2],
		b: n[3],
		a: n[4]
	} : (n = A.hsl.exec(e), n ? {
		h: n[1],
		s: n[2],
		l: n[3]
	} : (n = A.hsla.exec(e), n ? {
		h: n[1],
		s: n[2],
		l: n[3],
		a: n[4]
	} : (n = A.hsv.exec(e), n ? {
		h: n[1],
		s: n[2],
		v: n[3]
	} : (n = A.hsva.exec(e), n ? {
		h: n[1],
		s: n[2],
		v: n[3],
		a: n[4]
	} : (n = A.cmyk.exec(e), n ? {
		c: n[1],
		m: n[2],
		y: n[3],
		k: n[4]
	} : (n = A.hex8.exec(e), n ? {
		r: E(n[1]),
		g: E(n[2]),
		b: E(n[3]),
		a: T(n[4]),
		format: t ? "name" : "hex8"
	} : (n = A.hex6.exec(e), n ? {
		r: E(n[1]),
		g: E(n[2]),
		b: E(n[3]),
		format: t ? "name" : "hex"
	} : (n = A.hex4.exec(e), n ? {
		r: E(n[1] + n[1]),
		g: E(n[2] + n[2]),
		b: E(n[3] + n[3]),
		a: T(n[4] + n[4]),
		format: t ? "name" : "hex8"
	} : (n = A.hex3.exec(e), n ? {
		r: E(n[1] + n[1]),
		g: E(n[2] + n[2]),
		b: E(n[3] + n[3]),
		format: t ? "name" : "hex"
	} : !1))))))))));
}
function j(e) {
	return typeof e == "number" ? !Number.isNaN(e) : A.CSS_UNIT.test(e);
}
//#endregion
//#region node_modules/.pnpm/@ctrl+tinycolor@4.2.0/node_modules/@ctrl/tinycolor/dist/module/index.js
var M = class e {
	constructor(t = "", n = {}) {
		if (t instanceof e) return t;
		typeof t == "number" && (t = D(t)), this.originalInput = t;
		let r = k(t);
		this.originalInput = t, this.r = r.r, this.g = r.g, this.b = r.b, this.a = r.a, this.roundA = Math.round(100 * this.a) / 100, this.format = n.format ?? r.format, this.gradientType = n.gradientType, this.r < 1 && (this.r = Math.round(this.r)), this.g < 1 && (this.g = Math.round(this.g)), this.b < 1 && (this.b = Math.round(this.b)), this.isValid = r.ok;
	}
	isDark() {
		return this.getBrightness() < 128;
	}
	isLight() {
		return !this.isDark();
	}
	getBrightness() {
		let e = this.toRgb();
		return (e.r * 299 + e.g * 587 + e.b * 114) / 1e3;
	}
	getLuminance() {
		let e = this.toRgb(), t, n, r, i = e.r / 255, a = e.g / 255, o = e.b / 255;
		return t = i <= .03928 ? i / 12.92 : ((i + .055) / 1.055) ** 2.4, n = a <= .03928 ? a / 12.92 : ((a + .055) / 1.055) ** 2.4, r = o <= .03928 ? o / 12.92 : ((o + .055) / 1.055) ** 2.4, .2126 * t + .7152 * n + .0722 * r;
	}
	getAlpha() {
		return this.a;
	}
	setAlpha(e) {
		return this.a = p(e), this.roundA = Math.round(100 * this.a) / 100, this;
	}
	isMonochrome() {
		let { s: e } = this.toHsl();
		return e === 0;
	}
	toHsv() {
		let e = b(this.r, this.g, this.b);
		return {
			h: e.h * 360,
			s: e.s,
			v: e.v,
			a: this.a
		};
	}
	toHsvString() {
		let e = b(this.r, this.g, this.b), t = Math.round(e.h * 360), n = Math.round(e.s * 100), r = Math.round(e.v * 100);
		return this.a === 1 ? `hsv(${t}, ${n}%, ${r}%)` : `hsva(${t}, ${n}%, ${r}%, ${this.roundA})`;
	}
	toHsl() {
		let e = _(this.r, this.g, this.b);
		return {
			h: e.h * 360,
			s: e.s,
			l: e.l,
			a: this.a
		};
	}
	toHslString() {
		let e = _(this.r, this.g, this.b), t = Math.round(e.h * 360), n = Math.round(e.s * 100), r = Math.round(e.l * 100);
		return this.a === 1 ? `hsl(${t}, ${n}%, ${r}%)` : `hsla(${t}, ${n}%, ${r}%, ${this.roundA})`;
	}
	toHex(e = !1) {
		return x(this.r, this.g, this.b, e);
	}
	toHexString(e = !1) {
		return "#" + this.toHex(e);
	}
	toHex8(e = !1) {
		return S(this.r, this.g, this.b, this.a, e);
	}
	toHex8String(e = !1) {
		return "#" + this.toHex8(e);
	}
	toHexShortString(e = !1) {
		return this.a === 1 ? this.toHexString(e) : this.toHex8String(e);
	}
	toRgb() {
		return {
			r: Math.round(this.r),
			g: Math.round(this.g),
			b: Math.round(this.b),
			a: this.a
		};
	}
	toRgbString() {
		let e = Math.round(this.r), t = Math.round(this.g), n = Math.round(this.b);
		return this.a === 1 ? `rgb(${e}, ${t}, ${n})` : `rgba(${e}, ${t}, ${n}, ${this.roundA})`;
	}
	toPercentageRgb() {
		let e = (e) => `${Math.round(l(e, 255) * 100)}%`;
		return {
			r: e(this.r),
			g: e(this.g),
			b: e(this.b),
			a: this.a
		};
	}
	toPercentageRgbString() {
		let e = (e) => Math.round(l(e, 255) * 100);
		return this.a === 1 ? `rgb(${e(this.r)}%, ${e(this.g)}%, ${e(this.b)}%)` : `rgba(${e(this.r)}%, ${e(this.g)}%, ${e(this.b)}%, ${this.roundA})`;
	}
	toCmyk() {
		return { ...w(this.r, this.g, this.b) };
	}
	toCmykString() {
		let { c: e, m: t, y: n, k: r } = w(this.r, this.g, this.b);
		return `cmyk(${e}, ${t}, ${n}, ${r})`;
	}
	toName() {
		if (this.a === 0) return "transparent";
		if (this.a < 1) return !1;
		let e = "#" + x(this.r, this.g, this.b, !1);
		for (let [t, n] of Object.entries(O)) if (e === n) return t;
		return !1;
	}
	toString(e) {
		let t = !!e;
		e ??= this.format;
		let n = !1, r = this.a < 1 && this.a >= 0;
		return !t && r && (e.startsWith("hex") || e === "name") ? e === "name" && this.a === 0 ? this.toName() : this.toRgbString() : (e === "rgb" && (n = this.toRgbString()), e === "prgb" && (n = this.toPercentageRgbString()), (e === "hex" || e === "hex6") && (n = this.toHexString()), e === "hex3" && (n = this.toHexString(!0)), e === "hex4" && (n = this.toHex8String(!0)), e === "hex8" && (n = this.toHex8String()), e === "name" && (n = this.toName()), e === "hsl" && (n = this.toHslString()), e === "hsv" && (n = this.toHsvString()), e === "cmyk" && (n = this.toCmykString()), n || this.toHexString());
	}
	toNumber() {
		return (Math.round(this.r) << 16) + (Math.round(this.g) << 8) + Math.round(this.b);
	}
	clone() {
		return new e(this.toString());
	}
	lighten(t = 10) {
		let n = this.toHsl();
		return n.l += t / 100, n.l = u(n.l), new e(n);
	}
	brighten(t = 10) {
		let n = this.toRgb();
		return n.r = Math.max(0, Math.min(255, n.r - Math.round(255 * -(t / 100)))), n.g = Math.max(0, Math.min(255, n.g - Math.round(255 * -(t / 100)))), n.b = Math.max(0, Math.min(255, n.b - Math.round(255 * -(t / 100)))), new e(n);
	}
	darken(t = 10) {
		let n = this.toHsl();
		return n.l -= t / 100, n.l = u(n.l), new e(n);
	}
	tint(e = 10) {
		return this.mix("white", e);
	}
	shade(e = 10) {
		return this.mix("black", e);
	}
	desaturate(t = 10) {
		let n = this.toHsl();
		return n.s -= t / 100, n.s = u(n.s), new e(n);
	}
	saturate(t = 10) {
		let n = this.toHsl();
		return n.s += t / 100, n.s = u(n.s), new e(n);
	}
	greyscale() {
		return this.desaturate(100);
	}
	spin(t) {
		let n = this.toHsl(), r = (n.h + t) % 360;
		return n.h = r < 0 ? 360 + r : r, new e(n);
	}
	mix(t, n = 50) {
		let r = this.toRgb(), i = new e(t).toRgb(), a = n / 100, o = {
			r: (i.r - r.r) * a + r.r,
			g: (i.g - r.g) * a + r.g,
			b: (i.b - r.b) * a + r.b,
			a: (i.a - r.a) * a + r.a
		};
		return new e(o);
	}
	analogous(t = 6, n = 30) {
		let r = this.toHsl(), i = 360 / n, a = [this];
		for (r.h = (r.h - (i * t >> 1) + 720) % 360; --t;) r.h = (r.h + i) % 360, a.push(new e(r));
		return a;
	}
	complement() {
		let t = this.toHsl();
		return t.h = (t.h + 180) % 360, new e(t);
	}
	monochromatic(t = 6) {
		let n = this.toHsv(), { h: r } = n, { s: i } = n, { v: a } = n, o = [], s = 1 / t;
		for (; t--;) o.push(new e({
			h: r,
			s: i,
			v: a
		})), a = (a + s) % 1;
		return o;
	}
	splitcomplement() {
		let t = this.toHsl(), { h: n } = t;
		return [
			this,
			new e({
				h: (n + 72) % 360,
				s: t.s,
				l: t.l
			}),
			new e({
				h: (n + 216) % 360,
				s: t.s,
				l: t.l
			})
		];
	}
	onBackground(t) {
		let n = this.toRgb(), r = new e(t).toRgb(), i = n.a + r.a * (1 - n.a);
		return new e({
			r: (n.r * n.a + r.r * r.a * (1 - n.a)) / i,
			g: (n.g * n.a + r.g * r.a * (1 - n.a)) / i,
			b: (n.b * n.a + r.b * r.a * (1 - n.a)) / i,
			a: i
		});
	}
	triad() {
		return this.polyad(3);
	}
	tetrad() {
		return this.polyad(4);
	}
	polyad(t) {
		let n = this.toHsl(), { h: r } = n, i = [this], a = 360 / t;
		for (let o = 1; o < t; o++) i.push(new e({
			h: (r + o * a) % 360,
			s: n.s,
			l: n.l
		}));
		return i;
	}
	equals(t) {
		let n = new e(t);
		return this.format === "cmyk" || n.format === "cmyk" ? this.toCmykString() === n.toCmykString() : this.toRgbString() === n.toRgbString();
	}
}, N = /* @__PURE__ */ e(n(), 1);
function P() {
	return (P = Object.assign || function(e) {
		for (var t = 1; t < arguments.length; t++) {
			var n = arguments[t];
			for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
		}
		return e;
	}).apply(this, arguments);
}
function F(e, t) {
	if (e == null) return {};
	var n, r, i = {}, a = Object.keys(e);
	for (r = 0; r < a.length; r++) t.indexOf(n = a[r]) >= 0 || (i[n] = e[n]);
	return i;
}
function I(e) {
	var t = (0, N.useRef)(e), n = (0, N.useRef)(function(e) {
		t.current && t.current(e);
	});
	return t.current = e, n.current;
}
var L = function(e, t, n) {
	return t === void 0 && (t = 0), n === void 0 && (n = 1), e > n ? n : e < t ? t : e;
}, R = function(e) {
	return "touches" in e;
}, z = function(e) {
	return e && e.ownerDocument.defaultView || self;
}, B = function(e, t, n) {
	var r = e.getBoundingClientRect(), i = R(t) ? function(e, t) {
		for (var n = 0; n < e.length; n++) if (e[n].identifier === t) return e[n];
		return e[0];
	}(t.touches, n) : t;
	return {
		left: L((i.pageX - (r.left + z(e).pageXOffset)) / r.width),
		top: L((i.pageY - (r.top + z(e).pageYOffset)) / r.height)
	};
}, V = function(e) {
	!R(e) && e.preventDefault();
}, H = N.default.memo(function(e) {
	var t = e.onMove, n = e.onKey, r = e.onEnd, i = F(e, [
		"onMove",
		"onKey",
		"onEnd"
	]), a = (0, N.useRef)(null), o = I(t), s = I(n), c = I(r), l = (0, N.useRef)(null), u = (0, N.useRef)(!1), d = (0, N.useMemo)(function() {
		var e = function(e) {
			V(e), (R(e) ? e.touches.length > 0 : e.buttons > 0) && a.current ? o(B(a.current, e, l.current)) : (n(!1), c());
		}, t = function() {
			n(!1), c();
		};
		function n(n) {
			var r = u.current, i = z(a.current), o = n ? i.addEventListener : i.removeEventListener;
			o(r ? "touchmove" : "mousemove", e), o(r ? "touchend" : "mouseup", t);
		}
		return [
			function(e) {
				var t = e.nativeEvent, r = a.current;
				if (r && (V(t), !function(e, t) {
					return t && !R(e);
				}(t, u.current) && r)) {
					if (R(t)) {
						u.current = !0;
						var i = t.changedTouches || [];
						i.length && (l.current = i[0].identifier);
					}
					r.focus(), o(B(r, t, l.current)), n(!0);
				}
			},
			function(e) {
				var t = e.which || e.keyCode;
				t < 37 || t > 40 || (e.preventDefault(), s({
					left: t === 39 ? .05 : t === 37 ? -.05 : 0,
					top: t === 40 ? .05 : t === 38 ? -.05 : 0
				}));
			},
			function(e) {
				var t = e.which || e.keyCode;
				t >= 37 && t <= 40 && c();
			},
			n
		];
	}, [
		s,
		o,
		c
	]), f = d[0], p = d[1], m = d[2], h = d[3];
	return (0, N.useEffect)(function() {
		return h;
	}, [h]), N.default.createElement("div", P({}, i, {
		onTouchStart: f,
		onMouseDown: f,
		className: "react-colorful__interactive",
		ref: a,
		onKeyDown: p,
		onKeyUp: m,
		tabIndex: 0,
		role: "slider"
	}));
}), U = function(e) {
	return e.filter(Boolean).join(" ");
}, W = function(e) {
	var t = e.color, n = e.left, r = e.top, i = r === void 0 ? .5 : r, a = U(["react-colorful__pointer", e.className]);
	return N.default.createElement("div", {
		className: a,
		style: {
			top: 100 * i + "%",
			left: 100 * n + "%"
		}
	}, N.default.createElement("div", {
		className: "react-colorful__pointer-fill",
		style: { backgroundColor: t }
	}));
}, G = function(e, t, n) {
	return t === void 0 && (t = 0), n === void 0 && (n = 10 ** t), Math.round(n * e) / n;
};
360 / (2 * Math.PI);
var K = function(e) {
	var t = e.s, n = e.v, r = e.a, i = (200 - t) * n / 100;
	return {
		h: G(e.h),
		s: G(i > 0 && i < 200 ? t * n / 100 / (i <= 100 ? i : 200 - i) * 100 : 0),
		l: G(i / 2),
		a: G(r, 2)
	};
}, q = function(e) {
	var t = K(e);
	return "hsl(" + t.h + ", " + t.s + "%, " + t.l + "%)";
}, J = function(e) {
	var t = K(e);
	return "hsla(" + t.h + ", " + t.s + "%, " + t.l + "%, " + t.a + ")";
}, Y = function(e) {
	var t = e.h, n = e.s, r = e.v, i = e.a;
	t = t / 360 * 6, n /= 100, r /= 100;
	var a = Math.floor(t), o = r * (1 - n), s = r * (1 - (t - a) * n), c = r * (1 - (1 - t + a) * n), l = a % 6;
	return {
		r: G(255 * [
			r,
			s,
			o,
			o,
			c,
			r
		][l]),
		g: G(255 * [
			c,
			r,
			r,
			s,
			o,
			o
		][l]),
		b: G(255 * [
			o,
			o,
			c,
			r,
			r,
			s
		][l]),
		a: G(i, 2)
	};
}, X = function(e) {
	var t = e.r, n = e.g, r = e.b, i = e.a, a = Math.max(t, n, r), o = a - Math.min(t, n, r), s = o ? a === t ? (n - r) / o : a === n ? 2 + (r - t) / o : 4 + (t - n) / o : 0;
	return {
		h: 60 * (s < 0 ? s + 6 : s),
		s: a ? o / a * 100 : 0,
		v: a / 255 * 100,
		a: i
	};
}, re = N.default.memo(function(e) {
	var t = e.hue, n = e.onChange, r = e.onChangeEnd, i = U(["react-colorful__hue", e.className]);
	return N.default.createElement("div", { className: i }, N.default.createElement(H, {
		onMove: function(e) {
			n({ h: 360 * e.left });
		},
		onKey: function(e) {
			n({ h: L(t + 360 * e.left, 0, 360) });
		},
		onEnd: r,
		"aria-label": "Hue",
		"aria-valuenow": G(t),
		"aria-valuemax": "360",
		"aria-valuemin": "0"
	}, N.default.createElement(W, {
		className: "react-colorful__hue-pointer",
		left: t / 360,
		color: q({
			h: t,
			s: 100,
			v: 100,
			a: 1
		})
	})));
}), ie = N.default.memo(function(e) {
	var t = e.hsva, n = e.onChange, r = e.onChangeEnd, i = { backgroundColor: q({
		h: t.h,
		s: 100,
		v: 100,
		a: 1
	}) };
	return N.default.createElement("div", {
		className: "react-colorful__saturation",
		style: i
	}, N.default.createElement(H, {
		onMove: function(e) {
			n({
				s: 100 * e.left,
				v: 100 - 100 * e.top
			});
		},
		onKey: function(e) {
			n({
				s: L(t.s + 100 * e.left, 0, 100),
				v: L(t.v - 100 * e.top, 0, 100)
			});
		},
		onEnd: r,
		"aria-label": "Color",
		"aria-valuetext": "Saturation " + G(t.s) + "%, Brightness " + G(t.v) + "%"
	}, N.default.createElement(W, {
		className: "react-colorful__saturation-pointer",
		top: 1 - t.v / 100,
		left: t.s / 100,
		color: q(t)
	})));
}), Z = function(e, t) {
	if (e === t) return !0;
	for (var n in e) if (e[n] !== t[n]) return !1;
	return !0;
};
function ae(e, t, n, r) {
	var i = I(n), a = I(r), o = (0, N.useState)(function() {
		return e.toHsva(t);
	}), s = o[0], c = o[1], l = (0, N.useRef)({
		color: t,
		hsva: s
	}), u = (0, N.useRef)(!1);
	return (0, N.useEffect)(function() {
		if (!e.equal(t, l.current.color)) {
			var n = e.toHsva(t);
			l.current = {
				hsva: n,
				color: t
			}, c(n), u.current = !1;
		}
	}, [t, e]), (0, N.useEffect)(function() {
		var t;
		Z(s, l.current.hsva) || e.equal(t = e.fromHsva(s), l.current.color) || (l.current = {
			hsva: s,
			color: t
		}, i(t), u.current = !0);
	}, [
		s,
		e,
		i
	]), [
		s,
		(0, N.useCallback)(function(e) {
			c(function(t) {
				return Object.assign({}, t, e);
			});
		}, []),
		(0, N.useCallback)(function() {
			u.current && (u.current = !1, a(l.current.color));
		}, [a])
	];
}
var oe, se = typeof window < "u" ? N.useLayoutEffect : N.useEffect, ce = function() {
	return oe || (typeof __webpack_nonce__ < "u" ? __webpack_nonce__ : void 0);
}, Q = /* @__PURE__ */ new WeakMap(), le = function(e) {
	se(function() {
		var t = e.current;
		if (typeof document < "u" && t) {
			var n = t.getRootNode ? t.getRootNode() : t.ownerDocument, r = n && ("head" in n || "host" in n) ? n : t.ownerDocument;
			if (!Q.has(r)) {
				var i = "head" in r ? r.head : r, a = (i.ownerDocument || document).createElement("style");
				a.innerHTML = ".react-colorful{position:relative;display:flex;flex-direction:column;width:200px;height:200px;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default}.react-colorful__saturation{position:relative;flex-grow:1;border-color:transparent;border-bottom:12px solid #000;border-radius:8px 8px 0 0;background-image:linear-gradient(0deg,#000,transparent),linear-gradient(90deg,#fff,hsla(0,0%,100%,0))}.react-colorful__alpha-gradient,.react-colorful__pointer-fill{content:\"\";position:absolute;left:0;top:0;right:0;bottom:0;pointer-events:none;border-radius:inherit}.react-colorful__alpha-gradient,.react-colorful__saturation{box-shadow:inset 0 0 0 1px rgba(0,0,0,.05)}.react-colorful__alpha,.react-colorful__hue{position:relative;height:24px}.react-colorful__hue{background:linear-gradient(90deg,red 0,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,red)}.react-colorful__last-control{border-radius:0 0 8px 8px}.react-colorful__interactive{position:absolute;left:0;top:0;right:0;bottom:0;border-radius:inherit;outline:none;touch-action:none}.react-colorful__pointer{position:absolute;z-index:1;box-sizing:border-box;width:28px;height:28px;transform:translate(-50%,-50%);background-color:#fff;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,.2)}.react-colorful__interactive:focus .react-colorful__pointer{transform:translate(-50%,-50%) scale(1.1)}.react-colorful__alpha,.react-colorful__alpha-pointer{background-color:#fff;background-image:url('data:image/svg+xml;charset=utf-8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill-opacity=\".05\"><path d=\"M8 0h8v8H8zM0 8h8v8H0z\"/></svg>')}.react-colorful__saturation-pointer{z-index:3}.react-colorful__hue-pointer{z-index:2}";
				var o = ce();
				o && a.setAttribute("nonce", o), Q.set(r, a), i.appendChild(a);
			}
		}
	}, []);
}, ue = function(e) {
	var t = e.className, n = e.hsva, r = e.onChange, i = e.onChangeEnd, a = { backgroundImage: "linear-gradient(90deg, " + J(Object.assign({}, n, { a: 0 })) + ", " + J(Object.assign({}, n, { a: 1 })) + ")" }, o = U(["react-colorful__alpha", t]), s = G(100 * n.a);
	return N.default.createElement("div", { className: o }, N.default.createElement("div", {
		className: "react-colorful__alpha-gradient",
		style: a
	}), N.default.createElement(H, {
		onMove: function(e) {
			r({ a: e.left });
		},
		onKey: function(e) {
			r({ a: L(n.a + e.left) });
		},
		onEnd: i,
		"aria-label": "Alpha",
		"aria-valuetext": s + "%",
		"aria-valuenow": s,
		"aria-valuemin": "0",
		"aria-valuemax": "100"
	}, N.default.createElement(W, {
		className: "react-colorful__alpha-pointer",
		left: n.a,
		color: J(n)
	})));
}, de = function(e) {
	var t = e.className, n = e.colorModel, r = e.color, i = r === void 0 ? n.defaultColor : r, a = e.onChange, o = e.onChangeEnd, s = F(e, [
		"className",
		"colorModel",
		"color",
		"onChange",
		"onChangeEnd"
	]), c = (0, N.useRef)(null);
	le(c);
	var l = ae(n, i, a, o), u = l[0], d = l[1], f = l[2], p = U(["react-colorful", t]);
	return N.default.createElement("div", P({}, s, {
		ref: c,
		className: p
	}), N.default.createElement(ie, {
		hsva: u,
		onChange: d,
		onChangeEnd: f
	}), N.default.createElement(re, {
		hue: u.h,
		onChange: d,
		onChangeEnd: f
	}), N.default.createElement(ue, {
		hsva: u,
		onChange: d,
		onChangeEnd: f,
		className: "react-colorful__last-control"
	}));
}, fe = {
	defaultColor: {
		r: 0,
		g: 0,
		b: 0,
		a: 1
	},
	toHsva: X,
	fromHsva: Y,
	equal: Z
}, pe = function(e) {
	return N.default.createElement(de, P({}, e, { colorModel: fe }));
}, $ = r();
function me({ id: e, label: n, value: r, disabled: l, compact: u = !1, placeholder: d, onChange: f }) {
	let p = new M(r), m = p.isValid ? p.toRgb() : {
		r: 0,
		g: 0,
		b: 0,
		a: 1
	}, h = (e) => {
		let t = new M(e);
		f(e.a === 1 ? t.toHexString() : t.toRgbString());
	}, g = /* @__PURE__ */ (0, $.jsx)(i, {
		id: e,
		value: r,
		disabled: l,
		placeholder: d,
		"aria-label": u ? `${n} color value` : void 0,
		className: "min-w-0 flex-1",
		onChange: (e) => f(e.target.value)
	});
	return /* @__PURE__ */ (0, $.jsxs)("div", {
		className: "flex w-full min-w-0 items-center gap-2",
		"data-slot": "color-input",
		children: [/* @__PURE__ */ (0, $.jsxs)(c, { children: [/* @__PURE__ */ (0, $.jsx)(o, {
			asChild: !0,
			children: /* @__PURE__ */ (0, $.jsx)(t, {
				type: "button",
				variant: "outline",
				size: u ? "icon-xs" : "icon",
				disabled: l,
				"aria-label": `Choose ${n} color`,
				className: "shrink-0 p-1",
				children: /* @__PURE__ */ (0, $.jsx)("span", {
					className: "relative size-full overflow-hidden rounded-sm border border-border",
					style: {
						backgroundColor: "#fff",
						backgroundImage: "conic-gradient(#ddd 25%, #fff 0 50%, #ddd 0 75%, #fff 0)",
						backgroundSize: "8px 8px"
					},
					children: /* @__PURE__ */ (0, $.jsx)("span", {
						className: "absolute inset-0",
						style: { backgroundColor: p.isValid ? p.toRgbString() : "transparent" }
					})
				})
			})
		}), /* @__PURE__ */ (0, $.jsxs)(s, {
			align: "start",
			className: "w-64 space-y-3",
			"aria-label": `${n} color picker`,
			children: [
				/* @__PURE__ */ (0, $.jsx)("div", {
					className: "text-sm font-medium",
					children: n
				}),
				/* @__PURE__ */ (0, $.jsx)(pe, {
					color: m,
					onChange: h,
					style: { width: "100%" }
				}),
				u ? g : null,
				/* @__PURE__ */ (0, $.jsxs)("div", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, $.jsx)(a, {
						htmlFor: `${e}-opacity`,
						children: "Opacity"
					}), /* @__PURE__ */ (0, $.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [/* @__PURE__ */ (0, $.jsx)(i, {
							id: `${e}-opacity`,
							type: "number",
							min: 0,
							max: 100,
							step: 1,
							className: "w-20",
							value: Math.round(m.a * 100),
							onChange: (e) => {
								if (e.target.value === "") return;
								let t = Number(e.target.value);
								Number.isFinite(t) && h({
									...m,
									a: Math.max(0, Math.min(100, t)) / 100
								});
							}
						}), /* @__PURE__ */ (0, $.jsx)("span", {
							className: "text-sm text-muted-foreground",
							children: "%"
						})]
					})]
				})
			]
		})] }), u ? null : g]
	});
}
//#endregion
export { me as t };

//# sourceMappingURL=ColorInput-CqmQ5evk.js.map