import { BaseError, type ErrorDetails } from '@winglet/common-utils';

export class SchemaNodeError extends BaseError {
  static readonly #group = 'SCHEMA_NODE_ERROR';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(SchemaNodeError.#group, code, message, details);
    this.name = 'SchemaNodeError';
  }
}

export const isSchemaNodeError = (error: unknown): error is SchemaNodeError =>
  error instanceof SchemaNodeError;
