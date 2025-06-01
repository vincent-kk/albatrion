import { clone, isPlainObject } from '@winglet/common-utils';

import type { JsonObject, JsonValue } from '@/json/type';

/**
 * Applies JSON Merge Patch (RFC 7386) to source JSON value.
 *
 * This function implements the JSON Merge Patch specification (RFC 7386) to apply
 * a patch document to a source value, producing a modified target value. The function
 * follows the standard merge patch semantics:
 *
 * - **Patch is not an object**: Returns the patch value directly (complete replacement)
 * - **Source is not an object**: Treats source as empty object and applies patch
 * - **Object merging**: Recursively merges patch properties into source object
 * - **Null values**: Removes corresponding properties from the target object
 * - **Non-null values**: Recursively applies merge patch to nested values
 *
 * The function supports both mutable and immutable operations through the `immutable` parameter.
 * When `immutable` is true (default), the source object is cloned before modification.
 *
 * @param source - The source JSON value to be patched
 * @param patch - The merge patch to apply, or undefined for no changes
 * @param immutable - Whether to preserve the original source (default: true)
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7386 - JSON Merge Patch specification
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
export const mergePatch = (
  source: JsonValue,
  patch: JsonValue | undefined,
  immutable: boolean = true,
): JsonValue => {
  // If patch is undefined, return source unchanged
  if (patch === undefined) return source;

  // If patch is not an object (including null and arrays), return patch (complete replacement)
  if (!isPlainObject(patch)) return patch;

  // If source is not a plain object, start with an empty object
  const target: JsonObject = isPlainObject(source)
    ? immutable
      ? clone(source)
      : source
    : {};

  for (const key in patch) {
    const value = patch[key];
    if (value === null) delete target[key];
    else target[key] = mergePatch(target[key], value, immutable);
  }

  return target;
};
