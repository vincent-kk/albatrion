import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { restoreSlotSources } from '../slots/restoreSlotSources';
import { restoreArrayStructure } from './restoreArrayStructure';

/**
 * Withdraw structural and slot changes for detached fill bindings.
 * @param context - Settlement with pending structural and latent changes
 * @returns Nothing; discarded fills no longer own a working input
 */
export const withdrawDetachedFills = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  for (const node of context.filledNodes) {
    if (!node.isDetached) continue;
    if (node.behavior.type === 'array') restoreArrayStructure(context, node);
    restoreSlotSources(context, node.path);
    context.changedSource.delete(node.path);
    context.writtenInputs.delete(node);
  }
};
