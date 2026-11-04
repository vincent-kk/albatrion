import type { FieldNodeRecord } from '../../../record';
import { ValidationMode } from '../../../types/state';
import { scheduleFieldNodeRevealDrop } from './scheduleFieldNodeRevealDrop';

/** Commit a rendered Form policy after React accepts its root and context.
 * @param node - Live root whose policy lifetime survives React disconnection.
 * @param value - Already resolved opaque Form policy; the engine never interprets it.
 * @returns Nothing; changed prior values join the generation-ordered history. */
export const commitFieldNodeRevealPolicy = <Self extends FieldNodeRecord<Self>>(
  node: Self,
  value: unknown,
): void => {
  const root = node.rootNode;
  const runtime = root.runtime;
  if (
    root.disposed ||
    !((runtime.validationMode ?? 0) & ValidationMode.OnChange)
  )
    return;
  const policy = runtime.revealPolicy;
  if (!policy) {
    runtime.revealPolicy = { value, entries: [] };
    return;
  }
  if (Object.is(policy.value, value)) return;
  const generation = (runtime.revealBaselineGeneration =
    (runtime.revealBaselineGeneration ?? 0) + 1);
  policy.entries.push({ value: policy.value, generation });
  policy.value = value;
  if (!runtime.validationPending) runtime.revealDropOwed = true;
  scheduleFieldNodeRevealDrop(root);
};
