import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
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
  for (const pending of context.pendingExits.values())
    if (
      isDescendantPath(pending.path, node.path) &&
      pending.raw !== undefined &&
      !context.filledNodes.has(pending)
    )
      return false;

  const childrenToCheck = node.children ?? [];
  for (let index = 0, count = childrenToCheck.length; index < count; index++) {
    const child = childrenToCheck[index];

    if (!isMissingRaw(child, context)) {
      return false;
    }
  }

  return true;
};
