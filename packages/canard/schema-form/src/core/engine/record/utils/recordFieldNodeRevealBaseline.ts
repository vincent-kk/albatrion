import { ValidationMode } from '../../types/state';
import type { FieldNodeRecord } from '../types/record';

/** Append the pre-change eligibility once per public write sequence.
 * @param node - Live occurrence whose state or enabled result will change.
 * @returns Nothing; validation schedules and releases the recorded history. */
export const recordFieldNodeRevealBaseline = <Self>(
  node: FieldNodeRecord<Self>,
): void => {
  const runtime = node.runtime;
  if (!((runtime.validationMode ?? 0) & ValidationMode.OnChange)) return;
  const entries = (node.revealBaseline ??= { entries: [] }).entries;
  const sequence = runtime.revealWriteSequence ?? 0;
  if (entries.length && entries[entries.length - 1].sequence === sequence)
    return;
  const generation = (runtime.revealBaselineGeneration =
    (runtime.revealBaselineGeneration ?? 0) + 1);
  entries.push({
    state: node.interactionState,
    enabled: node.active && node.visible,
    generation,
    sequence,
  });
  (runtime.revealBaselineNodes ??= new Set()).add(node);
  if (!runtime.validationPending) runtime.revealDropOwed = true;
};
