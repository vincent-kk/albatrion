import type { ErrorObject } from '@lumy/schema-form/helpers/ajv';
import {
  JSONPath,
  JSONPointer,
  type JsonSchemaError,
} from '@lumy/schema-form/types';

let keySeq = 0;

/**
 * @description instancePath를 기반으로 dataPath 생성, JSONPath 형식으로 변환.
 * @warning THIS FUNCTION CHANGE INPUT ERRORS
 * @param errors - ajv errors
 * @param useKey - whether to use key(key is number)
 * @returns schema-form errors
 */
export const transformErrors = (
  errors: ErrorObject[],
  useKey = false,
): JsonSchemaError[] => {
  if (!Array.isArray(errors)) return [];
  return errors.map((error) => {
    (error as JsonSchemaError).key = useKey ? ++keySeq : undefined;
    (error as JsonSchemaError).dataPath = transformDataPath(error);
    return error as JsonSchemaError;
  });
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
