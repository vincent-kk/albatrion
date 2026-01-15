import { JsonSchemaError } from '@/schema-form/errors';
import { formatCreateDynamicFunctionError } from '@/schema-form/helpers/error';

import type { PathManager } from '../getPathManager';
import { JSON_POINTER_PATH_REGEX } from '../regex';
import type { CreateDynamicFunction, DynamicFunction } from './type';
import { getFunctionBody } from './utils/getFunctionBody';

/**
 * Create a dynamic function that takes dependency array and returns a value based on the expression.
 * @param pathManager - Path manager to resolve dependency paths
 * @param fieldName - Field name to create the function for
 * @param expression - Expression to evaluate, can be a JSON pointer path
 * @param coerceToBoolean - Must be true for boolean return type
 * @returns Function that takes dependency array and returns boolean, or undefined
 */
export const createDynamicFunction: CreateDynamicFunction = (
  pathManager: PathManager,
  fieldName: string,
  expression: string | undefined,
  coerceToBoolean: boolean = false,
) => {
  // Cannot process non-string expressions
  if (typeof expression !== 'string') return;

  // Transform JSON paths to dependency array references
  const processedExpression = expression
    .replace(JSON_POINTER_PATH_REGEX, (path) => {
      pathManager.set(path);
      return `dependencies[${pathManager.findIndex(path)}]`;
    })
    .trim()
    .replace(/;$/, '');

  // Cannot create function if expression is empty after transformation
  if (processedExpression.length === 0) return;

  const functionBody = getFunctionBody(processedExpression, coerceToBoolean);
  try {
    return new Function('dependencies', functionBody) as DynamicFunction;
  } catch (error) {
    throw new JsonSchemaError(
      'CREATE_DYNAMIC_FUNCTION',
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
