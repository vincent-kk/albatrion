import { BaseError, type ErrorDetails } from '@winglet/common-utils';

export class ValidationError extends BaseError {
  static readonly #group = 'VALIDATION_ERROR';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(ValidationError.#group, code, message, details);
    this.name = 'ValidationError';
  }
}

export const isValidationError = (error: unknown): error is ValidationError =>
  error instanceof ValidationError;
