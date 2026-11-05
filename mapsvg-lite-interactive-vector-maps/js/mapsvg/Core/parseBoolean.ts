/**
 * Parses a string to boolean.
 * @param {string} string
 * @returns {boolean|undefined}
 */
export const parseBoolean = (string: unknown): boolean | undefined => {
  switch (String(string).toLowerCase()) {
    case "on":
    case "true":
    case "1":
    case "yes":
    case "y":
      return true
    case "off":
    case "false":
    case "0":
    case "no":
    case "n":
      return false
    default:
      return undefined
  }
}
