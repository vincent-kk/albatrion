import assert from 'node:assert/strict';

import { median } from '../../b9-1/helpers/median.mjs';

/**
 * Reconstruct the B5 L/S/E table directly from role-bound raw process samples.
 * @param {any} raw - Completed alternate device output
 * @param {any[]} fixtures - Ordered canonical 22-row identities
 * @returns Per-row process minima, process-median range and the two requested ratios
 */
export function summarizeMilestone(raw, fixtures) {
  assert.equal(raw.completed, true);
  assert.equal(raw.results.length, fixtures.length * 20);
  const pids = raw.results.map((record) => record.pid);
  assert.ok(
    pids.every((pid, index) => pids.indexOf(pid) === index),
    'Independent processes',
  );
  return fixtures.map((fixture, index) => {
    const records = raw.results.slice(index * 20, (index + 1) * 20);
    assert.deepEqual(
      records.map((record) => [record.row, record.lane, record.repeat]),
      Array.from({ length: 10 }, (_, repeat) => [
        [fixture.id, 'A', repeat],
        [fixture.id, 'B', repeat],
      ]).flat(),
    );
    const lanes = {};
    for (const [name, role, engine] of [
      ['L', 'A', 'legacy'],
      ['S', 'A', 'current'],
      ['E', 'B', 'current'],
    ]) {
      const selected = records.filter((record) => record.lane === role);
      if (name === 'L' && fixture.currentOnly) {
        lanes[name] = null;
        continue;
      }
      const sampleSets = selected.map((record) => record.samples[engine]);
      assert.ok(
        sampleSets.every(
          (samples) =>
            samples.length === 100 &&
            samples.every((value) => Number.isFinite(value) && value > 0),
        ),
      );
      const minimaUs = sampleSets.map((samples) => Math.min(...samples) * 1000);
      const processMediansUs = sampleSets.map(
        (samples) => median(samples) * 1000,
      );
      lanes[name] = {
        us: median(minimaUs),
        minimaUs,
        processMediansUs,
        minMedianUs: Math.min(...processMediansUs),
        maxMedianUs: Math.max(...processMediansUs),
        widthUs: Math.max(...processMediansUs) - Math.min(...processMediansUs),
      };
    }
    return {
      row: fixture.id,
      operation: fixture.operation,
      lanes,
      endOverLegacy: lanes.L ? lanes.E.us / lanes.L.us : null,
      endOverStart: lanes.E.us / lanes.S.us,
      legacyOnePointFiveUs: lanes.L ? lanes.L.us * 1.5 : null,
    };
  });
}
