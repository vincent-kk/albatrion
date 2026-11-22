import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';

/**
 * Tell whether a node the derive decision saw live is still in the live tree when its write is
 * applied: the compute after an earlier overlapping winner can make it or an ancestor leave.
 * @param node - Occurrence resolved when the round was evaluated
 * @param context - Settlement holding the pending exits
 * @returns Whether every link from the node to the root is still a live child link
 */
export const isLiveOccurrence = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): boolean => {
  if (node.isDetached) return false;
  if (context.pendingExits.size === 0) return true;
  for (let current = node; current.parent; current = current.parent)
    if (current.parent.childrenByName?.[current.name] !== current) return false;
  return true;
};
