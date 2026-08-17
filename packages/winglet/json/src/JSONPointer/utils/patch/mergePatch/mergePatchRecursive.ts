import { isPlainObject } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';
import {
  deleteDataProperty,
  getDataProperty,
  setDataProperty,
} from '@winglet/common-utils/object';

import type { JsonObject } from '@/json/type';

/**
 * Merge the patch into the source object recursively
 *
 * Reserved member names (`__proto__`, `constructor`, `prototype`) in the patch
 * are merged as own data properties at every depth — reads and writes go
 * through the data-property primitives, so the prototype chain is never
 * touched and inherited objects are never modified.
 *
 * @example
 * ```typescript
 * const source = { a: 1, b: 2 };
 * const patch = { a: 3, c: 4 };
 * const result = mergePatchRecursive(source, patch);
 * // Returns: { a: 3, b: 2, c: 4 }
 * ```
 *
 * @param source - The source object to be merged with the patch
 * @param patch - The patch object to be applied to the source
 * @returns The merged object
 * @internal
 */
export const mergePatchRecursive = (
  source: JsonObject | undefined = {},
  patch: JsonObject | undefined,
): JsonObject => {
  if (patch === undefined) return source;
  if (!isPlainObject(patch)) return patch;
  // RFC 7396 replaces a non-object target with an empty object before merging; the
  // default parameter only covers undefined, leaving numbers, strings, null and arrays
  if (!isPlainObject(source)) source = {};
  for (const key in patch) {
    if (!hasOwnProperty(patch, key)) continue;
    const value = patch[key];
    if (value === null) deleteDataProperty(source, key);
    else
      setDataProperty(
        source,
        key,
        mergePatchRecursive(getDataProperty(source, key), value),
      );
  }
  return source;
};
