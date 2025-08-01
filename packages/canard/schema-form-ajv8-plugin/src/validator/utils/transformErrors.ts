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
  for (let i = 0, l = errors.length; i < l; i++) {
    const ajvError = errors[i];
    result[i] = {
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
  const missingProperty = error.params?.missingProperty;
  const hasMissingProperty = error.keyword === 'required' && missingProperty;
  if (instancePath)
    return hasMissingProperty
      ? instancePath + JSON_POINTER_SEPARATOR + missingProperty
      : instancePath;
  else
    return hasMissingProperty
      ? JSON_POINTER_SEPARATOR + missingProperty
      : JSON_POINTER_SEPARATOR;
};
