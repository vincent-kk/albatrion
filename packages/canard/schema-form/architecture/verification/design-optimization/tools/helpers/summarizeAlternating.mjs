import assert from 'node:assert/strict';

/** Return the median without changing process order. */
export function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
}

/** Preserve minima and their range beside the representative median. */
function statistics(values) {
  return {
    ms: median(values),
    widthMs: Math.max(...values) - Math.min(...values),
    minimaMs: values,
  };
}

/** Compare identical legacy lanes over both roles' complete process sets. */
function legacyStatistics(row, results) {
  if (row.currentOnly) return null;
  const minima = Object.fromEntries(
    ['A', 'B'].map((lane) => [
      lane,
      results
        .filter((r) => r.row === row.id && r.lane === lane)
        .map((r) => r.minima.legacy),
    ]),
  );
  if (
    !minima.A.length ||
    minima.A.length !== minima.B.length ||
    ![...minima.A, ...minima.B].every((v) => Number.isFinite(v) && v > 0)
  )
    return null;
  const A = statistics(minima.A);
  const B = statistics(minima.B);
  return { A, B, ratio: B.ms / A.ms };
}

/** Split A by process order while retaining all B processes and all-A quality. */
export function summarizeAlternating(
  rows,
  results,
  qualityMode = 'branchless',
) {
  const summary = rows.map((row) => {
    const minima = Object.fromEntries(
      ['A', 'B'].map((lane) => [
        lane,
        results
          .filter((r) => r.row === row.id && r.lane === lane)
          .sort((a, b) => a.repeat - b.repeat)
          .map((r) => r.minima.current),
      ]),
    );
    assert.ok(minima.A.length >= 2 && minima.A.length % 2 === 0);
    assert.equal(minima.A.length, minima.B.length);
    assert.ok(
      [...minima.A, ...minima.B].every((v) => Number.isFinite(v) && v > 0),
    );
    const half = minima.A.length / 2;
    const A = statistics(minima.A.slice(0, half));
    const Aprime = statistics(minima.A.slice(half));
    const Aall = statistics(minima.A);
    const B = statistics(minima.B);
    const legacy = legacyStatistics(row, results);
    const currentRatio = B.ms / Aall.ms;
    const widthMs = Math.max(
      Math.abs(A.ms - Aprime.ms),
      A.widthMs,
      Aprime.widthMs,
    );
    return {
      ...row,
      A,
      Aprime,
      Aall,
      B,
      legacy,
      legacyRatio: legacy?.ratio ?? null,
      currentRatio,
      ratioOfRatios: legacy ? currentRatio / legacy.ratio : null,
      widthMs,
      decision:
        B.ms < A.ms - widthMs && B.ms < Aprime.ms
          ? 'improved'
          : B.ms > A.ms + widthMs && B.ms > Aprime.ms
            ? 'regressed'
            : 'unproven',
    };
  });
  const control = summary.find((row) => row.id === 'single-flat-1000');
  const ratio = control ? control.B.ms / control.Aall.ms : null;
  if (qualityMode === 'legacy') {
    const available = summary.filter((row) => row.legacyRatio !== null);
    const ratio = available.length
      ? median(available.map((row) => row.legacyRatio))
      : null;
    return {
      rows: summary,
      quality: {
        kind: 'legacy',
        ratio,
        passed: ratio !== null && ratio >= 0.95 && ratio <= 1.05,
        assessedRows: available.length,
        rows: available.map((row) => ({ id: row.id, ratio: row.legacyRatio })),
        omittedRows: summary
          .filter((row) => row.legacyRatio === null)
          .map((row) => ({ id: row.id, reason: 'No compatible legacy lane' })),
      },
    };
  }
  return {
    rows: summary,
    quality: control
      ? { row: control.id, ratio, passed: ratio >= 0.95 && ratio <= 1.05 }
      : null,
  };
}
