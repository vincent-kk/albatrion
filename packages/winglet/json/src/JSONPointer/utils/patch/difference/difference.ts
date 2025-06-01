import { equals, isPlainObject, isPrimitiveType } from '@winglet/common-utils';

import type { JsonValue } from '@/json/type';

import { differenceObjectPatch } from './differenceObjectPatch';

/**
 * Generates a JSON Merge Patch representing the differences between two JSON values.
 *
 * This function implements the JSON Merge Patch specification (RFC 7386) to create a patch
 * that, when applied to the source value, will transform it into the target value. The function
 * intelligently handles different data types and optimization strategies:
 *
 * - **Identity check**: Returns `undefined` if source and target are identical (no changes needed)
 * - **Primitive replacement**: Returns the target value directly for primitive types
 * - **Object merge**: Uses optimized patch generation for plain objects
 * - **Complex replacement**: Returns the target value for arrays and complex type mismatches
 *
 * The generated patch follows JSON Merge Patch semantics where:
 * - `null` values indicate property removal
 * - Non-null values indicate property addition or replacement
 * - Missing properties remain unchanged
 * - The patch maintains the original object structure
 *
 * @param source - The source JSON value to compare from
 * @param target - The target JSON value to compare to
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7386 - JSON Merge Patch specification
 * @see https://datatracker.ietf.org/doc/html/rfc6901 - JSON Pointer specification (used internally)
 *
 * @returns A JSON Merge Patch that transforms source into target, or `undefined` if no changes are needed.
 *          The patch format depends on the input types:
 *          - Primitive target: returns the target value
 *          - Object changes: returns a merge patch object maintaining structure
 *          - Array/complex changes: returns the target value
 *
 * @example
 * ```typescript
 * // Object to object transformation
 * const source = { name: "John", age: 30, city: "NYC" };
 * const target = { name: "John", age: 31, country: "USA" };
 *
 * const patch = difference(source, target);
 * // Returns: { age: 31, city: null, country: "USA" }
 * ```
 *
 * @example
 * ```typescript
 * // Primitive value replacement
 * const source = "old value";
 * const target = "new value";
 *
 * const patch = difference(source, target);
 * // Returns: "new value"
 * ```
 *
 * @example
 * ```typescript
 * // Array replacement (not merged)
 * const source = [1, 2, 3];
 * const target = [1, 3, 4];
 *
 * const patch = difference(source, target);
 * // Returns: [1, 3, 4] (entire array replacement)
 * ```
 *
 * @example
 * ```typescript
 * // No changes needed
 * const source = { unchanged: "data" };
 * const target = { unchanged: "data" };
 *
 * const patch = difference(source, target);
 * // Returns: undefined
 * ```
 *
 * @example
 * ```typescript
 * // Nested object changes
 * const source = { user: { name: "Alice", age: 25, temp: "data" } };
 * const target = { user: { name: "Bob", age: 25 } };
 *
 * const patch = difference(source, target);
 * // Returns: { user: { name: "Bob", temp: null } }
 * ```
 */
export const difference = (
  source: JsonValue,
  target: JsonValue,
): JsonValue | undefined => {
  // If `source` and `target` are the same, return empty object (no changes)
  if (source === target) return undefined;

  // If `target` is primitive type, return `target` (replacement)
  if (isPrimitiveType(target)) return target;

  // [`object` -> `object`]: use `compare` to create patches and return `mergePatch`
  if (isPlainObject(source) && isPlainObject(target))
    return differenceObjectPatch(source, target);

  // [`array` -> `array`, `array` -> `object`, `object` -> `array`]: use `equals` to check and return `target` if they are different
  if (equals(source, target)) return undefined;
  return target;
};
