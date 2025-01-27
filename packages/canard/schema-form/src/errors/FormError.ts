import { BaseError, type ErrorDetails } from '@winglet/common-utils';

export class FormError extends BaseError {
  static readonly #group = 'FORM_ERROR';
  constructor(code: string, message: string, details: ErrorDetails = {}) {
    super(FormError.#group, code, message, details);
    this.name = 'FormError';
  }
}

export const isFormError = (error: unknown): error is FormError => {
  return error instanceof FormError;
};
