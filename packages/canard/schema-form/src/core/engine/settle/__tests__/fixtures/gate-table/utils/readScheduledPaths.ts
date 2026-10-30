import type { FieldNodeRecord } from '../../../../../record';
import type { SettlementContext } from '../../../../types/settlement';
import { DirtyPathSet } from '../../../../utils/scratch/DirtyPathSet';

/**
 * Observe logical dirty members from actual node generations in original order.
 * @param context - Marked registration before computation consumes its members
 * @returns The same scheduling paths regardless of the physical scratch format
 */
export const readScheduledPaths = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): string[] => {
  if (context.writeEpoch === undefined) return [...context.dirtyPaths];
  const dirty = new DirtyPathSet(new Map());
  dirty.beginPostOrder();
  for (const node of context.writtenInputs.keys())
    if (node.writeEpoch === context.writeEpoch) dirty.add(node.path);
  for (const path of context.dirtyPaths) dirty.add(path);
  return [...dirty];
};
