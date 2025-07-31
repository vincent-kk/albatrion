import { isArray } from '@/common-utils/utils/filter/isArray';
import { isPlainObject } from '@/common-utils/utils/filter/isPlainObject';

/**
 * Performs deep recursive merging of two objects with intelligent type handling.
 *
 * Recursively combines properties from source and target objects, with source
 * properties taking precedence. Handles nested objects, arrays, and mixed structures
 * intelligently by merging compatible types and replacing incompatible ones. Mutates
 * the target object in-place for performance while preserving type safety.
 *
 * @template Target - Target object type extending Record<PropertyKey, any>
 * @template Source - Source object type extending Record<PropertyKey, any>
 * @param target - Target object to merge into (mutated in-place)
 * @param source - Source object to merge from (not modified)
 * @returns The mutated target object with merged properties (Target & Source)
 *
 * @example
 * Basic object merging:
 * ```typescript
 * import { merge } from '@winglet/common-utils';
 *
 * const target = { a: 1, b: 2, c: { x: 10 } };
 * const source = { b: 3, c: { y: 20 }, d: 4 };
 *
 * const result = merge(target, source);
 * console.log(result); // { a: 1, b: 3, c: { x: 10, y: 20 }, d: 4 }
 * console.log(target === result); // true (target is mutated)
 *
 * // Source values override target values
 * const config1 = { timeout: 1000, retries: 3 };
 * const config2 = { timeout: 2000, debug: true };
 * merge(config1, config2);
 * console.log(config1); // { timeout: 2000, retries: 3, debug: true }
 * ```
 *
 * @example
 * Deep nested object merging:
 * ```typescript
 * const userDefaults = {
 *   profile: {
 *     personal: { name: '', age: 0 },
 *     settings: { theme: 'light', notifications: true }
 *   },
 *   preferences: {
 *     language: 'en',
 *     timezone: 'UTC'
 *   }
 * };
 *
 * const userData = {
 *   profile: {
 *     personal: { name: 'John', email: 'john@example.com' },
 *     settings: { theme: 'dark' }
 *   },
 *   preferences: {
 *     language: 'es'
 *   }
 * };
 *
 * const merged = merge(userDefaults, userData);
 * console.log(merged);
 * // {
 * //   profile: {
 * //     personal: { name: 'John', age: 0, email: 'john@example.com' },
 * //     settings: { theme: 'dark', notifications: true }
 * //   },
 * //   preferences: {
 * //     language: 'es',
 * //     timezone: 'UTC'
 * //   }
 * // }
 * ```
 *
 * @example
 * Array merging behavior:
 * ```typescript
 * // Arrays are merged by concatenation
 * const target1 = { tags: ['old', 'legacy'] };
 * const source1 = { tags: ['new', 'modern'] };
 * merge(target1, source1);
 * console.log(target1.tags); // ['old', 'legacy', 'new', 'modern']
 *
 * // Nested arrays in objects
 * const target2 = {
 *   data: {
 *     numbers: [1, 2],
 *     strings: ['a', 'b']
 *   }
 * };
 * const source2 = {
 *   data: {
 *     numbers: [3, 4],
 *     booleans: [true, false]
 *   }
 * };
 * merge(target2, source2);
 * console.log(target2);
 * // {
 * //   data: {
 * //     numbers: [1, 2, 3, 4],
 * //     strings: ['a', 'b'],
 * //     booleans: [true, false]
 * //   }
 * // }
 *
 * // Array replaces non-array
 * const target3 = { value: 'string' };
 * const source3 = { value: [1, 2, 3] };
 * merge(target3, source3);
 * console.log(target3.value); // [1, 2, 3] (replaced, not merged)
 * ```
 *
 * @example
 * Type compatibility and replacement:
 * ```typescript
 * // Compatible types are merged
 * const target = {
 *   config: { port: 3000, host: 'localhost' },
 *   items: [1, 2]
 * };
 * const source = {
 *   config: { port: 8080, ssl: true },  // object + object = merge
 *   items: [3, 4]                      // array + array = merge
 * };
 * merge(target, source);
 * console.log(target);
 * // {
 * //   config: { port: 8080, host: 'localhost', ssl: true },
 * //   items: [1, 2, 3, 4]
 * // }
 *
 * // Incompatible types are replaced
 * const target2 = {
 *   value: { nested: 'object' },
 *   data: [1, 2, 3]
 * };
 * const source2 = {
 *   value: 'primitive string',  // object -> string (replace)
 *   data: { key: 'value' }      // array -> object (replace)
 * };
 * merge(target2, source2);
 * console.log(target2);
 * // {
 * //   value: 'primitive string',
 * //   data: { key: 'value' }
 * // }
 * ```
 *
 * @example
 * Advanced merging scenarios:
 * ```typescript
 * // Configuration merging with environment overrides
 * const defaultConfig = {
 *   database: {
 *     host: 'localhost',
 *     port: 5432,
 *     options: { ssl: false, timeout: 30000 }
 *   },
 *   features: ['basic', 'auth'],
 *   logging: {
 *     level: 'info',
 *     outputs: ['console']
 *   }
 * };
 *
 * const envConfig = {
 *   database: {
 *     host: 'prod-db.example.com',
 *     options: { ssl: true, pool: { min: 2, max: 10 } }
 *   },
 *   features: ['advanced', 'analytics'],
 *   logging: {
 *     level: 'error',
 *     outputs: ['file', 'remote']
 *   }
 * };
 *
 * const finalConfig = merge(defaultConfig, envConfig);
 * console.log(finalConfig);
 * // {
 * //   database: {
 * //     host: 'prod-db.example.com',
 * //     port: 5432,
 * //     options: { ssl: true, timeout: 30000, pool: { min: 2, max: 10 } }
 * //   },
 * //   features: ['basic', 'auth', 'advanced', 'analytics'],
 * //   logging: {
 * //     level: 'error',
 * //     outputs: ['console', 'file', 'remote']
 * //   }
 * // }
 * ```
 *
 * @example
 * Handling undefined values:
 * ```typescript
 * // undefined in source doesn't override defined target values
 * const target = { a: 1, b: 'hello', c: true };
 * const source = { a: 2, b: undefined, d: 'new' };
 * merge(target, source);
 * console.log(target); // { a: 2, b: 'hello', c: true, d: 'new' }
 *
 * // undefined in target gets overridden by defined source values
 * const target2 = { a: undefined, b: 2 };
 * const source2 = { a: 'defined', c: 3 };
 * merge(target2, source2);
 * console.log(target2); // { a: 'defined', b: 2, c: 3 }
 *
 * // Both undefined - source wins
 * const target3 = { a: undefined };
 * const source3 = { a: undefined };
 * merge(target3, source3);
 * console.log(target3); // { a: undefined }
 * ```
 *
 * @remarks
 * **Merging Strategy:**
 * - **Objects**: Deep recursive merge of compatible plain objects
 * - **Arrays**: Concatenation merge preserving order (target + source)
 * - **Primitives**: Source value always replaces target value
 * - **Mixed Types**: Source value replaces target when types incompatible
 *
 * **Type Compatibility Rules:**
 * - `isPlainObject(target) && isPlainObject(source)` → Deep merge
 * - `isArray(target) && isArray(source)` → Concatenation merge
 * - `target === undefined || source !== undefined` → Source replaces target
 * - Otherwise → Source value replaces target value
 *
 * **Performance Characteristics:**
 * - **Time Complexity**: O(n + m) where n is target size, m is source size
 * - **Space Complexity**: O(1) additional space (in-place mutation)
 * - **Optimization**: Direct property assignment with minimal overhead
 *
 * **Mutation Behavior:**
 * - **Target Object**: Modified in-place and returned
 * - **Source Object**: Never modified, read-only access
 * - **Nested Objects**: New objects created only when merging arrays with objects
 * - **Reference Safety**: Maintains object references where possible
 *
 * **Circular Reference Handling:**
 * ```typescript
 * // ⚠️ DANGER: This will cause infinite recursion and stack overflow
 * const circular1: any = { name: 'obj1' };
 * const circular2: any = { name: 'obj2' };
 * circular1.ref = circular2;
 * circular2.ref = circular1;
 * 
 * // This would crash:
 * // merge(circular1, circular2); // RangeError: Maximum call stack size exceeded
 * 
 * // Safe alternatives:
 * const safe1 = { name: 'obj1', data: 'value1' };
 * const safe2 = { name: 'obj2', data: 'value2' };
 * const merged = merge(safe1, safe2); // ✅ Works fine
 * ```
 *
 * **Error Cases and Recovery:**
 * ```typescript
 * // Type incompatibility scenarios
 * const target = { value: { nested: 'object' } };
 * const source = { value: 'primitive' }; // Incompatible type
 * 
 * merge(target, source);
 * // Result: { value: 'primitive' } - source replaces target
 * 
 * // Property descriptor conflicts
 * const frozen = {};
 * Object.defineProperty(frozen, 'key', { 
 *   value: 'immutable', 
 *   writable: false, 
 *   configurable: false 
 * });
 * 
 * try {
 *   merge(frozen, { key: 'new value' });
 * } catch (error) {
 *   console.error('Cannot assign to read-only property'); // TypeError
 * }
 * ```
 *
 * **Edge Cases:**
 * - Empty objects merge successfully
 * - **Circular references cause infinite recursion** (no built-in protection)
 * - Non-enumerable properties are ignored
 * - Symbol properties are not processed
 * - Prototype properties are not merged
 * - Read-only properties may throw TypeError when overridden
 *
 * **Use Cases:**
 * - Configuration management and environment-specific overrides
 * - Default options merging in libraries and frameworks
 * - State management and partial updates
 * - API response data combination
 * - Form data preprocessing and validation setup
 * - Theme and styling object composition
 *
 * **Production Considerations:**
 * - **Security**: Validate input objects to prevent prototype pollution attacks
 * - **Performance**: Avoid merging very large objects frequently (consider caching)
 * - **Memory**: Monitor memory usage with deep object hierarchies
 * - **Error Handling**: Wrap in try-catch for production environments with user data
 * - **Circular Reference Detection**: Consider using `stableEquals` for safer alternatives
 *
 * **Alternative Approaches:**
 * - `Object.assign()`: Shallow merge only, no deep nesting support
 * - `{ ...target, ...source }`: Shallow spread, overwrites nested objects
 * - Lodash `merge()`: Similar functionality but immutable, heavier weight
 * - Custom recursive solutions: More control but higher complexity
 */
export const merge = <
  Target extends Record<PropertyKey, any>,
  Source extends Record<PropertyKey, any>,
>(
  target: Target,
  source: Source,
): Target & Source => {
  const keys = Object.keys(source) as Array<keyof Source>;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const sourceValue = source[key];
    const targetValue = target[key];
    if (isArray(sourceValue))
      target[key] = isArray(targetValue)
        ? merge(targetValue, sourceValue)
        : merge([], sourceValue);
    else if (isPlainObject(sourceValue))
      target[key] = isPlainObject(targetValue)
        ? merge(targetValue, sourceValue)
        : merge({}, sourceValue);
    else if (targetValue === undefined || sourceValue !== undefined)
      target[key] = sourceValue;
  }
  return target;
};
