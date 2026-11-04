import { expect, it } from 'vitest';

import type { CoreSummary } from '../../reportTypes';
import { renderCoreSummary } from '../renderCoreSummary/renderCoreSummary';
import { createCoreTestCase } from './createCoreTestCase';

/** Compare-mode summary with one slower mount and one typing case. */
const compared = (): CoreSummary => {
  const mount = createCoreTestCase(
    'mount-flat-500-none',
    { durationMs: [12, 10] },
    {
      durationMs: 'slower',
      blockingMs: 'not observable',
      maxLongTaskMs: 'below threshold',
    },
  );
  mount.candidate = { medianMs: 12, p95Ms: 15, maxMs: 16, samples: 3 };
  mount.metrics.blockingMs = {
    candidate: { kind: 'not-observable' },
    baseline: { kind: 'not-observable' },
    verdict: 'not observable',
  };
  mount.metrics.maxLongTaskMs = {
    candidate: { kind: 'below-threshold', samples: 3 },
    baseline: {
      kind: 'mixed',
      samples: 3,
      observed: 1,
      median: '<50',
      maxMs: 60,
    },
    deltaMs: null,
    verdict: 'below threshold',
  };
  mount.ux = {
    candidate: { blocking: 'ok', feedback: 'n/a' },
    baseline: { blocking: 'ok', feedback: 'n/a' },
  };
  const typing = createCoreTestCase(
    'type-flat-500-validate-nonburst',
    { blockingMs: [1.2, 1], feedbackCommittedMs: [50, 45] },
    { blockingMs: 'slower' },
  );
  typing.budget = {
    candidate: { frames: 1.2 / 16.7, overflowMs: 0, overBudget: false },
    baseline: { frames: 1 / 16.7, overflowMs: 0, overBudget: false },
  };
  typing.typing = {
    candidate: {
      samples: 3,
      handlerMaxMs: 18,
      handlerP95Ms: 4,
      overBudgetWrites: 3,
      firstWriteMedianMs: 4,
      feedbackMaxMs: 57,
      classes: { exact: 54, censored: 3, noChange: 3, superseded: 0 },
      repeatExact: 51,
      coalescedWrites: 0,
    },
    baseline: {
      samples: 3,
      handlerMaxMs: 9,
      handlerP95Ms: 3,
      overBudgetWrites: 0,
      firstWriteMedianMs: 3,
      feedbackMaxMs: 50,
      classes: { exact: 60, censored: 0, noChange: 0, superseded: 0 },
      repeatExact: 57,
      coalescedWrites: 0,
    },
  };
  return {
    mode: 'compare',
    runs: 3,
    warmup: 0,
    cases: [mount, typing],
    weighted: {
      blocking: {
        metric: 'blockingMs',
        rows: [
          {
            id: 'type-flat-500-validate-nonburst',
            weight: 5000,
            k: 1,
            basis: 'typing',
            baselineMicros: 1000,
            candidateMicros: 1200,
            deltaMicros: 200,
            counted: true,
            contributionMicros: 1_000_000,
          },
          {
            id: 'mount-flat-500-none',
            weight: 1,
            k: 1,
            basis: 'mount',
            baselineMicros: null,
            candidateMicros: null,
            deltaMicros: null,
            counted: false,
            reason: 'not observable',
            contributionMicros: 0,
          },
        ],
        exchangeMicros: 1_000_000,
        weightedBaselineMicros: 5_000_000,
        weightedCandidateMicros: 6_000_000,
        weightedRatio: 1.2,
        excluded: ['mount-flat-500-none: not observable'],
      },
      feedback: {
        metric: 'feedbackCommittedMs',
        rows: [
          {
            id: 'type-flat-500-validate-nonburst',
            weight: 5000,
            k: 1,
            basis: 'typing',
            baselineMicros: 45000,
            candidateMicros: 50000,
            deltaMicros: 5000,
            counted: false,
            reason: 'within noise',
            contributionMicros: 0,
          },
        ],
        exchangeMicros: 0,
        weightedBaselineMicros: 225_000_000,
        weightedCandidateMicros: 250_000_000,
        weightedRatio: 250 / 225,
        excluded: [],
      },
    },
  };
};

it('reports candidate median and p95 with comparison verdicts', () => {
  const text = renderCoreSummary(compared());
  expect(text).toContain('12.000');
  expect(text).toContain('15.000');
  expect(text).toContain('slower');
  expect(text).toContain('mount-flat-500-none');
});

it('renders the legend units', () => {
  const text = renderCoreSummary(compared());
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
  const text = renderCoreSummary(compared());
  expect(text).toContain('frameIntervalNominalMs');
  expect(text).toContain('16.667 / 8.333');
  expect(text).toContain('초과 프레임 수(기준/후보)');
  expect(text).toContain('8.3 ms 프레임(기준/후보)');
  expect(text).toContain('16.7 ms 기준판도 초과');
  expect(text).toContain('8.3 ms 기준판도 초과');
});

it('renders the five tables with N/A budgets and the weighted exchange', () => {
  const text = renderCoreSummary(compared());
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
  const summary = compared();
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
  const summary = compared();
  summary.cases[0].verdict = 'void';
  summary.cases[0].attempt = 2;
  const text = renderCoreSummary(summary);
  expect(text).toContain('| void | 2 |');
});
