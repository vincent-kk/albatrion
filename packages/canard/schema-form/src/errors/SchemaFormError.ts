import { BaseError, type ErrorDetails } from '@winglet/common-utils';

export class SchemaFormError extends BaseError {
  static readonly #group = 'SCHEMA_FORM_ERROR';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(SchemaFormError.#group, code, message, details);
    this.name = 'SchemaFormError';
  }
}

export const isSchemaFormError = (error: unknown): error is SchemaFormError =>
  error instanceof SchemaFormError;
