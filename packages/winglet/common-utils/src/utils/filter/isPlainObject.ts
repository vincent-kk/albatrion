/**
 * Determines whether a value is a plain data object (not a class instance or built-in).
 *
 * Performs sophisticated plain object detection by checking prototype chain
 * and constructor properties, distinguishing plain data objects from class
 * instances, built-in objects, and objects with custom prototypes.
 *
 * @template T - Expected object type extending Record<PropertyKey, any>
 * @param value - Value to test for plain object characteristics
 * @returns Type-safe boolean indicating whether the value is a plain object
 *
 * @example
 * Plain object detection:
 * ```typescript
 * import { isPlainObject } from '@winglet/common-utils';
 *
 * // Plain objects (return true)
 * console.log(isPlainObject({})); // true
 * console.log(isPlainObject({ name: 'John', age: 30 })); // true
 * console.log(isPlainObject(Object.create(null))); // true
 * console.log(isPlainObject(Object.create(Object.prototype))); // true
 *
 * // Non-plain objects (return false)
 * console.log(isPlainObject([1, 2, 3])); // false (array)
 * console.log(isPlainObject(new Date())); // false (Date instance)
 * console.log(isPlainObject(/regex/)); // false (RegExp instance)
 * console.log(isPlainObject(new Map())); // false (Map instance)
 * console.log(isPlainObject(new Set())); // false (Set instance)
 * console.log(isPlainObject('string')); // false (primitive)
 * console.log(isPlainObject(1)); // false (primitive)
 * console.log(isPlainObject(null)); // false (null)
 * console.log(isPlainObject(undefined)); // false (undefined)
 * ```
 *
 * @example
 * Class instance vs plain object:
 * ```typescript
 * class Person {
 *   constructor(public name: string) {}
 * }
 *
 * const plainPerson = { name: 'John' };
 * const personInstance = new Person('John');
 *
 * console.log(isPlainObject(plainPerson)); // true
 * console.log(isPlainObject(personInstance)); // false
 * ```
 *
 * @example
 * Configuration object validation:
 * ```typescript
 * interface Config {
 *   apiUrl: string;
 *   timeout: number;
 *   features: Record<string, boolean>;
 * }
 *
 * function validateConfig(input: unknown): input is Config {
 *   if (!isPlainObject<Config>(input)) {
 *     return false;
 *   }
 *
 *   return typeof input.apiUrl === 'string' &&
 *          typeof input.timeout === 'number' &&
 *          isPlainObject(input.features);
 * }
 *
 * // Usage
 * const userConfig = JSON.parse(configString);
 * if (validateConfig(userConfig)) {
 *   // Safe to use as Config
 *   console.log('API URL:', userConfig.apiUrl);
 * }
 * ```
 *
 * @example
 * Deep merging with plain object check:
 * ```typescript
 * function deepMerge(target: any, source: any): any {
 *   if (isPlainObject(target) && isPlainObject(source)) {
 *     const result = { ...target };
 *
 *     for (const key in source) {
 *       if (isPlainObject(source[key])) {
 *         result[key] = deepMerge(target[key], source[key]);
 *       } else {
 *         result[key] = source[key];
 *       }
 *     }
 *
 *     return result;
 *   }
 *
 *   return source;
 * }
 * ```
 *
 * @example
 * JSON-like data validation:
 * ```typescript
 * function isJsonLike(value: unknown): boolean {
 *   if (value === null || typeof value !== 'object') {
 *     return typeof value === 'string' ||
 *            typeof value === 'number' ||
 *            typeof value === 'boolean' ||
 *            value === null;
 *   }
 *
 *   if (Array.isArray(value)) {
 *     return value.every(isJsonLike);
 *   }
 *
 *   if (isPlainObject(value)) {
 *     return Object.values(value).every(isJsonLike);
 *   }
 *
 *   return false;
 * }
 * ```
 *
 * @remarks
 * **Detection Criteria:**
 * 1. Must be a non-null object type
 * 2. Prototype must be null, Object.prototype, or have Object.prototype as grandparent
 * 3. Must have '[object Object]' toString tag
 *
 * **Use Cases:**
 * - Configuration object validation
 * - JSON data validation
 * - Deep cloning/merging operations
 * - Serialization safety checks
 * - API payload validation
 *
 * **Performance:** Optimized with early returns and minimal prototype chain traversal.
 */
export const isPlainObject = <T extends Record<PropertyKey, any>>(
  value: unknown,
): value is T => {
  if (!value || typeof value !== 'object') return false;

  const proto = Object.getPrototypeOf(value) as typeof Object.prototype | null;
  const hasObjectPrototype =
    proto === null ||
    proto === Object.prototype ||
    Object.getPrototypeOf(proto) === null;
  if (!hasObjectPrototype) return false;

  return Object.prototype.toString.call(value) === '[object Object]';
};
