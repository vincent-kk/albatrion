import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { setLatentRaw } from '../latent/setLatentRaw';

/**
 * Withdraw automatic writes throughout every finally detached filled subtree.
 * @param context - Settlement with original node and latent source logs
 * @returns Nothing; detached records retain their pre-fill sources
 */
export const withdrawDetachedFills = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  for (const node of context.filledNodes) {
    if (!node.detached) continue;
    for (let index = context.automaticLog.length - 1; index >= 0; index--) {
      const entry = context.automaticLog[index];
      let ancestor: Self | null = entry.node;
      while (ancestor && ancestor !== node) ancestor = ancestor.parent;
      if (!ancestor) continue;
      entry.node.raw = entry.previousRaw;
      entry.node.extras = entry.previousExtras;
      if (entry.previousDistributed)
        context.distributedInputs.set(entry.node, entry.previousDistributed);
      else context.distributedInputs.delete(entry.node);
      context.changedRaw.delete(entry.node.path);
    }
    for (const [key, previous] of context.latentAutomaticLog) {
      const identity: unknown = JSON.parse(key);
      if (!Array.isArray(identity) || typeof identity[0] !== 'string' ||
        identity[0] !== node.path && !identity[0].startsWith(`${node.path}/`)) continue;
      setLatentRaw(context.root.runtime, undefined, key, previous.present,
        previous.value, undefined, undefined, context);
    }
    context.writtenInputs.delete(node);
  }
};
