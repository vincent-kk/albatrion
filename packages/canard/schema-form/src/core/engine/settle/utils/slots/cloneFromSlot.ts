import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { applySlotOverlay } from './applySlotOverlay';
import { cloneSlotSubtree } from './cloneSlotSubtree';
import { markSlotChange } from './markSlotChange';

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
  const node = cloneSlotSubtree(host, entry, source, context, true);
  const overlay = host.inactiveSlotOverlays?.get(entry);
  if (overlay) applySlotOverlay(node, overlay, context);
  markSlotChange(host, entry, undefined, context);
  host.inactiveSlots?.delete(entry);
  host.inactiveSlotOverlays?.delete(entry);
  return node;
};
