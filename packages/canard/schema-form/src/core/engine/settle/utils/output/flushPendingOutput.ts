import { captureFieldNodeChange } from '../../../record';
import type { FieldNodeRecord } from '../../../record';
import type { SettlementContext } from '../../types/settlement';
import { isSameChildList } from '../structure/isSameChildList';
import { updateOutput } from './updateOutput';

/**
 * Publish completed child selections before a gate consumes their host value.
 * @param node - Selecting host with an eagerly updated structure
 * @param context - Settlement-local deferred assembly queue
 * @returns Whether a queued host was assembled
 */
export const flushPendingOutput = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  context: SettlementContext<Self>,
): boolean => {
  if (!context.pendingOutputs?.delete(node)) return false;
  const children = Object.values(node.structure ?? {});
  const published = node.children;
  node.children = captureFieldNodeChange(
    node,
    'children',
    isSameChildList(published, children) ? published : children,
  );
  updateOutput(node, context);
  return true;
};
