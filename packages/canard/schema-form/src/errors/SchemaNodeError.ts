import { BaseError, type ErrorDetails } from '@winglet/common-utils/error';

/**
 * Error class for schema node-related errors.
 * Used to handle issues that occur during node processing.
 */
export class SchemaNodeError extends BaseError {
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super('SCHEMA_NODE_ERROR', code, message, details);
    this.name = 'SchemaNodeError';
  }
}

/**
 * Checks if the given error is of SchemaNodeError type.
 * @param error - Error object to check
 * @returns Whether it is SchemaNodeError type
 */
export const isSchemaNodeError = (error: unknown): error is SchemaNodeError =>
  error instanceof SchemaNodeError;
