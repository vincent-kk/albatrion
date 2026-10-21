import type { gateSelectionTable } from '../../utils/gates/gateSelectionTable';

/**
 * Exact per-branch calls in record wheels: four rounds on first fill, two thereafter.
 * Off calls one root and three child gates; verify calls only the three S1 expressions.
 */
export const expectedGateSelectionCalls = (
  mode: typeof gateSelectionTable.mode,
  first: boolean,
): { expressions: number; gates: number } => {
  const rounds = first ? 4 : 2;
  return {
    expressions:
      mode === 'off' ? 4 * rounds : mode === 'verify' ? 3 * rounds : 0,
    gates: mode === 'off' ? 4 * rounds : 0,
  };
};
