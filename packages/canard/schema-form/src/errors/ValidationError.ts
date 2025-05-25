import { BaseError, type ErrorDetails } from '@winglet/common-utils';

/**
 * Error class for validation-related errors.
 * Used to handle errors that occur during form data validation.
 */
export class ValidationError extends BaseError {
  static readonly #group = 'VALIDATION_ERROR';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(ValidationError.#group, code, message, details);
    this.name = 'ValidationError';
  }
}

/**
 * Checks if the given error is of ValidationError type.
 * @param error - Error object to check
 * @returns Whether it is ValidationError type
 */
export const isValidationError = (error: unknown): error is ValidationError =>
  error instanceof ValidationError;
