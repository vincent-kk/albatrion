import { expect, it } from 'vitest';

import { bootstrapStageClosingMetric } from '../bootstrapStageClosingMetric';
import { decideVsyncBound } from '../decideVsyncBound';
import { finalizeStageClosingOperations } from '../finalizeStageClosingOperations';
import { readStageClosingMetrics } from '../readStageClosingMetrics';
import { closingGateFixture } from './fixtures/closingGateFixture';

it('uses all ten operation medians and preserves the first operation separately', () => {
  const page = closingGateFixture().pages['stream-0'];
  page.closing.operations = Array.from({ length: 10 }, (_, i) => ({
    index: i + 1,
    start: i * 1000,
    end: (i + 1) * 1000,
    firstPaint: i * 1000 + 20,
    paintBoundary: i * 1000 + 10,
    callDuration: i + 1,
    nextPainted: i + 20,
    resolutionTime: i + 2,
    nodeChanged: false,
    expectedNodeChanged: false,
    longestFrame: 0,
    longFrameCount: 0,
    postPaintBusy: i,
  }));
  expect(readStageClosingMetrics(page).callDuration).toBe(5.5);
  expect(readStageClosingMetrics(page).resolutionTime).toBe(6.5);
  expect(readStageClosingMetrics(page, true).callDuration).toBe(1);
});
it('includes delayed observer entries when finalizing operation windows', () => {
  const operations = [
    {
      index: 1,
      start: 0,
      end: 1000,
      firstPaint: 20,
      paintBoundary: 10,
      callDuration: 1,
      nextPainted: 20,
      nodeChanged: false,
      expectedNodeChanged: false,
      longestFrame: 0,
      longFrameCount: 0,
      postPaintBusy: 0,
    },
  ];
  expect(
    finalizeStageClosingOperations(
      operations,
      [{ startTime: 100, duration: 75 }],
      [{ kind: 'compile', start: 200, end: 210 }],
    )[0],
  ).toMatchObject({ longestFrame: 75, longFrameCount: 1, postPaintBusy: 85 });
});

it('captures compile and validate between first and second rAF through paintBoundary', () => {
  const operations = [
    {
      index: 1,
      start: 0,
      end: 1000,
      paintBoundary: 10,
      firstPaint: 80,
      callDuration: 1,
      nextPainted: 80,
      nodeChanged: true,
      expectedNodeChanged: true,
      longestFrame: 0,
      longFrameCount: 0,
      postPaintBusy: 0,
    },
  ];
  const work = [
    { kind: 'compile' as const, start: 12, end: 62 },
    { kind: 'validate' as const, start: 63, end: 68 },
  ];
  expect(
    finalizeStageClosingOperations(operations, [], work)[0].postPaintBusy,
  ).toBe(55);
});

it('floors each trimodal operation at 50ms before taking the page median', () => {
  const page = closingGateFixture().pages['stream-0'];
  page.closing.operations = Array.from({ length: 10 }, (_, i) => ({
    index: i + 1,
    start: i * 1000,
    end: (i + 1) * 1000,
    firstPaint: i * 1000 + 20,
    paintBoundary: i * 1000 + 10,
    callDuration: 1,
    nextPainted: 20,
    nodeChanged: false,
    expectedNodeChanged: false,
    longestFrame: i < 5 ? 0 : 54,
    longFrameCount: i < 5 ? 0 : 1,
    postPaintBusy: 0,
  }));
  expect(readStageClosingMetrics(page).longestFrame).toBe(27);
  expect(readStageClosingMetrics(page).flooredLongestFrame).toBe(52);
});

it('passes the paired 54ms example only after flooring the operation frames', () => {
  const metrics = (counts: number[]) =>
    counts.map((count) => {
      const page = closingGateFixture().pages['stream-0'];
      page.closing.operations = Array.from({ length: 10 }, (_, i) => ({
        index: i + 1,
        start: i * 1000,
        end: (i + 1) * 1000,
        firstPaint: i * 1000 + 20,
        paintBoundary: i * 1000 + 10,
        callDuration: 1,
        nextPainted: 20,
        nodeChanged: false,
        expectedNodeChanged: false,
        longestFrame: i < count ? 54 : 0,
        longFrameCount: i < count ? 1 : 0,
        postPaintBusy: 0,
      }));
      return readStageClosingMetrics(page);
    });
  const B = metrics([4, 4, 4, 4, 4, 4, 4, 6, 6, 6]);
  const F = metrics([6, 4, 4, 4, 4, 4, 4, 4, 6, 6]);
  const raw = bootstrapStageClosingMetric(
    B.map((p) => p.longestFrame),
    F.map((p) => p.longestFrame),
  );
  const floored = bootstrapStageClosingMetric(
    B.map((p) => p.flooredLongestFrame),
    F.map((p) => p.flooredLongestFrame),
  );
  expect(raw).toMatchObject({
    upperBound: '+Infinity',
    differenceUpperBound: 27,
  });
  expect(decideVsyncBound(raw, 16.7)).toBe(false);
  expect(floored).toMatchObject({ upperBound: 1.04, differenceUpperBound: 2 });
  expect(decideVsyncBound(floored, 16.7)).toBe(true);
});
