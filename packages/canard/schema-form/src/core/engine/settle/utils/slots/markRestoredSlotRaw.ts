import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';

/**
 * Mark restoration as a fresh lifetime's own source, including overlay exclusions.
 * @param node - Fresh clone or input-only occurrence with its current restored channels
 * @param context - Caller path marks that an excluded borrowed source must not erase
 * @returns Nothing; Refresh matches restoration into an initially empty occurrence
 */
export const markRestoredSlotRaw = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): void => {
  const preceding = (context.slotRestoredRaw ??= new Map());
  if (!preceding.has(node))
    preceding.set(node, context.changedRaw.has(node.path));
  if (
    node.raw !== undefined ||
    node.undeclaredValues !== undefined ||
    (node.behavior.type === 'array' && node.itemCount > 0)
  ) {
    context.changedRaw.add(node.path);
    context.changedNodes.add(node);
  } else if (!preceding.get(node)) context.changedRaw.delete(node.path);
};
