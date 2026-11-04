import type { FieldNodeRecord } from '../../../record';
import { scheduleValidationSlot } from '../../../validationScheduling';
import { dropFieldNodeRevealBaselines } from './dropFieldNodeRevealBaselines';
import { notifyFieldNodeRevealReleased } from './notifyFieldNodeRevealReleased';

/** Release quiet entries through the scheduled generation without extending older lifetimes.
 * @param node - Live occurrence owning the owed generation and slot token.
 * @returns Nothing; re-arm completes before release listeners can append again. */
export const scheduleFieldNodeRevealDrop = <Self extends FieldNodeRecord<Self>>(
  node: Self,
): void => {
  const root = node.rootNode;
  const runtime = root.runtime;
  if (root.disposed || !runtime.revealDropOwed || runtime.revealDropTask)
    return;
  const token = {};
  const generation = runtime.revealBaselineGeneration ?? 0;
  runtime.revealDropTask = token;
  scheduleValidationSlot(() => {
    if (root.disposed || runtime.revealDropTask !== token) return;
    if (runtime.validationPending) {
      runtime.revealDropOwed = false;
      runtime.revealDropTask = undefined;
      return;
    }
    const remains = dropFieldNodeRevealBaselines(root, generation);
    if (remains) {
      runtime.revealDropOwed = true;
      scheduleFieldNodeRevealDrop(root);
    }
    notifyFieldNodeRevealReleased(root);
  });
};
