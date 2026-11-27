import type { FieldNodeRecord } from '../../../record';

/**
 * Read whether a write request or explicit root validation occurred since the current load or activation started.
 * @param node - Occurrence sharing the current validation lifetime's stamps.
 * @returns True when a write request or explicit root validation followed this load or activation start.
 */
export const hasFieldNodeValidationRequest = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
): boolean =>
  (node.rootNode.runtime.validationStamp ?? 0) >
  Math.max(
    node.rootNode.runtime.validationLoadStamp ?? 0,
    node.rootNode.runtime.validationActivationStamp ?? 0,
  );
