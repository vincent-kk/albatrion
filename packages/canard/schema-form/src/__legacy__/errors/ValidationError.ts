import { BaseError, type ErrorDetails } from '@winglet/common-utils/error';

/**
 * Error class for form submission validation errors.
 *
 * Thrown during the form submission process when validation fails.
 * This is separate from AJV validation errors and specifically handles
 * validation failures that occur in the onSubmit phase.
 *
 * Currently used for:
 * - Schema validation failures during form submission
 *
 * @remarks
 * Error details typically include:
 * - value: The form data that failed validation
 * - errors: Array of validation errors
 * - jsonSchema: The schema used for validation
 */
export class ValidationError extends BaseError {
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super('VALIDATION_ERROR', code, message, details);
    this.name = 'ValidationError';
  }
}

/**
 * Type guard to check if an error is a ValidationError instance.
 *
 * @param error - Error object to check
 * @returns Whether the error is a ValidationError instance
 */
export const isValidationError = (error: unknown): error is ValidationError =>
  error instanceof ValidationError;
