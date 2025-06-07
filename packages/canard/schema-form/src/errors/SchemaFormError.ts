import { BaseError, type ErrorDetails } from '@winglet/common-utils';

/**
 * Base error class for schema form-related errors.
 * Used to handle issues that occur during form processing.
 */
export class SchemaFormError extends BaseError {
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super('SCHEMA_FORM_ERROR', code, message, details);
    this.name = 'SchemaFormError';
  }
}

/**
 * Checks if the given error is of SchemaFormError type.
 * @param error - Error object to check
 * @returns Whether it is SchemaFormError type
 */
export const isSchemaFormError = (error: unknown): error is SchemaFormError =>
  error instanceof SchemaFormError;
