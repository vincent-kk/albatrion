import type { BlueprintChildEntry } from '../../../blueprint';
import type { FieldNodeRecord, InactiveSlotOverlay } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { createChildNode } from '../compute/createChildNode';
import { applySlotOverlay } from './applySlotOverlay';
import { getSlotBinding } from './getSlotBinding';
import { markSlotChange } from './markSlotChange';

/**
 * Enter a previously unvisited binding from its interpreted inactive input.
 * @param host - Live owner of the input-only patch
 * @param entry - Blueprint binding selected from the fixed baseline
 * @param overlay - Source patch for a candidate without a retained instance
 * @param context - Current entry and recalculation work
 * @returns Fresh blueprint occurrence whose source channels are already restored
 */
export const createFromSlotOverlay = <Self extends FieldNodeRecord<Self>>(
  host: Self,
  entry: BlueprintChildEntry,
  overlay: InactiveSlotOverlay,
  context: SettlementContext<Self>,
): Self => {
  const binding = getSlotBinding(host, entry);
  const node = createChildNode(host, entry);
  applySlotOverlay(node, overlay, context);
  markSlotChange(host, binding, undefined, context);
  host.inactiveSlotOverlays?.delete(binding);
  return node;
};
