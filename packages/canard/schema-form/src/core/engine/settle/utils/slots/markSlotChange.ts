import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';

/**
 * Retain one binding's published view before changing its pending source.
 * @param host - Owner of the mutable slots and their next publication
 * @param entry - Binding changed by entry, exit, pruning, or an overlay write
 * @returns Nothing; the next commit can publish only affected hosts and ancestors
 */
export const markSlotChange = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  entry: BlueprintChildEntry,
): void => {
  const baselines = (host.inactiveSlotBaselines ??= new Map());
  if (!baselines.has(entry))
    baselines.set(entry, {
      source: host.inactiveSlots?.get(entry),
      overlay: host.inactiveSlotOverlays?.get(entry),
    });
  (host.runtime.slotDirtyHosts ??= new Set()).add(host);
};
