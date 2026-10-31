import type { FieldNodeRecord } from '../../../record';

/**
 * Read whether a write request or explicit root validation fulfilled mount validation.
 * @param node - Occurrence sharing the mounted tree's validation stamp.
 * @returns True for a positive stamp; a subtree-only initial stamp of zero is false.
 */
export const hasFieldNodeValidationRequest = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
): boolean => (node.rootNode.runtime.validationStamp ?? 0) > 0;
