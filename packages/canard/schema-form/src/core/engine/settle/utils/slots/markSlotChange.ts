import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotBaseline } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getSlotDecision } from '../source/getSlotDecision';

/** Annotates the lazily created `inactiveSlotBaselines`; an argument-less `new Map()` would be `Map<any, any>`. */
type InactiveSlotBaselines<Self> = Map<
  BlueprintChildEntry,
  InactiveSlotBaseline<Self>
>;
/** Annotates the lazily created `inactiveSlotChildren`; an argument-less `new Map()` would be `Map<any, any>`. */
type InactiveSlotChildren<Self> = Map<string, Self>;

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
    const slot = getSlotDecision(host, entry, context);
    slot.baseline ??= {
      instance: host.inactiveSlots?.get(entry),
      overlay: host.inactiveSlotOverlays?.get(entry),
    };
  }
  const baselines: InactiveSlotBaselines<Self> = (host.inactiveSlotBaselines ??=
    new Map());
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
    const children: InactiveSlotChildren<Self> =
      (parent.inactiveSlotChildren ??= new Map());
    children.set(child.name, child);
  }
};
