/** A caller-visible refusal of AJV options that modify input values. */
export class ValidatorBindRefusedError extends Error {
  /** Error family shared with other caller-facing plugin failures. */
  readonly group = 'UNHANDLED_ERROR';
  /** Stable code for structural discrimination by consumers. */
  readonly code = 'VALIDATOR_BIND_REFUSED';
  /** Names of the active options that prevent binding. */
  readonly details: { options: readonly string[] };

  /**
   * Records the options that would violate the validator's immutability contract.
   * @param options - Enabled value-modifying AJV option names.
   */
  constructor(options: readonly string[]) {
    super(`AJV instance changes validated values: ${options.join(', ')}`);
    this.name = 'ValidatorBindRefusedError';
    this.details = { options };
  }
}
