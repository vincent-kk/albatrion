import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';

/**
 * Retain one binding's published view before changing its pending source.
 * @param host - Owner of the mutable slots and their next publication
 * @param entry - Binding changed by entry, exit, pruning, or an overlay write
 * @param active - Last committed active child when this mutation is its final exit
 * @returns Nothing; the next commit can publish only affected hosts and ancestors
 */
export const markSlotChange = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  entry: BlueprintChildEntry,
  active?: Self,
  context?: SettlementContext<Self>,
): void => {
  if (context?.inTransition) {
    const journal = (context.slotAutomaticLog ??= new Map());
    let bindings = journal.get(host);
    if (!bindings) journal.set(host, (bindings = new Map()));
    if (!bindings.has(entry))
      bindings.set(entry, {
        source: host.inactiveSlots?.get(entry),
        overlay: host.inactiveSlotOverlays?.get(entry),
      });
  }
  const baselines = (host.inactiveSlotBaselines ??= new Map());
  if (!baselines.has(entry))
    baselines.set(entry, {
      active:
        active ??
        (host.deliveryInitialized
          ? (host.deliveryPreviousChildren ?? host.children)?.find(
              (child) => child.parent === host && child.name === entry.name,
            )
          : undefined),
      source: host.inactiveSlots?.get(entry),
      overlay: host.inactiveSlotOverlays?.get(entry),
    });
  (host.runtime.slotDirtyHosts ??= new Set()).add(host);
};
