import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getRetainedChildEntry } from './getRetainedChildEntry';
import { getSlotBinding } from './getSlotBinding';
import { markSlotChange } from './markSlotChange';
import { restoreTransferredSlotSource } from './restoreTransferredSlotSource';

/**
 * Restore a structural destination's exact retained kind before composed replay.
 * @param node - Newly created destination under the moved source's current owner
 * @param context - Current structural settlement and candidate publication work
 * @returns Whether an exact source supplied the destination's input
 */
export const replayTransferredSlotInput = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): boolean => {
  const host = node.__parent__;
  if (!host) return false;
  const entry = getRetainedChildEntry(host, node.name, node.blueprintNode);
  if (!entry) return false;
  const binding = getSlotBinding(host, entry);
  const instance = host.__inactiveSlots__?.get(binding);
  const overlay = host.__inactiveSlotOverlays__?.get(binding);
  if (!instance && !overlay) return false;
  restoreTransferredSlotSource(node, instance, overlay, context);
  markSlotChange(host, binding, undefined, context);
  host.__inactiveSlots__?.delete(binding);
  host.__inactiveSlotOverlays__?.delete(binding);
  return true;
};
