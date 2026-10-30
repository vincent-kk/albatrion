// Loaded by summarize; canonical row operations and eventWeights own event multiplicity.
import assert from 'node:assert/strict';

/**
 * Count proved per-event differences with the owner's relative session weights.
 * @param {object[]} rows - Recomputed A/A-prime/B rows from one immutable window
 * @param {object} weights - Row-id entries with weight, eventsPerSample and basis
 * @returns {object} Contributions, weighted A baseline and all exchange protections
 */
export function weightedExchange(rows, weights) {
  assert.equal(Object.keys(weights).length, rows.length);
  const contributions = rows.map((row) => {
    const entry = weights[row.id];
    assert.ok(
      entry &&
        entry.weight > 0 &&
        Number.isInteger(entry.eventsPerSample) &&
        entry.eventsPerSample > 0 &&
        typeof entry.basis === 'string' &&
        entry.basis.length,
    );
    const AUs = (row.A.ms * 1000) / entry.eventsPerSample;
    const BUs = (row.B.ms * 1000) / entry.eventsPerSample;
    assert.ok(
      Number.isFinite(AUs) && AUs > 0 && Number.isFinite(BUs) && BUs > 0,
    );
    const rawDeltaUs = BUs - AUs;
    const deltaUs = row.decision === 'unproven' ? 0 : rawDeltaUs;
    return {
      row: row.id,
      ...entry,
      mount: row.operation === 'mount',
      decision: row.decision,
      AUs,
      BUs,
      rawDeltaUs,
      deltaUs,
      contributionUs: entry.weight * deltaUs,
      weightedAUs: entry.weight * AUs,
    };
  });
  const totalUs = contributions.reduce(
    (sum, row) => sum + row.contributionUs,
    0,
  );
  const weightedAUs = contributions.reduce(
    (sum, row) => sum + row.weightedAUs,
    0,
  );
  const judged = contributions.map((row) => {
    const verdict =
      row.decision !== 'regressed'
        ? row.decision === 'improved'
          ? 'improved'
          : 'in-width'
        : row.mount && totalUs < 0
          ? 'exchange-allowed'
          : 'regressed';
    return { ...row, verdict, passed: verdict !== 'regressed' };
  });
  return {
    totalUs,
    weightedAUs,
    relativePercent: (100 * totalUs) / weightedAUs,
    rows: judged,
    passed: totalUs <= 0 && judged.every((row) => row.passed),
    method:
      'A is the first A-half representative; within-width deltas are zero before weighting. Mount regressions require a strictly negative exchange; write regressions are never exchanged.',
  };
}
