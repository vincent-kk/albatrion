import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { isReplacedLivePath } from '../transition/isReplacedLivePath';
import { readDepartingAncestorPolicy } from '../transition/readDepartingAncestorPolicy';
import { cloneSlotSubtree } from './cloneSlotSubtree';
import { createExitSlotOverlay } from './createExitSlotOverlay';
import { getRetainedChildEntry } from './getRetainedChildEntry';
import { markSlotChange } from './markSlotChange';

/** Annotates the lazily created `__inactiveSlots__`; an argument-less `new Map()` would be `Map<any, any>`. */
type InactiveSlots<Self> = Map<BlueprintChildEntry, Self>;
/** Annotates the lazily created `__inactiveSlotOverlays__`; an argument-less `new Map()` would be `Map<any, any>`. */
type InactiveSlotOverlays = Map<BlueprintChildEntry, InactiveSlotOverlay>;

/**
 * Retain an exit's instance and source policy without a latent serialization.
 * @param node - Finally detached top occurrence outside load and perished scopes
 * @param context - Last-live policies and the host's next publication
 * @param applyPolicy - Whether automatic exit clearing applies to this occurrence
 * @returns Nothing; a fully cleared occurrence has no retained slot
 */
export const retainExitedSlot = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  applyPolicy: boolean,
): void => {
  const host = node.__parent__;
  if (!host) return;
  const entry = getRetainedChildEntry(host, node.name, node.blueprintNode);
  if (!entry) return;
  if (isReplacedLivePath(context, node.path)) {
    markSlotChange(host, entry, undefined, context);
    host.__inactiveSlots__?.delete(entry);
    host.__inactiveSlotOverlays__?.delete(entry);
    return;
  }
  const result = createExitSlotOverlay(
    node,
    readDepartingAncestorPolicy(context, node),
    applyPolicy,
    undefined,
    context,
  );
  node.__retainedSourceOverlay__ = result.overlay;
  markSlotChange(
    host,
    entry,
    context.enteredNodes.has(node) ? undefined : node,
  );
  if (!result.canRetain) {
    host.__inactiveSlots__?.delete(entry);
    host.__inactiveSlotOverlays__?.delete(entry);
    return;
  }
  const instance = result.isCompacted
    ? cloneSlotSubtree(
        host,
        entry,
        node,
        context,
        false,
        context.compactedSlotSources,
      )
    : node;
  const slots: InactiveSlots<Self> = (host.__inactiveSlots__ ??= new Map());
  slots.set(entry, instance);
  if (result.overlay) {
    const overlays: InactiveSlotOverlays = (host.__inactiveSlotOverlays__ ??=
      new Map());
    overlays.set(entry, result.overlay);
  } else host.__inactiveSlotOverlays__?.delete(entry);
};
