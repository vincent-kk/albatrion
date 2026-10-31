import { ValidationMode } from '../../types/state';
import type { FieldNodeRecord } from '../types/record';

/** Record first pre-change display eligibility; validation owns its later drop schedule.
 * @param node - Live occurrence whose state or enabled result is about to change.
 * @returns Nothing; OnChange alone owns reveal baselines. */
export const recordFieldNodeRevealBaseline = <Self>(
  node: FieldNodeRecord<Self>,
): void => {
  const runtime = node.runtime;
  if (
    node.revealBaseline ||
    !((runtime.validationMode ?? 0) & ValidationMode.OnChange)
  )
    return;
  node.revealBaseline = {
    state: node.interactionState,
    enabled: node.active && node.visible,
  };
  (runtime.revealBaselineNodes ??= new Set()).add(node);
  runtime.revealBaselineGeneration =
    (runtime.revealBaselineGeneration ?? 0) + 1;
  if (!runtime.validationPending) runtime.revealDropOwed = true;
};
