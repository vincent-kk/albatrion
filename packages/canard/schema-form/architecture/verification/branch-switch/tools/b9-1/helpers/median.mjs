import assert from 'node:assert/strict';

/** Return a finite nonempty sample's median without mutating process order. */
export function median(values) {
  assert.ok(values.length && values.every(Number.isFinite));
  const sorted = values.toSorted((a, b) => a - b);
  const middle = (sorted.length - 1) / 2;
  return (sorted[Math.floor(middle)] + sorted[Math.ceil(middle)]) / 2;
}
