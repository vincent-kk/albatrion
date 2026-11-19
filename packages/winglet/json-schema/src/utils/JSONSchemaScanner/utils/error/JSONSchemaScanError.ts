import type { BaseError as RootBaseError } from '@winglet/common-utils';
import { BaseError as RuntimeBaseError } from '@winglet/common-utils/error';

import type { JSONSchemaScanErrorCode } from './JSONSchemaScanErrorCode';

/** Root declarations remain resolvable under legacy module resolution. */
const BaseError: typeof RootBaseError = RuntimeBaseError;

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
