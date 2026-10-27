import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { hasLiteralStarUnder } from '../literalStarStore/hasLiteralStarUnder';
import { hasSlotOverlaySource } from '../slots/hasSlotOverlaySource';

/**
 * Recognize a branch with no own or any-kind descendant source (26C-14).
 * @param node - Newly appearing occurrence considered for default filling
 * @param context - Settlement whose latent-prefix index covers all kinds
 * @returns Whether a default may populate this occurrence
 */
export const isMissingRaw = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): boolean => {
  if (node.raw !== undefined) return false;
  if (node.behavior.strategy !== 'branch') return true;
  if (node.undeclaredValues !== undefined || node.inactiveSlots?.size)
    return false;
  for (const overlay of node.inactiveSlotOverlays?.values() ?? [])
    if (hasSlotOverlaySource(overlay)) return false;
  const prefix = node.path + '/';
  for (const pending of context.pendingExits.values())
    if (
      pending.path.startsWith(prefix) &&
      pending.raw !== undefined &&
      !context.filledNodes.has(pending)
    )
      return false;
  if (
    context.root.blueprintNode.containsLiteralStar === true &&
    hasLiteralStarUnder(context, node.path)
  )
    return false;
  return (node.children ?? []).every((child) => isMissingRaw(child, context));
};
