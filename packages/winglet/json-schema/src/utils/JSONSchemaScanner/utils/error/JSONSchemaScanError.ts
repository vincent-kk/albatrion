import { BaseError } from '@winglet/common-utils/error';

import type { JSONSchemaScanErrorCode } from './JSONSchemaScanErrorCode';

/** Scanner and reference-resolver failure identified by a code from JSONSchemaScanErrorCode. */
export class JSONSchemaScanError extends BaseError {
  /** The scanner contract exposes the specific code rather than BaseError's grouped spelling. */
  public readonly code: JSONSchemaScanErrorCode;

  /**
   * Create a scanner failure while retaining the shared diagnostic fields.
   * @param code Entry of JSONSchemaScanErrorCode naming the failure.
   * @param message Human-readable explanation of the failure.
   */
  constructor(code: JSONSchemaScanErrorCode, message: string) {
    super('JSON_SCHEMA_SCAN', code, message);
    this.code = code;
    this.name = 'JSONSchemaScanError';
  }
}
