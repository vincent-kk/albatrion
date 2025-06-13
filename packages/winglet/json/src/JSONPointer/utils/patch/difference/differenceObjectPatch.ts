import { JSONPointer } from '@/json/JSONPointer/enum';
import { getValue } from '@/json/JSONPointer/utils/manipulator/getValue';
import { setValue } from '@/json/JSONPointer/utils/manipulator/setValue';
import { compare } from '@/json/JSONPointer/utils/patch/compare';
import { Operation, type Patch } from '@/json/JSONPointer/utils/patch/type';
import type { JsonObject } from '@/json/type';

import { getArrayBasePath } from './utils/getArrayBasePath';

/**
 * Generates an optimized JSON Merge Patch for transforming one object into another.
 *
 * This function implements a high-performance algorithm to create merge patches between two plain objects.
 * It uses an intelligent two-phase approach to optimize the handling of array changes while minimizing
 * redundant operations:
 *
 * **Phase 1 - Array Optimization**:
 * - Detects paths that target array elements using `getArrayBasePath()`
 * - For arrays with changes, replaces the entire array rather than individual element patches
 * - Prevents redundant individual element operations when the whole array is being updated
 * - Stores non-array patches for processing in phase 2
 *
 * **Phase 2 - Individual Patches**:
 * - Processes remaining patches that don't affect arrays
 * - Applies ADD, REPLACE, and REMOVE operations directly
 * - Uses optimized JSON Pointer path manipulation
 *
 * The algorithm provides O(n) time complexity where n is the number of patches, with optimized
 * space usage through single-pass processing and minimal intermediate allocations.
 *
 * @param source - The source object to transform from
 * @param target - The target object to transform to
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7396 - JSON Merge Patch specification
 * @see https://datatracker.ietf.org/doc/html/rfc6901 - JSON Pointer specification
 * @see https://datatracker.ietf.org/doc/html/rfc6902 - JSON Patch specification (used internally by compare())
 *
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
 * // Array optimization in action
 * const source = { users: [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }] };
 * const target = { users: [{ id: 1, name: "Alice" }, { id: 2, name: "Bobby" }, { id: 3, name: "Charlie" }] };
 *
 * const patch = differenceObjectPatch(source, target);
 * // Returns: { users: [{ id: 1, name: "Alice" }, { id: 2, name: "Bobby" }, { id: 3, name: "Charlie" }] }
 * // Note: Entire array is replaced rather than individual element patches
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
): JsonObject | undefined => {
  const patches = compare(source, target);
  const patchCount = patches.length;

  if (patchCount === 0) return undefined;

  const mergePatch: JsonObject = {};
  const processedArrayPaths = new Set<string>();
  const validPatches: Array<Patch> = [];

  // 단일 패스: 배열 패치와 일반 패치 분리 및 배열 패치 즉시 처리
  for (let index = 0; index < patchCount; index++) {
    const patch = patches[index];
    const arrayPath = getArrayBasePath(patch.path);
    if (arrayPath === null) validPatches.push(patch);
    else if (!processedArrayPaths.has(arrayPath)) {
      const segments = arrayPath.split(JSONPointer.Separator);
      setValue(mergePatch, segments, getValue(target, segments));
      processedArrayPaths.add(arrayPath);
    }
  }

  // 일반 패치들 처리 (배열과 무관한 패치들만 포함)
  for (let index = 0, length = validPatches.length; index < length; index++) {
    const patch = validPatches[index];
    if (patch.op === Operation.ADD || patch.op === Operation.REPLACE)
      setValue(mergePatch, patch.path, patch.value);
    else if (patch.op === Operation.REMOVE)
      setValue(mergePatch, patch.path, null);
  }

  return mergePatch;
};
