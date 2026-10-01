import { isArray } from '@winglet/common-utils/filter';
import type { BlueprintNodeKind } from '../../../../blueprint';

/**
 * Fill one absent item by template kind, reusing an unchanged prior hole.
 * @param kind - Template kind determining the empty container or null
 * @param previous - Earlier value available for reference reuse
 * @returns Mutable empty container for hosts, or null for leaves
 */
export const holeValue = (kind: BlueprintNodeKind, previous: unknown): unknown => {
  if (kind === 'array') return isArray(previous) && previous.length === 0 &&
    !Object.isFrozen(previous) ? previous : [];
  if (kind === 'object') {
    if (previous !== null && typeof previous === 'object' && !isArray(previous) &&
      !Object.isFrozen(previous)) {
      const prototype = Object.getPrototypeOf(previous);
      if ((prototype === Object.prototype || prototype === null) &&
        Object.keys(previous).length === 0) return previous;
    }
    return {};
  }
  return null;
};
