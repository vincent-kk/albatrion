import type { Optional } from '@aileron/declare';

import { getItemEntries } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getSlotEntries } from './getSlotEntries';
import { getSlotSource } from './getSlotSource';

/**
 * End independent entry lifetimes folded into a candidate-free packed array.
 * @param instance - Departing array with its immutable current child sources
 * @param overlay - Final policy patch and explicit independent descendant writes
 * @returns Nothing; previously returned frozen views retain their entry references
 */
export const expirePackedSlotMemos = <Self extends FieldNodeRecord<Self>>(
  instance: Self,
  overlay: Optional<InactiveSlotOverlay>,
): void => {
  const clear = (
    node: Optional<Self>,
    patch: Optional<InactiveSlotOverlay>,
  ): void => {
    if (node) node.inactiveValueMemo = undefined;
    if (patch) patch.valueMemo = undefined;
    for (const entry of getSlotEntries(node, patch)) {
      const child = getSlotSource(node, entry, patch);
      clear(child.instance, child.overlay);
    }
  };
  for (const entry of getSlotEntries(instance, overlay)) {
    if (
      entry.node.hasCandidateDescendants ||
      getItemEntries(instance.blueprintNode, Number(entry.name)).length > 1 ||
      (overlay?.children?.has(entry) &&
        overlay.children.get(entry) !==
          instance.retainedSourceOverlay?.children?.get(entry))
    )
      continue;
    const child = getSlotSource(instance, entry, overlay);
    clear(child.instance, child.overlay);
  }
};
