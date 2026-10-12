import { isArray } from '@winglet/common-utils/filter';
import type { SchemaNodeRecord } from '../../../record';

/**
 * Block non-load fills beneath a branch holding the wrong raw kind.
 * @param node - Candidate descendant being considered for default filling
 * @returns Whether an object or array ancestor has a wrong-kind raw
 */
export const hasWrongKindBranchAncestor = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): boolean => {
  let parent = node.parent;
  while (parent) {
    if (parent.behavior.type === 'object' && parent.behavior.strategy === 'branch' &&
      parent.raw !== undefined && (parent.raw === null ||
        typeof parent.raw !== 'object' || isArray(parent.raw))) return true;
    if (parent.behavior.type === 'array' && parent.behavior.strategy === 'branch' &&
      parent.raw !== undefined && !isArray(parent.raw)) return true;
    parent = parent.parent;
  }
  return false;
};
