import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';

/**
 * Resolve a retained child and the patch covering its exact candidate binding.
 * @param host - Retained parent, absent for an input-only patch
 * @param entry - Canonical candidate whose source channels are requested
 * @param overlay - Parent patch that may replace otherwise inherited sources
 * @returns Source and patch without interpreting or modifying either
 */
export const getSlotSource = <Self extends FieldNodeRecord<Self>>(
  host: Self | undefined,
  entry: BlueprintChildEntry,
  overlay?: InactiveSlotOverlay,
): { source: Self | undefined; overlay: InactiveSlotOverlay | undefined } => {
  const supplied = overlay?.children?.get(entry);
  if (overlay?.replace && !supplied)
    return { source: undefined, overlay: undefined };
  const live = host?.structure?.[entry.name];
  return {
    source:
      live?.blueprintNode === entry.node
        ? live
        : host?.inactiveSlots?.get(entry),
    overlay: supplied ?? host?.inactiveSlotOverlays?.get(entry),
  };
};
