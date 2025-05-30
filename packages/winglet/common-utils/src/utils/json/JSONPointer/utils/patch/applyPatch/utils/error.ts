import { BaseError, type ErrorDetails } from '@/common-utils/errors/BaseError';

/**
 * Custom error class for JSON Patch operation failures.
 * Extends BaseError with specific error grouping for patch-related issues.
 */
export class JsonPatchError extends BaseError {
  static readonly #group = 'JSON_PATCH';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(JsonPatchError.#group, code, message, details);
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
