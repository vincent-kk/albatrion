import type { FieldNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';

/** Read a node's unreleased eligibility history.
 * @param node - Occurrence sharing the current root runtime.
 * @returns The unreleased node history, or undefined outside OnChange. */
export const readFieldNodeRevealBaseline = <Self extends FieldNodeRecord<Self>>(
  node: Self,
) =>
  (node.rootNode.runtime.validationMode ?? 0) & ValidationMode.OnChange
    ? node.revealBaseline
    : undefined;
