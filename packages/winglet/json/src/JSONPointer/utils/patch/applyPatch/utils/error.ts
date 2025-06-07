import { BaseError, type ErrorDetails } from '@winglet/common-utils';

/**
 * Custom error class for JSON Patch operation failures.
 * Extends BaseError with specific error grouping for patch-related issues.
 */
export class JsonPatchError extends BaseError {
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super('JSON_PATCH', code, message, details);
    this.name = 'JsonPatch';
  }
}

/**
 * Type guard to check if an error is a JsonPatchError instance.
 * @param error - The error to check
 * @returns True if the error is a JsonPatchError
 */
export const isJsonPatchError = (error: unknown): error is JsonPatchError =>
  error instanceof JsonPatchError;
