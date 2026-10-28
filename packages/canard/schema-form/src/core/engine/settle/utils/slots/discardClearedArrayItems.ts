import type { FieldNodeRecord } from '../../../record';
import { DetachedWriteAddress } from '../detached/DetachedWriteAddress';

/**
 * Drop write destinations for every retained item of an emptied clearing array.
 * @param node - Clearing array with no surviving item source; its own address stays writable.
 * @returns Nothing; owned children and inactive item candidates receive discard markers recursively.
 */
export const discardClearedArrayItems = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): void => {
  for (const child of node.children ?? [])
    if (child.parent === node) DetachedWriteAddress.discard(child);
  for (const child of node.inactiveSlots?.values() ?? [])
    DetachedWriteAddress.discard(child);
};
