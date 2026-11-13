import { r as e } from "./rolldown-runtime-Dqa2HsxW.js";
import { Lr as t, bi as n, fi as r, hi as i } from "./admin-startup-D4zZmPq_.js";
//#region node_modules/.pnpm/@radix-ui+react-label@2.1.13_@types+react-dom@19.2.3_@types+react@19.2.17__@types+react_1a71cc2d227950086603d33e7dfe5bc7/node_modules/@radix-ui/react-label/dist/index.mjs
var a = /* @__PURE__ */ e(n(), 1), o = i(), s = Object.defineProperty, c = /* @__PURE__ */ a.forwardRef(/* @__PURE__ */ ((e, t) => s(e, "name", {
	value: t,
	configurable: !0
}))(function(e, t) {
	return /* @__PURE__ */ (0, o.jsx)(r.label, {
		...e,
		ref: t,
		onMouseDown: (t) => {
			t.target.closest("button, input, select, textarea") || (e.onMouseDown?.(t), !t.defaultPrevented && t.detail > 1 && t.preventDefault());
		}
	});
}, "Label"));
//#endregion
//#region src/components/ui/label.tsx
function l({ className: e, ...n }) {
	return /* @__PURE__ */ (0, o.jsx)(c, {
		"data-slot": "label",
		className: t("flex items-center gap-1.5 text-xs leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", e),
		...n
	});
}
//#endregion
export { l as t };

//# sourceMappingURL=label-CKo0nS2p.js.map