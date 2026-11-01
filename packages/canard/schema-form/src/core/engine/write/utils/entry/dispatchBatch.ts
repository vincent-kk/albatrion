import type { FieldNodeRecord } from '../../../record';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { flushBatchWrites } from '../chain/flushBatchWrites';
import { resolveFieldNodeChainRoot } from '../chain/resolveFieldNodeChainRoot';

/**
 * Group synchronous caller writes into one outer delivery boundary.
 * Updaters run at their call site against prior marked values; ordinary reads
 * continue to return the preceding committed value until this callback ends.
 * Array verbs (`push`, `pop`, `update`, `remove`, `clear`) also compute their
 * array at the call site on top of prior marks, return the synchronous result
 * and mark the resulting array. Settlement at the end of the batch runs once
 * from the root, its replacement scope is the union of the written paths, and
 * item keys under a written array host carry over by position (191C-01).
 * @param node - Any occurrence in the tree being batched
 * @param fn - Synchronous writes to mark, including nested batches
 * @param origin - Internal load binding override; public batches use write
 * @returns Nothing; a thrown callback is rethrown after marked work commits
 */
export const dispatchBatch = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  fn: () => void,
  origin: 'load' | 'write' = 'write',
): void => {
  if (!enterFieldNodeChain(node, origin)) return;
  const runtime = node.rootNode.runtime;
  runtime.batchDepth = (runtime.batchDepth ?? 0) + 1;
  try {
    fn();
  } catch (error) {
    const active = resolveFieldNodeChainRoot(node.rootNode).runtime;
    if ((active.batchDepth ?? 0) > 1) throw error;
    captureChainError(active, error);
  } finally {
    const activeRoot = resolveFieldNodeChainRoot(node.rootNode);
    const active = activeRoot.runtime;
    active.batchDepth = (active.batchDepth ?? 1) - 1;
    if (!active.batchDepth) flushBatchWrites(activeRoot);
    exitFieldNodeChain(node);
  }
};
