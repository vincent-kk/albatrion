import type { FieldNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';

/** Read binding-only eligibility history or its stable release snapshot.
 * @param node - Occurrence sharing the current root runtime.
 * @returns The stored history or version; non-OnChange histories are ignored. */
export const readFieldNodeRevealBaseline = <Self extends FieldNodeRecord<Self>>(
  node: Self,
) =>
  (node.rootNode.runtime.validationMode ?? 0) & ValidationMode.OnChange
    ? node.revealBaseline
    : undefined;
