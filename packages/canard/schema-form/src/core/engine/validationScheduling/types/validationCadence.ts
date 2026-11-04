/** Domain-free lifetime owned by the caller. */
export interface ValidationCadence {
  /** Record every incoming request, including requests while a run is pending. */
  request: () => void;
  /** Permanently stop all future callbacks and pending work. */
  cancel: () => void;
}

/** Internal phase and host ownership; no validation-domain state enters this record. */
export interface ValidationCadenceState {
  /** Synchronous start of the caller's work; completion is owned by the caller. */
  run: () => boolean;
  /** Injected monotone clock in milliseconds. */
  now: () => number;
  /** Current timing phase. */
  phase: 'idle' | 'leading' | 'watch' | 'carry' | 'running' | 'fallback';
  /** A request since the most recent run start or observed frame. */
  requested: boolean;
  /** Time the most recent automatic callback started. */
  lastRun?: number;
  /** Permanent cancellation state. */
  cancelled: boolean;
  /** All currently pending host handles, cancelled together. */
  cancelPending?: () => void;
}
