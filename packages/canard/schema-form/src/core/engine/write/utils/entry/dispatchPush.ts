import type { FieldNodeRecord } from '../../../record';
import { arrangeFieldNodeItems } from '../../../settle';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { markBatchArrayOperation } from '../chain/markBatchArrayOperation';

/**
 * Push an array within the public entry chain; refused feedback does no work.
 * @param node - Array host or a record whose arrange slot throws on non-array use
 * @param value - Caller input for the new or updated position
 * @returns Length of the proposed or settled array; undefined when entry is refused
 * @throws Non-array or settlement failures at the outer chain end
 */
export const dispatchPush = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  value?: unknown,
): unknown => {
  if (!enterFieldNodeChain(node)) return;
  try {
    return node.rootNode.runtime.batchDepth
      ? markBatchArrayOperation(node, { kind: 'push', value })
      : arrangeFieldNodeItems(node, { kind: 'push', value });
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitFieldNodeChain(node);
  }
  return undefined;
};
