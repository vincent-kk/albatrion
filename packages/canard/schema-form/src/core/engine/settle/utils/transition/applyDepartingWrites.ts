import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { getInactiveValuePath } from '../inactive/getInactiveValuePath';
import { writeSlotPath } from '../slots/writeSlotPath';

/**
 * Write the declarative values named for departed children into their retained slots.
 * Runs after the exit policy and the resolver results, so a named value wins over both, while a
 * child the write omitted keeps what the policy left (WRITE-079).
 * @param context - Settlement whose exits are final and whose derive did not exceed a budget
 * @returns Nothing; ancestors are written before their descendants
 */
export const applyDepartingWrites = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  if (!context.departingWrites) return;
  const writes = [...context.departingWrites].sort(
    ([left], [right]) => left.depth - right.depth,
  );
  for (const [node, value] of writes) {
    if (!node.isDetached) continue;
    const path = getInactiveValuePath(node, context);
    if (path === undefined) continue;
    writeSlotPath(context.root, path, node.blueprintNode, value, true, context);
  }
};
