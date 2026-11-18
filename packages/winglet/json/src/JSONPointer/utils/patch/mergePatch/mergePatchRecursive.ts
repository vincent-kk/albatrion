import { isPlainObject } from '@winglet/common-utils/filter';

import type { JSONObject } from '@/json/type';

import { mergePatchDeep } from './utils/mergePatchDeep';

/**
 * Merges a patch into the source using explicit depth-first work frames
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
  source: JSONObject | undefined = {},
  patch: JSONObject | undefined,
): JSONObject => {
  if (patch === undefined) return source;
  if (!isPlainObject(patch)) return patch;
  // RFC 7396 replaces a non-object target with an empty object before merging; the
  // default parameter only covers undefined, leaving numbers, strings, null and arrays
  if (!isPlainObject(source)) source = {};
  return mergePatchDeep(source, patch);
};
