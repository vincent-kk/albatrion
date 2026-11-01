import { expect, it } from 'vitest';

import { readStageClosingDiagnosis } from '../readStageClosingDiagnosis';
import { readStageClosingPositionCounts } from '../readStageClosingPositionCounts';
import { stageClosingOrder } from '../stageClosingOrder';

it('records each lane position count over the actual ten retained four-lane pages', () => {
  const samples = Array.from({ length: 10 }, (_, index) =>
    stageClosingOrder('mount-flat-500-validate', index).map((lane) => ({
      id: 'mount-flat-500-validate',
      index,
      lane,
    })),
  ).flat();
  const result =
    readStageClosingPositionCounts(samples)['mount-flat-500-validate'];
  expect(result).toEqual({
    L: [3, 2, 3, 2],
    B: [3, 3, 2, 2],
    S: [2, 3, 2, 3],
    F: [2, 2, 3, 3],
  });
});
it('includes a dual metric saved by the difference clause while leaving a failed dual metric out', () => {
  const bound = (ratio: number, difference: number) => ({
    upperBound: ratio,
    differenceUpperBound: difference,
    undefinedRatios: 0,
  });
  const diagnosis = readStageClosingDiagnosis({
    'mount-flat-500-always': {
      firstPainted: bound(1.3, 8.35),
      eagerPainted: bound(1.3, 8.36),
      longestFrame: bound(1.06, 1),
    },
    'validate-flat-500-settled': { resolutionTime: bound(2, 0.1) },
  });
  expect(diagnosis.map((row) => [row.metric, row.reason])).toEqual([
    ['firstPainted', 'passes-difference-clause'],
    ['longestFrame', 'ratio-in-diagnosis-band'],
    ['resolutionTime', 'passes-difference-clause'],
  ]);
});

it('excludes zero-valued page metrics and operation frame metrics from timing diagnosis', () => {
  const bounds = {
    'reset-flat-500-same': {
      longestFrame: {
        upperBound: 1.08,
        differenceUpperBound: 2,
        undefinedRatios: 0,
      },
      flooredLongestFrame: {
        upperBound: 1.08,
        differenceUpperBound: 2,
        undefinedRatios: 0,
      },
      callDuration: {
        upperBound: 1.08,
        differenceUpperBound: 2,
        undefinedRatios: 0,
      },
    },
  };
  expect(
    readStageClosingDiagnosis(bounds, {
      'reset-flat-500-same': ['callDuration'],
    }),
  ).toEqual([]);
});
