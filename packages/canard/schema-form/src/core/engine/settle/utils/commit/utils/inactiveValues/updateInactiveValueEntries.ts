import { find } from '../../../../../navigation';
import type { FieldNodeRecord } from '../../../../../record';
import type { InactiveMemoChange } from '../../../../types/inactiveValues';
import { compareInactiveOrder } from './compareInactiveOrder';
import { readInactiveCandidate } from './readInactiveCandidate';

/**
 * Reconcile selected item objects only for changed source or visibility paths.
 * @param root - Final committed shape used to hide live paths
 * @param paths - Distinct paths touched since the previous publication
 * @returns Actual list changes; unchanged item objects are retained
 */
export const updateInactiveValueEntries = <Self extends FieldNodeRecord<Self>>(
  root: Self,
  paths: ReadonlySet<string>,
): InactiveMemoChange[] => {
  const runtime = root.runtime;
  const entries = runtime.inactiveValueEntries!;
  const changes: InactiveMemoChange[] = [];
  for (const path of paths) {
    const previousKey = entries.pathIndex.at(path).values().next().value;
    const previous =
      previousKey === undefined ? undefined : entries.get(previousKey);
    const candidate = find(root, path)
      ? undefined
      : readInactiveCandidate(runtime, path);
    if (!candidate) {
      if (previousKey !== undefined) {
        entries.delete(previousKey);
        changes.push({ previous });
      }
      continue;
    }
    const held = entries.get(candidate.key);
    if (
      held &&
      Object.is(held.value, candidate.value) &&
      compareInactiveOrder(held.order, candidate.order) === 0
    )
      continue;
    const next = {
      value: candidate.value,
      order: candidate.order,
      entry:
        held && Object.is(held.value, candidate.value)
          ? held.entry
          : Object.freeze({ path, value: candidate.value }),
    };
    if (previousKey !== undefined && previousKey !== candidate.key)
      entries.delete(previousKey);
    entries.set(candidate.key, next);
    changes.push({ previous, next });
  }
  return changes;
};
