import { BaseError, type ErrorDetails } from '@winglet/common-utils/error';

/**
 * Custom error class for JSON Patch operation failures.
 * Extends BaseError with specific error grouping for patch-related issues.
 */
export class JSONPatchError extends BaseError {
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super('JSON_PATCH', code, message, details);
    this.name = 'JSONPatch';
  }
}

/**
 * Type guard to check if an error is a JSONPatchError instance.
 * @param error - The error to check
 * @returns True if the error is a JSONPatchError
 */
export const isJSONPatchError = (error: unknown): error is JSONPatchError =>
  error instanceof JSONPatchError;
