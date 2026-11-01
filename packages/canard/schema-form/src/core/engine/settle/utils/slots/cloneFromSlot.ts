import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { createChildNode } from '../compute/createChildNode';
import { applySlotOverlay } from './applySlotOverlay';
import { cloneSlotSubtree } from './cloneSlotSubtree';
import { getSlotBinding } from './getSlotBinding';
import { markSlotChange } from './markSlotChange';
import { restoreTransferredSlotSource } from './restoreTransferredSlotSource';

/**
 * Issue a fresh public lifetime from one retained source candidate.
 * @param host - Live host that will select the clone from its fixed baseline
 * @param entry - Exact child binding whose inactive source is being consumed
 * @param source - Detached instance that must remain detached and unchanged
 * @param context - Current entry, fill, and shape-selection work
 * @returns A new instance subtree with empty interaction, errors, and delivery state
 */
export const cloneFromSlot = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  entry: BlueprintChildEntry,
  source: Self,
  context: SettlementContext<Self>,
): Self => {
  const binding = getSlotBinding(host, entry);
  const overlay = host.inactiveSlotOverlays?.get(binding);
  const same = source.blueprintNode === entry.node;
  const node = same
    ? cloneSlotSubtree(host, entry, source, context, true)
    : createChildNode(host, entry);
  if (same) {
    if (overlay) applySlotOverlay(node, overlay, context);
  } else restoreTransferredSlotSource(node, source, overlay, context);
  markSlotChange(host, binding, undefined, context);
  host.inactiveSlots?.delete(binding);
  host.inactiveSlotOverlays?.delete(binding);
  return node;
};
