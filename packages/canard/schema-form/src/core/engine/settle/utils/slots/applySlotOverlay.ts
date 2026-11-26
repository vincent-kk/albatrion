import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { isEmptyItemNull } from '../input/isEmptyItemNull';
import { markWrite } from '../input/markWrite';
import { getRetainedChildEntry } from './getRetainedChildEntry';
import { markRestoredSlotSource } from './markRestoredSlotSource';

/** Annotates the lazily created `__inactiveSlotOverlays__`; an argument-less `new Map()` would be `Map<any, any>`. */
type InactiveSlotOverlays = Map<BlueprintChildEntry, InactiveSlotOverlay>;

/**
 * Apply a host-owned patch only to a newly issued instance subtree.
 * @param node - Fresh clone or blueprint occurrence, never the retained source
 * @param overlay - Interpreted channels and candidate-specific descendant patches
 * @param context - Current write distribution, entry, and recalculation work
 * @returns Nothing; inactive child patches remain owned by the new host
 */
export const applySlotOverlay = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  overlay: InactiveSlotOverlay,
  context: SettlementContext<Self>,
): void => {
  markRestoredSlotSource(node, context);
  const ownsSource = hasOwnProperty(overlay, 'source');
  const arrayInput =
    ownsSource &&
    node.behavior.type === 'array' &&
    node.behavior.strategy === 'branch' &&
    isArray(overlay.source);
  if (arrayInput) {
    markWrite(node, overlay.source, context);
    if (overlay.children?.size) {
      const names: string[] = [];
      for (const entry of overlay.children.keys())
        if (names.indexOf(entry.name) === -1) names.push(entry.name);
      const distribution = context.distributedInputs.get(node);
      if (distribution)
        context.distributedInputs.set(node, {
          ...distribution,
          retainedItemNames: names,
        });
    }
  } else if (ownsSource || overlay.isWhole) {
    const source = ownsSource ? overlay.source : undefined;
    // A kept null at an empty item position is this settlement's given input, as markWrite
    // records it, so the appearance fill sees a given null rather than a missing source.
    if (source === null && isEmptyItemNull(node)) {
      node.source = undefined;
      context.writtenInputs.set(node, null);
    } else node.source = source;
  }
  if (hasOwnProperty(overlay, 'extras') || (overlay.isWhole && !arrayInput))
    node.extras = overlay.extras;
  if (overlay.itemCount !== undefined) node.__itemCount__ = overlay.itemCount;
  else if (
    overlay.isWhole &&
    node.behavior.type === 'array' &&
    !isArray(overlay.source)
  )
    node.__itemCount__ = 0;
  if (overlay.isWhole) {
    node.__inactiveSlotOverlays__?.clear();
    for (const entry of node.__inactiveSlots__?.keys() ?? [])
      if (!overlay.children?.has(entry)) node.__inactiveSlots__?.delete(entry);
  }
  for (const child of node.children ?? []) {
    if (child.__parent__ !== node) continue;
    const entry = getRetainedChildEntry(node, child.name, child.blueprintNode);
    if (!entry) continue;
    const patch = overlay.children?.get(entry);
    if (patch) applySlotOverlay(child, patch, context);
    else if (overlay.isWhole && !arrayInput)
      applySlotOverlay(child, { isWhole: true }, context);
  }
  for (const [entry, patch] of overlay.children ?? []) {
    const live = node.__childrenByName__?.[entry.name];
    if (live?.blueprintNode === entry.node) continue;
    const overlays: InactiveSlotOverlays = (node.__inactiveSlotOverlays__ ??=
      new Map());
    overlays.set(entry, patch);
  }
  markRestoredSlotSource(node, context);
  context.changedNodes.add(node);
  context.dirtyPaths.add(node.path);
  if (node.behavior.strategy === 'branch')
    context.shapeDirtyPaths.add(node.path);
};
