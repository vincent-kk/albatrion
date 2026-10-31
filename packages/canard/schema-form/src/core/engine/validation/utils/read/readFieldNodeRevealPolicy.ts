import type { FieldNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';

/** Read the committed Form policy and its unreleased prior values.
 * @param node - Occurrence sharing the current root runtime.
 * @returns The committed policy and prior values, or undefined outside OnChange. */
export const readFieldNodeRevealPolicy = <Self extends FieldNodeRecord<Self>>(
  node: Self,
) =>
  (node.rootNode.runtime.validationMode ?? 0) & ValidationMode.OnChange
    ? node.rootNode.runtime.revealPolicy
    : undefined;
