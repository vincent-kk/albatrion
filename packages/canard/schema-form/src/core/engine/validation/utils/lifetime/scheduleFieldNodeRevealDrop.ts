import type { FieldNodeRecord } from '../../../record';
import { scheduleValidationSlot } from '../../../validationScheduling';
import { dropFieldNodeRevealBaselines } from './dropFieldNodeRevealBaselines';

/** Drop quiet reveal records after their paint using only the shared one-shot slot.
 * @param node - Live root owning the owed generation and slot token.
 * @returns Nothing; a later record conservatively keeps all baselines for another slot. */
export const scheduleFieldNodeRevealDrop = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): void => {
  const root = node.rootNode;
  const runtime = root.runtime;
  if (root.disposed || !runtime.revealDropOwed || runtime.revealDropTask)
    return;
  const token = {};
  const generation = runtime.revealBaselineGeneration;
  runtime.revealDropTask = token;
  scheduleValidationSlot(() => {
    if (root.disposed || runtime.revealDropTask !== token) return;
    runtime.revealDropTask = undefined;
    runtime.revealDropOwed = false;
    if (runtime.revealBaselineGeneration !== generation) {
      runtime.revealDropOwed = true;
      scheduleFieldNodeRevealDrop(root);
    } else if (!runtime.validationPending) dropFieldNodeRevealBaselines(root);
  });
};
