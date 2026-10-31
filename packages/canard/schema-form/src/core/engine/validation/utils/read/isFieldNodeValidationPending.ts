import type { FieldNodeRecord } from '../../../record';

/** Read the current tree's write-verdict lifetime.
 * @param node - Any occurrence sharing the runtime.
 * @returns Whether a write-triggered verdict is pending. */
export const isFieldNodeValidationPending = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
): boolean => node.rootNode.runtime.validationPending === true;
