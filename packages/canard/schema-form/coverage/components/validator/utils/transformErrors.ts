import type { JsonSchemaError } from '@canard/schema-form';
import type { ErrorObject } from 'ajv';

import { JSONPointer } from '@winglet/json/pointer';

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

const transformDataPath = (error: ErrorObject): string => {
  const instancePath = error.instancePath;
  const hasMissingProperty =
    error.keyword === 'required' && error.params?.missingProperty;

  if (!instancePath)
    return hasMissingProperty
      ? JSONPointer.Separator + error.params.missingProperty
      : '';

  return hasMissingProperty
    ? instancePath + JSONPointer.Separator + error.params.missingProperty
    : instancePath;
};
