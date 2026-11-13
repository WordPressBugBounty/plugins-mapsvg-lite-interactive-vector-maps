import { r as e } from "./admin-chunks/rolldown-runtime-Dqa2HsxW.js";
import { $t as t, Qt as n, Xt as r, Yt as i, _n as a, a as o, bi as s, hi as c, mr as l, n as u, o as d, pn as f, qt as p, r as m, t as h } from "./admin-chunks/admin-startup-D4zZmPq_.js";
//#region src/main.tsx
var g = /* @__PURE__ */ e(s(), 1), _ = n(), v = c(), y = "mapsvg-admin-react-root";
function b() {
	let e = f().cssUrl;
	if (e) return e;
	let t = document.querySelector("script[src*=\"mapsvg-admin-react.js\"]");
	return t?.src ? t.src.replace(/mapsvg-admin-react\.js(?:\?.*)?$/, "mapsvg-admin-react.css") : "";
}
async function x() {
	t(), r();
	let e = p();
	i(), d();
	let n = document.getElementById(y);
	if (!n) {
		console.error(`[mapsvg-admin-react] #${y} not found`);
		return;
	}
	document.body.classList.add("mapsvg-react-admin", "mapsvg-edit-screen");
	let s = n.shadowRoot?.querySelector("[data-mapsvg-admin-startup]") ?? n.querySelector("[data-mapsvg-admin-startup]"), c = n.shadowRoot ?? n.attachShadow({ mode: "open" });
	c.replaceChildren(...s ? [s] : []);
	{
		let t = b(), n = [...t ? [{
			id: "app",
			url: t
		}] : [], ...e];
		t || console.error("[mapsvg-admin-react] cssUrl missing — core styles will not load in shadow root");
		for (let e of n) try {
			h(c, await u(e.url), e.id);
		} catch (t) {
			console.error(`[mapsvg-admin-react] failed to inject CSS "${e.id}" into shadow root`, t);
		}
	}
	r().get("admin.panel", "code-editor")?.initialize?.(c);
	let f = document.createElement("div");
	f.id = "mapsvg-admin-react-app", c.appendChild(f);
	let x = document.createElement("div");
	x.id = "mapsvg-admin-react-portal", c.appendChild(x), (0, _.createRoot)(f).render(/* @__PURE__ */ (0, v.jsx)(g.StrictMode, { children: /* @__PURE__ */ (0, v.jsx)(l, {
		shadowRoot: c,
		portalContainer: x,
		children: /* @__PURE__ */ (0, v.jsxs)(a, {
			delayDuration: 400,
			children: [/* @__PURE__ */ (0, v.jsx)(o, {}), /* @__PURE__ */ (0, v.jsx)(m, {})]
		})
	}) }));
}
document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => {
	x();
}) : x();
//#endregion

//# sourceMappingURL=mapsvg-admin-react.js.map