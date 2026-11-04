import { expect, it } from 'vitest';

import { createCoreTestCase } from '../../__tests__/createCoreTestCase';
import { renderCoreSummary } from '../renderCoreSummary';
import { createCoreComparedSummary } from './renderCoreSummary/utils/createCoreComparedSummary';

it('reports candidate median and p95 with comparison verdicts', () => {
  const text = renderCoreSummary(createCoreComparedSummary());
  expect(text).toContain('12.000');
  expect(text).toContain('15.000');
  expect(text).toContain('slower');
  expect(text).toContain('mount-flat-500-none');
});

it('renders the legend units', () => {
  const text = renderCoreSummary(createCoreComparedSummary());
  expect(text).toContain('16.7 ms');
  expect(text).toContain('µs');
  expect(text).toContain('RAIL');
  expect(text).not.toMatch(/[\uAC00-\uD7A3]/);
  expect(text).toContain(
    'An invalid baseline/control group is retried once, then marked void.',
  );
  expect(text).toContain('conditional mean of exact writes');
  expect(text).toContain('observed rAF intervals');
  expect(text).toContain('< 50');
  expect(text).toContain('N/A');
  expect(text).toContain('(per write;');
  expect(text).toContain('Ratio = candidate / baseline');
});

it('makes the local nominal cadence and observed frame counts visible', () => {
  const text = renderCoreSummary(createCoreComparedSummary());
  expect(text).toContain('frameIntervalNominalMs');
  expect(text).toContain('16.667 / 8.333');
  expect(text).toContain('Over-budget frames (baseline/candidate)');
  expect(text).toContain('8.3 ms frames (baseline/candidate)');
  expect(text).toContain('16.7 ms baseline also over budget');
  expect(text).toContain('8.3 ms baseline also over budget');
});

it('renders the five tables with N/A budgets and the weighted exchange', () => {
  const text = renderCoreSummary(createCoreComparedSummary());
  for (const title of [
    '## 1. Elapsed and synchronous work',
    '## 2. Blocking',
    '## 3. Feedback',
    '## 4. Frame observations and UX',
    '## 5. Weighted exchange',
  ])
    expect(text).toContain(title);
  expect(text).toContain(
    '| mount-flat-500-none | — | — | — | not observable | N/A / N/A |',
  );
  expect(text).toContain('1000000');
  expect(text).toContain('1.200');
  expect(text).toContain('mount-flat-500-none: < 50 ms not observable');
  expect(text).toContain('54/3/3/0');
});

it('renders measure mode without inventing a comparison', () => {
  const summary = createCoreComparedSummary();
  const only = createCoreTestCase('rebuild-flat-500');
  only.candidate = { medianMs: 4, p95Ms: 6, maxMs: 6, samples: 3 };
  delete only.baseline;
  delete only.control;
  delete only.deltaMs;
  delete only.attempt;
  only.verdict = 'measured';
  for (const comparison of Object.values(only.metrics)) {
    delete comparison.baseline;
    delete comparison.control;
    delete comparison.deltaMs;
    comparison.verdict = 'measured';
  }
  delete only.ux.baseline;
  const text = renderCoreSummary({
    ...summary,
    mode: 'measure',
    warmup: 1,
    cases: [only],
    weighted: undefined,
  });
  expect(text).toContain('measured');
  expect(text).toContain('4.000');
  expect(text).not.toContain('slower');
  expect(text).not.toContain('## 5.');
});

it('preserves void and the retry attempt in the summary', () => {
  const summary = createCoreComparedSummary();
  summary.cases[0].verdict = 'void';
  summary.cases[0].attempt = 2;
  const text = renderCoreSummary(summary);
  expect(text).toContain('| void | 2 |');
});

it('renders N/A in the actual ratio and percent cells of a zero-baseline row', () => {
  const row = createCoreTestCase('type-flat-500-validate-nonburst', {
    durationMs: [3, 0],
    blockingMs: [1, 0],
    feedbackCommittedMs: [3, 0],
  });
  const text = renderCoreSummary({
    mode: 'compare',
    runs: 3,
    warmup: 0,
    cases: [row],
  });
  const cells = (section: string) =>
    text
      .split(section)[1]
      .split('\n')
      .find((line) => line.startsWith('| type-flat-500'))!
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
  expect(cells('## 1. Elapsed and synchronous work')[4]).toBe('N/A');
  expect(cells('## 1. Elapsed and synchronous work')[6]).toBe('N/A');
  expect(cells('## 2. Blocking')[3]).toBe('N/A');
  expect(cells('## 3. Feedback').slice(3, 5)).toEqual(['N/A', 'N/A']);
  delete row.metrics.feedbackCommittedMs.ratio;
  delete row.metrics.feedbackCommittedMs.deltaPercent;
  const missing = renderCoreSummary({
    mode: 'measure',
    runs: 3,
    warmup: 0,
    cases: [row],
  });
  expect(
    missing
      .split('## 3. Feedback')[1]
      .split('\n')
      .find((line) => line.startsWith('| type-flat-500'))!
      .split('|')
      .slice(4, 6)
      .map((cell) => cell.trim()),
  ).toEqual(['—', '—']);
});
