import type { Fn } from '@aileron/declare';

import type { FieldNodeRecord } from '../../../record';
import { captureChainError } from '../chain/captureChainError';
import { enterFieldNodeChain } from '../chain/enterFieldNodeChain';
import { exitFailedFieldNodeChain } from '../chain/exitFailedFieldNodeChain';
import { exitFieldNodeChain } from '../chain/exitFieldNodeChain';
import { flushBatchWrites } from '../chain/flushBatchWrites';
import { resolveFieldNodeChainRoot } from '../chain/resolveFieldNodeChainRoot';

/**
 * Group synchronous caller writes into one outer delivery boundary.
 * Updaters run at their call site against prior marks; scalar reads retain the
 * committed value until those marks settle. Array verbs and subtree resets first settle
 * prior marks; array verbs then arrange live items, preserving surviving item identity, and
 * resets load. Reads after either see that commit. Deliveries, validation requests
 * and onChange remain collected at the outer batch boundary, including on failure.
 * @param node - Any occurrence in the tree being batched
 * @param fn - Synchronous writes to mark, including nested batches
 * @param origin - Internal load binding override; public batches use write
 * @returns Nothing; a thrown callback is rethrown after marked work commits
 */
export const dispatchBatch = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  fn: Fn,
  origin: 'load' | 'write' = 'write',
): void => {
  if (!enterFieldNodeChain(node, origin)) return;
  const runtime = node.rootNode.runtime;
  runtime.batchDepth = (runtime.batchDepth ?? 0) + 1;
  try {
    fn();
  } catch (error) {
    const activeRuntime = resolveFieldNodeChainRoot(node.rootNode).runtime;
    if ((activeRuntime.batchDepth ?? 0) > 1) throw error;
    captureChainError(activeRuntime, error);
  } finally {
    const activeRoot = resolveFieldNodeChainRoot(node.rootNode);
    const activeRuntime = activeRoot.runtime;
    activeRuntime.batchDepth = (activeRuntime.batchDepth ?? 1) - 1;
    try {
      if (!activeRuntime.batchDepth) flushBatchWrites(activeRoot);
    } catch (error) {
      exitFailedFieldNodeChain(node, error);
    }
    exitFieldNodeChain(node);
  }
};
