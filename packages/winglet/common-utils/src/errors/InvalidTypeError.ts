import { BaseError, type ErrorDetails } from './BaseError';

/**
 * Error thrown when an invalid type is encountered
 * Can occur during type validation or conversion processes
 */
export class InvalidTypeError extends BaseError {
  /**
   * InvalidTypeError constructor
   * @param code - Specific error code
   * @param message - Error message
   * @param details - Additional error information
   */
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super('INVALID_TYPE', code, message, details);
    this.name = 'InvalidType';
  }
}

/**
 * Type guard function to check if the given error is an InvalidTypeError
 * @param error - The error object to check
 * @returns Whether the error is an InvalidTypeError
 */
export const isInvalidTypeError = (error: unknown): error is InvalidTypeError =>
  error instanceof InvalidTypeError;
