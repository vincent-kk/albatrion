import { isArray } from '@winglet/common-utils/filter';

import { ENHANCED_KEY } from '@/schema-form/app/constants';
import type { JSONSchemaError } from '@/schema-form/types';

/**
 * Filter errors and add key to each error
 * @warning THIS FUNCTION CHANGE INPUT ERRORS
 * @param errors - JSONSchemaError errors
 * @param useKey - whether to use key(key is number)
 * @returns schema-form errors
 */
export const transformErrors = (
  errors: JSONSchemaError[],
  key?: boolean,
): JSONSchemaError[] => {
  if (!isArray(errors)) return [];
  const result = new Array<JSONSchemaError>();
  for (let i = 0, l = errors.length; i < l; i++) {
    const error = errors[i];
    if (error.dataPath.indexOf(ENHANCED_KEY) !== -1) continue;
    if (isNullBranchRejection(error)) continue;
    error.key = key ? ++sequence : undefined;
    result[result.length] = error;
  }
  return result;
};

let sequence = 0;

/** Schema path of the `type` keyword of a `oneOf`/`anyOf` branch. */
const BRANCH_TYPE_PATH = /\/(?:oneOf|anyOf)\/\d+\/type$/;

/** Whether a validator's `type` param names `null` alone, in either form a schema can write it. */
const isNullTypeParam = (type: unknown) =>
  type === 'null' || (isArray(type) && type.length === 1 && type[0] === 'null');

/**
 * Whether `error` is a `{ type: 'null' }` composition branch rejecting a non-null value.
 * Like a branch-marker mismatch it only says "this is not the branch in use"; the `oneOf` error and the errors of the branch in use stay.
 * @param error - A validator error
 */
const isNullBranchRejection = (error: JSONSchemaError) =>
  error.keyword === 'type' &&
  isNullTypeParam(error.details?.type) &&
  error.schemaPath !== undefined &&
  BRANCH_TYPE_PATH.test(error.schemaPath);
