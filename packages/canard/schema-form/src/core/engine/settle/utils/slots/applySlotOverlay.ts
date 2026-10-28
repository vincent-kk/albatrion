import { isArray } from '@winglet/common-utils/filter';
import { hasOwnProperty } from '@winglet/common-utils/lib';

import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { markWrite } from '../input/markWrite';
import { getRetainedChildEntry } from './getRetainedChildEntry';
import { markRestoredSlotRaw } from './markRestoredSlotRaw';

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
  markRestoredSlotRaw(node, context);
  const ownsRaw = hasOwnProperty(overlay, 'raw');
  const arrayInput =
    ownsRaw &&
    node.behavior.type === 'array' &&
    node.behavior.strategy === 'branch' &&
    isArray(overlay.raw);
  if (arrayInput) {
    markWrite(node, overlay.raw, context);
    if (overlay.children?.size) {
      const names: string[] = [];
      for (const entry of overlay.children.keys())
        if (!names.includes(entry.name)) names.push(entry.name);
      const distribution = context.distributedInputs.get(node);
      if (distribution)
        context.distributedInputs.set(node, {
          ...distribution,
          retainedItemNames: names,
        });
    }
  } else if (ownsRaw || overlay.replace) {
    node.raw = ownsRaw ? overlay.raw : undefined;
  }
  if (
    hasOwnProperty(overlay, 'undeclaredValues') ||
    (overlay.replace && !arrayInput)
  )
    node.undeclaredValues = overlay.undeclaredValues;
  if (overlay.itemCount !== undefined) node.itemCount = overlay.itemCount;
  else if (
    overlay.replace &&
    node.behavior.type === 'array' &&
    !isArray(overlay.raw)
  )
    node.itemCount = 0;
  if (overlay.replace) {
    node.inactiveSlotOverlays?.clear();
    for (const entry of node.inactiveSlots?.keys() ?? [])
      if (!overlay.children?.has(entry)) node.inactiveSlots?.delete(entry);
  }
  for (const child of node.children ?? []) {
    if (child.parent !== node) continue;
    const entry = getRetainedChildEntry(node, child.name, child.blueprintNode);
    if (!entry) continue;
    const patch = overlay.children?.get(entry);
    if (patch) applySlotOverlay(child, patch, context);
    else if (overlay.replace && !arrayInput)
      applySlotOverlay(child, { replace: true }, context);
  }
  for (const [entry, patch] of overlay.children ?? []) {
    const live = node.structure?.[entry.name];
    if (live?.blueprintNode === entry.node) continue;
    (node.inactiveSlotOverlays ??= new Map()).set(entry, patch);
  }
  markRestoredSlotRaw(node, context);
  context.changedNodes.add(node);
  context.dirtyPaths.add(node.path);
  if (node.behavior.strategy === 'branch')
    context.shapeDirtyPaths.add(node.path);
};
