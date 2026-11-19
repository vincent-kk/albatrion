import { describe, expect, it } from 'vitest';
import { getTrackableHandler } from '../getTrackableHandler';
import { referenceTrackable } from './helpers/referenceTrackable';
import { runLifecycle } from './helpers/runLifecycle';

describe('round-4 independent call frames: after', () => {
  for (const asynchronous of [false, true])
    for (const preventConcurrent of [false, true])
      for (const outcome of ['resolve', 'reject', 'throw'] as const)
        it(`${asynchronous ? 'async' : 'sync'} hooks, guard=${preventConcurrent}, ${outcome}`, async () => {
          const expected = await runLifecycle(referenceTrackable, 'after', asynchronous, preventConcurrent, outcome);
          const actual = await runLifecycle(getTrackableHandler, 'after', asynchronous, preventConcurrent, outcome);
          expect(actual).toEqual(expected);
          expect(actual.calls.origin).toBe(expected.calls.origin);
          expect(actual.snapshots).toHaveLength(expected.calls.origin * 2);
          expect(actual.snapshots.at(-1)?.pending).toBe(false);
        });
});
