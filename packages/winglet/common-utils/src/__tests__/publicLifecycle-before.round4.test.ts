import { describe, expect, it } from 'vitest';

import { getTrackableHandler } from '../index';
import { referenceTrackable } from '../utils/function/enhance/getTrackableHandler/__tests__/helpers/referenceTrackable';
import { runLifecycle } from '../utils/function/enhance/getTrackableHandler/__tests__/helpers/runLifecycle';

describe('round-4 independent call frames: before', () => {
  for (const asynchronous of [false, true])
    for (const preventConcurrent of [false, true])
      for (const outcome of ['resolve', 'reject', 'throw'] as const)
        it(`${asynchronous ? 'async' : 'sync'} hooks, guard=${preventConcurrent}, ${outcome}`, async () => {
          const expected = await runLifecycle(
            referenceTrackable,
            'before',
            asynchronous,
            preventConcurrent,
            outcome,
          );
          const actual = await runLifecycle(
            getTrackableHandler,
            'before',
            asynchronous,
            preventConcurrent,
            outcome,
          );
          expect(actual).toEqual(expected);
          expect(actual.calls.origin).toBe(expected.calls.origin);
          expect(actual.snapshots).toHaveLength(expected.calls.origin * 2);
          expect(actual.snapshots.at(-1)?.pending).toBe(false);
        });
});
