import { isPlainObject } from '@winglet/common-utils';

import type { JsonObject } from '@/json/type';

/**
 * Merge the patch into the source object recursively
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
  for (const key in patch) {
    const value = patch[key];
    if (value === null) delete source[key];
    else source[key] = mergePatchRecursive(source[key], value);
  }
  return source;
};
