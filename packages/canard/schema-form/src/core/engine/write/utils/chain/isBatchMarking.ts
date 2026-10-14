import type { FieldNodeRecord } from '../../../record';

/**
 * Tell whether a write on a node is marked for the batch end instead of applied now.
 * A detached node's write is never marked: it only fixes the root's latent source for its
 * path and kind and emits nothing (NODE-044), so it applies at once, as outside a batch.
 * @param node - Write target
 * @returns Whether a batch is open and the target is live
 */
export const isBatchMarking = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): boolean => !!node.rootNode.runtime.batchDepth && !node.detached;
