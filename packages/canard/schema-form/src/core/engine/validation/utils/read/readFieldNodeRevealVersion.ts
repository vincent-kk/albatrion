import type { FieldNodeRecord } from '../../../record';

/** Read binding-only eligibility history or its stable release snapshot.
 * @param node - Occurrence sharing the current root runtime.
 * @returns The stored history or version; non-OnChange histories are ignored. */
export const readFieldNodeRevealVersion = <Self extends FieldNodeRecord<Self>>(
  node: Self,
) => node.rootNode.runtime.revealReleaseVersion ?? 0;
