import { isPlainObject } from '@winglet/common-utils/filter';
import { cloneLite } from '@winglet/common-utils/object';

import type { JsonObject, JsonValue } from '@/json/type';

import { mergePatchRecursive } from './mergePatchRecursive';

/**
 * Applies JSON Merge Patch (RFC 7396) to source JSON value.
 *
 * This function implements the JSON Merge Patch specification (RFC 7396) to apply
 * a patch document to a source value, producing a modified target value. The function
 * follows the standard merge patch semantics:
 *
 * - **Merge patch body is not an object**: Returns the merge patch body value directly (complete replacement)
 * - **Source is not an object**: Treats source as empty object and applies merge patch body
 * - **Object merging**: Recursively merges merge patch body properties into source object
 * - **Null values**: Removes corresponding properties from the target object
 * - **Non-null values**: Recursively applies merge patch to nested values
 *
 * The function supports both mutable and immutable operations through the `immutable` parameter.
 * When `immutable` is true (default), the source object is cloned before modification.
 *
 * @param source - The source JSON value to be patched
 * @param mergePatchBody - The JSON merge patch document to apply, or undefined for no changes
 * @param immutable - Whether to preserve the original source object by creating a deep copy.
 *                    This is an implementation-specific feature not defined in RFC 7396.
 *                    When true (default), the source is cloned before modification.
 *                    When false, the source object is modified in place for better performance.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7396 - JSON Merge Patch specification
 *
 * @returns The result of applying the merge patch to the source value.
 *          Returns the original source if patch is undefined.
 *
 * @example
 * ```typescript
 * // Object property addition and modification
 * const source = { name: "John", age: 30 };
 * const patch = { age: 31, city: "NYC" };
 *
 * const result = mergePatch(source, patch);
 * // Returns: { name: "John", age: 31, city: "NYC" }
 * ```
 *
 * @example
 * ```typescript
 * // Property removal with null values
 * const source = { name: "John", age: 30, temp: "data" };
 * const patch = { age: 31, temp: null };
 *
 * const result = mergePatch(source, patch);
 * // Returns: { name: "John", age: 31 }
 * ```
 *
 * @example
 * ```typescript
 * // Complete replacement with non-object patch
 * const source = { complex: "object" };
 * const patch = "simple string";
 *
 * const result = mergePatch(source, patch);
 * // Returns: "simple string"
 * ```
 *
 * @example
 * ```typescript
 * // Nested object merging
 * const source = { user: { name: "Alice", age: 25, role: "admin" } };
 * const patch = { user: { age: 26, role: null } };
 *
 * const result = mergePatch(source, patch);
 * // Returns: { user: { name: "Alice", age: 26 } }
 * ```
 *
 * @example
 * ```typescript
 * // Mutable operation
 * const source = { data: "original" };
 * const patch = { data: "modified", new: "value" };
 *
 * const result = mergePatch(source, patch, false);
 * console.log(source === result); // true (same reference)
 * console.log(result); // { data: "modified", new: "value" }
 * ```
 */
export const mergePatch = <Type extends JsonValue>(
  source: JsonValue,
  mergePatchBody: JsonValue | undefined,
  immutable: boolean = true,
): Type => {
  // If patch is undefined, return source unchanged
  if (mergePatchBody === undefined) return source as Type;

  // If patch is not an object (including null and arrays), return patch (complete replacement)
  if (!isPlainObject(mergePatchBody)) return mergePatchBody as Type;

  // If source is not a plain object, start with an empty object
  const target: JsonObject = isPlainObject(source)
    ? immutable
      ? cloneLite(source)
      : source
    : {};
  const patch = immutable ? cloneLite(mergePatchBody) : mergePatchBody;

  // Apply patch for object recursively
  return mergePatchRecursive(target, patch) as Type;
};
