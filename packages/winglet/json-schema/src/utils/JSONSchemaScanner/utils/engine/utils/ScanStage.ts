/** Ordered continuation labels; comparisons skip callback stages completed before suspension. */
export const enum ScanStage {
  /** Invoke the filter, or proceed when none is configured. */
  Filter,
  /** Consume a synchronous or awaited filter result. */
  FilterResult,
  /** Invoke mutation before entry. */
  Mutate,
  /** Apply a synchronous or awaited mutation result. */
  MutateResult,
  /** Invoke entry before reference processing. */
  Enter,
  /** Resolve one reference, or continue to child discovery. */
  Reference,
  /** Apply a synchronous or awaited reference result. */
  ReferenceResult,
  /** Capture all children before visiting any of them. */
  Children,
  /** Invoke exit once all children have completed. */
  Exit,
  /** Release the active reference and remove the completed frame. */
  Pop,
}
