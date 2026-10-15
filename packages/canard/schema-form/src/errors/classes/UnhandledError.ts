import { BaseError, type ErrorDetails } from '@winglet/common-utils/error';

import { FormErrorGroup } from '../constants/FormErrorGroup';
import { getCodeSpecific } from '../utils/getCodeSpecific';
import type { UnhandledErrorCode } from '../type';

/** Group every UnhandledError code carries; the code value repeats it before the bare name. */
const GROUP = FormErrorGroup.Unhandled;

/**
 * Error class for unexpected or undefined errors.
 *
 * Wraps errors that don't fall into specific error categories,
 * providing a standardized format for unexpected exceptions.
 *
 * Currently used for:
 * - Plugin registration failures
 *
 * @remarks
 * Error details typically include:
 * - plugin: Information about the plugin that failed
 * - error: The original error that occurred
 */
export class UnhandledError extends BaseError {
  constructor(
    code: UnhandledErrorCode,
    message: string,
    details: ErrorDetails = {},
  ) {
    super(GROUP, getCodeSpecific(code), message, details);
    this.name = GROUP;
  }
}

/**
 * Type guard to check if an error is an UnhandledError instance.
 *
 * @param error - Error object to check
 * @returns Whether the error is an UnhandledError instance
 */
export const isUnhandledError = (error: unknown): error is UnhandledError =>
  error instanceof UnhandledError;
