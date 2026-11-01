import type { Nullable } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { restoreSlotSources } from '../slots/restoreSlotSources';
import { restoreArrayStructure } from './restoreArrayStructure';

/**
 * Withdraw automatic writes throughout every finally detached filled subtree.
 * @param context - Settlement with original node and latent source logs
 * @returns Nothing; detached records retain their pre-fill sources
 */
export const withdrawDetachedFills = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  for (const node of context.filledNodes) {
    if (!node.detached) continue;
    restoreArrayStructure(context, node);
    restoreSlotSources(context, node.path);
    for (let index = context.automaticLog.length - 1; index >= 0; index--) {
      const entry = context.automaticLog[index];
      let ancestor: Nullable<Self> = entry.node;
      while (ancestor && ancestor !== node) ancestor = ancestor.parent;
      if (!ancestor) continue;
      entry.node.raw = entry.previousRaw;
      entry.node.undeclaredValues = entry.previousExtras;
      if (entry.previousDistributed)
        context.distributedInputs.set(entry.node, entry.previousDistributed);
      else context.distributedInputs.delete(entry.node);
      context.changedRaw.delete(entry.node.path);
    }
    context.writtenInputs.delete(node);
  }
};
