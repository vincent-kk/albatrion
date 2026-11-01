import { describe, expect, it } from 'vitest';

import { quantile } from '../../validationAfterPaint/quantile';
import { bootstrapStageClosingMetric } from '../bootstrapStageClosingMetric';
import { decideVsyncBound } from '../decideVsyncBound';
import { readPostPaintBusy } from '../readPostPaintBusy';
import { stageClosingOrder } from '../stageClosingOrder';

describe('registered closing bootstrap and timing rules', () => {
  it('uses the mean of the two middle values for even medians', () => {
    expect(quantile([1, 2, 10, 30])).toBe(6);
    expect(
      bootstrapStageClosingMetric([10, 10], [11, 11], 20261031, 20),
    ).toEqual({ upperBound: 1.1, differenceUpperBound: 1, undefinedRatios: 0 });
  });
  it('resamples paired indices jointly with the registered deterministic seed', () => {
    const before = [1, 4, 13, 50];
    const result = bootstrapStageClosingMetric(
      before,
      before.map((v) => v * 2),
    );
    expect(result.upperBound).toBe(2);
    expect(result).toEqual(
      bootstrapStageClosingMetric(
        before,
        before.map((v) => v * 2),
      ),
    );
  });
  it('keeps missing and mismatched observations indeterminate', () => {
    expect(bootstrapStageClosingMetric([0], [1]).upperBound).toBe('+Infinity');
    expect(
      bootstrapStageClosingMetric([1, null], [2, 3]).upperBound,
    ).toBeNull();
    expect(bootstrapStageClosingMetric([1], [2, 3]).upperBound).toBeNull();
  });
  it('blocks vsync only when both bounds exceed their exact limits', () => {
    const bound = (ratio: number, difference: number) => ({
      upperBound: ratio,
      differenceUpperBound: difference,
      undefinedRatios: 0,
    });
    expect(decideVsyncBound(bound(1.11, 8.35))).toBe(true);
    expect(decideVsyncBound(bound(1.1, 9))).toBe(true);
    expect(decideVsyncBound(bound(1.11, 8.350001))).toBe(false);
    expect(decideVsyncBound(undefined)).toBeNull();
  });
  it('balances all predecessor pairs in the four-lane square', () => {
    const rows = Array.from({ length: 4 }, (_, i) =>
      stageClosingOrder('mount-flat-500-validate', i),
    );
    const pairs = rows.flatMap((row) =>
      row.slice(1).map((lane, i) => row[i] + lane),
    );
    expect(pairs.length).toBe(12);
    expect(pairs.every((pair, i) => pairs.indexOf(pair) === i)).toBe(true);
    for (const lane of ['L', 'B', 'S', 'F'])
      expect(rows.map((row) => row.indexOf(lane)).sort()).toEqual([0, 1, 2, 3]);
  });
  it('uses only four lanes on former probe rows and excludes only L rebuild', () => {
    expect(stageClosingOrder('type-flat-500-validate-burst', 0)).toEqual([
      'L',
      'B',
      'F',
      'S',
    ]);
    expect(stageClosingOrder('rebuild-flat-500', 0)).toEqual(['B', 'F', 'S']);
  });
  it('clips post-paint frames and plugin durations to the operation deadline', () => {
    expect(
      readPostPaintBusy(
        [
          { startTime: 9, duration: 100 },
          { startTime: 20, duration: 50 },
          { startTime: 95, duration: 20 },
        ],
        [
          { kind: 'compile', start: 50, end: 60 },
          { kind: 'validate', start: 99, end: 102 },
        ],
        10,
        100,
      ),
    ).toBe(66);
  });
  it('passes when both frame lanes are zero under Amendment 4', () => {
    const bound = bootstrapStageClosingMetric([0, 0], [0, 0]);
    expect(bound.upperBound).toBe(1);
    expect(bound.differenceUpperBound).toBe(0);
    expect(decideVsyncBound(JSON.parse(JSON.stringify(bound)))).toBe(true);
  });
  it('passes a zero reference when the difference is at most half a frame', () => {
    expect(
      decideVsyncBound(bootstrapStageClosingMetric([0, 0], [8.35, 8.35])),
    ).toBe(true);
  });
  it('fails a new long frame above half a frame against a zero reference', () => {
    expect(
      decideVsyncBound(bootstrapStageClosingMetric([0, 0], [50, 50])),
    ).toBe(false);
  });
});
