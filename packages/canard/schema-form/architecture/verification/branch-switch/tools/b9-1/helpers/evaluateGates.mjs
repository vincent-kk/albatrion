import assert from 'node:assert/strict';

/**
 * Apply the fixed B9-1 within-window gates without interpreting diagnostic absolute budgets.
 * @param {object} input Recomputed quality, TEST-073 count, row decision, stage totals and heap.
 * @returns {object} Individual verdicts and their conjunction; malformed evidence throws.
 */
export function evaluateGates(input) {
  const expected = [
    'primeHost',
    'selectChildren',
    'registerPresenceChanges',
    'commitSettlement',
  ];
  assert.deepEqual(
    input.siblingStages.map((stage) => stage.name),
    expected,
  );
  assert.deepEqual(
    input.protectedTotals.map((row) => row.row),
    ['switch-oneOf-80', 'switch-siblings-0'],
  );
  for (const stage of input.siblingStages)
    assert.ok(Number.isFinite(stage.A) && Number.isFinite(stage.B));
  for (const row of input.protectedTotals)
    assert.ok(Number.isFinite(row.Amax) && Number.isFinite(row.Bmedian));
  assert.ok(
    Number.isFinite(input.heap.Amax) && Number.isFinite(input.heap.Bmedian),
  );
  const gates = {
    quality: input.quality === true,
    test073: input.regressions === 0,
    siblings: input.siblingDecision === 'improved',
    stages: input.siblingStages.every((stage) => stage.B < stage.A),
    protectedTotals:
      input.protectedTotals.length === 2 &&
      input.protectedTotals.every((row) => row.Bmedian <= row.Amax),
    nodeHeap: input.heap.Bmedian <= input.heap.Amax,
  };
  return { ...gates, passed: Object.values(gates).every(Boolean) };
}
