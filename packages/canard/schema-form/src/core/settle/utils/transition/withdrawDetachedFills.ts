import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { writeLatentRaw } from './writeLatentRaw';

/**
 * Withdraw defaults that no longer belong to the final live shape.
 * @param context - Settlement with original values in its automatic write log
 * @returns Nothing; detached records and latent raw retain their pre-fill values
 */
export const withdrawDetachedFills = <Self extends SchemaNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  for (const node of context.filledNodes) {
    if (!node.detached) continue;
    const first = context.automaticLog.find((entry) => entry.node === node);
    if (!first) continue;
    node.raw = first.previousRaw;
    node.extras = first.previousExtras;
    const key = JSON.stringify([node.path, node.blueprintNode.kind]);
    writeLatentRaw(context, key, first.previousRaw !== undefined, first.previousRaw);
    context.writtenInputs.delete(node);
    context.changedRaw.delete(node.path);
  }
};
