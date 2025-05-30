import { BaseError, type ErrorDetails } from '@/common-utils/errors/BaseError';

export class JSONPointerError extends BaseError {
  static readonly #group = 'JSON_POINTER';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(JSONPointerError.#group, code, message, details);
    this.name = 'JSONPointer';
  }
}

export const isJSONPointerError = (error: unknown): error is JSONPointerError =>
  error instanceof JSONPointerError;
