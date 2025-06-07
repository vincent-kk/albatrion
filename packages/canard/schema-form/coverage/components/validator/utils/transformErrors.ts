import type { JsonSchemaError } from '@canard/schema-form';
import type { ErrorObject } from 'ajv';

import { isArrayIndex } from '@winglet/common-utils/filter';
import { JSONPath, JSONPointer } from '@winglet/json';

export const transformErrors = (errors: ErrorObject[]): JsonSchemaError[] => {
  if (!Array.isArray(errors)) return [];
  const result = new Array<JsonSchemaError>(errors.length);
  for (let index = 0; index < errors.length; index++) {
    const error = errors[index] as JsonSchemaError & ErrorObject;
    error.dataPath = transformDataPath(error);
    result[index] = error;
  }
  return result;
};

const transformDataPath = (error: ErrorObject): string => {
  const instancePath = error.instancePath;
  const hasMissingProperty =
    error.keyword === 'required' && error.params?.missingProperty;

  if (!instancePath)
    return hasMissingProperty
      ? JSONPath.Child + error.params.missingProperty
      : '';

  const parts = [];
  let segmentStart = 1;

  for (let i = 1; i <= instancePath.length; i++) {
    if (i === instancePath.length || instancePath[i] === JSONPointer.Child) {
      if (segmentStart < i) {
        const segment = instancePath.slice(segmentStart, i);
        if (isArrayIndex(segment)) parts.push('[' + segment + ']');
        else parts.push(JSONPath.Child + segment);
      }
      segmentStart = i + 1;
    }
  }

  const result = parts.join('');
  return hasMissingProperty
    ? result + JSONPath.Child + error.params.missingProperty
    : result;
};
