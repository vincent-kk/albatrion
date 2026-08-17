import type { JsonObject } from '@/json/type';

import { differenceRecursive } from './differenceRecursive';

/**
 * Generates an optimized JSON Merge Patch for transforming one object into another.
 *
 * The source and target are traversed directly at matching object depths. Plain-object
 * values are compared recursively, while arrays and other leaf values are compared and
 * replaced as complete values. Patch objects are allocated lazily, and JSON-compatible
 * replacement values are cloned to avoid sharing arrays or plain-object subtrees with the target.
 *
 * Removed properties and existing properties whose target value is `undefined` are encoded
 * as `null`. New properties whose target value is `undefined` are omitted because applying
 * them would not change the source under JSON Merge Patch semantics.
 *
 * Prototype-polluting keys (`__proto__`, `constructor`, `prototype`) never enter the patch,
 * matching the protection `setValue` applies when a patch is written through a pointer.
 *
 * @param source - The source object to transform from
 * @param target - The target object to transform to
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7396 - JSON Merge Patch specification
 * @returns A JSON Merge Patch object maintaining the original structure, or `undefined` if no changes are needed.
 *          The patch uses the following conventions:
 *          - Property additions/changes: nested object structure with new values
 *          - Property removals: nested object structure with `null` values
 *          - Array replacements: entire array as new value in structure
 *
 * @example
 * ```typescript
 * // Simple property changes
 * const source = { name: "John", age: 30 };
 * const target = { name: "John", age: 31, city: "NYC" };
 *
 * const patch = differenceObjectPatch(source, target);
 * // Returns: { age: 31, city: "NYC" }
 * ```
 *
 * @example
 * ```typescript
 * // Array replacement
 * const source = { users: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }] };
 * const target = { users: [{ id: 1, name: "Alice" }, { id: 2, name: "Bobby" }, { id: 3, name: "Charlie" }] };
 *
 * const patch = differenceObjectPatch(source, target);
 * // Returns: { users: [{ id: 1, name: "Alice" }, { id: 2, name: "Bobby" }, { id: 3, name: "Charlie" }] }
 * // The entire array is replaced rather than merged by element.
 * ```
 *
 * @example
 * ```typescript
 * // Mixed operations with nested structure
 * const source = {
 *   user: { name: "Alice", age: 25 },
 *   settings: { theme: "dark", lang: "en" },
 *   deprecated: "old_feature"
 * };
 * const target = {
 *   user: { name: "Alice", age: 26 },
 *   settings: { theme: "light", lang: "en", notifications: true }
 * };
 *
 * const patch = differenceObjectPatch(source, target);
 * // Returns: {
 * //   user: { age: 26 },
 * //   settings: { theme: "light", notifications: true },
 * //   deprecated: null
 * // }
 * ```
 *
 * @example
 * ```typescript
 * // No changes scenario
 * const source = { unchanged: "data" };
 * const target = { unchanged: "data" };
 *
 * const patch = differenceObjectPatch(source, target);
 * // Returns: undefined
 * ```
 *
 * @example
 * ```typescript
 * // Nested array handling
 * const source = {
 *   data: {
 *     items: [1, 2, 3],
 *     meta: { count: 3 }
 *   }
 * };
 * const target = {
 *   data: {
 *     items: [1, 2, 3, 4],
 *     meta: { count: 4, updated: true }
 *   }
 * };
 *
 * const patch = differenceObjectPatch(source, target);
 * // Returns: {
 * //   data: {
 * //     items: [1, 2, 3, 4],
 * //     meta: { count: 4, updated: true }
 * //   }
 * // }
 * ```
 */
export const differenceObjectPatch = (
  source: JsonObject,
  target: JsonObject,
): JsonObject | undefined => differenceRecursive(source, target);
