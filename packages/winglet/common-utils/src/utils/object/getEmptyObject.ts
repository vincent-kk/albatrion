import type { Dictionary } from '@aileron/declare';

/**
 * Creates a truly empty object with no prototype chain.
 *
 * Returns a new object created with Object.create(null), which has no
 * prototype chain and therefore no inherited properties or methods from
 * Object.prototype. This creates the purest form of an empty object in
 * JavaScript, ideal for use as a map or dictionary.
 *
 * @returns A new empty object with null prototype
 *
 * @example
 * Basic usage and comparison with regular objects:
 * ```typescript
 * import { getEmptyObject } from '@winglet/common-utils';
 *
 * // Create a truly empty object
 * const empty = getEmptyObject();
 * console.log(empty); // {}
 *
 * // No inherited properties
 * console.log(empty.toString); // undefined
 * console.log(empty.hasOwnProperty); // undefined
 * console.log(empty.constructor); // undefined
 *
 * // Compare with regular empty object
 * const regular = {};
 * console.log(regular.toString); // [Function: toString]
 * console.log(regular.hasOwnProperty); // [Function: hasOwnProperty]
 * ```
 *
 * @example
 * Using as a pure dictionary/map:
 * ```typescript
 * // Create a clean dictionary without prototype pollution risks
 * const dict = getEmptyObject();
 * dict['user'] = 'John';
 * dict['admin'] = true;
 * dict['score'] = 95;
 *
 * // No collision with Object.prototype properties
 * dict['toString'] = 'custom value'; // Safe to use
 * dict['constructor'] = 42; // No issues
 * dict['__proto__'] = 'data'; // Treated as regular property
 *
 * console.log(dict['toString']); // 'custom value'
 * console.log(dict['constructor']); // 42
 * ```
 *
 * @example
 * Creating a counter map:
 * ```typescript
 * function countWords(text: string) {
 *   const counts = getEmptyObject();
 *   const words = text.toLowerCase().split(/\s+/);
 *
 *   for (const word of words) {
 *     counts[word] = (counts[word] || 0) + 1;
 *   }
 *
 *   return counts;
 * }
 *
 * const wordCounts = countWords('The quick brown fox jumps over the lazy dog');
 * // No prototype methods interfering with word counting
 * ```
 *
 * @example
 * Building a lookup table:
 * ```typescript
 * // Create enum-like constants without prototype
 * const HttpStatus = getEmptyObject();
 * HttpStatus['OK'] = 200;
 * HttpStatus['NOT_FOUND'] = 404;
 * HttpStatus['SERVER_ERROR'] = 500;
 *
 * // Use in checks
 * if (response.status === HttpStatus['NOT_FOUND']) {
 *   handleNotFound();
 * }
 *
 * // Iterate safely without prototype properties
 * for (const key in HttpStatus) {
 *   console.log(`${key}: ${HttpStatus[key]}`);
 *   // Only logs: OK: 200, NOT_FOUND: 404, SERVER_ERROR: 500
 * }
 * ```
 *
 * @example
 * Secure configuration storage:
 * ```typescript
 * // Store configuration without prototype pollution vulnerability
 * function createConfig() {
 *   const config = getEmptyObject();
 *
 *   // Safe from prototype pollution attacks
 *   config['__proto__'] = { malicious: 'code' }; // Just a regular property
 *   config['constructor'] = { fake: 'constructor' }; // No override
 *
 *   return config;
 * }
 *
 * const appConfig = createConfig();
 * console.log(Object.prototype.malicious); // undefined (not polluted)
 * ```
 *
 * @example
 * Performance comparison for property checks:
 * ```typescript
 * const nullProto = getEmptyObject();
 * const regular = {};
 *
 * // Adding many properties
 * for (let i = 0; i < 10000; i++) {
 *   nullProto[`prop${i}`] = i;
 *   regular[`prop${i}`] = i;
 * }
 *
 * // Iteration is faster without prototype chain
 * console.time('null prototype');
 * for (const key in nullProto) {
 *   // No prototype chain to traverse
 *   const value = nullProto[key];
 * }
 * console.timeEnd('null prototype'); // ~0.5ms
 *
 * console.time('regular object');
 * for (const key in regular) {
 *   if (regular.hasOwnProperty(key)) { // Need to check
 *     const value = regular[key];
 *   }
 * }
 * console.timeEnd('regular object'); // ~1.2ms
 * ```
 *
 * @remarks
 * **Characteristics:**
 * - No prototype chain (prototype is null)
 * - No inherited properties from Object.prototype
 * - Cannot use Object.prototype methods directly
 * - Faster property iteration (no prototype traversal)
 * - Immune to prototype pollution attacks
 * - Ideal for use as a pure dictionary/map
 *
 * **Advantages:**
 * - **Security**: Prevents prototype pollution vulnerabilities
 * - **Performance**: Faster property iteration without prototype checks
 * - **Clarity**: No ambiguity about property ownership
 * - **Safety**: Can use any string as property name without conflicts
 *
 * **Limitations:**
 * - Cannot use methods like toString(), hasOwnProperty() directly
 * - No constructor property
 * - typeof still returns 'object'
 * - instanceof Object returns false
 *
 * **Use Cases:**
 * - Creating dictionaries or lookup tables
 * - Storing user input as object keys safely
 * - Building caches without prototype overhead
 * - Implementing enums or constant maps
 * - Security-critical property storage
 * - Performance-critical property iteration
 *
 * **Working with null prototype objects:**
 * ```typescript
 * const obj = getEmptyObject();
 *
 * // Use Object.prototype methods via call/apply
 * Object.prototype.toString.call(obj); // '[object Object]'
 * Object.prototype.hasOwnProperty.call(obj, 'key');
 *
 * // Or use Object static methods
 * Object.keys(obj);
 * Object.values(obj);
 * Object.entries(obj);
 * ```
 *
 * **Comparison with alternatives:**
 * - `{}` or `new Object()`: Has full prototype chain
 * - `Map`: Better for non-string keys, has size property
 * - `Object.create({})`: Still has prototype chain
 * - `Object.create(null)`: Equivalent to this function
 *
 * @see {@link countObjectKey} for counting properties in null prototype objects
 * @see {@link hasOwnProperty} from libs for safe property checking
 */
export const getEmptyObject = (): Dictionary => Object.create(null);
