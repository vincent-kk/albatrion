import assert from 'node:assert/strict';

/** Preserve the two endpoints' same-call pairing before taking their median. */
export function endpointDifference95c01(sentinel, microtask) {
  assert(sentinel.length > 0 && sentinel.length === microtask.length);
  const differences = sentinel.map((value, index) => value - microtask[index]);
  assert(differences.every(Number.isFinite));
  differences.sort((a, b) => a - b);
  return differences[Math.ceil(differences.length * .5) - 1];
}
