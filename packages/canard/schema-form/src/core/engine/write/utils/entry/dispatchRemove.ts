import type { FieldNodeRecord } from '../../../record';
import { arrangeFieldNodeItems } from '../../../settle';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { isBatchMarking } from '../chain/isBatchMarking';
import { markBatchArrayOperation } from '../chain/markBatchArrayOperation';

/**
 * Remove an array within the public entry chain; refused feedback does no work.
 * @param node - Array host or a record whose arrange slot throws on non-array use
 * @param index - Integer position in the current or batch-marked array
 * @returns Removed marked raw in a batch, otherwise the settled removed value; undefined when entry is refused
 * @throws Non-array or settlement failures at the outer chain end
 */
export const dispatchRemove = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  index: number,
): unknown => {
  if (!enterFieldNodeChain(node)) return;
  try {
    return isBatchMarking(node)
      ? markBatchArrayOperation(node, { kind: 'remove', index })
      : arrangeFieldNodeItems(node, { kind: 'remove', index });
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitFieldNodeChain(node);
  }
  return undefined;
};
