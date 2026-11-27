import type { Fn } from '@aileron/declare';

import { type FieldNode, readFieldNodeRevealVersion } from '@/schema-form/core';

import { isErrorRevealed } from './isErrorRevealed';

/**
 * Resolve display eligibility without allocating a result object on each render.
 * @param node - Source occurrence, including its current presence and state.
 * @param check - Current form policy checker.
 * @param policy - Rendered policy used by the eligibility history.
 * @returns True for visible, false for ineligible, or the numeric release version while held.
 */
export const resolveFieldErrorVisibility = (
  node: FieldNode,
  check: Fn<[condition?: FieldNode['state']], boolean>,
  policy: unknown,
): boolean | number => {
  if (!node.isPresent || !check(node.state)) return false;
  return isErrorRevealed(node, policy, true)
    ? true
    : readFieldNodeRevealVersion(node);
};
