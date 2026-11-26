import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import type { FieldNodeRecord } from '../../../record';
import { getLoadValue } from './getLoadValue';
import { readLoadProperty } from './readLoadProperty';
import { readLoadSegments } from './readLoadSegments';

/**
 * Project a live virtual group's constituent load sources, keeping the previous tuple while it still matches.
 * @param node - Attached virtual group; the caller answers detached reads from their capture
 * @returns The memoized tuple when its length and every element are `Object.is`-equal to a fresh
 * declaration-ordered projection of the current load snapshot, so an unchanged read allocates nothing;
 * otherwise a new unfrozen tuple that replaces it in the node's `__virtualDefaultValue__`. Empty when the group has no parent.
 */
export const readVirtualDefaultValue = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): readonly unknown[] => {
  const parent = node.__parent__;
  if (!parent) return EMPTY_ARRAY;
  const snapshot = node.runtime.loadSnapshot;
  const host = parent.path
    ? getLoadValue(snapshot, parent.path, readLoadSegments(parent))
    : snapshot;
  const fields = node.blueprintNode.fields ?? EMPTY_ARRAY;
  const previous = node.__virtualDefaultValue__;
  if (previous && matchesProjection(previous, host, fields)) return previous;
  const next: unknown[] = [];
  for (let index = 0; index < fields.length; index++)
    next.push(readLoadProperty(host, fields[index]));
  node.__virtualDefaultValue__ = next;
  return next;
};

/**
 * Compare a memoized tuple with a fresh own-property projection of the same host.
 * @param previous - Tuple returned by an earlier read, possibly edited by its consumer
 * @param host - Load source at the group's parent address; a non-object projects undefined slots
 * @param fields - Declared constituent names in tuple order
 * @returns True only when the lengths match and every slot is `Object.is`-equal, so NaN stays equal
 */
const matchesProjection = (
  previous: readonly unknown[],
  host: unknown,
  fields: readonly string[],
): boolean => {
  if (previous.length !== fields.length) return false;
  for (let index = 0; index < fields.length; index++)
    if (!Object.is(previous[index], readLoadProperty(host, fields[index])))
      return false;
  return true;
};
