/** Internal test/bench switch reserved for table selection; package exports omit it. */
export const gateSelectionTable: {
  /** Off preserves full evaluation; verify checks the future table path's invariants. */
  mode: 'table' | 'off' | 'verify';
  /** Failed verification assertions, incremented immediately before throwing. */
  violations: number;
} = {
  mode: 'off',
  violations: 0,
};
