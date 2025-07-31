/**
 * Determines whether a value is a primitive object with enhanced type safety.
 *
 * Uses the Object() constructor behavior to identify values that are objects
 * when passed through Object(), which includes both primitive values that
 * get wrapped and actual objects. This function has nuanced behavior and
 * should be used with understanding of JavaScript's object coercion rules.
 *
 * @template T - Expected object type extending object
 * @param value - Value to test for primitive object characteristics
 * @returns Type-safe boolean indicating whether Object(value) === value
 *
 * @example
 * Basic primitive object detection:
 * ```typescript
 * import { isPrimitiveObject } from '@winglet/common-utils';
 *
 * // True cases - objects (including boxed primitives)
 * console.log(isPrimitiveObject({})); // true (plain object)
 * console.log(isPrimitiveObject([])); // true (array)
 * console.log(isPrimitiveObject(new Date())); // true (Date object)
 * console.log(isPrimitiveObject(new String('test'))); // true (boxed string)
 * console.log(isPrimitiveObject(new Number(42))); // true (boxed number)
 * console.log(isPrimitiveObject(new Boolean(true))); // true (boxed boolean)
 * console.log(isPrimitiveObject(() => {})); // true (function)
 * console.log(isPrimitiveObject(/regex/)); // true (RegExp)
 * 
 * // False cases - primitives that get wrapped by Object()
 * console.log(isPrimitiveObject('string')); // false (primitive string)
 * console.log(isPrimitiveObject(42)); // false (primitive number)
 * console.log(isPrimitiveObject(true)); // false (primitive boolean)
 * console.log(isPrimitiveObject(Symbol('test'))); // false (symbol)
 * console.log(isPrimitiveObject(null)); // false (null becomes empty object)
 * console.log(isPrimitiveObject(undefined)); // false (undefined becomes empty object)
 * ```
 *
 * @example
 * Understanding Object coercion behavior:
 * ```typescript
 * function demonstrateObjectCoercion(value: unknown) {
 *   const objectified = Object(value);
 *   const isPrimObj = isPrimitiveObject(value);
 *   
 *   console.log('Original:', value);
 *   console.log('Object(value):', objectified);
 *   console.log('Are they same reference?', objectified === value);
 *   console.log('isPrimitiveObject:', isPrimObj);
 *   console.log('---');
 * }
 *
 * // Demonstrates the difference
 * demonstrateObjectCoercion('hello');    // false - string becomes String object
 * demonstrateObjectCoercion(42);         // false - number becomes Number object
 * demonstrateObjectCoercion({});         // true - object remains same reference
 * demonstrateObjectCoercion([1, 2, 3]);  // true - array remains same reference
 * ```
 *
 * @example
 * Type filtering in mixed arrays:
 * ```typescript
 * function separateObjectsFromPrimitives(values: unknown[]) {
 *   const objects: object[] = [];
 *   const primitives: (string | number | boolean | symbol | null | undefined)[] = [];
 *   
 *   for (const value of values) {
 *     if (isPrimitiveObject(value)) {
 *       objects.push(value);
 *     } else {
 *       primitives.push(value as any);
 *     }
 *   }
 *   
 *   return { objects, primitives };
 * }
 *
 * // Usage
 * const mixed = [
 *   'hello', 42, {}, [], new Date(), true, null, () => {}, Symbol('test')
 * ];
 * 
 * const separated = separateObjectsFromPrimitives(mixed);
 * console.log('Objects:', separated.objects);     // [{}, [], Date, function]
 * console.log('Primitives:', separated.primitives); // ['hello', 42, true, null, Symbol(test)]
 * ```
 *
 * @example
 * Serialization preparation:
 * ```typescript
 * function prepareForSerialization(data: unknown): any {
 *   if (!isPrimitiveObject(data)) {
 *     // Primitive values can be serialized directly
 *     return data;
 *   }
 *   
 *   if (Array.isArray(data)) {
 *     return data.map(prepareForSerialization);
 *   }
 *   
 *   if (data instanceof Date) {
 *     return data.toISOString();
 *   }
 *   
 *   if (data instanceof RegExp) {
 *     return { __regex: data.source, __flags: data.flags };
 *   }
 *   
 *   if (typeof data === 'function') {
 *     return { __function: data.toString() };
 *   }
 *   
 *   if (data && typeof data === 'object') {
 *     const result: any = {};
 *     for (const [key, value] of Object.entries(data)) {
 *       result[key] = prepareForSerialization(value);
 *     }
 *     return result;
 *   }
 *   
 *   return data;
 * }
 * ```
 *
 * @example
 * Deep clone utility consideration:
 * ```typescript
 * function needsDeepCloning(value: unknown): boolean {
 *   if (!isPrimitiveObject(value)) {
 *     // Primitives don't need cloning - they're copied by value
 *     return false;
 *   }
 *   
 *   // Objects need consideration for deep cloning
 *   return true;
 * }
 *
 * function smartClone(value: unknown): unknown {
 *   if (!needsDeepCloning(value)) {
 *     return value; // Primitives are already "cloned" by assignment
 *   }
 *   
 *   // Handle different object types
 *   if (Array.isArray(value)) {
 *     return value.map(smartClone);
 *   }
 *   
 *   if (value instanceof Date) {
 *     return new Date(value.getTime());
 *   }
 *   
 *   if (value && typeof value === 'object') {
 *     const result: any = {};
 *     for (const [key, val] of Object.entries(value)) {
 *       result[key] = smartClone(val);
 *     }
 *     return result;
 *   }
 *   
 *   return value;
 * }
 * ```
 *
 * @example
 * Memory usage analysis:
 * ```typescript
 * function analyzeValue(value: unknown) {
 *   const analysis = {
 *     type: typeof value,
 *     isPrimitiveObject: isPrimitiveObject(value),
 *     memoryConsideration: '',
 *     canHaveProperties: false
 *   };
 *   
 *   if (analysis.isPrimitiveObject) {
 *     analysis.memoryConsideration = 'Stored by reference, may have properties';
 *     analysis.canHaveProperties = true;
 *   } else {
 *     analysis.memoryConsideration = 'Stored by value, cannot have properties';
 *     analysis.canHaveProperties = false;
 *   }
 *   
 *   return analysis;
 * }
 *
 * // Usage examples
 * console.log(analyzeValue('hello'));  // primitive string
 * console.log(analyzeValue({}));       // object
 * console.log(analyzeValue([]));       // array object
 * console.log(analyzeValue(42));       // primitive number
 * ```
 *
 * @remarks
 * **Technical Behavior:**
 * - Returns `true` when `Object(value) === value` (same reference)
 * - Objects remain the same when passed through Object()
 * - Primitives get wrapped in objects, creating new references
 * - Functions are objects in JavaScript, so they return `true`
 *
 * **Key Understanding:**
 * - This is NOT the same as "is this a primitive type"
 * - This determines if something behaves as an object reference
 * - Useful for understanding memory and reference behavior
 * - Important for serialization and cloning decisions
 *
 * **Use Cases:**
 * - Memory usage analysis
 * - Serialization/deserialization logic
 * - Deep clone optimization
 * - Reference vs value semantics determination
 * - Type system utilities
 *
 * **Performance:** Single Object() constructor call with reference comparison.
 *
 * **Related Functions:**
 * - Use `isPrimitiveType()` for actual primitive type checking
 * - Use `typeof` for basic type checking
 * - Use `isObject()` for general object detection
 * - Use `Object.prototype.toString.call()` for precise type detection
 */
export const isPrimitiveObject = <T extends object>(
  value: unknown,
): value is T => {
  return Object(value) === value;
};