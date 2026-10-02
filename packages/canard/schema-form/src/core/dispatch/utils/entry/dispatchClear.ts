import type { SchemaNodeRecord } from '../../../record';
import { arrangeSchemaNodeItems } from '../../../settle';
import { enterSchemaNodeChain } from '../chain/enterSchemaNodeChain';
import { captureChainError } from '../chain/captureChainError';
import { exitSchemaNodeChain } from '../chain/exitSchemaNodeChain';
import { markBatchArrayOperation } from '../chain/markBatchArrayOperation';

/**
 * Clear an array within the public entry chain; refused feedback does no work.
 * @param node - Array host or a record whose arrange slot throws on non-array use
 * @returns Undefined after clearing or a no-op; undefined when entry is refused
 * @throws Non-array or settlement failures at the outer chain end
 */
export const dispatchClear = <Self extends SchemaNodeRecord<Self>>(
  node: Self,
): unknown => {
  if (!enterSchemaNodeChain(node)) return;
  try {
    return node.rootNode.runtime.batchDepth
      ? markBatchArrayOperation(node, { kind: 'clear' })
      : arrangeSchemaNodeItems(node, { kind: 'clear' });
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitSchemaNodeChain(node);
  }
  return undefined;
};
