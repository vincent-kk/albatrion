import { isArray } from '@winglet/common-utils';
import { JSONPath, JSONPointer } from '@winglet/json';

import type { ErrorObject } from '@/schema-form/helpers/ajv';
import type { JsonSchemaError } from '@/schema-form/types';

let keySeq = 0;

/**
 * Generates `dataPath` based on `instancePath`, converts to JSONPath format.
 * @warning THIS FUNCTION CHANGE INPUT ERRORS
 * @param errors - ajv errors
 * @param useKey - whether to use key(key is number)
 * @returns schema-form errors
 */
export const transformErrors = (
  errors: ErrorObject[],
  omits?: Set<string>,
  useKey?: boolean,
): JsonSchemaError[] => {
  if (!isArray(errors)) return [];
  const result = new Array<JsonSchemaError>();
  for (let i = 0; i < errors.length; i++) {
    if (omits?.has(errors[i].keyword)) continue;
    const error = errors[i];
    (error as JsonSchemaError).key = useKey ? ++keySeq : undefined;
    (error as JsonSchemaError).dataPath = transformDataPath(error);
    result[result.length] = error as JsonSchemaError;
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
