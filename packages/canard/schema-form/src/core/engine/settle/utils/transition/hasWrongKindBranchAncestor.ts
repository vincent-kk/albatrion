import { isArray } from '@winglet/common-utils/filter';

import type { FieldNodeRecord } from '../../../record';

/**
 * Block load and non-load fills beneath a branch holding a wrong-kind raw.
 * @param node - Candidate descendant being considered for default filling
 * @returns Whether an object or array ancestor has a wrong-kind raw
 */
export const hasWrongKindBranchAncestor = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): boolean => {
  let parent = node.parent;
  while (parent) {
    if (
      parent.behavior.type === 'object' &&
      parent.behavior.strategy === 'branch' &&
      parent.raw !== undefined &&
      (parent.raw === null ||
        typeof parent.raw !== 'object' ||
        isArray(parent.raw))
    )
      return true;
    if (
      parent.behavior.type === 'array' &&
      parent.behavior.strategy === 'branch' &&
      parent.raw !== undefined &&
      !isArray(parent.raw)
    )
      return true;
    parent = parent.parent;
  }
  return false;
};
