import type { FieldNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';
import { scheduleFieldNodeRevealDrop } from './scheduleFieldNodeRevealDrop';

/** Retain the current opaque Form policy before the handle changes React state.
 * @param node - Form root sharing the reveal lifetime.
 * @param value - Current policy; undefined is deliberately boxed.
 * @returns Nothing; the binding alone interprets policy values. */
export const recordFieldNodeShowErrorBaseline = <
  Self extends FieldNodeRecord<Self>,
>(
  node: Self,
  value: unknown,
): void => {
  const runtime = node.rootNode.runtime;
  if (
    runtime.revealPolicyBaseline ||
    !((runtime.validationMode ?? 0) & ValidationMode.OnChange)
  )
    return;
  runtime.revealPolicyBaseline = { value };
  runtime.revealBaselineGeneration =
    (runtime.revealBaselineGeneration ?? 0) + 1;
  if (!runtime.validationPending) runtime.revealDropOwed = true;
  scheduleFieldNodeRevealDrop(node);
};
