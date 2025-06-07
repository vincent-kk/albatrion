import { isArray } from '@winglet/common-utils/filter';

import type { JsonSchemaError } from '@/schema-form/types';

let sequence = 0;

/**
 * Filter errors and add key to each error
 * @warning THIS FUNCTION CHANGE INPUT ERRORS
 * @param errors - JsonSchemaError errors
 * @param omits - keywords to omit from errors
 * @param useKey - whether to use key(key is number)
 * @returns schema-form errors
 */
export const transformErrors = (
  errors: JsonSchemaError[],
  omits?: Set<string>,
  key?: boolean,
): JsonSchemaError[] => {
  if (!isArray(errors)) return [];
  const result = new Array<JsonSchemaError>();
  for (let i = 0; i < errors.length; i++) {
    if (omits?.has(errors[i].keyword)) continue;
    const error = errors[i];
    error.key = key ? ++sequence : undefined;
    result[result.length] = error;
  }
  return result;
};
