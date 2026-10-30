import assert from 'node:assert/strict';

import { median } from '../../b9-1/helpers/median.mjs';

/**
 * Recompute timer correction and conservation from one same-process paired record.
 * @param {any} record - Raw details-worker output with all numerical samples
 * @param {number} expectedSamples - Formal 100 or a synthetic/rehearsal count
 * @returns Per-stage raw self, calls and uniformly corrected selfNetUs
 */
export function summarizeDetailRecord(record, expectedSamples = 100) {
  for (const mode of ['plain', 'details', 'unwrapped', 'wrapped']) {
    assert.equal(record.samples[mode].length, expectedSamples);
    assert.ok(
      record.samples[mode].every(
        (sample) => Number.isFinite(sample) && sample > 0,
      ),
    );
  }
  const result = {};
  for (const [mode, baseline] of [
    ['details', 'plain'],
    ['wrapped', 'unwrapped'],
  ]) {
    assert.equal(record.stages[mode].length, expectedSamples);
    const callCounts = [];
    for (const [index, sample] of record.stages[mode].entries()) {
      const total = Object.values(sample).reduce(
        (sum, metric) => sum + metric.selfUs,
        0,
      );
      assert.ok(
        Math.abs(total - record.samples[mode][index]) < 0.01,
        'Disjoint self cost conservation',
      );
      callCounts.push(
        Object.entries(sample)
          .filter(([name]) => name !== 'everythingElse')
          .reduce((sum, [, metric]) => sum + metric.calls, 0),
      );
    }
    const overheadUs =
      median(record.samples[mode]) - median(record.samples[baseline]);
    const calls = median(callCounts);
    assert.ok(calls > 0);
    const perCallUs = overheadUs / calls;
    const names = [
      ...new Set(record.stages[mode].flatMap((sample) => Object.keys(sample))),
    ];
    const stages = Object.fromEntries(
      names.map((name) => {
        const selfUs = median(
          record.stages[mode].map((sample) => sample[name]?.selfUs ?? 0),
        );
        const calls = median(
          record.stages[mode].map((sample) => sample[name]?.calls ?? 0),
        );
        return [
          name,
          {
            selfUs,
            calls,
            selfNetUs:
              selfUs - (name === 'everythingElse' ? 0 : calls * perCallUs),
          },
        ];
      }),
    );
    result[mode] = {
      totalUs: median(record.samples[mode]),
      baselineUs: median(record.samples[baseline]),
      overheadUs,
      perCallUs,
      calls,
      stages,
    };
  }
  return result;
}
