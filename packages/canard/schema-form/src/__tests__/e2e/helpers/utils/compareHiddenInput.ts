import { waitFor } from '@testing-library/react';
import { expect } from 'vitest';

/** Failure evidence shared by one repeated input scenario. */
export interface HiddenInputComparisonState {
  /** Every mismatch, retained until the scenario's final assertion. */
  failures: { cycle: number; actual: string; expected: string }[];
  /** Whether the first mismatch outlives the reveal timeout. */
  staleAfterTimeout: boolean;
}

/** Capture the revealed DOM immediately and check the first mismatch for persistence.
 * @param readValue - Read the current input again after React may replace its DOM.
 * @param expected - Text corresponding to the current node value.
 * @param state - Scenario evidence mutated only when a mismatch occurs.
 * @param cycle - Fresh mount identifying this mismatch in the final failure.
 * @returns Whether the immediate DOM value is stale, even if it later catches up.
 */
export const compareHiddenInput = async (
  readValue: () => string,
  expected: string,
  state: HiddenInputComparisonState,
  cycle: number,
): Promise<boolean> => {
  const actual = readValue();
  if (actual === expected) return false;
  state.failures.push({ cycle, actual, expected });
  if (state.failures.length === 1)
    await waitFor(() => expect(readValue()).toBe(expected), {
      timeout: 1100,
    }).catch(() => {
      state.staleAfterTimeout = true;
    });
  return true;
};
