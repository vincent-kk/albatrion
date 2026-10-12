import type { SchemaNodeRecord } from '../../../record';
import { arrangeSchemaNodeItems } from '../../../settle';
import { enterSchemaNodeChain } from '../chain/enterSchemaNodeChain';
import { captureChainError } from '../chain/captureChainError';
import { exitSchemaNodeChain } from '../chain/exitSchemaNodeChain';
import { markBatchArrayOperation } from '../chain/markBatchArrayOperation';

/**
 * Remove an array within the public entry chain; refused feedback does no work.
 * @param node - Array host or a record whose arrange slot throws on non-array use
 * @param index - Integer position in the current or batch-marked array
 * @returns Removed marked raw in a batch, otherwise the settled removed value; undefined when entry is refused
 * @throws Non-array or settlement failures at the outer chain end
 */
export const dispatchRemove = <Self extends SchemaNodeRecord<Self>>(
  node: Self, index: number,
): unknown => {
  if (!enterSchemaNodeChain(node)) return;
  try {
    return node.rootNode.runtime.batchDepth
      ? markBatchArrayOperation(node, { kind: 'remove', index })
      : arrangeSchemaNodeItems(node, { kind: 'remove', index });
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitSchemaNodeChain(node);
  }
  return undefined;
};
