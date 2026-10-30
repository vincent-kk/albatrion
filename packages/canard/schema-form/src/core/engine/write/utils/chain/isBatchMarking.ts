import type { FieldNodeRecord } from '../../../record';

/**
 * Tell whether a write on a node is marked for the batch end instead of applied now.
 * A detached write is refused before marking and has no source or delivery effect (NODE-044).
 * @param node - Write target
 * @returns Whether a batch is open and the target is live
 */
export const isBatchMarking = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): boolean => !!node.rootNode.runtime.batchDepth && !node.detached;
