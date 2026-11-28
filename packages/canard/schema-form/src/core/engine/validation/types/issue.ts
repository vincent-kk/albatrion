import type { Dictionary } from '@aileron/declare';

/** A normalized validation result; dataPath is a JSON Pointer without a fragment marker. */
export interface ValidationIssue<SourceError = unknown> {
  /** Location of the rejected value, with an empty string for the root. */
  dataPath: string;
  /** Validator keyword that rejected the input. */
  keyword?: string;
  /** Displayable explanation supplied by the validator. */
  message?: string;
  /**
   * Schema location of the failing keyword, using a URI fragment when available. A validator
   * may write it relative to a reference it passed through. The form hides an issue of an
   * unselected `oneOf`/`anyOf` branch only when the union segments this location shows and
   * `dataPath` decide the branch; an issue it cannot attribute stays visible.
   */
  schemaPath?: string;
  /** Rejected property key whose owning node receives the issue. */
  rejectedKey?: string;
  /** Keyword-specific parameters without a prescribed shape. */
  details?: Dictionary<unknown>;
  /** Validator-specific original issue. */
  source?: SourceError;
}
