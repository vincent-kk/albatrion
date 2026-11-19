import { EMPTY_ARRAY } from '@winglet/common-utils/constant';

import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import { resolveStorageTargets } from '../../../utils/paths/resolveStorageTargets';
import { materializeInactiveSlotValues } from '../slots/materializeInactiveSlotValues';

/** Read the current or final committed inactive values for one reference. */
export const readFieldNodeInactiveValues = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): readonly { path: string; value: unknown }[] => {
  if (node.isDetached)
    return (
      node.runtime.detachedReads?.get(node)?.inactiveValues ??
      materializeInactiveSlotValues(node)
    );
  const targets = resolveStorageTargets(node);
  if (!targets || !node.parent) return materializeInactiveSlotValues(node);
  const values = materializeInactiveSlotValues(node.parent);
  const includes = (value: { path: string }): boolean => targets.some(target => value.path === target.path || isDescendantPath(value.path, target.path));
  const next = values.every(includes) ? values : values.filter(includes);
  const previous = node.inactiveValuesCache;
  if (previous?.length === next.length && next.every((value, index) => value === previous[index])) return previous;
  return (node.inactiveValuesCache = next.length ? Object.freeze(next) : EMPTY_ARRAY);
};
