import { Lr as e, hi as t } from "./admin-startup-CJQ1Yfhw.js";
import { l as n } from "./SettingsControlField-Cc88mmng.js";
//#region src/components/settings-form/SettingsSection.tsx
var r = t();
function i({ title: t, help: i, children: a, headerVisible: o = !0, className: s, hideDivider: c = !1 }) {
	return /* @__PURE__ */ (0, r.jsxs)("div", {
		"data-slot": "settings-section",
		className: e("-mx-3 flex min-w-0 flex-col gap-4 px-3", o && "mt-1 pt-3", o && !c && "border-t border-border", s),
		children: [o && (t || i) ? /* @__PURE__ */ (0, r.jsxs)("div", {
			"data-slot": "settings-section-heading",
			children: [t ? /* @__PURE__ */ (0, r.jsx)("div", {
				"data-slot": "settings-section-title",
				className: "text-xs leading-4 font-semibold text-foreground",
				children: t
			}) : null, i ? /* @__PURE__ */ (0, r.jsx)("div", {
				className: "mt-1 text-xs leading-normal font-normal text-muted-foreground",
				children: i
			}) : null]
		}) : null, a == null ? null : /* @__PURE__ */ (0, r.jsx)(n, {
			"data-settings-section-body": "",
			className: "gap-4",
			children: a
		})]
	});
}
//#endregion
export { i as t };

//# sourceMappingURL=SettingsSection-wWOqHpFq.js.map