import type { FieldNodeRecord } from '../../../record';

/** Read the root release version used as a candidate's snapshot.
 * @param node - Occurrence sharing the current root runtime.
 * @returns The root release version, or 0 before the first release. */
export const readFieldNodeRevealVersion = <Self extends FieldNodeRecord<Self>>(
  node: Self,
) => node.rootNode.runtime.revealReleaseVersion ?? 0;
