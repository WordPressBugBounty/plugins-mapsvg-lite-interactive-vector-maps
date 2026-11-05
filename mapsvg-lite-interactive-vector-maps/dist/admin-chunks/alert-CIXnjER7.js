import "./rolldown-runtime-Dqa2HsxW.js";
import { Lr as e, bi as t, hi as n, yi as r } from "./admin-startup-DaxvU-L8.js";
t();
var i = n(), a = r("relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current", {
	variants: { variant: {
		default: "bg-card text-card-foreground",
		destructive: "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current",
		info: "border-blue-200 bg-blue-50 text-blue-900 *:data-[slot=alert-description]:text-blue-800 [&>svg]:text-blue-600 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100 dark:*:data-[slot=alert-description]:text-blue-200 dark:[&>svg]:text-blue-400",
		warning: "border-yellow-200 bg-yellow-50 text-yellow-900 *:data-[slot=alert-description]:text-yellow-800 [&>svg]:text-yellow-600 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100 dark:*:data-[slot=alert-description]:text-yellow-200 dark:[&>svg]:text-yellow-400",
		success: "border-green-200 bg-green-50 text-green-900 *:data-[slot=alert-description]:text-green-800 [&>svg]:text-green-600 dark:border-green-800 dark:bg-green-950 dark:text-green-100 dark:*:data-[slot=alert-description]:text-green-200 dark:[&>svg]:text-green-400"
	} },
	defaultVariants: { variant: "default" }
});
function o({ className: t, variant: n, ...r }) {
	return /* @__PURE__ */ (0, i.jsx)("div", {
		"data-slot": "alert",
		role: "alert",
		className: e(a({ variant: n }), t),
		...r
	});
}
function s({ className: t, ...n }) {
	return /* @__PURE__ */ (0, i.jsx)("div", {
		"data-slot": "alert-title",
		className: e("col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight", t),
		...n
	});
}
function c({ className: t, ...n }) {
	return /* @__PURE__ */ (0, i.jsx)("div", {
		"data-slot": "alert-description",
		className: e("col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed", t),
		...n
	});
}
//#endregion
export { c as n, s as r, o as t };

//# sourceMappingURL=alert-CIXnjER7.js.map