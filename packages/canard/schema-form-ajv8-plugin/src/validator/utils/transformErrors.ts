import type { ValidationIssue } from '@canard/schema-form';
import type { ErrorObject } from 'ajv';

import { getRejectedKey } from './getRejectedKey';
import { transformDataPath } from './transformDataPath';

/**
 * Converts AJV issues into paths and rejected keys used for form routing.
 * @param errors - Ordered issues from the compiled AJV validator.
 * @param root - Authored root needed to identify a single-key `not.required`.
 * @param toAuthoredPath - Rewrite for a root that validation reaches through `$ref`, mapping the
 *   paths AJV reports under the reference to the authored `#/` fragment; omitted, paths pass through.
 * @returns Ordered normalized issues with an empty pointer for the root.
 */
export const transformErrors = (
  errors: readonly ErrorObject[],
  root?: unknown,
  toAuthoredPath?: (schemaPath: string) => string,
): ValidationIssue[] => {
  if (!Array.isArray(errors)) return [];
  const result = new Array<ValidationIssue>(errors.length);
  for (let i = 0, l = errors.length; i < l; i++) {
    const ajvError = errors[i];
    const schemaPath = toAuthoredPath === undefined ? ajvError.schemaPath : toAuthoredPath(ajvError.schemaPath);
    const rejectedKey = getRejectedKey(ajvError, schemaPath, root);
    const issue: ValidationIssue = {
      dataPath: transformDataPath(ajvError, rejectedKey),
      schemaPath,
      keyword: ajvError.keyword,
      message: ajvError.message,
      details: ajvError.params,
      source: ajvError,
    };
    if (rejectedKey !== undefined) issue.rejectedKey = rejectedKey;
    result[i] = issue;
  }
  return result;
};
