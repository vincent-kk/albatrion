import assert from 'node:assert/strict';

import { median } from '../../b9-1/helpers/median.mjs';
import { summarizeDetailRecord } from '../timing/summarizeDetailRecord.mjs';

/**
 * Aggregate formal paired detail records without summing unrelated medians as totals.
 * @param {any[]} records - Eighteen floor worker records, three independent processes per cell
 * @returns Per-row/variant stage costs and paired overhead estimates
 */
export function summarizeTimings(records) {
  assert.equal(records.length, 18);
  const rows = [];
  for (const row of ['switch-siblings-0', 'switch-oneOf-80'])
    for (const variant of ['noop', 'leaf', 'switch']) {
      const selected = records
        .filter((record) => record.row === row && record.variant === variant)
        .sort((a, b) => a.repeat - b.repeat);
      assert.deepEqual(
        selected.map((record) => record.repeat),
        [0, 1, 2],
      );
      assert.ok(
        selected.every(
          (record) => record.warmups === 20 && record.sampleCount === 100,
        ),
      );
      const summaries = selected.map((record) => summarizeDetailRecord(record));
      const modes = {};
      for (const mode of ['details', 'wrapped']) {
        const names = summaries
          .flatMap((summary) => Object.keys(summary[mode].stages))
          .filter((name, index, values) => values.indexOf(name) === index);
        modes[mode] = {
          totalUs: median(summaries.map((summary) => summary[mode].totalUs)),
          baselineUs: median(
            summaries.map((summary) => summary[mode].baselineUs),
          ),
          perCallUs: median(
            summaries.map((summary) => summary[mode].perCallUs),
          ),
          stages: Object.fromEntries(
            names.map((name) => [
              name,
              Object.fromEntries(
                ['selfUs', 'calls', 'selfNetUs'].map((metric) => [
                  metric,
                  median(
                    summaries.map(
                      (summary) => summary[mode].stages[name]?.[metric] ?? 0,
                    ),
                  ),
                ]),
              ),
            ]),
          ),
        };
      }
      rows.push({
        row,
        variant,
        modes,
        processes: summaries,
        sampleRatios: selected.map((record) => ({
          repeat: record.repeat,
          modes: Object.fromEntries(
            Object.entries(record.samples).map(([mode, samples]) => [
              mode,
              {
                medianUs: median(samples),
                minUs: Math.min(...samples),
                ratio: median(samples) / Math.min(...samples),
              },
            ]),
          ),
        })),
      });
    }
  return rows;
}
