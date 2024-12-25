import { BaseError, type ErrorDetails } from './BaseError';

export class SchemaNodeError extends BaseError {
  static readonly #group = 'SCHEMA_NODE_ERROR';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(`${SchemaNodeError.#group}.${code}`, message, details);
    this.name = 'SchemaNodeError';
  }
}

export const isSchemaNodeError = (error: unknown): error is SchemaNodeError => {
  return error instanceof SchemaNodeError;
};
