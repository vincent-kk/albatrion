import type { FieldNodeRecord } from '../../../record';

/** Read the opaque pre-change Form policy box without changing its lifetime.
 * @param node - Occurrence sharing the current runtime.
 * @returns The recorded baseline or undefined. */
export const readFieldNodeShowErrorBaseline = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
) => node.rootNode.runtime.revealPolicyBaseline;
