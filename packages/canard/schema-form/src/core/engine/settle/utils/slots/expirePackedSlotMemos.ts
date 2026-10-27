import { getItemEntries } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import { getSlotEntries } from './getSlotEntries';
import { getSlotSource } from './getSlotSource';

/**
 * End independent entry lifetimes folded into a candidate-free packed array.
 * @param source - Departing array with its immutable current child sources
 * @param overlay - Final policy patch and explicit independent descendant writes
 * @returns Nothing; previously returned frozen views retain their entry references
 */
export const expirePackedSlotMemos = <Self extends FieldNodeRecord<Self>>(
  source: Self,
  overlay: InactiveSlotOverlay | undefined,
): void => {
  const clear = (
    node: Self | undefined,
    patch: InactiveSlotOverlay | undefined,
  ): void => {
    if (node) node.inactiveValueMemo = undefined;
    if (patch) patch.valueMemo = undefined;
    for (const entry of getSlotEntries(node, patch)) {
      const child = getSlotSource(node, entry, patch);
      clear(child.source, child.overlay);
    }
  };
  for (const entry of getSlotEntries(source, overlay)) {
    if (
      entry.node.hasCandidateDescendants ||
      getItemEntries(source.blueprintNode, Number(entry.name)).length > 1 ||
      (overlay?.children?.has(entry) &&
        overlay.children.get(entry) !==
          source.retainedSourceOverlay?.children?.get(entry))
    )
      continue;
    const child = getSlotSource(source, entry, overlay);
    clear(child.source, child.overlay);
  }
};
