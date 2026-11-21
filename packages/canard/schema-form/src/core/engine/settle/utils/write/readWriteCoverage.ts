import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

import { FieldNodeWriteKind } from '../../../types/value';
import type { WriteRange } from '../../types/writeRange';

/**
 * Read call-ordered coverage at a storage or delivery address.
 * @param ranges - Address decisions collected while composing caller input
 * @param path - Canonical address of the consumer
 * @param scope - Latest origin, accumulated whole, or a path leading to a whole write
 * @returns The last address decision that satisfies the requested coverage
 */
export const readWriteCoverage = (
  ranges: readonly WriteRange[],
  path: string,
  scope: 'latest' | 'whole' | 'distribution',
): WriteRange | undefined => {
  for (let index = ranges.length - 1; index >= 0; index--) {
    const range = ranges[index];
    if (scope === 'latest') {
      if (
        range.path === path ||
        (!range.partial &&
          !range.isLogical &&
          isDescendantPath(path, range.path))
      )
        return range;
    } else if (
      !range.partial &&
      !range.isLogical &&
      range.source !== FieldNodeWriteKind.Automatic &&
      (range.path === path ||
        isDescendantPath(path, range.path) ||
        (scope === 'distribution' && isDescendantPath(range.path, path)))
    )
      return range;
  }
  return undefined;
};
