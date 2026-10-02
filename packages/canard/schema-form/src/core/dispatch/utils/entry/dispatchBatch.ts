import type { SchemaNodeRecord } from '../../../record';
import { enterSchemaNodeChain } from '../chain/enterSchemaNodeChain';
import { captureChainError } from '../chain/captureChainError';
import { exitSchemaNodeChain } from '../chain/exitSchemaNodeChain';
import { flushBatchWrites } from '../chain/flushBatchWrites';
import { resolveSchemaNodeChainRoot } from '../chain/resolveSchemaNodeChainRoot';

/**
 * Group synchronous caller writes into one outer delivery boundary.
 * Updaters run at their call site against prior marked values; ordinary reads
 * continue to return the preceding committed value until this callback ends.
 * 배열 동사(`push`·`pop`·`update`·`remove`·`clear`)도 부른 자리에서 앞선 표시를 얹은 배열로 계산해 동기 결과를 돌려주고 결과 배열을 표시하며, 배치 끝의 정착은 통째 쓰기라 아이템 키는 위치로 잇는다.
 * @param node - Any occurrence in the tree being batched
 * @param fn - Synchronous writes to mark, including nested batches
 * @returns Nothing; a thrown callback is rethrown after marked work commits
 */
export const dispatchBatch = <Self extends SchemaNodeRecord<Self>>(
  node: Self, fn: () => void,
): void => {
  if (!enterSchemaNodeChain(node)) return;
  const runtime = node.rootNode.runtime;
  runtime.batchDepth = (runtime.batchDepth ?? 0) + 1;
  try { fn(); }
  catch (error) {
    if ((runtime.batchDepth ?? 0) > 1) throw error;
    captureChainError(runtime, error);
  }
  finally {
    const activeRoot = resolveSchemaNodeChainRoot(node.rootNode);
    const active = activeRoot.runtime;
    active.batchDepth = (active.batchDepth ?? 1) - 1;
    if (!active.batchDepth) flushBatchWrites(activeRoot);
    exitSchemaNodeChain(node);
  }
};
