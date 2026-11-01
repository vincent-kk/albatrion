import { expect, it } from 'vitest';

import { summarizePage } from '../../summarizePage';
import { deriveStageClosingValidatorWork } from '../deriveStageClosingValidatorWork';
import { readStageClosingValidatorWorkPage } from '../readStageClosingValidatorWorkPage';
import { closingGateFixture } from './fixtures/closingGateFixture';

/** A compact raw slot preserves the attribution boundaries without a browser. */
const operation = (start: number, count = 0) => ({
  index: 1,
  start,
  end: start + 1000,
  firstPaint: start + 20,
  paintBoundary: start + 10,
  callDuration: 1,
  nextPainted: 20,
  nodeChanged: false,
  expectedNodeChanged: false,
  longestFrame: count ? 55 : 0,
  longFrameCount: count,
  postPaintBusy: 0,
});
it('attributes by slot start, preserving setup, gaps and entries that overrun the slot', () => {
  const page = closingGateFixture().pages['stream-0'];
  page.closing.operations = [operation(100), operation(1200)];
  page.closing.validatorWork = [
    { kind: 'compile', start: 99, end: 101 },
    { kind: 'compile', start: 100, end: 101 },
    { kind: 'validate', start: 1099, end: 1400 },
    { kind: 'validate', start: 1100, end: 1110 },
    { kind: 'compile', start: 2200, end: 2210 },
  ];
  expect(readStageClosingValidatorWorkPage(page)).toMatchObject({
    units: 2,
    compileCalls: 1,
    validateCalls: 1,
    setupCompileCalls: 1,
    unattributed: 2,
  });
});
it('counts every mount entry including late entries while reporting late work separately', () => {
  const page = closingGateFixture().pages['stream-0'];
  page.mount.startedAt = 50;
  page.closing.validatorWork = [
    { kind: 'compile', start: 49, end: 60 },
    { kind: 'compile', start: 50, end: 60 },
    { kind: 'validate', start: 1050, end: 1060 },
  ];
  expect(readStageClosingValidatorWorkPage(page)).toMatchObject({
    units: 1,
    compileCalls: 1,
    validateCalls: 1,
    setupCompileCalls: 1,
    lateValidateCalls: 1,
  });
});
it('computes lane means and requires F=B with no unattributed F work', () => {
  const pages = {
    B: closingGateFixture().pages['stream-0'],
    F: closingGateFixture().pages['stream-0'],
  };
  for (const page of Object.values(pages)) {
    page.closing.operations = [operation(100), operation(1200)];
    page.closing.validatorWork = [
      { kind: 'compile', start: 100, end: 101 },
      { kind: 'compile', start: 1200, end: 1201 },
    ];
  }
  const samples = ['B', 'F'].map((lane) => ({
    id: 'reset-flat-500-same',
    lane,
    index: 0,
    file: lane,
    summary: summarizePage(pages[lane === 'B' ? 'B' : 'F']),
  }));
  const good = deriveStageClosingValidatorWork(samples, pages);
  expect(good.checks.find((c) => c.id === 'reset-flat-500-same')?.status).toBe(
    'PASS',
  );
  expect(good.rows.find((r) => r.lane === 'F')?.compileMean).toBe(1);
  pages.F.closing.validatorWork.push({
    kind: 'validate',
    start: 1100,
    end: 1110,
  });
  expect(
    deriveStageClosingValidatorWork(samples, pages).checks.find(
      (c) => c.id === 'reset-flat-500-same',
    )?.status,
  ).toBe('FIX_REQUIRED');
});
it('does not include None mount rows in the work equality rule', () => {
  const page = closingGateFixture().pages['stream-0'];
  const result = deriveStageClosingValidatorWork(
    [
      {
        id: 'mount-array-1000-none',
        lane: 'F',
        index: 0,
        file: 'F',
        summary: summarizePage(page),
      },
    ],
    { F: page },
  );
  expect(result.checks.some((c) => c.id === 'mount-array-1000-none')).toBe(
    false,
  );
});

