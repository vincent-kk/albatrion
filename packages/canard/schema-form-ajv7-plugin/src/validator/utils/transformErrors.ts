import type { JsonSchemaError } from '@canard/schema-form';
import type { ErrorObject } from 'ajv';

const JSON_POINTER_SEPARATOR = '/';

/**
 * Transforms AJV7 error objects to schema-form error format.
 *
 * AJV7 uses JSONPointer format for dataPath by default, so minimal
 * transformation is needed. This function mainly handles the required
 * keyword errors by appending the missing property to the dataPath.
 *
 * @param errors - Array of AJV7 error objects
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
 * Transforms the dataPath for a single AJV7 error.
 *
 * For 'required' keyword errors, appends the missing property name to the dataPath.
 * For other errors, returns the dataPath as-is (already in JSONPointer format).
 *
 * @param error - AJV7 error object
 * @returns Transformed dataPath in JSONPointer format
 */
const transformDataPath = (error: ErrorObject): string => {
  const dataPath = error.dataPath;
  const missingProperty = error.params?.missingProperty;
  const hasMissingProperty = error.keyword === 'required' && missingProperty;
  if (dataPath)
    return hasMissingProperty
      ? dataPath + JSON_POINTER_SEPARATOR + missingProperty
      : dataPath;
  else
    return hasMissingProperty
      ? JSON_POINTER_SEPARATOR + missingProperty
      : JSON_POINTER_SEPARATOR;
};
