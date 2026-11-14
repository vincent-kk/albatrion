import { expect } from 'vitest';

import {
  type HiddenInputComparisonState,
  compareHiddenInput,
} from './utils/compareHiddenInput';

/** Repeat fresh input mounts while collecting every immediate reveal mismatch.
 * @param runs - Positive number of independent mounts required by this scenario.
 * @param label - Boundary and producer parameters printed with the measured rate.
 * @param run - Mount/write/reveal/cleanup procedure using the supplied comparison.
 * @returns Resolves only when every mount shows its current node value.
 */
export const repeatHiddenInput = async (
  runs: number,
  label: string,
  run: (
    cycle: number,
    compare: (readValue: () => string, expected: string) => Promise<boolean>,
  ) => Promise<void>,
): Promise<void> => {
  const state: HiddenInputComparisonState = {
    failures: [],
    staleAfterTimeout: false,
  };
  for (let cycle = 0; cycle < runs; cycle++)
    await run(cycle, (readValue, expected) =>
      compareHiddenInput(readValue, expected, state, cycle),
    );
  console.info(
    `${label}: ${state.failures.length}/${runs} failures; staleAfter1100ms=${state.staleAfterTimeout}`,
  );
  expect(state.failures).toEqual([]);
};
