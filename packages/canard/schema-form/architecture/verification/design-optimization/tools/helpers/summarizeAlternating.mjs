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

/** Split A by process order while retaining all B processes and all-A quality. */
export function summarizeAlternating(rows, results) {
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
  return {
    rows: summary,
    quality: control
      ? { row: control.id, ratio, passed: ratio >= 0.95 && ratio <= 1.05 }
      : null,
  };
}
