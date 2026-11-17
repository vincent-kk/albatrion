import type { FieldNodeRecord } from '../../../record';

/**
 * Open the batch that a `visitSubtree` walk closes, held by one extra entry depth.
 * @param node - Entry that opens the batch; the walk exits the chain through it
 * @returns Nothing; later writes are only marked until the outermost walk ends
 */
export const openVisitBatch = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): void => {
  const runtime = node.rootNode.runtime;
  runtime.entryDepth = (runtime.entryDepth ?? 0) + 1;
  runtime.batchDepth = 1;
  runtime.visitBatchEntry = node;
};
