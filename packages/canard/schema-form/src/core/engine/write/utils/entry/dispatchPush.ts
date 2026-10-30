import type { FieldNodeRecord } from '../../../record';
import { arrangeFieldNodeItems, readArrayLength } from '../../../settle';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { isBatchMarking } from '../chain/isBatchMarking';
import { markBatchArrayOperation } from '../chain/markBatchArrayOperation';
import { refuseDetachedWrite } from '../report/refuseDetachedWrite';

/**
 * Push an array within the public entry chain; refused feedback does no work.
 * @param node - Array host or a record whose arrange slot throws on non-array use
 * @param value - Caller input for the new or updated position
 * @returns Length after the call: the proposed or settled length, or the unchanged current length when entry is refused or a nested call fails
 * @throws Non-array or settlement failures at the outer chain end
 */
export const dispatchPush = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  value?: unknown,
): number => {
  if (refuseDetachedWrite(node)) return readArrayLength(node);
  if (!enterFieldNodeChain(node)) return readArrayLength(node);
  try {
    const length = isBatchMarking(node)
      ? markBatchArrayOperation(node, { kind: 'push', value })
      : arrangeFieldNodeItems(node, { kind: 'push', value });
    if (typeof length === 'number') return length;
  } catch (error) {
    if (node.rootNode.runtime.batchDepth) throw error;
    captureChainError(node.rootNode.runtime, error);
  } finally {
    exitFieldNodeChain(node);
  }
  return readArrayLength(node);
};
