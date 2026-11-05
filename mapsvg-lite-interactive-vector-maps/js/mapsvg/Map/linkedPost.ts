export type LinkedPostRepository = "objectsRepository" | "regionsRepository"

/** Whitelist legacy repository strings; booleans from early React drafts mean Auto. */
export function linkedPostRepository(value: unknown, objectsHavePost: boolean, regionsHavePost: boolean): LinkedPostRepository | null {
  if (value === "objectsRepository" || value === "regionsRepository") return value
  if (value === true || value === "true" || value === "auto" || value === 1 || value === "1") {
    return objectsHavePost ? "objectsRepository" : regionsHavePost ? "regionsRepository" : null
  }
  return null
}
