import { BaseError, type ErrorDetails } from '@winglet/common-utils/error';

/**
 * Error class for schema form construction errors.
 *
 * Thrown when there are issues during the form building process,
 * particularly when mapping form types to input components fails.
 *
 * Currently used for:
 * - Invalid key patterns in FormTypeInputMap configuration
 *
 * @remarks
 * Error details typically include:
 * - path: The input path that caused the error
 * - error: The underlying error that occurred
 */
export class SchemaFormError extends BaseError {
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super('SCHEMA_FORM_ERROR', code, message, details);
    this.name = 'SchemaFormError';
  }
}

/**
 * Type guard to check if an error is a SchemaFormError instance.
 *
 * @param error - Error object to check
 * @returns Whether the error is a SchemaFormError instance
 */
export const isSchemaFormError = (error: unknown): error is SchemaFormError =>
  error instanceof SchemaFormError;
