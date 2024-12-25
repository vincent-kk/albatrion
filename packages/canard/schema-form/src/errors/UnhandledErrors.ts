import { BaseError, type ErrorDetails } from './BaseError';

export class UnhandledError extends BaseError {
  static readonly #group = 'UNHANDLED_ERROR';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(`${UnhandledError.#group}.${code}`, message, details);
    this.name = 'UnhandledError';
  }
}

export const isUnhandledError = (error: unknown): error is UnhandledError => {
  return error instanceof UnhandledError;
};
