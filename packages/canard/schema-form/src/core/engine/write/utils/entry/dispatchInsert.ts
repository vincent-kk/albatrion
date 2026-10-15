import type { FieldNodeRecord } from '../../../record';
import { arrangeFieldNodeItems, readArrayLength } from '../../../settle';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { isBatchMarking } from '../chain/isBatchMarking';
import { markBatchArrayOperation } from '../chain/markBatchArrayOperation';

/**
 * Insert into an array within the public entry chain; refused feedback does no work.
 * @param node - Array host or a record whose arrange slot throws on non-array use
 * @param index - Integer position in [0, length] of the current or batch-marked array; length appends like push
 * @param value - Caller input for the new position; undefined lets the new item fill
 * @returns Length after the call: the proposed or settled length, or the unchanged current length when entry is refused, the index is out of range, or a nested call fails
 * @throws Non-array or settlement failures at the outer chain end
 */
export const dispatchInsert = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  index: number,
  value?: unknown,
): number => {
  if (!enterFieldNodeChain(node)) return readArrayLength(node);
  try {
    const length = isBatchMarking(node)
      ? markBatchArrayOperation(node, { kind: 'insert', index, value })
      : arrangeFieldNodeItems(node, { kind: 'insert', index, value });
    if (typeof length === 'number') return length;
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitFieldNodeChain(node);
  }
  return readArrayLength(node);
};
