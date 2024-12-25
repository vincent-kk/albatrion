import type { ErrorObject } from '@canard/schema-form/src/helpers/ajv';
import {
  JSONPath,
  JSONPointer,
  type JsonSchemaError,
} from '@canard/schema-form/src/types';

let keySeq = 0;

export const transformErrors = (
  errors: ErrorObject[],
  useKey = false,
): JsonSchemaError[] => {
  if (!Array.isArray(errors)) return [];
  return errors.map((error) => {
    (error as unknown as JsonSchemaError).key = useKey ? ++keySeq : undefined;
    (error as unknown as JsonSchemaError).dataPath = transformDataPath(error);
    return error as unknown as JsonSchemaError;
  });
};

const JSON_POINTER_CHILD_PATTERN = new RegExp(`${JSONPointer.Child}`, 'g');
const INDEX_PATTERN = new RegExp(`(${JSONPath.Child})(\\d+)`, 'g');

const transformDataPath = (error: ErrorObject): string => {
  const dataPath = error.instancePath
    .replace(JSON_POINTER_CHILD_PATTERN, JSONPath.Child)
    .replace(INDEX_PATTERN, '$1[$2]');

  const hasMissingProperty =
    error.keyword === 'required' && error.params?.missingProperty;

  return hasMissingProperty
    ? `${dataPath}${JSONPath.Child}${error.params.missingProperty}`
    : dataPath;
};
