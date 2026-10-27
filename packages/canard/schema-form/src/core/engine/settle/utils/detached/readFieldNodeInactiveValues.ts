import type { FieldNodeRecord } from '../../../record';
import { isSlotEligible } from '../slots/isSlotEligible';
import { materializeInactiveSlotValues } from '../slots/materializeInactiveSlotValues';
import { EMPTY_VALUES } from './emptyDetachedReads';

/** Read the current or final committed inactive values for one reference. */
export const readFieldNodeInactiveValues = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): readonly { path: string; value: unknown }[] =>
  isSlotEligible(node.runtime)
    ? materializeInactiveSlotValues(node)
    : node.detached
      ? (node.runtime.detachedReads?.get(node)?.inactiveValues ?? EMPTY_VALUES)
      : (node.runtime.literalStarValuesMemo?.get(node.path) ?? EMPTY_VALUES);
