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
  expect(text).toContain('exact 쓰기의 조건부 평균');
  expect(text).toContain('관측된 rAF 간격');
  expect(text).toContain('< 50');
  expect(text).toContain('N/A');
  expect(text).toContain('쓰기 1회당');
  expect(text).toContain('비율 = 후보 / 기준');
});

it('makes the local nominal cadence and observed frame counts visible', () => {
  const text = renderCoreSummary(createCoreComparedSummary());
  expect(text).toContain('frameIntervalNominalMs');
  expect(text).toContain('16.667 / 8.333');
  expect(text).toContain('초과 프레임 수(기준/후보)');
  expect(text).toContain('8.3 ms 프레임(기준/후보)');
  expect(text).toContain('16.7 ms 기준판도 초과');
  expect(text).toContain('8.3 ms 기준판도 초과');
});

it('renders the five tables with N/A budgets and the weighted exchange', () => {
  const text = renderCoreSummary(createCoreComparedSummary());
  for (const title of [
    '## 1. 경과·동기',
    '## 2. 블로킹',
    '## 3. 피드백',
    '## 4. 프레임 관측·UX',
    '## 5. 가중 교환비',
  ])
    expect(text).toContain(title);
  expect(text).toContain(
    '| mount-flat-500-none | — | — | — | not observable | N/A / N/A |',
  );
  expect(text).toContain('1000000');
  expect(text).toContain('1.200');
  expect(text).toContain('mount-flat-500-none: not observable');
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
