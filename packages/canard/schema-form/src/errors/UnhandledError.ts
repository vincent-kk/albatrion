import { BaseError, type ErrorDetails } from '@winglet/common-utils/error';

/**
 * Error class for unhandled errors.
 * Used to catch and standardize unhandled exceptions in the application.
 */
export class UnhandledError extends BaseError {
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super('UNHANDLED_ERROR', code, message, details);
    this.name = 'UnhandledError';
  }
}

/**
 * Checks if the given error is of UnhandledError type.
 * @param error - Error object to check
 * @returns Whether it is UnhandledError type
 */
export const isUnhandledError = (error: unknown): error is UnhandledError =>
  error instanceof UnhandledError;
