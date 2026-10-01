import type { SchemaNodeRecord } from '../../../record';
import type { SettlementContext } from '../../type';
import { updateOutput } from './updateOutput';

/**
 * Publish completed child selections before a gate consumes their host value.
 * @param node - Selecting host with an eagerly updated structure
 * @param context - Settlement-local deferred assembly queue
 * @returns Whether a queued host was assembled
 */
export const flushPendingOutput = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): boolean => {
  if (!context.pendingOutputs?.delete(node)) return false;
  node.children = Object.values(node.structure ?? {});
  updateOutput(node, context);
  return true;
};
