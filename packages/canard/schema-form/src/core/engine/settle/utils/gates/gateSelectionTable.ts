/** Internal mutable test/bench control consumed by settlement; package exports omit it. */
export const gateSelectionTable: {
  /** Failed verification assertions, incremented immediately before throwing. */
  violations: number;
  /** Number of verify-mode assertions attempted, grouped by invariant identifier. */
  assertions: Record<string, number>;
} = {
  violations: 0,
  assertions: Object.create(null),
};
