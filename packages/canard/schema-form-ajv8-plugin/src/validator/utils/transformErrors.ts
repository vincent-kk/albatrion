import type { JsonSchemaError } from '@canard/schema-form';
import { isArrayIndex } from '@winglet/common-utils/filter';
import type { ErrorObject } from 'ajv';

const JSON_PATH_SEPARATOR = '.';
const JSON_POINTER_SEPARATOR = '/';

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
      ? JSON_PATH_SEPARATOR + error.params.missingProperty
      : '';

  const parts = [];
  let segmentStart = 1;

  for (let i = 1; i <= instancePath.length; i++) {
    if (
      i === instancePath.length ||
      instancePath[i] === JSON_POINTER_SEPARATOR
    ) {
      if (segmentStart < i) {
        const segment = instancePath.slice(segmentStart, i);
        if (isArrayIndex(segment)) parts.push('[' + segment + ']');
        else parts.push(JSON_PATH_SEPARATOR + segment);
      }
      segmentStart = i + 1;
    }
  }

  const result = parts.join('');
  return hasMissingProperty
    ? result + JSON_PATH_SEPARATOR + error.params.missingProperty
    : result;
};
