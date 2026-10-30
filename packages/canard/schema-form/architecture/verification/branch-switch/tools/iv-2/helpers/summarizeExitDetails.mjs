import assert from 'node:assert/strict';

import { median } from '../../b9-1/helpers/median.mjs';
import { summarizeDistribution } from '../../b9-1/helpers/summarizeDistribution.mjs';
import { judgeStage } from '../../iv-1/judgeStage.mjs';

/**
 * Judge preserved exit self medians with the unchanged IV-1 resolution rule.
 * @param {object} lanes - A/B records from three independent details processes
 * @returns Exit owner medians, calls, process widths, and their strict reductions
 */
export function summarizeExitDetails(lanes) {
  const names = [
    'finalizeExits',
    'finalizePendingExitLoop',
    'captureDetachedFieldNodeReads',
    'visitFieldNodes',
    'retainExitedSlot',
    'createExitSlotOverlay',
    'readSlotExitPolicy',
    'finalizeRetainLoop',
  ];
  const values = {};
  for (const lane of ['A', 'B']) {
    assert.equal(lanes[lane].length, 3);
    for (const [repeat, record] of lanes[lane].entries()) {
      assert.equal(record.row, 'switch-oneOf-80');
      assert.equal(record.repeat, repeat);
      assert.equal(record.warmups, 20);
      assert.equal(record.sampleCount, 100);
      assert.equal(record.stages.details.length, 100);
      assert.equal(record.samples.details.length, 100);
      for (let index = 0; index < 100; index++) {
        const total = Object.values(record.stages.details[index]).reduce(
          (sum, metric) => sum + metric.selfUs,
          0,
        );
        assert.ok(
          Math.abs(total - record.samples.details[index]) < 1e-5,
          'Conserved detail self sum',
        );
      }
    }
    values[lane] = Object.fromEntries(
      names.map((name) => [
        name,
        {
          selfUs: summarizeDistribution(
            lanes[lane].map((record) =>
              median(
                record.stages.details.map(
                  (sample) => sample[name]?.selfUs ?? 0,
                ),
              ),
            ),
          ),
          calls: summarizeDistribution(
            lanes[lane].map((record) =>
              median(
                record.stages.details.map((sample) => sample[name]?.calls ?? 0),
              ),
            ),
          ),
        },
      ]),
    );
  }
  const reductions = names.map((name) => ({
    ...judgeStage(
      'switch-oneOf-80',
      name,
      values.A[name].selfUs,
      values.B[name].selfUs,
    ),
    callsA: values.A[name].calls.median,
    callsB: values.B[name].calls.median,
  }));
  return {
    row: 'switch-oneOf-80',
    lanes: values,
    reductions,
    passed: reductions.every((stage) => stage.passed),
  };
}
