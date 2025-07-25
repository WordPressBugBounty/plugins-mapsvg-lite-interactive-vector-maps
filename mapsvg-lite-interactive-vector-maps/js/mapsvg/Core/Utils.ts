/**
 * Checks if the current device supports touch events.
 * @returns {boolean} True if touch device, false otherwise.
 */
export const isTouchDevice = () => {
  //@ts-expect-error
  return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
}

/**
 * Gets the user agent string in lowercase.
 * @returns {string}
 */
export const getUserAgent = () => navigator.userAgent.toLowerCase()

/**
 * Detects if the device is iOS or Android.
 * @returns {{ios: boolean, android: boolean}}
 */
export const getDevice = () => {
  const userAgent = getUserAgent()
  const res = {
    ios:
      userAgent.indexOf("ipad") > -1 ||
      userAgent.indexOf("iphone") > -1 ||
      userAgent.indexOf("ipod") > -1,
    android: userAgent.indexOf("android") !== -1,
  }
  return res
}

/**
 * Checks if the device is a phone (max-width: 767px).
 * @returns {boolean}
 */
export const isPhone = () => window.matchMedia("only screen and (max-width: 767px)").matches

/**
 * Checks if the device is a tablet (min-width: 768px and max-width: 1024px).
 * @returns {boolean}
 */
export const isTablet = () =>
  window.matchMedia("only screen and (min-width: 768px) and (max-width: 1024px)").matches

/**
 * Gets browser info (IE, Firefox, Safari).
 * @returns {{ie: boolean, firefox: boolean, safari: boolean}}
 */
export const getBrowser = () => {
  const userAgent = getUserAgent()
  const browser = {
    ie:
      userAgent.indexOf("msie") > -1 ||
      userAgent.indexOf("trident") > -1 ||
      userAgent.indexOf("edge") > -1,
    firefox: userAgent.indexOf("firefox") > -1,
    safari: userAgent.indexOf("safari") > -1 && userAgent.indexOf("chrome") === -1,
  }
  return browser
}

/**
 * Gets mouse or touch coordinates from an event.
 * @param {MouseEvent|TouchEvent|JQuery.TriggeredEvent} e
 * @returns {{x: number, y: number}}
 */
export const getMouseCoords = (
  e: MouseEvent | TouchEvent | JQuery.TriggeredEvent,
): { x: number; y: number } => {
  if ("originalEvent" in e) {
    //@ts-expect-error types
    e = e.originalEvent
  }
  if ("clientX" in e) {
    e = <MouseEvent>e
    return {
      x: e.clientX + $(document).scrollLeft(),
      y: e.clientY + $(document).scrollTop(),
    }
  }
  if ("pageX" in e) {
    //@ts-expect-error types
    e = <MouseEvent>e
    return { x: e.pageX, y: e.pageY }
  } else if (window.mapsvg.touchDevice) {
    // @ts-ignore originalEvent
    e = <TouchEvent>e.originalEvent || <TouchEvent>e
    return e.touches && e.touches[0]
      ? { x: e.touches[0].pageX, y: e.touches[0].pageY }
      : { x: e.changedTouches[0].pageX, y: e.changedTouches[0].pageY }
  }
}

/**
 * Uppercases the first character of a string.
 * @param {string} string
 * @returns {string}
 */
export const ucfirst = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

/**
 * Parses a string to boolean.
 * @param {string} string
 * @returns {boolean|undefined}
 */
