/** Internal test/bench switch; package entry points never expose these modes or counters. */
export const gateWheelEvaluation: {
  mode: 'skip' | 'record' | 'shadow';
  skipped: number;
  predictions: number;
  confirmations: number;
  missed: number;
  nonNoop: number;
} = {
  mode: 'skip',
  skipped: 0,
  predictions: 0,
  confirmations: 0,
  missed: 0,
  nonNoop: 0,
};
