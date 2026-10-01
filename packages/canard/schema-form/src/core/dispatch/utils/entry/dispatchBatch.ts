import type { SchemaNodeRecord } from '../../../record';
import { enterSchemaNodeChain } from '../chain/enterSchemaNodeChain';
import { exitSchemaNodeChain } from '../chain/exitSchemaNodeChain';
import { flushBatchWrites } from '../chain/flushBatchWrites';
import { resolveSchemaNodeChainRoot } from '../chain/resolveSchemaNodeChainRoot';

/**
 * Group synchronous caller writes into one outer delivery boundary.
 * Updaters run at their call site against prior marked values; ordinary reads
 * continue to return the preceding committed value until this callback ends.
 * @param node - Any occurrence in the tree being batched
 * @param fn - Synchronous writes to mark, including nested batches
 * @returns Nothing; a thrown callback is rethrown after marked work commits
 */
export const dispatchBatch = <Self extends SchemaNodeRecord<Self>>(
  node: Self, fn: () => void,
): void => {
  enterSchemaNodeChain(node);
  const runtime = node.rootNode.runtime;
  runtime.batchDepth = (runtime.batchDepth ?? 0) + 1;
  try { fn(); }
  catch (error) {
    if ((runtime.batchDepth ?? 0) > 1) throw error;
    runtime.chainErrors?.push(error);
  }
  finally {
    const activeRoot = resolveSchemaNodeChainRoot(node.rootNode);
    const active = activeRoot.runtime;
    active.batchDepth = (active.batchDepth ?? 1) - 1;
    if (!active.batchDepth) flushBatchWrites(activeRoot);
    exitSchemaNodeChain(node);
  }
};
