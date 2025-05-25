import { BaseError, type ErrorDetails } from './BaseError';

/**
 * Error thrown when an operation is cancelled
 * Can be triggered by AbortController or manual cancellation
 */
export class AbortError extends BaseError {
  static readonly #group = 'ABORT';
  /**
   * AbortError constructor
   * @param code - Specific error code
   * @param message - Error message
   * @param details - Additional error information
   */
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(AbortError.#group, code, message, details);
    this.name = 'Abort';
  }
}

/**
 * Type guard function to check if the given error is an AbortError
 * @param error - The error object to check
 * @returns Whether the error is an AbortError
 */
export const isAbortError = (error: unknown): error is AbortError =>
  error instanceof AbortError;
