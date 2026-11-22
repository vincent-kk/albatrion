import type { BlueprintChildEntry } from '../../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../../record';
import type { RetainedArraySources } from '../../../types/settlement';
import type { CompactedSlotSources } from '../../../types/slots';
import { getRetainedChildEntry } from '../getRetainedChildEntry';

/**
 * Project an array's boundary shape using its original binding lifetimes.
 * @param node - Leaving array whose working shape may differ from the selected shape
 * @param baseline - First automatic write's array frame
 * @param previous - Already-selected child patches
 * @returns Rebinding plan when the working instance cannot supply the selected shape
 */
export const selectBaselineArrayBindings = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  baseline: RetainedArraySources<Self>,
  previous: InactiveSlotOverlay | undefined,
): CompactedSlotSources<Self> | undefined => {
  const { previousItemCount: itemCount, previousItems } = baseline;
  if (
    itemCount === node.itemCount &&
    previousItems.length === (node.children?.length ?? 0) &&
    previousItems.every((item) => node.childrenByName?.[item.name] === item)
  )
    return undefined;
  const sources = new Map<BlueprintChildEntry, Self>();
  const overlays = new Map<BlueprintChildEntry, InactiveSlotOverlay>();
  for (const [entry, instance] of node.inactiveSlots ?? [])
    if (Number(entry.name) < itemCount) sources.set(entry, instance);
  for (const [entry, overlay] of node.inactiveSlotOverlays ?? [])
    if (Number(entry.name) < itemCount) overlays.set(entry, overlay);
  for (const item of previousItems) {
    const entry = getRetainedChildEntry(node, item.name, item.blueprintNode);
    if (entry && Number(entry.name) < itemCount) sources.set(entry, item);
  }
  for (const [entry, overlay] of previous?.children ?? [])
    if (Number(entry.name) < itemCount) overlays.set(entry, overlay);
  return { itemCount, sources, overlays };
};
