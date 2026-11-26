import { isDescendantPath } from '@/schema-form/helpers/jsonPointer';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { hasSlotOverlaySource } from '../slots/hasSlotOverlaySource';

/**
 * Recognize a branch with no own or any-kind descendant source (26C-14).
 * A leaf whose input in this settlement was null is given, not missing, even with an undefined
 * source: the only leaf that reads a received null as undefined is an empty array item position
 * (isEmptyItemNull), and its null blocks the defaults of the item and of every ancestor holding it.
 * @param node - Newly appearing occurrence considered for default filling
 * @param context - Settlement whose latent-prefix index covers all kinds and whose written inputs
 *   hold this settlement's original inputs
 * @returns Whether a default may populate this occurrence
 */
export const isMissingSource = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): boolean => {
  if (node.source !== undefined) return false;
  if (node.behavior.strategy !== 'branch')
    return context.writtenInputs.get(node) !== null;
  if (node.extras !== undefined || node.__inactiveSlots__?.size) return false;
  for (const overlay of node.__inactiveSlotOverlays__?.values() ?? [])
    if (hasSlotOverlaySource(overlay)) return false;
  for (const pending of context.pendingExits.values())
    if (
      isDescendantPath(pending.path, node.path) &&
      pending.source !== undefined &&
      !context.filledNodes.has(pending)
    )
      return false;

  const childrenToCheck = node.children ?? [];
  for (let index = 0, count = childrenToCheck.length; index < count; index++) {
    const child = childrenToCheck[index];

    if (!isMissingSource(child, context)) {
      return false;
    }
  }

  return true;
};
