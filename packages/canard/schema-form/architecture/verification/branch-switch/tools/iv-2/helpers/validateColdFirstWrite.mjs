import assert from 'node:assert/strict';

import { median } from '../../b9-1/helpers/median.mjs';

/**
 * Recompute symmetric cold additions from their retained samples before judgment.
 * @param {object} cold - Fresh-form first-write records from the approved window
 * @returns The original validated record; no timing or mutation occurs
 */
export function validateColdFirstWrite(cold) {
  assert.equal(cold.warmups, 0);
  assert.equal(cold.sampleCount, 100);
  assert.deepEqual(
    cold.records.map((row) => row.row),
    ['mount-oneOf-80', 'mount-flat-1000', 'mount-nested-d6-f4'],
  );
  for (const row of cold.records) {
    for (const lane of ['A', 'B']) {
      assert.equal(row.samples[lane].length, 100);
      assert.ok(
        row.samples[lane].every((value) => Number.isFinite(value) && value > 0),
      );
      assert.equal(row[lane + 'ColdUs'], median(row.samples[lane]));
      assert.equal(row.formsCreated[lane], 100);
    }
    assert.equal(row.medianUs, Math.max(0, row.BColdUs - row.AColdUs));
  }
  return cold;
}
