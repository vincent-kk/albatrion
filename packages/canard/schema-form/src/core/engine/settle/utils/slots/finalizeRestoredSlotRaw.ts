import { find } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';

/**
 * Withdraw source marks borrowed by a clone excluded from the final shape.
 * @param context - Settled clone lifetimes and caller marks retained before restoration
 * @returns Nothing; caller writes and nonempty final sources keep their Refresh marks
 */
export const finalizeRestoredSlotRaw = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  for (const [node, preceding] of context.slotRestoredRaw ?? []) {
    if (!node.detached || preceding) continue;
    const live = find(context.root, node.path);
    if (
      live &&
      live !== node &&
      live.raw === undefined &&
      live.undeclaredValues === undefined &&
      !(live.behavior.type === 'array' && live.itemCount > 0)
    )
      context.changedRaw.delete(node.path);
  }
};
