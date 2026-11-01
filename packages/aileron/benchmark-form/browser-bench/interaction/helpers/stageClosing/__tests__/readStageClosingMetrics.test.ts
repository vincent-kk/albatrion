import { expect, it } from 'vitest';

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
