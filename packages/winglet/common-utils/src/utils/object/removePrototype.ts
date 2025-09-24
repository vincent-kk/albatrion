import type { Nullish } from '@aileron/declare';

/**
 * Removes the prototype chain from an existing object by setting its prototype to null.
 *
 * Modifies the given object in-place by removing its prototype chain using
 * Object.setPrototypeOf(). After this operation, the object will no longer
 * inherit any properties or methods from Object.prototype or any other
 * prototype in its chain, making it similar to objects created with
 * Object.create(null).
 *
 * @template Type - The type of the object, must extend object or be nullish
 * @param object - The object whose prototype chain to remove
 * @returns The same object with its prototype set to null
 *
 * @example
 * Basic usage with regular objects:
 * ```typescript
 * import { removePrototype } from '@winglet/common-utils';
 *
 * // Regular object with prototype
 * const obj = { name: 'John', age: 30 };
 * console.log(obj.toString); // [Function: toString]
 * console.log(obj.hasOwnProperty); // [Function: hasOwnProperty]
 *
 * // Remove prototype chain
 * removePrototype(obj);
 * console.log(obj.toString); // undefined
 * console.log(obj.hasOwnProperty); // undefined
 * console.log(obj.name); // 'John' (own properties remain)
 * console.log(obj.age); // 30
 * ```
 *
 * @example
 * Creating secure dictionary objects:
 * ```typescript
 * // Convert existing object to secure dictionary
 * const userInput = JSON.parse(untrustedData);
 * removePrototype(userInput);
 *
 * // Now safe from prototype pollution
 * userInput['__proto__'] = { malicious: 'code' }; // Just a property
 * userInput['constructor'] = 'fake'; // Just a property
 * userInput['toString'] = 'override'; // Just a property
 *
 * console.log(Object.prototype.malicious); // undefined (not polluted)
 * ```
 *
 * @example
 * Optimizing property iteration:
 * ```typescript
 * const data = { // large object with many properties
 *   prop1: 'value1',
 *   prop2: 'value2',
 *   // ... many more properties
 * };
 *
 * // Remove prototype for faster iteration
 * removePrototype(data);
 *
 * // Now iteration doesn't traverse prototype chain
 * for (const key in data) {
 *   // No need for hasOwnProperty check
 *   const value = data[key];
 *   process(key, value);
 * }
 * ```
 *
 * @example
 * Working with class instances:
 * ```typescript
 * class User {
 *   constructor(public name: string, public age: number) {}
 *   greet() { return `Hello, I'm ${this.name}`; }
 * }
 *
 * const user = new User('Alice', 25);
 * console.log(user.greet()); // "Hello, I'm Alice"
 * console.log(user instanceof User); // true
 *
 * // Remove prototype (loses methods and class association)
 * removePrototype(user);
 * console.log(user.name); // 'Alice' (properties remain)
 * console.log(user.age); // 25
 * console.log(user.greet); // undefined (method lost)
 * console.log(user instanceof User); // false
 * ```
 *
 * @example
 * Comparing with getEmptyObject:
 * ```typescript
 * import { getEmptyObject, removePrototype } from '@winglet/common-utils';
 *
 * // Creating new empty object without prototype
 * const newEmpty = getEmptyObject();
 *
 * // Converting existing object to have no prototype
 * const existing = { data: 'value' };
 * removePrototype(existing);
 *
 * // Both have null prototype now
 * console.log(Object.getPrototypeOf(newEmpty)); // null
 * console.log(Object.getPrototypeOf(existing)); // null
 *
 * // But existing keeps its properties
 * console.log(existing.data); // 'value'
 * ```
 *
 * @example
 * Batch processing objects:
 * ```typescript
 * function createSecureLookupTable(entries: Array<[string, any]>) {
 *   const table = Object.fromEntries(entries);
 *   removePrototype(table);
 *   return table;
 * }
 *
 * const statusCodes = createSecureLookupTable([
 *   ['OK', 200],
 *   ['NOT_FOUND', 404],
 *   ['toString', 999] // Safe to use as key
 * ]);
 *
 * console.log(statusCodes['toString']); // 999 (not a function)
 * ```
 *
 * @example
 * Performance impact on property access:
 * ```typescript
 * const obj = { x: 1, y: 2 };
 * const iterations = 1000000;
 *
 * // Before removing prototype
 * console.time('with prototype');
 * for (let i = 0; i < iterations; i++) {
 *   if (obj.hasOwnProperty('x')) {
 *     const val = obj.x;
 *   }
 * }
 * console.timeEnd('with prototype'); // ~15ms
 *
 * // After removing prototype
 * removePrototype(obj);
 * console.time('without prototype');
 * for (let i = 0; i < iterations; i++) {
 *   const val = obj.x; // No prototype check needed
 * }
 * console.timeEnd('without prototype'); // ~3ms
 * ```
 *
 * @remarks
 * **Operation Characteristics:**
 * - Modifies the object in-place (mutating operation)
 * - Returns the same object reference
 * - Removes entire prototype chain, not just immediate prototype
 * - Operation cannot be easily reversed
 * - Works on any object except primitives
 *
 * **Effects on the Object:**
 * - Loses all inherited properties and methods
 * - instanceof checks will return false
 * - typeof still returns 'object'
 * - Own properties are preserved
 * - Object becomes a pure dictionary
 *
 * **Performance Benefits:**
 * - Faster property iteration (no prototype traversal)
 * - Faster property access (no prototype lookup)
 * - Reduced memory usage (no prototype chain references)
 * - Eliminates need for hasOwnProperty checks
 *
 * **Security Benefits:**
 * - Prevents prototype pollution attacks
 * - Safe to use any string as property key
 * - No collision with Object.prototype methods
 * - Ideal for processing untrusted data
 *
 * **Use Cases:**
 * - Converting objects to secure dictionaries
 * - Optimizing hot-path property access
 * - Processing untrusted JSON data
 * - Creating lookup tables and maps
 * - Removing class behavior from instances
 *
 * **Limitations:**
 * - Cannot call Object.prototype methods directly
 * - Breaks instanceof checks
 * - Loses constructor reference
 * - May break code expecting prototype methods
 * - Not reversible without knowing original prototype
 *
 * **Working with Modified Objects:**
 * ```typescript
 * const obj = removePrototype({ key: 'value' });
 *
 * // Use Object static methods
 * Object.keys(obj); // ['key']
 * Object.values(obj); // ['value']
 * Object.entries(obj); // [['key', 'value']]
 *
 * // Or use call/apply for prototype methods
 * Object.prototype.toString.call(obj); // '[object Object]'
 * Object.prototype.hasOwnProperty.call(obj, 'key'); // true
 * ```
 *
 * **Comparison with Alternatives:**
 * - `Object.create(null)`: Creates new empty object without prototype
 * - `getEmptyObject()`: Same as Object.create(null), creates new object
 * - `removePrototype()`: Modifies existing object in-place
 * - `{ __proto__: null }`: Creates new object with null prototype
 *
 * **Warning:**
 * This operation is destructive and cannot be easily undone. If you need
 * to preserve the original prototype chain, consider cloning the object
 * first or using Object.create(null) with Object.assign() instead.
 *
 * @see {@link getEmptyObject} for creating new objects without prototype
 * @see {@link countObjectKey} for counting properties in prototype-less objects
 * @see {@link hasOwnProperty} from libs for safe property checking
 */
export const removePrototype = <Type extends object | Nullish>(
  object: Type,
): Type => (object != null ? Object.setPrototypeOf(object, null) : object);
