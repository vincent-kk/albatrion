import type { ValidationIssue } from '@canard/schema-form';
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
 * @returns Array of transformed ValidationIssue objects
 */
export const transformErrors = (errors: ErrorObject[], root?: object): ValidationIssue[] => {
  if (!Array.isArray(errors)) return [];
  const result = new Array<ValidationIssue>(errors.length);
  for (let i = 0, l = errors.length; i < l; i++) {
    const ajvError = errors[i];
    let dataPath = transformDataPath(ajvError);
    let rejectedKey: string | undefined;
    if (ajvError.keyword === 'false schema' && dataPath) {
      const lastSlash = dataPath.lastIndexOf('/');
      rejectedKey = dataPath.slice(lastSlash + 1)
        .replace(/~1/g, '/').replace(/~0/g, '~');
      dataPath = dataPath.slice(0, lastSlash);
    }
    if (ajvError.keyword === 'additionalProperties' && 'additionalProperty' in ajvError.params)
      rejectedKey = String(ajvError.params.additionalProperty);
    if (ajvError.keyword === 'unevaluatedProperties' && 'unevaluatedProperty' in ajvError.params)
      rejectedKey = String(ajvError.params.unevaluatedProperty);
    if (ajvError.keyword === 'propertyNames' && 'propertyName' in ajvError.params)
      rejectedKey = String(ajvError.params.propertyName);
    if (typeof ajvError.propertyName === 'string')
      rejectedKey = ajvError.propertyName;
    if (ajvError.keyword === 'not' && root && ajvError.schemaPath.startsWith('#/')) {
      const segments = ajvError.schemaPath.slice(2).split('/');
      let target: unknown = root;
      for (const segment of segments) {
        if (typeof target !== 'object' || target === null) break;
        target = (target as Record<string, unknown>)[segment.replace(/~1/g, '/').replace(/~0/g, '~')];
      }
      if (typeof target === 'object' && target !== null && 'required' in target &&
          Array.isArray(target.required) && target.required.length === 1 &&
          typeof target.required[0] === 'string') rejectedKey = target.required[0];
    }
    result[i] = {
      dataPath,
      schemaPath: ajvError.schemaPath,
      keyword: ajvError.keyword,
      message: ajvError.message,
      details: ajvError.params,
      source: ajvError,
      ...(rejectedKey === undefined ? {} : { rejectedKey }),
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
  const dataPath = error.dataPath || '';
  const missingProperty = error.params?.missingProperty;
  const hasMissingProperty = error.keyword === 'required' && missingProperty;
  return hasMissingProperty
    ? dataPath + JSON_POINTER_SEPARATOR + String(missingProperty).replace(/~/g, '~0').replace(/\//g, '~1')
    : dataPath;
};
