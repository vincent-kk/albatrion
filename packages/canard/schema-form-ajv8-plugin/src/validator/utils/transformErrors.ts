import type { JsonSchemaError } from '@canard/schema-form';
import type { ErrorObject } from 'ajv';

const JSON_POINTER_SEPARATOR = '/';

/**
 * Transforms AJV8 error objects to schema-form error format.
 *
 * AJV8 already uses JSONPointer format for instancePath, so minimal
 * transformation is needed. This function mainly handles the required
 * keyword errors by appending the missing property to the dataPath.
 *
 * @param errors - Array of AJV8 error objects
 * @returns Array of transformed JsonSchemaError objects
 */
export const transformErrors = (errors: ErrorObject[]): JsonSchemaError[] => {
  if (!Array.isArray(errors)) return [];
  const result = new Array<JsonSchemaError>(errors.length);
  for (let index = 0; index < errors.length; index++) {
    const ajvError = errors[index];
    result[index] = {
      dataPath: transformDataPath(ajvError),
      keyword: ajvError.keyword,
      message: ajvError.message,
      details: ajvError.params,
      source: ajvError,
    };
  }
  return result;
};

/**
 * Transforms the dataPath for a single AJV8 error.
 *
 * For 'required' keyword errors, appends the missing property name to the instancePath.
 * For other errors, returns the instancePath as-is (already in JSONPointer format).
 *
 * @param error - AJV8 error object
 * @returns Transformed dataPath in JSONPointer format
 */
const transformDataPath = (error: ErrorObject): string => {
  const instancePath = error.instancePath;
  const hasMissingProperty =
    error.keyword === 'required' && error.params?.missingProperty;
  if (!instancePath)
    return hasMissingProperty
      ? JSON_POINTER_SEPARATOR + error.params.missingProperty
      : JSON_POINTER_SEPARATOR;
  return hasMissingProperty
    ? instancePath + JSON_POINTER_SEPARATOR + error.params.missingProperty
    : instancePath;
};
