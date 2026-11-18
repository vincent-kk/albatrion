import type { ArrayOperation, FieldNodeRecord } from '../../../record';
import { arrangeFieldNodeItems } from '../../../settle';
import { refuseDetachedWrite } from '../report/refuseDetachedWrite';
import { flushBatchWrites } from './flushBatchWrites';

/**
 * Apply an array arrangement within the existing batch delivery boundary.
 * @param node - Array host whose preceding marks settle before its arrangement.
 * @param operation - Public array verb evaluated at this call site.
 * @returns The ordinary arrangement result; retired targets remain unwritable.
 * @throws Arrangement failures propagate through the enclosing batch callback.
 */
export const markBatchArrayOperation = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  operation: ArrayOperation,
): unknown => {
  const root = node.rootNode;
  if (root.runtime.batchWrites?.length) flushBatchWrites(root);
  if (refuseDetachedWrite(node)) return undefined;
  return arrangeFieldNodeItems(node, operation);
};
