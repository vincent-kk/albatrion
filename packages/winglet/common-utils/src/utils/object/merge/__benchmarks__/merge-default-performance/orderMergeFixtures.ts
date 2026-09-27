import type { MergePerformanceFixture } from './type';

/**
 * Shuffle fixture order reproducibly without selecting favorable measured results.
 * @param fixtures - Canonical corpus whose original order is preserved.
 * @param seed - Recorded process repetition seed.
 * @returns A deterministic Fisher-Yates permutation for this process.
 */
export const orderMergeFixtures = (
  fixtures: readonly MergePerformanceFixture[],
  seed: number,
): MergePerformanceFixture[] => {
  const ordered = [...fixtures];
  let state = seed >>> 0;
  for (let index = ordered.length - 1; index > 0; index--) {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    const other = state % (index + 1);
    [ordered[index], ordered[other]] = [ordered[other], ordered[index]];
  }
  return ordered;
};
