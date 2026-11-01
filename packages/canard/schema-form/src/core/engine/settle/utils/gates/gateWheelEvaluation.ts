/** Internal test/bench switch; package entry points never expose these modes or counters. */
export const gateWheelEvaluation: {
  /** Confirmation wheels omitted after all skip conditions hold. */
  skipped: number;
  /** Wheels satisfying the skip predicate in skip, record or shadow mode. */
  predictions: number;
  /** Predicted wheels whose shadow execution was confirmed to be a no-op. */
  confirmations: number;
  /** Executed no-op confirmation wheels that the predicate did not predict. */
  missed: number;
  /** Predicted no-op wheels whose shadow execution changed an observation. */
  nonNoop: number;
} = {
  skipped: 0,
  predictions: 0,
  confirmations: 0,
  missed: 0,
  nonNoop: 0,
};
