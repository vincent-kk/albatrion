import { hasOwnProperty } from '@winglet/common-utils/lib';
import type { NodeStateFlags } from '../../types/state';

/** Add only truth-value transitions from one occurrence to the current key deltas. */
export const accumulateGlobalStateDeltas = (
  deltas: Map<string, number>, previous: NodeStateFlags, next: NodeStateFlags,
  changedKeys?: NodeStateFlags,
): void => {
  if (changedKeys) {
    for (const key in changedKeys) {
      if (!hasOwnProperty(changedKeys, key)) continue;
      const before = Boolean(previous[key]);
      const after = Boolean(next[key]);
      if (before !== after)
        deltas.set(key, (deltas.get(key) ?? 0) + (after ? 1 : -1));
    }
    return;
  }
  for (const [key, value] of Object.entries(previous))
    if (value && !next[key]) deltas.set(key, (deltas.get(key) ?? 0) - 1);
  for (const [key, value] of Object.entries(next))
    if (value && !previous[key]) deltas.set(key, (deltas.get(key) ?? 0) + 1);
};
