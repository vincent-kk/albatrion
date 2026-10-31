import type { FieldNodeRecord } from '../../../record';

/** Read the pre-verdict node eligibility without changing its lifetime.
 * @param node - Occurrence sharing the current runtime.
 * @returns The recorded baseline or undefined. */
export const readFieldNodeRevealBaseline = <Self extends FieldNodeRecord<Self>>(
  node: Self,
) => node.revealBaseline;
