import type { ValidationIssue } from '../../../../src';
import type { ErrorObject } from 'ajv';

import { JSONPointer as $ } from '@winglet/json/pointer';

/** Convert AJV errors to public issues, retaining source details and escaped paths. */
export const transformErrors = (errors: ErrorObject[]): ValidationIssue[] => {
  if (!Array.isArray(errors)) return [];
  const result = new Array<ValidationIssue>(errors.length);
  for (let i = 0, l = errors.length; i < l; i++) {
    const ajvError = errors[i];
    result[i] = {
      dataPath: transformDataPath(ajvError),
      schemaPath: ajvError.schemaPath,
      keyword: ajvError.keyword,
      message: ajvError.message,
      details: ajvError.params,
      source: ajvError,
    };
  }
  return result;
};

const transformDataPath = (error: ErrorObject): string => {
  const instancePath = error.instancePath;
  const hasMissingProperty =
    error.keyword === 'required' && error.params?.missingProperty;

  if (!instancePath)
    return hasMissingProperty ? $.Separator + String(error.params.missingProperty).replace(/~/g, '~0').replace(/\//g, '~1') : '';

  return hasMissingProperty
    ? instancePath + $.Separator + String(error.params.missingProperty).replace(/~/g, '~0').replace(/\//g, '~1')
    : instancePath;
};
