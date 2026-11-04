import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { writeSlotPath } from '../slots/writeSlotPath';
import { getInactiveValuePath } from './getInactiveValuePath';

/**
 * Apply resolved JSON only after all exit slots have retained their sources.
 * @param context - Final retained slots and sparse successful resolver results
 * @returns Nothing; ancestor replacements precede more specific descendant writes
 */
export const applyInactiveValues = <Self extends FieldNodeRecord<Self>>(
  context: SettlementContext<Self>,
): void => {
  if (!context.inactiveValueOverrides) return;
  const overrides = [...context.inactiveValueOverrides].sort(
    ([left], [right]) => left.depth - right.depth,
  );
  for (const [node, value] of overrides) {
    const path = getInactiveValuePath(node, context);
    if (path === undefined) continue;
    writeSlotPath(context.root, path, node.blueprintNode, value, true, context);
  }
};