export const parseBoolean = (string) => {
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

/**
 * Checks if a value is a number.
 * @param n
 * @returns {boolean}
 */
export const isNumber = (n) => {
  return !isNaN(parseFloat(n)) && isFinite(n)
}

/**
 * Normalizes a URL by removing the protocol and domain.
 * @param {string} url
 * @returns {string}
 */
export const safeURL = (url) => {
  if (url.indexOf("http://") == 0 || url.indexOf("https://") == 0)
    url = "//" + url.split("://").pop()
  return url.replace(/^.*\/\/[^/]+/, "")
}

/**
 * Adds a trailing slash to a URL if missing.
 * @param {string} url
 * @returns {string}
 */
export const addTrailingSlash = (url) => {
  return url.endsWith("/") ? url : url + "/"
}

/**
 * Removes a leading slash from a string.
 * @param {string} str
 * @returns {string}
 */
export const removeLeadingSlash = (str) => {
  return str.startsWith("/") ? str.slice(1) : str
}

/**
 * Adds a leading slash to a string if missing.
 * @param {string} str
 * @returns {string}
 */
export const addLeadingSlash = (str) => {
  str = str.startsWith("/") ? str : "/" + str
  return str
}

/**
 * Converts an object to a string representation.
 * @param obj
 * @returns {string|null}
 */
export const convertToText = (obj) => {
  //create an array that will later be joined into a string.
  const string = []

  //is object
  //    Both arrays and objects seem to return "object"
  //    when typeof(obj) is applied to them. So instead
  //    I am checking to see if they have the property
  //    join, which normal objects don't have but
  //    arrays do.
  if (obj === null) {
    return null
  }
  if (obj === undefined) {
    return '""'
  } else if (typeof obj == "object" && obj.join == undefined) {
    let prop
    for (prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        const key = '"' + prop.replace(/"/g, '\\"') + '"' //prop.search(/[^a-zA-Z]+/) === -1 ?  prop : ...
        string.push(key + ": " + convertToText(obj[prop]))
      }
    }
    return "{" + string.join(",") + "}"

    //is array
  } else if (typeof obj == "object" && !(obj.join == undefined)) {
    let prop
    for (prop in obj) {
      string.push(convertToText(obj[prop]))
    }
    return "[" + string.join(",") + "]"

    //is function
  } else if (typeof obj == "function") {
    return obj.toString().replace("function anonymous", "function")
  } else {
    return JSON.stringify(obj)
  }
}

/**
 * Adds a hash to a color string if missing.
 * @param {string} color
 * @returns {string}
 */
export const fixColorHash = (color: string) => {
  const hexColorNoHash = new RegExp(/^([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (typeof color === "string" && color.match(hexColorNoHash) !== null) {
    color = "#" + color
  }
  return color
}

/**
 * Throttles a function call by a delay.
 * @param method
 * @param delay
 * @param scope
 * @param params
 */
export const throttle = (method, delay, scope, params) => {
  clearTimeout(method._tId)
  method._tId = setTimeout(function () {
    method.apply(scope, params)
  }, delay)
}

/**
 * Debounces a function call by a delay.
 * @param func
 * @param wait
 * @returns {function}
 */
export const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function (...args) {
    const context = this
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

/**
 * Geocodes a query using Google Maps API.
 * @param query
 * @param callback
 * @returns {boolean|void}
 */
let geocoder: google.maps.Geocoder
export const geocode = (query, callback) => {
  if (!window.google) {
    console.error("MapSVG: Google Maps API is not loaded.")
    jQuery.growl.error({
      title: "Error",
      message: "Google Maps API is not loaded",
    })
    return false
  }
  if (!geocoder) {
    geocoder = new google.maps.Geocoder()
  }

  throttle(geocoder.geocode, 500, geocoder, [
    query,
    function (results, status) {
      if (status === "OK") {
        callback(results)
      } else if (status === "ZERO_RESULTS") {
        return
      } else {
        jQuery.growl &&
          jQuery.growl.error({
            title: "Error: " + status,
            message:
              "There is some problem with Google API keys. See browser's console for more details",
          })
      }
    },
  ])
}

/**
 * Converts a string to a function.
 * @param string
 * @returns {function|object} Function or object `{error: "error text"}`
 */
export function functionFromString(string: string): SyntaxError | TypeError {
  let func
  let error
  const fn = string.trim()
  if (fn.indexOf("{") == -1 || fn.indexOf("function") !== 0 || fn.indexOf("(") == -1) {
    return new SyntaxError("MapSVG user function error: no function body.")
  }
  const fnBody = fn.substring(fn.indexOf("{") + 1, fn.lastIndexOf("}"))
  const params = fn.substring(fn.indexOf("(") + 1, fn.indexOf(")"))
  try {
    func = new Function(params, fnBody)
  } catch (err) {
    error = err
  }

  if (!error) return func
  else return error
}

/**
 * Converts a string to snake_case.
 * @param {string} str
 * @returns {string}
 */
export function toSnakeCase(str: string) {
  return typeof str === "string" ? str.replace(/\s+/g, "_") : str
}

/**
 * Handles a failed AJAX request and shows a growl error.
 * @param response
 */
export const handleFailedRequest = (response) => {
  let message = ""

  if (response.status === 403) {
    if (response.responseText.indexOf("Wordfence") !== -1) {
      message +=
        "The request has been blocked by Wordfence. " +
        'Switch Wordfence to "Learning mode", and save the map settings again. ' +
        "If the settings are saved successfully, you can switch Wordfence back to normal mode."
    } else {
      message +=
        "The request has been blocked by your server. " +
        "Do you have mod_sec Apache's module enabled? If that's the case you need to change its settings."
    }
  } else {
    if (response && response.responseText) {
      try {
        const _response = JSON.parse(response.responseText)
        if (
          (_response && _response.data && _response.data.error) ||
          (_response && _response.error)
        ) {
          message = _response.data?.error ? _response.data.error : _response.error
        }
      } catch (e) {
        // do nothing
      }
    }
  }

  $.growl.error({
    title: "Error: " + response.status + " " + response.statusText,
    message: message,
    duration: 30000,
  })
}

/**
 * Checks if the current OS is Mac.
 * @returns {boolean}
 */
export const isMac = () => {
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0
}

/**
 * Validates a URL.
 * @param {string} url
 * @returns {boolean}
 */
export const isValidURL = (url) => {
  return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!$&'()*+,;=]|:|@)|\/|\?)*)?$/i.test(
    url,
  )
}

/**
 * Loads multiple files (JS or CSS).
 * @param files
 * @returns {Promise<any[]>}
 */
export const loadFiles = (files) => {
  const scriptPromises = []
  files.forEach((file) => {
    scriptPromises.push(loadFile(file))
  })
  return Promise.all(scriptPromises)
}

/**
 * Gets the file type from a URL.
 * @param {string} url
 * @returns {string} "JS", "CSS", or "Unknown"
 */
export const getFileType = (url) => {
  const jsPattern = /\.js($|\?)/
  const cssPattern = /\.css($|\?)/

  if (jsPattern.test(url)) {
    return "JS"
  } else if (cssPattern.test(url)) {
    return "CSS"
  } else {
    return "Unknown"
  }
}

/**
 * Loads a single JS or CSS file.
 * @param file
 * @returns {Promise<string>}
 */
export const loadFile = (file) => {
  return new Promise((resolve, reject) => {
    const { path: url, children } = file
    const isScript = getFileType(url) === "JS"
    const isStyle = getFileType(url) === "CSS"

    if (isScript) {
      const script = document.createElement("script")
      script.src = window.mapsvg.routes.root + url
      if (script.src.indexOf("?v") === -1 && script.src.indexOf("&v") === -1) {
        if (script.src.indexOf("?") === -1) {
          script.src += "?v=" + window.mapsvg.version
        } else {
          script.src += "&v=" + window.mapsvg.version
        }
      }
      script.type = "text/javascript"
      script.defer = false
      script.async = true
      script.onload = function () {
        if (children && children.length > 0) {
          resolve(loadFiles(children))
        } else {
          resolve(url)
        }
      }
      script.onerror = function () {
        // If there's an error loading the script, reject the promise.
        reject(new Error("Failed to load script " + url))
      }
      document.head.appendChild(script)
    } else if (isStyle) {
      const link = document.createElement("link")
      link.href = window.mapsvg.routes.root + url
      link.rel = "stylesheet"
      document.head.appendChild(link)
      resolve(url)
    }
  })
}

/**
 * Compares two version strings (e.g. "1.2.3").
 * @param {string} v1
 * @param {string} v2
 * @returns {number} 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(v1, v2) {
  if (v1 && !v2) {
    return 1
  }
  if (!v1 && v2) {
    return -1
  }
  if (!v1 && !v2) {
    return 0
  }

  const v1Parts = v1.split(".").map(Number)
  const v2Parts = v2.split(".").map(Number)

  const length = Math.max(v1Parts.length, v2Parts.length)

  for (let i = 0; i < length; i++) {
    const part1 = v1Parts[i] || 0
    const part2 = v2Parts[i] || 0

    if (part1 > part2) return 1
    if (part1 < part2) return -1
  }

  return 0
}

/**
 * Checks if a value is a non-array object.
 * @param item
 * @returns {boolean}
 */
function isObject(item: any): boolean {
  return item && typeof item === "object" && !Array.isArray(item)
}

/**
 * Generator function that creates a unique ID sequence.
 * @generator
 * @function useId
 * @yields {number} The next unique ID in the sequence.
 *
 * @example
 * const generateId = useId();
 * console.log(generateId.next().value); // 1
 * console.log(generateId.next().value); // 2
 * console.log(generateId.next().value); // 3
 */
export function* idGenerator(): Generator<number, number, unknown> {
  let id = 1
  while (true) {
    yield id++
  }
}
const idGen = idGenerator()

/**
 * Returns the next unique ID in the sequence.
 * @returns {number}
 */
export function useId() {
  return idGen.next().value
}

export function cleanObject(obj: any): any {
  if (typeof obj !== "object" || obj === null) return obj
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue
    const value = obj[key]
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      delete obj[key]
      continue
    }
    if (typeof value === "object") {
      cleanObject(value)
      if (
        (typeof obj[key] === "object" && Object.keys(obj[key]).length === 0) ||
        (Array.isArray(obj[key]) && obj[key].length === 0)
      ) {
        delete obj[key]
      }
    }
  }
  return obj
}

/**
 * Deep merges two or three objects.
 * @param target
 * @param middle
 * @param source
 * @returns {object}
 */
export function deepMerge<T, U>(target: T, source: U): T & U
export function deepMerge<T, U, V>(target: T, middle: U, source: V): T & U & V
export function deepMerge(target: any, middle: any, source?: any): any {
  // If source is undefined, it means we're using the two-argument version
  if (source === undefined) {
    return deepMergeTwo(target, middle)
  }

  // For three arguments, merge middle into target, then merge source
  deepMergeTwo(target, middle)
  return deepMergeTwo(target, source)
}

function deepMergeTwo(target: any, source: any): any {
  if (source === undefined) {
    return target
  }

  if (typeof source !== "object" || source === null) {
    return source
  }

  if (Array.isArray(source)) {
    return source.map((item) => deepMergeTwo({}, item))
  }

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (source[key] === undefined) {
        continue // Skip undefined values
      }
      if (typeof source[key] === "object" && source[key] !== null) {
        if (typeof target[key] !== "object" || target[key] === null) {
          target[key] = {}
        }
        target[key] = deepMergeTwo(target[key], source[key])
      } else {
        target[key] = source[key]
      }
    }
  }

  return target
}

