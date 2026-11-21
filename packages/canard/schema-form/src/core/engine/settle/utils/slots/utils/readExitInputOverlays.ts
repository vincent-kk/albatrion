import type { BlueprintChildEntry } from '../../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../../record';
import type { RetainedArraySources } from '../../../types/settlement';

/**
 * Read input-only bindings from the array's current generation for an exit.
 * @param host - Array whose missing positions may already own named sources
 * @param array - Updated array binding state, when touched by automatic writes
 * @param caller - Patches from the caller's original marked distribution
 * @returns Current supplied slots, excluding names compute already bound
 */
export const readExitInputOverlays = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  array: RetainedArraySources | undefined,
  caller: ReadonlyMap<BlueprintChildEntry, InactiveSlotOverlay> | undefined,
): ReadonlyMap<BlueprintChildEntry, InactiveSlotOverlay> | undefined => {
  if (!array?.namedItems) return caller;
  const inputs = new Map(caller);
  for (const [entry, overlay] of array.namedItems)
    if (!host.childrenByName?.[entry.name]) inputs.set(entry, overlay);
  return inputs.size ? inputs : undefined;
};
