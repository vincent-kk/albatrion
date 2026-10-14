import type { FieldNodeRecord } from '../../../record';
import { arrangeFieldNodeItems } from '../../../settle';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { markBatchArrayOperation } from '../chain/markBatchArrayOperation';

/**
 * Update an array within the public entry chain; refused feedback does no work.
 * @param node - Array host or a record whose arrange slot throws on non-array use
 * @param index - Integer position in the current or batch-marked array
 * @param value - Caller input for the new or updated position
 * @returns Updated value, or undefined for an invalid position; undefined when entry is refused
 * @throws Non-array or settlement failures at the outer chain end
 */
export const dispatchUpdate = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  index: number,
  value: unknown,
): unknown => {
  if (!enterFieldNodeChain(node)) return;
  try {
    return node.rootNode.runtime.batchDepth
      ? markBatchArrayOperation(node, { kind: 'update', index, value })
      : arrangeFieldNodeItems(node, { kind: 'update', index, value });
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitFieldNodeChain(node);
  }
  return undefined;
};
