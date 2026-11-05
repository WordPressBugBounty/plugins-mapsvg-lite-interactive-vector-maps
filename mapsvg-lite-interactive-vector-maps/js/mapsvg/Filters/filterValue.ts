export type FilterOperator = "gt" | "gte" | "lt" | "lte"
export const isFilterOperator = (value: unknown): value is FilterOperator =>
  typeof value === "string" && ["gt", "gte", "lt", "lte"].includes(value)

/** A blank numeric control clears its predicate; zero is a real boundary. */
export function filterQueryValue(operator: unknown, value: unknown): unknown {
  if (!isFilterOperator(operator)) return value
  if (value == null || value === "" || (typeof value === "string" && value.trim() === "")) return null
  const number = typeof value === "number" || typeof value === "string" ? Number(value) : NaN
  return Number.isFinite(number) ? { operator, value: number } : null
}

export function filterFormValue(value: any): any {
  return value && typeof value === "object" && isFilterOperator(value.operator) ? value.value : value
}
