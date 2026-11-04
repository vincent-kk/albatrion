import { expect, it } from 'vitest';

import { checkCoreSummaryCadence } from '../checkCoreSummaryCadence.mjs';

it('requires explicit nominal cadence in the summary and matches it to the accepted attempt', () => {
  const samples = {
    example: [
      {
        attempt: 1,
        samples: {
          candidate: [{ metrics: { frameIntervalNominalMs: 1000 / 120 } }],
        },
      },
    ],
  };
  expect(
    checkCoreSummaryCadence(
      { mode: 'measure', runs: 1, cases: [{ id: 'example', attempt: 1 }] },
      samples,
    ),
  ).toContainEqual(expect.stringContaining('frameIntervalNominalMs'));
  expect(
    checkCoreSummaryCadence(
      {
        mode: 'measure',
        runs: 1,
        cases: [
          {
            id: 'example',
            attempt: 1,
            frames: { candidate: { frameIntervalNominalMs: [1000 / 120] } },
          },
        ],
      },
      samples,
    ),
  ).toEqual([]);
});
