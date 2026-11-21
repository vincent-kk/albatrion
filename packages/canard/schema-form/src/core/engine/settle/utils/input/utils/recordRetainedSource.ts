import type { Distribution, FieldNodeRecord } from '../../../../record';
import type { SettlementContext } from '../../../types/settlement';
import { getSourceBoundary } from '../../source/getSourceBoundary';

/**
 * Capture a binding's boundary channels once and select its exit source for this write.
 * @param node - Live binding about to receive interpreted automatic input
 * @param context - Settlement local to the binding's current write segment
 * @param origin - Named input from a rule or revival, when the write has one
 * @param order - The original application order carried through distribution
 * @returns Nothing; a named input supersedes any preceding fill at this binding
 */
export const recordRetainedSource = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
  origin: Distribution['writeOrigin'],
  order: number,
): void => {
  if (origin !== undefined) context.filledNodes.delete(node);
  const retained = getSourceBoundary(node, context);
  retained.hasAutomaticWrite = true;
  retained.writeOrder = order;
  retained.writeOrigin = origin;
  retained.shouldUseBaseline = context.filledNodes.has(node);
};
