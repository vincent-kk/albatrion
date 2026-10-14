import {
  FormErrorCode,
  JSONSchemaError,
  SchemaFormError,
  isFormErrorCode,
} from '../../../../../errors';

/**
 * Resolve a domain exception to a known report code.
 * @param error - Original thrown value, including raw non-Error values
 * @returns Its known error code or the listener-failure fallback
 */
export const readFormErrorCode = (error: unknown): FormErrorCode =>
  (error instanceof SchemaFormError || error instanceof JSONSchemaError) &&
  isFormErrorCode(error.code)
    ? error.code
    : FormErrorCode.ListenerThrew;
