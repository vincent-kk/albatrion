import { expect, it } from 'vitest';

import { summarizeCoreSamples } from '../summarizeCoreSamples';

it('computes an even median and nearest-rank p95 without mutating input', () => {
  const samples = [9, 1, 4, 2];
  expect(summarizeCoreSamples(samples)).toEqual({ medianMs: 3, p95Ms: 9 });
  expect(samples).toEqual([9, 1, 4, 2]);
});

it('retains a real zero-duration observation', () => {
  expect(summarizeCoreSamples([0])).toEqual({ medianMs: 0, p95Ms: 0 });
});
