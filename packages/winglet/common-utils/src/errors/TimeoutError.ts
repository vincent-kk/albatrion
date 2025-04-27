import { BaseError, type ErrorDetails } from './BaseError';

export class TimeoutError extends BaseError {
  static readonly #group = 'TIMEOUT';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(TimeoutError.#group, code, message, details);
    this.name = 'Timeout';
  }
}

export const isTimeoutError = (error: unknown): error is TimeoutError =>
  error instanceof TimeoutError;
