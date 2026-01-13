import type { Fn } from '@aileron/declare';

import { JsonSchemaError } from '@/schema-form/errors';

import type { PathManager } from '../getPathManager';
import { JSON_POINTER_PATH_REGEX } from '../regex';

export type DynamicFunction<ReturnType = any> = Fn<
  [dependencies: unknown[]],
  ReturnType
>;

/**
 * Creates a dynamic derived value getter function using dependency paths and expression.
 * @param pathManager - Path manager to resolve dependency paths
 * @param fieldName - Field name to create the function for
 * @param rawExpression - Expression to evaluate, can be a JSON pointer path
 * @param coerceToBoolean - Whether to coerce the return type to boolean
 * @returns Function that takes dependency array and returns the return type, or undefined
 */
export const createDynamicFunction = <ReturnType = any>(
  pathManager: PathManager,
  fieldName: string,
  rawExpression: string | undefined,
  coerceToBoolean: boolean = false,
): DynamicFunction<ReturnType> | undefined => {
  // Cannot process non-string expressions
  if (typeof rawExpression !== 'string') return;

  // Transform JSON paths to dependency array references
  const expression = rawExpression
    .replace(JSON_POINTER_PATH_REGEX, (path) => {
      pathManager.set(path);
      return `dependencies[${pathManager.findIndex(path)}]`;
    })
    .trim()
    .replace(/;$/, '');

  // Cannot create function if expression is empty after transformation
  if (expression.length === 0) return;

  const functionBody =
    expression.startsWith('{') && expression.endsWith('}')
      ? expression.slice(1, -1).trim()
      : `return ${coerceToBoolean ? '!!' : ''}${expression}`;

  try {
    return new Function('dependencies', functionBody) as DynamicFunction;
  } catch (error) {
    throw new JsonSchemaError(
      'CREATE_DYNAMIC_FUNCTION',
      `Failed to create dynamic function: ${fieldName} -> '${rawExpression}'`,
      {
        fieldName,
        expression: rawExpression,
        functionBody,
        error,
      },
    );
  }
};
