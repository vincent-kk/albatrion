import { describe, expect, it } from 'vitest';

import { summarizeCoreMetric } from '../summarizeCoreMetric';

describe('summarizeCoreMetric observability', () => {
  it('does not label missing required latency as below the Long Tasks threshold', () => {
    expect(() =>
      summarizeCoreMetric('feedbackCommittedMs', [null, null], 'required'),
    ).toThrow('required');
  });

  it('rejects partially missing required measurements instead of widening the mixed statistics kind', () => {
    expect(() =>
      summarizeCoreMetric('validatorSettledMs', [null, 10], 'required'),
    ).toThrow('required');
  });

  it('keeps null below every numeric Long Task sample at the upper median boundary', () => {
    expect(
      summarizeCoreMetric('maxLongTaskMs', [null, 80], 'nullable'),
    ).toEqual({
      kind: 'mixed',
      samples: 2,
      observed: 1,
      median: 80,
      maxMs: 80,
    });
    expect(
      summarizeCoreMetric('maxLongTaskMs', [null, null, 80], 'nullable'),
    ).toEqual({
      kind: 'mixed',
      samples: 3,
      observed: 1,
      median: '<50',
      maxMs: 80,
    });
  });
});
