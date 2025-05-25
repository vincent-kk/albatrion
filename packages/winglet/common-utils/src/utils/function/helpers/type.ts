/**
 * Function execution control options
 */
export type ExecutionOptions = {
  /** AbortSignal to stop function execution */
  signal?: AbortSignal;
  /** Whether to execute function immediately at start */
  leading?: boolean;
  /** Whether to execute function at end */
  trailing?: boolean;
};
