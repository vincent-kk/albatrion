import type { ValidationIssue } from '@canard/schema-form';
import type { ErrorObject } from 'ajv';

import { isChildSchemaPath } from './isChildSchemaPath';
import { resolveNotRequiredKey } from './resolveNotRequiredKey';

/** Escape tilde before slash when a required-property name needs encoding. */
const TILDE = /~/g;
/** Escape slash after tilde when encoding a required-property name. */
const SLASH = /\//g;

/**
 * Transforms AJV7 error objects to schema-form error format.
 *
 * `required` issues append the missing property to the dataPath. A key is rejected
 * (`rejectedKey`, with the dataPath kept at the host object) by `propertyNames`,
 * `additionalProperties`, `unevaluatedProperties`, a single-key `not.required`, and a
 * `false` schema that stands at a child position; any other `false` schema rejects the value.
 *
 * @param errors - Array of AJV7 error objects
 * @param root - Authored root, read only to find the key of a single-key `not.required`
 * @returns Array of transformed ValidationIssue objects
 */
export const transformErrors = (errors: ErrorObject[], root?: object): ValidationIssue[] => {
  if (!Array.isArray(errors)) return [];
  const result = new Array<ValidationIssue>(errors.length);
  for (let i = 0, l = errors.length; i < l; i++) {
    const ajvError = errors[i];
    let dataPath = transformDataPath(ajvError);
    let rejectedKey: string | undefined;
    if (typeof ajvError.propertyName === 'string')
      rejectedKey = ajvError.propertyName;
    else if (ajvError.keyword === 'false schema') {
      if (dataPath && isChildSchemaPath(ajvError.schemaPath)) {
        const lastSlash = dataPath.lastIndexOf('/');
        const name = dataPath.slice(lastSlash + 1);
        rejectedKey = name.includes('~') ? name.replace(/~1/g, '/').replace(/~0/g, '~') : name;
        dataPath = dataPath.slice(0, lastSlash);
      }
    } else if (ajvError.keyword === 'additionalProperties' && 'additionalProperty' in ajvError.params)
      rejectedKey = String(ajvError.params.additionalProperty);
    else if (ajvError.keyword === 'unevaluatedProperties' && 'unevaluatedProperty' in ajvError.params)
      rejectedKey = String(ajvError.params.unevaluatedProperty);
    else if (ajvError.keyword === 'propertyNames' && 'propertyName' in ajvError.params)
      rejectedKey = String(ajvError.params.propertyName);
    else if (ajvError.keyword === 'not' && root)
      rejectedKey = resolveNotRequiredKey(root, ajvError.schemaPath);
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
  if (error.keyword !== 'required') return dataPath;
  const missingProperty = error.params?.missingProperty;
  if (typeof missingProperty !== 'string') return dataPath;
  const name = missingProperty.indexOf('~') === -1 && missingProperty.indexOf('/') === -1
    ? missingProperty
    : missingProperty.replace(TILDE, '~0').replace(SLASH, '~1');
  return dataPath + '/' + name;
};
