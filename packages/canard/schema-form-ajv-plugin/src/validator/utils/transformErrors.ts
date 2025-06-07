import type { JsonSchemaError } from '@canard/schema-form';
import { JSONPath, JSONPointer } from '@winglet/json';
import type { ErrorObject } from 'ajv';

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

const JSON_POINTER_CHILD_PATTERN = new RegExp(`${JSONPointer.Child}`, 'g');
const INDEX_PATTERN = new RegExp(`${JSONPath.Child}(\\d+)`, 'g');

const transformDataPath = (error: ErrorObject): string => {
  const dataPath = error.instancePath
    .replace(JSON_POINTER_CHILD_PATTERN, JSONPath.Child)
    .replace(INDEX_PATTERN, '[$1]');
  const hasMissingProperty =
    error.keyword === 'required' && error.params?.missingProperty;
  return hasMissingProperty
    ? `${dataPath}${JSONPath.Child}${error.params.missingProperty}`
    : dataPath;
};
