import { find } from '../../../navigation';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';

/**
 * Withdraw source marks borrowed by a clone excluded from the final shape.
 * @param context - Settled clone lifetimes and caller marks retained before restoration
 * @returns Nothing; caller writes and nonempty final sources keep their Refresh marks
 */
export const finalizeRestoredSlotSource = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  for (const [node, preceding] of context.slotRestoredSource ?? []) {
    if (!node.detached || preceding) continue;
    const live = find(context.root, node.path);
    if (
      live &&
      live !== node &&
      live.source === undefined &&
      live.extras === undefined &&
      !(live.behavior.type === 'array' && live.itemCount > 0)
    )
      context.changedSource.delete(node.path);
  }
};
