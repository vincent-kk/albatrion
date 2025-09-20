import { isArray } from '@winglet/common-utils/filter';

import { ENHANCED_KEY } from '@/schema-form/app/constants';
import type { JsonSchemaError } from '@/schema-form/types';

/**
 * Filter errors and add key to each error
 * @warning THIS FUNCTION CHANGE INPUT ERRORS
 * @param errors - JsonSchemaError errors
 * @param useKey - whether to use key(key is number)
 * @returns schema-form errors
 */
export const transformErrors = (
  errors: JsonSchemaError[],
  key?: boolean,
): JsonSchemaError[] => {
  if (!isArray(errors)) return [];
  const result = new Array<JsonSchemaError>();
  for (let i = 0, l = errors.length; i < l; i++) {
    const error = errors[i];
    if (error.dataPath.indexOf(ENHANCED_KEY) !== -1) continue;
    error.key = key ? ++sequence : undefined;
    result[result.length] = error;
  }
  return result;
};

let sequence = 0;