it('requires a fix for unequal means unless an exact design exception was registered', () => {
  const pages = {
    B: closingGateFixture().pages['stream-0'],
    F: closingGateFixture().pages['stream-0'],
  };
  for (const page of Object.values(pages)) {
    page.closing.operations = [operation(100), operation(1200)];
    page.closing.validatorWork = [];
  }
  pages.F.closing.validatorWork = [{ kind: 'validate', start: 100, end: 101 }];
  const samples = ['B', 'F'].map((lane) => ({
    id: 'reset-flat-500-same',
    lane,
    index: 0,
    file: lane,
    summary: summarizePage(pages[lane === 'B' ? 'B' : 'F']),
  }));
  expect(
    deriveStageClosingValidatorWork(samples, pages).checks.find(
      (c) => c.id === 'reset-flat-500-same',
    )?.status,
  ).toBe('FIX_REQUIRED');
  expect(
    deriveStageClosingValidatorWork(samples, pages, [
      {
        id: 'reset-flat-500-same',
        metric: 'validateMean',
        delta: 0.5,
        designCause: 'registered design cause',
      },
    ]).checks.find((c) => c.id === 'reset-flat-500-same')?.status,
  ).toBe('PASS');
});

/** Count work over complete pages so fractional lane means retain floating-point rounding. */
const workFixture = (pageCount = 1, operationCount = 2) => {
  const pages: Record<
    string,
    ReturnType<typeof closingGateFixture>['pages'][string]
  > = {};
  const samples = ['B', 'F'].flatMap((lane) =>
    Array.from({ length: pageCount }, (_, index) => {
      const file = lane + index;
      const page = closingGateFixture().pages['stream-0'];
      page.closing.operations = Array.from({ length: operationCount }, (_, i) =>
        operation(100 + i * 1100),
      );
      page.closing.validatorWork = page.closing.operations.map((op) => ({
        kind: 'validate' as const,
        start: op.start,
        end: op.start + 1,
      }));
      pages[file] = page;
      return {
        id: 'reset-flat-500-same',
        lane,
        index,
        file,
        summary: summarizePage(page),
      };
    }),
  );
  return { pages, samples };
};
it('matches a registered 0.1 delta across ten pages and rejects it without an exception', () => {
  const { pages, samples } = workFixture(10, 10);
  for (const sample of samples.filter((s) => s.lane === 'F'))
    pages[sample.file].closing.validatorWork.push({
      kind: 'validate',
      start: 101,
      end: 102,
    });
  const exception = {
    id: 'reset-flat-500-same',
    metric: 'validateMean' as const,
    delta: 0.1,
    designCause: 'registered design cause',
  };
  const result = deriveStageClosingValidatorWork(samples, pages, [exception]);
  expect(result.rows.find((row) => row.lane === 'B')?.units).toBe(100);
  expect(result.rows.find((row) => row.lane === 'F')?.validateMean).toBe(1.1);
  expect(result.checks.find((check) => check.id === exception.id)?.status).toBe(
    'PASS',
  );
  expect(
    deriveStageClosingValidatorWork(samples, pages).checks.find(
      (check) => check.id === exception.id,
    )?.status,
  ).toBe('FIX_REQUIRED');
});
it('requires exactly a compileMean fix for one extra F compile inside a slot', () => {
  const { pages, samples } = workFixture();
  pages.F0.closing.validatorWork.push({
    kind: 'compile',
    start: 101,
    end: 102,
  });
  expect(
    deriveStageClosingValidatorWork(samples, pages).checks.find(
      (check) => check.id === 'reset-flat-500-same',
    ),
  ).toMatchObject({ status: 'FIX_REQUIRED', violations: ['compileMean'] });
});
it('rejects an exception with an empty designCause', () => {
  const { pages, samples } = workFixture();
  pages.F0.closing.validatorWork.push({
    kind: 'validate',
    start: 101,
    end: 102,
  });
  expect(
    deriveStageClosingValidatorWork(samples, pages, [
      {
        id: 'reset-flat-500-same',
        metric: 'validateMean',
        delta: 0.5,
        designCause: '',
      },
    ]).checks.find((check) => check.id === 'reset-flat-500-same')?.status,
  ).toBe('FIX_REQUIRED');
});
