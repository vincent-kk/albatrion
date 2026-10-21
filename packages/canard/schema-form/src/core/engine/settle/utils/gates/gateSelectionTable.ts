/** Internal mutable test/bench control consumed by settlement; package exports omit it. */
export const gateSelectionTable: {
  /** Table is the shipped path; off is the full-evaluation reference and verify checks both. */
  mode: 'table' | 'off' | 'verify';
  /** Failed verification assertions, incremented immediately before throwing. */
  violations: number;
  /** Number of verify-mode assertions attempted, grouped by invariant identifier. */
  assertions: Record<string, number>;
} = {
  mode: 'table',
  violations: 0,
  assertions: Object.create(null),
};
