import { BaseError, type ErrorDetails } from './BaseError';

export class InvalidTypeError extends BaseError {
  static readonly #group = 'INVALID_TYPE';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(InvalidTypeError.#group, code, message, details);
    this.name = 'InvalidType';
  }
}

export const isInvalidTypeError = (
  error: unknown,
): error is InvalidTypeError => {
  return error instanceof InvalidTypeError;
};
