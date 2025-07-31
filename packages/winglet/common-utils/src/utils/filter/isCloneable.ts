import {
  ARGUMENTS_TAG,
  ARRAY_BUFFER_TAG,
  ARRAY_TAG,
  BOOLEAN_TAG,
  DATA_VIEW_TAG,
  DATE_TAG,
  FLOAT_32_ARRAY_TAG,
  FLOAT_64_ARRAY_TAG,
  INT_8_ARRAY_TAG,
  INT_16_ARRAY_TAG,
  INT_32_ARRAY_TAG,
  MAP_TAG,
  NUMBER_TAG,
  OBJECT_TAG,
  REGEXP_TAG,
  SET_TAG,
  STRING_TAG,
  SYMBOL_TAG,
  UINT_8_ARRAY_TAG,
  UINT_8_CLAMPED_ARRAY_TAG,
  UINT_16_ARRAY_TAG,
  UINT_32_ARRAY_TAG,
} from '@/common-utils/constant/typeTag';
import { getTypeTag } from '@/common-utils/libs/getTypeTag';

/**
 * Set of cloneable type tags
 */
const CLONEABLE_TAGS = new Set([
  ARGUMENTS_TAG,
  ARRAY_TAG,
  ARRAY_BUFFER_TAG,
  DATA_VIEW_TAG,
  BOOLEAN_TAG,
  DATE_TAG,
  FLOAT_32_ARRAY_TAG,
  FLOAT_64_ARRAY_TAG,
  INT_8_ARRAY_TAG,
  INT_16_ARRAY_TAG,
  INT_32_ARRAY_TAG,
  MAP_TAG,
  NUMBER_TAG,
  OBJECT_TAG,
  REGEXP_TAG,
  SET_TAG,
  STRING_TAG,
  SYMBOL_TAG,
  UINT_8_ARRAY_TAG,
  UINT_8_CLAMPED_ARRAY_TAG,
  UINT_16_ARRAY_TAG,
  UINT_32_ARRAY_TAG,
]);

/**
 * Determines whether an object is a cloneable type with enhanced safety.
 *
 * Performs comprehensive type checking to determine if an object can be safely
 * cloned using structured cloning algorithms. Uses internal type tags to identify
 * cloneable data structures including arrays, objects, typed arrays, and built-in types.
 *
 * @param object - Object or value to test for cloneable characteristics
 * @returns Boolean indicating whether the object is a cloneable type
 *
 * @example
 * Basic cloneable type detection:
 * ```typescript
 * import { isCloneable } from '@winglet/common-utils';
 *
 * // True cases - cloneable types
 * console.log(isCloneable({})); // true (plain object)
 * console.log(isCloneable({ name: 'John', age: 30 })); // true (object with properties)
 * console.log(isCloneable([1, 2, 3])); // true (array)
 * console.log(isCloneable('hello')); // true (string)
 * console.log(isCloneable(42)); // true (number)
 * console.log(isCloneable(true)); // true (boolean)
 * console.log(isCloneable(new Date())); // true (Date object)
 * console.log(isCloneable(/pattern/g)); // true (RegExp)
 * console.log(isCloneable(new Map())); // true (Map)
 * console.log(isCloneable(new Set())); // true (Set)
 * console.log(isCloneable(new ArrayBuffer(16))); // true (ArrayBuffer)
 * console.log(isCloneable(new Uint8Array(10))); // true (TypedArray)
 * console.log(isCloneable(Symbol('test'))); // true (Symbol)
 * 
 * // False cases - non-cloneable types
 * console.log(isCloneable(function() {})); // false (function)
 * console.log(isCloneable(() => {})); // false (arrow function)
 * console.log(isCloneable(new WeakMap())); // false (WeakMap)
 * console.log(isCloneable(new WeakSet())); // false (WeakSet)
 * console.log(isCloneable(null)); // false (null)
 * console.log(isCloneable(undefined)); // false (undefined)
 * ```
 *
 * @example
 * Deep cloning with validation:
 * ```typescript
 * interface CloneResult<T> {
 *   success: boolean;
 *   cloned?: T;
 *   error?: string;
 * }
 *
 * function safeDeepClone<T>(obj: T): CloneResult<T> {
 *   if (!isCloneable(obj)) {
 *     return {
 *       success: false,
 *       error: `Object of type ${typeof obj} is not cloneable`
 *     };
 *   }
 *   
 *   try {
 *     // Use structured cloning if available
 *     if (typeof structuredClone !== 'undefined') {
 *       return {
 *         success: true,
 *         cloned: structuredClone(obj)
 *       };
 *     }
 *     
 *     // Fallback implementation
 *     const cloned = JSON.parse(JSON.stringify(obj));
 *     return {
 *       success: true,
 *       cloned
 *     };
 *   } catch (error) {
 *     return {
 *       success: false,
 *       error: `Cloning failed: ${error.message}`
 *     };
 *   }
 * }
 * ```
 *
 * @example
 * Data serialization validation:
 * ```typescript
 * function validateForSerialization(data: any[]): {
 *   cloneable: any[];
 *   nonCloneable: Array<{ item: any; type: string }>;
 * } {
 *   const cloneable: any[] = [];
 *   const nonCloneable: Array<{ item: any; type: string }> = [];
 *   
 *   data.forEach(item => {
 *     if (isCloneable(item)) {
 *       cloneable.push(item);
 *     } else {
 *       nonCloneable.push({
 *         item,
 *         type: typeof item
 *       });
 *     }
 *   });
 *   
 *   return { cloneable, nonCloneable };
 * }
 * ```
 *
 * @remarks
 * **Cloneable Types Include:**
 * - Plain objects and arrays
 * - Primitive types (string, number, boolean, symbol)
 * - Built-in objects (Date, RegExp, Map, Set)
 * - Binary data types (ArrayBuffer, TypedArrays, DataView)
 * - Arguments objects
 *
 * **Non-Cloneable Types:**
 * - Functions and methods
 * - WeakMap and WeakSet
 * - null and undefined values
 * - DOM elements
 * - Class instances with methods
 *
 * **Use Cases:**
 * - Pre-validation for structured cloning
 * - Serialization safety checks
 * - Deep cloning utilities
 * - Data transfer object validation
 * - State management systems
 *
 * **Performance:** Uses optimized type tag checking with Set lookup.
 *
 * **Related Functions:**
 * - Use `structuredClone()` for actual cloning when available
 * - Use specific type checkers for precise validation
 * - Use `JSON.stringify()` for simple object cloning
 */
export const isCloneable = (object: unknown): boolean =>
  CLONEABLE_TAGS.has(getTypeTag(object));