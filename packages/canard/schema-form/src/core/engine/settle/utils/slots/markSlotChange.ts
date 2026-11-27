import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotBaseline } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getSlotDecision } from '../source/getSlotDecision';

/** Annotates the lazily created `__inactiveSlotBaselines__`; an argument-less `new Map()` would be `Map<any, any>`. */
type InactiveSlotBaselines<Self> = Map<
  BlueprintChildEntry,
  InactiveSlotBaseline<Self>
>;
/** Annotates the lazily created `__inactiveSlotChildren__`; an argument-less `new Map()` would be `Map<any, any>`. */
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
      instance: host.__inactiveSlots__?.get(entry),
      overlay: host.__inactiveSlotOverlays__?.get(entry),
    };
  }
  const baselines: InactiveSlotBaselines<Self> =
    (host.__inactiveSlotBaselines__ ??= new Map());
  if (!baselines.has(entry))
    baselines.set(entry, {
      activeNode:
        activeNode ??
        (host.__isDeliveryInitialized__
          ? (host.__deliveryPreviousChildren__ ?? host.children)?.find(
              (child) => child.__parent__ === host && child.name === entry.name,
            )
          : undefined),
      instance: host.__inactiveSlots__?.get(entry),
      overlay: host.__inactiveSlotOverlays__?.get(entry),
    });
  (host.runtime.slotDirtyHosts ??= new Set()).add(host);
  for (
    let child = host;
    !child.isDetached && child.__parent__;
    child = child.__parent__
  ) {
    const parent = child.__parent__;
    if (parent.isDetached || parent.__childrenByName__?.[child.name] !== child)
      break;
    const children: InactiveSlotChildren<Self> =
      (parent.__inactiveSlotChildren__ ??= new Map());
    children.set(child.name, child);
  }
};
