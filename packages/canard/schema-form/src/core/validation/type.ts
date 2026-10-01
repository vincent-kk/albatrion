import type { BlueprintSchema } from '../blueprint';

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
  details?: Record<string, unknown>;
  /** Validator-specific original issue. */
  source?: SourceError;
}

/**
 * Synchronous guard verdict; asynchronous formats and keywords are unsupported.
 * @param value - Emitted value to check without modification.
 * @returns Whether this value satisfies the guard.
 */
export type GuardFunction = (value: unknown) => boolean;

/**
 * Returns the verdict for its input and never throws; a throw is an execution failure.
 * Engine contract; the public `ValidateFunction` in `src/types/error.ts` keeps its legacy shape until PR-7.
 * @param data - Emitted value to check without modifying it.
 * @returns Ordered issues, or null when the value is valid.
 */
export type ValidateFunction<Value = unknown> = (
  data: Value,
) => Promise<readonly ValidationIssue[] | null> | readonly ValidationIssue[] | null;

/**
 * Compiles validation and synchronous guards for the authored schema.
 * Core passes the emitted tree by reference to compile results and guards.
 * Validators and guards must not modify the received value or schema.
 * Not using value-modifying custom keywords (ajv `modifying: true`) is the consumer's responsibility.
 * Guards do not support asynchronous formats or keywords.
 */
export interface Validator {
  /**
   * Compile a schema copy into a validator that returns issues rather than throwing.
   * @param copy - Engine-owned validation copy of the authored root.
   * @returns A function that reports ordered validation issues.
   */
  compile(copy: BlueprintSchema): ValidateFunction;
  /**
   * Compile a synchronous guard for a pointer in the authored root.
   * @param root - Authored root retained by the validation cache.
   * @param pointer - Schema location whose condition must be checked.
   * @returns A synchronous boolean predicate.
   */
  compileGuard(root: BlueprintSchema, pointer: string): GuardFunction;
  /**
   * Release engine-owned resources when a root leaves the cache.
   * @param root - Authored root whose cache entry was evicted.
   * @returns Nothing; resources associated with the root are discarded.
   */
  release?(root: BlueprintSchema): void;
  /** JSON Schema dialect understood by this validator, when declared. */
  readonly dialect?: string;
}
