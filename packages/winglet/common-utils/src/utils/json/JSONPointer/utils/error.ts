import { BaseError, type ErrorDetails } from '@/common-utils/errors/BaseError';

export class JSONPointerError extends BaseError {
  private static readonly __group__ = 'JSON_POINTER';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(JSONPointerError.__group__, code, message, details);
    this.name = 'JSONPointer';
  }
}

export const isJSONPointerError = (error: unknown): error is JSONPointerError =>
  error instanceof JSONPointerError;
