import { FORM_ERROR_CODE_TABLE, JSONSchemaError, LISTENER_THREW,
  SchemaFormError } from '../../../../errors';
import type { FormErrorCode } from '../../../../errors';

/**
 * Resolve a domain exception to a known report code.
 * @param error - Original thrown value, including raw non-Error values
 * @returns Its table code or the listener-failure fallback
 */
export const readFormErrorCode = (error: unknown): FormErrorCode =>
  error instanceof SchemaFormError || error instanceof JSONSchemaError
    ? FORM_ERROR_CODE_TABLE.find(([code]) => code === error.code)?.[0] ??
      `SCHEMA_FORM_ERROR.${LISTENER_THREW}`
    : `SCHEMA_FORM_ERROR.${LISTENER_THREW}`;
