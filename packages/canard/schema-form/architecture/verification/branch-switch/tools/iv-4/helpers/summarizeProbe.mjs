import assert from 'node:assert/strict';

import { median } from '../../b9-1/helpers/median.mjs';

/**
 * Judge fresh interleaved processes using each row's own baseline spread.
 * @param {any[]} records Complete row-major A0/B0/A1/B1/A2/B2 walls.
 * @param {string[]} targets Rows that must improve strictly beyond their own noise.
 * @returns Independently reproducible medians, noise, and a keep/drop verdict.
 * @throws For missing rows, duplicate processes or a changed measurement protocol.
 */
export function summarizeProbe(records, targets) {
  const pids = records.map((record) => record.pid);
  assert.ok(pids.every((pid, index) => pids.indexOf(pid) === index));
  const ids = records
    .map((record) => record.row)
    .filter((id, index, all) => all.indexOf(id) === index);
  assert.ok(targets.length && targets.every((id) => ids.indexOf(id) !== -1));
  const rows = ids.map((id) => {
    const group = records.filter((record) => record.row === id);
    assert.deepEqual(
      group.map(({ lane, repeat }) => [lane, repeat]),
      [
        ['A', 0],
        ['B', 0],
        ['A', 1],
        ['B', 1],
        ['A', 2],
        ['B', 2],
      ],
    );
    const values = { A: [], B: [] };
    for (const record of group) {
      assert.equal(record.warmups, 2000);
      assert.equal(record.switches, 20000);
      assert.equal(record.blocks.length, 200);
      assert.equal(
        record.blocks.reduce((sum, block) => sum + block.switches, 0),
        20000,
      );
      assert.ok(
        record.blocks.every(
          (block) => block.switches === 100 && block.endUs > block.startUs,
        ),
      );
      values[record.lane].push(
        median(
          record.blocks.map(
            (block) => (block.endUs - block.startUs) / block.switches,
          ),
        ),
      );
    }
    const A = median(values.A),
      B = median(values.B);
    const noise = Math.max(...values.A) - Math.min(...values.A);
    const targeted = targets.indexOf(id) !== -1;
    const passed = targeted ? A - B > noise : B - A <= noise;
    return { id, targeted, values, A, B, noise, delta: B - A, passed };
  });
  return {
    targets,
    rows,
    maximumNoise: Math.max(...rows.map((row) => row.noise)),
    processes: records.length,
    kept: rows.every((row) => row.passed),
  };
}
