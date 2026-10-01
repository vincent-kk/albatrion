import { SchemaNodeEventType } from '../SchemaNodeEventType';
import type { SchemaNodeRecord } from '../type';

/** Publish net per-key count changes and queue one root event on a zero crossing. */
export const publishGlobalStateDeltas = <Self extends SchemaNodeRecord<Self>>(
  root: Self, deltas: ReadonlyMap<string, number>,
): void => {
  const runtime = root.runtime;
  let nextState: Record<string, true> | undefined;
  for (const [key, delta] of deltas) {
    if (!delta) continue;
    const previous = runtime.globalStateCounts.get(key) ?? 0;
    const count = previous + delta;
    if (count < 0) throw new Error(`Negative global state count for ${key}`);
    if (count) runtime.globalStateCounts.set(key, count);
    else runtime.globalStateCounts.delete(key);
    if ((previous === 0) === (count === 0)) continue;
    nextState ??= { ...runtime.globalState };
    if (count) nextState[key] = true;
    else delete nextState[key];
  }
  if (!nextState) return;
  runtime.globalState = nextState;
  const queued = runtime.queuedNonSettleEvents ?? new Map();
  const previous = queued.get(root);
  queued.set(root, {
    type: (previous?.type ?? 0) | SchemaNodeEventType.UpdateGlobalState,
    payload: { ...previous?.payload,
      [SchemaNodeEventType.UpdateGlobalState]: nextState },
  });
  runtime.queuedNonSettleEvents = queued;
};
