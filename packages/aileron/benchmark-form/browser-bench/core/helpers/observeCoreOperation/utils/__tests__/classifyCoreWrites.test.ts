import { expect, it } from 'vitest';

import type { CoreValidatorRecord } from '../../../../types';
import { classifyCoreWrites } from '../classifyCoreWrites';

/** Settled run of one probe value. */
const run = (
  seq: number,
  probeValue: string,
  startMs: number,
  settledMs: number,
): CoreValidatorRecord => ({
  seq,
  kind: 'run',
  probeValue,
  startMs,
  syncReturnMs: startMs + 1,
  settledMs,
  ok: true,
});

it('attributes writes by probe value', () => {
  const writes = classifyCoreWrites(
    [
      { start: 0, durationMs: 2, trusted: true, value: 'a' },
      { start: 100, durationMs: 1, trusted: true, value: 'ab' },
      { start: 200, durationMs: 1, trusted: true, value: 'abc' },
      { start: 300, durationMs: 1, trusted: true, value: 'abcd' },
    ],
    [run(1, 'a', 5, 20), run(2, 'ab', 210, 220), run(3, 'abc', 230, 240)],
    [
      { atMs: 25, state: '1' },
      { atMs: 222, state: '0' },
      { atMs: 245, state: '1' },
    ],
    '0',
    400,
  );
  expect(writes).toEqual([
    {
      index: 1,
      value: 'a',
      handlerMs: 2,
      validatorSettledMs: 20,
      feedbackCommittedMs: 25,
      feedbackClass: 'exact',
      coalesced: false,
    },
    {
      index: 2,
      value: 'ab',
      handlerMs: 1,
      validatorSettledMs: 120,
      feedbackCommittedMs: null,
      feedbackClass: 'censored',
      coalesced: true,
    },
    {
      index: 3,
      value: 'abc',
      handlerMs: 1,
      validatorSettledMs: 40,
      feedbackCommittedMs: 45,
      feedbackClass: 'exact',
      coalesced: false,
    },
    {
      index: 4,
      value: 'abcd',
      handlerMs: 1,
      validatorSettledMs: null,
      feedbackCommittedMs: null,
      feedbackClass: 'superseded',
      coalesced: false,
    },
  ]);
});

it('classifies a validated write whose marker already showed the expected state as noChange', () => {
  const writes = classifyCoreWrites(
    [
      { start: 0, durationMs: 1, trusted: true, value: 'a' },
      { start: 100, durationMs: 1, trusted: true, value: 'abc' },
    ],
    [run(1, 'a', 5, 20), run(2, 'abc', 105, 120)],
    [{ atMs: 25, state: '1' }],
    '0',
    300,
  );
  expect(writes[1]).toMatchObject({
    validatorSettledMs: 20,
    feedbackCommittedMs: null,
    feedbackClass: 'noChange',
    coalesced: false,
  });
});

it('counts a transition after the sample end as censored for the last write', () => {
  const writes = classifyCoreWrites(
    [{ start: 0, durationMs: 1, trusted: true, value: 'a' }],
    [run(1, 'a', 5, 20)],
    [{ atMs: 500, state: '1' }],
    '0',
    400,
  );
  expect(writes[0].feedbackClass).toBe('censored');
});
