import { BaseError, type ErrorDetails } from './BaseError';

/**
 * Error thrown when an operation does not complete within the specified time
 * Used for asynchronous operations with time limits
 */
export class TimeoutError extends BaseError {
  /**
   * TimeoutError constructor
   * @param code - Specific error code
   * @param message - Error message
   * @param details - Additional error information
   */
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super('TIMEOUT', code, message, details);
    this.name = 'Timeout';
  }
}

/**
 * Type guard function to check if the given error is a TimeoutError
 * @param error - The error object to check
 * @returns Whether the error is a TimeoutError
 */
export const isTimeoutError = (error: unknown): error is TimeoutError =>
  error instanceof TimeoutError;