/**
 * Gets a nested value from an object using dot or PHP-style bracket notation.
 * @param obj The object to traverse.
 * @param path The path string (e.g. 'a.b.c' or 'a[b][c]').
 * @returns {*} The value at the nested path, or undefined if not found.
 * @example
 * getNestedValue(obj, 'a.b.c')
 * getNestedValue(obj, 'a[b][c]')
 */
export const getNestedValue = (obj: any, path: string): any => {
  // Split on dots or brackets, filter out empty strings
  const parts = path.split(/[\.\[\]]+/).filter(Boolean)
  return parts.reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj)
}

/**
 * Converts a jQuery Deferred to a native Promise.
 * @param deferred
 * @param params
 * @returns {Promise<T>}
 */
export function deferredToPromise<T>(deferred: any, params?: any): Promise<T> {
  return new Promise((resolve, reject) => {
    deferred(params).done(resolve).fail(reject)
  })
}

/**
 * Sets or deletes a nested property in an object using PHP-style bracket notation.
 * If value is null or undefined, deletes the property and cleans up empty parents.
 *
 * @param obj The object to modify.
 * @param field The field path in PHP-style bracket notation (e.g. 'a[b][c]').
 * @param value The value to set. If null or undefined, the property is deleted.
 *
 * @example
 * ```js
 * setNestedProperty(obj, 'a[b][c]', 123) // obj.a.b.c = 123
 * setNestedProperty(obj, 'a[b][c]', null) // deletes obj.a.b.c
 * ```
 */
