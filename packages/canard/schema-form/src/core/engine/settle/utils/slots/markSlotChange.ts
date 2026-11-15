import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotBaseline } from '../../../record';
import type { SettlementContext } from '../../types/settlement';

/**
 * Retain one binding's published view before changing its pending source.
 * @param host - Owner of the mutable slots and their next publication
 * @param entry - Binding changed by entry, exit, pruning, or an overlay write
 * @param activeNode - Last committed active child when this mutation is its final exit
 * @returns Nothing; the next commit can publish only affected hosts and ancestors
 */
export const markSlotChange = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  entry: BlueprintChildEntry,
  activeNode?: Self,
  context?: SettlementContext<Self>,
): void => {
  if (context?.isInTransition) {
    const journal = (context.slotAutomaticLog ??= new Map<
      Self,
      Map<BlueprintChildEntry, InactiveSlotBaseline<Self>>
    >());
    let bindings = journal.get(host);
    if (!bindings) journal.set(host, (bindings = new Map()));
    if (!bindings.has(entry))
      bindings.set(entry, {
        instance: host.inactiveSlots?.get(entry),
        overlay: host.inactiveSlotOverlays?.get(entry),
      });
  }
  const baselines = (host.inactiveSlotBaselines ??= new Map<
    BlueprintChildEntry,
    InactiveSlotBaseline<Self>
  >());
  if (!baselines.has(entry))
    baselines.set(entry, {
      activeNode:
        activeNode ??
        (host.isDeliveryInitialized
          ? (host.deliveryPreviousChildren ?? host.children)?.find(
              (child) => child.parent === host && child.name === entry.name,
            )
          : undefined),
      instance: host.inactiveSlots?.get(entry),
      overlay: host.inactiveSlotOverlays?.get(entry),
    });
  (host.runtime.slotDirtyHosts ??= new Set()).add(host);
  for (
    let child = host;
    !child.isDetached && child.parent;
    child = child.parent
  ) {
    const parent = child.parent;
    if (parent.isDetached || parent.childrenByName?.[child.name] !== child)
      break;
    (parent.inactiveSlotChildren ??= new Map<string, Self>()).set(
      child.name,
      child,
    );
  }
};
