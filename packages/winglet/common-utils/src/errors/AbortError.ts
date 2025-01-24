import { BaseError, type ErrorDetails } from './BaseError';

export class AbortError extends BaseError {
  static readonly #group = 'ABORT';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(AbortError.#group, code, message, details);
    this.name = 'Abort';
  }
}

export const isAbortError = (error: unknown): error is AbortError => {
  return error instanceof AbortError;
};
