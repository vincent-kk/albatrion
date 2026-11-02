import { expect, it } from 'vitest';

import { renderCoreSummary } from '../renderCoreSummary';

it('reports candidate median and p95 with comparison verdicts', () => {
  const text = renderCoreSummary({
    mode: 'compare',
    runs: 3,
    warmup: 0,
    cases: [
      {
        id: 'mount-flat-500-none',
        candidate: { medianMs: 12, p95Ms: 15 },
        baseline: { medianMs: 10, p95Ms: 11 },
        control: { medianMs: 10, p95Ms: 12 },
        deltaMs: 2,
        thresholdMs: 0.5,
        controlBandMs: 0.3,
        attempt: 1,
        verdict: 'slower',
      },
    ],
  });
  expect(text).toContain('12.000');
  expect(text).toContain('15.000');
  expect(text).toContain('slower');
  expect(text).toContain('mount-flat-500-none');
});

it('renders measure mode without inventing a comparison', () => {
  const text = renderCoreSummary({
    mode: 'measure',
    runs: 3,
    warmup: 1,
    cases: [
      {
        id: 'rebuild-flat-500',
        candidate: { medianMs: 4, p95Ms: 6 },
        verdict: 'measured',
      },
    ],
  });
  expect(text).toContain('measured');
  expect(text).toContain('4.000');
  expect(text).not.toContain('slower');
});

it('preserves void and the retry attempt in the summary', () => {
  const text = renderCoreSummary({
    mode: 'compare',
    runs: 3,
    warmup: 0,
    cases: [
      {
        id: 'rebuild-flat-500',
        candidate: { medianMs: 4, p95Ms: 6 },
        verdict: 'void',
        attempt: 2,
      },
    ],
  });
  expect(text).toContain('void');
  expect(text).toContain('2');
});
