import { BaseError } from '@winglet/common-utils/error';

/** Scanner failure with a stable, unprefixed code for callers and future reference outcomes. */
export class JSONSchemaScanError extends BaseError {
  /** The scanner contract exposes the specific code rather than BaseError's grouped spelling. */
  public readonly code: string;

  /**
   * Create a scanner failure while retaining the shared diagnostic fields.
   * @param code Stable scanner reason, such as schema-cycle or scan-in-progress.
   * @param message Human-readable explanation without caller data mutation.
   */
  constructor(code: string, message: string) {
    super('JSON_SCHEMA_SCAN', code, message);
    this.code = code;
    this.name = 'JSONSchemaScanError';
  }
}
