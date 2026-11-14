import type { ArrayOperation, FieldNodeRecord } from '../../../record';
import { arrangeFieldNodeItems } from '../../../settle';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { isBatchMarking } from '../chain/isBatchMarking';
import { markBatchArrayOperation } from '../chain/markBatchArrayOperation';
import { refuseDetachedWrite } from '../report/refuseDetachedWrite';

/** Array operation that empties the array. */
const CLEAR_OPERATION: ArrayOperation = { kind: 'clear' };

/**
 * Clear an array within the public entry chain; refused feedback does no work.
 * @param node - Array host or a record whose arrange slot throws on non-array use
 * @returns Undefined after clearing or a no-op; undefined when entry is refused
 * @throws Non-array or settlement failures at the outer chain end
 */
export const dispatchClear = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): unknown => {
  if (refuseDetachedWrite(node)) return;
  if (!enterFieldNodeChain(node)) return;
  try {
    return isBatchMarking(node)
      ? markBatchArrayOperation(node, CLEAR_OPERATION)
      : arrangeFieldNodeItems(node, CLEAR_OPERATION);
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitFieldNodeChain(node);
  }
  return undefined;
};
