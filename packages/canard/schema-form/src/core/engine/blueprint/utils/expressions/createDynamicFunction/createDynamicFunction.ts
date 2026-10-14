import { FormErrorCode, JSONSchemaError } from '@/schema-form/errors';

import type { PathManager } from '../getPathManager';
import { JSON_POINTER_PATH_REGEX } from '../regex';
import type { CreateDynamicFunction, DynamicFunction } from './type';
import { formatCreateDynamicFunctionError } from './utils/formatCreateDynamicFunctionError';
import { getFunctionBody } from './utils/getFunctionBody';

/** One semicolon at the end of an expression. */
const TRAILING_SEMICOLON = /;$/;

/**
 * Create a dynamic function that takes dependency array and returns a value based on the expression.
 * @param pathManager - Path manager to resolve dependency paths
 * @param fieldName - Field name to create the function for
 * @param expression - Expression to evaluate, can be a JSON pointer path
 * @param coerceToBoolean - Must be true for boolean return type
 * @returns Compiled value or boolean function, or undefined for an empty expression
 * @throws JSONSchemaError when the generated function body has invalid syntax
 */
export const createDynamicFunction: CreateDynamicFunction = (
  pathManager: PathManager,
  fieldName: string,
  expression: string | undefined,
  coerceToBoolean: boolean = false,
) => {
  if (typeof expression !== 'string') return;

  const processedExpression = expression
    .replace(JSON_POINTER_PATH_REGEX, (path) => {
      pathManager.set(path);
      return 'dependencies[' + pathManager.findIndex(path) + ']';
    })
    .trim()
    .replace(TRAILING_SEMICOLON, '');

  if (processedExpression.length === 0) return;

  const functionBody = getFunctionBody(processedExpression, coerceToBoolean);
  try {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Function returns Function without a call signature; a typed wrapper only moves trust to any.
    return new Function('dependencies', functionBody) as DynamicFunction;
  } catch (error) {
    throw new JSONSchemaError(
      FormErrorCode.CreateDynamicFunction,
      formatCreateDynamicFunctionError(
        fieldName,
        expression,
        functionBody,
        error,
      ),
      {
        fieldName,
        expression: expression,
        functionBody,
        error,
      },
    );
  }
};
