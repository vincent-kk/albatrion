import type { FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';

/**
 * Restore the original dirty insertion order when a marked host changes shape.
 * @param context - Whole write whose existing writtenInputs preserve marking order
 * @returns Nothing; all subsequent marking and computation use the general path
 */
export const restoreWriteEpochPaths = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  const epoch = context.writeEpoch;
  context.writeEpoch = undefined;
  for (const node of context.writtenInputs.keys())
    if (node.writeEpoch === epoch) context.dirtyPaths.add(node.path);
};
