import type { Dictionary } from '@aileron/declare';

/** A normalized validation result; dataPath is a JSON Pointer without a fragment marker. */
export interface ValidationIssue<SourceError = unknown> {
  /** Location of the rejected value, with an empty string for the root. */
  dataPath: string;
  /** Validator keyword that rejected the input. */
  keyword?: string;
  /** Displayable explanation supplied by the validator. */
  message?: string;
  /** Authored schema location, using a URI fragment when available. */
  schemaPath?: string;
  /** Rejected property key whose owning node receives the issue. */
  rejectedKey?: string;
  /** Keyword-specific parameters without a prescribed shape. */
  details?: Dictionary<unknown>;
  /** Validator-specific original issue. */
  source?: SourceError;
}
