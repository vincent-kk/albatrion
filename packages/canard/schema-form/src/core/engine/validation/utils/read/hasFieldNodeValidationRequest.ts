import type { FieldNodeRecord } from '../../../record';

/**
 * Read whether a write request or explicit root validation occurred since the current load started.
 * @param node - Occurrence sharing the current load's validation stamps.
 * @returns True when a write request or explicit root validation followed this load start.
 */
export const hasFieldNodeValidationRequest = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
): boolean =>
  (node.rootNode.runtime.validationStamp ?? 0) >
  (node.rootNode.runtime.validationLoadStamp ?? 0);
