import type { SchemaNodeRecord } from '../../../record';
import { arrangeSchemaNodeItems } from '../../../settle';
import { enterSchemaNodeChain } from '../chain/enterSchemaNodeChain';
import { captureChainError } from '../chain/captureChainError';
import { exitSchemaNodeChain } from '../chain/exitSchemaNodeChain';
import { markBatchArrayOperation } from '../chain/markBatchArrayOperation';

/**
 * Update an array within the public entry chain; refused feedback does no work.
 * @param node - Array host or a record whose arrange slot throws on non-array use
 * @param index - Integer position in the current or batch-marked array
 * @param value - Caller input for the new or updated position
 * @returns Updated value, or undefined for an invalid position; undefined when entry is refused
 * @throws Non-array or settlement failures at the outer chain end
 */
export const dispatchUpdate = <Self extends SchemaNodeRecord<Self>>(
  node: Self, index: number, value: unknown,
): unknown => {
  if (!enterSchemaNodeChain(node)) return;
  try {
    return node.rootNode.runtime.batchDepth
      ? markBatchArrayOperation(node, { kind: 'update', index, value })
      : arrangeSchemaNodeItems(node, { kind: 'update', index, value });
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitSchemaNodeChain(node);
  }
  return undefined;
};
