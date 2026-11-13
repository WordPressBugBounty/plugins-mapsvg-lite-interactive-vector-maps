import "./rolldown-runtime-Dqa2HsxW.js";
import { Fr as e, Lr as t, bi as n, hi as r, kt as i, yi as a } from "./admin-startup-D4zZmPq_.js";
n();
var o = r();
function s({ className: e, ...n }) {
	return /* @__PURE__ */ (0, o.jsx)("textarea", {
		"data-slot": "textarea",
		className: t("flex field-sizing-content min-h-14 w-full rounded-[5px] border border-input bg-background px-2 py-1.5 text-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40", e),
		...n
	});
}
//#endregion
//#region src/components/ui/input-group.tsx
function c({ className: e, ...n }) {
	return /* @__PURE__ */ (0, o.jsx)("div", {
		"data-slot": "input-group",
		role: "group",
		className: t("group/input-group relative flex w-full items-center rounded-md border border-input shadow-xs transition-[color,box-shadow] outline-none dark:bg-input/30", "h-7 min-w-0 has-[>textarea]:h-auto", "has-[>[data-align=inline-start]]:[&>input]:pl-2", "has-[>[data-align=inline-end]]:[&>input]:pr-2", "has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>[data-align=block-start]]:[&>input]:pb-3", "has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-end]]:[&>input]:pt-3", "has-[[data-slot=input-group-control]:focus-visible]:border-ring has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50", "has-[[data-slot][aria-invalid=true]]:border-destructive has-[[data-slot][aria-invalid=true]]:ring-destructive/20 dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40", e),
		...n
	});
}
var l = a("flex h-auto cursor-text items-center justify-center gap-1.5 py-1 text-xs font-medium text-muted-foreground select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4", {
	variants: { align: {
		"inline-start": "order-first pl-3 has-[>button]:ml-[-0.45rem] has-[>kbd]:ml-[-0.35rem]",
		"inline-end": "order-last pr-3 has-[>button]:mr-[-0.45rem] has-[>kbd]:mr-[-0.35rem]",
		"block-start": "order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 [.border-b]:pb-3",
		"block-end": "order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 [.border-t]:pt-3"
	} },
	defaultVariants: { align: "inline-start" }
});
function u({ className: e, align: n = "inline-start", ...r }) {
	return /* @__PURE__ */ (0, o.jsx)("div", {
		role: "group",
		"data-slot": "input-group-addon",
		"data-align": n,
		className: t(l({ align: n }), e),
		onClick: (e) => {
			e.target.closest("button") || e.currentTarget.parentElement?.querySelector("input")?.focus();
		},
		...r
	});
}
var d = a("flex items-center gap-1.5 text-xs shadow-none", {
	variants: { size: {
		xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
		sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
		"icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
		"icon-sm": "size-8 p-0 has-[>svg]:p-0"
	} },
	defaultVariants: { size: "xs" }
});
function f({ className: n, type: r = "button", variant: i = "ghost", size: a = "xs", ...s }) {
	return /* @__PURE__ */ (0, o.jsx)(e, {
		type: r,
		"data-size": a,
		variant: i,
		className: t(d({ size: a }), n),
		...s
	});
}
function p({ className: e, ...n }) {
	return /* @__PURE__ */ (0, o.jsx)("span", {
		className: t("flex items-center gap-1.5 text-xs text-muted-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4", e),
		...n
	});
}
function m({ className: e, ...n }) {
	return /* @__PURE__ */ (0, o.jsx)(i, {
		"data-slot": "input-group-control",
		className: t("flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent", e),
		...n
	});
}
function h({ className: e, ...n }) {
	return /* @__PURE__ */ (0, o.jsx)(s, {
		"data-slot": "input-group-control",
		className: t("flex-1 resize-none rounded-none border-0 bg-transparent py-3 shadow-none focus-visible:ring-0 dark:bg-transparent", e),
		...n
	});
}
//#endregion
export { p as a, m as i, u as n, h as o, f as r, s, c as t };

//# sourceMappingURL=input-group-BmqoXar3.js.map