export function setNestedProperty(obj: any, field: string, value: any) {
  const parts = field.split(/\[|\]/).filter(Boolean)
  let current = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {}
    current = current[parts[i]]
  }
  const lastKey = parts[parts.length - 1]
  current[lastKey] = value
}

export const splitObjectAndField = (fields: string) => {
  const linkParts = fields.split(".")

  const object = linkParts[0]
  const field = linkParts.slice(1).join(".")
  return { object, field }
}

export const getDomain = (url) => {
  let domain = ""
  const pathParts = url.replace("http://", "").replace("https://", "").split("/")
  if (pathParts.length > 0) {
    domain = pathParts[0]
  }
  return domain
}

export const isRemoteUrl = (url) => {
  return url.indexOf("http:") === 0 || url.indexOf("https:") === 0 || url.indexOf("//") === 0
}

export const sameDomain = (url1, url2) => {
  return getDomain(url1) === getDomain(url2)
}

export const env = {
  isPhone,
  isMac,
  getBrowser,
  getDevice,
  getMouseCoords,
  getUserAgent,
}

export const numbers = {
  isNumber,
  parseBoolean,
  compareVersions,
}

export const strings = {
  safeURL,
  ucfirst,
  convertToText,
  fixColorHash,
  removeLeadingSlash,
  functionFromString,
  toSnakeCase,
}

export const funcs = {
  geocode,
  throttle,
  deepMerge,
  getNestedValue,
  splitObjectAndField,
}

export const files = {
  getFileType,
  loadFiles,
  loadFile,
}

export const http = {
  handleFailedRequest,
}

const utils = {
  env,
  numbers,
  strings,
  funcs,
  files,
  http,
}

export default utils
