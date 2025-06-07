import { BaseError, type ErrorDetails } from '@winglet/common-utils';

export class JSONPointerError extends BaseError {
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super('JSON_POINTER', code, message, details);
    this.name = 'JSONPointer';
  }
}

export const isJSONPointerError = (error: unknown): error is JSONPointerError =>
  error instanceof JSONPointerError;
