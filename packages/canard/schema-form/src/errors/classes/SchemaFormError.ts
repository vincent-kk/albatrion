import { BaseError, type ErrorDetails } from '@winglet/common-utils/error';

import { FormErrorGroup } from '../constants/FormErrorGroup';
import { getCodeSpecific } from '../utils/getCodeSpecific';
import type { SchemaFormErrorCode } from '../type';

/** Group every SchemaFormError code carries; the code value repeats it before the bare name. */
const GROUP = FormErrorGroup.SchemaForm;

/**
 * Error class for schema form construction errors.
 *
 * Thrown when there are issues during the form building process,
 * particularly when mapping input types to input components fails.
 *
 * Currently used for:
 * - Invalid key patterns in FieldInputMap configuration
 *
 * @remarks
 * Error details typically include:
 * - path: The input path that caused the error
 * - error: The underlying error that occurred
 */
export class SchemaFormError extends BaseError {
  constructor(
    code: SchemaFormErrorCode,
    message: string,
    details: ErrorDetails = {},
  ) {
    super(GROUP, getCodeSpecific(code), message, details);
    this.name = GROUP;
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
