import assert from 'node:assert/strict';

import { median } from './median.mjs';
import { summarizeDistribution } from './summarizeDistribution.mjs';

/** Validate conserved self timing and summarize three process medians per A/B row and stage. */
export function summarizeStageRows(lanes, rowIds, names, pass) {
  for (const lane of ['A', 'B']) {
    assert.equal(lanes[lane].length, rowIds.length * 3);
    for (const record of lanes[lane]) {
      assert.equal(record.pass, pass);
      assert.equal(record.warmups, 20);
      assert.equal(record.sampleCount, 100);
      assert.equal(record.stages.length, 100);
      const mode = pass === 'ledger' ? 'wrapped' : 'supplemental';
      assert.equal(record.samples[mode].length, 100);
      for (const [index, sample] of record.stages.entries()) {
        const self = Object.values(sample).reduce(
          (sum, stage) => sum + stage.selfUs,
          0,
        );
        assert.ok(
          Math.abs(self - record.samples[mode][index]) < 1e-5,
          'Self sums conserve the timed row',
        );
      }
    }
  }
  return rowIds.map((row) => ({
    row,
    lanes: Object.fromEntries(
      ['A', 'B'].map((lane) => {
        const records = lanes[lane].filter((record) => record.row === row);
        assert.deepEqual(
          records.map((record) => record.repeat),
          [0, 1, 2],
        );
        const mode = pass === 'ledger' ? 'wrapped' : 'supplemental';
        return [
          lane,
          {
            totalUs: summarizeDistribution(
              records.map((record) => median(record.samples[mode])),
            ),
            unwrappedUs: summarizeDistribution(
              records.map((record) => median(record.samples.unwrapped)),
            ),
            stages: Object.fromEntries(
              names.map((name) => [
                name,
                {
                  selfUs: summarizeDistribution(
                    records.map((record) =>
                      median(
                        record.stages.map(
                          (sample) => sample[name]?.selfUs ?? 0,
                        ),
                      ),
                    ),
                  ),
                  inclusiveUs: summarizeDistribution(
                    records.map((record) =>
                      median(
                        record.stages.map(
                          (sample) => sample[name]?.inclusiveUs ?? 0,
                        ),
                      ),
                    ),
                  ),
                  calls: summarizeDistribution(
                    records.map((record) =>
                      median(
                        record.stages.map((sample) => sample[name]?.calls ?? 0),
                      ),
                    ),
                  ),
                },
              ]),
            ),
          },
        ];
      }),
    ),
  }));
}
