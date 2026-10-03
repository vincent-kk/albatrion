import type { ValidationIssue } from '@canard/schema-form';
import type { ErrorObject } from 'ajv';

import { getRejectedKey } from './getRejectedKey';
import { transformDataPath } from './transformDataPath';

/**
 * Converts AJV issues into paths and rejected keys used for form routing.
 * @param errors - Ordered issues from the compiled AJV validator.
 * @param root - Authored root needed to identify a single-key `not.required`.
 * @returns Ordered normalized issues with an empty pointer for the root.
 */
export const transformErrors = (errors: readonly ErrorObject[], root?: unknown): ValidationIssue[] => {
  if (!Array.isArray(errors)) return [];
  const result = new Array<ValidationIssue>(errors.length);
  for (let i = 0, l = errors.length; i < l; i++) {
    const ajvError = errors[i];
    const rejectedKey = getRejectedKey(ajvError, root);
    result[i] = {
      dataPath: transformDataPath(ajvError, rejectedKey),
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
