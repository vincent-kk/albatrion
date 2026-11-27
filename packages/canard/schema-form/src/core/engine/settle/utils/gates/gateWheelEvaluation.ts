/** Internal test/bench switch; package entry points never expose these modes or counters. */
export const gateWheelEvaluation: {
  /** Confirmation wheels omitted after all skip conditions hold. */
  skipCount: number;
  /** Wheels satisfying the skip predicate in skip, record or shadow mode. */
  predictionCount: number;
  /** Predicted wheels whose shadow execution was confirmed to be a no-op. */
  confirmationCount: number;
  /** Executed no-op confirmation wheels that the predicate did not predict. */
  missCount: number;
  /** Predicted no-op wheels whose shadow execution changed an observation. */
  nonNoop: number;
} = {
  skipCount: 0,
  predictionCount: 0,
  confirmationCount: 0,
  missCount: 0,
  nonNoop: 0,
};
